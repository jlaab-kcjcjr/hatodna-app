import { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'hatodna-cart-v1';

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [saved] = useState(loadSaved);
  const [store, setStore] = useState(saved?.store ?? null); // the one store this cart belongs to
  const [items, setItems] = useState(saved?.items ?? []); // [{ ...product, qty }]

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ store, items }));
    } catch {
      // Storage is blocked; the cart still works for this visit.
    }
  }, [store, items]);

  const addItem = (product, fromStore) => {
    // One rider picks up from one store, so the cart holds one store at a time.
    if (store && store.id !== fromStore.id) {
      const ok = window.confirm(
        `Your cart has items from ${store.name}. Start a new cart with ${fromStore.name} instead?`
      );
      if (!ok) return;
      setStore(fromStore);
      setItems([{ ...product, qty: 1 }]);
      return;
    }
    setStore(fromStore);
    setItems((prev) => {
      const found = prev.find((i) => i.id === product.id);
      if (found) return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
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
    <CartContext.Provider value={{ store, items, addItem, removeItem, clearCart, qtyOf, itemCount, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);