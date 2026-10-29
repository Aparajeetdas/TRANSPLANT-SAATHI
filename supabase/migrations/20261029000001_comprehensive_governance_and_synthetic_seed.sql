-- ==============================================================================
-- Migration: 20261029000001_comprehensive_governance_and_synthetic_seed.sql
-- Description: Comprehensive Governance, Versioned Entities, Restrictive RLS, 
--              Security Triggers, Performance Indexes, and Synthetic Seed Data.
-- ==============================================================================

-- 1. ROLE ASSIGNMENTS & RBAC GOVERNANCE
-- Explicit table for institutional and system privilege assignments
CREATE TABLE IF NOT EXISTS role_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    assigned_by UUID REFERENCES profiles(id),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    governance_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- 2. CONSENT RECORDS (DPDP ACT 2023 & THOTA STATUTORY COMPLIANCE)
CREATE TABLE IF NOT EXISTS consent_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    consent_type TEXT NOT NULL, -- 'thota_section19_warning', 'non_clinical_boundary', 'dpdp_privacy', 'volunteer_wayfinding'
    purpose TEXT NOT NULL,
    has_consented BOOLEAN NOT NULL DEFAULT TRUE,
    ip_hash TEXT,
    version TEXT NOT NULL DEFAULT '2026.1',
    consented_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at TIMESTAMPTZ
);

-- 3. SYNTHETIC CLINICAL RECORDS (HOSPITAL COORDINATOR TRACKING - NO REAL PHI)
CREATE TABLE IF NOT EXISTS synthetic_clinical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID REFERENCES verified_hospitals(id) ON DELETE SET NULL,
    synthetic_patient_code TEXT NOT NULL UNIQUE, -- e.g. "SYN-THOTA-DEL-001"
    organ_type organ_type NOT NULL,
    blood_group TEXT NOT NULL,
    donor_relation_type TEXT NOT NULL, -- 'Near Relative (Living)', 'Spouse', 'Other / Swap', 'Deceased Candidate List'
    tissue_match_score NUMERIC(5, 2) NOT NULL DEFAULT 85.00 CHECK (tissue_match_score >= 0 AND tissue_match_score <= 100),
    ethics_committee_status TEXT NOT NULL, -- 'Pending Review', 'Approved', 'Additional Affidavit Requested', 'Cleared'
    committee_approval_date DATE,
    form_submission_status TEXT NOT NULL, -- 'Form 1 Verified', 'Form 2 Verified', 'Awaiting Signatures', 'Completed'
    is_synthetic_demonstration BOOLEAN NOT NULL DEFAULT TRUE CHECK (is_synthetic_demonstration = TRUE),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. CONVENIENCE & BACKWARD-COMPATIBLE VIEWS
-- Aliases to allow standard entity querying ('hospitals', 'sources', 'resources', 'checklists', 'assignments', 'expenses')
CREATE OR REPLACE VIEW hospitals AS
SELECT 
    id, name, registration_number, state, city, address, lat, lng,
    organs_supported, accreditation, coordinator_name, coordinator_phone, coordinator_email,
    source_url, source_verification_date, is_verified, review_status, bed_capacity_estimate,
    is_demonstration_record, created_at
FROM verified_hospitals;

CREATE OR REPLACE VIEW sources AS
SELECT
    id, hospital_id, source_type, source_url, organ_program, source_authority,
    citation_reference, review_status, reviewed_by_name, verification_notes, verified_at
FROM hospital_sources;

CREATE OR REPLACE VIEW resources AS
SELECT
    id, title, category, description, official_url, authority_name, is_active, created_at
FROM official_resources;

CREATE OR REPLACE VIEW checklists AS
SELECT
    m.id AS checklist_id,
    m.organ_type,
    m.phase,
    m.title AS checklist_title,
    i.id AS item_id,
    i.item_title,
    i.statutory_reference,
    i.is_mandatory,
    i.step_order
FROM master_checklists m
JOIN master_checklist_items i ON m.id = i.checklist_id;

CREATE OR REPLACE VIEW assignments AS
SELECT
    id, request_id, volunteer_id, assigned_by, assigned_at, completion_notes, completed_at
FROM request_assignments;

CREATE OR REPLACE VIEW expenses AS
SELECT
    p.id AS plan_id,
    p.user_id,
    p.organ_type,
    p.hospital_name,
    p.target_budget,
    p.has_government_scheme,
    p.scheme_name,
    p.sanctioned_amount,
    i.id AS item_id,
    i.category,
    i.item_description,
    i.estimated_amount,
    i.actual_amount,
    i.is_paid,
    i.receipt_reference,
    i.created_at
