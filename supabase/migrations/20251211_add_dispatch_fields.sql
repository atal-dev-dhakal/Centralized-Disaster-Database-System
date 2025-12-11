-- Add dispatch tracking fields to damage_reports table
ALTER TABLE damage_reports 
ADD COLUMN IF NOT EXISTS dispatch_status TEXT DEFAULT 'pending' CHECK (dispatch_status IN ('pending', 'dispatched', 'in_progress', 'resolved')),
ADD COLUMN IF NOT EXISTS dispatched_team TEXT,
ADD COLUMN IF NOT EXISTS dispatch_note TEXT;

-- Add dispatch tracking fields to missing_persons table
ALTER TABLE missing_persons 
ADD COLUMN IF NOT EXISTS dispatch_status TEXT DEFAULT 'pending' CHECK (dispatch_status IN ('pending', 'dispatched', 'in_progress', 'resolved')),
ADD COLUMN IF NOT EXISTS dispatched_team TEXT,
ADD COLUMN IF NOT EXISTS dispatch_note TEXT;

-- Create index for faster filtering by dispatch status
CREATE INDEX IF NOT EXISTS idx_damage_reports_dispatch_status ON damage_reports(dispatch_status);
CREATE INDEX IF NOT EXISTS idx_missing_persons_dispatch_status ON missing_persons(dispatch_status);

-- Add comments for documentation
COMMENT ON COLUMN damage_reports.dispatch_status IS 'Status: pending, dispatched, in_progress, resolved';
COMMENT ON COLUMN damage_reports.dispatched_team IS 'Team ID: police, army, redCross, fireBrigade, medical, rescue, excavator, volunteers';
COMMENT ON COLUMN damage_reports.dispatch_note IS 'Optional notes for the dispatched team';

COMMENT ON COLUMN missing_persons.dispatch_status IS 'Status: pending, dispatched, in_progress, resolved';
COMMENT ON COLUMN missing_persons.dispatched_team IS 'Team ID: police, army, redCross, fireBrigade, medical, rescue, excavator, volunteers';
COMMENT ON COLUMN missing_persons.dispatch_note IS 'Optional notes for the dispatched team';

