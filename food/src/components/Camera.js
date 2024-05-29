/*import React, { useRef, useState, useEffect } from 'react';
import './Camera.css'; // Import your CSS file for camera styling
import * as faceapi from 'face-api.js';

const Camera = ({ addPhoto }) => {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [photoCount, setPhotoCount] = useState(0);

  useEffect(() => {
    // Load face detection and facial landmark detection models
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models')
    ]).then(startCamera);
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setIsCameraOn(true);
    } catch (error) {
      console.error('Error accessing webcam:', error);
    }
  };

  const capturePhoto = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const width = video.videoWidth;
    const height = video.videoHeight;

    canvas.width = width;
    canvas.height = height;
    context.drawImage(video, 0, 0, width, height);

    // Use face-api.js to detect faces in the image
    const faceDetection = await faceapi.detectSingleFace(canvas);

    if (faceDetection) {
      // Align faces based on predefined grids or facial features
      // Implement your face alignment logic here
      
      // Save the aligned photo
      const photoData = canvas.toDataURL('image/jpeg');
      addPhoto(photoData);
      setPhotoCount(prevCount => prevCount + 1); // Increment photo count
    } else {
      console.log('No face detected');
    }
  };

  return (
    <div className="camera-container">
      <video className={`camera-video ${isCameraOn ? 'active' : ''}`} ref={videoRef} autoPlay playsInline></video>
      <canvas className="camera-canvas" ref={canvasRef}></canvas>
      <div className="camera-buttons">
        <button className="camera-button" onClick={capturePhoto} disabled={!isCameraOn}>Capture Photo</button>
        <button className="camera-button" onClick={startCamera} disabled={isCameraOn}>Start Camera</button>
      </div>
      <div className="photo-counter">
        <p>STREAK: {photoCount}</p>
      </div>
    </div>
  );
};

export default Camera;

*/


import React, { useRef, useState } from 'react';
import './Camera.css';

const Camera = ({ addPhoto }) => {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [photoCount, setPhotoCount] = useState(0);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setIsCameraOn(true);
    } catch (error) {
      console.error('Error accessing webcam:', error);
    }
  };

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
    setPhotoCount(prevCount => prevCount + 1);
  };

  return (
    <div className="camera-container">
      <video className={`camera-video ${isCameraOn ? 'active' : ''}`} ref={videoRef} autoPlay playsInline></video>
      <canvas className="camera-canvas" ref={canvasRef}></canvas>
      <div className="camera-buttons">
        <button className="camera-button" onClick={capturePhoto} disabled={!isCameraOn}>Capture Photo</button>
        <button className="camera-button" onClick={startCamera} disabled={isCameraOn}>Starttt Camera</button>
      </div>
      
    </div>
  );
};

export default Camera;
