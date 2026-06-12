import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../lib/api';
import { colors } from '../theme';
import { Card } from '../components/ui';

export default function ResultClaimScreen({ route, navigation }) {
  const [placement, setPlacement] = useState('1');
  const [kills, setKills] = useState('0');
  const [homeScore, setHomeScore] = useState('0');
  const [awayScore, setAwayScore] = useState('0');
  const [winner, setWinner] = useState('');
  const [seriesScore, setSeriesScore] = useState('');
  const [proof, setProof] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const type = route.params.match?.tournament?.scoringConfig?.type || route.params.match?.tournament?.game?.scoringPreset?.type || 'PLACEMENT_KILLS';

  const chooseProof = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!result.canceled) setProof(result.assets[0]);
  };

  const submit = async () => {
    if (!proof) return Alert.alert('Proof required', 'Select a result screenshot.');
    const body = new FormData();
    if (type === 'SCORELINE') {
      body.append('homeScore', homeScore);
      body.append('awayScore', awayScore);
    } else if (type === 'SERIES_WINNER') {
      body.append('winner', winner);
      if (seriesScore) body.append('seriesScore', seriesScore);
    } else {
      body.append('placement', placement);
      body.append('kills', kills);
    }
    body.append('proofs[]', { uri: proof.uri, name: proof.fileName || 'result.jpg', type: proof.mimeType || 'image/jpeg' });
    try {
      setSubmitting(true);
      await api.post(`/matches/${route.params.matchId}/result-claims`, body, { headers: { 'Content-Type': 'multipart/form-data' } });
      Alert.alert('Submitted', 'Your claim is waiting for management review.');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Unable to submit', err.response?.data?.message || 'Try again');
    } finally {
      setSubmitting(false);
    }
  };

  return <View style={styles.screen}><Card style={styles.form}><Text style={styles.title}>Submit result claim</Text>{type === 'SCORELINE' ? <><TextInput style={styles.input} keyboardType="number-pad" value={homeScore} onChangeText={setHomeScore} placeholder="Your score" placeholderTextColor={colors.muted} /><TextInput style={styles.input} keyboardType="number-pad" value={awayScore} onChangeText={setAwayScore} placeholder="Opponent score" placeholderTextColor={colors.muted} /></> : type === 'SERIES_WINNER' ? <><TextInput style={styles.input} value={winner} onChangeText={setWinner} placeholder="Winning team" placeholderTextColor={colors.muted} /><TextInput style={styles.input} value={seriesScore} onChangeText={setSeriesScore} placeholder="Series score, e.g. 2-1" placeholderTextColor={colors.muted} /></> : <><TextInput style={styles.input} keyboardType="number-pad" value={placement} onChangeText={setPlacement} placeholder="Placement" placeholderTextColor={colors.muted} /><TextInput style={styles.input} keyboardType="number-pad" value={kills} onChangeText={setKills} placeholder="Kills" placeholderTextColor={colors.muted} /></>}<Pressable style={styles.button} onPress={chooseProof}><Text style={styles.buttonText}>{proof ? 'Screenshot selected' : 'Choose screenshot'}</Text></Pressable><Pressable style={styles.button} onPress={submit} disabled={submitting}><Text style={styles.buttonText}>{submitting ? 'Submitting...' : 'Submit claim'}</Text></Pressable></Card></View>;
}

const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.background, padding: 16 }, form: { gap: 12 }, title: { color: colors.text, fontSize: 22, fontWeight: '900' }, input: { backgroundColor: colors.surfaceStrong, borderRadius: 6, color: colors.text, padding: 13 }, button: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: 6, padding: 13 }, buttonText: { color: colors.background, fontWeight: '900' } });
