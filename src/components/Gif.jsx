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
  const [progress, setProgress] = useState(0);
  const [isRendering, setIsRendering] = useState(false);
  const [estimatedTotalTime, setEstimatedTotalTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [smoothedEstimatedTime, setSmoothedEstimatedTime] = useState(0);
  
  // Options utilisateur pour qualité et frames
  const [frameRate, setFrameRate] = useState(0.2); // Capture toutes les 0.2s par défaut
  const [gifQuality, setGifQuality] = useState(10); // Qualité 10 par défaut

  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isLoading]);

  useEffect(() => {
    if (isRendering && estimatedTotalTime > 0) {
      const interval = setInterval(() => {
        setElapsedTime((prev) => {
          const newTime = prev + 0.1;
          const newEstimate = estimatedTotalTime - newTime;
          const smoothedTime = (newEstimate * 0.8) + (smoothedEstimatedTime * 0.2);
          setSmoothedEstimatedTime(Math.max(smoothedTime, 1));
          return newTime;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isRendering, estimatedTotalTime, smoothedEstimatedTime]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoURL(url);
      setGifURL(null);
    }
  };

  const handleGenerateGif = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true }); // Optimisation Canvas

    const gif = new GIF({
      workers: 4,
      quality: gifQuality,
    });

    video.currentTime = 0;
    setIsLoading(true);
    setProgress(0);
    setElapsedTime(0);
    setStartTime(Date.now());

    const totalFrames = Math.ceil(video.duration / frameRate);
    let capturedFrames = 0;

    const captureFrame = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      gif.addFrame(canvas, { copy: true, delay: 50 });

      capturedFrames++;
      setProgress(Math.min(50, Math.round((capturedFrames / totalFrames) * 50)));
    };

    const processFrames = async () => {
      if (video.currentTime >= video.duration) {
        startRendering(totalFrames);
        gif.render();
        return;
      }
      captureFrame();
      video.currentTime += frameRate;
    };

    const startRendering = (totalFrames) => {
      setProgress(50);
      setStartTime(Date.now());
      setElapsedTime(0);
      setIsRendering(true);

      const estimatedRenderTime = totalFrames * 0.05; // Estimation initiale (modifiable)
      setEstimatedTotalTime(estimatedRenderTime);

      const interval = setInterval(() => {
        setElapsedTime((prev) => {
          const newTime = prev + 0.1;
          setProgress(Math.min(99, Math.round((newTime / estimatedRenderTime) * 50 + 50)));
          return newTime;
        });
      }, 100);

      gif.on('finished', (blob) => {
        clearInterval(interval);
        const gifURL = URL.createObjectURL(blob);
        setGifURL(gifURL);
        setIsLoading(false);
        setProgress(100);
        setIsRendering(false);
        setEstimatedTotalTime(0);
      });
    };

    video.addEventListener('seeked', processFrames);
    processFrames();
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
        <button onClick={() => fileInputRef.current.click()} className='button-size'>
          Choisir une vidéo
        </button>
      )}

      {videoURL && (
        <div>
          <video ref={videoRef} src={videoURL} controls />
          <div className='container-modifiers'>
          <div>
            <label>Nombre de frames (rapidité):</label>
            <select value={frameRate} onChange={(e) => setFrameRate(parseFloat(e.target.value))}>
              <option value="0.1">Très fluide</option>
              <option value="0.5">Fluide</option>
              <option value="0.2">Rapide - saccadé</option>
            </select>
          </div>

          <div>
            <label>Qualité du GIF :</label>
            <select value={gifQuality} onChange={(e) => setGifQuality(parseInt(e.target.value))}>
              <option value="1">Haute qualité</option>
              <option value="5">Moyenne</option>
              <option value="10">Faible (rapide)</option>
            </select>
          </div>
          </div>
        </div>
      )}

      {videoURL && !gifURL && !isLoading && (
        <button onClick={handleGenerateGif} className='button-size'>
          Convertir en GIF
        </button>
      )}

      {isLoading && (
        <div className='loading-container'>
          <div className='loading'>
            <LuLoaderCircle />
          </div>
          <div className='loader-time'>
            <p>Progression : {progress}%</p>
          </div>
        </div>
      )}

      {gifURL && (
        <div>
          <a href={gifURL} download="output.gif" className='button-size'>
            Télécharger le GIF
          </a>
        </div>
      )}
    </div>
  );
};

export default VideoToGif;
