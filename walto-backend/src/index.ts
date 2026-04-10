import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import cron from 'node-cron';
import authRoutes from './routes/auth.routes';
import smsRoutes from './routes/sms.routes';
import { errorHandler } from './middleware/errorHandler.middleware';
import transactionService from './services/transaction.service';
import aiParserService from './services/aiParser.service';

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
app.get('/health', (_req, res) => {
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

// ─── Nightly LLM batch job (runs at 9 PM every day) ────────────────────────
// Only processes premium users' queued SMS
cron.schedule('0 21 * * *', async () => {
  console.log('[CRON] Starting nightly LLM batch processing...');
  try {
    const items = await transactionService.getPendingLLMItems();
    if (!items.length) {
      console.log('[CRON] No pending items.');
      return;
    }

    // Group by user
    const byUser = new Map<string, typeof items>();
    for (const item of items) {
      if (!byUser.has(item.user_id)) byUser.set(item.user_id, []);
      byUser.get(item.user_id)!.push(item);
    }

    const processedIds: string[] = [];

    for (const [userId, userItems] of byUser) {
      const smsList = userItems.map((i) => i.raw_sms);
      console.log(`[CRON] Processing ${smsList.length} SMS for user ${userId}`);

      try {
        const parsed = await aiParserService.parseSMSInBatches(smsList);
        await transactionService.saveLLMTransactions(parsed, userId, smsList);
        processedIds.push(...userItems.map((i) => i.id));
      } catch (err) {
        console.error(`[CRON] LLM processing failed for user ${userId}:`, err);
      }
    }

    if (processedIds.length) {
      await transactionService.markLLMQueueProcessed(processedIds);
    }

    console.log(`[CRON] Done. Processed ${processedIds.length} items.`);
  } catch (err) {
    console.error('[CRON] Batch job error:', err);
  }
}, {
  timezone: 'Asia/Kolkata',
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║  🚀 Server running on port ${PORT}     ║
║  📝 Environment: ${process.env.NODE_ENV || 'development'}       ║
║  🔗 Health: http://localhost:${PORT}/health ║
║  ⏰ LLM cron: daily at 9PM IST        ║
╚═══════════════════════════════════════╝
  `);
});

export default app;
