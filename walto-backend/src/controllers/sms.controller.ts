import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { parseSMSBatch } from '../services/smsParser.service';
import aiParserService from '../services/aiParser.service';
import transactionService from '../services/transaction.service';
import userService from '../services/user.service';

export class SMSController {
  /**
   * POST /api/parse-sms
   *
   * Flow:
   *  1. Run regex parser on every SMS
   *  2. Save regex-parsed results to DB immediately
   *  3. For failures:
   *     - Free users  → discard (regex only)
   *     - Premium users → queue for nightly LLM batch
   */
  async parseSMS(req: AuthRequest, res: Response) {
    try {
      const { sms_messages } = req.body;
      const userId = req.userId!;

      if (!sms_messages || !Array.isArray(sms_messages)) {
        return res.status(400).json({ error: 'sms_messages must be an array' });
      }

      if (sms_messages.length === 0) {
        return res.status(400).json({ error: 'No SMS messages provided' });
      }

      if (sms_messages.length > 200) {
        return res.status(400).json({ error: 'Maximum 200 SMS messages per request' });
      }

      // ── Step 1: Regex parse ─────────────────────────────────────────────────
      const { parsed, failed } = parseSMSBatch(sms_messages);

      // ── Step 2: Save regex-parsed transactions ──────────────────────────────
      const savedTransactions = await transactionService.saveTransactions(
        parsed.map((p) => p.transaction),
        userId,
        parsed.map((p) => p.sms)
      );

      // ── Step 3: Handle failures based on plan ───────────────────────────────
      let queued = 0;
      const plan = await userService.getUserPlan(userId);

      if (plan === 'premium' && failed.length > 0) {
        queued = await transactionService.addToPendingLLMQueue(userId, failed);
      }

      res.json({
        success: true,
        plan,
        stats: {
          total_received: sms_messages.length,
          regex_parsed:   parsed.length,
          failed:         failed.length,
          queued_for_llm: queued,
        },
        transactions: savedTransactions,
      });
    } catch (error: any) {
      console.error('parseSMS error:', error);
      res.status(500).json({
        error: 'Failed to parse SMS',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  /**
   * GET /api/transactions
   */
  async getTransactions(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const limit  = parseInt(req.query.limit  as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;

      const transactions = await transactionService.getUserTransactions(userId, limit, offset);

      res.json({ success: true, count: transactions.length, transactions });
    } catch (error) {
      console.error('getTransactions error:', error);
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  }

  /**
   * GET /api/summary
   */
  async getMonthlySummary(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const year   = parseInt(req.query.year  as string) || new Date().getFullYear();
      const month  = parseInt(req.query.month as string) || new Date().getMonth() + 1;

      const summary = await transactionService.getMonthlySummary(userId, year, month);

      res.json({ success: true, year, month, summary });
    } catch (error) {
      console.error('getMonthlySummary error:', error);
      res.status(500).json({ error: 'Failed to fetch summary' });
    }
  }

  /**
   * PUT /api/transactions/:id
   */
  async updateTransaction(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      const updates = req.body;

      const updated = await transactionService.updateTransaction(id, userId, updates);
      res.json({ success: true, transaction: updated });
    } catch (error) {
      console.error('updateTransaction error:', error);
      res.status(500).json({ error: 'Failed to update transaction' });
    }
  }

  /**
   * DELETE /api/transactions/:id
   */
  async deleteTransaction(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      await transactionService.deleteTransaction(id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error('deleteTransaction error:', error);
      res.status(500).json({ error: 'Failed to delete transaction' });
    }
  }
}

export default new SMSController();

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