FROM expense_plans p
LEFT JOIN expense_items i ON p.id = i.plan_id;

-- 5. PERFORMANCE AND SECURITY INDEXES
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_role_assignments_user ON role_assignments(user_id, role);
CREATE INDEX IF NOT EXISTS idx_role_assignments_active ON role_assignments(is_active);
CREATE INDEX IF NOT EXISTS idx_requests_patient ON assistance_requests(patient_id, status);
CREATE INDEX IF NOT EXISTS idx_requests_volunteer ON assistance_requests(assigned_volunteer_id);
CREATE INDEX IF NOT EXISTS idx_assignments_request ON request_assignments(request_id);
CREATE INDEX IF NOT EXISTS idx_assignments_volunteer ON request_assignments(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_expense_plans_user ON expense_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_expense_items_plan ON expense_items(plan_id, category);
CREATE INDEX IF NOT EXISTS idx_consent_records_user ON consent_records(user_id, consent_type);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs(actor_id, created_at);
CREATE INDEX IF NOT EXISTS idx_clinical_records_hospital ON synthetic_clinical_records(hospital_id, ethics_committee_status);

-- 6. SECURITY TRIGGERS & CONSTRAINTS

-- A. Audit Log Immutability: Block UPDATE and DELETE on audit_logs
CREATE OR REPLACE FUNCTION block_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Security Policy Violation: audit_logs is an immutable tamper-evident ledger. UPDATE and DELETE operations are strictly forbidden.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_logs_immutable ON audit_logs;
CREATE TRIGGER trg_audit_logs_immutable
BEFORE UPDATE OR DELETE ON audit_logs
FOR EACH ROW EXECUTE FUNCTION block_audit_log_modification();

-- B. Profile Role Self-Escalation Protection: Only admins can alter profile roles
CREATE OR REPLACE FUNCTION protect_profile_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.role IS DISTINCT FROM NEW.role THEN
        -- If invoked within an authenticated user session, verify that the session user is an admin
        IF auth.uid() IS NOT NULL AND NOT EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        ) THEN
            RAISE EXCEPTION 'Security Policy Violation: Public or non-admin users cannot alter user roles. Contact an administrator for institutional elevation.';
        END IF;
    END IF;
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_protect_profile_role ON profiles;
CREATE TRIGGER trg_protect_profile_role
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION protect_profile_role_escalation();

-- 7. ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on newly defined tables
ALTER TABLE role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE synthetic_clinical_records ENABLE ROW LEVEL SECURITY;

-- Role Assignments RLS
CREATE POLICY "Users can view own role assignments"
    ON role_assignments FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view and manage all role assignments"
    ON role_assignments FOR ALL
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Consent Records RLS (DPDP Compliance: Private to user, auditable by admin)
CREATE POLICY "Users can view own consent records"
    ON consent_records FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consent records"
    ON consent_records FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all consent records for audit"
    ON consent_records FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Synthetic Clinical Records RLS (Hospital Staff & Admin Restricted)
CREATE POLICY "Hospital staff and admins can view synthetic clinical records"
    ON synthetic_clinical_records FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('hospital_staff', 'admin'))
    );

CREATE POLICY "Hospital staff and admins can create synthetic clinical records"
    ON synthetic_clinical_records FOR INSERT
    WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('hospital_staff', 'admin'))
    );

CREATE POLICY "Hospital staff and admins can update synthetic clinical records"
    ON synthetic_clinical_records FOR UPDATE
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('hospital_staff', 'admin'))
    );

-- Strengthen Audit Logs RLS: Allow authenticated append, read restricted to admin
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
CREATE POLICY "Admins can view audit logs"
    ON audit_logs FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

DROP POLICY IF EXISTS "Authenticated users can record audit entries" ON audit_logs;
CREATE POLICY "Authenticated users can record audit entries"
    ON audit_logs FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- 8. SYNTHETIC SEED DATA

