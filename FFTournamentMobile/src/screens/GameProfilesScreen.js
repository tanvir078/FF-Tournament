import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import api from '../lib/api';
import { colors } from '../theme';
import { Card, Empty, SectionTitle } from '../components/ui';

export default function GameProfilesScreen() {
  const [games, setGames] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [gameId, setGameId] = useState('');
  const [uid, setUid] = useState('');
  const [ign, setIgn] = useState('');
  const load = useCallback(async () => {
    const [gamesResponse, profilesResponse] = await Promise.all([api.get('/games'), api.get('/game-profiles/mine')]);
    setGames(gamesResponse.data || []); setProfiles(profilesResponse.data || []);
  }, []);
  useEffect(() => { load(); }, [load]);
  const save = async () => {
    try { await api.post('/game-profiles', { gameId, uid, ign }); setUid(''); setIgn(''); await load(); }
    catch (err) { Alert.alert('Unable to save', err.response?.data?.message || 'Try again'); }
  };
  return <ScrollView style={styles.screen} contentContainerStyle={styles.content}><SectionTitle>Add game profile</SectionTitle><Card style={styles.form}><ScrollView horizontal>{games.map((game) => <Pressable key={game.id} onPress={() => setGameId(game.id)} style={[styles.game, gameId === game.id && styles.active]}><Text style={styles.text}>{game.name}</Text></Pressable>)}</ScrollView><TextInput style={styles.input} value={uid} onChangeText={setUid} placeholder="Player UID" placeholderTextColor={colors.muted} /><TextInput style={styles.input} value={ign} onChangeText={setIgn} placeholder="In-game name" placeholderTextColor={colors.muted} /><Pressable style={styles.button} onPress={save}><Text style={styles.buttonText}>Save profile</Text></Pressable></Card><SectionTitle>Connected games</SectionTitle>{profiles.length ? profiles.map((profile) => <Card key={profile.id} style={styles.profile}><Text style={styles.title}>{profile.game?.name}</Text><Text style={styles.meta}>{profile.ign} · {profile.uid}</Text><Text style={styles.meta}>{profile.verificationStatus}</Text></Card>) : <Empty>No connected game profile</Empty>}</ScrollView>;
}
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.background }, content: { gap: 12, padding: 16 }, form: { gap: 10 }, game: { padding: 10, marginRight: 8, borderColor: colors.border, borderWidth: 1, borderRadius: 6 }, active: { backgroundColor: colors.primary }, input: { backgroundColor: colors.surfaceStrong, borderRadius: 6, color: colors.text, padding: 13 }, button: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: 6, padding: 13 }, buttonText: { color: colors.background, fontWeight: '900' }, text: { color: colors.text }, profile: { gap: 4 }, title: { color: colors.text, fontWeight: '900' }, meta: { color: colors.muted } });
