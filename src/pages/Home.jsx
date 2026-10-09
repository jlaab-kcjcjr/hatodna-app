import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, UserRoundPlus, ChevronRight } from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { useAuth } from '../context/AuthContext';
import { fetchStores, fetchSettings, estimateDeliveryFee, etaOf } from '../lib/api';
import { greeting, peso } from '../utils/format';
import StoreArt from '../components/StoreArt';
import BanigBand from '../components/BanigBand';
import CartBar from '../components/CartBar';
import { estimateRoadKm } from '../components/mapIcons';

export default function Home() {
  const { profile } = useAuth();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [data, setData] = useState({ loading: true, error: '', stores: [], settings: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchStores(), fetchSettings()])
      .then(([stores, settings]) => {
        if (!cancelled) setData({ loading: false, error: '', stores, settings });
      })
      .catch((err) => {
        if (!cancelled) setData({ loading: false, error: err.message, stores: [], settings: null });
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = () => {
    setData((d) => ({ ...d, loading: true, error: '' }));
    setAttempt((a) => a + 1);
  };

  const firstName = profile?.full_name ? profile.full_name.split(' ')[0] : '';
  const needsProfile = profile && (!profile.full_name || !profile.phone || !profile.default_address);
  const home = profile?.default_lat != null ? { lat: profile.default_lat, lng: profile.default_lng } : null;
  const feeLine = (s) => {
    const km = estimateRoadKm(s.lat != null ? { lat: s.lat, lng: s.lng } : null, home);
    if (km == null) return home ? 'Location not set yet' : 'Pin your location in Profile to see fees';
    const fee = estimateDeliveryFee(data.settings, km);
    return fee != null ? `${km} km away, delivery ${peso(fee)}` : `${km} km away`;
  };
  const stores = data.stores.filter((s) => {
    const matchCategory = category === 'All' || s.category === category;
    const matchQuery = s.name.toLowerCase().includes(query.toLowerCase());
    return matchCategory && matchQuery;
  });

  return (
    <div className="page">
      <header className="home-head">
        <p className="greet">
          {greeting()}
          {firstName ? `, ${firstName}` : ''}
        </p>
        <h1>What are we bringing you today?</h1>
      </header>

      <label className="search">
        <Search size={18} aria-hidden="true" />
        <input
          type="search"
          placeholder="Search stores in Albay"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search stores"
        />
      </label>

      <div className="bleed">
        <BanigBand id="home-band" height={12} />
      </div>

      <div className="chips" role="group" aria-label="Store categories">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            className={`chip${category === c ? ' active' : ''}`}
            aria-pressed={category === c}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {needsProfile && (
        <Link to="/profile" className="nudge">
          <UserRoundPlus size={20} aria-hidden="true" />
          <span>Add your name, mobile number, and address so riders can find and call you.</span>
          <ChevronRight size={18} aria-hidden="true" />
        </Link>
      )}

      {data.loading ? (
        <p className="page-loading">Loading stores...</p>
      ) : data.error ? (
        <div className="empty">
          <p className="empty-title">{data.error}</p>
          <button type="button" className="btn btn-primary empty-btn" onClick={retry}>
            Try again
          </button>
        </div>
      ) : stores.length === 0 ? (
        <div className="empty">
          <p className="empty-title">{data.stores.length === 0 ? 'No stores yet.' : 'No stores match that search.'}</p>
          <p className="muted small">
            {data.stores.length === 0
              ? 'Partner stores are joining soon. Check back later.'
              : 'Try another word or category.'}
          </p>
        </div>
      ) : (
        <div className="store-grid">
          {stores.map((s) => (
            <Link key={s.id} to={`/store/${s.id}`} className={`store-card${s.is_open ? '' : ' is-closed'}`}>
              <StoreArt store={s} />
              <div className="store-card-body">
                <div>
                  <h2 className="store-name">{s.name}</h2>
                  <p className="muted small">
                    {s.town}, {etaOf(s)}
                  </p>
                </div>
                <span className={`pill ${s.is_open ? 'pill-open' : 'pill-closed'}`}>{s.is_open ? 'Open' : 'Closed'}</span>
              </div>
              <p className="store-fee">{feeLine(s)}</p>
            </Link>
          ))}
        </div>
      )}

      <CartBar />
    </div>
  );
}