-- Bliss Work Tool (현장 관리 시스템) - Supabase Database Schema

-- 1. Create Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  client_company TEXT,
  start_date TEXT,
  end_date TEXT,
  status TEXT,
  color TEXT,
  construction_team TEXT,
  team_count INTEGER DEFAULT 1,
  team_members TEXT,
  address TEXT,
  address_detail TEXT,
  access_code TEXT,
  building_access_code TEXT,
  unit_access_code TEXT,
  scope_summary TEXT,
  manager_name TEXT,
  manager_phone TEXT,
  site_measurement_form JSONB,
  measurement_checklist JSONB DEFAULT '[]'::jsonb,
  rough_drawing JSONB,
  official_blueprints JSONB DEFAULT '[]'::jsonb,
  order_checklist JSONB DEFAULT '[]'::jsonb,
  completion_photos JSONB DEFAULT '[]'::jsonb,
  estimates JSONB,
  defect_and_as JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies (Allow authenticated users full access to read, insert, update, delete)
DROP POLICY IF EXISTS "Allow authenticated full access to projects" ON public.projects;
CREATE POLICY "Allow authenticated full access to projects"
  ON public.projects
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Also allow anon read/write if users test without strict RLS gating
DROP POLICY IF EXISTS "Allow anon full access to projects" ON public.projects;
CREATE POLICY "Allow anon full access to projects"
  ON public.projects
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- 4. Enable Supabase Realtime for Projects Table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'projects'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
  END IF;
END $$;
