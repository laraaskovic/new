import React, { useState } from 'react';
import './App.css';
import Camera from './components/Camera';
import Montage from './components/Montage';

const App = () => {
  const [photos, setPhotos] = useState([]);

  const addPhoto = (photoData) => {
    const date = new Date().toISOString().split('T')[0]; // Get current date

    setPhotos([...photos, photoData]);
  };

  /*const animateCounter = () => {
    const counterElement = document.querySelector('.photo-counter');
    counterElement.classList.remove('counting');
    void counterElement.offsetWidth; // Trigger reflow to restart animation
    counterElement.classList.add('counting');
  };*/

  return (
    <div className="app">
      <header className="header">
        <img src="/images/timewarp (1).png" alt="Logo" />
        <p className="header-tagline">Daily reminders. Instant alignment. Effortless glow-up.</p>
      </header>
      <div className="main">
        <Camera addPhoto={addPhoto} />
        <Montage photos={photos} />
      </div>
      <div className="footer">
      
      </div>
    </div>
  );
};

export default App;
