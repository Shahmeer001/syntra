-- ================================================================
-- Syntra — Full Database Schema (All 6 Chunks)
-- Run once in Supabase SQL Editor
-- ================================================================
 
-- CHUNK 1: Workspaces
CREATE TABLE workspaces (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name          TEXT NOT NULL,
  description   TEXT DEFAULT '',
  industry      TEXT DEFAULT '',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
 
-- CHUNK 2: Agents
CREATE TABLE agents (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id  UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL,
  persona       TEXT DEFAULT '',
  color         TEXT DEFAULT '#7c3aed',
  icon          TEXT DEFAULT '🤖',
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
 
-- CHUNK 3: Tasks
CREATE TABLE tasks (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id     UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  assigned_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  title            TEXT NOT NULL,
  description      TEXT DEFAULT '',
  status           TEXT DEFAULT 'pending' CHECK (status IN ('pending','in_progress','done')),
  priority         TEXT DEFAULT 'Medium' CHECK (priority IN ('High','Medium','Low')),
  agent_output     JSONB DEFAULT '{}',
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);
 
-- CHUNK 4: Collaborations
CREATE TABLE collaborations (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id  UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  task_id       UUID REFERENCES tasks(id) ON DELETE CASCADE,
  messages      JSONB DEFAULT '[]',
  summary       TEXT DEFAULT '',
  status        TEXT DEFAULT 'pending' CHECK (status IN ('pending','running','done','failed')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
 
-- CHUNK 5: Meeting Room Messages
CREATE TABLE meeting_messages (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id  UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  agent_id      UUID REFERENCES agents(id) ON DELETE SET NULL,
  agent_name    TEXT DEFAULT '',
  agent_icon    TEXT DEFAULT '🤖',
  agent_color   TEXT DEFAULT '#7c3aed',
  content       TEXT NOT NULL,
  message_type  TEXT DEFAULT 'agent' CHECK (message_type IN ('agent','user','system')),
  session_id    TEXT DEFAULT '',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
 
-- CHUNK 6: Subscriptions
CREATE TABLE subscriptions (
  id                      UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id            UUID REFERENCES workspaces(id) ON DELETE CASCADE UNIQUE,
  plan                    TEXT DEFAULT 'free' CHECK (plan IN ('free','starter','pro')),
  stripe_customer_id      TEXT DEFAULT '',
  stripe_subscription_id  TEXT DEFAULT '',
  agent_limit             INTEGER DEFAULT 2,
  task_limit              INTEGER DEFAULT 10,
  is_active               BOOLEAN DEFAULT TRUE,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);
 
-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX idx_agents_workspace       ON agents(workspace_id);
CREATE INDEX idx_tasks_workspace        ON tasks(workspace_id);
CREATE INDEX idx_tasks_agent            ON tasks(assigned_agent_id);
CREATE INDEX idx_tasks_status           ON tasks(status);
CREATE INDEX idx_collaborations_task    ON collaborations(task_id);
CREATE INDEX idx_meeting_workspace      ON meeting_messages(workspace_id);
CREATE INDEX idx_meeting_session        ON meeting_messages(session_id);
CREATE INDEX idx_subscriptions_workspace ON subscriptions(workspace_id);
 
-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE workspaces       ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents           ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks            ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions    ENABLE ROW LEVEL SECURITY;
 
-- Open policies (add Supabase Auth in production)
CREATE POLICY "allow_all" ON workspaces       FOR ALL USING (true);
CREATE POLICY "allow_all" ON agents           FOR ALL USING (true);
CREATE POLICY "allow_all" ON tasks            FOR ALL USING (true);
CREATE POLICY "allow_all" ON collaborations   FOR ALL USING (true);
CREATE POLICY "allow_all" ON meeting_messages FOR ALL USING (true);
CREATE POLICY "allow_all" ON subscriptions    FOR ALL USING (true);