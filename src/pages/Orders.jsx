import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { shortStatus } from '../data/orderSteps';
import { peso, formatDate } from '../utils/format';
import { COLORS } from '../theme';
import MayonMark from '../components/MayonMark';

const pillClass = (status) => {
  if (status === 'delivered') return 'pill-open';
  if (status === 'declined' || status === 'cancelled') return 'pill-closed';
  return 'pill-progress';
};

export default function Orders() {
  const { orders, ordersLoading } = useAuth();

  return (
    <div className="page page-narrow">
      <h1 className="page-title">Your orders</h1>

      {ordersLoading ? (
        <p className="page-loading">Loading your orders...</p>
      ) : orders.length === 0 ? (
        <div className="empty">
          <div className="empty-art">
            <MayonMark color={COLORS.line} sun={COLORS.abacaSoft} />
          </div>
          <p className="empty-title">No orders yet</p>
          <p className="muted small">Your current and past orders will show up here.</p>
          <Link to="/" className="btn btn-primary empty-btn">
            Browse stores
          </Link>
        </div>
      ) : (
        <ul className="order-list">
          {orders.map((o) => {
            const count = (o.order_items ?? []).reduce((sum, i) => sum + i.qty, 0);
            return (
              <li key={o.id}>
                <Link to={`/orders/${o.id}`} className="order-row">
                  <div className="order-row-main">
                    <p className="order-store">{o.store?.name ?? 'Store'}</p>
                    <p className="muted small">
                      {formatDate(o.created_at)}, {count} {count === 1 ? 'item' : 'items'}
                    </p>
                    <p className="order-total">{peso(o.total)}</p>
                  </div>
                  <span className={`pill ${pillClass(o.status)}`}>{shortStatus(o.status)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}