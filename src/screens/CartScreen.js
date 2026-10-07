import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from 'react-native';
import { COLORS, RADIUS } from '../theme';
import { useCart } from '../context/CartContext';

const PAYMENT_OPTIONS = ['Cash on delivery', 'GCash (soon)'];

export default function CartScreen({ navigation }) {
  const { store, items, addItem, removeItem, clearCart, subtotal } = useCart();
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [payment, setPayment] = useState(PAYMENT_OPTIONS[0]);
  const [error, setError] = useState('');

  if (!store) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Pressable style={styles.primary} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.primaryText}>Browse stores</Text>
        </Pressable>
      </View>
    );
  }

  const total = subtotal + store.deliveryFee;

  const placeOrder = () => {
    if (!address.trim()) {
      setError('Enter your street and barangay so the rider can find you.');
      return;
    }
    const order = { id: Date.now().toString(), store, items, address, landmark, payment, total };
    clearCart();
    navigation.replace('TrackOrder', { order });
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={styles.section}>From {store.name}</Text>
      <View style={styles.box}>
        {items.map((i) => (
          <View key={i.id} style={styles.line}>
            <Text style={styles.itemName}>{i.name}</Text>
            <View style={styles.stepper}>
              <Pressable onPress={() => removeItem(i.id)}><Text style={styles.step}>−</Text></Pressable>
              <Text style={styles.qty}>{i.qty}</Text>
              <Pressable onPress={() => addItem(i, store)}><Text style={styles.step}>+</Text></Pressable>
            </View>
            <Text style={styles.amount}>₱{i.price * i.qty}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.section}>Deliver to</Text>
      <TextInput
        style={styles.input}
        placeholder="Street, barangay, town"
        placeholderTextColor={COLORS.ashLight}
        value={address}
        onChangeText={(t) => { setAddress(t); setError(''); }}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Landmark (e.g. near the chapel, blue gate)"
        placeholderTextColor={COLORS.ashLight}
        value={landmark}
        onChangeText={setLandmark}
      />

      <Text style={styles.section}>Payment</Text>
      {PAYMENT_OPTIONS.map((p) => {
        const disabled = p.includes('soon');
        return (
          <Pressable
            key={p}
            disabled={disabled}
            onPress={() => setPayment(p)}
            style={[styles.option, payment === p && styles.optionActive, disabled && { opacity: 0.4 }]}
          >
            <Text style={styles.optionText}>{p}</Text>
          </Pressable>
        );
      })}

      <View style={[styles.box, { marginTop: 20 }]}>
        <View style={styles.line}><Text style={styles.muted}>Subtotal</Text><Text style={styles.muted}>₱{subtotal}</Text></View>
        <View style={styles.line}><Text style={styles.muted}>Delivery fee</Text><Text style={styles.muted}>₱{store.deliveryFee}</Text></View>
        <View style={styles.line}><Text style={styles.total}>Total</Text><Text style={styles.total}>₱{total}</Text></View>
      </View>

      <Pressable style={[styles.primary, { marginTop: 20 }]} onPress={placeOrder}>
        <Text style={styles.primaryText}>Place order, ₱{total}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.page },
  section: { fontSize: 15, fontWeight: '800', color: COLORS.ash, marginTop: 16, marginBottom: 8 },
  box: { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.line, padding: 14, gap: 10 },
  line: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  itemName: { flex: 1, color: COLORS.ash, fontSize: 15 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  step: { color: COLORS.sili, fontSize: 20, fontWeight: '800', paddingHorizontal: 6 },
  qty: { fontWeight: '700', color: COLORS.ash },
  amount: { width: 64, textAlign: 'right', fontWeight: '700', color: COLORS.ash },
  input: {
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, borderRadius: RADIUS.sm,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: COLORS.ash, marginBottom: 8,
  },
  error: { color: COLORS.siliDark, fontSize: 13, marginBottom: 8 },
  option: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, borderRadius: RADIUS.sm, padding: 14, marginBottom: 8 },
  optionActive: { borderColor: COLORS.sili, borderWidth: 2 },
  optionText: { color: COLORS.ash, fontWeight: '600' },
  muted: { color: COLORS.ashLight, fontSize: 14 },
  total: { color: COLORS.ash, fontSize: 18, fontWeight: '800' },
  primary: { backgroundColor: COLORS.sili, borderRadius: RADIUS.md, paddingVertical: 16, alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16, backgroundColor: COLORS.page },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.ash },
});