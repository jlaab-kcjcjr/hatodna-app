import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { peso } from '../utils/format';

const PAYMENT_OPTIONS = [
  { label: 'Cash on delivery', available: true },
  { label: 'GCash', available: false },
];

export default function Cart() {
  const { store, items, addItem, removeItem, clearCart, subtotal } = useCart();
  const { user, addOrder, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState(user.address);
  const [landmark, setLandmark] = useState(user.landmark);
  const [payment, setPayment] = useState('Cash on delivery');
  const [error, setError] = useState('');

  if (!store) {
    return (
      <div className="page page-narrow">
        <div className="empty">
          <p className="empty-title">Your cart is empty</p>
          <p className="muted small">Add food from any open store to get started.</p>
          <Link to="/" className="btn btn-primary empty-btn">
            Browse stores
          </Link>
        </div>
      </div>
    );
  }

  const total = subtotal + store.deliveryFee;

  const placeOrder = (e) => {
    e.preventDefault();
    if (!address.trim()) {
      setError('Enter your street and barangay so the rider can find you.');
      return;
    }
    const order = {
      id: Date.now().toString(),
      storeId: store.id,
      storeName: store.name,
      items,
      address: address.trim(),
      landmark: landmark.trim(),
      payment,
      subtotal,
      deliveryFee: store.deliveryFee,
      total,
      createdAt: Date.now(),
    };
    // Save the first address used as the default for next time.
    if (!user.address) updateProfile({ address: order.address, landmark: order.landmark });
    addOrder(order);
    clearCart();
    navigate(`/orders/${order.id}`, { replace: true });
  };

  return (
    <form className="page page-narrow" onSubmit={placeOrder}>
      <h1 className="page-title">Your cart</h1>

      <h2 className="section-title">From {store.name}</h2>
      <div className="panel">
        {items.map((i) => (
          <div key={i.id} className="line">
            <span className="line-name">{i.name}</span>
            <div className="stepper">
              <button type="button" className="step-btn" onClick={() => removeItem(i.id)} aria-label={`Remove one ${i.name}`}>
                <Minus size={16} />
              </button>
              <span className="step-qty">{i.qty}</span>
              <button type="button" className="step-btn" onClick={() => addItem(i, store)} aria-label={`Add one more ${i.name}`}>
                <Plus size={16} />
              </button>
            </div>
            <span className="line-amount">{peso(i.price * i.qty)}</span>
          </div>
        ))}
      </div>

      <h2 className="section-title">Deliver to</h2>
      <label className="field">
        <span>Street, barangay, town</span>
        <input
          className={error ? 'has-error' : ''}
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
            setError('');
          }}
          autoComplete="street-address"
        />
      </label>
      {error && <p className="form-error">{error}</p>}
      <label className="field">
        <span>Landmark</span>
        <input
          value={landmark}
          onChange={(e) => setLandmark(e.target.value)}
          placeholder="Near the chapel, blue gate"
        />
      </label>

      <h2 className="section-title">Payment</h2>
      <div className="options" role="radiogroup" aria-label="Payment method">
        {PAYMENT_OPTIONS.map((p) => (
          <label
            key={p.label}
            className={`option${payment === p.label ? ' active' : ''}${p.available ? '' : ' disabled'}`}
          >
            <input
              type="radio"
              name="payment"
              value={p.label}
              checked={payment === p.label}
              disabled={!p.available}
              onChange={() => setPayment(p.label)}
            />
            <span>{p.label}</span>
            {!p.available && <span className="muted small">Coming soon</span>}
          </label>
        ))}
      </div>

      <div className="panel totals">
        <div className="line">
          <span className="muted">Subtotal</span>
          <span className="muted">{peso(subtotal)}</span>
        </div>
        <div className="line">
          <span className="muted">Delivery fee</span>
          <span className="muted">{peso(store.deliveryFee)}</span>
        </div>
        <div className="line line-total">
          <span>Total</span>
          <span>{peso(total)}</span>
        </div>
      </div>

      <button type="submit" className="btn btn-primary btn-block place-btn">
        Place order, {peso(total)}
      </button>
    </form>
  );
}