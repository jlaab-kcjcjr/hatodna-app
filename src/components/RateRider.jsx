import { useEffect, useState } from 'react';
import { Star, CircleCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

const GOOD_TAGS = ['On time', 'Friendly', 'Careful with food', 'Followed instructions'];
const BAD_TAGS = ['Late', 'Rude', 'Food damaged', 'Wrong change'];
const LABELS = ['', 'Very bad', 'Not good', 'Okay', 'Good', 'Excellent'];
const RATING_DAYS = 7;

// "How was your rider?" card on a delivered order. One rating per order, open for 7 days.
export default function RateRider({ orderId, deliveredAt, now }) {
  const [state, setState] = useState({ orderId: null, existing: null });
  const [stars, setStars] = useState(0);
  const [tags, setTags] = useState([]);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('rider_reviews')
      .select('stars')
      .eq('order_id', orderId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setState({ orderId, existing: data ?? false });
      });
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const loaded = state.orderId === orderId;
  if (!loaded) return null;

  if (state.existing) {
    return (
      <section className="rate-card rate-done">
        <CircleCheck size={20} aria-hidden="true" />
        <p>
          You rated your rider {state.existing.stars} {state.existing.stars === 1 ? 'star' : 'stars'}. Salamat!
        </p>
      </section>
    );
  }

  const closed = deliveredAt && now - new Date(deliveredAt).getTime() > RATING_DAYS * 24 * 60 * 60 * 1000;
  if (closed) return null;

  const tagOptions = stars === 0 ? [] : stars >= 4 ? GOOD_TAGS : BAD_TAGS;

  const pickStars = (n) => {
    setStars(n);
    setTags([]);
    setError('');
  };

  const toggleTag = (t) => setTags((list) => (list.includes(t) ? list.filter((x) => x !== t) : [...list, t]));

  const onSubmit = async () => {
    if (!stars) {
      setError('Tap the stars to rate your rider.');
      return;
    }
    setBusy(true);
    setError('');
    const { data, error: rpcError } = await supabase.rpc('customer_rate_rider', {
      p_order_id: orderId,
      p_stars: stars,
      p_tags: tags,
      p_comment: comment.trim(),
    });
    if (rpcError) {
      setError(rpcError.message || 'Could not send your rating.');
      setBusy(false);
      return;
    }
    setState({ orderId, existing: { stars: data?.stars ?? stars } });
  };

  return (
    <section className="rate-card">
      <p className="rate-title">How was your rider?</p>
      <div className="rate-stars" role="radiogroup" aria-label="Rate your rider">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={stars === n}
            aria-label={`${n} ${n === 1 ? 'star' : 'stars'}, ${LABELS[n]}`}
            className={`rate-star${n <= stars ? ' on' : ''}`}
            onClick={() => pickStars(n)}
          >
            <Star size={34} aria-hidden="true" />
          </button>
        ))}
      </div>
      <p className="rate-label muted small">{stars ? LABELS[stars] : 'Tap a star'}</p>

      {tagOptions.length > 0 && (
        <div className="rate-tags" role="group" aria-label={stars >= 4 ? 'What went well' : 'What went wrong'}>
          {tagOptions.map((t) => (
            <button
              key={t}
              type="button"
              className={`chip${tags.includes(t) ? ' active' : ''}`}
              aria-pressed={tags.includes(t)}
              onClick={() => toggleTag(t)}
            >
              {t}
            </button>
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
            placeholder={stars >= 4 ? 'Anything you want to thank your rider for?' : 'What should we look into?'}
          />
        </label>
      )}

      {error && <p className="form-error">{error}</p>}
      {stars > 0 && (
        <button type="button" className="btn btn-primary btn-block" disabled={busy} onClick={onSubmit}>
          {busy ? 'Sending...' : 'Send rating'}
        </button>
      )}
      <p className="muted small">Your rider sees your stars and comment, but not your name.</p>
    </section>
  );
}