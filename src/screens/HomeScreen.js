import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS } from '../theme';
import { STORES, CATEGORIES } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import StoreArt from '../components/StoreArt';
import BanigBand from '../components/BanigBand';
import CartBar from '../components/CartBar';

// Bikol greetings based on the time of day.
function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Marhay na aga';
  if (hour < 18) return 'Marhay na hapon';
  return 'Marhay na banggi';
}

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const firstName = user?.name ? user.name.split(' ')[0] : '';

  const stores = STORES.filter((s) => {
    const matchCategory = category === 'All' || s.category === category;
    const matchQuery = s.name.toLowerCase().includes(query.toLowerCase());
    return matchCategory && matchQuery;
  });

  const header = (
    <View>
      <View style={styles.top}>
        <Text style={styles.greet}>
          {greeting()}
          {firstName ? `, ${firstName}` : ''}
        </Text>
        <Text style={styles.headline}>What are we bringing you today?</Text>
      </View>

      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color={COLORS.inkSoft} />
        <TextInput
          style={styles.search}
          placeholder="Search stores in Albay"
          placeholderTextColor={COLORS.inkSoft}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <BanigBand id="home-band" height={12} />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {CATEGORIES.map((c) => (
          <Pressable
            key={c}
            onPress={() => setCategory(c)}
            style={[styles.chip, category === c && styles.chipActive]}
          >
            <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {!user?.name && (
        <Pressable style={styles.nudge} onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person-add-outline" size={20} color={COLORS.ink} />
          <Text style={styles.nudgeText}>Add your name and address so riders know who to look for.</Text>
          <Ionicons name="chevron-forward" size={18} color={COLORS.ink} />
        </Pressable>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.page} edges={['top']}>
      <FlatList
        data={stores}
        keyExtractor={(s) => s.id}
        ListHeaderComponent={header}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <Text style={styles.empty}>No stores match that search. Try another word or category.</Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={[styles.card, !item.isOpen && styles.cardClosed]}
            onPress={() => navigation.navigate('Store', { storeId: item.id })}
          >
            <StoreArt store={item} height={130} />
            <View style={styles.cardBody}>
              <View style={{ flex: 1 }}>
                <Text style={styles.storeName}>{item.name}</Text>
                <Text style={styles.meta}>
                  {item.town}, {item.eta}
                </Text>
              </View>
              <View style={[styles.pill, { backgroundColor: item.isOpen ? COLORS.piliSoft : COLORS.line }]}>
                <Text style={[styles.pillText, { color: item.isOpen ? COLORS.pili : COLORS.inkSoft }]}>
                  {item.isOpen ? 'Open' : 'Closed'}
                </Text>
              </View>
            </View>
            <Text style={styles.fee}>Delivery ₱{item.deliveryFee}</Text>
          </Pressable>
        )}
      />
      <CartBar onPress={() => navigation.navigate('Cart')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.page },
  list: { paddingBottom: 110 },
  top: { paddingHorizontal: 20, paddingTop: 12 },
  greet: { fontFamily: FONTS.semi, fontSize: 14, color: COLORS.sili },
  headline: { fontFamily: FONTS.display, fontSize: 30, lineHeight: 36, color: COLORS.ink, marginTop: 4 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 18,
    paddingHorizontal: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: RADIUS.md,
  },
  search: { flex: 1, paddingVertical: 13, fontFamily: FONTS.body, fontSize: 15, color: COLORS.ink },
  chips: { paddingHorizontal: 20, paddingVertical: 14, gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.surface,
  },
  chipActive: { backgroundColor: COLORS.ink, borderColor: COLORS.ink },
  chipText: { fontFamily: FONTS.semi, fontSize: 14, color: COLORS.ink },
  chipTextActive: { color: '#FFFFFF' },
  nudge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 14,
    padding: 14,
    backgroundColor: COLORS.abacaSoft,
    borderRadius: RADIUS.md,
  },
  nudgeText: { flex: 1, fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink },
  card: {
    marginHorizontal: 20,
    marginBottom: 14,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.line,
    overflow: 'hidden',
  },
  cardClosed: { opacity: 0.55 },
  cardBody: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingTop: 12 },
  storeName: { fontFamily: FONTS.display, fontSize: 19, color: COLORS.ink },
  meta: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.inkSoft, marginTop: 2 },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  pillText: { fontFamily: FONTS.semi, fontSize: 12 },
  fee: { fontFamily: FONTS.semi, fontSize: 13, color: COLORS.ink, paddingHorizontal: 14, paddingTop: 6, paddingBottom: 14 },
  empty: { fontFamily: FONTS.body, textAlign: 'center', color: COLORS.inkSoft, marginTop: 40, paddingHorizontal: 20 },
});