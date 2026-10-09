import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ORDER_STEPS, STOPPED, stepIndex } from '../data/orderSteps';
import { peso } from '../utils/format';
import BanigBand from '../components/BanigBand';

export default function TrackOrder() {
  const { orderId } = useParams();
  const { orders, ordersLoading, cancelOrder } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    if (ordersLoading) return <p className="page-loading">Loading your order...</p>;
    return (
      <div className="page page-narrow">
        <div className="empty">
          <p className="empty-title">We couldn't find this order.</p>
          <Link to="/orders" className="link">
            See your orders
          </Link>
        </div>
      </div>
    );
  }

  const stopped = STOPPED[order.status];
  const current = stepIndex(order.status);
  const done = order.status === 'delivered';
  const title = stopped ? stopped.label : done ? 'Delivered. Enjoy!' : ORDER_STEPS[current].label;

  const onCancel = async () => {
    if (!window.confirm('Cancel this order?')) return;
    setBusy(true);
    setError('');
    try {
      await cancelOrder(order.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page page-narrow">
      <Link to="/orders" className="back-link">
        <ArrowLeft size={18} aria-hidden="true" />
        All orders
      </Link>
      <p className="muted small">
        {order.code}, {order.store?.name}
      </p>
      <h1 className="page-title">{title}</h1>
      <p className="muted">
        To {order.address}
        {order.landmark ? ` (${order.landmark})` : ''}
      </p>

      {order.status === 'declined' && (
        <p className="notice-box">Reason: {order.decline_reason}. You were not charged.</p>
      )}

      <div className="bleed track-band">
        <BanigBand id="track-band" height={10} />
      </div>

      {!stopped && (
        <ol className="timeline">
          {ORDER_STEPS.map((step, i) => (
            <li key={step.status} className={i <= current ? 'reached' : ''}>
              {step.label}
            </li>
          ))}
        </ol>
      )}

      <div className="panel">
        {(order.order_items ?? []).map((i) => (
          <div key={i.id} className="line">
            <span>
              {i.qty} × {i.name}
            </span>
            <span>{peso(Number(i.price) * i.qty)}</span>
          </div>
        ))}
        <div className="line">
          <span className="muted">Delivery fee</span>
          <span className="muted">{peso(order.delivery_fee)}</span>
        </div>
        <div className="line">
          <span className="muted">Service fee</span>
          <span className="muted">{peso(order.service_fee)}</span>
        </div>
        <div className="line line-total">
          <span>Total (cash on delivery)</span>
          <span>{peso(order.total)}</span>
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}
      {order.status === 'placed' && (
        <button type="button" className="btn btn-ghost btn-block place-btn" disabled={busy} onClick={onCancel}>
          {busy ? 'Cancelling...' : 'Cancel order'}
        </button>
      )}
      <Link to="/" className="btn btn-primary btn-block place-btn">
        Done
      </Link>
    </div>
  );
}