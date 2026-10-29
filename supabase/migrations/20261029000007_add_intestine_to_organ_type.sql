-- Migration: 20261029000007_add_intestine_to_organ_type.sql
-- Description: Smallest necessary schema change: Add 'intestine' to PostgreSQL organ_type enum for composite intestinal transplantation discovery

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t 
        JOIN pg_enum e ON t.oid = e.enumtypid 
        WHERE t.typname = 'organ_type' AND e.enumlabel = 'intestine'
    ) THEN
        ALTER TYPE organ_type ADD VALUE 'intestine';
    END IF;
END $$;
