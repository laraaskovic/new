import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import './Camera.css';

const OUTPUT_SIZE = 480;
const MODEL_PATH = `${process.env.PUBLIC_URL || ''}/models/face-api`;

const Camera = ({ addPhoto }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Initialising face aligner...');
  const [modelState, setModelState] = useState('loading');

  useEffect(() => {
    let cancelled = false;

    const loadFaceApiModels = async () => {
      try {
        setStatusMessage('Loading alignment models...');
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_PATH),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_PATH)
        ]);

        if (!cancelled) {
          setModelState('ready');
          setStatusMessage('Face aligner ready. Start the camera to capture your daily photo.');
        }
      } catch (error) {
        console.error('Failed to load face-api models:', error);
        if (!cancelled) {
          setModelState('error');
          setStatusMessage('Face detection unavailable. Using smart crop alignment.');
        }
      }
    };

    loadFaceApiModels();
    return () => {
      cancelled = true;
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraOn(true);
      setStatusMessage(modelState === 'ready'
        ? 'Keep your face centred and tap capture.'
        : 'Smart crop active. Face detection unavailable in this browser.');
    } catch (error) {
      console.error('Error accessing webcam:', error);
      setStatusMessage('Could not access the camera. Check permissions and try again.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
    setStatusMessage('Camera stopped. Tap start to capture another photo.');
  };

  useEffect(() => stopCamera, []);

  const quickCrop = (sourceCanvas) => {
    const width = sourceCanvas.width;
    const height = sourceCanvas.height;
    const cropSize = Math.min(width, height);
    const cropX = Math.round((width - cropSize) / 2);
    const cropY = Math.round((height - cropSize) / 2);

    const target = document.createElement('canvas');
    target.width = OUTPUT_SIZE;
    target.height = OUTPUT_SIZE;
    const targetCtx = target.getContext('2d');

    targetCtx.fillStyle = '#000';
    targetCtx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
    targetCtx.drawImage(
      sourceCanvas,
      cropX,
      cropY,
      cropSize,
      cropSize,
      0,
      0,
      OUTPUT_SIZE,
      OUTPUT_SIZE
    );

    return target.toDataURL('image/jpeg', 0.92);
  };

  const clampBox = (box, width, height) => {
    const x = Math.max(0, box.x);
    const y = Math.max(0, box.y);
    const w = Math.min(box.width, width - x);
    const h = Math.min(box.height, height - y);
    return { x, y, width: w, height: h };
  };

  const averagePoint = (points) => {
    if (!points || !points.length) {
      return null;
    }
    const total = points.reduce(
      (acc, point) => ({
        x: acc.x + point.x,
        y: acc.y + point.y
      }),
      { x: 0, y: 0 }
    );

    return {
      x: total.x / points.length,
      y: total.y / points.length
    };
  };

  const computeRotationAngle = (landmarks) => {
    if (!landmarks) {
      return 0;
    }

    const leftEye = averagePoint(landmarks.getLeftEye());
    const rightEye = averagePoint(landmarks.getRightEye());

    if (!leftEye || !rightEye) {
      return 0;
    }

    const dx = rightEye.x - leftEye.x;
    const dy = rightEye.y - leftEye.y;

    if (dx === 0) {
      return 0;
    }

    const angle = Math.atan2(dy, dx);
    return Math.abs(angle) < (2 * Math.PI) / 180 ? 0 : angle;
  };

  const rotateCanvas = (sourceCanvas, angle, pivot) => {
    if (angle === 0) {
      return sourceCanvas;
    }

    const rotated = document.createElement('canvas');
    rotated.width = sourceCanvas.width;
    rotated.height = sourceCanvas.height;
    const context = rotated.getContext('2d');

    context.translate(pivot.x, pivot.y);
    context.rotate(-angle);
    context.translate(-pivot.x, -pivot.y);
    context.drawImage(sourceCanvas, 0, 0);

    return rotated;
  };

  const cropAlignedFace = (sourceCanvas, detection) => {
    if (!detection) {
      return quickCrop(sourceCanvas);
    }

    const { detection: faceDetection, landmarks } = detection;
    const width = sourceCanvas.width;
    const height = sourceCanvas.height;
    const rawBox = faceDetection.box;
    const box = clampBox(
      {
        x: rawBox.x,
        y: rawBox.y,
        width: rawBox.width,
        height: rawBox.height
      },
      width,
      height
    );

    const padding = Math.round(Math.max(box.width, box.height) * 0.4);
    const intendedSize = Math.max(box.width, box.height) + padding * 2;
    const cropSize = Math.min(intendedSize, width, height);
    let cropX = box.x + box.width / 2 - cropSize / 2;
    let cropY = box.y + box.height / 2 - cropSize / 2;

    cropX = Math.max(0, Math.min(width - cropSize, cropX));
    cropY = Math.max(0, Math.min(height - cropSize, cropY));

    const angle = computeRotationAngle(landmarks);
    const pivot = {
      x: box.x + box.width / 2,
      y: box.y + box.height / 2
    };

    const alignedSource = rotateCanvas(sourceCanvas, angle, pivot);

    const target = document.createElement('canvas');
    target.width = OUTPUT_SIZE;
    target.height = OUTPUT_SIZE;
    const ctx = target.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
    ctx.drawImage(
      alignedSource,
      cropX,
      cropY,
      cropSize,
      cropSize,
      0,
      0,
      OUTPUT_SIZE,
      OUTPUT_SIZE
    );

    return target.toDataURL('image/jpeg', 0.92);
  };

  const capturePhoto = async () => {
    if (!isCameraOn) {
      setStatusMessage('Start the camera first.');
      return;
    }

    const video = videoRef.current;
    if (!video || video.readyState < 2) {
      setStatusMessage('Camera is getting ready. Hold on...');
      return;
    }

    setIsProcessing(true);

    const captureCanvas = canvasRef.current;
    const context = captureCanvas.getContext('2d');
    const width = video.videoWidth;
    const height = video.videoHeight;

    captureCanvas.width = width;
    captureCanvas.height = height;
    context.drawImage(video, 0, 0, width, height);

    let detection = null;

    if (modelState === 'ready') {
      try {
        const detectionOptions = new faceapi.TinyFaceDetectorOptions({
          inputSize: 320,
          scoreThreshold: 0.5
        });

        const result = await faceapi
          .detectSingleFace(captureCanvas, detectionOptions)
          .withFaceLandmarks(true);

        if (result) {
          detection = result;
        } else {
          setStatusMessage('No face detected. Using smart crop instead.');
        }
      } catch (error) {
        console.error('Face detection failed:', error);
        setModelState('error');
        setStatusMessage('Face detection failed. Using smart crop alignment.');
      }
    }

    const photoData = cropAlignedFace(captureCanvas, detection);
    addPhoto(photoData);

    if (detection) {
      setStatusMessage('Aligned photo saved. Capture another or visit Montage to view progress.');
    } else {
      setStatusMessage('Smart-cropped photo saved. Capture another or visit Montage to view progress.');
    }

    setIsProcessing(false);
  };

  return (
    <div className="camera-container">
      <div className="camera-stage">
        <video
          className={`camera-video ${isCameraOn ? 'active' : ''}`}
          ref={videoRef}
          autoPlay
          playsInline
        />
        <canvas className="camera-canvas" ref={canvasRef} />
        <div className="camera-status">{statusMessage}</div>
      </div>
      <div className="camera-buttons">
        <button
          className="camera-button"
          onClick={capturePhoto}
          disabled={!isCameraOn || isProcessing}
          type="button"
        >
          {isProcessing ? 'Aligning...' : 'Capture & Align'}
        </button>
        <button
          className="camera-button secondary"
          onClick={startCamera}
          disabled={isCameraOn}
          type="button"
        >
          Start Camera
        </button>
        <button
          className="camera-button ghost"
          onClick={stopCamera}
          disabled={!isCameraOn}
          type="button"
        >
          Stop Camera
        </button>
      </div>
    </div>
  );
};

export default Camera;
