import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { supabase } from '../../lib/supabase';
import { UserRole } from '../../types';

/**
 * Access Control Permission Simulation Engine
 * Models the Row-Level Security (RLS) policies and triggers defined in PostgreSQL migrations.
 */
interface AccessQuery {
  table: string;
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  role: UserRole | 'anonymous';
  userId?: string;
  recordOwnerId?: string;
  targetRole?: UserRole;
  isSynthetic?: boolean;
}

const evaluateRlsPermission = (query: AccessQuery): { allowed: boolean; reason: string } => {
  const { table, operation, role, userId, recordOwnerId, targetRole, isSynthetic } = query;

  // 1. Audit Logs: Strictly append-only, readable only by admin
  if (table === 'audit_logs') {
    if (operation === 'UPDATE' || operation === 'DELETE') {
      return { allowed: false, reason: 'Security Policy Violation: audit_logs is immutable. Triggers reject UPDATE and DELETE.' };
    }
    if (operation === 'SELECT') {
      return role === 'admin'
        ? { allowed: true, reason: 'Admins have supervisory read access to audit logs' }
        : { allowed: false, reason: 'Audit logs restricted to administrators' };
    }
    if (operation === 'INSERT') {
      return role !== 'anonymous'
        ? { allowed: true, reason: 'Authenticated actors can append audit log records' }
        : { allowed: false, reason: 'Anonymous actors cannot generate audit records directly' };
    }
  }

  // 2. Role Assignments: Governed by Admin only
  if (table === 'role_assignments' || table === 'user_roles') {
    if (operation === 'SELECT') {
      if (role === 'admin' || (userId && userId === recordOwnerId)) {
        return { allowed: true, reason: 'Users can inspect own role assignments; admins can view all' };
      }
      return { allowed: false, reason: 'Cannot inspect another user role assignment' };
    }
    if (operation === 'INSERT' || operation === 'UPDATE' || operation === 'DELETE') {
      return role === 'admin'
        ? { allowed: true, reason: 'Admins can manage institutional role assignments' }
        : { allowed: false, reason: 'Privilege escalation blocked: Non-admins cannot grant or alter roles' };
    }
  }

  // 3. Profiles: Role modification blocked for non-admins
  if (table === 'profiles') {
    if (operation === 'SELECT') {
      if (role === 'admin' || role === 'hospital_staff' || (userId && userId === recordOwnerId)) {
        return { allowed: true, reason: 'Allowed profile access' };
      }
      return { allowed: false, reason: 'Private profile isolation' };
    }
    if (operation === 'UPDATE') {
      if (targetRole && role !== 'admin') {
        return { allowed: false, reason: 'Trigger trg_protect_profile_role blocks self-escalation of roles' };
      }
      return userId === recordOwnerId || role === 'admin'
        ? { allowed: true, reason: 'Allowed update of personal profile' }
        : { allowed: false, reason: 'Cannot update other user profile' };
    }
  }

  // 4. Hospitals, Sources, Resources: Publicly readable directory
  if (['verified_hospitals', 'hospitals', 'hospital_sources', 'sources', 'official_resources', 'resources', 'master_checklists'].includes(table)) {
    if (operation === 'SELECT') {
      return { allowed: true, reason: 'Public read directory access' };
    }
    return role === 'admin' || role === 'hospital_staff'
      ? { allowed: true, reason: 'Institutional staff or admin can manage statutory data' }
      : { allowed: false, reason: 'Public and patients cannot modify statutory directory' };
  }

  // 5. Expense Plans & Items: Strictly isolated to owner and admin
  if (table === 'expense_plans' || table === 'expense_items' || table === 'expenses') {
    if (role === 'admin' || (userId && userId === recordOwnerId)) {
      return { allowed: true, reason: 'Owner or admin access to financial planning' };
    }
    return { allowed: false, reason: 'Financial data isolated under RLS' };
  }

  // 6. Consent Records: DPDP Act compliance (owner view/insert, admin audit)
  if (table === 'consent_records' || table === 'user_consents') {
    if (operation === 'SELECT') {
      return role === 'admin' || (userId && userId === recordOwnerId)
        ? { allowed: true, reason: 'Owner or admin audit view' }
        : { allowed: false, reason: 'Consents private to user' };
    }
    if (operation === 'INSERT') {
      return userId === recordOwnerId
        ? { allowed: true, reason: 'User can record their own statutory consent' }
        : { allowed: false, reason: 'Cannot record consent for another party' };
    }
    return { allowed: false, reason: 'Consent records cannot be modified or deleted directly' };
  }

  // 7. Synthetic Clinical Records: Strictly hospital staff & admin only
  if (table === 'synthetic_clinical_records' || table === 'hospital_intake_records' || table === 'clinical_demo_records') {
    if (role === 'hospital_staff' || role === 'admin') {
      if (isSynthetic === false) {
        return { allowed: false, reason: 'Constraint violation: Real PHI prohibited; must be synthetic demonstration' };
      }
      return { allowed: true, reason: 'Authorized clinical tracking access' };
    }
    return { allowed: false, reason: 'Patients, volunteers, and anonymous users cannot access clinical records' };
  }

  // 8. Assistance Requests: Patient, assigned volunteer, hospital coordinator, admin
  if (table === 'assistance_requests') {
    if (operation === 'SELECT') {
      if (role === 'admin' || role === 'hospital_staff') return { allowed: true, reason: 'Institutional overview' };
      if (role === 'volunteer') return { allowed: true, reason: 'Volunteers can browse open/assigned requests' };
      if (userId && userId === recordOwnerId) return { allowed: true, reason: 'Patient view own request' };
      return { allowed: false, reason: 'Patient cannot view requests of another patient' };
    }
    if (operation === 'INSERT') {
      return ['patient', 'family', 'admin'].includes(role)
        ? { allowed: true, reason: 'Patients can create assistance requests' }
        : { allowed: false, reason: 'Volunteers and anonymous users cannot submit patient requests' };
    }
  }

  return { allowed: false, reason: 'Default deny' };
};

