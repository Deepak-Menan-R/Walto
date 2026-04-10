# Walto - Complete Production Guide
## Financial Transaction Parser - Client + Backend Architecture

---

## 📋 Table of Contents
1. [System Architecture](#system-architecture)
2. [Technology Stack](#technology-stack)
3. [Project Setup](#project-setup)
4. [Backend Implementation](#backend-implementation)
5. [Frontend Implementation](#frontend-implementation)
6. [Database Schema](#database-schema)
7. [Deployment Guide](#deployment-guide)
8. [Testing & Development](#testing--development)
9. [Security & Best Practices](#security--best-practices)

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ANDROID APP (React Native/Expo)          │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ SMS Reader   │  │ Local Cache  │  │ UI Components│     │
│  │ (Expo)       │  │ (SQLite)     │  │ (Dashboard)  │     │
│  └──────┬───────┘  └──────▲───────┘  └──────────────┘     │
│         │                  │                                │
│         │                  │                                │
│  ┌──────▼──────────────────┴───────┐                       │
│  │      API Client Service          │                       │
│  │  (Handles HTTP requests)         │                       │
│  └──────────────┬───────────────────┘                       │
└─────────────────┼───────────────────────────────────────────┘
                  │
                  │ HTTPS (Secure)
                  │
┌─────────────────▼───────────────────────────────────────────┐
│              BACKEND SERVER (Node.js + Express)             │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │           API Layer (REST Endpoints)                │    │
│  │  /api/parse-sms  |  /api/transactions  |  /api/auth │    │
│  └────────────┬────────────────────────────────────────┘    │
│               │                                              │
│  ┌────────────▼────────────────────────────────────────┐    │
│  │              Business Logic Layer                    │    │
│  │  • Authentication  • Rate Limiting  • Validation    │    │
│  └────────────┬────────────────────────────────────────┘    │
│               │                                              │
│  ┌────────────▼────────────────────────────────────────┐    │
│  │           AI Parser Service                          │    │
│  │  (Calls OpenAI GPT API)                             │    │
│  └────────────┬────────────────────────────────────────┘    │
│               │                                              │
│  ┌────────────▼────────────────────────────────────────┐    │
│  │         Database Service (PostgreSQL)                │    │
│  │  • Users  • Transactions  • Analytics               │    │
│  └──────────────────────────────────────────────────────┘    │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       │ External API Call (HTTPS)
                       │
             ┌─────────▼──────────┐
             │   GPT-4 API        │
             │  (OpenAI Cloud)    │
             └────────────────────┘
```

---

## 💻 Technology Stack

### Frontend (Android App)
- **Framework**: React Native with Expo (SDK 50+)
- **Language**: TypeScript
- **State Management**: Zustand
- **Database**: expo-sqlite (local cache)
- **SMS Reading**: react-native-get-sms-android
- **UI Library**: React Native Paper
- **Charts**: react-native-chart-kit
- **HTTP Client**: fetch API

### Backend (Server)
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 15+
- **ORM**: node-postgres (pg)
- **Authentication**: JWT (jsonwebtoken)
- **AI Integration**: openai
- **Security**: helmet, cors, express-rate-limit

### DevOps & Deployment
- **Backend Hosting**: Railway.app / Render.com / AWS EC2
- **Database Hosting**: Railway PostgreSQL / Supabase / AWS RDS
- **Android Build**: EAS Build (Expo Application Services)
- **Version Control**: Git + GitHub

---

## 🚀 Project Setup

### Prerequisites
```bash
# Install Node.js (v18 or higher)
node --version  # Should be 18.0.0 or higher

# Install Expo CLI globally
npm install -g expo-cli eas-cli

# Install PostgreSQL
# For macOS: brew install postgresql
# For Ubuntu: sudo apt install postgresql postgresql-contrib
```

---

## 🖥️ BACKEND IMPLEMENTATION

### Step 1: Initialize Backend Project

```bash
# Create backend directory
mkdir walto-backend
cd walto-backend

# Initialize npm project
npm init -y

# Install dependencies
npm install express openai pg dotenv cors helmet express-rate-limit jsonwebtoken bcryptjs uuid

# Install dev dependencies
npm install -D typescript @types/express @types/node @types/pg @types/jsonwebtoken @types/bcryptjs ts-node nodemon

# Initialize TypeScript
npx tsc --init
```

### Step 2: Project Structure

Create this folder structure:

```
walto-backend/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   └── openai.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   └── sms.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── errorHandler.middleware.ts
│   │   └── validation.middleware.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   └── sms.routes.ts
│   ├── services/
│   │   ├── aiParser.service.ts
│   │   ├── transaction.service.ts
│   │   └── user.service.ts
│   ├── types/
│   │   └── transaction.types.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   └── helpers.ts
│   └── index.ts
├── .env
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

### Step 3: TypeScript Configuration (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### Step 4: Environment Variables (.env)

```bash
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/walto_db

# OpenAI API
OPENAI_API_KEY=sk-proj-your-key-here

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# CORS
ALLOWED_ORIGINS=http://localhost:8081,exp://192.168.1.100:8081

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

Create `.env.example` (for version control):

```bash
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://username:password@localhost:5432/walto_db
OPENAI_API_KEY=your_api_key_here
JWT_SECRET=your_jwt_secret_here
ALLOWED_ORIGINS=http://localhost:8081
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Step 5: Type Definitions (src/types/transaction.types.ts)

```typescript
export type TransactionType = 'debit' | 'credit';

export type TransactionCategory = 
  | 'Food & Dining'
  | 'Groceries'
  | 'Shopping'
  | 'Transport'
  | 'Bills & Utilities'
  | 'Entertainment'
  | 'Health & Fitness'
  | 'Travel'
  | 'Education'
  | 'Investments'
  | 'Others';

export type PaymentMode = 
  | 'UPI'
  | 'Debit Card'
  | 'Credit Card'
  | 'Net Banking'
  | 'Wallet'
  | 'NEFT'
  | 'IMPS'
  | 'RTGS'
  | 'Auto Debit'
  | 'Cash'
  | 'Unknown';

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  type: TransactionType;
  merchant: string;
  category: TransactionCategory;
  date: string;
  mode: PaymentMode;
  confidence: number;
  txn_id?: string;
  account_last4?: string;
  balance_after?: number;
  raw_sms: string;
  is_edited: boolean;
  is_ignored: boolean;
  created_at: string;
}

export interface ParsedTransaction {
  amount: number;
  currency: string;
  type: TransactionType;
  merchant: string;
  category: TransactionCategory;
  date: string;
  mode: PaymentMode;
  confidence: number;
  txn_id?: string;
  account_last4?: string;
  balance_after?: number;
}

export interface User {
  id: string;
  phone: string;
  email?: string;
  created_at: string;
}
```

### Step 6: Database Configuration (src/config/database.ts)

```typescript
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  console.log('✅ Database connected successfully');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
  process.exit(-1);
});

export default pool;
```

### Step 7: OpenAI Configuration (src/config/openai.ts)

```typescript
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables');
}

export const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const PARSER_SYSTEM_PROMPT = `You are a financial transaction parser for Indian SMS messages.

TASK: Extract structured transaction data from SMS.

RULES:
1. Only parse actual transactions (debit/credit/UPI/card payments)
2. Ignore: OTPs, promotional messages, balance checks without transactions
3. Return null for missing data - DO NOT guess
4. Clean merchant names (remove UPI-, PAYTM-, TXN- prefixes)
5. Normalize merchant names: "SWIGGY LTD" → "Swiggy"

EXTRACT THESE FIELDS:
- amount: number (no currency symbols)
- currency: "INR" (default for Indian transactions)
- type: "debit" | "credit"
- merchant: cleaned name
- category: choose from list below
- date: ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ), use current date if only time given
- mode: payment method
- txn_id: transaction reference if present
- account_last4: last 4 digits of card/account if mentioned
- balance_after: remaining balance if shown
- confidence: 0.0 to 1.0

CATEGORIES:
- Food & Dining: Swiggy, Zomato, restaurants, cafes, food delivery
- Groceries: BigBasket, Blinkit, DMart, Zepto, supermarkets
- Shopping: Amazon, Flipkart, Myntra, retail stores, online shopping
- Transport: Uber, Ola, Rapido, petrol, parking, tolls
- Bills & Utilities: electricity, water, gas, mobile recharge, broadband, DTH, rent
- Entertainment: Netflix, Spotify, Prime Video, movies, concerts, gaming
- Health & Fitness: hospitals, pharmacies, gym, health insurance, doctors
- Travel: flights, hotels, train/bus tickets, travel bookings
- Education: courses, books, tuition, online learning
- Investments: mutual funds, stocks, SIPs, trading
- Others: everything else

PAYMENT MODES:
UPI, Debit Card, Credit Card, Net Banking, Wallet, NEFT, IMPS, RTGS, Auto Debit, Cash, Unknown

SPECIAL CASES:
- Refunds: type="credit", merchant="Refund: [original merchant]"
- Paise amounts: "Rs.25000 Ps" = 250.00
- Remove UPI handles: @paytm, @ybl, @okaxis, @oksbi, @icicici
- Failed transactions: IGNORE (not a completed transaction)
- Multiple transactions in one SMS: split into separate entries

OUTPUT FORMAT:
Return ONLY a valid JSON array. No explanation, no markdown, no preamble.

Example:
[
  {
    "amount": 250.50,
    "currency": "INR",
    "type": "debit",
    "merchant": "Swiggy",
    "category": "Food & Dining",
    "date": "2024-01-15T14:30:00Z",
    "mode": "UPI",
    "txn_id": "UTR123456789",
    "account_last4": null,
    "balance_after": 15000.50,
    "confidence": 0.95
  }
]`;
```

### Step 8: AI Parser Service (src/services/aiParser.service.ts)

```typescript
import { openaiClient, PARSER_SYSTEM_PROMPT } from '../config/openai';
import { ParsedTransaction } from '../types/transaction.types';

export class AIParserService {
  /**
   * Parse SMS messages using GPT AI
   */
  async parseTransactions(smsBatch: string[]): Promise<ParsedTransaction[]> {
    try {
      const userPrompt = this.formatUserPrompt(smsBatch);

      const completion = await openaiClient.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: PARSER_SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 8192,
      });

      const responseText = completion.choices[0]?.message?.content || '[]';

      // Remove markdown code blocks if present
      const cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const parsed = JSON.parse(cleanedResponse);

      if (!Array.isArray(parsed)) {
        throw new Error('AI response is not an array');
      }

      return parsed;
    } catch (error) {
      console.error('AI parsing error:', error);
      throw new Error(\`Failed to parse SMS: \${error.message}\`);
    }
  }

  /**
   * Format user prompt for GPT
   */
  private formatUserPrompt(smsBatch: string[]): string {
    const formattedSMS = smsBatch
      .map((sms, index) => `[${index + 1}] ${sms}`)
      .join('\n');

    return `Parse these SMS messages:\n\n${formattedSMS}\n\nReturn only the JSON array.`;
  }

  /**
   * Parse SMS in batches to handle rate limits
   */
  async parseSMSInBatches(
    allSMS: string[],
    batchSize: number = 20
  ): Promise<ParsedTransaction[]> {
    const batches: string[][] = [];

    // Split into batches
    for (let i = 0; i < allSMS.length; i += batchSize) {
      batches.push(allSMS.slice(i, i + batchSize));
    }

    const results: ParsedTransaction[] = [];

    // Process each batch
    for (let i = 0; i < batches.length; i++) {
      console.log(`Processing batch ${i + 1}/${batches.length}`);

      const parsed = await this.parseTransactions(batches[i]);
      results.push(...parsed);

      // Add delay to avoid rate limiting (1 second between batches)
      if (i < batches.length - 1) {
        await this.sleep(1000);
      }
    }

    return results;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export default new AIParserService();
```

### Step 9: User Service (src/services/user.service.ts)

```typescript
import pool from '../config/database';
import { User } from '../types/transaction.types';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

export class UserService {
  /**
   * Create a new user
   */
  async createUser(phone: string, password: string, email?: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    const result = await pool.query(
      `INSERT INTO users (id, phone, email, password_hash) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, phone, email, created_at`,
      [userId, phone, email, hashedPassword]
    );

    return result.rows[0];
  }

  /**
   * Find user by phone
   */
  async findUserByPhone(phone: string): Promise<any> {
    const result = await pool.query(
      'SELECT * FROM users WHERE phone = $1',
      [phone]
    );
    return result.rows[0];
  }

  /**
   * Verify password
   */
  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Generate JWT token
   */
  generateToken(userId: string): string {
    return jwt.sign({ userId }, process.env.JWT_SECRET!, {
      expiresIn: '30d',
    });
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): { userId: string } {
    return jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
  }
}

export default new UserService();
```

### Step 10: Transaction Service (src/services/transaction.service.ts)

```typescript
import pool from '../config/database';
import { Transaction, ParsedTransaction } from '../types/transaction.types';
import { v4 as uuidv4 } from 'uuid';

export class TransactionService {
  /**
   * Save multiple transactions to database
   */
  async saveTransactions(
    transactions: ParsedTransaction[],
    userId: string,
    rawSMSList: string[]
  ): Promise<Transaction[]> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const savedTransactions: Transaction[] = [];

      for (let i = 0; i < transactions.length; i++) {
        const txn = transactions[i];
        const rawSMS = rawSMSList[i] || '';
        const txnId = uuidv4();

        const result = await client.query(
          `INSERT INTO transactions 
           (id, user_id, amount, currency, type, merchant, category, date, mode, 
            confidence, txn_id, account_last4, balance_after, raw_sms, is_edited, is_ignored)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
           ON CONFLICT (user_id, raw_sms) DO NOTHING
           RETURNING *`,
          [
            txnId,
            userId,
            txn.amount,
            txn.currency,
            txn.type,
            txn.merchant,
            txn.category,
            txn.date,
            txn.mode,
            txn.confidence,
            txn.txn_id || null,
            txn.account_last4 || null,
            txn.balance_after || null,
            rawSMS,
            false,
            false,
          ]
        );

        if (result.rows.length > 0) {
          savedTransactions.push(result.rows[0]);
        }
      }

      await client.query('COMMIT');
      return savedTransactions;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get all transactions for a user
   */
  async getUserTransactions(
    userId: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<Transaction[]> {
    const result = await pool.query(
      `SELECT * FROM transactions 
       WHERE user_id = $1 AND is_ignored = false 
       ORDER BY date DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    return result.rows;
  }

  /**
   * Get transactions by category
   */
  async getTransactionsByCategory(
    userId: string,
    category: string
  ): Promise<Transaction[]> {
    const result = await pool.query(
      `SELECT * FROM transactions 
       WHERE user_id = $1 AND category = $2 AND is_ignored = false 
       ORDER BY date DESC`,
      [userId, category]
    );

    return result.rows;
  }

  /**
   * Get monthly spending summary
   */
  async getMonthlySummary(userId: string, year: number, month: number) {
    const result = await pool.query(
      `SELECT 
         category,
         SUM(amount) as total,
         COUNT(*) as count
       FROM transactions
       WHERE user_id = $1 
         AND type = 'debit'
         AND is_ignored = false
         AND EXTRACT(YEAR FROM date) = $2
         AND EXTRACT(MONTH FROM date) = $3
       GROUP BY category
       ORDER BY total DESC`,
      [userId, year, month]
    );

    return result.rows;
  }

  /**
   * Update transaction
   */
  async updateTransaction(
    transactionId: string,
    userId: string,
    updates: Partial<Transaction>
  ): Promise<Transaction> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      fields.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }

    values.push(transactionId, userId);

    const result = await pool.query(
      `UPDATE transactions 
       SET ${fields.join(', ')}, is_edited = true
       WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
       RETURNING *`,
      values
    );

    return result.rows[0];
  }

  /**
   * Delete transaction (soft delete)
   */
  async deleteTransaction(transactionId: string, userId: string): Promise<void> {
    await pool.query(
      'UPDATE transactions SET is_ignored = true WHERE id = $1 AND user_id = $2',
      [transactionId, userId]
    );
  }
}

export default new TransactionService();
```

### Step 11: Authentication Middleware (src/middleware/auth.middleware.ts)

```typescript
import { Request, Response, NextFunction } from 'express';
import userService from '../services/user.service';

export interface AuthRequest extends Request {
  userId?: string;
}

export const authenticateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = userService.verifyToken(token);
      req.userId = decoded.userId;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Authentication failed' });
  }
};
```

### Step 12: Error Handler Middleware (src/middleware/errorHandler.middleware.ts)

```typescript
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  res.status(500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
  });
};
```

### Step 13: Auth Controller (src/controllers/auth.controller.ts)

```typescript
import { Request, Response } from 'express';
import userService from '../services/user.service';

