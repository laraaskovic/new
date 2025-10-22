import React, { useMemo, useState } from 'react';
import './App.css';
import Camera from './components/Camera';
import Montage from './components/Montage';

const VIEWS = {
  HOME: 'home',
  CAMERA: 'camera',
  MONTAGE: 'montage',
  FRIENDS: 'friends',
  PROFILE: 'profile'
};

const App = () => {
  const [photos, setPhotos] = useState([]);
  const [currentView, setCurrentView] = useState(VIEWS.HOME);

  const [lastCaptureMoment, setLastCaptureMoment] = useState(null);

  const addPhoto = (photoData) => {
    setPhotos(prev => [...prev, photoData]);
    setLastCaptureMoment(Date.now());
  };

  const navItems = useMemo(
    () => [
      { id: VIEWS.HOME, label: 'Home' },
      { id: VIEWS.CAMERA, label: 'Camera' },
      { id: VIEWS.MONTAGE, label: 'Montage' },
      { id: VIEWS.FRIENDS, label: 'Friends' },
      { id: VIEWS.PROFILE, label: 'Account' }
    ],
    []
  );

  const renderView = () => {
    switch (currentView) {
      case VIEWS.CAMERA:
        return <Camera addPhoto={addPhoto} />;
      case VIEWS.MONTAGE:
        return <Montage photos={photos} />;
      case VIEWS.FRIENDS:
        return <FriendsView />;
      case VIEWS.PROFILE:
        return <ProfileView photosCount={photos.length} />;
      case VIEWS.HOME:
      default:
        return (
          <HomeView
            photosCount={photos.length}
            onNavigate={setCurrentView}
            lastCaptureMoment={lastCaptureMoment}
          />
        );
    }
  };

  return (
    <div className="app">
      <header className="header">
        <img src="/images/timewarp (1).png" alt="TimeWarp logo" />
        <p className="header-tagline">Daily reminders. Instant alignment. Effortless glow-up.</p>
      </header>

      <main className="main-view">
        {renderView()}
      </main>

      <nav className="nav-bar">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-button ${currentView === item.id ? 'active' : ''}`}
            onClick={() => setCurrentView(item.id)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

const HomeView = ({ onNavigate, photosCount, lastCaptureMoment }) => (
  <section className="home-view">
    <div className="home-hero">
      <h1>Build your face story.</h1>
      <p>
        Capture a shot, keep the streak, share the timewarp.
        {lastCaptureMoment ? ' Last capture synced moments ago.' : ''}
      </p>
    </div>

    <div className="home-grid">
      <article className="action-card">
        <h2>Take today&apos;s photo</h2>
        <p>Launch the dual camera workflow and auto-align in one tap.</p>
        <button type="button" onClick={() => onNavigate(VIEWS.CAMERA)}>Open Camera</button>
      </article>

      <article className="action-card">
        <h2>Generate montage</h2>
        <p>{photosCount ? `You have ${photosCount} aligned shots ready to animate.` : 'Capture a few photos to unlock the timewarp.'}</p>
        <button
          type="button"
          onClick={() => onNavigate(VIEWS.MONTAGE)}
          disabled={!photosCount}
        >
          View Montage
        </button>
      </article>

      <article className="action-card secondary">
        <h2>Connect with friends</h2>
        <p>Stay accountable with daily nudges and shared glow-up streaks.</p>
        <button type="button" onClick={() => onNavigate(VIEWS.FRIENDS)}>Find Friends</button>
      </article>

      <article className="action-card secondary">
        <h2>Account & streaks</h2>
        <p>Personalise reminders, manage backups, and monitor your progress.</p>
        <button type="button" onClick={() => onNavigate(VIEWS.PROFILE)}>Manage Account</button>
      </article>
    </div>
  </section>
);

const FriendsView = () => (
  <section className="placeholder-view">
    <h1>Friends coming soon</h1>
    <p>Invite contacts, compare streaks, and launch joint montages. Drop your wishlist and we&apos;ll build it.</p>
  </section>
);

const ProfileView = ({ photosCount }) => (
  <section className="placeholder-view">
    <h1>Your account</h1>
    <ul>
      <li>Daily reminders: <span>Enabled (customise soon)</span></li>
      <li>Photos captured: <span>{photosCount}</span></li>
      <li>Cloud backup: <span>Coming soon</span></li>
    </ul>
  </section>
);

export default App;
