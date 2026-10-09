import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ORDER_STEPS, STOPPED, stepIndex } from '../data/orderSteps';
import { useNow } from '../utils/useNow';
import { peso } from '../utils/format';
import BanigBand from '../components/BanigBand';
import RouteMap from '../components/RouteMap';

const TRACKING_STATUSES = ['preparing', 'ready', 'on_the_way'];
const STALE_AFTER_MS = 3 * 60 * 1000;

function updatedAgo(time, now) {
  const seconds = Math.max(0, Math.round((now - new Date(time).getTime()) / 1000));
  if (seconds < 60) return 'just now';
  return `${Math.floor(seconds / 60)} min ago`;
}

export default function TrackOrder() {
  const { orderId } = useParams();
  const { orders, ordersLoading, cancelOrder } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const now = useNow(10000);
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

  // Live map: shown while the order is active, with the rider's dot once a rider shares their location.
  const tracking = TRACKING_STATUSES.includes(order.status);
  const showRider = tracking && order.rider_id && order.rider_lat != null;
  const riderStale = showRider && now - new Date(order.rider_location_at).getTime() > STALE_AFTER_MS;
  const markers = [
    { id: 'store', kind: 'store', lat: order.store_lat, lng: order.store_lng, label: order.store?.name ?? 'Store' },
    { id: 'customer', kind: 'customer', lat: order.delivery_lat, lng: order.delivery_lng, label: 'You' },
    showRider ? { id: 'rider', kind: 'rider', lat: order.rider_lat, lng: order.rider_lng, label: 'Your rider' } : null,
  ];

  let mapCaption = 'Looking for a rider near the store...';
  if (order.rider_id && order.status === 'on_the_way') mapCaption = 'Your rider is on the way to you.';
  else if (order.rider_id) mapCaption = 'A rider is assigned and heading to the store.';

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
        {order.distance_km ? `, about ${order.distance_km} km` : ''}
      </p>

      {order.status === 'declined' && (
        <p className="notice-box">Reason: {order.decline_reason}. You were not charged.</p>
      )}

      {tracking && order.delivery_lat != null && (
        <section className="track-map">
          <RouteMap markers={markers} height="17rem" />
          <div className="map-legend">
            <span>
              <i style={{ background: '#B8202B' }} />
              Store
            </span>
            <span>
              <i style={{ background: '#2E5E3E' }} />
              You
            </span>
            {showRider && (
              <span>
                <i style={{ background: '#D8A23A' }} />
                Rider
              </span>
            )}
          </div>
          <p className="track-caption">
            {mapCaption}
            {showRider && ` Location updated ${updatedAgo(order.rider_location_at, now)}.`}
          </p>
          {riderStale && (
            <p className="muted small">
              The rider's location hasn't updated in a few minutes. They may be in an area with weak signal.
            </p>
          )}
        </section>
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