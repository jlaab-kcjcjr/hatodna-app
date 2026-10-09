import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bike, Store, Smartphone, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LINKS } from '../config/links';
import { initialsOf } from '../utils/format';
import BanigBand from '../components/BanigBand';
import MapPicker from '../components/MapPicker';

const toLocal = (phone) => (phone?.startsWith('+63') ? `0${phone.slice(3)}` : phone ?? '');

function toInternational(input) {
  let digits = input.replace(/\D/g, '');
  if (digits.startsWith('63')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = digits.slice(1);
  return /^9\d{9}$/.test(digits) ? `+63${digits}` : null;
}

function ProfileForm({ profile, email }) {
  const { updateProfile, logout } = useAuth();
  const [form, setForm] = useState({
    full_name: profile.full_name ?? '',
    phone: toLocal(profile.phone),
    default_address: profile.default_address ?? '',
    landmark: profile.landmark ?? '',
  });
  const [pin, setPin] = useState(profile.default_lat != null ? { lat: profile.default_lat, lng: profile.default_lng } : null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setError('');
    setSaved(false);
  };

  const onSave = async (e) => {
    e.preventDefault();
    const phone = form.phone.trim() ? toInternational(form.phone) : null;
    if (form.phone.trim() && !phone) return setError('Enter a valid mobile number, like 0917 123 4567.');
    setBusy(true);
    try {
      await updateProfile({
        full_name: form.full_name.trim(),
        phone,
        default_address: form.default_address.trim(),
        landmark: form.landmark.trim(),
        default_lat: pin?.lat ?? null,
        default_lng: pin?.lng ?? null,
      });
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const onLogout = () => {
    if (window.confirm("Log out? You'll need a new email code to log back in.")) logout();
  };

  return (
    <div className="page page-narrow">
      <section className="profile-hero">
        <div className="avatar">{initialsOf(form.full_name || email)}</div>
        <h1 className="profile-name">{profile.full_name || 'Your profile'}</h1>
        <p className="muted">{email}</p>
      </section>
      <div className="profile-band">
        <BanigBand id="profile-band" height={10} />
      </div>

      <form className="profile-form" onSubmit={onSave}>
        <label className="field">
          <span>Full name</span>
          <input value={form.full_name} onChange={(e) => set('full_name', e.target.value)} placeholder="Juan Dela Cruz" autoComplete="name" />
        </label>
        <label className="field">
          <span>Mobile number (so riders can call you)</span>
          <input
            type="tel"
            inputMode="tel"
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            placeholder="0917 123 4567"
            autoComplete="tel"
          />
        </label>
        <label className="field">
          <span>Default delivery address</span>
          <input
            value={form.default_address}
            onChange={(e) => set('default_address', e.target.value)}
            placeholder="Street, barangay, town"
            autoComplete="street-address"
          />
        </label>
        <label className="field">
          <span>Landmark</span>
          <input value={form.landmark} onChange={(e) => set('landmark', e.target.value)} placeholder="Near the chapel, blue gate" />
          <span className="field-label-text">Default delivery pin</span>
        <MapPicker
          value={pin}
          onChange={(point) => {
            setPin(point);
            setSaved(false);
          }}
          kind="customer"
          height="15rem"
        />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className={`btn btn-block ${saved ? 'btn-pili' : 'btn-primary'}`} disabled={busy}>
          {busy ? 'Saving...' : saved ? 'Saved' : 'Save changes'}
        </button>
      </form>

      <ul className="menu-list">
        <li>
          <Link to="/install" className="menu-row">
            <Smartphone size={20} aria-hidden="true" />
            <span>Add HatodNa to your phone</span>
            <ChevronRight size={18} aria-hidden="true" />
          </Link>
        </li>
        <li>
          <a href={LINKS.rider} className="menu-row">
            <Bike size={20} aria-hidden="true" />
            <span>Become a rider</span>
            <ChevronRight size={18} aria-hidden="true" />
          </a>
        </li>
        <li>
          <a href={`${LINKS.landing}/#partners`} className="menu-row">
            <Store size={20} aria-hidden="true" />
            <span>List your store with us</span>
            <ChevronRight size={18} aria-hidden="true" />
          </a>
        </li>
        <li>
          <button type="button" className="menu-row danger" onClick={onLogout}>
            <LogOut size={20} aria-hidden="true" />
            <span>Log out</span>
          </button>
        </li>
      </ul>
    </div>
  );
}

export default function Profile() {
  const { session, profile } = useAuth();
  if (!profile) return <p className="page-loading">Loading...</p>;
  return <ProfileForm key={profile.id} profile={profile} email={session?.user.email ?? ''} />;
}