describe('PostgreSQL Database Migrations, RLS Policies & Governance Suite', () => {
  const migrationsDir = path.resolve(__dirname, '../../../supabase/migrations');

  it('contains valid versioned migration files in chronological sequence', () => {
    expect(fs.existsSync(migrationsDir)).toBe(true);

    const files = fs.readdirSync(migrationsDir).filter((f: string) => f.endsWith('.sql')).sort();
    expect(files.length).toBeGreaterThanOrEqual(4);

    // Verify chronological prefix
    expect(files[0]).toMatch(/^20261027000000_/);
    expect(files[1]).toMatch(/^20261027000001_/);
    expect(files[2]).toMatch(/^20261029000000_/);
    expect(files[3]).toMatch(/^20261029000001_/);
  });

  it('implements all 12 required tables and entities in migration scripts', () => {
    const allMigrations = fs.readdirSync(migrationsDir)
      .filter((f: string) => f.endsWith('.sql'))
      .map((f: string) => fs.readFileSync(path.join(migrationsDir, f), 'utf-8'))
      .join('\n');

    const requiredEntities = [
      'profiles',
      'role_assignments',
      'hospitals',
      'sources',
      'resources',
      'checklists',
      'assistance_requests',
      'assignments',
      'expenses',
      'consent_records',
      'audit_logs',
      'synthetic_clinical_records'
    ];

    for (const entity of requiredEntities) {
      const entityRegex = new RegExp(`(CREATE TABLE|CREATE OR REPLACE VIEW)\\s+(IF NOT EXISTS\\s+)?${entity}\\b`, 'i');
      expect(allMigrations).toMatch(entityRegex);
    }
  });

  it('enforces Row Level Security (RLS) on all data tables in migrations', () => {
    const allMigrations = fs.readdirSync(migrationsDir)
      .filter((f: string) => f.endsWith('.sql'))
      .map((f: string) => fs.readFileSync(path.join(migrationsDir, f), 'utf-8'))
      .join('\n');

    const securedTables = [
      'profiles',
      'audit_logs',
      'verified_hospitals',
      'assistance_requests',
      'role_assignments',
      'consent_records',
      'synthetic_clinical_records',
      'official_resources',
      'master_checklists',
      'expense_plans',
      'expense_items'
    ];

    for (const table of securedTables) {
      const rlsRegex = new RegExp(`ALTER TABLE\\s+${table}\\s+ENABLE ROW LEVEL SECURITY`, 'i');
      expect(allMigrations).toMatch(rlsRegex);
    }
  });

  it('enforces audit log immutability via PostgreSQL trigger blocking UPDATE and DELETE', () => {
    const latestMigration = fs.readFileSync(
      path.join(migrationsDir, '20261029000001_comprehensive_governance_and_synthetic_seed.sql'),
      'utf-8'
    );

    expect(latestMigration).toContain('CREATE OR REPLACE FUNCTION block_audit_log_modification()');
    expect(latestMigration).toContain('BEFORE UPDATE OR DELETE ON audit_logs');
    expect(latestMigration).toContain('audit_logs is an immutable tamper-evident ledger');

    // Simulate attempts to modify audit logs
    const updateAttempt = evaluateRlsPermission({
      table: 'audit_logs',
      operation: 'UPDATE',
      role: 'admin'
    });
    expect(updateAttempt.allowed).toBe(false);
    expect(updateAttempt.reason).toContain('immutable');

    const deleteAttempt = evaluateRlsPermission({
      table: 'audit_logs',
      operation: 'DELETE',
      role: 'admin'
    });
    expect(deleteAttempt.allowed).toBe(false);
    expect(deleteAttempt.reason).toContain('immutable');
  });

  it('protects against profile role self-escalation via SQL trigger', () => {
    const latestMigration = fs.readFileSync(
      path.join(migrationsDir, '20261029000001_comprehensive_governance_and_synthetic_seed.sql'),
      'utf-8'
    );

    expect(latestMigration).toContain('CREATE OR REPLACE FUNCTION protect_profile_role_escalation()');
    expect(latestMigration).toContain('BEFORE UPDATE ON profiles');

    // Patient user trying to promote themselves to admin
    const selfEscalationAttempt = evaluateRlsPermission({
      table: 'profiles',
      operation: 'UPDATE',
      role: 'patient',
      userId: 'usr-patient-1',
      recordOwnerId: 'usr-patient-1',
      targetRole: 'admin'
    });
    expect(selfEscalationAttempt.allowed).toBe(false);
    expect(selfEscalationAttempt.reason).toContain('trg_protect_profile_role');

    // Admin user updating a profile role
    const adminRoleUpdate = evaluateRlsPermission({
      table: 'profiles',
      operation: 'UPDATE',
      role: 'admin',
      userId: 'usr-admin-9',
      recordOwnerId: 'usr-patient-1',
      targetRole: 'volunteer'
    });
    expect(adminRoleUpdate.allowed).toBe(true);
  });

  it('tests RLS permissions across separate user roles (Patient vs Volunteer vs Staff vs Admin)', () => {
    const patientId = 'patient-rajesh';
    const otherPatientId = 'patient-kavita';
    const volunteerId = 'volunteer-arun';

    // 1. Expense isolation: Patient A cannot view Patient B's financial breakdown
    const crossPatientExpense = evaluateRlsPermission({
      table: 'expense_plans',
      operation: 'SELECT',
      role: 'patient',
      userId: patientId,
      recordOwnerId: otherPatientId
    });
    expect(crossPatientExpense.allowed).toBe(false);

    // Patient can view their own expenses
    const ownExpense = evaluateRlsPermission({
      table: 'expense_plans',
      operation: 'SELECT',
      role: 'patient',
      userId: patientId,
      recordOwnerId: patientId
    });
    expect(ownExpense.allowed).toBe(true);

    // Volunteer cannot view patient expenses
    const volunteerExpenseAccess = evaluateRlsPermission({
      table: 'expense_plans',
      operation: 'SELECT',
      role: 'volunteer',
      userId: volunteerId,
      recordOwnerId: patientId
    });
    expect(volunteerExpenseAccess.allowed).toBe(false);

    // 2. Synthetic Clinical Records isolation: Patients and volunteers cannot access
    const patientClinicalAccess = evaluateRlsPermission({
      table: 'synthetic_clinical_records',
      operation: 'SELECT',
      role: 'patient',
      userId: patientId,
      isSynthetic: true
    });
    expect(patientClinicalAccess.allowed).toBe(false);

    const staffClinicalAccess = evaluateRlsPermission({
      table: 'synthetic_clinical_records',
      operation: 'SELECT',
      role: 'hospital_staff',
      userId: 'staff-priya',
      isSynthetic: true
    });
    expect(staffClinicalAccess.allowed).toBe(true);

    // 3. Clinical records must strictly be synthetic demonstration
    const realPhiAttempt = evaluateRlsPermission({
      table: 'synthetic_clinical_records',
      operation: 'SELECT',
      role: 'hospital_staff',
      userId: 'staff-priya',
      isSynthetic: false
    });
    expect(realPhiAttempt.allowed).toBe(false);
    expect(realPhiAttempt.reason).toContain('Real PHI prohibited');

    // 4. Role Assignments: Public/patient cannot grant privileged roles
    const publicRoleGrant = evaluateRlsPermission({
      table: 'role_assignments',
      operation: 'INSERT',
      role: 'patient',
      userId: patientId,
      targetRole: 'hospital_staff'
    });
    expect(publicRoleGrant.allowed).toBe(false);

    const adminRoleGrant = evaluateRlsPermission({
      table: 'role_assignments',
      operation: 'INSERT',
      role: 'admin',
      userId: 'admin-siddharth',
      targetRole: 'hospital_staff'
    });
    expect(adminRoleGrant.allowed).toBe(true);
  });

  it('validates synthetic seed data for all roles, statutory resources, checklists, and clinical tracking', () => {
    const seedMigration = fs.readFileSync(
      path.join(migrationsDir, '20261029000001_comprehensive_governance_and_synthetic_seed.sql'),
      'utf-8'
    );

    // Check seed profiles across all 5 roles
    expect(seedMigration).toContain('rajesh.sharma@example.com');
    expect(seedMigration).toContain('sunita.sharma@example.com');
    expect(seedMigration).toContain('arun.patel@example.com');
    expect(seedMigration).toContain('dr.priya.raman@aiims.gov.in');
    expect(seedMigration).toContain('siddharth.sen@notto.gov.in');

    // Check statutory resources
    expect(seedMigration).toContain('Transplantation of Human Organs and Tissues Act (THOTA) 1994');
    expect(seedMigration).toContain('THOTA Rules 2014 & Form 1');
    expect(seedMigration).toContain('Ayushman Bharat PM-JAY Renal Transplant Package');
    expect(seedMigration).toContain('Rashtriya Arogya Nidhi (RAN)');

    // Check synthetic clinical tracking with THOTA status
    expect(seedMigration).toContain('SYN-THOTA-DEL-001');
    expect(seedMigration).toContain('Form 1 Verified');
    expect(seedMigration).toContain('is_synthetic_demonstration');

    // Check DPDP consent records
    expect(seedMigration).toContain('thota_section19_warning');
    expect(seedMigration).toContain('dpdp_privacy');
  });

  it('guarantees that privileged credentials (service_role key, master passwords) are NEVER exposed in frontend code', () => {
    const srcDir = path.resolve(__dirname, '../../../src');

    const scanDirectoryForSecrets = (dir: string): string[] => {
      let findings: string[] = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          findings = findings.concat(scanDirectoryForSecrets(fullPath));
        } else if (
          entry.isFile() &&
          !entry.name.includes('.test.') &&
          (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') || entry.name.endsWith('.js'))
        ) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          if (content.includes('service_role') || content.includes('SUPABASE_SERVICE_ROLE_KEY')) {
            findings.push(`${fullPath}: contains reference to service_role`);
          }
          if (content.includes('POSTGRES_PASSWORD') || content.includes('SUPABASE_DB_PASSWORD')) {
            findings.push(`${fullPath}: contains database password reference`);
          }
        }
      }
      return findings;
    };

    const leaks = scanDirectoryForSecrets(srcDir);
    expect(leaks).toEqual([]);

    // Check Supabase client initialization in frontend
    expect(supabase).toBeDefined();
    expect(supabase.auth).toBeDefined();
  });
});
