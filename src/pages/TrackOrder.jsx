import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ORDER_STEPS, statusOf } from '../data/orderSteps';
import { useNow } from '../utils/useNow';
import { peso } from '../utils/format';
import BanigBand from '../components/BanigBand';

export default function TrackOrder() {
  const { orderId } = useParams();
  const { orders } = useAuth();
  const now = useNow(1000);
  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <div className="page page-narrow">
        <div className="empty">
          <p className="empty-title">This order is no longer available.</p>
          <Link to="/orders" className="link">
            See your orders
          </Link>
        </div>
      </div>
    );
  }

  const current = statusOf(order, now);
  const done = current === ORDER_STEPS.length - 1;

  return (
    <div className="page page-narrow">
      <Link to="/orders" className="back-link">
        <ArrowLeft size={18} aria-hidden="true" />
        All orders
      </Link>
      <h1 className="page-title">{done ? 'Delivered. Enjoy!' : ORDER_STEPS[current].label}</h1>
      <p className="muted">
        {order.storeName} to {order.address}
        {order.landmark ? ` (${order.landmark})` : ''}
      </p>

      <div className="bleed track-band">
        <BanigBand id="track-band" height={10} />
      </div>

      <ol className="timeline">
        {ORDER_STEPS.map((step, i) => (
          <li key={step.short} className={i <= current ? 'reached' : ''}>
            {step.label}
          </li>
        ))}
      </ol>

      <div className="panel">
        {order.items.map((i) => (
          <div key={i.id} className="line">
            <span>
              {i.qty} × {i.name}
            </span>
            <span>{peso(i.price * i.qty)}</span>
          </div>
        ))}
        <div className="line">
          <span className="muted">Delivery fee</span>
          <span className="muted">{peso(order.deliveryFee)}</span>
        </div>
        <div className="line line-total">
          <span>Total ({order.payment})</span>
          <span>{peso(order.total)}</span>
        </div>
      </div>

      <Link to="/" className="btn btn-primary btn-block place-btn">
        Done
      </Link>
    </div>
  );
}