import { publicUrl } from '../lib/api';

// The store's logo in a circle. Shows nothing if the store hasn't uploaded one.
export default function StoreLogo({ store, size = 'md' }) {
  if (!store.logo_path) return null;
  return (
    <span className={`store-logo store-logo-${size}`}>
      <img src={publicUrl('store-images', store.logo_path)} alt={`${store.name} logo`} loading="lazy" />
    </span>
  );
}