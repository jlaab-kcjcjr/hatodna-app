import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import AppLayout from './components/AppLayout';
import Login from './pages/Login';
import Verify from './pages/Verify';
import InstallGuide from './pages/InstallGuide';
import Home from './pages/Home';
import StorePage from './pages/StorePage';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import TrackOrder from './pages/TrackOrder';
import Profile from './pages/Profile';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/install" element={<InstallGuide />} />
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Home />} />
            <Route path="store/:storeId" element={<StorePage />} />
            <Route path="cart" element={<Cart />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:orderId" element={<TrackOrder />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}