import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, RADIUS } from '../theme';
import { useAuth, ORDER_STEPS } from '../context/AuthContext';
import MayonMark from '../components/MayonMark';

function formatDate(timestamp) {
  const d = new Date(timestamp);
  const date = d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
  const time = d.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' });
  return `${date}, ${time}`;
}

export default function OrdersScreen({ navigation }) {
  const { orders } = useAuth();

  return (
    <SafeAreaView style={styles.page} edges={['top']}>
      <Text style={styles.title}>Your orders</Text>
      <FlatList
        data={orders}
        keyExtractor={(o) => o.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MayonMark width={200} color={COLORS.line} sun={COLORS.abacaSoft} />
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptySub}>Your current and past orders will show up here.</Text>
            <Pressable style={styles.button} onPress={() => navigation.navigate('Home')}>
              <Text style={styles.buttonText}>Browse stores</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => {
          const done = item.statusIndex === ORDER_STEPS.length - 1;
          const count = item.items.reduce((sum, i) => sum + i.qty, 0);
          return (
            <Pressable style={styles.card} onPress={() => navigation.navigate('TrackOrder', { orderId: item.id })}>
              <View style={{ flex: 1 }}>
                <Text style={styles.store}>{item.storeName}</Text>
                <Text style={styles.meta}>
                  {formatDate(item.createdAt)}, {count} {count === 1 ? 'item' : 'items'}
                </Text>
                <Text style={styles.total}>₱{item.total}</Text>
              </View>
              <View style={[styles.pill, { backgroundColor: done ? COLORS.piliSoft : COLORS.abacaSoft }]}>
                <Text style={[styles.pillText, { color: done ? COLORS.pili : '#8A5A0B' }]}>
                  {ORDER_STEPS[item.statusIndex].short}
                </Text>
              </View>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.page },
  title: { fontFamily: FONTS.display, fontSize: 30, color: COLORS.ink, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  list: { padding: 16, paddingBottom: 40, gap: 12, flexGrow: 1 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  store: { fontFamily: FONTS.display, fontSize: 18, color: COLORS.ink },
  meta: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.inkSoft, marginTop: 2 },
  total: { fontFamily: FONTS.heavy, fontSize: 15, color: COLORS.ink, marginTop: 6 },
  pill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  pillText: { fontFamily: FONTS.semi, fontSize: 12 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  emptyTitle: { fontFamily: FONTS.display, fontSize: 22, color: COLORS.ink, marginTop: 16 },
  emptySub: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.inkSoft, textAlign: 'center', marginTop: 6 },
  button: { backgroundColor: COLORS.sili, borderRadius: RADIUS.md, paddingVertical: 14, paddingHorizontal: 28, marginTop: 20 },
  buttonText: { fontFamily: FONTS.heavy, fontSize: 15, color: '#FFFFFF' },
});