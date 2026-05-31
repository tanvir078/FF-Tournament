import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const user = {
    name: 'Player Name',
    email: 'player@example.com',
    ign: 'ProPlayer123',
    uid: 'UID12345678',
    phone: '+8801700000000',
    totalMatches: 45,
    totalWins: 12,
    totalKills: 234,
    kdRatio: 5.2,
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={48} color="#9ca3af" />
            </View>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.totalMatches}</Text>
            <Text style={styles.statLabel}>Matches</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.totalWins}</Text>
            <Text style={styles.statLabel}>Wins</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.totalKills}</Text>
            <Text style={styles.statLabel}>Kills</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.kdRatio}</Text>
            <Text style={styles.statLabel}>K/D</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="person" size={20} color="#9ca3af" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Name</Text>
                <Text style={styles.infoValue}>{user.name}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="game-controller" size={20} color="#9ca3af" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>IGN</Text>
                <Text style={styles.infoValue}>{user.ign}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="id-card" size={20} color="#9ca3af" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>UID</Text>
                <Text style={styles.infoValue}>{user.uid}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="call" size={20} color="#9ca3af" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{user.phone}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="moon" size={20} color="#9ca3af" />
              <Text style={styles.settingText}>Dark Mode</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications" size={20} color="#9ca3af" />
              <Text style={styles.settingText}>Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="shield" size={20} color="#9ca3af" />
              <Text style={styles.settingText}>Privacy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="help-circle" size={20} color="#9ca3af" />
              <Text style={styles.settingText}>Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton}>
          <Ionicons name="log-out" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
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
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#9ca3af',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: '#fff',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginBottom: 24,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ef4444',
    marginLeft: 8,
  },
});
