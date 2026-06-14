-- Run this in your Supabase SQL Editor

-- 1. Create Programs Table
CREATE TABLE programs (
  id text PRIMARY KEY,
  name text,
  short_name text,
  location text,
  type text,
  color text,
  color_hex text,
  capacity integer,
  description text,
  phone_number text,
  staff_contact text
);

-- 2. Create Shift Sessions Table
CREATE TABLE shift_sessions (
  id text PRIMARY KEY,
  program_id text REFERENCES programs(id),
  shift text,
  date text,
  staff_id text,
  started_at timestamp with time zone DEFAULT now()
);

-- 3. Create Shift Tasks Table
CREATE TABLE shift_tasks (
  id text PRIMARY KEY,
  session_id text REFERENCES shift_sessions(id),
  program_id text REFERENCES programs(id),
  shift text,
  staff_id text,
  template_id text,
  title text,
  description text,
  start_time text,
  end_time text,
  status text,
  completed_at timestamp with time zone,
  completed_by text,
  comment text,
  alert_sent boolean DEFAULT false
);

-- 4. Create Alerts Table
CREATE TABLE alerts (
  id text PRIMARY KEY,
  program_id text REFERENCES programs(id),
  task_id text,
  task_title text,
  type text,
  message text,
  read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- 5. Enable Realtime
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table shift_tasks;
alter publication supabase_realtime add table alerts;
alter publication supabase_realtime add table shift_sessions;

-- 6. Insert initial mock programs (so foreign keys don't fail)
INSERT INTO programs (id, name, short_name, location, type, color, color_hex, capacity, description, phone_number, staff_contact)
VALUES 
('hudson', 'Hudson', 'HUD', 'Burnaby, BC', 'Residential Adult Services', 'purple', '#8b5cf6', 4, 'Shared living residential home.', '+1 (604) 555-0193', 'Emily Rogers'),
('orion', 'Orion', 'ORI', 'Surrey, BC', 'Youth Residential Services', 'orange', '#f97316', 3, 'Youth residential services.', '+1 (604) 555-0120', 'David Miller')
ON CONFLICT (id) DO NOTHING;
