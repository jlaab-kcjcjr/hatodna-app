import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { COLORS, RADIUS } from '../theme';

const STEPS = [
  'Order placed',
  'Store is preparing your order',
  'Rider picked up your order',
  'Delivered',
];

export default function TrackOrderScreen({ route, navigation }) {
  const { order } = route.params;
  const [current, setCurrent] = useState(0);

  // Fake progress for now. Later, the backend pushes real status updates.
  useEffect(() => {
    if (current >= STEPS.length - 1) return;
    const t = setTimeout(() => setCurrent((c) => c + 1), 4000);
    return () => clearTimeout(t);
  }, [current]);

  const done = current === STEPS.length - 1;

  return (
    <View style={styles.page}>
      <Text style={styles.title}>{done ? 'Enjoy your order!' : 'On its way'}</Text>
      <Text style={styles.sub}>
        {order.store.name} to {order.address}
        {order.landmark ? ` (${order.landmark})` : ''}
      </Text>

      <View style={styles.box}>
        {STEPS.map((step, i) => {
          const reached = i <= current;
          return (
            <View key={step} style={styles.stepRow}>
              <View style={[styles.dot, reached && styles.dotOn]} />
              <Text style={[styles.stepText, reached && styles.stepTextOn]}>{step}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.box}>
        <Text style={styles.label}>Total to pay ({order.payment})</Text>
        <Text style={styles.total}>₱{order.total}</Text>
      </View>

      {done && (
        <Pressable style={styles.primary} onPress={() => navigation.popToTop()}>
          <Text style={styles.primaryText}>Back to home</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.page, padding: 20, gap: 16 },
  title: { fontSize: 28, fontWeight: '900', color: COLORS.ash },
  sub: { fontSize: 14, color: COLORS.ashLight },
  box: { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.line, padding: 18, gap: 16 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: COLORS.line },
  dotOn: { backgroundColor: COLORS.pili, borderColor: COLORS.pili },
  stepText: { fontSize: 15, color: COLORS.ashLight },
  stepTextOn: { color: COLORS.ash, fontWeight: '700' },
  label: { color: COLORS.ashLight, fontSize: 14 },
  total: { color: COLORS.ash, fontSize: 24, fontWeight: '800' },
  primary: { backgroundColor: COLORS.sili, borderRadius: RADIUS.md, paddingVertical: 16, alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});