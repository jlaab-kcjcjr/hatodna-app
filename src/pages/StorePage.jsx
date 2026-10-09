import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Minus, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { fetchStore, etaOf, publicUrl } from '../lib/api';
import { peso } from '../utils/format';
import StoreArt from '../components/StoreArt';
import CartBar from '../components/CartBar';

export default function StorePage() {
  const { storeId } = useParams();
  const { addItem, removeItem, qtyOf } = useCart();
  const [data, setData] = useState({ loading: true, error: '', store: null });

  useEffect(() => {
    let cancelled = false;
    fetchStore(storeId)
      .then((store) => {
        if (!cancelled) setData({ loading: false, error: '', store });
      })
      .catch((err) => {
        if (!cancelled) setData({ loading: false, error: err.message, store: null });
      });
    return () => {
      cancelled = true;
    };
  }, [storeId]);

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
          <h1>{store.name}</h1>
          <p className="muted">
            {store.town}, {etaOf(store)}
          </p>
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
                <li key={p.id} className={`menu-item${p.is_available ? '' : ' is-soldout'}`}>
                  {p.image_path && <img className="menu-thumb" src={publicUrl('product-images', p.image_path)} alt="" />}
                  <div className="menu-text">
                    <p className="menu-name">{p.name}</p>
                    {p.description && <p className="muted small">{p.description}</p>}
                    <p className="menu-price">{p.is_available ? peso(p.price) : 'Sold out'}</p>
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
      </div>

      <CartBar />
    </div>
  );
}