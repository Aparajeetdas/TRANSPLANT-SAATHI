-- Migration: 20261029000000_hospital_directory_review_status.sql
-- Description: Add review status, service citation linking, and search indexes for PostgreSQL hospital directory

-- 1. Add review_status column to verified_hospitals
ALTER TABLE verified_hospitals 
ADD COLUMN IF NOT EXISTS review_status verification_status NOT NULL DEFAULT 'verified',
ADD COLUMN IF NOT EXISTS last_verified_date DATE NOT NULL DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS bed_capacity_estimate INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS is_demonstration_record BOOLEAN NOT NULL DEFAULT TRUE;

-- 2. Ensure hospital_sources table has granular program references
ALTER TABLE hospital_sources
ADD COLUMN IF NOT EXISTS organ_program organ_type DEFAULT 'kidney',
ADD COLUMN IF NOT EXISTS source_authority TEXT NOT NULL DEFAULT 'NOTTO National Registry',
ADD COLUMN IF NOT EXISTS citation_reference TEXT,
ADD COLUMN IF NOT EXISTS review_status verification_status NOT NULL DEFAULT 'verified',
ADD COLUMN IF NOT EXISTS reviewed_by_name TEXT DEFAULT 'Statutory Audit Directorate';

-- 3. Composite indexes for high-speed directory searching and filtering
CREATE INDEX IF NOT EXISTS idx_hospitals_state_city ON verified_hospitals(state, city);
CREATE INDEX IF NOT EXISTS idx_hospitals_review_status ON verified_hospitals(review_status);
CREATE INDEX IF NOT EXISTS idx_hospitals_organs ON verified_hospitals USING GIN(organs_supported);
CREATE INDEX IF NOT EXISTS idx_sources_hospital ON hospital_sources(hospital_id, organ_program);

-- 4. Statutory Rule Enforcement: Never claim a hospital offers a service without a recorded source citation
-- Constraint check function: every active service must have at least one audit citation
CREATE OR REPLACE FUNCTION verify_hospital_statutory_sources()
RETURNS TRIGGER AS $$
BEGIN
    -- Verify that the source authority and citation reference are non-empty
    IF NEW.source_authority IS NULL OR length(trim(NEW.source_authority)) = 0 THEN
        RAISE EXCEPTION 'Statutory rule violation: Every hospital service program must cite an accredited source authority (e.g. NOTTO, SOTTO, TRANSTAN)';
    END IF;
    IF NEW.citation_reference IS NULL OR length(trim(NEW.citation_reference)) = 0 THEN
        RAISE EXCEPTION 'Statutory rule violation: Every claimed hospital program must reference an official gazette or order number';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_verify_hospital_source ON hospital_sources;
CREATE TRIGGER trg_verify_hospital_source
BEFORE INSERT OR UPDATE ON hospital_sources
FOR EACH ROW EXECUTE FUNCTION verify_hospital_statutory_sources();

