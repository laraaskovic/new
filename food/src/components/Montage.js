import React, { useRef, useState } from 'react';
import './Montage.css';

const Montage = ({ photos }) => {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [isRecording, setIsRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleGenerateVideo = async () => {
    setIsRecording(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const videoWidth = videoRef.current.videoWidth;
    const videoHeight = videoRef.current.videoHeight;
    canvas.width = videoWidth;
    canvas.height = videoHeight;

    const chunks = [];
    const stream = canvas.captureStream();
    const recorder = new MediaRecorder(stream);

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      setVideoBlob(blob);
      setIsRecording(false);
    };

    recorder.start();

    for (let i = 0; i < photos.length; i++) {
      drawPhoto(ctx, videoWidth, videoHeight, photos[i]);
      setCurrentIndex(i + 1);
      await wait(2000); // Wait for 2 seconds for each photo
    }

    setIsPlaying(true);
    videoRef.current.srcObject = stream;
    await wait(photos.length * 2000 + 1000); // Wait for the duration of the video
    recorder.stop();
    setIsPlaying(false);
  };

  const drawPhoto = (ctx, width, height, photo) => {
    const img = new Image();
    img.src = photo;
    img.onload = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
    };
  };

  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const handleDownloadVideo = () => {
    if (videoBlob) {
      const url = URL.createObjectURL(videoBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'montage.webm';
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="montage">
      <h2>Montage</h2>
      <div className="montage-video">
        <video
          ref={videoRef}
          controls
          muted
          style={{ display: isPlaying ? 'block' : 'none' }}
          onEnded={() => setIsPlaying(false)}
        ></video>
        <canvas ref={canvasRef} style={{ display: isPlaying ? 'none' : 'block' }}></canvas>
      </div>
      <div className="montage-status">
        {isRecording ? (
          <p>Recording...</p>
        ) : (
          <p>{isPlaying ? `Playing photo ${currentIndex} of ${photos.length}` : 'Ready to generate video'}</p>
        )}
      </div>
      <div className="montage-buttons">
        <button onClick={handleGenerateVideo} disabled={isRecording || photos.length === 0}>
          Generate Video
        </button>
        {videoBlob && (
          <button onClick={handleDownloadVideo}>Download Video</button>
        )}
      </div>
    </div>
  );
};

export default Montage;
