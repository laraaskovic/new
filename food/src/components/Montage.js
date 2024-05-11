import React, { useState, useEffect } from 'react';
import Photo from './Photo';

const Montage = ({ photos }) => {
  const [montagePhotos, setMontagePhotos] = useState([]);

  useEffect(() => {
    createMontage();
  }, [photos]);

  const createMontage = () => {
    const interval = 1000; // 1 second interval for the timelapse
    const framesPerPhoto = 5; // Number of frames per photo
    const newMontagePhotos = [];

    photos.forEach((photo, index) => {
      const delay = interval * index;
      for (let i = 0; i < framesPerPhoto; i++) {
        newMontagePhotos.push({ src: photo, delay });
      }
    });

    setMontagePhotos(newMontagePhotos);
  };

  return (
    <div className="montage">
      <h2>Montage Timelapse</h2>
      <div className="photo-grid">
        {montagePhotos.map((photo, index) => (
          <Photo key={index} src={photo.src} delay={photo.delay} />
        ))}
      </div>
    </div>
  );
};

export default Montage;
