import { openaiClient, PARSER_SYSTEM_PROMPT } from '../config/openai';
import { ParsedTransaction } from '../types/transaction.types';

export class AIParserService {
  /**
   * Parse SMS messages using GPT AI.
   * Sets parse_status = 'llm_parsed' on every result.
   */
  async parseTransactions(smsBatch: string[]): Promise<ParsedTransaction[]> {
    try {
      const completion = await openaiClient.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: PARSER_SYSTEM_PROMPT },
          { role: 'user', content: this.formatUserPrompt(smsBatch) },
        ],
        temperature: 0.1,
        max_tokens: 8192,
      });

      const responseText = completion.choices[0]?.message?.content || '[]';
      const cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const parsed = JSON.parse(cleanedResponse);
      if (!Array.isArray(parsed)) throw new Error('AI response is not an array');

      // Stamp parse_status on every item
      return parsed.map((txn: any) => ({
        ...txn,
        parse_status: 'llm_parsed' as const,
      }));
    } catch (error: any) {
      console.error('AI parsing error:', error);
      throw new Error(`Failed to parse SMS via LLM: ${error.message}`);
    }
  }

  private formatUserPrompt(smsBatch: string[]): string {
    const formatted = smsBatch.map((sms, i) => `[${i + 1}] ${sms}`).join('\n');
    return `Parse these SMS messages:\n\n${formatted}\n\nReturn only the JSON array.`;
  }

  /**
   * Parse SMS in batches of 20 to stay within token limits.
   */
  async parseSMSInBatches(
    allSMS: string[],
    batchSize = 20
  ): Promise<ParsedTransaction[]> {
    const batches: string[][] = [];
    for (let i = 0; i < allSMS.length; i += batchSize) {
      batches.push(allSMS.slice(i, i + batchSize));
    }

    const results: ParsedTransaction[] = [];
    for (let i = 0; i < batches.length; i++) {
      console.log(`[LLM] Processing batch ${i + 1}/${batches.length}`);
      const parsed = await this.parseTransactions(batches[i]);
      results.push(...parsed);
      if (i < batches.length - 1) await this.sleep(1000);
    }
    return results;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((res) => setTimeout(res, ms));
  }
}

export default new AIParserService();
