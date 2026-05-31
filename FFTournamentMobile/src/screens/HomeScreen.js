import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <LinearGradient
          colors={['#3b82f6', '#8b5cf6']}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>FF Tournament</Text>
          <Text style={styles.headerSubtitle}>Compete. Win. Dominate.</Text>
        </LinearGradient>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="trophy" size={32} color="#f59e0b" />
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Tournaments</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="wallet" size={32} color="#10b981" />
            <Text style={styles.statValue}>৳1,950</Text>
            <Text style={styles.statLabel}>Balance</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="people" size={32} color="#3b82f6" />
            <Text style={styles.statValue}>48</Text>
            <Text style={styles.statLabel}>Players</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Tournaments</Text>
          <TouchableOpacity style={styles.tournamentCard}>
            <View style={styles.tournamentHeader}>
              <Text style={styles.tournamentName}>FF Pro League Season 1</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>FEATURED</Text>
              </View>
            </View>
            <Text style={styles.tournamentInfo}>SQUAD • ৳100 Entry • ৳10,000 Prize</Text>
            <View style={styles.tournamentFooter}>
              <Text style={styles.tournamentStatus}>UPCOMING</Text>
              <Text style={styles.tournamentDate}>Feb 1, 2024</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <Ionicons name="game-controller" size={28} color="#3b82f6" />
              <Text style={styles.actionLabel}>Join Match</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Ionicons name="cash" size={28} color="#10b981" />
              <Text style={styles.actionLabel}>Deposit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Ionicons name="people" size={28} color="#8b5cf6" />
              <Text style={styles.actionLabel}>My Team</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Ionicons name="leaderboard" size={28} color="#f59e0b" />
              <Text style={styles.actionLabel}>Rankings</Text>
            </TouchableOpacity>
          </View>
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
    padding: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    marginTop: -32,
  },
  statCard: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: '30%',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  tournamentCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  tournamentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tournamentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  badge: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
  },
  tournamentInfo: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 8,
  },
  tournamentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tournamentStatus: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: 'bold',
  },
  tournamentDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
  },
  actionLabel: {
    fontSize: 12,
    color: '#fff',
    marginTop: 8,
    fontWeight: '500',
  },
});
