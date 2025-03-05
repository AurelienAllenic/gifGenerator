import React, { useRef, useState, useEffect } from 'react';
import GIF from 'gif.js.optimized';
GIF.prototype.workerScript = '/gif.worker.js';
import './gif.scss';
import backImg from '../assets/back-gif.jpg';
import { LuLoaderCircle } from "react-icons/lu";

const VideoToGif = () => {
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const [videoURL, setVideoURL] = useState(null);
  const [gifURL, setGifURL] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResetButton, setShowResetButton] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isLoading]);

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
      workers: 4, // Increased number of workers
      quality: 10,
    });

    video.currentTime = 0;
    setIsLoading(true);

    const captureFrame = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      gif.addFrame(canvas, { copy: true, delay: 50 }); // Reduced delay between frames
    };

    const processFrames = () => {
      if (video.currentTime >= video.duration) {
        gif.render();
        return;
      }

      captureFrame();
      video.currentTime += 0.2; // Increased time step to capture fewer frames
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
    if (gifURL && !showResetButton) {
      setShowModal(true);
      return;
    }
    resetProcess();
  };

  const resetProcess = () => {
    setVideoURL(null);
    setGifURL(null);
    setIsLoading(false);
    setShowResetButton(false);
    setShowModal(false);
  };

  const handleChooseFile = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="container_gif_gen"
    style={{
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url(${backImg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }}>
      <h2>Convertisseur Vidéo en GIF</h2>

      <input
        type="file"
        accept="video/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {!videoURL && (
        <button
          onClick={handleChooseFile}
          className='button-size'
        >
          Choisir une vidéo
        </button>
      )}

      {videoURL && (
        <div style={{ marginBottom: '20px' }}>
          <video
            ref={videoRef}
            src={videoURL}
            controls
          />
        </div>
      )}

      {videoURL && !gifURL && !isLoading && (
        <button onClick={handleGenerateGif} className='button-size'>
          Convertir en GIF
        </button>
      )}

      {isLoading && (
        <div className='loading'>
          <LuLoaderCircle />
        </div>
      )}

      {gifURL && (
        <div>
          <a
            href={gifURL}
            download="output.gif"
            className='button-size'
            onClick={() => setShowResetButton(true)}
          >
            Télécharger le GIF
          </a>
        </div>
      )}

      {gifURL && (
        <button
          onClick={handleReset}
          className='button-size grey'
        >
          Convertir une autre vidéo
        </button>
      )}

      {/* Modal Confirmation */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <p>Voulez-vous télécharger le GIF avant d'en convertir un autre ?</p>
            <div className="modal-buttons">
              <a href={gifURL} download="output.gif" className="button-size"
                onClick={() => setShowModal(false)}>
                Oui, Télécharger
              </a>
              <button className="button-size grey" onClick={resetProcess}>
                Non, Continuer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoToGif;
