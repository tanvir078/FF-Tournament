import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TournamentDetailsScreen({ route }) {
  const { tournament } = route.params || {};

  const tournamentData = tournament || {
    name: 'FF Pro League Season 1',
    description: 'The most competitive Free Fire tournament in the region. Join now to compete with the best players and win amazing prizes!',
    format: 'SQUAD',
    entryFee: 100,
    prizePool: 10000,
    perKillReward: 10,
    maxTeams: 64,
    registeredTeams: 48,
    status: 'UPCOMING',
    startDate: 'Feb 1, 2024',
    startTime: '20:00',
    registrationDeadline: 'Jan 30, 2024',
    rules: [
      'All players must join the room 15 minutes before match time',
      'No cheating or hacking allowed',
      'Team killing will result in disqualification',
      'Players must use their registered in-game names',
    ],
    maps: ['Bermuda', 'Purgatory', 'Kalahari'],
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{tournamentData.name}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{tournamentData.status}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tournament Info</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Ionicons name="game-controller" size={20} color="#3b82f6" />
              <Text style={styles.infoLabel}>Format</Text>
              <Text style={styles.infoValue}>{tournamentData.format}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="cash" size={20} color="#10b981" />
              <Text style={styles.infoLabel}>Entry Fee</Text>
              <Text style={styles.infoValue}>৳{tournamentData.entryFee}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="trophy" size={20} color="#f59e0b" />
              <Text style={styles.infoLabel}>Prize Pool</Text>
              <Text style={styles.infoValue}>৳{tournamentData.prizePool}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="target" size={20} color="#ef4444" />
              <Text style={styles.infoLabel}>Per Kill</Text>
              <Text style={styles.infoValue}>৳{tournamentData.perKillReward}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{tournamentData.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule</Text>
          <View style={styles.scheduleCard}>
            <View style={styles.scheduleRow}>
              <Ionicons name="calendar" size={20} color="#9ca3af" />
              <Text style={styles.scheduleLabel}>Start Date</Text>
              <Text style={styles.scheduleValue}>{tournamentData.startDate}</Text>
            </View>
            <View style={styles.scheduleRow}>
              <Ionicons name="time" size={20} color="#9ca3af" />
              <Text style={styles.scheduleLabel}>Start Time</Text>
              <Text style={styles.scheduleValue}>{tournamentData.startTime}</Text>
            </View>
            <View style={styles.scheduleRow}>
              <Ionicons name="alert-circle" size={20} color="#9ca3af" />
              <Text style={styles.scheduleLabel}>Registration Deadline</Text>
              <Text style={styles.scheduleValue}>{tournamentData.registrationDeadline}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rules</Text>
          {tournamentData.rules.map((rule, index) => (
            <View key={index} style={styles.ruleItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.ruleText}>{rule}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Maps</Text>
          <View style={styles.mapsContainer}>
            {tournamentData.maps.map((map, index) => (
              <View key={index} style={styles.mapBadge}>
                <Text style={styles.mapText}>{map}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.registrationInfo}>
            <Text style={styles.registrationText}>
              {tournamentData.registeredTeams}/{tournamentData.maxTeams} Teams Registered
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${(tournamentData.registeredTeams / tournamentData.maxTeams) * 100}%` }
                ]}
              />
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.joinButton}>
          <Text style={styles.joinButtonText}>Join Tournament</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f59e0b20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 2,
  },
  description: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 20,
  },
  scheduleCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  scheduleLabel: {
    fontSize: 14,
    color: '#9ca3af',
    marginLeft: 12,
    flex: 1,
  },
  scheduleValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  ruleText: {
    fontSize: 14,
    color: '#9ca3af',
    marginLeft: 8,
    flex: 1,
  },
  mapsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mapBadge: {
    backgroundColor: '#3b82f620',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  mapText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
  },
  registrationInfo: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
  },
  registrationText: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    margin: 16,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
