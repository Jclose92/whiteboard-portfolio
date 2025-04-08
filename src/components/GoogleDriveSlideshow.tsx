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
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isPaused, setIsPaused] = useState(false);

  const currentSlideData = slides[currentSlide];

  // Auto-play functionality
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isPlaying && !isPaused) {
      timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, autoPlayInterval);
    }

    return () => clearInterval(timer);
  }, [isPlaying, isPaused, slides.length, autoPlayInterval]);

  // Handle slide changes
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Handle video playback
  const handleVideoPlay = () => {
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
    setIsPaused(true);
  };

  // Handle media rendering
  const getMediaElement = () => {
    if (!currentSlideData) return null;

    if (currentSlideData.type === 'video') {
      return (
        <video
          src={currentSlideData.url}
          controls
          autoPlay={isPlaying}
          onPlay={handleVideoPlay}
          onPause={handleVideoPause}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      );
    }

    return (
      <img
        src={currentSlideData.url}
        alt={currentSlideData.title || 'Slide'}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />
    );
  };

  // Navigation dots
  const renderNavigationDots = () => {
    if (!showNavigation) return null;

    return (
      <div className="slideshow-navigation">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    );
  };

  return (
    <div
      className={`google-drive-slideshow ${className}`}
      style={{ width, height }}
    >
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
        <>
          <button
            className="slideshow-control prev"
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            ❮
          </button>
          <button
            className="slideshow-control next"
            onClick={nextSlide}
            aria-label="Next slide"
          >
            ❯
          </button>
        </>
      )}

      {renderNavigationDots()}
    </div>
  );
};

export default GoogleDriveSlideshow;
