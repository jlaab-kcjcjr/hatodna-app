import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bike, Store, CircleHelp, Smartphone, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { initialsOf } from '../utils/format';
import BanigBand from '../components/BanigBand';

export default function Profile() {
  const { user, updateProfile, logout } = useAuth();
  const [name, setName] = useState(user.name);
  const [address, setAddress] = useState(user.address);
  const [landmark, setLandmark] = useState(user.landmark);
  const [saved, setSaved] = useState(false);

  const onSave = (e) => {
    e.preventDefault();
    updateProfile({ name: name.trim(), address: address.trim(), landmark: landmark.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const comingSoon = (what) => window.alert(`${what} is coming in the next update.`);

  const onLogout = () => {
    if (window.confirm("Log out? You'll need to verify your number again to log back in.")) logout();
  };

  return (
    <div className="page page-narrow">
      <section className="profile-hero">
        <div className="avatar">{initialsOf(name)}</div>
        <h1 className="profile-name">{user.name || 'Your profile'}</h1>
        <p className="muted">{user.phone}</p>
      </section>
      <div className="profile-band">
        <BanigBand id="profile-band" height={10} />
      </div>

      <form className="profile-form" onSubmit={onSave}>
        <label className="field">
          <span>Full name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Juan Dela Cruz" autoComplete="name" />
        </label>
        <label className="field">
          <span>Default delivery address</span>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Street, barangay, town"
            autoComplete="street-address"
          />
        </label>
        <label className="field">
          <span>Landmark</span>
          <input value={landmark} onChange={(e) => setLandmark(e.target.value)} placeholder="Near the chapel, blue gate" />
        </label>
        <button type="submit" className={`btn btn-block ${saved ? 'btn-pili' : 'btn-primary'}`}>
          {saved ? 'Saved' : 'Save changes'}
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
          <button type="button" className="menu-row" onClick={() => comingSoon('Rider sign-up')}>
            <Bike size={20} aria-hidden="true" />
            <span>Become a rider</span>
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </li>
        <li>
          <button type="button" className="menu-row" onClick={() => comingSoon('Store partnership')}>
            <Store size={20} aria-hidden="true" />
            <span>List your store with us</span>
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </li>
        <li>
          <button type="button" className="menu-row" onClick={() => comingSoon('Help and support')}>
            <CircleHelp size={20} aria-hidden="true" />
            <span>Help and support</span>
            <ChevronRight size={18} aria-hidden="true" />
          </button>
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