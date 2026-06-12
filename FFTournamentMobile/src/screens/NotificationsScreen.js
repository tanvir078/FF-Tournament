import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import api from '../lib/api';
import { colors } from '../theme';
import { Card, Empty } from '../components/ui';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data);
    } catch {
      setNotifications([]);
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

  const read = async (id) => {
    await api.put(`/notifications/${id}/read`);
    await load();
  };

  const readAll = async () => {
    await api.put('/notifications/read-all');
    await load();
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
    >
      <Pressable style={styles.readAll} onPress={readAll}>
        <Text style={styles.readAllText}>Mark all read</Text>
      </Pressable>
      {notifications.length ? notifications.map((notification) => (
        <Pressable key={notification.id} onPress={() => read(notification.id)}>
          <Card style={[styles.card, !notification.isRead && styles.unread]}>
            <View style={styles.row}>
              <Text style={styles.title}>{notification.title}</Text>
              {!notification.isRead ? <View style={styles.dot} /> : null}
            </View>
            <Text style={styles.message}>{notification.message}</Text>
          </Card>
        </Pressable>
      )) : <Empty>No notification</Empty>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 30 },
  readAll: { alignSelf: 'flex-end', paddingVertical: 8, marginBottom: 8 },
  readAllText: { color: colors.primary, fontWeight: '800' },
  card: { gap: 8, marginBottom: 8 },
  unread: { borderColor: colors.primary },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  title: { flex: 1, color: colors.text, fontWeight: '800' },
  message: { color: colors.muted, lineHeight: 19 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
});
