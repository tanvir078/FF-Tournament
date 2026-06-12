import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import api from '../lib/api';
import { colors } from '../theme';
import { Card, Empty, SectionTitle } from '../components/ui';

export default function TeamsScreen() {
  const [team, setTeam] = useState(null);
  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [ign, setIgn] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const [games, setGames] = useState([]);
  const [gameId, setGameId] = useState('');

  const load = useCallback(async () => {
    try {
      const [teamResponse, invitationResponse, gamesResponse] = await Promise.all([
        api.get('/teams/my-team'),
        api.get('/teams/invitations/mine'),
        api.get('/games'),
      ]);
      setTeam(teamResponse.data);
      setInvitations(invitationResponse.data || []);
      setGames(gamesResponse.data || []);
    } catch {
      setTeam(null);
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

  const create = async () => {
    try {
      await api.post('/teams', { name, tag, gameId });
      setName('');
      setTag('');
      await load();
    } catch (err) {
      Alert.alert('Unable to create team', err.response?.data?.message || 'Try again');
    }
  };

  const invite = async () => {
    try {
      await api.post(`/teams/${team.id}/invite`, { platformHandle: ign });
      setIgn('');
      await load();
    } catch (err) {
      Alert.alert('Unable to invite', err.response?.data?.message || 'Try again');
    }
  };

  const respond = async (id, status) => {
    await api.put(`/teams/invitations/${id}`, { status });
    await load();
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
    >
      {invitations.length ? <>
        <SectionTitle>Invitations</SectionTitle>
        {invitations.map((item) => <Card key={item.id} style={styles.player}><Text style={styles.playerName}>{item.team?.name}</Text><View style={styles.actions}><Button label="Accept" onPress={() => respond(item.id, 'ACCEPTED')} /><Button label="Reject" onPress={() => respond(item.id, 'REJECTED')} /></View></Card>)}
      </> : null}
      {!team ? (
        <>
          <SectionTitle>Create team</SectionTitle>
          <Card style={styles.form}>
            <ScrollView horizontal>{games.map((game) => <Pressable key={game.id} onPress={() => setGameId(game.id)} style={[styles.game, gameId === game.id && styles.gameActive]}><Text style={styles.playerName}>{game.name}</Text></Pressable>)}</ScrollView>
            <Field placeholder="Team name" value={name} onChangeText={setName} />
            <Field placeholder="Tag" value={tag} onChangeText={setTag} />
            <Button label="Create" onPress={create} />
          </Card>
        </>
      ) : (
        <>
          <View>
            <Text style={styles.title}>{team.name}</Text>
            <Text style={styles.meta}>{team.tag}</Text>
          </View>
          <SectionTitle>Players</SectionTitle>
          {team.memberships?.length ? team.memberships.map((membership) => (
            <Card key={membership.id} style={styles.player}>
              <Text style={styles.playerName}>{membership.user?.ign || membership.user?.name}</Text>
              <Text style={styles.meta}>{membership.status}</Text>
            </Card>
          )) : <Empty>No player</Empty>}
          <SectionTitle>Invite player</SectionTitle>
          <Card style={styles.form}>
            <Field placeholder="Platform handle" value={ign} onChangeText={setIgn} />
            <Button label="Invite" onPress={invite} />
          </Card>
        </>
      )}
    </ScrollView>
  );
}

function Field(props) {
  return <TextInput {...props} placeholderTextColor={colors.muted} style={styles.input} />;
}

function Button({ label, onPress }) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { gap: 14, padding: 16, paddingBottom: 30 },
  title: { color: colors.text, fontSize: 26, fontWeight: '900' },
  meta: { color: colors.muted, fontSize: 12, marginTop: 3 },
  form: { gap: 10 },
  input: { backgroundColor: colors.surfaceStrong, borderRadius: 6, color: colors.text, padding: 13 },
  button: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: 6, padding: 13 },
  buttonText: { color: colors.background, fontWeight: '900' },
  player: { marginBottom: 8 },
  playerName: { color: colors.text, fontWeight: '800' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  game: { borderColor: colors.border, borderWidth: 1, borderRadius: 6, padding: 10, marginRight: 8 },
  gameActive: { backgroundColor: colors.primary },
});
