import React, { createContext, useContext, useState } from 'react';
import { Alert } from 'react-native';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [store, setStore] = useState(null); // the one store this cart belongs to
  const [items, setItems] = useState([]);   // [{ ...product, qty }]

  const addItem = (product, fromStore) => {
    // One rider picks up from one store, so the cart holds one store at a time.
    if (store && store.id !== fromStore.id) {
      Alert.alert(
        'Start a new cart?',
        `Your cart has items from ${store.name}. Adding this clears them.`,
        [
          { text: 'Keep cart', style: 'cancel' },
          {
            text: 'Start new cart',
            style: 'destructive',
            onPress: () => {
              setStore(fromStore);
              setItems([{ ...product, qty: 1 }]);
            },
          },
        ]
      );
      return;
    }
    setStore(fromStore);
    setItems((prev) => {
      const found = prev.find((i) => i.id === product.id);
      if (found) {
        return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeItem = (productId) => {
    setItems((prev) => {
      const next = prev
        .map((i) => (i.id === productId ? { ...i, qty: i.qty - 1 } : i))
        .filter((i) => i.qty > 0);
      if (next.length === 0) setStore(null);
      return next;
    });
  };

  const clearCart = () => {
    setItems([]);
    setStore(null);
  };

  const qtyOf = (productId) => items.find((i) => i.id === productId)?.qty ?? 0;
  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <CartContext.Provider
      value={{ store, items, addItem, removeItem, clearCart, qtyOf, itemCount, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);