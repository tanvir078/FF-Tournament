import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api from '../lib/api';
import { colors } from '../theme';
import { Empty } from '../components/ui';
import { usePlatformStore } from '../store/platformStore';

const statusRails = [['ALL', 'All'], ['REGISTRATION_OPEN', 'Open'], ['UPCOMING', 'Upcoming'], ['ONGOING', 'Live'], ['COMPLETED', 'Done']];
const feeRails = [['ALL', 'Any fee'], ['FREE', 'Free'], ['PAID', 'Paid']];

export default function TournamentsScreen({ navigation }) {
  const brand = usePlatformStore((state) => state.settings);
  const [tournaments, setTournaments] = useState([]);
  const [games, setGames] = useState([]);
  const [status, setStatus] = useState('ALL');
  const [gameId, setGameId] = useState('ALL');
  const [fee, setFee] = useState('ALL');
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [tournamentResponse, gameResponse] = await Promise.all([api.get('/tournaments'), api.get('/games')]);
      setTournaments(tournamentResponse.data || []);
      setGames(gameResponse.data || []);
    } catch {
      setTournaments([]);
      setGames([]);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const visible = useMemo(() => tournaments.filter((item) => {
    const startsAt = item.startDate ? new Date(item.startDate) : null;
    const isFuture = startsAt ? startsAt.getTime() > Date.now() : true;
    const statusMatches = status === 'ALL' || (status === 'UPCOMING' ? ['REGISTRATION_OPEN', 'REGISTRATION_CLOSED'].includes(item.status) && isFuture : item.status === status);
    const gameMatches = gameId === 'ALL' || item.gameId === gameId;
    const feeMatches = fee === 'ALL' || (fee === 'FREE' ? item.isFree : !item.isFree);
    const nameMatches = (item.title || item.name || '').toLowerCase().includes(query.trim().toLowerCase());
    return statusMatches && gameMatches && feeMatches && nameMatches;
  }), [fee, gameId, query, status, tournaments]);

  const featured = visible.filter((item) => item.isFeatured).slice(0, 5);
  const openCount = tournaments.filter((item) => item.status === 'REGISTRATION_OPEN').length;
  const liveCount = tournaments.filter((item) => item.status === 'ONGOING').length;
  const totalPrize = tournaments.reduce((sum, item) => sum + Number(item.prizePool || 0), 0);
  const selectedGame = games.find((game) => game.id === gameId);
  const openTournament = (tournament) => navigation.navigate('TournamentDetails', { tournament });

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient colors={['#172554', '#111827', '#0b1018']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <Text style={styles.eyebrow}>{brand.brandName || 'ArenaHub'} competitions</Text>
        <Text style={styles.title}>Tournament rails</Text>
        <Text style={styles.subtitle}>Swipe games, status, and featured competitions. Tap a card to join from wallet.</Text>
        <View style={styles.metrics}>
          <Metric label="Open" value={openCount} />
          <Metric label="Live" value={liveCount} />
          <Metric label="Prize" value={`৳${compact(totalPrize)}`} />
        </View>
      </LinearGradient>

      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color={colors.muted} />
        <TextInput value={query} onChangeText={setQuery} placeholder="Search tournaments" placeholderTextColor={colors.muted} style={styles.searchInput} />
      </View>

      <Rail title="Games" action={selectedGame?.name || 'All games'}>
        {[{ id: 'ALL', name: 'All Games' }, ...games].map((game) => (
          <Pressable key={game.id} style={[styles.gamePill, gameId === game.id && styles.gamePillActive]} onPress={() => setGameId(game.id)}>
            {game.icon ? <Image source={{ uri: game.icon }} style={styles.gameIcon} /> : <Ionicons name="game-controller-outline" size={18} color={gameId === game.id ? colors.background : colors.primary} />}
            <Text style={[styles.pillText, gameId === game.id && styles.pillTextActive]} numberOfLines={1}>{game.name}</Text>
          </Pressable>
        ))}
      </Rail>

      <Rail title="Status tabs">
        {statusRails.map(([value, label]) => (
          <Pressable key={value} style={[styles.statusPill, status === value && styles.statusPillActive]} onPress={() => setStatus(value)}>
            <Text style={[styles.statusText, status === value && styles.statusTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </Rail>

      <View style={styles.feeRail}>
        {feeRails.map(([value, label]) => (
          <Pressable key={value} style={[styles.feePill, fee === value && styles.feePillActive]} onPress={() => setFee(value)}>
            <Text style={[styles.feeText, fee === value && styles.feeTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      {featured.length ? <Rail title="Featured" action={`${featured.length} hot`}>{featured.map((tournament) => <FeaturedCard key={tournament.id} tournament={tournament} onPress={() => openTournament(tournament)} />)}</Rail> : null}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>All tournaments</Text>
        <Text style={styles.sectionAction}>{visible.length} found</Text>
      </View>

      {visible.length ? visible.map((tournament) => <TournamentCard key={tournament.id} tournament={tournament} onPress={() => openTournament(tournament)} />) : <Empty>No tournament found</Empty>}
    </ScrollView>
  );
}

function Rail({ title, action, children }) {
  return <View style={styles.railBlock}><View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{title}</Text>{action ? <Text style={styles.sectionAction}>{action}</Text> : null}</View><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>{children}</ScrollView></View>;
}

function FeaturedCard({ tournament, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.featured}>
      {tournament.banner || tournament.game?.banner ? <Image source={{ uri: tournament.banner || tournament.game.banner }} style={styles.featuredImage} /> : null}
      <LinearGradient colors={['transparent', 'rgba(11,16,24,0.95)']} style={styles.featuredShade} />
      <View style={styles.featuredContent}>
        <Text style={styles.featuredGame}>{tournament.game?.name || 'ArenaHub'}</Text>
        <Text style={styles.featuredTitle} numberOfLines={2}>{tournament.title || tournament.name}</Text>
        <Text style={styles.featuredPrize}>৳{Number(tournament.prizePool || 0).toLocaleString()} prize</Text>
      </View>
    </Pressable>
  );
}

function TournamentCard({ tournament, onPress }) {
  const progress = tournament.maxTeams ? Math.min(100, (Number(tournament.registeredTeams || 0) / Number(tournament.maxTeams)) * 100) : 0;
  const live = tournament.status === 'ONGOING';
  const open = tournament.status === 'REGISTRATION_OPEN';
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardIcon}>
          {tournament.game?.icon ? <Image source={{ uri: tournament.game.icon }} style={styles.cardIconImage} /> : <Ionicons name="trophy-outline" size={20} color={colors.primary} />}
        </View>
        <View style={styles.cardHead}>
          <Text style={styles.cardGame}>{tournament.game?.name || 'Free Fire'} · {tournament.gameMode?.name || tournament.format}</Text>
          <Text style={styles.cardTitle} numberOfLines={2}>{tournament.title || tournament.name}</Text>
        </View>
        <View style={[styles.statusBadge, live ? styles.liveBadge : open ? styles.openBadge : styles.neutralBadge]}>
          <Text style={[styles.statusBadgeText, live ? styles.liveText : open ? styles.openText : styles.neutralText]}>{labelStatus(tournament.status)}</Text>
        </View>
      </View>
      <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress}%` }]} /></View>
      <View style={styles.cardStats}>
        <Stat icon="people-outline" label="Slots" value={`${tournament.registeredTeams || 0}/${tournament.maxTeams || '-'}`} />
        <Stat icon="wallet-outline" label="Entry" value={tournament.isFree ? 'Free' : `৳${tournament.entryFee}`} />
        <Stat icon="cash-outline" label="Prize" value={`৳${compact(Number(tournament.prizePool || 0))}`} />
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.startText}>{tournament.startDate ? new Date(tournament.startDate).toLocaleDateString() : 'Date TBA'} {tournament.startTime || ''}</Text>
        <View style={styles.cta}><Text style={styles.ctaText}>{open ? 'Join' : 'View'}</Text><Ionicons name="arrow-forward" size={14} color={colors.background} /></View>
      </View>
    </Pressable>
  );
}

function Metric({ label, value }) {
  return <View style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>;
}

function Stat({ icon, label, value }) {
  return <View style={styles.stat}><Ionicons name={icon} size={14} color={colors.muted} /><Text style={styles.statLabel}>{label}</Text><Text style={styles.statValue}>{value}</Text></View>;
}

function labelStatus(status) {
  if (status === 'REGISTRATION_OPEN') return 'Open';
  if (status === 'REGISTRATION_CLOSED') return 'Closed';
  if (status === 'ONGOING') return 'Live';
  if (status === 'COMPLETED') return 'Done';
  return status || 'Draft';
}

function compact(value) {
  if (value >= 100000) return `${Math.round(value / 1000)}k`;
  if (value >= 1000) return `${Math.round(value / 100) / 10}k`;
  return String(value || 0);
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 34 },
  hero: { borderRadius: 26, marginBottom: 18, overflow: 'hidden', padding: 18 },
  eyebrow: { color: colors.primary, fontSize: 11, fontWeight: '900', letterSpacing: 1.8, textTransform: 'uppercase' },
  title: { color: colors.text, fontSize: 31, fontWeight: '900', marginTop: 8 },
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 20, marginTop: 8 },
  metrics: { flexDirection: 'row', gap: 10, marginTop: 18 },
  metric: { backgroundColor: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.12)', borderRadius: 16, borderWidth: 1, flex: 1, padding: 11 },
  metricValue: { color: colors.text, fontSize: 18, fontWeight: '900', textAlign: 'center' },
  metricLabel: { color: colors.muted, fontSize: 10, fontWeight: '800', marginTop: 2, textAlign: 'center', textTransform: 'uppercase' },
  searchBox: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 16, borderWidth: 1, flexDirection: 'row', gap: 10, marginBottom: 16, paddingHorizontal: 13 },
  searchInput: { color: colors.text, flex: 1, fontSize: 14, paddingVertical: 13 },
  railBlock: { marginBottom: 16 },
  sectionHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: '900' },
  sectionAction: { color: colors.muted, fontSize: 12, fontWeight: '800' },
  rail: { gap: 10, paddingRight: 12 },
  gamePill: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 20, borderWidth: 1, flexDirection: 'row', gap: 8, maxWidth: 160, paddingHorizontal: 13, paddingVertical: 10 },
  gamePillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  gameIcon: { borderRadius: 9, height: 18, width: 18 },
  pillText: { color: colors.muted, fontSize: 12, fontWeight: '900' },
  pillTextActive: { color: colors.background },
  statusPill: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 999, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 10 },
  statusPillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  statusText: { color: colors.muted, fontSize: 12, fontWeight: '900' },
  statusTextActive: { color: colors.background },
  feeRail: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  feePill: { borderColor: colors.border, borderRadius: 12, borderWidth: 1, flex: 1, paddingVertical: 10 },
  feePillActive: { backgroundColor: colors.surfaceStrong, borderColor: colors.primary },
  feeText: { color: colors.muted, fontSize: 12, fontWeight: '900', textAlign: 'center' },
  feeTextActive: { color: colors.primary },
  featured: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 22, borderWidth: 1, height: 190, overflow: 'hidden', width: 270 },
  featuredImage: { height: '100%', opacity: 0.78, position: 'absolute', width: '100%' },
  featuredShade: { bottom: 0, height: '78%', left: 0, position: 'absolute', right: 0 },
  featuredContent: { flex: 1, justifyContent: 'flex-end', padding: 15 },
  featuredGame: { color: colors.primary, fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  featuredTitle: { color: colors.text, fontSize: 18, fontWeight: '900', marginTop: 5 },
  featuredPrize: { color: colors.success, fontSize: 13, fontWeight: '900', marginTop: 8 },
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 22, borderWidth: 1, marginBottom: 12, padding: 14 },
  cardTop: { alignItems: 'flex-start', flexDirection: 'row', gap: 10 },
  cardIcon: { alignItems: 'center', backgroundColor: colors.surfaceStrong, borderRadius: 14, height: 42, justifyContent: 'center', width: 42 },
  cardIconImage: { borderRadius: 14, height: 42, width: 42 },
  cardHead: { flex: 1 },
  cardGame: { color: colors.primary, fontSize: 11, fontWeight: '900' },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: '900', lineHeight: 21, marginTop: 3 },
  statusBadge: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 },
  liveBadge: { backgroundColor: `${colors.danger}20` },
  openBadge: { backgroundColor: `${colors.success}20` },
  neutralBadge: { backgroundColor: colors.surfaceStrong },
  statusBadgeText: { fontSize: 10, fontWeight: '900' },
  liveText: { color: colors.danger },
  openText: { color: colors.success },
  neutralText: { color: colors.muted },
  progressTrack: { backgroundColor: colors.surfaceStrong, borderRadius: 10, height: 7, marginTop: 14, overflow: 'hidden' },
  progressFill: { backgroundColor: colors.primary, borderRadius: 10, height: 7 },
  cardStats: { flexDirection: 'row', gap: 8, marginTop: 14 },
  stat: { backgroundColor: colors.surfaceStrong, borderRadius: 14, flex: 1, padding: 10 },
  statLabel: { color: colors.muted, fontSize: 10, fontWeight: '800', marginTop: 4 },
  statValue: { color: colors.text, fontSize: 12, fontWeight: '900', marginTop: 2 },
  cardFooter: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  startText: { color: colors.muted, flex: 1, fontSize: 12, fontWeight: '700' },
  cta: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: 999, flexDirection: 'row', gap: 4, paddingHorizontal: 12, paddingVertical: 7 },
  ctaText: { color: colors.background, fontSize: 12, fontWeight: '900' },
});