export class AuthController {
  /**
   * Register new user
   */
  async register(req: Request, res: Response) {
    try {
      const { phone, password, email } = req.body;

      if (!phone || !password) {
        return res.status(400).json({ error: 'Phone and password required' });
      }

      // Check if user exists
      const existingUser = await userService.findUserByPhone(phone);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Create user
      const user = await userService.createUser(phone, password, email);
      const token = userService.generateToken(user.id);

      res.status(201).json({
        success: true,
        user: {
          id: user.id,
          phone: user.phone,
          email: user.email,
        },
        token,
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }

  /**
   * Login user
   */
  async login(req: Request, res: Response) {
    try {
      const { phone, password } = req.body;

      if (!phone || !password) {
        return res.status(400).json({ error: 'Phone and password required' });
      }

      // Find user
      const user = await userService.findUserByPhone(phone);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Verify password
      const isValid = await userService.verifyPassword(password, user.password_hash);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate token
      const token = userService.generateToken(user.id);

      res.json({
        success: true,
        user: {
          id: user.id,
          phone: user.phone,
          email: user.email,
        },
        token,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }
}

export default new AuthController();
```

### Step 14: SMS Controller (src/controllers/sms.controller.ts)

```typescript
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import aiParserService from '../services/aiParser.service';
import transactionService from '../services/transaction.service';

export class SMSController {
  /**
   * Parse SMS and save transactions
   */
  async parseSMS(req: AuthRequest, res: Response) {
    try {
      const { sms_messages } = req.body;
      const userId = req.userId!;

      // Validation
      if (!sms_messages || !Array.isArray(sms_messages)) {
        return res.status(400).json({ error: 'Invalid SMS data' });
      }

      if (sms_messages.length === 0) {
        return res.status(400).json({ error: 'No SMS messages provided' });
      }

      if (sms_messages.length > 100) {
        return res.status(400).json({ error: 'Maximum 100 SMS messages per request' });
      }

      // Parse with AI
      console.log(`Parsing ${sms_messages.length} SMS for user ${userId}`);
      const parsedTransactions = await aiParserService.parseSMSInBatches(sms_messages);

      // Save to database
      const savedTransactions = await transactionService.saveTransactions(
        parsedTransactions,
        userId,
        sms_messages
      );

      res.json({
        success: true,
        message: `Successfully parsed ${savedTransactions.length} transactions`,
        count: savedTransactions.length,
        transactions: savedTransactions,
      });
    } catch (error) {
      console.error('Parse SMS error:', error);
      res.status(500).json({ 
        error: 'Failed to parse SMS',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get user transactions
   */
  async getTransactions(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;

      const transactions = await transactionService.getUserTransactions(
        userId,
        limit,
        offset
      );

      res.json({
        success: true,
        count: transactions.length,
        transactions,
      });
    } catch (error) {
      console.error('Get transactions error:', error);
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  }

  /**
   * Get monthly summary
   */
  async getMonthlySummary(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;

      const summary = await transactionService.getMonthlySummary(userId, year, month);

      res.json({
        success: true,
        year,
        month,
        summary,
      });
    } catch (error) {
      console.error('Get summary error:', error);
      res.status(500).json({ error: 'Failed to fetch summary' });
    }
  }

  /**
   * Update transaction
   */
  async updateTransaction(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      const updates = req.body;

      const updated = await transactionService.updateTransaction(id, userId, updates);

      res.json({
        success: true,
        transaction: updated,
      });
    } catch (error) {
      console.error('Update transaction error:', error);
      res.status(500).json({ error: 'Failed to update transaction' });
    }
  }

  /**
   * Delete transaction
   */
  async deleteTransaction(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      await transactionService.deleteTransaction(id, userId);

      res.json({
        success: true,
        message: 'Transaction deleted',
      });
    } catch (error) {
      console.error('Delete transaction error:', error);
      res.status(500).json({ error: 'Failed to delete transaction' });
    }
  }
}

export default new SMSController();
```

### Step 15: Routes (src/routes/auth.routes.ts)

```typescript
import { Router } from 'express';
import authController from '../controllers/auth.controller';

const router = Router();

router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));

export default router;
```

### Step 16: Routes (src/routes/sms.routes.ts)

```typescript
import { Router } from 'express';
import smsController from '../controllers/sms.controller';
import { authenticateUser } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateUser);

router.post('/parse-sms', smsController.parseSMS.bind(smsController));
router.get('/transactions', smsController.getTransactions.bind(smsController));
router.get('/summary', smsController.getMonthlySummary.bind(smsController));
router.put('/transactions/:id', smsController.updateTransaction.bind(smsController));
router.delete('/transactions/:id', smsController.deleteTransaction.bind(smsController));

export default router;
```

### Step 17: Main Server (src/index.ts)

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import smsRoutes from './routes/sms.routes';
import { errorHandler } from './middleware/errorHandler.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later',
});

app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', smsRoutes);

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║  🚀 Server running on port ${PORT}     ║
║  📝 Environment: ${process.env.NODE_ENV}       ║
║  🔗 Health: http://localhost:${PORT}/health ║
╚═══════════════════════════════════════╝
  `);
});

export default app;
```

### Step 18: Package.json Scripts

```json
{
  "name": "walto-backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "db:setup": "node scripts/setup-database.js"
  }
}
```

---

## 📊 DATABASE SCHEMA

### Create Database Setup Script (scripts/setup-database.sql)

```sql
-- Create database
CREATE DATABASE transaction_parser_db;

