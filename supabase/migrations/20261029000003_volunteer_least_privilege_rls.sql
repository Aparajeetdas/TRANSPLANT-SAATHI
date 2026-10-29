-- ==============================================================================
-- Migration: 20261029000003_volunteer_least_privilege_rls.sql
-- Description: Enforce least privilege access for volunteers on assistance_requests.
--              Volunteers may access ONLY their assigned requests. Unassigned
--              and third-party volunteer requests are restricted to Coordinators/Admins.
-- ==============================================================================

-- 1. Drop the legacy permissive SELECT policy that allowed all volunteers to view all requests
DROP POLICY IF EXISTS "Staff and Volunteers view requests" ON assistance_requests;
DROP POLICY IF EXISTS "Volunteers view only assigned requests" ON assistance_requests;
DROP POLICY IF EXISTS "Hospital staff and Admins view requests" ON assistance_requests;

-- 2. Hospital Coordinators and Admins have platform-level visibility
CREATE POLICY "Hospital staff and Admins view requests"
    ON assistance_requests FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('hospital_staff', 'admin')
        )
    );

-- 3. Volunteers may SELECT ONLY requests specifically assigned to them
CREATE POLICY "Volunteers view only assigned requests"
    ON assistance_requests FOR SELECT
    USING (
        auth.uid() = assigned_volunteer_id
    );

-- 4. Volunteers may UPDATE ONLY their assigned requests (e.g. advance status, add logs)
DROP POLICY IF EXISTS "Volunteers update assigned requests" ON assistance_requests;
DROP POLICY IF EXISTS "Volunteers update only assigned requests" ON assistance_requests;

CREATE POLICY "Volunteers update only assigned requests"
    ON assistance_requests FOR UPDATE
    USING (
        auth.uid() = assigned_volunteer_id
    )
    WITH CHECK (
        auth.uid() = assigned_volunteer_id
    );

-- 5. Audit log index for unauthorized access investigations
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_action 
    ON audit_logs(actor_id, action);

CREATE INDEX IF NOT EXISTS idx_requests_assigned_volunteer 
    ON assistance_requests(assigned_volunteer_id, status);
