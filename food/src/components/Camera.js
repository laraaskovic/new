
import React, { useEffect, useRef, useState } from 'react';
import './Camera.css';

const Camera = ({ addPhoto }) => {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Loading computer vision...');
  const [cvReady, setCvReady] = useState(false);
  const classifierRef = useRef(null);
  const cascadeFileName = 'haarcascade_frontalface_default.xml';

  useEffect(() => {
    let cancelled = false;

    const waitForOpenCv = () => {
      if (cancelled) {
        return;
      }

      if (window.cv && typeof window.cv.imread === 'function') {
        setCvReady(true);
        setStatusMessage('Start the camera to capture your daily photo.');
        return;
      }

      requestAnimationFrame(waitForOpenCv);
    };

    waitForOpenCv();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!cvReady || classifierRef.current) {
      return;
    }

    let cancelled = false;

    const loadCascade = async () => {
      try {
        setStatusMessage('Calibrating face detector...');
        const response = await fetch(
          'https://raw.githubusercontent.com/opencv/opencv/4.x/data/haarcascades/haarcascade_frontalface_default.xml'
        );

        if (!response.ok) {
          throw new Error('Unable to download cascade file');
        }

        const buffer = await response.arrayBuffer();
        const data = new Uint8Array(buffer);
        const cv = window.cv;

        // Write the cascade to the in-memory FS once.
        if (!cv.FS_readdir('/').includes(cascadeFileName)) {
          cv.FS_createDataFile('/', cascadeFileName, data, true, false, false);
        }

        const classifier = new cv.CascadeClassifier();
        classifier.load(cascadeFileName);

        if (!cancelled) {
          classifierRef.current = classifier;
          setStatusMessage('Vision ready. Keep your face centred and hit capture.');
        } else {
          classifier.delete();
        }
      } catch (error) {
        console.error('Failed to initialise face detection:', error);
        setStatusMessage('Face detection unavailable. Try reloading the page.');
      }
    };

    loadCascade();

    return () => {
      cancelled = true;
    };
  }, [cvReady]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setIsCameraOn(true);
    } catch (error) {
      console.error('Error accessing webcam:', error);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const alignFaceToCanvas = (video, faceRect, frameWidth, frameHeight) => {
    const outputSize = 480;
    const context = canvasRef.current.getContext('2d');
    const padding = Math.round(Math.max(faceRect.width, faceRect.height) * 0.35);
    const centerX = faceRect.x + faceRect.width / 2;
    const centerY = faceRect.y + faceRect.height / 2;
    const cropSize = Math.min(
      Math.max(faceRect.width, faceRect.height) + padding * 2,
      Math.min(frameWidth, frameHeight)
    );

    let cropX = Math.round(centerX - cropSize / 2);
    let cropY = Math.round(centerY - cropSize / 2);

    if (cropX < 0) cropX = 0;
    if (cropY < 0) cropY = 0;
    if (cropX + cropSize > frameWidth) cropX = frameWidth - cropSize;
    if (cropY + cropSize > frameHeight) cropY = frameHeight - cropSize;
    if (cropX < 0) cropX = 0;
    if (cropY < 0) cropY = 0;

    canvasRef.current.width = outputSize;
    canvasRef.current.height = outputSize;
    context.clearRect(0, 0, outputSize, outputSize);
    context.drawImage(
      video,
      cropX,
      cropY,
      cropSize,
      cropSize,
      0,
      0,
      outputSize,
      outputSize
    );

    return canvasRef.current.toDataURL('image/jpeg', 0.92);
  };

  const capturePhoto = async () => {
    if (!isCameraOn) {
      setStatusMessage('Start the camera first.');
      return;
    }

    if (!classifierRef.current) {
      setStatusMessage('Computer vision still warming up—try again in a second.');
      return;
    }

    const cv = window.cv;
    const video = videoRef.current;

    if (!video || video.readyState < 2) {
      setStatusMessage('Camera is getting ready. Hold on...');
      return;
    }

    setIsProcessing(true);

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const width = video.videoWidth;
    const height = video.videoHeight;

    canvas.width = width;
    canvas.height = height;
    context.drawImage(video, 0, 0, width, height);

    let src = null;
    let gray = null;
    const faces = new cv.RectVector();
    const minimumSize = new cv.Size(120, 120);
    const classifier = classifierRef.current;

    try {
      const imageData = context.getImageData(0, 0, width, height);
      src = cv.matFromImageData(imageData);
      gray = new cv.Mat();
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

      classifier.detectMultiScale(
        gray,
        faces,
        1.15,
        4,
        0,
        minimumSize
      );

      if (faces.size() === 0) {
        setStatusMessage('No face detected. Reposition yourself and try again.');
        return;
      }

      let bestFace = null;
      let largestArea = 0;

      for (let i = 0; i < faces.size(); i += 1) {
        const faceRect = faces.get(i);
        const area = faceRect.width * faceRect.height;

        if (area > largestArea) {
          largestArea = area;
          bestFace = {
            x: faceRect.x,
            y: faceRect.y,
            width: faceRect.width,
            height: faceRect.height
          };
        }

        faceRect.delete();
      }

      if (!bestFace) {
        setStatusMessage('Unable to stabilise the face. One more try?');
        return;
      }

      const alignedPhoto = alignFaceToCanvas(video, bestFace, width, height);
      addPhoto(alignedPhoto);
      setStatusMessage('Daily shot saved and aligned. Nice streak!');
    } catch (error) {
      console.error('Error during capture:', error);
      setStatusMessage('Something went wrong while capturing. Try again.');
    } finally {
      if (src) src.delete();
      if (gray) gray.delete();
      faces.delete();
      minimumSize.delete();
      setIsProcessing(false);
    }
  };

  return (
    <div className="camera-container">
      <div className="camera-stage">
        <video className={`camera-video ${isCameraOn ? 'active' : ''}`} ref={videoRef} autoPlay playsInline></video>
        <canvas className="camera-canvas" ref={canvasRef}></canvas>
        <div className="camera-status">{statusMessage}</div>
      </div>
      <div className="camera-buttons">
        <button className="camera-button" onClick={capturePhoto} disabled={!isCameraOn || isProcessing}>
          {isProcessing ? 'Aligning...' : 'Capture & Align'}
        </button>
        <button className="camera-button secondary" onClick={startCamera} disabled={isCameraOn}>
          Start Camera
        </button>
        <button className="camera-button ghost" onClick={stopCamera} disabled={!isCameraOn}>
          Stop Camera
        </button>
      </div>
    </div>
  );
};

export default Camera;
