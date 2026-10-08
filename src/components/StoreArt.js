import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, CATEGORY_ART } from '../theme';
import BanigBand from './BanigBand';

// Shows the store's photo if it has one; otherwise an illustrated tile.
export default function StoreArt({ store, height = 120, radius = 0 }) {
  const art = CATEGORY_ART[store.category] ?? CATEGORY_ART.Food;
  const initials = store.name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('');

  if (store.image) {
    const source = typeof store.image === 'string' ? { uri: store.image } : store.image;
    return (
      <Image source={source} style={{ width: '100%', height, borderRadius: radius }} resizeMode="cover" />
    );
  }

  return (
    <View style={[styles.tile, { height, borderRadius: radius, backgroundColor: art.bg }]}>
      <Text style={[styles.initials, { color: art.fg, fontSize: height * 0.42 }]}>{initials}</Text>
      <Ionicons name={art.icon} size={22} color={art.fg} style={styles.icon} />
      <View style={styles.band}>
        <BanigBand id={`band-${store.id}`} height={10} ground={art.fg} first={art.bg} second={COLORS.abaca} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { width: '100%', overflow: 'hidden', justifyContent: 'center', paddingHorizontal: 20 },
  initials: { fontFamily: FONTS.display, letterSpacing: -1 },
  icon: { position: 'absolute', top: 14, right: 16 },
  band: { position: 'absolute', left: 0, right: 0, bottom: 0 },
});