-- Connect to database
\c transaction_parser_db;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(15) UNIQUE NOT NULL,
  email VARCHAR(255),
  password_hash TEXT NOT NULL,
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
  txn_id VARCHAR(100),
  account_last4 VARCHAR(4),
  balance_after DECIMAL(12,2),
  raw_sms TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT FALSE,
  is_ignored BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Prevent duplicate SMS
  UNIQUE(user_id, raw_sms)
);

-- Create indexes for performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date DESC);
CREATE INDEX idx_transactions_category ON transactions(category);
CREATE INDEX idx_transactions_merchant ON transactions(merchant);
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for monthly statistics
CREATE VIEW monthly_stats AS
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
GROUP BY user_id, year, month, type, category;

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO current_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO current_user;
```

### Run Database Setup

```bash
# Method 1: Using psql command
psql -U postgres -f scripts/setup-database.sql

# Method 2: Using pgAdmin
# Open pgAdmin → Create new database → Run the SQL script

# Method 3: Using command line
createdb walto_db
psql -d walto_db -f scripts/setup-database.sql
```

---

## 📱 FRONTEND IMPLEMENTATION

### Step 1: Initialize Expo Project

```bash
# Create new Expo project
npx create-expo-app@latest walto-frontend --template tabs

cd walto-frontend

