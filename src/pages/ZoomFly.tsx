import React, { useState, useEffect, useRef } from 'react';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import GoogleDriveSlideshow from '../components/GoogleDriveSlideshow';
import ComedySlideshow from '../components/ComedySlideshow';
import '../index.css';
import { detectDeviceType, getInitialZoomLevel, getDeviceCenterPosition } from '../utils/deviceDetection';

const ZoomFly: React.FC = () => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [showEraserAnimation, setShowEraserAnimation] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayAnimation, setOverlayAnimation] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [hasPlayedAnimations, setHasPlayedAnimations] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [initialPositionSet, setInitialPositionSet] = useState(false);

  const transformRef = useRef<ReactZoomPanPinchRef | null>(null);
  const clickStart = useRef<{ x: number; y: number } | null>(null);

  // Get initial zoom level based on device type
  const initialScale = getInitialZoomLevel();
  const imageWidth = 8472;
  const imageHeight = 5992;

  // Calculate percentage positions for brand buttons
  const brandButtons = [
    { text: 'Certa', x: 7074, y: 1406, width: 190, height: 120 },
    { text: 'Coca-Cola', x: 2214, y: 1146, width: 190, height: 120 },
    { text: 'Dove', x: 4022, y: 1562, width: 190, height: 120 },
    { text: 'Gillette', x: 5174, y: 1146, width: 190, height: 120 },
    { text: 'Hersheys', x: 7074, y: 2846, width: 190, height: 120 },
    { text: 'Honda', x: 2214, y: 2286, width: 190, height: 120 },
    { text: 'KFC', x: 4022, y: 2846, width: 190, height: 120 },
    { text: 'Lego', x: 5174, y: 2286, width: 190, height: 120 }
  ];

  // Center after image loads
  useEffect(() => {
    if (imageLoaded && !initialized) {
      const { x, y } = getDeviceCenterPosition();
      moveTo(x, y);
      setInitialized(true);
      setInitialPositionSet(true);
      // Hide loading overlay after a short delay
      setTimeout(() => setIsLoading(false), 100);
    }
  }, [imageLoaded, initialized]);

  // Function to move to a specific point
  const moveTo = (x: number, y: number) => {
    const screenCenterX = window.innerWidth / 2;
    const screenCenterY = window.innerHeight / 2;

    const scaledX = x * initialScale;
    const scaledY = y * initialScale;

    const targetX = screenCenterX - scaledX;
    const targetY = screenCenterY - scaledY;

    if (transformRef.current) {
      transformRef.current.setTransform(targetX, targetY, initialScale);
    }
  };

  // Brand button style
  const brandButtonStyle: React.CSSProperties = {
    position: 'absolute',
    background: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    padding: '5px',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '12px',
    pointerEvents: 'auto',
    zIndex: 1000,
    transition: 'transform 0.3s ease',
  };

  // Hovered brand button style
  const hoveredBrandButtonStyle: React.CSSProperties = {
    ...brandButtonStyle,
    transform: 'scale(1.1)',
    background: 'rgba(0, 0, 0, 0.9)',
  };

  // Loading overlay style
  const loadingOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'white',
    zIndex: 10000,
    pointerEvents: 'none',
  };

  return (
    <>
      {isLoading && (
        <div style={loadingOverlayStyle} />
      )}

      <TransformWrapper
        ref={transformRef}
        initialScale={initialScale}
        minScale={0.3}
        maxScale={3}
        centerOnInit={false}
        limitToBounds={true}
      >
        <TransformComponent>
          <div style={{ position: 'relative' }}>
            <img
              src={process.env.PUBLIC_URL + '/whiteboard.png'}
              alt="Whiteboard"
              onLoad={() => setImageLoaded(true)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />

            {/* Brand buttons */}
            {brandButtons.map((button, index) => (
              <button
                key={index}
                style={
                  hoveredItem === button.text
                    ? hoveredBrandButtonStyle
                    : brandButtonStyle
                }
                onClick={() => {
                  setSelectedBrand(button.text);
                  setShowSlideshow(true);
                }}
                onMouseEnter={() => setHoveredItem(button.text)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {button.text}
              </button>
            ))}

            {/* Slideshow */}
            {showSlideshow && selectedBrand && (
              <GoogleDriveSlideshow
                brand={selectedBrand}
                onClose={() => {
                  setShowSlideshow(false);
                  setSelectedBrand(null);
                }}
              />
            )}
          </div>
        </TransformComponent>
      </TransformWrapper>
    </>
  );
};

export default ZoomFly;
