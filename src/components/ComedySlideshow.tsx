import React, { useState, useEffect, useRef } from 'react';
import './ComedySlideshow.css';

interface ComedySlide {
  url: string;
  type: 'video' | 'image';
}

interface ComedySlideshowProps {
  slides: ComedySlide[];
  x: number;
  y: number;
  width: number;
  height: number;
}

const ComedySlideshow: React.FC<ComedySlideshowProps> = ({ slides = [], x = 0, y = 0, width = 0, height = 0 }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const soundRef = useRef<HTMLAudioElement>(null);

  const handleNextSlide = () => {
    if (soundRef.current) {
      soundRef.current.currentTime = 0;
      soundRef.current.play().catch(error => {
        console.error('Error playing sound:', error);
      });
    }
    setCurrentSlideIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  const getMediaElement = () => {
    if (slides.length === 0) {
      return null;
    }

    const currentSlide = slides[currentSlideIndex % slides.length];
    
    if (!currentSlide?.url) {
      return null;
    }

    if (currentSlide.type === 'video') {
      return (
        <div 
          style={{ 
            width: '100%', 
            height: '100%', 
            position: 'relative',
            backgroundColor: '#000'
          }}
        >
          {videoLoading && !videoError && (
            <div style={{ 
              width: '100%', 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1
            }}>
              <div>Loading video...</div>
            </div>
          )}

          {videoError && (
            <div style={{ 
              width: '100%', 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexDirection: 'column',
              gap: '10px',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1
            }}>
              <div>Video failed to load</div>
              <button onClick={() => {
                setVideoError(false);
                setVideoLoading(true);
              }}>Retry</button>
            </div>
          )}

          {!videoError && (
            <div style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              overflow: 'hidden'
            }}>
              <iframe
                src={currentSlide.url}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: videoLoading ? 'none' : 'block',
                  objectFit: 'contain'
                }}
                allow="autoplay; encrypted-media; fullscreen; picture-in-picture; clipboard-write"
                allowFullScreen
                frameBorder="0"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation allow-downloads"
                onLoad={() => {
                  console.log('Video loaded');
                  setVideoLoading(false);
                }}
                onError={() => {
                  console.error('Video failed to load');
                  setVideoLoading(false);
                  setVideoError(true);
                }}
              />
            </div>
          )}
        </div>
      );
    }

    // For images, we can use them directly
    return (
      <img
        src={currentSlide.url}
        alt={`Comedy slide ${currentSlideIndex + 1}`}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />
    );
  };

  useEffect(() => {
    setCurrentSlideIndex(0);
    setVideoLoading(false);
    setVideoError(false);
  }, [slides]);

  return (
    <>
      <div className="comedy-screen" style={{
        top: `${y / 5992 * 100}%`,
        left: `${x / 8472 * 100}%`,
        width: `${width}px`,
        height: `${height}px`,
      }}>
        <div className="comedy-content">
          {getMediaElement()}
        </div>
      </div>
      <button className="comedy-button" onClick={handleNextSlide}>
        Next
      </button>
      <audio
        ref={soundRef}
        src="Website Projector Slide Change Sound Effect 🔉📽 _ HQ 4.mp3"
        className="comedy-sound"
      />
    </>
  );
};

export default ComedySlideshow;
