import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { COLORS, FONTS, RADIUS } from '../theme';
import { useAuth, ORDER_STEPS } from '../context/AuthContext';
import BanigBand from '../components/BanigBand';

export default function TrackOrderScreen({ route, navigation }) {
  const { orders } = useAuth();
  const order = orders.find((o) => o.id === route.params.orderId);

  if (!order) {
    return (
      <View style={styles.center}>
        <Text style={styles.sub}>This order is no longer available.</Text>
      </View>
    );
  }

  const current = order.statusIndex;
  const done = current === ORDER_STEPS.length - 1;

  return (
    <ScrollView style={styles.page} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.head}>
        <Text style={styles.title}>{done ? 'Delivered. Enjoy!' : ORDER_STEPS[current].label}</Text>
        <Text style={styles.sub}>
          {order.storeName} to {order.address}
          {order.landmark ? ` (${order.landmark})` : ''}
        </Text>
      </View>
      <BanigBand id="track-band" height={10} />

      <View style={[styles.box, { marginTop: 20 }]}>
        {ORDER_STEPS.map((step, i) => {
          const reached = i <= current;
          const last = i === ORDER_STEPS.length - 1;
          return (
            <View key={step.short} style={[styles.stepRow, last && { minHeight: 0 }]}>
              <View style={styles.rail}>
                <View style={[styles.dot, reached && styles.dotOn]} />
                {!last && <View style={[styles.railLine, i < current && styles.railLineOn]} />}
              </View>
              <Text style={[styles.stepText, reached && styles.stepTextOn]}>{step.label}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.box}>
        {order.items.map((i) => (
          <View key={i.id} style={styles.line}>
            <Text style={styles.itemText}>
              {i.qty} × {i.name}
            </Text>
            <Text style={styles.itemText}>₱{i.price * i.qty}</Text>
          </View>
        ))}
        <View style={styles.line}>
          <Text style={styles.muted}>Delivery fee</Text>
          <Text style={styles.muted}>₱{order.deliveryFee}</Text>
        </View>
        <View style={styles.line}>
          <Text style={styles.total}>Total ({order.payment})</Text>
          <Text style={styles.total}>₱{order.total}</Text>
        </View>
      </View>

      <Pressable style={styles.primary} onPress={() => navigation.popToTop()}>
        <Text style={styles.primaryText}>Done</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.page },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.page },
  head: { padding: 20, paddingBottom: 18 },
  title: { fontFamily: FONTS.display, fontSize: 28, lineHeight: 34, color: COLORS.ink },
  sub: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.inkSoft, marginTop: 6 },
  box: {
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.line,
    padding: 18,
    gap: 10,
  },
  stepRow: { flexDirection: 'row', minHeight: 46 },
  rail: { width: 18, alignItems: 'center' },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: COLORS.line, backgroundColor: COLORS.surface },
  dotOn: { backgroundColor: COLORS.pili, borderColor: COLORS.pili },
  railLine: { flex: 1, width: 2, backgroundColor: COLORS.line, marginVertical: 2 },
  railLineOn: { backgroundColor: COLORS.pili },
  stepText: { marginLeft: 12, fontFamily: FONTS.body, fontSize: 15, color: COLORS.inkSoft },
  stepTextOn: { fontFamily: FONTS.semi, color: COLORS.ink },
  line: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  itemText: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink },
  muted: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.inkSoft },
  total: { fontFamily: FONTS.heavy, fontSize: 15, color: COLORS.ink },
  primary: {
    marginHorizontal: 16,
    marginTop: 6,
    backgroundColor: COLORS.sili,
    borderRadius: RADIUS.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryText: { fontFamily: FONTS.heavy, fontSize: 16, color: '#FFFFFF' },
});