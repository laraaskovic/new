import React, { useRef, useState } from 'react';
import './Montage.css';

const Montage = ({ photos }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef();

  const startSlideshow = () => {
    setIsPlaying(true);
    intervalRef.current = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % photos.length);
    }, 200); // Change slide every 2 seconds
  };

  const stopSlideshow = () => {
    setIsPlaying(false);
    clearInterval(intervalRef.current);
  };
  
  const handleToggleSlideshow = () => {
    if (isPlaying) {
      stopSlideshow();
    } else {
      startSlideshow();
    }
  };
  
  return (
    <div className="montage">
      <h2>Montage</h2>
      <div className="montage-slides">
        {photos.map((photo, index) => (
          <img
            key={index}
            src={photo}
            alt={`Slide ${index + 1}`}
            style={{ display: index === currentIndex ? 'block' : 'none' }}
          />
        ))}
      </div>
      <div className="montage-buttons">
        <button onClick={handleToggleSlideshow}>
          {isPlaying ? 'Stop Slideshow' : 'Start Slideshow'}
        </button>
      </div>

    </div>
  );
};

export default Montage;
