import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);
const ORDER_SELECT = '*, store:stores(name), order_items(*)';
const PENDING_KEY = 'hatodna-pending-email';

function readPendingEmail() {
  try {
    return sessionStorage.getItem(PENDING_KEY) ?? '';
  } catch {
    return '';
  }
}

function friendlyOtpError(error) {
  const message = error?.message ?? '';
  if (message.toLowerCase().includes('rate limit')) return 'Too many codes were sent. Please wait a few minutes and try again.';
  if (message.includes('security purposes')) return 'Please wait a minute before asking for another code.';
  if (message.toLowerCase().includes('invalid') && message.toLowerCase().includes('email')) return 'Enter a valid email address.';
  return message || 'We could not send the code. Please try again.';
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingEmail, setPendingEmail] = useState(readPendingEmail);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const userId = session?.user.id;

  const loadProfile = async (id) => {
    if (!id) {
      setProfile(null);
      return;
    }
    const { data } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
    setProfile(data ?? null);
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      await loadProfile(data.session?.user.id);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      // Supabase recommends not calling the database directly inside this callback.
      setTimeout(() => loadProfile(newSession?.user.id), 0);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const loadOrders = useCallback(async () => {
    if (!userId) {
      setOrders([]);
      setOrdersLoading(false);
      return;
    }
    const { data } = await supabase
      .from('orders')
      .select(ORDER_SELECT)
      .eq('customer_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    setOrders(data ?? []);
    setOrdersLoading(false);
  }, [userId]);

  // Loading data from Supabase (an external system) is a valid use of an effect.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOrders();
  }, [loadOrders]);

  // Live updates: the order status changes on screen the moment the store or rider updates it.
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`customer-orders-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `customer_id=eq.${userId}` },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setOrders((list) => list.map((o) => (o.id === payload.new.id ? { ...o, ...payload.new } : o)));
          } else {
            loadOrders();
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, loadOrders]);

  // Sends a 6-digit code to the email. The first login creates the customer account.
  const requestOtp = async (email) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true, data: { role: 'customer' } },
    });
    if (error) throw new Error(friendlyOtpError(error));
    setPendingEmail(email);
    try {
      sessionStorage.setItem(PENDING_KEY, email);
    } catch {
      // Storage blocked; the code still works during this visit.
    }
  };

  const verifyOtp = async (code) => {
    const { error } = await supabase.auth.verifyOtp({ email: pendingEmail, token: code, type: 'email' });
    if (error) throw new Error('That code is incorrect or has expired. Check your email and try again.');
    try {
      sessionStorage.removeItem(PENDING_KEY);
    } catch {
      // Ignore.
    }
  };

  const updateProfile = async (changes) => {
    const { data, error } = await supabase.from('profiles').update(changes).eq('id', userId).select().single();
    if (error) throw new Error('Could not save your profile. Please try again.');
    setProfile(data);
  };

  // Prices and fees are calculated by the database, never trusted from the browser.
  const placeOrder = async ({ storeId, items, address, landmark, note }) => {
    const { data, error } = await supabase.rpc('place_order', {
      p_store_id: storeId,
      p_items: items.map((i) => ({ product_id: i.id, qty: i.qty })),
      p_address: address,
      p_landmark: landmark,
      p_note: note,
      p_payment: 'cod',
    });
    if (error) throw new Error(error.message || 'Could not place your order. Please try again.');
    await loadOrders();
    return data;
  };

  const cancelOrder = async (orderId) => {
    const { data, error } = await supabase.rpc('cancel_order', { p_order_id: orderId });
    if (error) throw new Error(error.message || 'Could not cancel the order.');
    setOrders((list) => list.map((o) => (o.id === orderId ? { ...o, ...data } : o)));
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setOrders([]);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        loading,
        pendingEmail,
        orders,
        ordersLoading,
        requestOtp,
        verifyOtp,
        updateProfile,
        placeOrder,
        cancelOrder,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);