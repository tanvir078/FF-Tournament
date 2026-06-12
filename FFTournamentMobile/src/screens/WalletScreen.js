import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import api from '../lib/api';
import { colors } from '../theme';
import { Badge, Card, Empty, SectionTitle } from '../components/ui';

export default function WalletScreen() {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [mode, setMode] = useState('deposit');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [walletResponse, transactionResponse] = await Promise.all([
      api.get('/wallet/user'),
      api.get('/wallet/transactions'),
    ]);
    setWallet(walletResponse.data);
    setTransactions(transactionResponse.data);
  }, []);

  useEffect(() => {
    load().catch(() => {});
  }, [load]);

  const refresh = async () => {
    setRefreshing(true);
    await load().catch(() => {});
    setRefreshing(false);
  };

  const submit = async () => {
    try {
      const endpoint = mode === 'deposit' ? '/wallet/deposit' : '/withdraw';
      const payload = mode === 'deposit'
        ? { amount: Number(amount), transactionId: reference || undefined }
        : { amount: Number(amount), method: 'bkash', mobileNumber };
      await api.post(endpoint, payload);
      setAmount('');
      setReference('');
      setMobileNumber('');
      await load();
      Alert.alert('Submitted', mode === 'deposit' ? 'Deposit is pending verification' : 'Withdrawal is pending approval');
    } catch (err) {
      Alert.alert('Unable to submit', err.response?.data?.message || 'Try again');
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
    >
      <Text style={styles.balance}>৳{Number(wallet?.totalBalance || 0).toFixed(2)}</Text>

      <View style={styles.switcher}>
        {['deposit', 'withdraw'].map((item) => (
          <Pressable key={item} style={[styles.switch, mode === item && styles.switchActive]} onPress={() => setMode(item)}>
            <Text style={[styles.switchText, mode === item && styles.switchTextActive]}>{item.toUpperCase()}</Text>
          </Pressable>
        ))}
      </View>

      <Card style={styles.form}>
        <TextInput
          keyboardType="decimal-pad"
          placeholder="Amount"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
        />
        {mode === 'deposit' ? (
          <TextInput
            placeholder="Transaction ID"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={reference}
            onChangeText={setReference}
          />
        ) : (
          <TextInput
            keyboardType="phone-pad"
            placeholder="bKash number"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={mobileNumber}
            onChangeText={setMobileNumber}
          />
        )}
        <Pressable style={styles.button} onPress={submit}>
          <Text style={styles.buttonText}>Submit</Text>
        </Pressable>
      </Card>

      <SectionTitle>Transactions</SectionTitle>
      {transactions.length ? transactions.map((transaction) => (
        <Card key={transaction.id} style={styles.transaction}>
          <View>
            <Text style={styles.transactionType}>{transaction.type}</Text>
            <Text style={styles.meta}>৳{transaction.amount}</Text>
          </View>
          <Badge tone={transaction.status === 'COMPLETED' ? 'success' : 'warning'}>{transaction.status}</Badge>
        </Card>
      )) : <Empty>No transaction</Empty>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { gap: 14, padding: 16, paddingBottom: 30 },
  balance: { color: colors.text, fontSize: 36, fontWeight: '900' },
  switcher: { flexDirection: 'row', gap: 8 },
  switch: { borderColor: colors.border, borderWidth: 1, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 8 },
  switchActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  switchText: { color: colors.muted, fontSize: 11, fontWeight: '800' },
  switchTextActive: { color: colors.background },
  form: { gap: 10 },
  input: { backgroundColor: colors.surfaceStrong, borderRadius: 6, color: colors.text, padding: 13 },
  button: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: 6, padding: 13 },
  buttonText: { color: colors.background, fontWeight: '900' },
  transaction: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  transactionType: { color: colors.text, fontWeight: '800' },
  meta: { color: colors.muted, fontSize: 12, marginTop: 4 },
});
