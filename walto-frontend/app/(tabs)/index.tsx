import React, { useEffect, useState } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet, Alert } from 'react-native';
import { Card, Button, Text, Chip } from 'react-native-paper';
import { useStore } from '@/store/useStore';
import { transactionAPI } from '@/services/api';
import { requestSMSPermission, readFinancialSMS } from '@/services/sms';
import { format } from 'date-fns';

export default function DashboardScreen() {
  const { transactions, setTransactions, isLoading, setLoading, plan } = useStore();
  const [monthlySpend, setMonthlySpend] = useState(0);

  useEffect(() => {
    loadTransactions();
  }, []);

  // Load transactions from backend (Supabase via API)
  const loadTransactions = async () => {
    try {
      const response = await transactionAPI.getTransactions(100, 0);
      setTransactions(response.transactions);

      // Calculate this month's spend from the fetched data
      const now = new Date();
      const spend = response.transactions
        .filter((t) => {
          if (t.type !== 'debit') return false;
          const d = new Date(t.date);
          return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
        })
        .reduce((sum, t) => sum + t.amount, 0);

      setMonthlySpend(spend);
    } catch (error) {
      console.error('Load transactions error:', error);
    }
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

      // 2. Read all financial SMS from device
      const smsList = await readFinancialSMS();
      if (smsList.length === 0) {
        Alert.alert('No SMS Found', 'No financial SMS messages found on this device');
        return;
      }

      // 3. Send to backend – backend runs regex parse, queues LLM for premium
      const response = await transactionAPI.parseSMS(smsList);

      // 4. Reload from backend so UI reflects what's in Supabase
      await loadTransactions();

      const { stats } = response as any;
      const msg = [
        `Scanned: ${stats?.total_received ?? smsList.length}`,
        `Parsed: ${stats?.regex_parsed ?? response.transactions.length}`,
        plan === 'premium' && stats?.queued_for_llm
          ? `Queued for AI: ${stats.queued_for_llm}`
          : null,
      ]
        .filter(Boolean)
        .join('\n');

      Alert.alert('Sync Complete', msg);
    } catch (error: any) {
      console.error('Sync error:', error);
      Alert.alert('Sync Failed', error.message || 'Could not sync – check connection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadTransactions} />}
    >
      {/* Monthly spend card */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.headerRow}>
            <Text variant="titleMedium">This Month</Text>
            <Chip
              mode="flat"
              style={plan === 'premium' ? styles.premiumChip : styles.freeChip}
              textStyle={{ fontSize: 11 }}
            >
              {plan === 'premium' ? '⭐ Premium' : 'Free'}
            </Chip>
          </View>
          <Text variant="displaySmall" style={styles.amount}>
            ₹{monthlySpend.toFixed(2)}
          </Text>
          <Text variant="bodySmall" style={styles.date}>
            {format(new Date(), 'MMMM yyyy')}
          </Text>
        </Card.Content>
      </Card>

      {/* Plan info banner for free users */}
      {plan === 'free' && (
        <Card style={[styles.card, styles.infoBanner]}>
          <Card.Content>
            <Text variant="bodySmall" style={styles.infoText}>
              Free plan: transactions are parsed using smart regex rules.{'\n'}
              Upgrade to Premium for AI-powered parsing of complex messages.
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* Sync button */}
      <Card style={styles.card}>
        <Card.Actions>
          <Button mode="contained" onPress={syncSMS} loading={isLoading} icon="sync">
            Sync SMS
          </Button>
        </Card.Actions>
      </Card>

      {/* Transaction list */}
      <Text variant="titleMedium" style={styles.sectionTitle}>
        Recent Transactions
      </Text>

      {transactions.length === 0 ? (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="bodyMedium" style={{ textAlign: 'center', opacity: 0.5 }}>
              No transactions yet. Tap "Sync SMS" to import.
            </Text>
          </Card.Content>
        </Card>
      ) : (
        transactions.slice(0, 50).map((txn) => (
          <Card key={txn.id} style={styles.transactionCard}>
            <Card.Content>
              <View style={styles.transactionRow}>
                <View style={styles.transactionLeft}>
                  <Text variant="titleSmall">{txn.merchant}</Text>
                  <Text variant="bodySmall" style={styles.category}>
                    {txn.category} · {txn.mode}
                  </Text>
                </View>
                <View style={styles.transactionRight}>
                  <Text
                    variant="titleSmall"
                    style={txn.type === 'debit' ? styles.debit : styles.credit}
                  >
                    {txn.type === 'debit' ? '-' : '+'}₹{txn.amount.toFixed(2)}
                  </Text>
                  <Text variant="bodySmall" style={{ opacity: 0.5 }}>
                    {format(new Date(txn.date), 'MMM dd')}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  card: { marginBottom: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  amount: { marginTop: 8, fontWeight: 'bold', color: '#d32f2f' },
  date: { marginTop: 4, opacity: 0.6 },
  freeChip: { backgroundColor: '#e0e0e0' },
  premiumChip: { backgroundColor: '#fff9c4' },
  infoBanner: { backgroundColor: '#e3f2fd' },
  infoText: { color: '#1565c0', lineHeight: 18 },
  sectionTitle: { marginTop: 8, marginBottom: 8 },
  transactionCard: { marginBottom: 8 },
  transactionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  transactionLeft: { flex: 1 },
  transactionRight: { alignItems: 'flex-end' },
  category: { opacity: 0.55, marginTop: 2 },
  debit: { color: '#d32f2f', fontWeight: '600' },
  credit: { color: '#388e3c', fontWeight: '600' },
});


export default function DashboardScreen() {
  const { transactions, setTransactions, isLoading, setLoading } = useStore();
