-- ==============================================================================
-- Migration: 20261029000006_donor_registration_and_private_profiles.sql
-- Description: Privacy-First Organ Donor Registration and Private Donor Profiles.
--              Generates unique immutable public donor IDs (TS-DNR-XXXX-XXXX),
--              enforces database-level immutability, separates private personal
--              data (name, phone, emergency contacts) from public identity,
--              enforces strict default-deny RLS, and creates a sanitized public view.
-- Statutory:   Transplantation of Human Organs and Tissues Act (THOTA), 1994 &
--              THOTA Rules 2014 Form 7 / Form 11, Digital Personal Data Protection Act 2023.
-- ==============================================================================

-- 1. Helper function to generate a cryptographically random public donor ID
-- Format: TS-DNR-XXXX-XXXX using unambiguous 32-character alphabet
CREATE OR REPLACE FUNCTION generate_pseudonymous_public_donor_id()
RETURNS TEXT AS $$
DECLARE
    alphabet TEXT := '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
    res TEXT := 'TS-DNR-';
    i INTEGER;
    rand_byte INTEGER;
    existing_count INTEGER;
    attempts INTEGER := 0;
BEGIN
    LOOP
        res := 'TS-DNR-';
        -- First 4-character segment
        FOR i IN 1..4 LOOP
            rand_byte := get_byte(gen_random_bytes(1), 0);
            res := res || substr(alphabet, (rand_byte % 32) + 1, 1);
        END LOOP;

        res := res || '-';

        -- Second 4-character segment
        FOR i IN 1..4 LOOP
            rand_byte := get_byte(gen_random_bytes(1), 0);
            res := res || substr(alphabet, (rand_byte % 32) + 1, 1);
        END LOOP;

        -- Ensure collision safety against donor_profiles
        SELECT COUNT(*) INTO existing_count FROM donor_profiles WHERE public_donor_id = res;
        IF existing_count = 0 THEN
            RETURN res;
        END IF;

        attempts := attempts + 1;
        IF attempts > 25 THEN
            -- In astronomical collision scenario, append salt
            RETURN res || '9';
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- 2. Create donor_profiles table
CREATE TABLE IF NOT EXISTS donor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    public_donor_id VARCHAR(30) NOT NULL UNIQUE,
    pledge_status VARCHAR(40) NOT NULL DEFAULT 'pledged_interest' 
        CHECK (pledge_status IN ('pledged_interest', 'notto_registered', 'living_donor_candidate', 'withdrawn')),
    pledged_organs TEXT[] NOT NULL DEFAULT ARRAY['all'],
    family_informed BOOLEAN NOT NULL DEFAULT false,
    emergency_contact_name VARCHAR(150),
    emergency_contact_phone VARCHAR(30),
    official_notto_registration_number VARCHAR(100),
    state VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    blood_group VARCHAR(10),
    consent_signed BOOLEAN NOT NULL DEFAULT true,
    consent_signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_public_pledge_anonymous BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_donor_profile UNIQUE (user_id)
);

-- Indices for performance
CREATE UNIQUE INDEX IF NOT EXISTS idx_donor_profiles_public_donor_id ON donor_profiles(public_donor_id);
CREATE INDEX IF NOT EXISTS idx_donor_profiles_user_id ON donor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_donor_profiles_pledge_status ON donor_profiles(pledge_status);

-- 3. Default trigger to assign public_donor_id if missing on INSERT
CREATE OR REPLACE FUNCTION set_donor_public_id_default()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.public_donor_id IS NULL OR NEW.public_donor_id = '' THEN
        NEW.public_donor_id := generate_pseudonymous_public_donor_id();
    END IF;
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_donor_public_id_default ON donor_profiles;
CREATE TRIGGER trigger_set_donor_public_id_default
    BEFORE INSERT ON donor_profiles
    FOR EACH ROW
    EXECUTE FUNCTION set_donor_public_id_default();

-- 4. Immutability trigger: public_donor_id can NEVER be modified after creation
CREATE OR REPLACE FUNCTION enforce_donor_public_id_immutability()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.public_donor_id IS NOT NULL AND NEW.public_donor_id <> OLD.public_donor_id THEN
        RAISE EXCEPTION 'Security Policy Violation: public_donor_id is permanent and immutable.';
    END IF;
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_donor_public_id_immutability ON donor_profiles;
CREATE TRIGGER trigger_donor_public_id_immutability
    BEFORE UPDATE ON donor_profiles
    FOR EACH ROW
    EXECUTE FUNCTION enforce_donor_public_id_immutability();

-- 5. Sanitized Public Donor View (exposing ZERO personal contact or internal IDs)
CREATE OR REPLACE VIEW public_donor_pledges AS
SELECT
    dp.public_donor_id,
    dp.pledge_status,
    dp.pledged_organs,
    dp.state,
    dp.created_at AS pledge_date,
    dp.family_informed
FROM donor_profiles dp
WHERE dp.is_public_pledge_anonymous = true
  AND dp.pledge_status <> 'withdrawn';

-- 6. Strict Default-Deny Row-Level Security (RLS)
ALTER TABLE donor_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Owners can view their complete private donor profile
CREATE POLICY donor_profiles_owner_select ON donor_profiles
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Registered users can create their donor profile
CREATE POLICY donor_profiles_owner_insert ON donor_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Owners can update their pledge, family status, or privacy preferences
CREATE POLICY donor_profiles_owner_update ON donor_profiles
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Platform administrators can view donor records for statutory compliance and audit only
CREATE POLICY donor_profiles_admin_select ON donor_profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
              AND profiles.role = 'admin'
        )
    );

-- Policy: Disallow DELETE - donor can change status to 'withdrawn' to maintain audit integrity
-- (Deletions are restricted to preserve statutory consent timestamp integrity under DPDP Act 2023)

-- 7. Grant access to public sanitized view
GRANT SELECT ON public_donor_pledges TO anon, authenticated;
