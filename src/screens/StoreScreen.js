import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { COLORS, RADIUS } from '../theme';
import { STORES } from '../data/mockData';
import { useCart } from '../context/CartContext';

export default function StoreScreen({ route, navigation }) {
  const store = STORES.find((s) => s.id === route.params.storeId);
  const { addItem, removeItem, qtyOf, itemCount, subtotal } = useCart();

  return (
    <View style={styles.page}>
      <View style={styles.info}>
        <Text style={styles.name}>{store.name}</Text>
        <Text style={styles.meta}>
          {store.town}, {store.eta}, delivery ₱{store.deliveryFee}
        </Text>
        {!store.isOpen && (
          <Text style={styles.closed}>This store is closed right now. You can browse but not order.</Text>
        )}
      </View>

      <FlatList
        data={store.products}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const qty = qtyOf(item.id);
          return (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.product}>{item.name}</Text>
                <Text style={styles.price}>₱{item.price}</Text>
              </View>
              {qty === 0 ? (
                <Pressable
                  disabled={!store.isOpen}
                  style={[styles.addBtn, !store.isOpen && { opacity: 0.4 }]}
                  onPress={() => addItem(item, store)}
                >
                  <Text style={styles.addText}>Add</Text>
                </Pressable>
              ) : (
                <View style={styles.stepper}>
                  <Pressable style={styles.stepBtn} onPress={() => removeItem(item.id)}>
                    <Text style={styles.stepText}>−</Text>
                  </Pressable>
                  <Text style={styles.qty}>{qty}</Text>
                  <Pressable style={styles.stepBtn} onPress={() => addItem(item, store)}>
                    <Text style={styles.stepText}>+</Text>
                  </Pressable>
                </View>
              )}
            </View>
          );
        }}
      />

      {itemCount > 0 && (
        <Pressable style={styles.cartBar} onPress={() => navigation.navigate('Cart')}>
          <Text style={styles.cartBarText}>View cart ({itemCount})</Text>
          <Text style={styles.cartBarText}>₱{subtotal}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.page },
  info: { padding: 20, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderColor: COLORS.line },
  name: { fontSize: 24, fontWeight: '800', color: COLORS.ash },
  meta: { fontSize: 14, color: COLORS.ashLight, marginTop: 4 },
  closed: { marginTop: 10, color: COLORS.siliDark, fontWeight: '600' },
  list: { padding: 16, paddingBottom: 100, gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  product: { fontSize: 16, fontWeight: '600', color: COLORS.ash },
  price: { fontSize: 15, color: COLORS.sili, fontWeight: '700', marginTop: 4 },
  addBtn: { backgroundColor: COLORS.sili, paddingHorizontal: 18, paddingVertical: 9, borderRadius: RADIUS.sm },
  addText: { color: '#fff', fontWeight: '700' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepBtn: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.sili,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { color: COLORS.sili, fontSize: 18, fontWeight: '700' },
  qty: { fontSize: 16, fontWeight: '700', color: COLORS.ash, minWidth: 16, textAlign: 'center' },
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