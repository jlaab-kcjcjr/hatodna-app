import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { fetchSettings, estimateDeliveryFee } from '../lib/api';
import { peso } from '../utils/format';

// "+639171234567" -> "09171234567" for display
const toLocal = (phone) => (phone?.startsWith('+63') ? `0${phone.slice(3)}` : phone ?? '');

// "0917 123 4567" -> "+639171234567", or null if it isn't a valid PH mobile number
function toInternational(input) {
  let digits = input.replace(/\D/g, '');
  if (digits.startsWith('63')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = digits.slice(1);
  return /^9\d{9}$/.test(digits) ? `+63${digits}` : null;
}

function CheckoutForm({ profile }) {
  const { store, items, addItem, removeItem, clearCart, subtotal } = useCart();
  const { updateProfile, placeOrder } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState({
    name: profile.full_name ?? '',
    phone: toLocal(profile.phone),
    address: profile.default_address ?? '',
    landmark: profile.landmark ?? '',
    note: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchSettings().then((s) => {
      if (!cancelled) setSettings(s);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setError('');
  };

  const deliveryFee = estimateDeliveryFee(settings);
  const serviceFee = settings ? Number(settings.service_fee) : null;
  const estimatedTotal = deliveryFee !== null ? subtotal + deliveryFee + serviceFee : null;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.name.trim().length < 2) return setError('Enter your name so the store and rider know who ordered.');
    const phone = toInternational(form.phone);
    if (!phone) return setError('Enter your mobile number, like 0917 123 4567, so the rider can call you.');
    if (!form.address.trim()) return setError('Enter your street and barangay so the rider can find you.');

    setBusy(true);
    setError('');
    try {
      // Save name, phone, and the first address to the profile, so the order includes them.
      const changes = {};
      if (form.name.trim() !== profile.full_name) changes.full_name = form.name.trim();
      if (phone !== profile.phone) changes.phone = phone;
      if (!profile.default_address) {
        changes.default_address = form.address.trim();
        changes.landmark = form.landmark.trim();
      }
      if (Object.keys(changes).length > 0) await updateProfile(changes);

      const order = await placeOrder({
        storeId: store.id,
        items,
        address: form.address.trim(),
        landmark: form.landmark.trim(),
        note: form.note.trim(),
      });
      clearCart();
      navigate(`/orders/${order.id}`, { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <form className="page page-narrow" onSubmit={onSubmit}>
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

      <h2 className="section-title">Your details</h2>
      <label className="field">
        <span>Name</span>
        <input value={form.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" />
      </label>
      <label className="field">
        <span>Mobile number (for the rider)</span>
        <input
          type="tel"
          inputMode="tel"
          value={form.phone}
          onChange={(e) => set('phone', e.target.value)}
          placeholder="0917 123 4567"
          autoComplete="tel"
        />
      </label>

      <h2 className="section-title">Deliver to</h2>
      <label className="field">
        <span>Street, barangay, town</span>
        <input value={form.address} onChange={(e) => set('address', e.target.value)} autoComplete="street-address" />
      </label>
      <label className="field">
        <span>Landmark</span>
        <input value={form.landmark} onChange={(e) => set('landmark', e.target.value)} placeholder="Near the chapel, blue gate" />
      </label>
      <label className="field">
        <span>Note for the store (optional)</span>
        <input value={form.note} onChange={(e) => set('note', e.target.value)} placeholder="Extra rice, less spicy po" />
      </label>

      <h2 className="section-title">Payment</h2>
      <div className="options">
        <label className="option active">
          <input type="radio" name="payment" checked readOnly />
          <span>Cash on delivery</span>
        </label>
        <label className="option disabled">
          <input type="radio" name="payment" disabled />
          <span>GCash</span>
          <span className="muted small">Coming soon</span>
        </label>
      </div>

      <div className="panel totals">
        <div className="line">
          <span className="muted">Subtotal</span>
          <span className="muted">{peso(subtotal)}</span>
        </div>
        <div className="line">
          <span className="muted">Delivery fee</span>
          <span className="muted">{deliveryFee !== null ? peso(deliveryFee) : '...'}</span>
        </div>
        <div className="line">
          <span className="muted">Service fee</span>
          <span className="muted">{serviceFee !== null ? peso(serviceFee) : '...'}</span>
        </div>
        <div className="line line-total">
          <span>Total</span>
          <span>{estimatedTotal !== null ? peso(estimatedTotal) : '...'}</span>
        </div>
      </div>
      <p className="muted small form-note">The final amount is confirmed when you place the order.</p>

      {error && <p className="form-error">{error}</p>}
      <button type="submit" className="btn btn-primary btn-block place-btn" disabled={busy}>
        {busy ? 'Placing order...' : 'Place order'}
      </button>
    </form>
  );
}

export default function Cart() {
  const { store } = useCart();
  const { profile } = useAuth();

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

  if (!profile) return <p className="page-loading">Loading...</p>;
  return <CheckoutForm profile={profile} />;
}