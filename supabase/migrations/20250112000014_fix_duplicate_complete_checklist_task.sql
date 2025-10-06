-- Fix duplicate complete_checklist_task function
-- Drop the old 2-parameter version to resolve "function is not unique" error

-- Drop old 2-parameter version
DROP FUNCTION IF EXISTS complete_checklist_task(UUID, VARCHAR(50));

-- The new 4-parameter version with defaults remains from 20250112000007_reliable_qr_completion.sql
-- complete_checklist_task(p_business_id UUID, p_task_id VARCHAR(50), p_method VARCHAR(100) DEFAULT 'unknown', p_triggered_by VARCHAR(100) DEFAULT 'database_trigger')
