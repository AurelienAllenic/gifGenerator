import React, { useRef, useState } from 'react';
import GIF from 'gif.js.optimized';
GIF.prototype.workerScript = '/gif.worker.js';

const VideoToGif = () => {
  const videoRef = useRef(null);
  const [videoURL, setVideoURL] = useState(null);
  const [gifURL, setGifURL] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResetButton, setShowResetButton] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoURL(url);
      setGifURL(null);
      setShowResetButton(false);
    }
  };

  const handleGenerateGif = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const gif = new GIF({
      workers: 2,
      quality: 10,
    });

    video.currentTime = 0;
    setIsLoading(true);

    const captureFrame = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      gif.addFrame(canvas, { copy: true, delay: 100 });
    };

    const processFrames = () => {
      if (video.currentTime >= video.duration) {
        gif.render();
        return;
      }

      captureFrame();
      video.currentTime += 0.1;
    };

    gif.on('finished', (blob) => {
      const gifURL = URL.createObjectURL(blob);
      setGifURL(gifURL);
      setIsLoading(false);
    });

    video.addEventListener('seeked', processFrames);
    processFrames();
  };

  const handleReset = () => {
    setVideoURL(null);
    setGifURL(null);
    setIsLoading(false);
    setShowResetButton(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Convertisseur Vidéo en GIF</h2>

      <input
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        style={{ marginBottom: '20px' }}
      />

      {videoURL && (
        <div style={{ marginBottom: '20px' }}>
          <video
            ref={videoRef}
            src={videoURL}
            controls
            style={{ width: '100%', maxWidth: '600px' }}
          />
        </div>
      )}

      {videoURL && !gifURL && !isLoading && (
        <button onClick={handleGenerateGif} style={{ marginBottom: '20px' }}>
          Convertir en GIF
        </button>
      )}

      {isLoading && (
        <div style={{ marginTop: '20px' }}>
          <p>Génération du GIF en cours...</p>
        </div>
      )}

      {gifURL && (
        <div>
          <a
            href={gifURL}
            download="output.gif"
            style={{
              color: 'blue',
              textDecoration: 'none',
              fontWeight: 'bold',
              marginTop: '20px',
              display: 'block',
            }}
            onClick={() => setShowResetButton(true)}
          >
            Télécharger le GIF
          </a>
        </div>
      )}

      {showResetButton && (
        <button
          onClick={handleReset}
          style={{
            marginTop: '30px',
            padding: '10px 20px',
            backgroundColor: 'grey',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          Convertir une autre vidéo
        </button>
      )}
    </div>
  );
};

export default VideoToGif;
