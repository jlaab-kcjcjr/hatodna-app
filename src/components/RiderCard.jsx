import { useEffect, useState } from 'react';
import { Phone } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { initialsOf } from '../utils/format';

const localPhone = (phone) => (phone?.startsWith('+63') ? `0${phone.slice(3)}` : phone ?? '');

// "Your rider" card on the tracking page. The database only shares this while the delivery is active.
export default function RiderCard({ orderId, riderId, status }) {
  const key = `${orderId}:${riderId}:${status}`;
  const [card, setCard] = useState(null); // { key, info, url }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.rpc('order_rider_card', { p_order_id: orderId });
      const info = data?.[0] ?? null;
      let url = '';
      if (info?.selfie_path) {
        const { data: signed } = await supabase.storage.from('rider-documents').createSignedUrl(info.selfie_path, 3600);
        url = signed?.signedUrl ?? '';
      }
      if (!cancelled) setCard({ key, info, url });
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId, riderId, status, key]);

  const current = card?.key === key ? card : null;
  if (!current?.info) return null;
  const { info, url } = current;
  const name = info.first_name || 'Your rider';

  return (
    <section className="rider-card" aria-label="Your rider">
      {url ? (
        <img className="rider-card-photo" src={url} alt={`Your rider, ${name}`} />
      ) : (
        <span className="rider-card-photo rider-card-initials" aria-hidden="true">
          {initialsOf(name)}
        </span>
      )}
      <div className="rider-card-text">
        <p className="muted small">Your rider</p>
        <p className="rider-card-name">{name}</p>
        <p className="muted small">
          {info.vehicle}
          {info.plate ? ` · ${info.plate}` : ''}
        </p>
      </div>
      {info.phone && (
        <a className="rider-card-call" href={`tel:${info.phone}`} aria-label={`Call ${name} at ${localPhone(info.phone)}`}>
          <Phone size={18} aria-hidden="true" />
          Call
        </a>
      )}
    </section>
  );
}