import { useEffect, useState } from 'react';
import { Star, CircleCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

const GOOD_TAGS = ['Tasty', 'Good portion', 'Well packed', 'Fast prep'];
const BAD_TAGS = ['Cold food', 'Wrong item', 'Missing item', 'Small portion'];
const LABELS = ['', 'Very bad', 'Not good', 'Okay', 'Good', 'Excellent'];
const RATING_DAYS = 7;

function Stars({ value, onPick, size = 34, label }) {
  return (
    <div className="rate-stars" role="radiogroup" aria-label={label}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} ${n === 1 ? 'star' : 'stars'}`}
          className={`rate-star${n <= value ? ' on' : ''}`}
          style={{ width: size + 12, height: size + 12 }}
          onClick={() => onPick(n)}
        >
          <Star size={size} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}

// "How was [store]?" plus "Rate what you ordered" on a delivered order. One rating per order, open 7 days.
export default function RateStore({ order, now }) {
  const [state, setState] = useState({ orderId: null, existing: null });
  const [stars, setStars] = useState(0);
  const [tags, setTags] = useState([]);
  const [comment, setComment] = useState('');
  const [itemStars, setItemStars] = useState({}); // { product_id: 1-5 }
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('store_reviews')
      .select('stars')
      .eq('order_id', order.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setState({ orderId: order.id, existing: data ?? false });
      });
    return () => {
      cancelled = true;
    };
  }, [order.id]);

  if (state.orderId !== order.id) return null;
  const storeName = order.store?.name ?? 'the store';

  if (state.existing) {
    return (
      <section className="rate-card rate-done">
        <CircleCheck size={20} aria-hidden="true" />
        <p>
          You rated {storeName} {state.existing.stars} {state.existing.stars === 1 ? 'star' : 'stars'}. Salamat!
        </p>
      </section>
    );
  }

  const closed =
    order.delivered_at && now - new Date(order.delivered_at).getTime() > RATING_DAYS * 24 * 60 * 60 * 1000;
  if (closed) return null;

  // One row per product in the order (skip items whose product was deleted).
  const items = [];
  (order.order_items ?? []).forEach((i) => {
    if (i.product_id && !items.some((x) => x.product_id === i.product_id)) items.push(i);
  });
  const tagOptions = stars === 0 ? [] : stars >= 4 ? GOOD_TAGS : BAD_TAGS;

  const onSubmit = async () => {
    if (!stars) {
      setError(`Tap the stars to rate ${storeName}.`);
      return;
    }
    setBusy(true);
    setError('');
    const { data, error: rpcError } = await supabase.rpc('customer_rate_store', {
      p_order_id: order.id,
      p_stars: stars,
      p_tags: tags,
      p_comment: comment.trim(),
      p_items: Object.entries(itemStars).map(([product_id, s]) => ({ product_id, stars: s })),
    });
    if (rpcError) {
      setError(rpcError.message || 'Could not send your rating.');
      setBusy(false);
      return;
    }
    setState({ orderId: order.id, existing: { stars: data?.stars ?? stars } });
  };

  return (
    <section className="rate-card">
      <p className="rate-title">How was {storeName}?</p>
      <Stars
        value={stars}
        label={`Rate ${storeName}`}
        onPick={(n) => {
          setStars(n);
          setTags([]);
          setError('');
        }}
      />
      <p className="rate-label muted small">{stars ? LABELS[stars] : 'Tap a star'}</p>

      {tagOptions.length > 0 && (
        <div className="rate-tags" role="group" aria-label={stars >= 4 ? 'What was good' : 'What went wrong'}>
          {tagOptions.map((t) => (
            <button
              key={t}
              type="button"
              className={`chip${tags.includes(t) ? ' active' : ''}`}
              aria-pressed={tags.includes(t)}
              onClick={() => setTags((list) => (list.includes(t) ? list.filter((x) => x !== t) : [...list, t]))}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {stars > 0 && items.length > 0 && (
        <div className="rate-items">
          <p className="field-label-text">Rate what you ordered (optional)</p>
          {items.map((i) => (
            <div key={i.product_id} className="rate-item">
              <span className="rate-item-name">{i.name}</span>
              <Stars
                value={itemStars[i.product_id] ?? 0}
                size={22}
                label={`Rate ${i.name}`}
                onPick={(n) => setItemStars((m) => ({ ...m, [i.product_id]: n }))}
              />
            </div>
          ))}
        </div>
      )}

      {stars > 0 && (
        <label className="rate-comment">
          <span className="field-label-text">Comment (optional)</span>
          <textarea
            rows={2}
            maxLength={500}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={stars >= 4 ? 'What did you love?' : 'What should the store improve?'}
          />
        </label>
      )}

      {error && <p className="form-error">{error}</p>}
      {stars > 0 && (
        <button type="button" className="btn btn-primary btn-block" disabled={busy} onClick={onSubmit}>
          {busy ? 'Sending...' : 'Send rating'}
        </button>
      )}
      <p className="muted small">Other customers see your stars and comment with your first name and last initial.</p>
    </section>
  );
}