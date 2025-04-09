import React, { useState, useEffect } from 'react';
import './GoogleDriveSlideshow.css';

interface Slide {
  url: string;
  type: 'video' | 'image';
  title?: string;
  description?: string;
}

interface GoogleDriveSlideshowProps {
  slides: Slide[];
  initialSlide?: number;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showControls?: boolean;
  showNavigation?: boolean;
  showTitle?: boolean;
  showDescription?: boolean;
  width?: string | number;
  height?: string | number;
  className?: string;
}

const GoogleDriveSlideshow: React.FC<GoogleDriveSlideshowProps> = ({
  slides,
  initialSlide = 0,
  autoPlay = false,
  autoPlayInterval = 5000,
  showControls = true,
  showNavigation = true,
  showTitle = true,
  showDescription = false,
  width = '100%',
  height = '100%',
  className = '',
}) => {
  const [currentSlide, setCurrentSlide] = useState(initialSlide);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const currentSlideData = slides[currentSlide];

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const getMediaElement = () => {
    if (!currentSlideData) return null;

    const { url, type } = currentSlideData;

    if (type === 'video') {
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
                src={url}
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

    // For images, use the l3h format
    return (
      <img
        src={url}
        alt=""
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />
    );
  };

  return (
    <div className={`google-drive-slideshow ${className}`} style={{ width, height }}>
      <div className="slideshow-content">
        {getMediaElement()}
        {showTitle && currentSlideData?.title && (
          <h2>{currentSlideData.title}</h2>
        )}
        {showDescription && currentSlideData?.description && (
          <p>{currentSlideData.description}</p>
        )}
      </div>
      {showControls && (
        <div className="slideshow-controls">
          <button onClick={handlePrev} disabled={slides.length <= 1}>
            Previous
          </button>
          <button onClick={handleNext} disabled={slides.length <= 1}>
            Next
          </button>
        </div>
      )}
      {showNavigation && (
        <div className="slideshow-navigation">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={index === currentSlide ? 'active' : ''}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GoogleDriveSlideshow;
