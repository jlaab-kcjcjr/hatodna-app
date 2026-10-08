import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { peso } from '../utils/format';

export default function CartBar() {
  const { itemCount, subtotal, store } = useCart();
  const navigate = useNavigate();
  if (itemCount === 0) return null;

  return (
    <button type="button" className="cartbar" onClick={() => navigate('/cart')}>
      <span className="cartbar-count">{itemCount}</span>
      <span className="cartbar-text">
        <span className="cartbar-title">View cart</span>
        <span className="cartbar-sub">{store?.name}</span>
      </span>
      <span className="cartbar-total">{peso(subtotal)}</span>
    </button>
  );
}