-- A. Synthetic Profiles for Evaluation Across All 5 Roles
-- (Using deterministic UUIDs for test reproducibility)
INSERT INTO profiles (id, email, full_name, phone, role, organization, is_active)
VALUES
    ('b0000000-0000-0000-0000-000000000001', 'rajesh.sharma@example.com', 'Rajesh Sharma', '+91 98765 43210', 'patient', NULL, TRUE),
    ('b0000000-0000-0000-0000-000000000002', 'sunita.sharma@example.com', 'Sunita Sharma', '+91 98765 43211', 'family', NULL, TRUE),
    ('b0000000-0000-0000-0000-000000000003', 'arun.patel@example.com', 'Arun Patel', '+91 98765 43212', 'volunteer', 'Seva Sathi Patient Navigators', TRUE),
    ('b0000000-0000-0000-0000-000000000004', 'dr.priya.raman@aiims.gov.in', 'Dr. Priya Raman', '+91 11 2658 8500', 'hospital_staff', 'AIIMS New Delhi - Transplant Cell', TRUE),
    ('b0000000-0000-0000-0000-000000000005', 'siddharth.sen@notto.gov.in', 'Siddharth Sen', '+91 11 2616 4770', 'admin', 'National Organ & Tissue Transplant Organisation', TRUE)
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role,
    organization = EXCLUDED.organization;

-- B. Explicit Role Assignments
INSERT INTO role_assignments (user_id, role, assigned_by, governance_notes)
VALUES
    ('b0000000-0000-0000-0000-000000000001', 'patient', 'b0000000-0000-0000-0000-000000000005', 'Public Patient Self-Registration'),
    ('b0000000-0000-0000-0000-000000000002', 'family', 'b0000000-0000-0000-0000-000000000005', 'Family Caregiver Self-Registration'),
    ('b0000000-0000-0000-0000-000000000003', 'volunteer', 'b0000000-0000-0000-0000-000000000005', 'Vetted Volunteer Navigator - Seva Sathi NGO'),
    ('b0000000-0000-0000-0000-000000000004', 'hospital_staff', 'b0000000-0000-0000-0000-000000000005', 'Institutional Hospital Transplant Coordinator - AIIMS New Delhi'),
    ('b0000000-0000-0000-0000-000000000005', 'admin', 'b0000000-0000-0000-0000-000000000005', 'Central Directorate System Administrator')
ON CONFLICT (user_id, role) DO NOTHING;

-- C. Official Statutory Resources (THOTA 1994, Rules 2014, PM-JAY, RAN)
INSERT INTO official_resources (id, title, category, description, official_url, authority_name, is_active)
VALUES
    (
        'c0000000-0000-0000-0000-000000000001',
        'Transplantation of Human Organs and Tissues Act (THOTA) 1994',
        'statutory_act',
        'Principal statute regulating organ donation, transplantation procedures, and strictly prohibiting commercial transactions in human organs in India.',
        'https://notto.mohfw.gov.in',
        'Ministry of Health and Family Welfare, Government of India',
        TRUE
    ),
    (
        'c0000000-0000-0000-0000-000000000002',
        'THOTA Rules 2014 & Form 1 (Near Relative Donor Application)',
        'form',
        'Statutory application form and affidavit for living organ donation between near relatives (mother, father, spouse, son, daughter, brother, sister).',
        'https://notto.mohfw.gov.in',
        'National Organ & Tissue Transplant Organisation (NOTTO)',
        TRUE
    ),
    (
        'c0000000-0000-0000-0000-000000000003',
        'Ayushman Bharat PM-JAY Renal Transplant Package Guidelines',
        'scheme',
        'Health protection scheme offering cashless coverage up to ₹5,00,000 per family per year for secondary and tertiary healthcare, including kidney transplant packages.',
        'https://pmjay.gov.in',
        'National Health Authority (NHA)',
        TRUE
    ),
    (
        'c0000000-0000-0000-0000-000000000004',
        'Rashtriya Arogya Nidhi (RAN) Financial Assistance Scheme',
        'scheme',
        'Financial assistance of up to ₹15,00,000 for poor patients living below the poverty line suffering from major life-threatening diseases requiring specialized tertiary treatment.',
        'https://mohfw.gov.in',
        'Ministry of Health and Family Welfare',
        TRUE
    )
ON CONFLICT DO NOTHING;

-- D. Master Checklists (Kidney & Liver Pre-Transplant Navigation)
INSERT INTO master_checklists (id, organ_type, phase, title, description)
VALUES
    (
        'd0000000-0000-0000-0000-000000000001',
        'kidney',
        'legal_clearance',
        'THOTA Living Kidney Donor Legal Documentation Checklist',
        'Step-by-step statutory paperwork required for living donor evaluation and Authorization Committee submission under THOTA 1994.'
    ),
    (
        'd0000000-0000-0000-0000-000000000002',
        'liver',
        'evaluation',
        'Living Donor Liver Evaluation & Fitness Protocol',
        'Clinical and administrative roadmap for living donor volumetric assessment, HLA crossmatching, and hospital ethics clearance.'
    )
