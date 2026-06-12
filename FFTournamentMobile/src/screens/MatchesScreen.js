import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import api from '../lib/api';
import { colors } from '../theme';
import { Badge, Card, Empty } from '../components/ui';

export default function MatchesScreen({ navigation }) {
  const [matches, setMatches] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/matches/my-matches');
      setMatches(data);
    } catch {
      setMatches([]);
    }
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
      {matches.length ? matches.map((match) => (
        <Card key={match.id} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.title}>{match.name || `Match ${match.matchNumber}`}</Text>
            <Badge tone={match.status === 'IN_PROGRESS' ? 'danger' : 'warning'}>{match.status}</Badge>
          </View>
          <Text style={styles.meta}>{match.map}  |  {match.stage}</Text>
          {match.roomId ? <Text style={styles.room}>{match.tournament?.game?.lobbyLabels?.roomId || 'Room ID'}: {match.roomId}</Text> : null}
          {match.roomPassword && match.tournament?.game?.lobbyLabels?.password ? <Text style={styles.room}>{match.tournament.game.lobbyLabels.password}: {match.roomPassword}</Text> : null}
          {match.status === 'COMPLETED' ? <Pressable onPress={() => navigation.navigate('ResultClaim', { matchId: match.id, match })}><Text style={styles.room}>Submit result claim</Text></Pressable> : null}
        </Card>
      )) : <Empty>No match</Empty>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 30 },
  card: { gap: 8, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  title: { flex: 1, color: colors.text, fontWeight: '800' },
  meta: { color: colors.muted, fontSize: 12 },
  room: { color: colors.primary, fontWeight: '800' },
});
