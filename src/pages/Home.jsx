import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, UserRoundPlus, ChevronRight, Star } from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { useAuth } from '../context/AuthContext';
import { fetchStores, fetchSettings, fetchStoreRatings, fetchProducts, estimateDeliveryFee, etaOf } from '../lib/api';
import { greeting, peso } from '../utils/format';
import StoreArt from '../components/StoreArt';
import StoreLogo from '../components/StoreLogo';
import ProductCard from '../components/ProductCard';
import BanigBand from '../components/BanigBand';
import CartBar from '../components/CartBar';
import { estimateRoadKm } from '../components/mapIcons';

const FEED_SIZE = 12;
const PER_STORE = 2; // so one big menu doesn't fill the whole row

// "Popular right now": open stores first, items with photos first, at most 2 per store.
function pickFeed(products) {
  const sorted = [...products].sort(
    (a, b) =>
      Number(b.store.is_open) - Number(a.store.is_open) ||
      Number(Boolean(b.image_path)) - Number(Boolean(a.image_path)) ||
      a.name.localeCompare(b.name)
  );
  const perStore = {};
  const feed = [];
  for (const p of sorted) {
    perStore[p.store.id] = (perStore[p.store.id] ?? 0) + 1;
    if (perStore[p.store.id] <= PER_STORE) feed.push(p);
    if (feed.length === FEED_SIZE) break;
  }
  return feed;
}

export default function Home() {
  const { profile } = useAuth();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [data, setData] = useState({ loading: true, error: '', stores: [], products: [], settings: null, ratings: {} });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchStores(), fetchSettings(), fetchStoreRatings(), fetchProducts()])
      .then(([stores, settings, ratings, products]) => {
        if (!cancelled) setData({ loading: false, error: '', stores, products, settings, ratings });
      })
      .catch((err) => {
        if (!cancelled) {
          setData({ loading: false, error: err.message, stores: [], products: [], settings: null, ratings: {} });
        }
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

  const q = query.trim().toLowerCase();
  const inCategory = (s) => category === 'All' || s.category === category;

  const stores = data.stores.filter((s) => inCategory(s) && s.name.toLowerCase().includes(q));

  const categoryProducts = data.products.filter((p) => inCategory(p.store));
  const productResults = q
    ? categoryProducts
        .filter((p) => `${p.name} ${p.description ?? ''} ${p.store.name}`.toLowerCase().includes(q))
        .sort(
          (a, b) =>
            Number(b.store.is_open) - Number(a.store.is_open) ||
            Number(b.name.toLowerCase().startsWith(q)) - Number(a.name.toLowerCase().startsWith(q)) ||
            a.name.localeCompare(b.name)
        )
        .slice(0, 30)
    : [];
  const feed = q ? [] : pickFeed(categoryProducts);
  const nothingFound = q && productResults.length === 0 && stores.length === 0;

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
          placeholder="Search food, items or stores"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search food, items or stores"
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
      ) : nothingFound ? (
        <div className="empty">
          <p className="empty-title">Nothing matches “{query.trim()}”.</p>
          <p className="muted small">Try another word, like “adobo”, “milk tea” or “rice”, or pick another category.</p>
        </div>
      ) : (
        <>
          {feed.length > 0 && (
            <section className="home-section">
              <h2 className="section-title">Popular right now</h2>
              <div className="product-rail">
                {feed.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}

          {productResults.length > 0 && (
            <section className="home-section">
              <h2 className="section-title">
                Items <span className="muted small">({productResults.length})</span>
              </h2>
              <div className="product-results">
                {productResults.map((p) => (
                  <ProductCard key={p.id} product={p} layout="row" />
                ))}
              </div>
            </section>
          )}

          {stores.length === 0 ? (
            !q && (
              <div className="empty">
                <p className="empty-title">{data.stores.length === 0 ? 'No stores yet.' : 'No stores in this category yet.'}</p>
                <p className="muted small">
                  {data.stores.length === 0
                    ? 'Partner stores are joining soon. Check back later.'
                    : 'Try another category.'}
                </p>
              </div>
            )
          ) : (
            <section className="home-section">
              <h2 className="section-title">{q ? 'Stores' : 'All stores'}</h2>
              <div className="store-grid">
                {stores.map((s) => (
                  <Link key={s.id} to={`/store/${s.id}`} className={`store-card${s.is_open ? '' : ' is-closed'}`}>
                    <StoreArt store={s} />
                    <div className="store-card-body">
                      <StoreLogo store={s} />
                      <div>
                        <h2 className="store-name">{s.name}</h2>
                        <p className="muted small">
                          {data.ratings[s.id] ? (
                            <span className="store-rating">
                              <Star size={13} aria-hidden="true" />
                              {Number(data.ratings[s.id].average).toFixed(1)} ({data.ratings[s.id].total}) ·{' '}
                            </span>
                          ) : null}
                          {s.town}, {etaOf(s)}
                        </p>
                      </div>
                      <span className={`pill ${s.is_open ? 'pill-open' : 'pill-closed'}`}>{s.is_open ? 'Open' : 'Closed'}</span>
                    </div>
                    <p className="store-fee">{feeLine(s)}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <CartBar />
    </div>
  );
}