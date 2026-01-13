-- Add reminder_interval column to tasks table (in minutes, NULL means no reminder)
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS reminder_interval INTEGER DEFAULT NULL;

-- Add a comment to explain the column
COMMENT ON COLUMN public.tasks.reminder_interval IS 'Reminder interval in minutes. NULL means no reminder, 0 means never.';