const { Client } = require('pg');
require('dotenv').config();

async function setupDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        phone VARCHAR(15) UNIQUE NOT NULL,
        email VARCHAR(255),
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Users table created');

    // Create transactions table
    await client.query(`
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
        txn_id VARCHAR(100),
        account_last4 VARCHAR(4),
        balance_after DECIMAL(12,2),
        raw_sms TEXT NOT NULL,
        is_edited BOOLEAN DEFAULT FALSE,
        is_ignored BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, raw_sms)
      )
    `);
    console.log('✅ Transactions table created');

    // Create indexes
    await client.query('CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_transactions_merchant ON transactions(merchant)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date DESC)');
    console.log('✅ Indexes created');

    // Create trigger function
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);
    console.log('✅ Trigger function created');

    // Create triggers
    await client.query('DROP TRIGGER IF EXISTS update_users_updated_at ON users');
    await client.query(`
      CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `);

    await client.query('DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions');
    await client.query(`
      CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `);
    console.log('✅ Triggers created');

    // Create view
    await client.query(`
      CREATE OR REPLACE VIEW monthly_stats AS
      SELECT 
        user_id,
        EXTRACT(YEAR FROM date) as year,
        EXTRACT(MONTH FROM date) as month,
        type,
        category,
        COUNT(*) as transaction_count,
        SUM(amount) as total_amount,
        AVG(amount) as avg_amount
      FROM transactions
      WHERE is_ignored = false
      GROUP BY user_id, year, month, type, category
    `);
    console.log('✅ Views created');

    console.log('\n🎉 Database setup completed successfully!');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupDatabase();
