import { ParsedTransaction, TransactionCategory, PaymentMode, ParseStatus } from '../types/transaction.types';

// ─── Amount extraction ────────────────────────────────────────────────────────
// Matches: Rs.500, Rs 500, INR 500, INR500, ₹500, 500.00, 1,200.50
const AMOUNT_REGEX =
  /(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)/i;

// ─── Transaction type keywords ────────────────────────────────────────────────
const DEBIT_KEYWORDS = [
  'debited', 'debit', 'paid', 'payment', 'sent', 'transferred', 'spent',
  'purchase', 'withdrawn', 'withdrawal', 'charged',
];
const CREDIT_KEYWORDS = [
  'credited', 'credit', 'received', 'deposited', 'refund', 'cashback',
  'reversed',
];

// ─── Payment mode detection ───────────────────────────────────────────────────
const MODE_PATTERNS: Array<{ pattern: RegExp; mode: PaymentMode }> = [
  { pattern: /\bUPI\b/i, mode: 'UPI' },
  { pattern: /\bNEFT\b/i, mode: 'NEFT' },
  { pattern: /\bIMPS\b/i, mode: 'IMPS' },
  { pattern: /\bRTGS\b/i, mode: 'RTGS' },
  { pattern: /\bdebit\s*card\b/i, mode: 'Debit Card' },
  { pattern: /\bcredit\s*card\b/i, mode: 'Credit Card' },
  { pattern: /\bnet\s*banking\b/i, mode: 'Net Banking' },
  { pattern: /\bwallet\b/i, mode: 'Wallet' },
  { pattern: /\bauto\s*debit\b/i, mode: 'Auto Debit' },
];

