import React, { useRef } from 'react';

const Camera = ({ addPhoto }) => {
  const videoRef = useRef();
  const canvasRef = useRef();

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const width = video.videoWidth;
    const height = video.videoHeight;

    canvas.width = width;
    canvas.height = height;
    context.drawImage(video, 0, 0, width, height);

    const photoData = canvas.toDataURL('image/jpeg');
    addPhoto(photoData);
  };

  return (
    <div className="camera">
      <video ref={videoRef} autoPlay muted></video>
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
      <button onClick={capturePhoto}>Capture Photo</button>
    </div>
  );
};

export default Camera;
