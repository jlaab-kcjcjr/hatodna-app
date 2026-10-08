import { useEffect } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Store, Receipt, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BRAND } from '../theme';

const TABS = [
  { to: '/', label: 'Home', Icon: Store, end: true },
  { to: '/orders', label: 'Orders', Icon: Receipt },
  { to: '/profile', label: 'Profile', Icon: UserRound },
];

// Top menu on tablets and computers, bottom tab bar on phones.
export default function AppLayout() {
  const { user } = useAuth();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="app">
      <header className="topbar">
        <Link to="/" className="topbar-brand">
          {BRAND.name}
        </Link>
        <nav className="topnav" aria-label="Main">
          {TABS.map(({ to, label, Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `topnav-link${isActive ? ' active' : ''}`}>
              <Icon size={18} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="app-main">
        <Outlet />
      </main>

      <nav className="tabbar" aria-label="Main">
        {TABS.map(({ to, label, Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `tab-link${isActive ? ' active' : ''}`}>
            <Icon size={22} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}