import React, { useEffect } from 'react';

const Photo = ({ src, delay }) => {
  useEffect(() => {
    const timeout = setTimeout(() => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const context = canvas.getContext('2d');
        context.drawImage(img, 0, 0);
        document.querySelector('.photo-grid').appendChild(canvas);
      };
    }, delay);

    return () => clearTimeout(timeout);
  }, [src, delay]);

  return null;
};

export default Photo;
