import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import api from '../lib/api';
import { colors } from '../theme';
import { Badge, Card, SectionTitle } from '../components/ui';
import { useAuthStore } from '../store/authStore';

export default function TournamentDetailsScreen({ route }) {
  const user = useAuthStore((state) => state.user);
  const [tournament, setTournament] = useState(route.params?.tournament);
  const [registered, setRegistered] = useState(false);
  const [registration, setRegistration] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [profileId, setProfileId] = useState('');
  const [joining, setJoining] = useState(false);
  const [ffUid, setFfUid] = useState('');
  const [team, setTeam] = useState(null);
  const [starters, setStarters] = useState([]);
  const [substitutes, setSubstitutes] = useState([]);

  useEffect(() => {
    if (!tournament?.id) return;
    api.get(`/tournaments/${tournament.id}`).then(({ data }) => {
      setTournament(data);
      return api.get('/teams/my-team', { params: data.gameId ? { gameId: data.gameId } : undefined });
    }).then(({ data }) => setTeam(data)).catch(() => setTeam(null));
    api.get(`/tournaments/${tournament.id}/registration-status`)
      .then(({ data }) => { setRegistered(data.isRegistered); setRegistration(data.registration); })
      .catch(() => {});
    api.get('/game-profiles/mine').then(({ data }) => {
      const relevant = (data || []).filter((profile) => !tournament.gameId || profile.gameId === tournament.gameId);
      setProfiles(relevant); if (relevant.length === 1) setProfileId(relevant[0].id);
    }).catch(() => {});
  }, [tournament?.id]);

  const rosterSize = Number(tournament?.gameMode?.rosterSize || (tournament?.format === 'SOLO' ? 1 : tournament?.format === 'DUO' ? 2 : 4));
  const substituteLimit = Number(tournament?.gameMode?.substituteLimit || 0);
  const roster = useMemo(() => {
    if (!team || !user) return [];
    return [{ id: user.id, label: user.platformHandle || user.ign || user.name }, ...(team.memberships || [])
      .filter((membership) => membership.status === 'ACCEPTED')
      .map((membership) => ({ id: membership.userId, label: membership.user?.platformHandle || membership.user?.ign || membership.user?.name }))];
  }, [team, user]);
  const toggleSelection = (id, role) => {
    if (role === 'starter') setStarters((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < rosterSize ? [...current, id] : current);
    else setSubstitutes((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < substituteLimit ? [...current, id] : current);
  };
  if (!tournament) return null;

  const join = async () => {
    setJoining(true);
    try {
      if (tournament.gameId && !profileId) return Alert.alert('Game profile required', 'Add and select your game profile before joining.');
      if (!tournament.gameId && !ffUid.trim()) return Alert.alert('UID required', 'Enter your player UID before joining.');
      if (rosterSize > 1 && starters.length !== rosterSize) return Alert.alert('Line-up required', `Select exactly ${rosterSize} starters.`);
      await api.post(`/tournaments/${tournament.id}/join`, { gameProfileId: profileId || undefined, ffUid: ffUid.trim() || undefined, starterUserIds: rosterSize > 1 ? starters : undefined, substituteUserIds: substitutes });
      const { data } = await api.get(`/tournaments/${tournament.id}`);
      setTournament(data);
      setRegistered(true);
      Alert.alert('Joined', 'Tournament registration complete');
    } catch (err) {
      Alert.alert('Unable to join', err.response?.data?.message || 'Try again');
    } finally {
      setJoining(false);
    }
  };
  const checkIn = async () => {
    try { const { data } = await api.post(`/tournaments/${tournament.id}/check-in`); setRegistration(data); Alert.alert('Checked in', 'Your line-up is ready.'); }
    catch (err) { Alert.alert('Unable to check in', err.response?.data?.message || 'Try again'); }
  };

  const canJoin = tournament.status === 'REGISTRATION_OPEN' && !registered && tournament.registeredTeams < tournament.maxTeams;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.row}>
        <Text style={styles.title}>{tournament.title || tournament.name}</Text>
        <Badge tone="warning">{tournament.status}</Badge>
      </View>

      <View style={styles.grid}>
        <Stat label="Game" value={tournament.game?.name || 'Free Fire'} />
        <Stat label="Format" value={tournament.gameMode?.name || tournament.format} />
        <Stat label="Entry" value={`৳${tournament.entryFee}`} />
        <Stat label="Prize" value={`৳${tournament.prizePool}`} />
        <Stat label="Teams" value={`${tournament.registeredTeams}/${tournament.maxTeams}`} />
      </View>

      {tournament.description ? (
        <>
          <SectionTitle>Details</SectionTitle>
          <Text style={styles.body}>{tournament.description}</Text>
        </>
      ) : null}

      {tournament.maps?.length ? (
        <>
          <SectionTitle>Maps</SectionTitle>
          <View style={styles.tags}>
            {tournament.maps.map((map) => <Badge key={map}>{map}</Badge>)}
          </View>
        </>
      ) : null}

      {tournament.rules?.length ? (
        <>
          <SectionTitle>Rules</SectionTitle>
          <Card style={styles.rules}>
            {tournament.rules.map((rule) => <Text key={rule} style={styles.body}>• {rule}</Text>)}
          </Card>
        </>
      ) : null}

      {!tournament.isFree && !registered ? <Text style={styles.body}>Entry fee will be deducted from your main wallet.</Text> : null}
      {!registered && profiles.length ? <View style={styles.tags}>{profiles.map((profile) => <Pressable key={profile.id} onPress={() => setProfileId(profile.id)}><Badge tone={profileId === profile.id ? 'success' : undefined}>{profile.ign}</Badge></Pressable>)}</View> : null}
      {!registered && !profiles.length ? <TextInput style={styles.input} value={ffUid} onChangeText={setFfUid} placeholder="Legacy player UID" placeholderTextColor={colors.muted} /> : null}
      {!registered && rosterSize > 1 ? <Card style={styles.rules}>
        <Text style={styles.playerHeading}>Select {rosterSize} starters</Text>
        {roster.map((member) => <Pressable key={member.id} onPress={() => toggleSelection(member.id, 'starter')}><Badge tone={starters.includes(member.id) ? 'success' : undefined}>{member.label}</Badge></Pressable>)}
        {substituteLimit > 0 ? <><Text style={styles.playerHeading}>Substitutes: up to {substituteLimit}</Text>{roster.filter((member) => !starters.includes(member.id)).map((member) => <Pressable key={`sub-${member.id}`} onPress={() => toggleSelection(member.id, 'sub')}><Badge tone={substitutes.includes(member.id) ? 'warning' : undefined}>{member.label}</Badge></Pressable>)}</> : null}
      </Card> : null}
      {registered && tournament.roomDetails ? <Card style={styles.rules}><Text style={styles.body}>{tournament.game?.lobbyLabels?.roomId || 'Room ID'}: {tournament.roomDetails.roomId}</Text>{tournament.game?.lobbyLabels?.password ? <Text style={styles.body}>{tournament.game.lobbyLabels.password}: {tournament.roomDetails.password}</Text> : null}</Card> : null}

      <Pressable style={[styles.button, !canJoin && styles.buttonDisabled]} onPress={join} disabled={!canJoin || joining}>
        <Text style={styles.buttonText}>{registered ? 'Registered' : joining ? 'Joining...' : 'Join tournament'}</Text>
      </Pressable>
      {registered && tournament.checkInEnabled && !['CHECKED_IN', 'EXPIRED'].includes(registration?.checkInStatus) ? <Pressable style={styles.button} onPress={checkIn}><Text style={styles.buttonText}>Check in line-up</Text></Pressable> : null}
    </ScrollView>
  );
}

function Stat({ label, value }) {
  return (
    <Card style={styles.stat}>
      <Text style={styles.meta}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { gap: 14, padding: 16, paddingBottom: 30 },
  row: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  title: { flex: 1, color: colors.text, fontSize: 24, fontWeight: '900' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stat: { width: '48%', gap: 6 },
  statValue: { color: colors.text, fontSize: 17, fontWeight: '800' },
  meta: { color: colors.muted, fontSize: 12 },
  body: { color: colors.muted, lineHeight: 20 },
  playerHeading: { color: colors.text, fontWeight: '800', marginBottom: 4 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  rules: { gap: 8 },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 8, color: colors.text, padding: 14 },
  button: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: 8, padding: 15 },
  buttonDisabled: { opacity: 0.45 },
  buttonText: { color: colors.background, fontWeight: '900' },
});