# Install dependencies
npx expo install expo-sqlite react-native-paper
npm install @react-navigation/native zustand date-fns axios
npm install react-native-chart-kit react-native-svg
npm install react-native-get-sms-android

# Install dev dependencies
npm install -D @types/react @types/react-native
```

### Step 2: Project Structure

```
walto-frontend/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx           # Dashboard
│   │   ├── transactions.tsx    # Transaction list
│   │   ├── analytics.tsx       # Charts
│   │   └── settings.tsx        # Settings
│   ├── auth/
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── _layout.tsx
│   └── +not-found.tsx
├── components/
│   ├── TransactionCard.tsx
│   ├── CategoryChart.tsx
│   ├── MonthlySpendWidget.tsx
│   └── SMSPermissionModal.tsx
├── services/
│   ├── api.ts                  # Backend API calls
│   ├── sms.ts                  # SMS reading
│   ├── database.ts             # Local SQLite
│   └── auth.ts                 # Authentication
├── store/
│   └── useStore.ts             # Zustand state
├── types/
│   └── index.ts                # TypeScript types
├── utils/
│   ├── constants.ts
│   └── helpers.ts
├── .env
└── app.json
```

### Step 3: Environment Variables (.env)

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
# For production: https://your-backend.railway.app
```

### Step 4: Type Definitions (types/index.ts)

