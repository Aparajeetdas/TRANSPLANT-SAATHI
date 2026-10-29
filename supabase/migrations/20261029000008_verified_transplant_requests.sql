-- ==============================================================================
-- Migration: 20261029000008_verified_transplant_requests.sql
-- Description: Verified Organ Transplant Request and Hospital Coordination System.
--              Implements secure patient assistance requests, institutional multi-tenant
--              isolation between hospitals, status transition audit history,
--              patient communication, and strictly restricted internal hospital notes.
-- Statutory:   Transplantation of Human Organs and Tissues Act (THOTA), 1994,
--              THOTA Rules 2014, and Digital Personal Data Protection Act (DPDP) 2023.
-- ==============================================================================

-- 1. Helper function for unique request references: TS-REQ-YYYY-XX-XXXX
CREATE OR REPLACE FUNCTION generate_hospital_request_reference(p_organ TEXT)
RETURNS TEXT AS $$
DECLARE
    alphabet TEXT := '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
    prefix TEXT := 'OT';
    res TEXT;
    i INTEGER;
    rand_byte INTEGER;
    existing_count INTEGER;
BEGIN
    IF p_organ = 'kidney' THEN prefix := 'KD';
    ELSIF p_organ = 'liver' THEN prefix := 'LV';
    ELSIF p_organ = 'heart' THEN prefix := 'HT';
    ELSIF p_organ = 'lungs' THEN prefix := 'LG';
    ELSIF p_organ = 'cornea' THEN prefix := 'CR';
    ELSIF p_organ = 'pancreas' THEN prefix := 'PC';
    ELSIF p_organ = 'bone_marrow' THEN prefix := 'BM';
    ELSIF p_organ = 'intestine' THEN prefix := 'IT';
    END IF;

    LOOP
        res := 'TS-REQ-' || to_char(CURRENT_DATE, 'YYYY') || '-' || prefix || '-';
        FOR i IN 1..4 LOOP
            rand_byte := get_byte(gen_random_bytes(1), 0);
            res := res || substr(alphabet, (rand_byte % 32) + 1, 1);
        END LOOP;

        SELECT COUNT(*) INTO existing_count FROM hospital_transplant_requests WHERE reference_number = res;
        IF existing_count = 0 THEN
            RETURN res;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- 2. Create hospital_transplant_requests table
CREATE TABLE IF NOT EXISTS hospital_transplant_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_number VARCHAR(40) NOT NULL UNIQUE,
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    patient_public_id VARCHAR(32) NOT NULL,
    patient_name VARCHAR(120) NOT NULL,
    contact_phone VARCHAR(30) NOT NULL,
    contact_email VARCHAR(120) NOT NULL,
    preferred_contact_method VARCHAR(20) NOT NULL DEFAULT 'phone'
        CHECK (preferred_contact_method IN ('phone', 'email', 'in_app')),
    hospital_id VARCHAR(60) NOT NULL REFERENCES verified_hospitals(id) ON DELETE RESTRICT,
    hospital_name VARCHAR(255) NOT NULL,
    organ_program organ_type NOT NULL,
    request_category VARCHAR(60) NOT NULL
        CHECK (request_category IN ('transplant_guidance', 'official_registration', 'document_guidance', 'hospital_coordination', 'financial_counseling')),
    description TEXT NOT NULL,
    consent_given BOOLEAN NOT NULL DEFAULT true,
    consent_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    status VARCHAR(60) NOT NULL DEFAULT 'submitted'
        CHECK (status IN (
            'draft',
            'submitted',
            'awaiting_hospital_review',
            'additional_info_required',
            'under_hospital_review',
            'referred_official_registration',
            'assistance_in_progress',
            'closed',
            'cancelled'
        )),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create request status history table
CREATE TABLE IF NOT EXISTS hospital_request_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES hospital_transplant_requests(id) ON DELETE CASCADE,
    from_status VARCHAR(60),
    to_status VARCHAR(60) NOT NULL,
    updated_by VARCHAR(120) NOT NULL,
    updated_by_role VARCHAR(40) NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Create patient-visible messages table
