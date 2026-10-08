import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Minus, Plus } from 'lucide-react';
import { STORES } from '../data/mockData';
import { useCart } from '../context/CartContext';
import { peso } from '../utils/format';
import StoreArt from '../components/StoreArt';
import CartBar from '../components/CartBar';

export default function StorePage() {
  const { storeId } = useParams();
  const store = STORES.find((s) => s.id === storeId);
  const { addItem, removeItem, qtyOf } = useCart();

  if (!store) {
    return (
      <div className="page">
        <div className="empty">
          <p className="empty-title">We couldn't find that store.</p>
          <Link to="/" className="link">
            Back to stores
          </Link>
        </div>
      </div>
    );
  }

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
            {store.town}, {store.eta}
          </p>
          <p className="muted">Delivery fee {peso(store.deliveryFee)}</p>
          {!store.isOpen && <p className="closed-box">Closed right now. You can browse the menu but not order yet.</p>}
        </section>

        <h2 className="section-title">Menu</h2>
        <ul className="menu">
          {store.products.map((p) => {
            const qty = qtyOf(p.id);
            return (
              <li key={p.id} className="menu-item">
                <div className="menu-text">
                  <p className="menu-name">{p.name}</p>
                  <p className="menu-price">{peso(p.price)}</p>
                </div>
                {qty === 0 ? (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={!store.isOpen}
                    onClick={() => addItem(p, store)}
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
                      onClick={() => addItem(p, store)}
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
      </div>

      <CartBar />
    </div>
  );
}