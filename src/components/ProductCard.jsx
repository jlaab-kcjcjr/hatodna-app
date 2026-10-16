import { Link } from 'react-router-dom';
import { publicUrl } from '../lib/api';
import { peso } from '../utils/format';

// One product from a partner store. Tapping it opens the store page and jumps to that item.
export default function ProductCard({ product, layout = 'tile' }) {
  const store = product.store;
  const closed = !store.is_open;
  return (
    <Link
      to={`/store/${store.id}#p-${product.id}`}
      className={`product-${layout}${closed ? ' is-closed' : ''}`}
      aria-label={`${product.name}, ${peso(product.price)}, from ${store.name}${closed ? ', closed now' : ''}`}
    >
      <div className="product-photo">
        {product.image_path ? (
          <img src={publicUrl('product-images', product.image_path)} alt="" loading="lazy" />
        ) : (
          <span aria-hidden="true">{product.name.charAt(0).toUpperCase()}</span>
        )}
      </div>
      <div className="product-text">
        <p className="product-name">{product.name}</p>
        {layout === 'row' && product.description && <p className="muted small product-desc">{product.description}</p>}
        <p className="product-price">{peso(product.price)}</p>
        <p className="muted small product-store">
          {store.name}
          {closed ? ' · Closed' : ''}
        </p>
      </div>
    </Link>
  );
}