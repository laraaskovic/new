import React, { useState } from 'react';
import './App.css';
import Camera from './components/Camera';
import Montage from './components/Montage';
import Calendar from './components/Calendar';

const App = () => {
  const [photos, setPhotos] = useState([]);

  const addPhoto = (photoData) => {
    const date = new Date().toISOString().split('T')[0]; // Get current date

    setPhotos([...photos, photoData]);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Facial Montage Timelapse</h1>
      </header>
      <main className="main">
        <Camera addPhoto={addPhoto} />
        <Montage photos={photos} />
      </main>
      <footer className="footer">
        <p>Created with ❤️</p>
      </footer>
    </div>
  );
};

export default App;
