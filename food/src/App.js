import React, { useState } from 'react';
import './App.css';
import Camera from './components/Camera';
import Montage from './components/Montage';

const App = () => {
  const [photos, setPhotos] = useState([]);

  const addPhoto = (photoData) => {
    setPhotos([...photos, photoData]);
  };

  return (
    <div className="app">
      <h1>Facial Montage Timelapse</h1>
      <Camera addPhoto={addPhoto} />
      <Montage photos={photos} />
    </div>
  );
};

export default App;