// ─── Reference ID ─────────────────────────────────────────────────────────────
const REF_REGEX =
  /(?:Ref(?:erence)?(?:\s*(?:No|ID|#))?|UTR|UPI\s*Ref|txn(?:id)?)[:\s#]*([A-Z0-9]{6,25})/i;

// ─── Account last 4 digits ────────────────────────────────────────────────────
const ACCOUNT_REGEX =
  /(?:A\/c|account|acct)[^0-9]*(?:XX+|x+)(\d{4})/i;

// ─── Balance after ────────────────────────────────────────────────────────────
const BALANCE_REGEX =
  /(?:balance|Avl\s*Bal|Available\s*Balance)[:\s]*(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)/i;

// ─── Merchant extraction ──────────────────────────────────────────────────────
// Tries to extract merchant / payee name from common SMS patterns
const MERCHANT_PATTERNS: RegExp[] = [
  // "paid to Swiggy", "sent to PhonePe"
  /(?:paid|sent|transferred|payment)\s+to\s+([A-Za-z0-9 &.'_\-]+?)(?:\s+via|\s+for|\s+on|\s+at|\s+Ref|\.|\bUPI\b|$)/i,
  // "to VPA merchant@upi" – capture merchant before @
  /to\s+([A-Za-z0-9 &.'_\-]+?)@[a-z]+/i,
  // "at Swiggy" (POS / card)
  /at\s+([A-Za-z0-9 &.'_\-]{3,}?)(?:\s+on|\s+for|\.|$)/i,
];

// ─── Category rules ───────────────────────────────────────────────────────────
const CATEGORY_RULES: Array<{ keywords: string[]; category: TransactionCategory }> = [
  { keywords: ['swiggy', 'zomato', 'restaurant', 'food', 'cafe', 'hotel', 'dining', 'burger', 'pizza', 'kfc', 'mcdonalds', 'dominos'], category: 'Food & Dining' },
  { keywords: ['bigbasket', 'blinkit', 'grofers', 'dmart', 'zepto', 'grocery', 'supermarket', 'vegetables', 'fruits'], category: 'Groceries' },
  { keywords: ['amazon', 'flipkart', 'myntra', 'ajio', 'nykaa', 'shopping', 'store', 'mart', 'mall', 'retail'], category: 'Shopping' },
  { keywords: ['uber', 'ola', 'rapido', 'petrol', 'fuel', 'parking', 'toll', 'metro', 'bus', 'auto', 'cab', 'taxi', 'irctc', 'railway'], category: 'Transport' },
  { keywords: ['electricity', 'water', 'gas', 'mobile', 'recharge', 'broadband', 'dth', 'internet', 'bill', 'utility', 'airtel', 'jio', 'vi', 'vodafone', 'bsnl', 'rent'], category: 'Bills & Utilities' },
  { keywords: ['netflix', 'spotify', 'prime', 'hotstar', 'youtube', 'movie', 'cinema', 'multiplex', 'pvr', 'inox', 'game', 'gaming'], category: 'Entertainment' },
  { keywords: ['hospital', 'pharmacy', 'medical', 'doctor', 'clinic', 'health', 'gym', 'fitness', 'apollo', 'medplus'], category: 'Health & Fitness' },
  { keywords: ['flight', 'airline', 'makemytrip', 'goibibo', 'oyo', 'hotel booking', 'travel', 'holiday'], category: 'Travel' },
  { keywords: ['course', 'udemy', 'coursera', 'school', 'college', 'university', 'tuition', 'education', 'book'], category: 'Education' },
  { keywords: ['mutual fund', 'sip', 'zerodha', 'groww', 'upstox', 'stock', 'nse', 'bse', 'investment'], category: 'Investments' },
];

function inferCategory(merchant: string, rawSms: string): TransactionCategory {
  const text = `${merchant} ${rawSms}`.toLowerCase();

  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((kw) => text.includes(kw))) {
      return rule.category;
    }
  }
  return 'Others';
}

function extractAmount(sms: string): number | null {
  const match = sms.match(AMOUNT_REGEX);
  if (!match) return null;
  const num = parseFloat(match[1].replace(/,/g, ''));
  return isNaN(num) ? null : num;
}

function extractType(sms: string): 'debit' | 'credit' | null {
  const lower = sms.toLowerCase();

  if (CREDIT_KEYWORDS.some((kw) => lower.includes(kw))) return 'credit';
  if (DEBIT_KEYWORDS.some((kw) => lower.includes(kw))) return 'debit';
  return null;
}

function extractMode(sms: string): PaymentMode {
  for (const { pattern, mode } of MODE_PATTERNS) {
    if (pattern.test(sms)) return mode;
  }
  // If UPI handle present (@ybl, @okaxis etc.) it's UPI
  if (/@[a-z]+/.test(sms.toLowerCase())) return 'UPI';
  return 'Unknown';
}

function extractMerchant(sms: string): string {
  for (const pattern of MERCHANT_PATTERNS) {
    const match = sms.match(pattern);
    if (match && match[1]) {
      return match[1]
        .trim()
        .replace(/-/g, ' ')
        .replace(/\s+/g, ' ')
        .toLowerCase()
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    }
  }
  return 'Unknown';
}

function extractRefId(sms: string): string | null {
  const match = sms.match(REF_REGEX);
  return match ? match[1] : null;
}

function extractAccount(sms: string): string | null {
  const match = sms.match(ACCOUNT_REGEX);
  return match ? match[1] : null;
}

function extractBalance(sms: string): number | null {
  const match = sms.match(BALANCE_REGEX);
  if (!match) return null;
  const num = parseFloat(match[1].replace(/,/g, ''));
  return isNaN(num) ? null : num;
}

// ─── Financial SMS filter ─────────────────────────────────────────────────────
const FINANCIAL_KEYWORDS = [
  'upi', 'debited', 'credited', 'debit', 'credit', 'paid', 'payment',
  'transaction', 'transferred', 'neft', 'imps', 'rtgs', 'received',
  'withdrawn', 'charged', 'cashback', 'refund', 'rs.', 'rs ', 'inr',
];

export function isFinancialSMS(sms: string): boolean {
  const lower = sms.toLowerCase();
  return FINANCIAL_KEYWORDS.some((kw) => lower.includes(kw));
}

// ─── Core parse function ──────────────────────────────────────────────────────
export function parseSMSWithRegex(rawSms: string): ParsedTransaction | null {
  // Must be a financial SMS
  if (!isFinancialSMS(rawSms)) return null;

  const amount = extractAmount(rawSms);
  const type = extractType(rawSms);

  // Both amount and type are required
  if (!amount || !type) return null;

  const merchant = extractMerchant(rawSms);
  const mode = extractMode(rawSms);
  const txn_id = extractRefId(rawSms) ?? undefined;
  const account_last4 = extractAccount(rawSms) ?? undefined;
  const balance_after = extractBalance(rawSms) ?? undefined;
  const category = inferCategory(merchant, rawSms);

  return {
    amount,
    currency: 'INR',
    type,
    merchant,
    category,
    date: new Date().toISOString(),
    mode,
    confidence: 0.75,
    parse_status: 'regex_parsed' as ParseStatus,
    txn_id,
    account_last4,
    balance_after,
  };
}

// ─── Batch parse ──────────────────────────────────────────────────────────────
export interface SMSParseResult {
  parsed: Array<{ sms: string; transaction: ParsedTransaction }>;
  failed: string[]; // raw SMS that regex could not parse
}

export function parseSMSBatch(smsList: string[]): SMSParseResult {
  const result: SMSParseResult = { parsed: [], failed: [] };

  for (const sms of smsList) {
    const txn = parseSMSWithRegex(sms);
    if (txn) {
      result.parsed.push({ sms, transaction: txn });
    } else {
      result.failed.push(sms);
    }
  }

  return result;
}
