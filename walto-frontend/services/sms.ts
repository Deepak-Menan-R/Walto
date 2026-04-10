import { PermissionsAndroid, Platform } from 'react-native';
// @ts-ignore
import SmsAndroid from 'react-native-get-sms-android';

/**
 * Keywords that strongly indicate a financial SMS.
 * Filtering is keyword-based so we catch ALL banks + payment apps,
 * not just the hard-coded sender list.
 */
const FINANCIAL_KEYWORDS = [
  'upi', 'debited', 'credited', 'debit', 'credit', 'paid', 'payment',
  'transaction', 'transferred', 'neft', 'imps', 'rtgs', 'received',
  'withdrawn', 'charged', 'cashback', 'refund', 'rs.', 'rs ', 'inr',
  'a/c', 'account', 'balance',
];

export const requestSMSPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return false;

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_SMS,
      {
        title: 'SMS Permission',
        message:
          'Walto needs access to your SMS to detect and track financial transactions automatically.',
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
      reject(new Error('SMS reading is only available on Android'));
      return;
    }

    const filter = {
      box: 'inbox',
      maxCount: 500, // last 500 messages
    };

    SmsAndroid.list(
      JSON.stringify(filter),
      (fail: any) => {
        console.error('Failed to read SMS:', fail);
        reject(fail);
      },
      (_count: number, smsList: string) => {
        const messages: Array<{ body: string }> = JSON.parse(smsList);

        const financialSMS = messages
          .filter((sms) => {
            const lower = (sms.body || '').toLowerCase();
            return FINANCIAL_KEYWORDS.some((kw) => lower.includes(kw));
          })
          .map((sms) => sms.body);

        resolve(financialSMS);
      }
    );
  });
};
