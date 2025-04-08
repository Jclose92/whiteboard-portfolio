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

  const currentSlideData = slides[currentSlide];

  useEffect(() => {
    return () => {
      // Cleanup function
    };
  }, []);

  useEffect(() => {
    if (currentSlideData) {
      console.log('Slide changed:', {
        index: currentSlide,
        type: currentSlideData.type,
        url: currentSlideData.url
      });
    }
  }, [currentSlide, currentSlideData]);

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const getMediaElement = () => {
    if (!currentSlideData) return null;

    const { url, type } = currentSlideData;

    // Log the type and URL for debugging
    console.log('Processing slide:', {
      type,
      url,
      isDriveUrl: url.includes('drive.google.com'),
      isGoogleImage: url.includes('lh3.googleusercontent.com')
    });

    if (type === 'video') {
      // For videos, we'll use an iframe regardless of the URL format
      return (
        <iframe
          src={url}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          onError={(e) => {
            console.error('Video failed to load:', url);
          }}
          onLoad={(e) => {
            console.log('Video loaded:', url);
          }}
        />
      );
    }

    // For images, we'll use an img tag
    return (
      <img
        src={url}
        alt=""
        className="media-item"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
        crossOrigin="anonymous"
        onError={(e) => {
          console.error('Image failed to load:', url);
          e.currentTarget.style.background = '#f0f0f0';
        }}
        onLoad={(e) => {
          console.log('Image loaded:', url);
        }}
      />
    );
  };

  const renderNavigationDots = () => {
    if (!showNavigation) return null;

    return (
      <div className="slideshow-navigation">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => setCurrentSlide(index)}
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
            onClick={handlePrev}
            aria-label="Previous slide"
          >
            ❮
          </button>
          <button
            className="slideshow-control next"
            onClick={handleNext}
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
