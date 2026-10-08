import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS } from '../theme';
import { useAuth } from '../context/AuthContext';
import BanigBand from '../components/BanigBand';

function MenuRow({ icon, text, onPress, danger }) {
  const color = danger ? COLORS.sili : COLORS.ink;
  return (
    <Pressable style={styles.menuRow} onPress={onPress}>
      <Ionicons name={icon} size={22} color={color} />
      <Text style={[styles.menuText, { color }]}>{text}</Text>
      {!danger && <Ionicons name="chevron-forward" size={18} color={COLORS.inkSoft} />}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { user, updateProfile, logout } = useAuth();
  const [name, setName] = useState(user.name);
  const [address, setAddress] = useState(user.address);
  const [landmark, setLandmark] = useState(user.landmark);
  const [saved, setSaved] = useState(false);

  const initials = (name.trim() || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  const onSave = () => {
    updateProfile({ name: name.trim(), address: address.trim(), landmark: landmark.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const comingSoon = (what) => Alert.alert(what, 'This is coming in the next update.');

  const confirmLogout = () =>
    Alert.alert('Log out?', "You'll need to verify your number again to log back in.", [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: logout },
    ]);

  return (
    <SafeAreaView style={styles.page} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{user.name || 'Your profile'}</Text>
          <Text style={styles.phone}>{user.phone}</Text>
        </View>
        <BanigBand id="profile-band" height={10} />

        <View style={styles.form}>
          <Text style={styles.label}>Full name</Text>
          <TextInput
            style={styles.input}
            placeholder="Juan Dela Cruz"
            placeholderTextColor={COLORS.inkSoft}
            value={name}
            onChangeText={setName}
          />
          <Text style={styles.label}>Default delivery address</Text>
          <TextInput
            style={styles.input}
            placeholder="Street, barangay, town"
            placeholderTextColor={COLORS.inkSoft}
            value={address}
            onChangeText={setAddress}
          />
          <Text style={styles.label}>Landmark</Text>
          <TextInput
            style={styles.input}
            placeholder="Near the chapel, blue gate"
            placeholderTextColor={COLORS.inkSoft}
            value={landmark}
            onChangeText={setLandmark}
          />
          <Pressable style={[styles.button, saved && { backgroundColor: COLORS.pili }]} onPress={onSave}>
            <Text style={styles.buttonText}>{saved ? 'Saved' : 'Save changes'}</Text>
          </Pressable>
        </View>

        <View style={styles.menu}>
          <MenuRow icon="bicycle-outline" text="Become a rider" onPress={() => comingSoon('Rider sign-up')} />
          <MenuRow icon="storefront-outline" text="List your store with us" onPress={() => comingSoon('Store partnership')} />
          <MenuRow icon="help-circle-outline" text="Help and support" onPress={() => comingSoon('Help and support')} />
          <MenuRow icon="log-out-outline" text="Log out" danger onPress={confirmLogout} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.page },
  hero: { alignItems: 'center', paddingTop: 24, paddingBottom: 22, backgroundColor: COLORS.abacaSoft },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: COLORS.sili,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: FONTS.display, fontSize: 34, color: '#FFFFFF' },
  name: { fontFamily: FONTS.display, fontSize: 24, color: COLORS.ink, marginTop: 12 },
  phone: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.inkSoft, marginTop: 2 },
  form: { padding: 20 },
  label: { fontFamily: FONTS.semi, fontSize: 13, color: COLORS.ink, marginBottom: 6, marginTop: 10 },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.line,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.ink,
  },
  button: { backgroundColor: COLORS.sili, borderRadius: RADIUS.md, paddingVertical: 15, alignItems: 'center', marginTop: 20 },
  buttonText: { fontFamily: FONTS.heavy, fontSize: 16, color: '#FFFFFF' },
  menu: {
    marginHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.line,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  menuText: { flex: 1, fontFamily: FONTS.semi, fontSize: 15 },
});