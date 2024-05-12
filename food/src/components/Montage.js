import React, { useRef, useState } from 'react';
import './Montage.css';

const Montage = ({ photos }) => {
  const videoRef = useRef();
  const [isRecording, setIsRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState(null);

  const handleGenerateVideo = async () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const chunks = [];

    setIsRecording(true);

    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      ctx.drawImage(photo, 0, 0, canvas.width, canvas.height);
      videoRef.current.srcObject = canvas.captureStream();

      const stream = videoRef.current.captureStream();
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.start();
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 seconds
      recorder.stop();
    }

    const blob = new Blob(chunks, { type: 'video/webm' });
    setVideoBlob(blob);
    setIsRecording(false);
  };

  const handleDownloadVideo = () => {
    const url = URL.createObjectURL(videoBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'montage.webm';
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="montage">
      <h2>Montage</h2>
      <div className="montage-video">
        <video ref={videoRef} controls muted></video>
      </div>
      <div className="montage-buttons">
        <button onClick={handleGenerateVideo} disabled={isRecording || photos.length < 3}>
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
