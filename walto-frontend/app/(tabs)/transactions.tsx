import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Card, Text, Chip } from 'react-native-paper';
import { useStore } from '@/store/useStore';
import { format } from 'date-fns';

export default function TransactionsScreen() {
  const { transactions } = useStore();

  const renderTransaction = ({ item }: { item: any }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.row}>
          <View style={styles.left}>
            <Text variant="titleMedium">{item.merchant}</Text>
            <Text variant="bodySmall" style={styles.date}>
              {format(new Date(item.date), 'MMM dd, yyyy HH:mm')}
            </Text>
            <Chip mode="outlined" style={styles.chip} compact>
              {item.category}
            </Chip>
          </View>
          <View style={styles.right}>
            <Text
              variant="titleLarge"
              style={item.type === 'debit' ? styles.debit : styles.credit}
            >
              {item.type === 'debit' ? '-' : '+'}₹{item.amount.toFixed(2)}
            </Text>
            <Text variant="bodySmall">{item.mode}</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  left: {
    flex: 1,
  },
  right: {
    alignItems: 'flex-end',
  },
  date: {
    marginTop: 4,
    opacity: 0.6,
  },
  chip: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  debit: {
    color: '#d32f2f',
  },
  credit: {
    color: '#388e3c',
  },
});
