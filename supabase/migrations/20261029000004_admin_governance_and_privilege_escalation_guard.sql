-- ==============================================================================
-- Migration: 20261029000004_admin_governance_and_privilege_escalation_guard.sql
-- Description: Enforce server-side authorization and privilege escalation prevention
--              for administrator operations (roles, hospitals, resources, audit).
-- ==============================================================================

-- 1. Official Resources Table with Admin RLS
CREATE TABLE IF NOT EXISTS official_resources (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    authority VARCHAR(255) NOT NULL,
    eligibility TEXT NOT NULL,
    coverage_details TEXT NOT NULL,
    application_process JSONB DEFAULT '[]'::jsonb,
    official_portal_url TEXT NOT NULL,
    source_citation VARCHAR(255) NOT NULL,
    last_verified_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE official_resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public view official resources" ON official_resources;
CREATE POLICY "Public view official resources"
    ON official_resources FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admins manage official resources" ON official_resources;
CREATE POLICY "Admins manage official resources"
    ON official_resources FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 2. Prevent Privilege Escalation on profiles table
CREATE OR REPLACE FUNCTION prevent_unauthorized_role_escalation()
RETURNS TRIGGER AS $$
DECLARE
    caller_role VARCHAR(50);
BEGIN
    -- If role is changing, ensure caller is authenticated platform administrator
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        SELECT role INTO caller_role FROM profiles WHERE id = auth.uid();
        IF caller_role IS NULL OR caller_role != 'admin' THEN
            RAISE EXCEPTION 'Privilege Escalation Detected: Only platform administrators can modify user roles.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON profiles;
CREATE TRIGGER trg_prevent_role_escalation
    BEFORE UPDATE OF role ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION prevent_unauthorized_role_escalation();

-- 3. Restrict Hospital Directory Modifications to Admins
DROP POLICY IF EXISTS "Admins insert hospitals" ON verified_hospitals;
CREATE POLICY "Admins insert hospitals"
    ON verified_hospitals FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins delete hospitals" ON verified_hospitals;
CREATE POLICY "Admins delete hospitals"
    ON verified_hospitals FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins update hospitals" ON verified_hospitals;
CREATE POLICY "Admins update hospitals"
    ON verified_hospitals FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 4. Full Audit Log Oversight Policy for Admins
DROP POLICY IF EXISTS "Admins view all audit logs" ON audit_logs;
CREATE POLICY "Admins view all audit logs"
    ON audit_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
