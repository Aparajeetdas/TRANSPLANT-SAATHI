-- ==============================================================================
-- Migration: 20261029000005_anonymous_user_identity_system.sql
-- Description: Privacy-First Anonymous User Identity System for Transplant Saathi.
--              Generates unique, permanent public identifiers (TS-XXXX-XXXX),
--              enforces database-level immutability, separates public identities
--              from private account records, and enforces strict default-deny RLS.
-- ==============================================================================

-- 1. Helper function to generate a cryptographically random public ID
-- Format: TS-XXXX-XXXX using unambiguous 32-character alphabet
CREATE OR REPLACE FUNCTION generate_pseudonymous_public_id()
RETURNS TEXT AS $$
DECLARE
    alphabet TEXT := '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
    res TEXT := 'TS-';
    i INTEGER;
    rand_byte INTEGER;
    existing_count INTEGER;
    attempts INTEGER := 0;
BEGIN
    LOOP
        res := 'TS-';
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

        -- Ensure collision safety
        SELECT COUNT(*) INTO existing_count FROM profiles WHERE public_id = res;
        IF existing_count = 0 THEN
            RETURN res;
        END IF;

        attempts := attempts + 1;
        IF attempts > 25 THEN
            -- In astronomical collision scenario, append sequence
            RETURN res || '9';
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- 2. Add public_id column to profiles table with UNIQUE constraint
ALTER TABLE profiles 
    ADD COLUMN IF NOT EXISTS public_id VARCHAR(20) UNIQUE;

-- 3. Backfill public_id for any existing demo / seeded profiles
UPDATE profiles 
SET public_id = generate_pseudonymous_public_id()
WHERE public_id IS NULL;

-- Make public_id NOT NULL and ensure index
ALTER TABLE profiles 
    ALTER COLUMN public_id SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_public_id ON profiles(public_id);

-- 4. Set default public_id generation on profile insert
CREATE OR REPLACE FUNCTION set_profile_public_id_default()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.public_id IS NULL OR NEW.public_id = '' THEN
        NEW.public_id := generate_pseudonymous_public_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_profile_public_id ON profiles;
CREATE TRIGGER trg_set_profile_public_id
    BEFORE INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION set_profile_public_id_default();

-- 5. Immutability Trigger: public_id must NEVER be updated once assigned
CREATE OR REPLACE FUNCTION prevent_public_id_tampering()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.public_id IS NOT NULL AND NEW.public_id IS DISTINCT FROM OLD.public_id THEN
        RAISE EXCEPTION 'Security Policy Violation: User public_id is permanent and immutable. It cannot be altered.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_public_id_tampering ON profiles;
CREATE TRIGGER trg_prevent_public_id_tampering
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION prevent_public_id_tampering();

-- 6. Add patient_public_id to assistance_requests
ALTER TABLE assistance_requests
    ADD COLUMN IF NOT EXISTS patient_public_id VARCHAR(20);

CREATE INDEX IF NOT EXISTS idx_assistance_requests_patient_public_id 
    ON assistance_requests(patient_public_id);

-- Backfill assistance_requests with patient public_ids
UPDATE assistance_requests ar
SET patient_public_id = p.public_id
FROM profiles p
WHERE ar.patient_id = p.id AND (ar.patient_public_id IS NULL OR ar.patient_public_id = '');

-- 7. Public User Identities Table / View
-- Ordinary users inspect ONLY this view to prevent leaking private email, phone, or name
CREATE TABLE IF NOT EXISTS public_identities (
    public_id VARCHAR(20) PRIMARY KEY,
    role user_role NOT NULL,
    avatar_seed VARCHAR(10) NOT NULL,
    organ_category organ_type,
    state VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public_identities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view public identities" ON public_identities;
CREATE POLICY "Public can view public identities"
    ON public_identities FOR SELECT
    USING (is_active = TRUE);

-- 8. Synchronize public_identities on profile changes (excluding all private data)
CREATE OR REPLACE FUNCTION sync_public_identity_record()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public_identities (public_id, role, avatar_seed, is_active, created_at)
    VALUES (
        NEW.public_id,
        NEW.role,
        SUBSTRING(REGEXP_REPLACE(NEW.public_id, '[^A-Z0-9]', '', 'g') FROM 1 FOR 4),
        NEW.is_active,
        NEW.created_at
    )
    ON CONFLICT (public_id) DO UPDATE
    SET role = EXCLUDED.role,
        is_active = EXCLUDED.is_active;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_public_identity ON profiles;
CREATE TRIGGER trg_sync_public_identity
    AFTER INSERT OR UPDATE OF role, is_active ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION sync_public_identity_record();

-- Populate existing public_identities
INSERT INTO public_identities (public_id, role, avatar_seed, is_active, created_at)
SELECT 
    public_id,
    role,
    SUBSTRING(REGEXP_REPLACE(public_id, '[^A-Z0-9]', '', 'g') FROM 1 FOR 4),
    is_active,
    created_at
FROM profiles
ON CONFLICT (public_id) DO NOTHING;

-- 9. Enforce Default-Deny RLS on profiles Table
-- Ensure ordinary users can NEVER read another user's private profile
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles admin_p
            WHERE admin_p.id = auth.uid() AND admin_p.role = 'admin'
        )
    );

-- Hospital Staff can view profiles ONLY for patients with active hospital intake records
DROP POLICY IF EXISTS "Hospital staff view assigned patient profiles" ON profiles;
CREATE POLICY "Hospital staff view assigned patient profiles"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles staff_p
            WHERE staff_p.id = auth.uid() AND staff_p.role = 'hospital_staff'
        ) AND (
            EXISTS (
                SELECT 1 FROM hospital_intake_records hir
                WHERE hir.created_by = auth.uid() AND hir.anonymous_patient_code = profiles.public_id
            )
        )
    );
