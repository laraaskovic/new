import React, { useState } from 'react';
import './App.css';
import Camera from './components/Camera';
import Montage from './components/Montage';

const App = () => {
  const [photos, setPhotos] = useState([]);
  const [photoCounter, setPhotoCounter] = useState(0);

  const addPhoto = (photoData) => {
    const date = new Date().toISOString().split('T')[0]; // Get current date

    setPhotos([...photos, photoData]);
    setPhotoCounter(prevCounter => prevCounter + 1); // Increment photo counter
    animateCounter(); // Trigger the animation
  };

  const animateCounter = () => {
    const counterElement = document.querySelector('.photo-counter');
    counterElement.classList.remove('counting');
    void counterElement.offsetWidth; // Trigger reflow to restart animation
    counterElement.classList.add('counting');
  };

  return (
    <div className="app">
      <header className="header">
        <img src="/images/timewarp (1).png" alt="Logo" />
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