```typescript
export type TransactionType = 'debit' | 'credit';

export type TransactionCategory = 
  | 'Food & Dining'
  | 'Groceries'
  | 'Shopping'
  | 'Transport'
  | 'Bills & Utilities'
  | 'Entertainment'
  | 'Health & Fitness'
  | 'Travel'
  | 'Education'
  | 'Investments'
  | 'Others';

export type PaymentMode = 
  | 'UPI'
  | 'Debit Card'
  | 'Credit Card'
  | 'Net Banking'
  | 'Wallet'
  | 'NEFT'
  | 'IMPS'
  | 'RTGS'
  | 'Auto Debit'
  | 'Cash'
  | 'Unknown';

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  type: TransactionType;
  merchant: string;
  category: TransactionCategory;
  date: string;
  mode: PaymentMode;
  confidence: number;
  txn_id?: string;
  account_last4?: string;
  balance_after?: number;
  raw_sms: string;
  is_edited: boolean;
  is_ignored: boolean;
  created_at: string;
}

export interface User {
  id: string;
  phone: string;
  email?: string;
  token: string;
}
```

### Step 5: API Service (services/api.ts)

```typescript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from '../types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: async (phone: string, password: string, email?: string) => {
    const response = await api.post('/api/auth/register', { phone, password, email });
    return response.data;
  },

  login: async (phone: string, password: string) => {
    const response = await api.post('/api/auth/login', { phone, password });
    return response.data;
  },
};

export const transactionAPI = {
  parseSMS: async (smsMessages: string[]): Promise<{ transactions: Transaction[] }> => {
    const response = await api.post('/api/parse-sms', {
      sms_messages: smsMessages,
    });
    return response.data;
  },

  getTransactions: async (limit = 100, offset = 0): Promise<{ transactions: Transaction[] }> => {
    const response = await api.get('/api/transactions', {
      params: { limit, offset },
    });
    return response.data;
  },

  getMonthlySummary: async (year: number, month: number) => {
    const response = await api.get('/api/summary', {
      params: { year, month },
    });
    return response.data;
  },

  updateTransaction: async (id: string, updates: Partial<Transaction>) => {
    const response = await api.put(`/api/transactions/${id}`, updates);
    return response.data;
  },

  deleteTransaction: async (id: string) => {
    const response = await api.delete(`/api/transactions/${id}`);
    return response.data;
  },
};

export default api;
```

