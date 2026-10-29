-- Migration: 20261027000001_patient_expense_and_governance.sql
-- Description: Checklists, personal expense planning, consents, resources, and governance tables with RLS

-- 1. User Roles Junction / Explicit Role Governance
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    assigned_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- 2. Hospital Sources & Audit History
CREATE TABLE IF NOT EXISTS hospital_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID NOT NULL REFERENCES verified_hospitals(id) ON DELETE CASCADE,
    source_type TEXT NOT NULL, -- 'NOTTO Directory', 'State SOTTO Registry', 'NABH Portal', 'Hospital RTI Disclosure'
    source_url TEXT NOT NULL,
    verified_by UUID REFERENCES profiles(id),
    verification_notes TEXT,
    verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Official Resources & Statutory Documentation
CREATE TABLE IF NOT EXISTS official_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL, -- 'statutory_act', 'form', 'scheme', 'portal'
    description TEXT NOT NULL,
    official_url TEXT NOT NULL,
    authority_name TEXT NOT NULL, -- 'Ministry of Health and Family Welfare', 'NOTTO', 'NHA'
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Checklists & Items Master Catalog
CREATE TABLE IF NOT EXISTS master_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organ_type organ_type NOT NULL,
    phase TEXT NOT NULL, -- 'evaluation', 'legal_clearance', 'pre_transplant', 'surgery', 'post_discharge'
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS master_checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checklist_id UUID NOT NULL REFERENCES master_checklists(id) ON DELETE CASCADE,
    item_title TEXT NOT NULL,
    statutory_reference TEXT, -- e.g. "THOTA Rules 2014, Rule 7 / Form 1"
    is_mandatory BOOLEAN NOT NULL DEFAULT TRUE,
    step_order INTEGER NOT NULL DEFAULT 1
);

-- 5. User Personal Checklist Items
CREATE TABLE IF NOT EXISTS user_checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    master_item_id UUID REFERENCES master_checklist_items(id),
    custom_title TEXT,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Request Volunteer Assignments
CREATE TABLE IF NOT EXISTS request_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES assistance_requests(id) ON DELETE CASCADE,
    volunteer_id UUID NOT NULL REFERENCES profiles(id),
    assigned_by UUID REFERENCES profiles(id),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completion_notes TEXT,
    completed_at TIMESTAMPTZ
);

-- 7. Expense Plans & Budget Items
CREATE TABLE IF NOT EXISTS expense_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    organ_type organ_type NOT NULL,
    hospital_name TEXT,
    target_budget NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    has_government_scheme BOOLEAN NOT NULL DEFAULT FALSE,
    scheme_name TEXT, -- e.g. "Ayushman Bharat PM-JAY", "RAN"
    sanctioned_amount NUMERIC(12, 2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expense_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES expense_plans(id) ON DELETE CASCADE,
    category TEXT NOT NULL, -- 'donor_eval', 'pre_op', 'hospital_package', 'lodging_travel', 'immunosuppressants', 'margin_of_safety'
    item_description TEXT NOT NULL,
    estimated_amount NUMERIC(10, 2) NOT NULL,
    actual_amount NUMERIC(10, 2) DEFAULT 0.00,
    is_paid BOOLEAN NOT NULL DEFAULT FALSE,
    receipt_reference TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Patient Consents & Boundary Acknowledgments
CREATE TABLE IF NOT EXISTS user_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    consent_type TEXT NOT NULL, -- 'thota_section19_warning', 'non_clinical_boundary', 'data_privacy', 'volunteer_wayfinding'
    has_consented BOOLEAN NOT NULL DEFAULT FALSE,
    ip_address INET,
    consented_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Clinical Demonstration Records (Synthetic Only)
CREATE TABLE IF NOT EXISTS clinical_demo_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    synthetic_patient_code TEXT NOT NULL UNIQUE,
    organ organ_type NOT NULL,
    blood_group TEXT NOT NULL,
    evaluation_stage TEXT NOT NULL,
    hla_crossmatch_status TEXT NOT NULL,
    authorization_committee_status TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Enable Row Level Security (RLS) on all new tables
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE official_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_demo_records ENABLE ROW LEVEL SECURITY;

-- 11. Policies
-- Public Read for official resources and master checklists
CREATE POLICY "Public read official resources" ON official_resources FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public read master checklists" ON master_checklists FOR SELECT USING (TRUE);
CREATE POLICY "Public read master checklist items" ON master_checklist_items FOR SELECT USING (TRUE);
CREATE POLICY "Public read hospital sources" ON hospital_sources FOR SELECT USING (TRUE);

-- User Checklist Items (Patient Isolation)
CREATE POLICY "Users view own checklist" ON user_checklist_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users modify own checklist" ON user_checklist_items FOR ALL USING (auth.uid() = user_id);

-- Expense Plans & Items (Patient Isolation)
CREATE POLICY "Users view own expense plans" ON expense_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users modify own expense plans" ON expense_plans FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users view own expense items" ON expense_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM expense_plans WHERE expense_plans.id = expense_items.plan_id AND expense_plans.user_id = auth.uid())
);
CREATE POLICY "Users modify own expense items" ON expense_items FOR ALL USING (
    EXISTS (SELECT 1 FROM expense_plans WHERE expense_plans.id = expense_items.plan_id AND expense_plans.user_id = auth.uid())
);

-- Consents (User and Admin)
CREATE POLICY "Users view own consents" ON user_consents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own consents" ON user_consents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all consents" ON user_consents FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Volunteer Request Assignments
CREATE POLICY "Volunteers and admins view assignments" ON request_assignments FOR SELECT USING (
    auth.uid() = volunteer_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'hospital_staff'))
);

-- Clinical Demo Records (Hospital Staff & Admin Only)
CREATE POLICY "Staff and admin view demo records" ON clinical_demo_records FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('hospital_staff', 'admin'))
);
