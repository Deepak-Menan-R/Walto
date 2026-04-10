import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { getCategorySummary } from '@/services/database';

export default function AnalyticsScreen() {
  const [categoryData, setCategoryData] = useState<any[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = await getCategorySummary();
      setCategoryData(data);
    } catch (error) {
      console.error('Load analytics error:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Spending by Category
      </Text>

      {categoryData.map((item) => (
        <Card key={item.category} style={styles.card}>
          <Card.Content>
            <View style={styles.row}>
              <View>
                <Text variant="titleMedium">{item.category}</Text>
                <Text variant="bodySmall">{item.count} transactions</Text>
              </View>
              <Text variant="titleLarge" style={styles.amount}>
                ₹{parseFloat(item.total).toFixed(2)}
              </Text>
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
    backgroundColor: '#f5f5f5',
  },
  title: {
    marginBottom: 16,
  },
  card: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amount: {
    fontWeight: 'bold',
    color: '#d32f2f',
  },
});
