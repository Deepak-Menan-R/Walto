# Walto Backend

Financial transaction parser backend using OpenAI GPT and PostgreSQL.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Setup Database
```bash
# Create PostgreSQL database
createdb walto_db

# Run setup script
psql -d walto_db -f scripts/setup-database.sql
```

### 4. Start Development Server
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Transactions
- `POST /api/parse-sms` - Parse SMS messages (requires auth)
- `GET /api/transactions` - Get user transactions (requires auth)
- `GET /api/summary` - Get monthly summary (requires auth)
- `PUT /api/transactions/:id` - Update transaction (requires auth)
- `DELETE /api/transactions/:id` - Delete transaction (requires auth)

## Testing

```bash
# Health check
curl http://localhost:3000/health

# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210", "password": "test123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210", "password": "test123"}'
```

## Deployment

See DEPLOYMENT.md for production deployment instructions.