ON CONFLICT DO NOTHING;

INSERT INTO master_checklist_items (id, checklist_id, item_title, statutory_reference, is_mandatory, step_order)
VALUES
    ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'THOTA Form 1 (Near Relative Application) Duly Signed', 'THOTA Rules 2014, Rule 7', TRUE, 1),
    ('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'Government Photo Identity Proof (Aadhaar / Voter ID / Passport)', 'Rule 14 Verification Guideline', TRUE, 2),
    ('e0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001', 'Certified Genetic Relationship Proof (DNA Profiling Report)', 'THOTA Amendment Act 2011, Sec 9', TRUE, 3),
    ('e0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000001', 'Hospital Competent Authority Video Recording of Consent', 'THOTA Rules 2014, Rule 11', TRUE, 4)
ON CONFLICT DO NOTHING;

-- E. Synthetic Assistance Requests (Demonstrating Patient Navigation & Volunteer Assignment)
INSERT INTO assistance_requests (
    id, patient_id, patient_name, contact_phone, organ_category,
    hospital_name, support_type, notes, status, assigned_volunteer_id
) VALUES
    (
        'f0000000-0000-0000-0000-000000000001',
        'b0000000-0000-0000-0000-000000000001',
        'Rajesh Sharma',
        '+91 98765 43210',
        'kidney',
        'All India Institute of Medical Sciences (AIIMS) - Apex Centre',
        'Paperwork (Form 1/2/3)',
        'Need guidance on Form 1 notarization and notary affidavit for living donor near-relative clearance.',
        'assigned',
        'b0000000-0000-0000-0000-000000000003'
    ),
    (
        'f0000000-0000-0000-0000-000000000002',
        'b0000000-0000-0000-0000-000000000001',
        'Rajesh Sharma',
        '+91 98765 43210',
        'kidney',
        'All India Institute of Medical Sciences (AIIMS) - Apex Centre',
        'Wayfinding & Logistics',
        'First visit from Rajasthan. Need non-clinical guidance on finding Dharamshala accommodations near AIIMS Ansari Nagar.',
        'submitted',
        NULL
    )
ON CONFLICT (id) DO NOTHING;

-- F. Volunteer Request Assignments
INSERT INTO request_assignments (id, request_id, volunteer_id, assigned_by, completion_notes)
VALUES
    (
        '10000000-0000-0000-0000-000000000001',
        'f0000000-0000-0000-0000-000000000001',
        'b0000000-0000-0000-0000-000000000003',
        'b0000000-0000-0000-0000-000000000005',
        'Connected with patient family. Provided NOTTO Form 1 bilingual checklist template.'
    )
ON CONFLICT DO NOTHING;

-- G. Synthetic Expense Plan & Budget Items
INSERT INTO expense_plans (
    id, user_id, organ_type, hospital_name, target_budget,
    has_government_scheme, scheme_name, sanctioned_amount, notes
) VALUES
    (
        '20000000-0000-0000-0000-000000000001',
        'b0000000-0000-0000-0000-000000000001',
        'kidney',
        'All India Institute of Medical Sciences (AIIMS) - Apex Centre',
        450000.00,
        TRUE,
        'Ayushman Bharat PM-JAY',
        250000.00,
        'Estimated total out-of-pocket planning including post-transplant immunosuppressants for first 6 months.'
    )
ON CONFLICT (id) DO NOTHING;

INSERT INTO expense_items (id, plan_id, category, item_description, estimated_amount, actual_amount, is_paid, receipt_reference)
VALUES
    ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'donor_eval', 'Pre-transplant tissue typing & HLA crossmatch', 45000.00, 42000.00, TRUE, 'AIIMS-RCP-2026-081'),
    ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'hospital_package', 'AIIMS surgical package & ICU bed charges', 150000.00, 0.00, FALSE, NULL),
    ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 'immunosuppressants', 'Initial 6-month Tacrolimus / Mycophenolate regimen', 120000.00, 0.00, FALSE, NULL),
    ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000001', 'lodging_travel', 'Family lodging at AIIMS Dharamshala for 4 weeks', 25000.00, 8000.00, TRUE, 'DHARAM-DEL-401')
ON CONFLICT (id) DO NOTHING;