### Step 6: SMS Reader Service (services/sms.ts)

```typescript
import { PermissionsAndroid, Platform } from 'react-native';
import SmsAndroid from 'react-native-get-sms-android';

// Known financial SMS senders in India
const BANK_SENDERS = [
  'HDFCBK', 'ICICIB', 'SBIIN', 'AXISNB', 'KOTAKB', 'PNBSMS',
  'SCBANK', 'YESBNK', 'BOBTXN', 'UNBANK', 'IDBIB', 'FEDBK',
  'PAYTM', 'GPAY', 'PHONEPE', 'AMAZONP', 'WALLET'
];

export const requestSMSPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return false;
  }

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_SMS,
      {
        title: 'SMS Permission',
        message: 'This app needs access to your SMS to parse financial transactions',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
      }
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (error) {
    console.error('Permission error:', error);
    return false;
  }
};

export const readFinancialSMS = async (): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    if (Platform.OS !== 'android') {
      reject(new Error('SMS reading only available on Android'));
      return;
    }

    const filter = {
      box: 'inbox',
      maxCount: 500, // Read last 500 messages
    };

    SmsAndroid.list(
      JSON.stringify(filter),
      (fail) => {
        console.error('Failed to read SMS:', fail);
        reject(fail);
      },
      (count, smsList) => {
        const messages = JSON.parse(smsList);
        
        // Filter only financial SMS
        const financialSMS = messages
          .filter((sms: any) => {
            const address = sms.address?.toUpperCase() || '';
            return BANK_SENDERS.some(sender => address.includes(sender));
          })
          .map((sms: any) => sms.body);

        resolve(financialSMS);
      }
    );
  });
};
```

### Step 7: Local Database Service (services/database.ts)

```typescript
import * as SQLite from 'expo-sqlite';
import { Transaction } from '../types';

const db = SQLite.openDatabase('transactions.db');

export const initDatabase = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(`
          CREATE TABLE IF NOT EXISTS transactions (
            id TEXT PRIMARY KEY,
            amount REAL NOT NULL,
            currency TEXT DEFAULT 'INR',
            type TEXT CHECK(type IN ('debit', 'credit')),
            merchant TEXT,
            category TEXT,
            date TEXT,
            mode TEXT,
            confidence REAL,
            txn_id TEXT,
            account_last4 TEXT,
            balance_after REAL,
            raw_sms TEXT,
            is_edited INTEGER DEFAULT 0,
            is_ignored INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            synced INTEGER DEFAULT 0
          )
        `);

        tx.executeSql(`
          CREATE INDEX IF NOT EXISTS idx_date ON transactions(date DESC)
        `);

        tx.executeSql(`
          CREATE INDEX IF NOT EXISTS idx_category ON transactions(category)
        `);
      },
      (error) => reject(error),
      () => resolve()
    );
  });
};

export const saveTransactions = (transactions: Transaction[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        transactions.forEach((txn) => {
          tx.executeSql(
            `INSERT OR REPLACE INTO transactions 
             (id, amount, currency, type, merchant, category, date, mode, confidence,
              txn_id, account_last4, balance_after, raw_sms, is_edited, is_ignored, created_at, synced)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              txn.id,
              txn.amount,
              txn.currency,
              txn.type,
              txn.merchant,
              txn.category,
              txn.date,
              txn.mode,
              txn.confidence,
              txn.txn_id || null,
              txn.account_last4 || null,
              txn.balance_after || null,
              txn.raw_sms,
              txn.is_edited ? 1 : 0,
              txn.is_ignored ? 1 : 0,
              txn.created_at,
              1, // Mark as synced from server
            ]
          );
        });
      },
      (error) => reject(error),
      () => resolve()
    );
  });
};