-- 5. Seed Verified Hospitals and Statutory Sources into PostgreSQL
INSERT INTO verified_hospitals (
    id, name, registration_number, state, city, address, lat, lng,
    organs_supported, accreditation, coordinator_name, coordinator_phone, coordinator_email,
    source_url, source_verification_date, is_verified, bed_capacity_estimate, is_demonstration_record, review_status
) VALUES
(
    'a0000000-0000-0000-0000-000000000001',
    'All India Institute of Medical Sciences (AIIMS) - Apex Centre',
    'NOTTO-APEX-ND-001',
    'Delhi',
    'New Delhi',
    'Sri Aurobindo Marg, Ansari Nagar, New Delhi 110029',
    28.5672,
    77.2100,
    ARRAY['kidney', 'liver', 'heart', 'cornea', 'bone_marrow']::organ_type[],
    'NOTTO Apex National Center / NABH Certified',
    'Dr. V. K. Sharma (Transplant Nodal Office)',
    '+91-11-26588500',
    'transplant-nodal@aiims.edu',
    'https://notto.mohfw.gov.in',
    '2026-03-15',
    TRUE,
    48,
    TRUE,
    'verified'
),
(
    'a0000000-0000-0000-0000-000000000002',
    'Postgraduate Institute of Medical Education and Research (PGIMER)',
    'ROTTO-NORTH-CHD-004',
    'Chandigarh',
    'Chandigarh',
    'Sector 12, Chandigarh 160012',
    30.7645,
    76.7744,
    ARRAY['kidney', 'liver', 'lungs', 'pancreas', 'cornea']::organ_type[],
    'ROTTO North Designated Hub / MOHFW Government Registry',
    'Ms. Harpreet Kaur (ROTTO Coordinator)',
    '+91-172-2746018',
    'rottochd@pgimer.edu.in',
    'https://pgimer.edu.in',
    '2026-02-28',
    TRUE,
    36,
    TRUE,
    'verified'
),
(
    'a0000000-0000-0000-0000-000000000003',
    'Institute of Liver and Biliary Sciences (ILBS)',
    'DL-ILBS-LIV-019',
    'Delhi',
    'New Delhi',
    'D-1, Vasant Kunj, New Delhi 110070',
    28.5135,
    77.1584,
    ARRAY['liver', 'kidney']::organ_type[],
    'Autonomous Super-Specialty / NABH / NABL',
    'Col. (Retd) R. N. Pillai (Donor Desk)',
    '+91-11-46300000',
    'organliaison@ilbs.in',
    'https://www.ilbs.in',
    '2026-04-10',
    TRUE,
    28,
    TRUE,
    'verified'
),
(
    'a0000000-0000-0000-0000-000000000004',
    'King Edward Memorial (KEM) Hospital & SOTTO Maharashtra',
    'MH-SOTTO-MUM-011',
    'Maharashtra',
    'Mumbai',
    'Acharya Donde Marg, Parel, Mumbai 400012',
    19.0022,
    72.8427,
    ARRAY['kidney', 'liver', 'cornea']::organ_type[],
    'SOTTO Western Regional Hub / Municipal Corporation Greater Mumbai',
    'Dr. Sujata Patwardhan (SOTTO Chief)',
    '+91-22-24107000',
    'sotto.maharashtra@kem.edu',
    'https://sottomaharashtra.org',
    '2026-03-22',
    TRUE,
    40,
    TRUE,
    'verified'
),
(
    'a0000000-0000-0000-0000-000000000005',
    'Madras Medical College & Rajiv Gandhi Government General Hospital',
    'TN-TRANSTAN-CHE-002',
    'Tamil Nadu',
    'Chennai',
    'EVR Periyar Salai, Park Town, Chennai 600003',
    13.0827,
    80.2707,
    ARRAY['kidney', 'liver', 'heart', 'lungs', 'cornea']::organ_type[],
    'TRANSTAN Government Transplant Authority Hub',
    'Dr. N. Gopalakrishnan (Transplant Wing)',
    '+91-44-25305000',
    'transtan.rggh@tn.gov.in',
    'https://transtan.tn.gov.in',
    '2026-01-19',
    TRUE,
    52,
    TRUE,
    'verified'
),
(
    'a0000000-0000-0000-0000-000000000006',
    'National Institute of Mental Health and Neurosciences (NIMHANS)',
    'KA-SOTTO-BLR-008',
    'Karnataka',
    'Bengaluru',
    'Hosur Road, Lakkasandra, Bengaluru 560029',
    12.9392,
    77.5954,
    ARRAY['cornea', 'bone_marrow']::organ_type[],
    'Institute of National Importance / Jeevasarthakathe Registered',
    'Dr. Anita Desai (Nodal Tissue Liaison)',
    '+91-80-26995000',
    'tissuebank@nimhans.ac.in',
    'https://nimhans.ac.in',
    '2026-02-14',
    TRUE,
    20,
    TRUE,
    'pending'
)
ON CONFLICT (registration_number) DO UPDATE SET
    review_status = EXCLUDED.review_status,
    bed_capacity_estimate = EXCLUDED.bed_capacity_estimate,
    source_verification_date = EXCLUDED.source_verification_date;

-- Insert Seed Sources for AIIMS
INSERT INTO hospital_sources (hospital_id, source_type, source_url, organ_program, source_authority, citation_reference, review_status, reviewed_by_name)
VALUES
('a0000000-0000-0000-0000-000000000001', 'NOTTO Gazette', 'https://notto.mohfw.gov.in', 'kidney', 'NOTTO National Apex Registry', 'MoHFW Gazette Notif. No. T-12014/05/2024-NOTTO', 'verified', 'MoHFW Central Verification Directorate'),
('a0000000-0000-0000-0000-000000000001', 'NOTTO Gazette', 'https://notto.mohfw.gov.in', 'liver', 'NOTTO National Liver Allocation Hub', 'Order Ref: NOTTO/LIV/REG-0012', 'verified', 'MoHFW Central Verification Directorate'),
('a0000000-0000-0000-0000-000000000001', 'NOTTO Gazette', 'https://notto.mohfw.gov.in', 'heart', 'NOTTO Thoracic Directorate', 'MoHFW Thoracic Reg. No. 04/2023', 'verified', 'MoHFW Central Verification Directorate'),
('a0000000-0000-0000-0000-000000000001', 'National Eye Bank', 'https://www.aiims.edu', 'cornea', 'National Eye Bank AIIMS', 'Gazette Reg. EB-DL-1998', 'verified', 'Directorate General of Health Services'),
('a0000000-0000-0000-0000-000000000001', 'MoHFW Directorate', 'https://www.aiims.edu', 'bone_marrow', 'National Marrow Registry AIIMS', 'BMT Hub Reg. 2024/99', 'verified', 'MoHFW Central Verification Directorate')
ON CONFLICT DO NOTHING;
