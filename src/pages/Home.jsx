import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, UserRoundPlus, ChevronRight } from 'lucide-react';
import { STORES, CATEGORIES } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { greeting, peso } from '../utils/format';
import StoreArt from '../components/StoreArt';
import BanigBand from '../components/BanigBand';
import CartBar from '../components/CartBar';

export default function Home() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const firstName = user.name ? user.name.split(' ')[0] : '';

  const stores = STORES.filter((s) => {
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

      {!user.name && (
        <Link to="/profile" className="nudge">
          <UserRoundPlus size={20} aria-hidden="true" />
          <span>Add your name and address so riders know who to look for.</span>
          <ChevronRight size={18} aria-hidden="true" />
        </Link>
      )}

      {stores.length === 0 ? (
        <div className="empty">
          <p className="empty-title">No stores match that search.</p>
          <p className="muted small">Try another word or category.</p>
        </div>
      ) : (
        <div className="store-grid">
          {stores.map((s) => (
            <Link key={s.id} to={`/store/${s.id}`} className={`store-card${s.isOpen ? '' : ' is-closed'}`}>
              <StoreArt store={s} />
              <div className="store-card-body">
                <div>
                  <h2 className="store-name">{s.name}</h2>
                  <p className="muted small">
                    {s.town}, {s.eta}
                  </p>
                </div>
                <span className={`pill ${s.isOpen ? 'pill-open' : 'pill-closed'}`}>{s.isOpen ? 'Open' : 'Closed'}</span>
              </div>
              <p className="store-fee">Delivery {peso(s.deliveryFee)}</p>
            </Link>
          ))}
        </div>
      )}

      <CartBar />
    </div>
  );
}