CREATE TABLE IF NOT EXISTS hospital_request_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES hospital_transplant_requests(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    sender_name VARCHAR(120) NOT NULL,
    sender_role VARCHAR(40) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Create restricted internal notes table (Strictly confidential - hospital staff only)
CREATE TABLE IF NOT EXISTS hospital_request_internal_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES hospital_transplant_requests(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    author_name VARCHAR(120) NOT NULL,
    author_role VARCHAR(40) NOT NULL CHECK (author_role IN ('hospital_staff', 'admin')),
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performant lookups and institutional isolation
CREATE INDEX IF NOT EXISTS idx_htr_patient ON hospital_transplant_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_htr_hospital ON hospital_transplant_requests(hospital_id);
CREATE INDEX IF NOT EXISTS idx_htr_status ON hospital_transplant_requests(status);
CREATE INDEX IF NOT EXISTS idx_htr_ref ON hospital_transplant_requests(reference_number);
CREATE INDEX IF NOT EXISTS idx_htr_history_req ON hospital_request_status_history(request_id);
CREATE INDEX IF NOT EXISTS idx_htr_msgs_req ON hospital_request_messages(request_id);
CREATE INDEX IF NOT EXISTS idx_htr_notes_req ON hospital_request_internal_notes(request_id);

-- Enable RLS
ALTER TABLE hospital_transplant_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_request_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_request_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_request_internal_notes ENABLE ROW LEVEL SECURITY;

-- Default Deny Policies
CREATE POLICY "Deny unauthenticated htr" ON hospital_transplant_requests FOR ALL TO anon USING (false);
CREATE POLICY "Deny unauthenticated history" ON hospital_request_status_history FOR ALL TO anon USING (false);
CREATE POLICY "Deny unauthenticated msgs" ON hospital_request_messages FOR ALL TO anon USING (false);
CREATE POLICY "Deny unauthenticated notes" ON hospital_request_internal_notes FOR ALL TO anon USING (false);

-- RLS: Patients can view only their own requests
CREATE POLICY "Patients view own requests"
    ON hospital_transplant_requests FOR SELECT TO authenticated
    USING (patient_id = auth.uid());

CREATE POLICY "Patients insert own requests"
    ON hospital_transplant_requests FOR INSERT TO authenticated
    WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Patients cancel own requests"
    ON hospital_transplant_requests FOR UPDATE TO authenticated
    USING (patient_id = auth.uid())
    WITH CHECK (status = 'cancelled');

-- RLS: Verified Hospital Staff can view & update only requests assigned to their hospital
CREATE POLICY "Verified hospital staff view assigned requests"
    ON hospital_transplant_requests FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            JOIN verified_hospitals vh ON (
                vh.id = hospital_transplant_requests.hospital_id
                AND (p.hospital_registration_number = vh.registration_number OR p.organization = vh.name)
            )
            WHERE p.id = auth.uid()
              AND p.role = 'hospital_staff'
              AND p.hospital_verification_status = 'verified'
        )
        OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    );

CREATE POLICY "Verified hospital staff update assigned requests"
    ON hospital_transplant_requests FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            JOIN verified_hospitals vh ON (
                vh.id = hospital_transplant_requests.hospital_id
                AND (p.hospital_registration_number = vh.registration_number OR p.organization = vh.name)
            )
            WHERE p.id = auth.uid()
              AND p.role = 'hospital_staff'
              AND p.hospital_verification_status = 'verified'
        )
        OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    );

-- RLS: Internal Notes (STRICT PRIVACY: NEVER ACCESSIBLE BY PATIENT)
CREATE POLICY "Internal notes viewable only by authorized hospital coordinators and admins"
    ON hospital_request_internal_notes FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM hospital_transplant_requests htr
            JOIN verified_hospitals vh ON vh.id = htr.hospital_id
            JOIN profiles p ON p.id = auth.uid()
            WHERE htr.id = hospital_request_internal_notes.request_id
              AND (
                  (p.role = 'hospital_staff' AND p.hospital_verification_status = 'verified' AND (p.hospital_registration_number = vh.registration_number OR p.organization = vh.name))
                  OR p.role = 'admin'
              )
        )
    );

CREATE POLICY "Internal notes insertable only by authorized hospital coordinators and admins"
    ON hospital_request_internal_notes FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM hospital_transplant_requests htr
            JOIN verified_hospitals vh ON vh.id = htr.hospital_id
            JOIN profiles p ON p.id = auth.uid()
            WHERE htr.id = hospital_request_internal_notes.request_id
              AND (
                  (p.role = 'hospital_staff' AND p.hospital_verification_status = 'verified' AND (p.hospital_registration_number = vh.registration_number OR p.organization = vh.name))
                  OR p.role = 'admin'
              )
        )
    );

-- RLS: Patient messages
CREATE POLICY "Messages viewable by request patient or authorized hospital staff"
    ON hospital_request_messages FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM hospital_transplant_requests htr
            WHERE htr.id = hospital_request_messages.request_id
              AND (
                  htr.patient_id = auth.uid()
                  OR EXISTS (
                      SELECT 1 FROM profiles p
                      JOIN verified_hospitals vh ON vh.id = htr.hospital_id
                      WHERE p.id = auth.uid()
                        AND (
                            (p.role = 'hospital_staff' AND p.hospital_verification_status = 'verified' AND (p.hospital_registration_number = vh.registration_number OR p.organization = vh.name))
                            OR p.role = 'admin'
                        )
                  )
              )
        )
    );

CREATE POLICY "Messages insertable by request patient or authorized hospital staff"
    ON hospital_request_messages FOR INSERT TO authenticated
    WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM hospital_transplant_requests htr
            WHERE htr.id = hospital_request_messages.request_id
              AND (
                  htr.patient_id = auth.uid()
                  OR EXISTS (
                      SELECT 1 FROM profiles p
                      JOIN verified_hospitals vh ON vh.id = htr.hospital_id
                      WHERE p.id = auth.uid()
                        AND (
                            (p.role = 'hospital_staff' AND p.hospital_verification_status = 'verified' AND (p.hospital_registration_number = vh.registration_number OR p.organization = vh.name))
                            OR p.role = 'admin'
                        )
                  )
              )
        )
    );

-- RLS: Status history viewable by request participants
CREATE POLICY "History viewable by request participants"
    ON hospital_request_status_history FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM hospital_transplant_requests htr
            WHERE htr.id = hospital_request_status_history.request_id
              AND (
                  htr.patient_id = auth.uid()
                  OR EXISTS (
                      SELECT 1 FROM profiles p
                      JOIN verified_hospitals vh ON vh.id = htr.hospital_id
                      WHERE p.id = auth.uid()
                        AND (
                            (p.role = 'hospital_staff' AND p.hospital_verification_status = 'verified' AND (p.hospital_registration_number = vh.registration_number OR p.organization = vh.name))
                            OR p.role = 'admin'
                        )
                  )
              )
        )
    );
