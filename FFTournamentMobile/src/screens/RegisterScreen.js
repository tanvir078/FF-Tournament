import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { colors } from '../theme';

const initialForm = { name: '', email: '', phone: '', uid: '', ign: '', password: '' };

export default function RegisterScreen() {
  const register = useAuthStore((state) => state.register);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async () => {
    setLoading(true);
    setError('');
    try {
      await register({ ...form, email: form.email.trim() });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {[
        ['name', 'Name'],
        ['email', 'Email'],
        ['phone', 'Phone'],
        ['uid', 'Free Fire UID'],
        ['ign', 'In-game name'],
        ['password', 'Password'],
      ].map(([key, placeholder]) => (
        <TextInput
          key={key}
          autoCapitalize={key === 'email' ? 'none' : 'sentences'}
          keyboardType={key === 'email' ? 'email-address' : key === 'phone' ? 'phone-pad' : 'default'}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          secureTextEntry={key === 'password'}
          style={styles.input}
          value={form[key]}
          onChangeText={(value) => update(key, value)}
        />
      ))}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable style={styles.button} onPress={submit} disabled={loading}>
        {loading ? <ActivityIndicator color={colors.background} /> : <Text style={styles.buttonText}>Create account</Text>}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', gap: 12, padding: 20, backgroundColor: colors.background },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 8, color: colors.text, padding: 14 },
  error: { color: colors.danger },
  button: { minHeight: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, borderRadius: 8 },
  buttonText: { color: colors.background, fontWeight: '800' },
});
