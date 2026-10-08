import React, { createContext, useContext, useState } from 'react';

// Demo only. Once the backend exists, a real code is sent by SMS.
export const DEMO_OTP = '123456';

export const ORDER_STEPS = [
  { short: 'Placed', label: 'Order placed' },
  { short: 'Preparing', label: 'Store is preparing your order' },
  { short: 'On the way', label: 'Rider is on the way' },
  { short: 'Delivered', label: 'Delivered' },
];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [pendingPhone, setPendingPhone] = useState('');
  const [orders, setOrders] = useState([]);

  // Later: call your backend here, which sends the SMS (e.g. via Semaphore).
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

  const updateOrderStatus = (orderId, statusIndex) =>
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, statusIndex } : o)));

  const addOrder = (order) => {
    setOrders((prev) => [order, ...prev]);
    // Demo only: move the order forward every 5 seconds. The backend will do this for real.
    for (let i = 1; i < ORDER_STEPS.length; i++) {
      setTimeout(() => updateOrderStatus(order.id, i), i * 5000);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, pendingPhone, orders, requestOtp, verifyOtp, updateProfile, logout, addOrder }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);