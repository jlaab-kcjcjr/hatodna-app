import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { fetchStore, fetchProductRatings, fetchStoreReviews, fetchStoreRatings, etaOf, publicUrl } from '../lib/api';
import { peso } from '../utils/format';
import StoreArt from '../components/StoreArt';
import StoreLogo from '../components/StoreLogo';
import CartBar from '../components/CartBar';

export default function StorePage() {
  const { storeId } = useParams();
  const { addItem, removeItem, qtyOf } = useCart();
  const { hash } = useLocation();
  const targetId = hash.startsWith('#p-') ? hash.slice(3) : null;
  const [data, setData] = useState({ loading: true, error: '', store: null, itemRatings: {}, reviews: [], rating: null });

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchStore(storeId), fetchProductRatings(storeId), fetchStoreReviews(storeId), fetchStoreRatings()])
      .then(([store, itemRatings, reviews, ratings]) => {
        if (!cancelled) {
          setData({ loading: false, error: '', store, itemRatings, reviews, rating: ratings[storeId] ?? null });
        }
      })
      .catch((err) => {
        if (!cancelled) setData({ loading: false, error: err.message, store: null, itemRatings: {}, reviews: [], rating: null });
      });
    return () => {
      cancelled = true;
    };
  }, [storeId]);

  // Coming from a product on Home: scroll to that item once the menu has loaded.
  useEffect(() => {
    if (data.loading || !targetId) return;
    document.getElementById(`p-${targetId}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [data.loading, targetId]);

  if (data.loading) return <p className="page-loading">Loading menu...</p>;

  if (!data.store) {
    return (
      <div className="page">
        <div className="empty">
          <p className="empty-title">{data.error || "We couldn't find that store."}</p>
          <Link to="/" className="link">
            Back to stores
          </Link>
        </div>
      </div>
    );
  }

  const store = data.store;
  const cartStore = { id: store.id, name: store.name, town: store.town };
  const products = [...(store.products ?? [])].sort(
    (a, b) => Number(b.is_available) - Number(a.is_available) || a.name.localeCompare(b.name)
  );

  return (
    <div className="store-page">
      <div className="store-hero">
        <StoreArt store={store} className="store-hero-art" />
        <Link to="/" className="back-btn" aria-label="Back to stores">
          <ArrowLeft size={20} />
        </Link>
      </div>

      <div className="page store-body">
        <section className="store-info">
          <div className="store-info-head">
            <StoreLogo store={store} size="lg" />
            <div className="store-info-text">
              <h1>{store.name}</h1>
              <p className="muted">
                {data.rating ? (
                  <span className="store-rating">
                    <Star size={14} aria-hidden="true" />
                    {Number(data.rating.average).toFixed(1)} ({data.rating.total}{' '}
                    {data.rating.total === 1 ? 'rating' : 'ratings'}) ·{' '}
                  </span>
                ) : null}
                {store.town}, {etaOf(store)}
              </p>
            </div>
          </div>
          <p className="muted">{store.address}</p>
          {!store.is_open && <p className="closed-box">Closed right now. You can browse the menu but not order yet.</p>}
        </section>

        <h2 className="section-title">Menu</h2>
        {products.length === 0 ? (
          <p className="muted">This store hasn't added its menu yet.</p>
        ) : (
          <ul className="menu">
            {products.map((p) => {
              const qty = qtyOf(p.id);
              const canOrder = store.is_open && p.is_available;
              return (
                <li
                  key={p.id}
                  id={`p-${p.id}`}
                  className={`menu-item${p.is_available ? '' : ' is-soldout'}${p.id === targetId ? ' is-target' : ''}`}
                >
                  {p.image_path && <img className="menu-thumb" src={publicUrl('product-images', p.image_path)} alt="" />}
                  <div className="menu-text">
                    <p className="menu-name">{p.name}</p>
                    {p.description && <p className="muted small">{p.description}</p>}
                    <p className="menu-price">
                      {p.is_available ? peso(p.price) : 'Sold out'}
                      {data.itemRatings[p.id] && (
                        <span className="menu-rating">
                          <Star size={12} aria-hidden="true" />
                          {Number(data.itemRatings[p.id].average).toFixed(1)} ({data.itemRatings[p.id].total})
                        </span>
                      )}
                    </p>
                  </div>
                  {qty === 0 ? (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      disabled={!canOrder}
                      onClick={() => addItem({ id: p.id, name: p.name, price: Number(p.price) }, cartStore)}
                    >
                      Add
                    </button>
                  ) : (
                    <div className="stepper">
                      <button
                        type="button"
                        className="step-btn"
                        onClick={() => removeItem(p.id)}
                        aria-label={`Remove one ${p.name}`}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="step-qty" aria-live="polite">
                        {qty}
                      </span>
                      <button
                        type="button"
                        className="step-btn"
                        disabled={!canOrder}
                        onClick={() => addItem({ id: p.id, name: p.name, price: Number(p.price) }, cartStore)}
                        aria-label={`Add one more ${p.name}`}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {data.reviews.length > 0 && (
          <>
            <h2 className="section-title">What customers say</h2>
            <ul className="store-reviews">
              {data.reviews.map((r, i) => (
                <li key={`${r.created_at}-${i}`}>
                  <p>
                    <span className="review-stars" aria-label={`${r.stars} out of 5 stars`}>
                      {'★'.repeat(r.stars)}
                      <span className="review-off">{'★'.repeat(5 - r.stars)}</span>
                    </span>{' '}
                    <strong>{r.reviewer}</strong>
                  </p>
                  {r.tags?.length > 0 && <p className="muted small">{r.tags.join(' · ')}</p>}
                  {r.comment && <p className="review-comment">“{r.comment}”</p>}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <CartBar />
    </div>
  );
}