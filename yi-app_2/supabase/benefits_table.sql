-- =====================================================
-- BENEFITS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('offer', 'partner')),
  code TEXT, -- For offers only
  logo_url TEXT,
  organization_name TEXT, -- For partners
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_benefits_type ON benefits(type);

-- =====================================================
-- RLS POLICIES
-- =====================================================
ALTER TABLE benefits ENABLE ROW LEVEL SECURITY;

-- Everyone can view benefits
CREATE POLICY "Benefits are viewable by everyone"
  ON benefits FOR SELECT
  USING (true);

-- Only admins can create/update/delete (add your admin check)
-- CREATE POLICY "Admins can manage benefits"
--   ON benefits FOR ALL
--   USING (auth.jwt() ->> 'role' = 'admin');

