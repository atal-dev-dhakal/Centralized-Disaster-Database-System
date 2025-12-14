-- =============================================
-- Rehabilitation Cases Table
-- Tracks post-disaster recovery/rehabilitation needs
-- =============================================
CREATE TABLE IF NOT EXISTS rehab_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  damage_report_id UUID REFERENCES damage_reports(id) ON DELETE CASCADE,
  
  -- Needs checklist (stored as JSONB array)
  needs TEXT[] DEFAULT '{}',
  
  -- Priority: low, medium, high
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  
  -- Assigned organization/team
  assigned_org TEXT,
  
  -- Target completion date
  target_date DATE,
  
  -- Notes
  notes TEXT,
  
  -- Status: open, in_progress, completed
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed')),
  
  -- Location info (copied from damage report for convenience)
  location TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- Aid Distribution Logs Table
-- Tracks relief/aid delivered to locations
-- =============================================
CREATE TABLE IF NOT EXISTS aid_distribution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Can be linked to a rehab case (optional)
  rehab_case_id UUID REFERENCES rehab_cases(id) ON DELETE SET NULL,
  
  -- Item details
  item_type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit TEXT DEFAULT 'units',
  
  -- Delivery info
  delivered_by TEXT NOT NULL,
  delivered_to TEXT NOT NULL,
  
  -- Location
  location TEXT,
  ward TEXT,
  
  -- Proof photo (optional)
  proof_image_url TEXT,
  
  -- Notes
  notes TEXT,
  
  -- When
  delivered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- Enable RLS (Row Level Security)
-- =============================================
ALTER TABLE rehab_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE aid_distribution_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read
CREATE POLICY "Allow read rehab_cases" ON rehab_cases
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow read aid_distribution_logs" ON aid_distribution_logs
  FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to insert/update
CREATE POLICY "Allow insert rehab_cases" ON rehab_cases
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow update rehab_cases" ON rehab_cases
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow insert aid_distribution_logs" ON aid_distribution_logs
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow update aid_distribution_logs" ON aid_distribution_logs
  FOR UPDATE TO authenticated USING (true);

-- Create indexes for better query performance
CREATE INDEX idx_rehab_cases_status ON rehab_cases(status);
CREATE INDEX idx_rehab_cases_damage_report ON rehab_cases(damage_report_id);
CREATE INDEX idx_aid_logs_rehab_case ON aid_distribution_logs(rehab_case_id);
CREATE INDEX idx_aid_logs_delivered_at ON aid_distribution_logs(delivered_at);

