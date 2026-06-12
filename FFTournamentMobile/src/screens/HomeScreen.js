import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { colors } from '../theme';
import { Badge, Card, Empty, SectionTitle } from '../components/ui';
import { usePlatformStore } from '../store/platformStore';

export default function HomeScreen({ navigation }) {
  const user = useAuthStore((state) => state.user);
  const brandName = usePlatformStore((state) => state.settings.brandName);
  const [featured, setFeatured] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activities, setActivities] = useState([]);

  const load = useCallback(async () => {
    const [featuredResponse, walletResponse, profileResponse, inviteResponse, registrationResponse, claimResponse, notificationResponse] = await Promise.allSettled([
      api.get('/tournaments/featured'),
      api.get('/wallet/user'),
      api.get('/game-profiles/mine'),
      api.get('/teams/invitations/mine'),
      api.get('/tournaments/my-registrations'),
      api.get('/result-claims/mine'),
      api.get('/notifications'),
    ]);
    setFeatured(featuredResponse.status === 'fulfilled' ? featuredResponse.value.data : []);
    setWallet(walletResponse.status === 'fulfilled' ? walletResponse.value.data : null);
    const items = [];
    (profileResponse.status === 'fulfilled' ? profileResponse.value.data : []).filter((profile) => profile.verificationStatus !== 'VERIFIED').forEach((profile) => items.push({ id: `profile-${profile.id}`, title: 'Profile verification', detail: `${profile.game?.name || 'Game'} · ${profile.verificationStatus}` }));
    (inviteResponse.status === 'fulfilled' ? inviteResponse.value.data : []).forEach((invite) => items.push({ id: `invite-${invite.id}`, title: 'Team invitation', detail: invite.team?.name || 'Team invitation received' }));
    (registrationResponse.status === 'fulfilled' ? registrationResponse.value.data : []).filter((registration) => registration.checkInStatus === 'PENDING').forEach((registration) => items.push({ id: `checkin-${registration.id}`, title: 'Check-in required', detail: registration.title || registration.name }));
    (claimResponse.status === 'fulfilled' ? claimResponse.value.data : []).filter((claim) => claim.status === 'PENDING').forEach((claim) => items.push({ id: `claim-${claim.id}`, title: 'Reward review pending', detail: claim.tournament?.title || 'Result claim' }));
    (notificationResponse.status === 'fulfilled' ? notificationResponse.value.data : []).filter((notification) => !notification.isRead).forEach((notification) => items.push({ id: `notification-${notification.id}`, title: notification.title, detail: notification.message }));
    setActivities(items.slice(0, 5));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
    >
      <Text style={styles.brand}>{brandName}</Text>
      <Text style={styles.title}>{user?.ign || user?.name}</Text>
      <View style={styles.metrics}>
        <Metric icon="wallet-outline" label="Balance" value={`৳${Number(wallet?.totalBalance || 0).toFixed(0)}`} />
        <Metric icon="trophy-outline" label="Featured" value={featured.length} />
      </View>

      <SectionTitle>Quick actions</SectionTitle>
      <View style={styles.actions}>
        <Action icon="trophy-outline" label="Tournaments" onPress={() => navigation.navigate('Tournaments')} />
        <Action icon="wallet-outline" label="Wallet" onPress={() => navigation.navigate('Wallet')} />
        <Action icon="people-outline" label="Teams" onPress={() => navigation.navigate('Teams')} />
        <Action icon="game-controller-outline" label="Matches" onPress={() => navigation.navigate('Matches')} />
        <Action icon="notifications-outline" label="Notifications" onPress={() => navigation.navigate('Notifications')} />
        <Action icon="chatbubble-outline" label="Support" onPress={() => navigation.navigate('Support')} />
        <Action icon="person-add-outline" label="Game profiles" onPress={() => navigation.navigate('GameProfiles')} />
      </View>

      <SectionTitle>Featured tournaments</SectionTitle>
      {featured.length ? featured.map((tournament) => (
        <Pressable
          key={tournament.id}
          onPress={() => navigation.navigate('Tournaments', { screen: 'TournamentDetails', params: { tournament } })}
        >
          <Card style={styles.tournament}>
            <View style={styles.row}>
              <Text style={styles.cardTitle}>{tournament.title || tournament.name}</Text>
              <Badge tone="warning">{tournament.status}</Badge>
            </View>
            <Text style={styles.meta}>{tournament.game?.name || 'Free Fire'}  |  {tournament.format}  |  ৳{tournament.entryFee}  |  Prize ৳{tournament.prizePool}</Text>
          </Card>
        </Pressable>
      )) : <Empty>No featured tournament</Empty>}
      <SectionTitle>Activity</SectionTitle>
      {activities.length ? activities.map((activity) => <Card key={activity.id} style={styles.activity}><Text style={styles.cardTitle}>{activity.title}</Text><Text style={styles.meta}>{activity.detail}</Text></Card>) : <Empty>You are all caught up</Empty>}
    </ScrollView>
  );
}

function Metric({ icon, label, value }) {
  return (
    <Card style={styles.metric}>
      <Ionicons name={icon} size={22} color={colors.primary} />
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.meta}>{label}</Text>
    </Card>
  );
}

function Action({ icon, label, onPress }) {
  return (
    <Pressable style={styles.action} onPress={onPress}>
      <Ionicons name={icon} size={22} color={colors.primary} />
      <Text style={styles.actionText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { gap: 14, padding: 16, paddingBottom: 30 },
  title: { color: colors.text, fontSize: 26, fontWeight: '900' },
  brand: { color: colors.primary, fontSize: 12, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase' },
  metrics: { flexDirection: 'row', gap: 10 },
  metric: { flex: 1, gap: 6 },
  metricValue: { color: colors.text, fontSize: 22, fontWeight: '800' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  action: { width: '48%', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.surfaceStrong, borderRadius: 8, padding: 14 },
  actionText: { color: colors.text, fontWeight: '700' },
  tournament: { gap: 10, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  cardTitle: { flex: 1, color: colors.text, fontSize: 16, fontWeight: '800' },
  meta: { color: colors.muted, fontSize: 12 },
  activity: { gap: 5, marginBottom: 8 },
});
