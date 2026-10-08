import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from 'react-native';
import { COLORS, FONTS, RADIUS } from '../theme';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const PAYMENT_OPTIONS = [
  { label: 'Cash on delivery', available: true },
  { label: 'GCash', available: false },
];

export default function CartScreen({ navigation }) {
  const { store, items, addItem, removeItem, clearCart, subtotal } = useCart();
  const { user, addOrder, updateProfile } = useAuth();
  const [address, setAddress] = useState(user?.address ?? '');
  const [landmark, setLandmark] = useState(user?.landmark ?? '');
  const [payment, setPayment] = useState('Cash on delivery');
  const [error, setError] = useState('');

  if (!store) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Pressable style={styles.primary} onPress={() => navigation.navigate('Main')}>
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
    const order = {
      id: Date.now().toString(),
      storeId: store.id,
      storeName: store.name,
      items,
      address: address.trim(),
      landmark: landmark.trim(),
      payment,
      subtotal,
      deliveryFee: store.deliveryFee,
      total,
      createdAt: Date.now(),
      statusIndex: 0,
    };
    // Save the first address used as the default for next time.
    if (!user.address) updateProfile({ address: order.address, landmark: order.landmark });
    addOrder(order);
    clearCart();
    navigation.replace('TrackOrder', { orderId: order.id });
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={styles.section}>From {store.name}</Text>
      <View style={styles.box}>
        {items.map((i) => (
          <View key={i.id} style={styles.line}>
            <Text style={styles.itemName}>{i.name}</Text>
            <View style={styles.stepper}>
              <Pressable onPress={() => removeItem(i.id)}>
                <Text style={styles.step}>−</Text>
              </Pressable>
              <Text style={styles.qty}>{i.qty}</Text>
              <Pressable onPress={() => addItem(i, store)}>
                <Text style={styles.step}>+</Text>
              </Pressable>
            </View>
            <Text style={styles.amount}>₱{i.price * i.qty}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.section}>Deliver to</Text>
      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        placeholder="Street, barangay, town"
        placeholderTextColor={COLORS.inkSoft}
        value={address}
        onChangeText={(t) => {
          setAddress(t);
          setError('');
        }}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Landmark (e.g. near the chapel, blue gate)"
        placeholderTextColor={COLORS.inkSoft}
        value={landmark}
        onChangeText={setLandmark}
      />

      <Text style={styles.section}>Payment</Text>
      {PAYMENT_OPTIONS.map((p) => (
        <Pressable
          key={p.label}
          disabled={!p.available}
          onPress={() => setPayment(p.label)}
          style={[styles.option, payment === p.label && styles.optionActive, !p.available && { opacity: 0.45 }]}
        >
          <Text style={styles.optionText}>{p.label}</Text>
          {!p.available && <Text style={styles.soon}>Coming soon</Text>}
        </Pressable>
      ))}

      <View style={[styles.box, { marginTop: 20 }]}>
        <View style={styles.line}>
          <Text style={styles.muted}>Subtotal</Text>
          <Text style={styles.muted}>₱{subtotal}</Text>
        </View>
        <View style={styles.line}>
          <Text style={styles.muted}>Delivery fee</Text>
          <Text style={styles.muted}>₱{store.deliveryFee}</Text>
        </View>
        <View style={styles.line}>
          <Text style={styles.total}>Total</Text>
          <Text style={styles.total}>₱{total}</Text>
        </View>
      </View>

      <Pressable style={[styles.primary, { marginTop: 20 }]} onPress={placeOrder}>
        <Text style={styles.primaryText}>Place order, ₱{total}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.page },
  section: { fontFamily: FONTS.display, fontSize: 18, color: COLORS.ink, marginTop: 18, marginBottom: 10 },
  box: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.line,
    padding: 14,
    gap: 12,
  },
  line: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  itemName: { flex: 1, fontFamily: FONTS.body, fontSize: 15, color: COLORS.ink },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  step: { fontFamily: FONTS.heavy, fontSize: 20, color: COLORS.sili, paddingHorizontal: 6 },
  qty: { fontFamily: FONTS.heavy, color: COLORS.ink },
  amount: { width: 64, textAlign: 'right', fontFamily: FONTS.heavy, color: COLORS.ink },
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
    marginBottom: 8,
  },
  inputError: { borderColor: COLORS.sili },
  error: { fontFamily: FONTS.semi, fontSize: 13, color: COLORS.sili, marginBottom: 8 },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.line,
    borderRadius: RADIUS.sm,
    padding: 14,
    marginBottom: 8,
  },
  optionActive: { borderColor: COLORS.sili },
  optionText: { fontFamily: FONTS.semi, color: COLORS.ink },
  soon: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.inkSoft },
  muted: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.inkSoft },
  total: { fontFamily: FONTS.display, fontSize: 20, color: COLORS.ink },
  primary: { backgroundColor: COLORS.sili, borderRadius: RADIUS.md, paddingVertical: 16, alignItems: 'center' },
  primaryText: { fontFamily: FONTS.heavy, fontSize: 16, color: '#FFFFFF' },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16, backgroundColor: COLORS.page },
  emptyTitle: { fontFamily: FONTS.display, fontSize: 22, color: COLORS.ink },
});