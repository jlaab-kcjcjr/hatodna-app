import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BRAND, COLORS, RADIUS } from '../theme';
import { STORES, CATEGORIES } from '../data/mockData';
import { useCart } from '../context/CartContext';

export default function HomeScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const { itemCount, subtotal } = useCart();

  const stores = STORES.filter((s) => {
    const matchCategory = category === 'All' || s.category === category;
    const matchQuery = s.name.toLowerCase().includes(query.toLowerCase());
    return matchCategory && matchQuery;
  });

  return (
    <SafeAreaView style={styles.page} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.brand}>{BRAND.name}</Text>
        <Text style={styles.tagline}>{BRAND.tagline}</Text>
        <TextInput
          style={styles.search}
          placeholder="Search stores in Albay"
          placeholderTextColor={COLORS.ashLight}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <View>
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
      </View>

      <FlatList
        data={stores}
        keyExtractor={(s) => s.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No stores match that search. Try another category.</Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={[styles.card, !item.isOpen && styles.cardClosed]}
            onPress={() => navigation.navigate('Store', { storeId: item.id })}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.storeName}>{item.name}</Text>
              <Text style={styles.meta}>
                {item.town}, {item.eta}
              </Text>
              <Text style={styles.meta}>Delivery ₱{item.deliveryFee}</Text>
            </View>
            <Text style={[styles.status, { color: item.isOpen ? COLORS.pili : COLORS.ashLight }]}>
              {item.isOpen ? 'Open' : 'Closed'}
            </Text>
          </Pressable>
        )}
      />

      {itemCount > 0 && (
        <Pressable style={styles.cartBar} onPress={() => navigation.navigate('Cart')}>
          <Text style={styles.cartBarText}>View cart ({itemCount})</Text>
          <Text style={styles.cartBarText}>₱{subtotal}</Text>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.page },
  header: {
    backgroundColor: COLORS.sili,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 22,
    borderBottomLeftRadius: RADIUS.lg,
    borderBottomRightRadius: RADIUS.lg,
  },
  brand: { color: '#fff', fontSize: 34, fontWeight: '900', letterSpacing: -1 },
  tagline: { color: '#FFE3E6', fontSize: 14, marginTop: 2, marginBottom: 14 },
  search: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.ash,
  },
  chips: { paddingHorizontal: 16, paddingVertical: 14, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.surface,
  },
  chipActive: { backgroundColor: COLORS.ash, borderColor: COLORS.ash },
  chipText: { color: COLORS.ash, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  list: { paddingHorizontal: 16, paddingBottom: 100, gap: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  cardClosed: { opacity: 0.55 },
  storeName: { fontSize: 17, fontWeight: '700', color: COLORS.ash, marginBottom: 4 },
  meta: { fontSize: 13, color: COLORS.ashLight },
  status: { fontWeight: '700', fontSize: 13 },
  empty: { textAlign: 'center', color: COLORS.ashLight, marginTop: 40 },
  cartBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    backgroundColor: COLORS.sili,
    borderRadius: RADIUS.md,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cartBarText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});