export const getAllTransactions = (): Promise<Transaction[]> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM transactions WHERE is_ignored = 0 ORDER BY date DESC',
        [],
        (_, { rows }) => {
          const transactions = rows._array.map((row) => ({
            ...row,
            is_edited: row.is_edited === 1,
            is_ignored: row.is_ignored === 1,
          }));
          resolve(transactions);
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const getMonthlyTotal = (year: number, month: number): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT SUM(amount) as total FROM transactions 
         WHERE type = 'debit' 
         AND is_ignored = 0
         AND strftime('%Y', date) = ?
         AND strftime('%m', date) = ?`,
        [year.toString(), month.toString().padStart(2, '0')],
        (_, { rows }) => {
          resolve(rows._array[0]?.total || 0);
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const getCategorySummary = (): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT category, SUM(amount) as total, COUNT(*) as count
         FROM transactions
         WHERE type = 'debit' AND is_ignored = 0
         GROUP BY category
         ORDER BY total DESC`,
        [],
        (_, { rows }) => resolve(rows._array),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};
```

### Step 8: Auth Service (services/auth.ts)

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from './api';

export const login = async (phone: string, password: string) => {
  const response = await authAPI.login(phone, password);
  await AsyncStorage.setItem('authToken', response.token);
  await AsyncStorage.setItem('user', JSON.stringify(response.user));
  return response;
};

export const register = async (phone: string, password: string, email?: string) => {
  const response = await authAPI.register(phone, password, email);
  await AsyncStorage.setItem('authToken', response.token);
  await AsyncStorage.setItem('user', JSON.stringify(response.user));
  return response;
};

export const logout = async () => {
  await AsyncStorage.removeItem('authToken');
  await AsyncStorage.removeItem('user');
};

export const getStoredUser = async () => {
  const userStr = await AsyncStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const isAuthenticated = async () => {
  const token = await AsyncStorage.getItem('authToken');
  return !!token;
};
```

### Step 9: Zustand Store (store/useStore.ts)

```typescript
import { create } from 'zustand';
import { Transaction, User } from '../types';

interface AppState {
  user: User | null;
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;

  setUser: (user: User | null) => void;
  setTransactions: (transactions: Transaction[]) => void;
  addTransactions: (transactions: Transaction[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  transactions: [],
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),
  setTransactions: (transactions) => set({ transactions }),
  addTransactions: (newTransactions) =>
    set((state) => ({
      transactions: [...newTransactions, ...state.transactions],
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
```

### Step 10: Dashboard Screen (app/(tabs)/index.tsx)

```typescript
import React, { useEffect, useState } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet, Alert } from 'react-native';
import { Card, Button, Text, ActivityIndicator } from 'react-native-paper';
import { useStore } from '@/store/useStore';
import { transactionAPI } from '@/services/api';
import { requestSMSPermission, readFinancialSMS } from '@/services/sms';
import { getAllTransactions, getMonthlyTotal, initDatabase, saveTransactions } from '@/services/database';
import { format } from 'date-fns';

export default function DashboardScreen() {
  const { transactions, setTransactions, isLoading, setLoading } = useStore();
  const [monthlySpend, setMonthlySpend] = useState(0);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    await initDatabase();
    await loadLocalData();
  };

  const loadLocalData = async () => {
    const txns = await getAllTransactions();
    setTransactions(txns);

    const now = new Date();
    const total = await getMonthlyTotal(now.getFullYear(), now.getMonth() + 1);
    setMonthlySpend(total);
  };

  const syncSMS = async () => {
    setLoading(true);
    try {
      // 1. Request SMS permission
      const hasPermission = await requestSMSPermission();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'SMS permission is required to sync transactions');
        return;
      }

      // 2. Read financial SMS
      const smsList = await readFinancialSMS();
      
      if (smsList.length === 0) {
        Alert.alert('No SMS Found', 'No financial SMS messages found');
        return;
      }

      // 3. Send to backend for parsing
      const response = await transactionAPI.parseSMS(smsList);

      // 4. Save to local database
      await saveTransactions(response.transactions);

      // 5. Reload data
      await loadLocalData();

      Alert.alert('Success', `Synced ${response.transactions.length} transactions`);
    } catch (error) {
      console.error('Sync error:', error);
      Alert.alert('Error', 'Failed to sync transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={loadLocalData} />
      }
    >
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">Total Spent This Month</Text>
          <Text variant="displaySmall" style={styles.amount}>
            ₹{monthlySpend.toFixed(2)}
          </Text>
          <Text variant="bodySmall" style={styles.date}>
            {format(new Date(), 'MMMM yyyy')}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">Quick Actions</Text>
        </Card.Content>
        <Card.Actions>
          <Button mode="contained" onPress={syncSMS} loading={isLoading}>
            Sync SMS
          </Button>
        </Card.Actions>
      </Card>

      <Text variant="titleMedium" style={styles.sectionTitle}>
        Recent Transactions
      </Text>

      {transactions.slice(0, 10).map((txn) => (
        <Card key={txn.id} style={styles.transactionCard}>
          <Card.Content>
            <View style={styles.transactionRow}>
              <View style={styles.transactionLeft}>
                <Text variant="titleMedium">{txn.merchant}</Text>
                <Text variant="bodySmall">{txn.category}</Text>
              </View>
              <View style={styles.transactionRight}>
                <Text
                  variant="titleMedium"
                  style={txn.type === 'debit' ? styles.debit : styles.credit}
                >
                  {txn.type === 'debit' ? '-' : '+'}₹{txn.amount.toFixed(2)}
                </Text>
                <Text variant="bodySmall">
                  {format(new Date(txn.date), 'MMM dd')}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  amount: {
    marginTop: 8,
    fontWeight: 'bold',
    color: '#d32f2f',
  },
  date: {
    marginTop: 4,
    opacity: 0.6,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  transactionCard: {
    marginBottom: 8,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  transactionLeft: {
    flex: 1,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  debit: {
    color: '#d32f2f',
  },
  credit: {
    color: '#388e3c',
  },
});
```

