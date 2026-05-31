import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TournamentsScreen({ navigation }) {
  const tournaments = [
    {
      id: '1',
      name: 'FF Pro League Season 1',
      format: 'SQUAD',
      entryFee: 100,
      prizePool: 10000,
      status: 'UPCOMING',
      startDate: 'Feb 1, 2024',
      isFeatured: true,
    },
    {
      id: '2',
      name: 'Weekly Cup #24',
      format: 'DUO',
      entryFee: 50,
      prizePool: 2000,
      status: 'LIVE',
      startDate: 'Today',
      isFeatured: false,
    },
    {
      id: '3',
      name: 'Beginner Friendly',
      format: 'SOLO',
      entryFee: 0,
      prizePool: 500,
      status: 'UPCOMING',
      startDate: 'Feb 3, 2024',
      isFeatured: false,
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'LIVE': return '#ef4444';
      case 'UPCOMING': return '#f59e0b';
      case 'COMPLETED': return '#6b7280';
      default: return '#6b7280';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tournaments</Text>
        </View>

        <View style={styles.filterContainer}>
          <TouchableOpacity style={[styles.filterButton, styles.activeFilter]}>
            <Text style={styles.filterText}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>Live</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>Upcoming</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>Completed</Text>
          </TouchableOpacity>
        </View>

        {tournaments.map((tournament) => (
          <TouchableOpacity
            key={tournament.id}
            style={styles.tournamentCard}
            onPress={() => navigation.navigate('TournamentDetails', { tournament })}
          >
            <View style={styles.tournamentHeader}>
              <View style={styles.tournamentInfo}>
                {tournament.isFeatured && (
                  <View style={styles.featuredBadge}>
                    <Ionicons name="star" size={12} color="#f59e0b" />
                    <Text style={styles.featuredText}>FEATURED</Text>
                  </View>
                )}
                <Text style={styles.tournamentName}>{tournament.name}</Text>
                <Text style={styles.tournamentFormat}>{tournament.format}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(tournament.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(tournament.status) }]}>
                  {tournament.status}
                </Text>
              </View>
            </View>
            <View style={styles.tournamentDetails}>
              <View style={styles.detailItem}>
                <Ionicons name="cash" size={16} color="#10b981" />
                <Text style={styles.detailText}>Entry: ৳{tournament.entryFee}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="trophy" size={16} color="#f59e0b" />
                <Text style={styles.detailText}>Prize: ৳{tournament.prizePool}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="calendar" size={16} color="#3b82f6" />
                <Text style={styles.detailText}>{tournament.startDate}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1f2937',
  },
  activeFilter: {
    backgroundColor: '#3b82f6',
  },
  filterText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  tournamentCard: {
    backgroundColor: '#1f2937',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
  },
  tournamentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tournamentInfo: {
    flex: 1,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f59e0b20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  featuredText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  tournamentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  tournamentFormat: {
    fontSize: 12,
    color: '#9ca3af',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  tournamentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#374151',
    paddingTop: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
