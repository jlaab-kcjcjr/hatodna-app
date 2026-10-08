import { UtensilsCrossed, ShoppingBasket, Pill, Bike } from 'lucide-react';
import { COLORS } from '../theme';
import { initialsOf } from '../utils/format';
import BanigBand from './BanigBand';

const CATEGORY_ART = {
  Food: { bg: COLORS.sili, fg: COLORS.abacaSoft, Icon: UtensilsCrossed },
  Grocery: { bg: COLORS.pili, fg: COLORS.abacaSoft, Icon: ShoppingBasket },
  Pharmacy: { bg: COLORS.ink, fg: COLORS.abaca, Icon: Pill },
  Pabili: { bg: COLORS.abaca, fg: COLORS.ink, Icon: Bike },
};

// Shows the store's photo if it has one; otherwise an illustrated tile.
export default function StoreArt({ store, className = '' }) {
  const art = CATEGORY_ART[store.category] ?? CATEGORY_ART.Food;

  if (store.image) {
    return <img className={`store-art ${className}`} src={store.image} alt={store.name} />;
  }

  const Icon = art.Icon;
  return (
    <div className={`store-art ${className}`} style={{ background: art.bg, color: art.fg }} aria-hidden="true">
      <span className="store-art-initials">{initialsOf(store.name)}</span>
      <Icon className="store-art-icon" size={22} />
      <div className="store-art-band">
        <BanigBand
          id={`band-${store.id}-${className || 'tile'}`}
          height={10}
          ground={art.fg}
          first={art.bg}
          second={COLORS.abaca}
        />
      </div>
    </div>
  );
}