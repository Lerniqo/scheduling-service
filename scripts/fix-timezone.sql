-- Manual SQL script to fix timezone issues
-- Run this directly against the database

-- First, check what data exists
SELECT 'Checking scheduled_sessions table...' as status;
SELECT COUNT(*) as total_records FROM scheduled_sessions;
SELECT COUNT(*) as null_start_time FROM scheduled_sessions WHERE start_time IS NULL;
SELECT COUNT(*) as null_end_time FROM scheduled_sessions WHERE end_time IS NULL;

-- Delete any records with null timestamps (should be safe for development)
DELETE FROM scheduled_sessions WHERE start_time IS NULL OR end_time IS NULL;

-- Convert timestamp columns to timestamptz if they're not already
-- Check current column types
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'scheduled_sessions' 
AND column_name IN ('start_time', 'end_time');

-- Convert to timestamptz (this handles existing data properly)
DO $$
BEGIN
    -- Convert start_time if needed
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'scheduled_sessions' 
        AND column_name = 'start_time' 
        AND data_type = 'timestamp without time zone'
    ) THEN
        ALTER TABLE scheduled_sessions 
        ALTER COLUMN start_time TYPE timestamptz 
        USING start_time AT TIME ZONE 'UTC';
        RAISE NOTICE 'Converted start_time to timestamptz';
    ELSE
        RAISE NOTICE 'start_time is already timestamptz or does not exist';
    END IF;

    -- Convert end_time if needed  
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'scheduled_sessions' 
        AND column_name = 'end_time' 
        AND data_type = 'timestamp without time zone'
    ) THEN
        ALTER TABLE scheduled_sessions 
        ALTER COLUMN end_time TYPE timestamptz 
        USING end_time AT TIME ZONE 'UTC';
        RAISE NOTICE 'Converted end_time to timestamptz';
    ELSE
        RAISE NOTICE 'end_time is already timestamptz or does not exist';
    END IF;
END $$;

-- Also fix teacher_availability table
SELECT 'Checking teacher_availability table...' as status;
DO $$
BEGIN
    -- Convert start_time if needed
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'teacher_availability' 
        AND column_name = 'start_time' 
        AND data_type = 'timestamp without time zone'
    ) THEN
        ALTER TABLE teacher_availability 
        ALTER COLUMN start_time TYPE timestamptz 
        USING start_time AT TIME ZONE 'UTC';
        RAISE NOTICE 'Converted availability start_time to timestamptz';
    ELSE
        RAISE NOTICE 'availability start_time is already timestamptz or does not exist';
    END IF;

    -- Convert end_time if needed  
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'teacher_availability' 
        AND column_name = 'end_time' 
        AND data_type = 'timestamp without time zone'
    ) THEN
        ALTER TABLE teacher_availability 
        ALTER COLUMN end_time TYPE timestamptz 
        USING end_time AT TIME ZONE 'UTC';
        RAISE NOTICE 'Converted availability end_time to timestamptz';
    ELSE
        RAISE NOTICE 'availability end_time is already timestamptz or does not exist';
    END IF;
END $$;

-- Verify the changes
SELECT 'Final verification...' as status;
SELECT 'scheduled_sessions columns:' as table_name;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'scheduled_sessions' 
AND column_name IN ('start_time', 'end_time');

SELECT 'teacher_availability columns:' as table_name;  
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'teacher_availability' 
AND column_name IN ('start_time', 'end_time');

SELECT 'Migration completed successfully!' as status;