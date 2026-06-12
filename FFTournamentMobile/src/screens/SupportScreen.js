import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import api from '../lib/api';
import { createEcho } from '../lib/echo';
import { colors } from '../theme';
import { Card, Empty, SectionTitle } from '../components/ui';

export default function SupportScreen() {
  const [tickets, setTickets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [settings, setSettings] = useState({});
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState('');
  const load = useCallback(async () => {
    const [ticketsResponse, settingsResponse] = await Promise.all([api.get('/support/tickets'), api.get('/support/settings')]);
    const nextTickets = ticketsResponse.data || [];
    setTickets(nextTickets); setSettings(settingsResponse.data || {});
    setSelected((current) => current ? nextTickets.find((ticket) => ticket.id === current.id) || current : current);
  }, []);
  useEffect(() => { load().catch(() => {}); }, [load]);
  useEffect(() => {
    if (!selected) return undefined;
    let echo;
    createEcho().then((connection) => {
      echo = connection;
      echo.private(`support.ticket.${selected.id}`).listen('.support.message.created', refreshSelected);
    }).catch(() => {});
    return () => {
      echo?.leave(`support.ticket.${selected.id}`);
      echo?.disconnect();
    };
  }, [load, selected?.id]);
  const refreshSelected = async () => {
    if (!selected) return;
    await api.put(`/support/tickets/${selected.id}/read`);
    await load();
  };
  const open = async (ticket) => {
    try { const { data } = await api.put(`/support/tickets/${ticket.id}/read`); setSelected(data); await load(); }
    catch (err) { Alert.alert('Unable to open ticket', err.response?.data?.message || 'Try again'); }
  };
  const submit = async () => {
    try { await api.post('/support/tickets', { subject, message, priority: 'MEDIUM' }); setSubject(''); setMessage(''); await load(); }
    catch (err) { Alert.alert('Unable to submit', err.response?.data?.message || 'Try again'); }
  };
  const sendReply = async () => {
    if (!selected || !reply.trim()) return;
    try { await api.post(`/support/tickets/${selected.id}/replies`, { message: reply }); setReply(''); await load(); }
    catch (err) { Alert.alert('Unable to reply', err.response?.data?.message || 'Try again'); }
  };
  return <ScrollView style={styles.screen} contentContainerStyle={styles.content}><SectionTitle>Support</SectionTitle><Card style={styles.form}><TextInput style={styles.input} value={subject} onChangeText={setSubject} placeholder="Subject" placeholderTextColor={colors.muted} /><TextInput style={styles.input} value={message} onChangeText={setMessage} placeholder="Describe your issue" placeholderTextColor={colors.muted} multiline /><Pressable style={styles.button} onPress={submit}><Text style={styles.buttonText}>Create ticket</Text></Pressable></Card>{settings.telegramUrl ? <Link label="Telegram support" url={settings.telegramUrl} /> : null}{settings.whatsappUrl ? <Link label="WhatsApp support" url={settings.whatsappUrl} /> : null}<SectionTitle>History</SectionTitle>{tickets.length ? tickets.map((ticket) => <Pressable key={ticket.id} onPress={() => open(ticket)}><Card style={styles.ticket}><Text style={styles.title}>{ticket.subject}</Text><Text style={styles.meta}>{ticket.status}{ticket.unreadCount ? ` · ${ticket.unreadCount} unread` : ''}</Text></Card></Pressable>) : <Empty>No support ticket</Empty>}{selected ? <Card style={styles.form}><Text style={styles.title}>{selected.subject}</Text>{selected.replies?.map((item) => <Text key={item.id} style={styles.reply}>{item.isAdmin ? 'Admin' : 'You'}: {item.message}</Text>)}<TextInput style={styles.input} value={reply} onChangeText={setReply} placeholder="Write a reply" placeholderTextColor={colors.muted} /><Pressable style={styles.button} onPress={sendReply}><Text style={styles.buttonText}>Send reply</Text></Pressable></Card> : null}</ScrollView>;
}
function Link({ label, url }) { return <Pressable onPress={() => Linking.openURL(url)}><Text style={styles.link}>{label}</Text></Pressable>; }
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.background }, content: { gap: 12, padding: 16 }, form: { gap: 10 }, input: { backgroundColor: colors.surfaceStrong, borderRadius: 6, color: colors.text, padding: 13 }, button: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: 6, padding: 13 }, buttonText: { color: colors.background, fontWeight: '900' }, ticket: { gap: 4 }, title: { color: colors.text, fontWeight: '800' }, meta: { color: colors.muted, fontSize: 12 }, reply: { color: colors.text, lineHeight: 20 }, link: { color: colors.primary, fontWeight: '800' } });
