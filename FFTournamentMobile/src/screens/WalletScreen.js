import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function WalletScreen() {
  const wallet = {
    mainWallet: 500,
    winningWallet: 1250,
    referralWallet: 200,
    totalBalance: 1950,
  };

  const transactions = [
    { id: '1', type: 'EARNING', amount: 150, description: 'Tournament Prize', date: 'May 28' },
    { id: '2', type: 'DEPOSIT', amount: 500, description: 'Deposit via bKash', date: 'May 27' },
    { id: '3', type: 'ENTRY_FEE', amount: -100, description: 'Tournament Entry', date: 'May 26' },
    { id: '4', type: 'REFERRAL', amount: 50, description: 'Referral Bonus', date: 'May 25' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Wallet</Text>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>৳{wallet.totalBalance}</Text>
        </View>

        <View style={styles.walletGrid}>
          <View style={styles.walletCard}>
            <Ionicons name="wallet" size={24} color="#3b82f6" />
            <Text style={styles.walletLabel}>Main Wallet</Text>
            <Text style={styles.walletAmount}>৳{wallet.mainWallet}</Text>
          </View>
          <View style={styles.walletCard}>
            <Ionicons name="trophy" size={24} color="#f59e0b" />
            <Text style={styles.walletLabel}>Winning Wallet</Text>
            <Text style={styles.walletAmount}>৳{wallet.winningWallet}</Text>
          </View>
          <View style={styles.walletCard}>
            <Ionicons name="gift" size={24} color="#8b5cf6" />
            <Text style={styles.walletLabel}>Referral Wallet</Text>
            <Text style={styles.walletAmount}>৳{wallet.referralWallet}</Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={[styles.actionButton, styles.depositButton]}>
            <Ionicons name="arrow-down" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Deposit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.withdrawButton]}>
            <Ionicons name="arrow-up" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Withdraw</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          {transactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionCard}>
              <View style={styles.transactionIcon}>
                <Ionicons
                  name={
                    transaction.type === 'DEPOSIT' ? 'arrow-down' :
                    transaction.type === 'WITHDRAW' ? 'arrow-up' :
                    transaction.type === 'EARNING' ? 'trophy' :
                    transaction.type === 'REFERRAL' ? 'gift' : 'wallet'
                  }
                  size={20}
                  color={
                    transaction.type === 'DEPOSIT' || transaction.type === 'EARNING' || transaction.type === 'REFERRAL'
                      ? '#10b981'
                      : '#ef4444'
                  }
                />
              </View>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionDescription}>{transaction.description}</Text>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
              </View>
              <Text style={[
                styles.transactionAmount,
                { color: transaction.amount > 0 ? '#10b981' : '#ef4444' }
              ]}>
                {transaction.amount > 0 ? '+' : ''}৳{transaction.amount}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  balanceCard: {
    backgroundColor: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    margin: 16,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  walletGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  walletCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '30%',
  },
  walletLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
  },
  walletAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 16,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  depositButton: {
    backgroundColor: '#10b981',
  },
  withdrawButton: {
    backgroundColor: '#3b82f6',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  section: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  transactionDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
