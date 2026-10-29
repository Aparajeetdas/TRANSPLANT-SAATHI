-- ==============================================================================
-- Migration: 20261029000002_assistance_workflow_and_expense_governance.sql
-- Description: Enforce RLS policies for coordinator volunteer assignment, 
--              patient request cancellation, expense planner invoice tracking,
--              and audit logging permissions under THOTA 1994 & DPDP Act 2023.
-- ==============================================================================

-- 1. Assistance Requests: Add coordinator assignment columns if not present
ALTER TABLE assistance_requests 
ADD COLUMN IF NOT EXISTS coordinator_notes TEXT,
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ;

-- 2. Expense Items: Ensure receipt references and payment tracking columns exist
ALTER TABLE expense_items
ADD COLUMN IF NOT EXISTS receipt_reference VARCHAR(100),
ADD COLUMN IF NOT EXISTS settled_at TIMESTAMPTZ;

-- 3. Enhance RLS Policies on assistance_requests
-- Drop overlapping policies if previously defined
DROP POLICY IF EXISTS "Coordinators and Admins assign volunteers" ON assistance_requests;
DROP POLICY IF EXISTS "Patients cancel own requests" ON assistance_requests;

-- Allow hospital coordinators and admins to update any assistance request (e.g. assign volunteer, update triage status)
CREATE POLICY "Coordinators and Admins assign volunteers"
    ON assistance_requests FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('hospital_staff', 'admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('hospital_staff', 'admin')
        )
    );

-- Allow patients to update (cancel) their own assistance requests if pending
CREATE POLICY "Patients cancel own requests"
    ON assistance_requests FOR UPDATE
    USING (
        auth.uid() = patient_id AND status IN ('submitted', 'under_review')
    )
    WITH CHECK (
        auth.uid() = patient_id AND status IN ('cancelled', 'submitted', 'under_review')
    );

-- 4. Enhance RLS Policies on audit_logs
DROP POLICY IF EXISTS "Authenticated users insert audit logs" ON audit_logs;
CREATE POLICY "Authenticated users insert audit logs"
    ON audit_logs FOR INSERT
    WITH CHECK (
        auth.uid() = actor_id
    );

-- 5. Indexes for fast lookups on status and hospital
CREATE INDEX IF NOT EXISTS idx_requests_status_hospital 
    ON assistance_requests(status, hospital_name);

CREATE INDEX IF NOT EXISTS idx_expense_items_plan_category 
    ON expense_items(plan_id, category);
