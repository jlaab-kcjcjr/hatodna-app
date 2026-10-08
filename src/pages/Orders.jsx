import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ORDER_STEPS, statusOf } from '../data/orderSteps';
import { useNow } from '../utils/useNow';
import { peso, formatDate } from '../utils/format';
import { COLORS } from '../theme';
import MayonMark from '../components/MayonMark';

export default function Orders() {
  const { orders } = useAuth();
  const now = useNow(5000);

  return (
    <div className="page page-narrow">
      <h1 className="page-title">Your orders</h1>

      {orders.length === 0 ? (
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
            const step = statusOf(o, now);
            const done = step === ORDER_STEPS.length - 1;
            const count = o.items.reduce((sum, i) => sum + i.qty, 0);
            return (
              <li key={o.id}>
                <Link to={`/orders/${o.id}`} className="order-row">
                  <div className="order-row-main">
                    <p className="order-store">{o.storeName}</p>
                    <p className="muted small">
                      {formatDate(o.createdAt)}, {count} {count === 1 ? 'item' : 'items'}
                    </p>
                    <p className="order-total">{peso(o.total)}</p>
                  </div>
                  <span className={`pill ${done ? 'pill-open' : 'pill-progress'}`}>{ORDER_STEPS[step].short}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}