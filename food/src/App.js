import React from 'react';
import './App.css';
import Camera from './components/Camera';
import Montage from './components/Montage';

const App = () => {
  return (
    <div className="app">
      <h1>Facial Montage Timelapse</h1>
      <Camera />
      <Montage />
    </div>
  );
};

export default App;
