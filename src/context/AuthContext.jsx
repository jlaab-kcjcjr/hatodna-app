import { createContext, useContext, useEffect, useState } from 'react';
import { DEMO_OTP } from '../data/orderSteps';

const STORAGE_KEY = 'hatodna-customer-v1';

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [saved] = useState(loadSaved);
  const [user, setUser] = useState(saved?.user ?? null);
  const [orders, setOrders] = useState(saved?.orders ?? []);
  const [pendingPhone, setPendingPhone] = useState(saved?.pendingPhone ?? '');

  // Demo only: keeps the login and orders after a refresh. Later, the backend stores this.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, orders, pendingPhone }));
    } catch {
      // Storage is blocked; the site still works for this visit.
    }
  }, [user, orders, pendingPhone]);

  // Later: call the backend here, which sends a real SMS (e.g. via Semaphore).
  const requestOtp = (phone) => setPendingPhone(phone);

  const verifyOtp = (code) => {
    if (code !== DEMO_OTP) return false;
    setUser({ phone: pendingPhone, name: '', address: '', landmark: '' });
    return true;
  };

  const updateProfile = (changes) => setUser((u) => ({ ...u, ...changes }));

  const logout = () => {
    setUser(null);
    setOrders([]);
    setPendingPhone('');
  };

  const addOrder = (order) => setOrders((prev) => [order, ...prev]);

  return (
    <AuthContext.Provider
      value={{ user, pendingPhone, orders, requestOtp, verifyOtp, updateProfile, logout, addOrder }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);