-- H. User Consent Records (DPDP Act 2023 & THOTA Compliance)
INSERT INTO consent_records (id, user_id, consent_type, purpose, has_consented, ip_hash, version)
VALUES
    (
        '40000000-0000-0000-0000-000000000001',
        'b0000000-0000-0000-0000-000000000001',
        'thota_section19_warning',
        'Explicit acknowledgement that buying or selling human organs is a punishable offense under Section 19 of THOTA 1994 with up to 10 years imprisonment.',
        TRUE,
        'sha256:d8e8fca2dc0f896fd7cb4cb0031ba249',
        '2026.1'
    ),
    (
        '40000000-0000-0000-0000-000000000002',
        'b0000000-0000-0000-0000-000000000001',
        'non_clinical_boundary',
        'Acknowledgement that Transplant Saathi provides non-clinical administrative navigation and is not a medical provider or organ donor matching registry.',
        TRUE,
        'sha256:d8e8fca2dc0f896fd7cb4cb0031ba249',
        '2026.1'
    ),
    (
        '40000000-0000-0000-0000-000000000003',
        'b0000000-0000-0000-0000-000000000001',
        'dpdp_privacy',
        'Consent for processing contact details solely for volunteer assistance navigation under the Digital Personal Data Protection Act 2023.',
        TRUE,
        'sha256:d8e8fca2dc0f896fd7cb4cb0031ba249',
        '2026.1'
    )
ON CONFLICT (id) DO NOTHING;

-- I. Synthetic Clinical Records (Strictly Synthetic Demonstration Data)
INSERT INTO synthetic_clinical_records (
    id, hospital_id, synthetic_patient_code, organ_type, blood_group,
    donor_relation_type, tissue_match_score, ethics_committee_status,
    committee_approval_date, form_submission_status, is_synthetic_demonstration, created_by
) VALUES
    (
        '50000000-0000-0000-0000-000000000001',
        'a0000000-0000-0000-0000-000000000001',
        'SYN-THOTA-DEL-001',
        'kidney',
        'B+ve',
        'Near Relative (Living)',
        92.50,
        'Approved',
        '2026-03-12',
        'Form 1 Verified',
        TRUE,
        'b0000000-0000-0000-0000-000000000004'
    ),
    (
        '50000000-0000-0000-0000-000000000002',
        'a0000000-0000-0000-0000-000000000001',
        'SYN-THOTA-DEL-002',
        'liver',
        'O+ve',
        'Spouse',
        88.00,
        'Additional Affidavit Requested',
        NULL,
        'Form 2 Verified',
        TRUE,
        'b0000000-0000-0000-0000-000000000004'
    ),
    (
        '50000000-0000-0000-0000-000000000003',
        'a0000000-0000-0000-0000-000000000002',
        'SYN-THOTA-CHD-003',
        'kidney',
        'A+ve',
        'Other / Swap',
        79.00,
        'Pending Review',
        NULL,
        'Awaiting Signatures',
        TRUE,
        'b0000000-0000-0000-0000-000000000005'
    )
ON CONFLICT (id) DO NOTHING;

-- J. Immutable Audit Logs (Demonstrating Verifiable Institutional Actions)
INSERT INTO audit_logs (id, actor_id, actor_role, action, target_table, target_id, details)
VALUES
    (
        '60000000-0000-0000-0000-000000000001',
        'b0000000-0000-0000-0000-000000000005',
        'admin',
        'HOSPITAL_ACCREDITATION_VERIFIED',
        'verified_hospitals',
        'a0000000-0000-0000-0000-000000000001',
        '{"institution": "AIIMS Apex Centre", "gazette_notification": "T-12014/05/2024-NOTTO", "verified_status": "verified"}'::jsonb
    ),
    (
        '60000000-0000-0000-0000-000000000002',
        'b0000000-0000-0000-0000-000000000004',
        'hospital_staff',
        'ETHICS_COMMITTEE_CLEARANCE_LOGGED',
        'synthetic_clinical_records',
        '50000000-0000-0000-0000-000000000001',
        '{"patient_code": "SYN-THOTA-DEL-001", "decision": "Approved", "committee": "AIIMS Institutional Ethics Committee"}'::jsonb
    ),
    (
        '60000000-0000-0000-0000-000000000003',
        'b0000000-0000-0000-0000-000000000005',
        'admin',
        'VOLUNTEER_CREDENTIAL_GRANTED',
        'role_assignments',
        'b0000000-0000-0000-0000-000000000003',
        '{"volunteer": "Arun Patel", "organization": "Seva Sathi NGO", "training_certified": true}'::jsonb
    )
ON CONFLICT (id) DO NOTHING;
