import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { colors } from '../theme';
import { Card } from '../components/ui';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuthStore();

  return (
    <View style={styles.screen}>
      <View style={styles.identity}>
        <View style={styles.avatar}>
          <Ionicons name="person-outline" size={38} color={colors.primary} />
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.meta}>{user?.email}</Text>
      </View>

      <Card style={styles.details}>
        <Row label="IGN" value={user?.ign || '-'} />
        <Row label="UID" value={user?.uid || '-'} />
        <Row label="Phone" value={user?.phone || '-'} />
        <Row label="Role" value={user?.role || '-'} />
        <Row label="Handle" value={user?.platformHandle || '-'} />
      </Card>

      <View style={styles.actions}>
        <Pressable style={styles.action} onPress={() => navigation.navigate('Notifications')}>
          <Ionicons name="notifications-outline" size={20} color={colors.primary} />
          <Text style={styles.actionText}>Notifications</Text>
        </Pressable>
        <Pressable style={styles.action} onPress={() => navigation.navigate('Teams')}>
          <Ionicons name="people-outline" size={20} color={colors.primary} />
          <Text style={styles.actionText}>Teams</Text>
        </Pressable>
        <Pressable style={styles.action} onPress={() => navigation.navigate('GameProfiles')}>
          <Ionicons name="game-controller-outline" size={20} color={colors.primary} />
          <Text style={styles.actionText}>Game profiles</Text>
        </Pressable>
      </View>

      <Pressable style={styles.logout} onPress={logout}>
        <Ionicons name="log-out-outline" size={20} color={colors.danger} />
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </View>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.meta}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, gap: 18, padding: 16, backgroundColor: colors.background },
  identity: { alignItems: 'center', gap: 7, paddingVertical: 18 },
  avatar: { alignItems: 'center', justifyContent: 'center', width: 76, height: 76, borderColor: colors.border, borderWidth: 1, borderRadius: 38, backgroundColor: colors.surface },
  name: { color: colors.text, fontSize: 22, fontWeight: '900' },
  meta: { color: colors.muted, fontSize: 13 },
  details: { gap: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  value: { color: colors.text, fontWeight: '700' },
  actions: { gap: 8 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 8, padding: 14 },
  actionText: { color: colors.text, fontWeight: '700' },
  logout: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderColor: colors.danger, borderWidth: 1, borderRadius: 8, padding: 14 },
  logoutText: { color: colors.danger, fontWeight: '800' },
});
