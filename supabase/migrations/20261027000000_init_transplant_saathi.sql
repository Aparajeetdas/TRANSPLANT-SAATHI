-- Migration: 20261027000000_init_transplant_saathi.sql
-- Description: Core schema, role-based access control, RLS policies, audit logs, and verified hospital directory

-- 1. Create Enums
CREATE TYPE user_role AS ENUM ('patient', 'family', 'volunteer', 'hospital_staff', 'admin');
CREATE TYPE organ_type AS ENUM ('kidney', 'liver', 'heart', 'lungs', 'cornea', 'pancreas', 'bone_marrow');
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'flagged', 'rejected');
CREATE TYPE request_status AS ENUM ('submitted', 'under_review', 'assigned', 'in_progress', 'completed', 'cancelled');

-- 2. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'patient',
    organization TEXT, -- For hospital staff or volunteer NGOs
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Audit Logs Table (immutable log for privileged actions)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES auth.users(id),
    actor_role user_role,
    action TEXT NOT NULL,
    target_table TEXT NOT NULL,
    target_id TEXT,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Verified Hospitals Directory
CREATE TABLE IF NOT EXISTS verified_hospitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    registration_number TEXT NOT NULL UNIQUE,
    state TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    organs_supported organ_type[] NOT NULL,
    accreditation TEXT NOT NULL, -- e.g. "NOTTO Registered / NABH Accredited"
    coordinator_name TEXT NOT NULL,
    coordinator_phone TEXT NOT NULL,
    coordinator_email TEXT NOT NULL,
    source_url TEXT NOT NULL,
    source_verification_date DATE NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Assistance Requests (Volunteer Navigation / Wayfinding / Paperwork Help)
CREATE TABLE IF NOT EXISTS assistance_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    patient_name TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    organ_category organ_type NOT NULL,
    hospital_name TEXT NOT NULL,
    support_type TEXT NOT NULL, -- 'Paperwork (Form 1/2/3)', 'Wayfinding & Logistics', 'Language Help', 'Financial Scheme Guidance'
    notes TEXT,
    status request_status NOT NULL DEFAULT 'submitted',
    assigned_volunteer_id UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Clinical / Administrative Navigation Records (Synthetic Mock Workflow for Hospital Staff)
CREATE TABLE IF NOT EXISTS hospital_intake_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID REFERENCES verified_hospitals(id),
    anonymous_patient_code TEXT NOT NULL UNIQUE, -- e.g. "SYN-PAT-2026-KD-041"
    organ_category organ_type NOT NULL,
    donor_relation_type TEXT NOT NULL, -- 'Near Relative (Living)', 'Spouse', 'Other / Swap', 'Deceased Candidate List'
    thota_compliance_status TEXT NOT NULL, -- 'Form 1 Verified', 'Awaiting Authorization Committee', 'Cleared'
    committee_meeting_date DATE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Row Level Security (RLS) Enablement
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE verified_hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_intake_records ENABLE ROW LEVEL SECURITY;

-- 8. Profiles RLS Policies
-- Users can read their own profile
CREATE POLICY "Users can read own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Users can update basic fields in own profile (prevent self-assignment of role)
CREATE POLICY "Users update own profile non-role"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id AND 
        role = (SELECT role FROM profiles WHERE id = auth.uid())
    );

-- Admins can update any profile including roles
CREATE POLICY "Admins can update profiles"
    ON profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 9. Audit Logs RLS Policies
-- Append-only for authenticated actions
CREATE POLICY "Authenticated users can insert audit logs"
    ON audit_logs FOR INSERT
    WITH CHECK (auth.uid() = actor_id);

-- Only admins can read audit logs
CREATE POLICY "Admins read audit logs"
    ON audit_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 10. Verified Hospitals RLS Policies
-- Directory is readable by all authenticated and anonymous public users
CREATE POLICY "Public can view verified hospitals"
    ON verified_hospitals FOR SELECT
    USING (is_verified = TRUE);

-- Only Admins and verified Hospital Staff can insert or update hospital listings
CREATE POLICY "Admins and Hospital Staff manage hospitals"
    ON verified_hospitals FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('admin', 'hospital_staff')
        )
    );

-- 11. Assistance Requests RLS Policies
-- Patients can read and create their own requests
CREATE POLICY "Patients view own requests"
    ON assistance_requests FOR SELECT
    USING (auth.uid() = patient_id);

CREATE POLICY "Patients insert own requests"
    ON assistance_requests FOR INSERT
    WITH CHECK (auth.uid() = patient_id);

-- Volunteers, Hospital Staff, and Admins can view requests
CREATE POLICY "Staff and Volunteers view requests"
    ON assistance_requests FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('volunteer', 'hospital_staff', 'admin')
        )
    );

-- Assigned volunteers or admins can update requests
CREATE POLICY "Volunteers update assigned requests"
    ON assistance_requests FOR UPDATE
    USING (
        auth.uid() = assigned_volunteer_id OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 12. Hospital Intake Records RLS Policies
-- Only hospital staff and admins have access
CREATE POLICY "Hospital staff and Admins view intake records"
    ON hospital_intake_records FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('hospital_staff', 'admin')
        )
    );

CREATE POLICY "Hospital staff create intake records"
    ON hospital_intake_records FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('hospital_staff', 'admin')
        )
    );
