import pool from '../config/database';
import { Transaction, ParsedTransaction } from '../types/transaction.types';
import { v4 as uuidv4 } from 'uuid';

export class TransactionService {
  // --- Save regex-parsed transactions ----------------------------------------
  async saveTransactions(
    transactions: ParsedTransaction[],
    userId: string,
    rawSMSList: string[]
  ): Promise<Transaction[]> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const saved: Transaction[] = [];

      for (let i = 0; i < transactions.length; i++) {
        const txn = transactions[i];
        const rawSMS = rawSMSList[i] || '';

        const result = await client.query(
          `INSERT INTO transactions
             (id, user_id, amount, currency, type, merchant, category, date, mode,
              confidence, parse_status, txn_id, account_last4, balance_after,
              raw_sms, is_edited, is_ignored)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
           ON CONFLICT (user_id, raw_sms) DO NOTHING
           RETURNING *`,
          [
            uuidv4(), userId,
            txn.amount, txn.currency, txn.type, txn.merchant, txn.category,
            txn.date, txn.mode, txn.confidence, txn.parse_status,
            txn.txn_id ?? null, txn.account_last4 ?? null,
            txn.balance_after ?? null, rawSMS, false, false,
          ]
        );

        if (result.rows.length > 0) saved.push(result.rows[0]);
      }

      await client.query('COMMIT');
      return saved;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // --- Add failed SMS to pending LLM queue (premium only) --------------------
  async addToPendingLLMQueue(userId: string, smsList: string[]): Promise<number> {
    if (!smsList.length) return 0;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      let count = 0;

      for (const sms of smsList) {
        const result = await client.query(
          `INSERT INTO pending_llm_queue (id, user_id, raw_sms)
           VALUES ($1, $2, $3)
           ON CONFLICT DO NOTHING
           RETURNING id`,
          [uuidv4(), userId, sms]
        );
        if (result.rows.length > 0) count++;
      }

      await client.query('COMMIT');
      return count;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // --- Fetch all pending LLM items for premium users -------------------------
  async getPendingLLMItems(): Promise<Array<{ id: string; user_id: string; raw_sms: string }>> {
    const result = await pool.query(
      `SELECT pq.id, pq.user_id, pq.raw_sms
       FROM pending_llm_queue pq
       JOIN users u ON u.id = pq.user_id
       WHERE pq.processed = false
         AND u.plan = 'premium'
       ORDER BY pq.created_at ASC
       LIMIT 500`
    );
    return result.rows;
  }

  // --- Mark queue items as processed -----------------------------------------
  async markLLMQueueProcessed(ids: string[]): Promise<void> {
    if (!ids.length) return;
    await pool.query(
      `UPDATE pending_llm_queue SET processed = true
       WHERE id = ANY($1::uuid[])`,
      [ids]
    );
  }

  // --- Save LLM-parsed transactions (upsert with updated parse_status) --------
  async saveLLMTransactions(
    transactions: ParsedTransaction[],
    userId: string,
    rawSMSList: string[]
  ): Promise<Transaction[]> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const saved: Transaction[] = [];

      for (let i = 0; i < transactions.length; i++) {
        const txn = transactions[i];
        const rawSMS = rawSMSList[i] || '';

        const result = await client.query(
          `INSERT INTO transactions
             (id, user_id, amount, currency, type, merchant, category, date, mode,
              confidence, parse_status, txn_id, account_last4, balance_after,
              raw_sms, is_edited, is_ignored)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'llm_parsed',$11,$12,$13,$14,false,false)
           ON CONFLICT (user_id, raw_sms)
             DO UPDATE SET
               amount       = EXCLUDED.amount,
               type         = EXCLUDED.type,
               merchant     = EXCLUDED.merchant,
               category     = EXCLUDED.category,
               mode         = EXCLUDED.mode,
               confidence   = EXCLUDED.confidence,
               parse_status = 'llm_parsed'
           RETURNING *`,
          [
            uuidv4(), userId,
            txn.amount, txn.currency, txn.type, txn.merchant, txn.category,
            txn.date, txn.mode, txn.confidence,
            txn.txn_id ?? null, txn.account_last4 ?? null,
            txn.balance_after ?? null, rawSMS,
          ]
        );

        if (result.rows.length > 0) saved.push(result.rows[0]);
      }

      await client.query('COMMIT');
      return saved;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // --- Get transactions for a user -------------------------------------------
  async getUserTransactions(
    userId: string,
    limit = 100,
    offset = 0
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

  // --- Monthly spending summary ----------------------------------------------
  async getMonthlySummary(userId: string, year: number, month: number) {
    const result = await pool.query(
      `SELECT category,
              SUM(amount) AS total,
              COUNT(*)    AS count
       FROM transactions
       WHERE user_id = $1
         AND type = 'debit'
         AND is_ignored = false
         AND EXTRACT(YEAR  FROM date) = $2
         AND EXTRACT(MONTH FROM date) = $3
       GROUP BY category
       ORDER BY total DESC`,
      [userId, year, month]
    );
    return result.rows;
  }

  // --- Update transaction ----------------------------------------------------
  async updateTransaction(
    transactionId: string,
    userId: string,
    updates: Partial<Transaction>
  ): Promise<Transaction> {
    const fields: string[] = [];
    const values: any[] = [];
    let p = 1;

    for (const [key, value] of Object.entries(updates)) {
      fields.push(`${key} = $${p++}`);
      values.push(value);
    }

    values.push(transactionId, userId);

    const result = await pool.query(
      `UPDATE transactions
       SET ${fields.join(', ')}, is_edited = true
       WHERE id = $${p} AND user_id = $${p + 1}
       RETURNING *`,
      values
    );
    return result.rows[0];
  }

  // --- Soft-delete transaction -----------------------------------------------
  async deleteTransaction(transactionId: string, userId: string): Promise<void> {
    await pool.query(
      'UPDATE transactions SET is_ignored = true WHERE id = $1 AND user_id = $2',
      [transactionId, userId]
    );
  }
}

export default new TransactionService();
