-- ============================================================
-- Walto Database Schema for Supabase (PostgreSQL)
-- Run this in the Supabase SQL editor
-- ============================================================

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(15) UNIQUE NOT NULL,
  email VARCHAR(255),
  password_hash TEXT NOT NULL,
  plan VARCHAR(10) DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  type VARCHAR(10) CHECK (type IN ('debit', 'credit')) NOT NULL,
  merchant VARCHAR(255),
  category VARCHAR(50),
  date TIMESTAMP,
  mode VARCHAR(50),
  confidence DECIMAL(3,2),
  parse_status VARCHAR(20) DEFAULT 'regex_parsed'
    CHECK (parse_status IN ('regex_parsed', 'needs_llm', 'llm_parsed')),
  txn_id VARCHAR(100),
  account_last4 VARCHAR(4),
  balance_after DECIMAL(12,2),
  raw_sms TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT FALSE,
  is_ignored BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Prevent duplicate SMS per user
  UNIQUE(user_id, raw_sms)
);

-- Pending LLM queue (only for premium users whose regex fails)
CREATE TABLE IF NOT EXISTS pending_llm_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  raw_sms TEXT NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_merchant ON transactions(merchant);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date DESC);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_parse_status ON transactions(parse_status);
CREATE INDEX IF NOT EXISTS idx_pending_llm_queue_user_id ON pending_llm_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_pending_llm_queue_processed ON pending_llm_queue(processed);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- NOTE: In Supabase, paste this entire file into the SQL Editor and click Run
