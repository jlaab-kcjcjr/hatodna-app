import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS } from '../theme';
import { useCart } from '../context/CartContext';

export default function CartBar({ onPress, bottom = 16 }) {
  const { itemCount, subtotal, store } = useCart();
  if (itemCount === 0) return null;

  return (
    <Pressable style={[styles.bar, { bottom }]} onPress={onPress}>
      <View style={styles.count}>
        <Text style={styles.countText}>{itemCount}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>View cart</Text>
        <Text style={styles.sub} numberOfLines={1}>{store?.name}</Text>
      </View>
      <Text style={styles.total}>₱{subtotal}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: COLORS.ink,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  count: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.abaca,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: { fontFamily: FONTS.heavy, color: COLORS.ink, fontSize: 14 },
  title: { fontFamily: FONTS.semi, color: '#FFFFFF', fontSize: 15 },
  sub: { fontFamily: FONTS.body, color: '#CBBDB5', fontSize: 12 },
  total: { fontFamily: FONTS.heavy, color: COLORS.abaca, fontSize: 17 },
});