### Step 11: Login Screen (app/auth/login.tsx)

```typescript
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, Card } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { login } from '@/services/auth';
import { useStore } from '@/store/useStore';

export default function LoginScreen() {
  const router = useRouter();
  const { setUser, setLoading, isLoading } = useStore();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!phone || !password) {
      setError('Please enter phone and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await login(phone, password);
      setUser(response.user);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineMedium" style={styles.title}>
            Login
          </Text>

          <TextInput
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            mode="outlined"
            style={styles.input}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button mode="contained" onPress={handleLogin} loading={isLoading} style={styles.button}>
            Login
          </Button>

          <Button mode="text" onPress={() => router.push('/auth/register')}>
            Don't have an account? Register
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    padding: 16,
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  error: {
    color: '#d32f2f',
    marginBottom: 8,
  },
});
```

### Step 12: App Configuration (app.json)

```json
{
  "expo": {
    "name": "Walto",
    "slug": "walto",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "android": {
      "package": "com.yourname.transactionparser",
      "permissions": [
        "READ_SMS",
        "RECEIVE_SMS"
      ],
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    },
    "plugins": [
      "expo-sqlite",
      "expo-router"
    ]
  }
}
```

---

## 🚀 DEPLOYMENT GUIDE

### Backend Deployment (Railway.app)

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Initialize project
railway init

# 4. Add PostgreSQL
railway add --database postgresql

# 5. Set environment variables
railway variables set OPENAI_API_KEY=your-key-here
railway variables set JWT_SECRET=your-secret-here
railway variables set NODE_ENV=production

# 6. Deploy
railway up

# 7. Run database migrations
railway run node scripts/setup-database.js
```

### Frontend Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build APK for testing
eas build --platform android --profile preview

# Build for production
eas build --platform android --profile production
```

---

## 🧪 TESTING & DEVELOPMENT

### Test Backend Locally

```bash
# Start PostgreSQL
brew services start postgresql  # macOS
sudo service postgresql start   # Ubuntu

# Create database
createdb walto_db
psql -d walto_db -f scripts/setup-database.sql

# Start backend
cd walto-backend
npm run dev
```

### Test Frontend Locally

```bash
cd walto-frontend
npx expo start

# Press 'a' to open on Android emulator
# Or scan QR code with Expo Go app
```

### Test API Endpoints

```bash
# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210", "password": "test123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210", "password": "test123"}'

# Parse SMS (replace TOKEN)
curl -X POST http://localhost:3000/api/parse-sms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"sms_messages": ["Rs.250 debited via UPI to SWIGGY"]}'
```

---

## 🔐 SECURITY & BEST PRACTICES

### Security Checklist

- ✅ API keys stored in environment variables (never in code)
- ✅ JWT tokens for authentication
- ✅ HTTPS only in production
- ✅ Rate limiting enabled
- ✅ SQL injection prevention (parameterized queries)
- ✅ Password hashing with bcrypt
- ✅ CORS configured
- ✅ Input validation
- ✅ Error messages don't leak sensitive info

### Production Checklist

- [ ] Update `ALLOWED_ORIGINS` in backend `.env`
- [ ] Change `JWT_SECRET` to strong random value
- [ ] Enable SSL for database connection
- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Configure backup for PostgreSQL
- [ ] Add analytics (Mixpanel, Amplitude)
- [ ] Implement proper logging
- [ ] Add Crashlytics for mobile app
- [ ] Set up CI/CD pipeline
- [ ] Add unit and integration tests

---

## 📊 Cost Breakdown

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| Railway (Backend + DB) | $5 credit | $10-20/month |
| OpenAI GPT API | $5 free credit | $20-40/month |
| Expo EAS Build | 30 builds/month | $29/month |
| **Total** | **~$35/month** | **$60-90/month** |

---

## 📞 Support & Troubleshooting

### Common Issues

**Issue 1**: SMS not reading
```bash
# Check permissions in AndroidManifest.xml
# Verify react-native-get-sms-android is installed correctly
npm install react-native-get-sms-android
npx expo prebuild
```

**Issue 2**: Backend connection fails
```bash
# Check API URL in .env
# Verify backend is running: curl http://localhost:3000/health
# Check network - use computer's IP, not localhost
```

**Issue 3**: Database errors
```bash
# Reset database
psql -d walto_db -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
psql -d walto_db -f scripts/setup-database.sql
```

---

## 🎉 You're All Set!

Copy this entire document and paste it to GitHub Copilot with this prompt:

**"Build the complete Walto application following the architecture and code exactly as specified. Start with the backend, then frontend. Ask me if anything is unclear."**

---

**Document Version**: 2.0  
**Last Updated**: 2024  
**Author**: AI Assistant  
**License**: MIT