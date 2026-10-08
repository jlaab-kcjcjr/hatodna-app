import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, RADIUS } from '../theme';
import { STORES } from '../data/mockData';
import { useCart } from '../context/CartContext';
import StoreArt from '../components/StoreArt';
import CartBar from '../components/CartBar';

export default function StoreScreen({ route, navigation }) {
  const store = STORES.find((s) => s.id === route.params.storeId);
  const insets = useSafeAreaInsets();
  const { addItem, removeItem, qtyOf } = useCart();

  const header = (
    <View>
      <StoreArt store={store} height={250} />
      <View style={styles.info}>
        <Text style={styles.name}>{store.name}</Text>
        <Text style={styles.meta}>
          {store.town}, {store.eta}
        </Text>
        <Text style={styles.meta}>Delivery fee ₱{store.deliveryFee}</Text>
        {!store.isOpen && (
          <View style={styles.closedBox}>
            <Text style={styles.closedText}>Closed right now. You can browse the menu but not order yet.</Text>
          </View>
        )}
      </View>
      <Text style={styles.section}>Menu</Text>
    </View>
  );

  return (
    <View style={styles.page}>
      <StatusBar style="light" />
      <FlatList
        data={store.products}
        keyExtractor={(p) => p.id}
        ListHeaderComponent={header}
        contentContainerStyle={{ paddingBottom: 130 }}
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
      <CartBar bottom={insets.bottom + 12} onPress={() => navigation.navigate('Cart')} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.page },
  info: {
    marginTop: -30,
    marginHorizontal: 16,
    padding: 18,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  name: { fontFamily: FONTS.display, fontSize: 26, color: COLORS.ink, marginBottom: 6 },
  meta: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.inkSoft, marginTop: 2 },
  closedBox: { marginTop: 12, padding: 12, borderRadius: RADIUS.sm, backgroundColor: COLORS.siliSoft },
  closedText: { fontFamily: FONTS.semi, fontSize: 13, color: COLORS.siliDeep },
  section: { fontFamily: FONTS.display, fontSize: 20, color: COLORS.ink, marginHorizontal: 20, marginTop: 24, marginBottom: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  product: { fontFamily: FONTS.semi, fontSize: 16, color: COLORS.ink },
  price: { fontFamily: FONTS.heavy, fontSize: 15, color: COLORS.sili, marginTop: 4 },
  addBtn: { backgroundColor: COLORS.sili, paddingHorizontal: 18, paddingVertical: 9, borderRadius: RADIUS.sm },
  addText: { fontFamily: FONTS.heavy, color: '#FFFFFF' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepBtn: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.sm,
    borderWidth: 1.5,
    borderColor: COLORS.sili,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { fontFamily: FONTS.heavy, fontSize: 18, color: COLORS.sili },
  qty: { fontFamily: FONTS.heavy, fontSize: 16, color: COLORS.ink, minWidth: 16, textAlign: 'center' },
});