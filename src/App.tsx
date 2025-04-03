import React, { useState, useEffect, useRef } from 'react';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import './index.css';

const App: React.FC = () => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [showEraserAnimation, setShowEraserAnimation] = useState(false);

  const transformRef = useRef<ReactZoomPanPinchRef | null>(null);
  const clickStart = useRef<{ x: number; y: number } | null>(null);

  const scale = 1.5;
  const imageWidth = 8472;
  const imageHeight = 5992;

  // Calculate percentage positions for brand buttons
  const brandButtons = [
    { text: 'Certa', x: 7064, y: 1416 },
    { text: 'Tayto', x: 7064, y: 1544 },
    { text: 'Lyons', x: 7064, y: 1660 },
    { text: 'Kerry', x: 7580, y: 1420 },
    { text: 'Aer Lingus', x: 7580, y: 1532 },
    { text: 'Headstuff', x: 7580, y: 1688 },
  ];

  // Calculate percentage positions for text box and slideshow
  const textBoxPosition = {
    x: 6900,
    y: 924,
    width: 250,
    height: 200,
  };

  const slideshowPosition = {
    x: 7200,
    y: 924,
    width: 400,
    height: 300,
  };

  // Add eraser animation state
  const [eraserPosition, setEraserPosition] = useState({
    top: `${850 / 5992 * 100}%`,
    left: `${5500 / 8472 * 100}%`,
    width: '667px',
    height: '230px',
  });

  // Add eraser animation
  const eraserAnimation = {
    position: 'absolute' as React.CSSProperties['position'],
    zIndex: 20 as React.CSSProperties['zIndex'],
    animation: 'eraserArc 3.2s linear',
    backgroundColor: 'transparent',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 1,
    transform: 'rotate(-90deg)',
    transformOrigin: 'center',
    willChange: 'transform',
  };

  // Add slideshow state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Handle slide change
  const handleSlideChange = (direction: 'left' | 'right') => {
    if (isLoading) return;
    setIsLoading(true);
    
    const newSlide = direction === 'left'
      ? (currentSlide - 1 + slides.length) % slides.length
      : (currentSlide + 1) % slides.length;

    setCurrentSlide(newSlide);
    setTimeout(() => setIsLoading(false), 500);
  };

  // Navigation button style
  const navBtnStyle: React.CSSProperties = {
    position: 'absolute' as React.CSSProperties['position'],
    top: '50%' as React.CSSProperties['top'],
    transform: 'translateY(-50%)' as React.CSSProperties['transform'],
    width: '40px' as React.CSSProperties['width'],
    height: '40px' as React.CSSProperties['height'],
    backgroundColor: 'rgba(0, 0, 0, 0.5)' as React.CSSProperties['backgroundColor'],
    border: 'none' as React.CSSProperties['border'],
    borderRadius: '50%' as React.CSSProperties['borderRadius'],
    cursor: 'pointer' as React.CSSProperties['cursor'],
    color: 'white' as React.CSSProperties['color'],
    fontWeight: 'bold' as React.CSSProperties['fontWeight'],
    fontSize: '16px' as React.CSSProperties['fontSize'],
    display: 'flex' as React.CSSProperties['display'],
    alignItems: 'center' as React.CSSProperties['alignItems'],
    justifyContent: 'center' as React.CSSProperties['justifyContent'],
    zIndex: 21 as React.CSSProperties['zIndex'],
    transition: 'opacity 0.2s ease' as React.CSSProperties['transition'],
    opacity: 0.8 as React.CSSProperties['opacity'],
  };

  // Text box style
  const textBoxStyle: React.CSSProperties = {
    position: 'absolute' as React.CSSProperties['position'],
    top: `${textBoxPosition.y / imageHeight * 100}%` as React.CSSProperties['top'],
    left: `${textBoxPosition.x / imageWidth * 100}%` as React.CSSProperties['left'],
    width: `${textBoxPosition.width}px` as React.CSSProperties['width'],
    height: `${textBoxPosition.height}px` as React.CSSProperties['height'],
    backgroundColor: 'rgba(255, 255, 255, 0.95)' as React.CSSProperties['backgroundColor'],
    padding: '16px' as React.CSSProperties['padding'],
    borderRadius: '8px' as React.CSSProperties['borderRadius'],
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' as React.CSSProperties['boxShadow'],
    zIndex: 10 as React.CSSProperties['zIndex'],
    display: 'flex' as React.CSSProperties['display'],
    alignItems: 'center' as React.CSSProperties['alignItems'],
    justifyContent: 'center' as React.CSSProperties['justifyContent'],
    overflow: 'auto' as React.CSSProperties['overflow'],
  };

  // Slideshow container style
  const slideshowContainerStyle: React.CSSProperties = {
    position: 'absolute' as React.CSSProperties['position'],
    top: `${slideshowPosition.y / imageHeight * 100}%` as React.CSSProperties['top'],
    left: `${slideshowPosition.x / imageWidth * 100}%` as React.CSSProperties['left'],
    width: `${slideshowPosition.width}px` as React.CSSProperties['width'],
    height: `${slideshowPosition.height}px` as React.CSSProperties['height'],
    backgroundColor: 'rgba(255, 255, 255, 0.95)' as React.CSSProperties['backgroundColor'],
    borderRadius: '8px' as React.CSSProperties['borderRadius'],
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' as React.CSSProperties['boxShadow'],
    display: 'flex' as React.CSSProperties['display'],
    flexDirection: 'column' as React.CSSProperties['flexDirection'],
    alignItems: 'center' as React.CSSProperties['alignItems'],
    justifyContent: 'center' as React.CSSProperties['justifyContent'],
    zIndex: 10 as React.CSSProperties['zIndex'],
  };

  // Slideshow image style
  const slideshowImageStyle: React.CSSProperties = {
    width: '100%' as React.CSSProperties['width'],
    height: '100%' as React.CSSProperties['height'],
    overflow: 'hidden' as React.CSSProperties['overflow'],
  };

  // Handle brand click with hover effect
  const handleBrandClick = (brand: string) => {
    playSound();
    setSelectedBrand(brand);
    setShowSlideshow(true);
    if (!showEraserAnimation) {
      setShowEraserAnimation(true);
      
      // Set initial position
      setEraserPosition({
        top: `${850 / 5992 * 100}%`,
        left: `${5500 / 8472 * 100}%`,
        width: '667px',
        height: '230px',
      });

      // Remove animation after completion
      setTimeout(() => {
        setShowEraserAnimation(false);
      }, 3200);
    }

    // Load slides for the selected brand
    const brandSlides = brandContent[brand]?.slides || [];
    setSlides(brandSlides);
    setCurrentSlide(0);
  };

  // Brand text content
  const brandContent: Record<string, { title: string; description: string; slides: string[] }> = {
    Certa: {
      title: 'Certa',
      description: 'Description about Certa collaboration',
      slides: ['/images/certa-slide-1.jpg', '/images/certa-slide-2.jpg'],
    },
    Tayto: {
      title: 'Tayto',
      description: 'Description about Tayto collaboration',
      slides: ['/images/tayto-slide-1.jpg', '/images/tayto-slide-2.jpg'],
    },
    Lyons: {
      title: 'Lyons',
      description: 'Description about Lyons collaboration',
      slides: ['/images/lyons-slide-1.jpg', '/images/lyons-slide-2.jpg'],
    },
    Kerry: {
      title: 'Kerry',
      description: 'Description about Kerry collaboration',
      slides: ['/images/kerry-slide-1.jpg', '/images/kerry-slide-2.jpg'],
    },
    'Aer Lingus': {
      title: 'Aer Lingus',
      description: 'Description about Aer Lingus collaboration',
      slides: ['/images/aer-lingus-slide-1.jpg', '/images/aer-lingus-slide-2.jpg'],
    },
    Headstuff: {
      title: 'Headstuff',
      description: 'Description about Headstuff collaboration',
      slides: ['/images/headstuff-slide-1.jpg', '/images/headstuff-slide-2.jpg'],
    },
  };

  // Add the keyframes to the document
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes eraserArc {
        0% { 
          top: ${850 / 5992 * 100}%; 
          left: ${5500 / 8472 * 100}%; 
          transform: translate(-50%, -50%) rotate(-90deg);
        }
        25% { 
          top: ${970 / 5992 * 100}%; 
          left: ${7080 / 8472 * 100}%; 
          transform: translate(-50%, -50%) rotate(-90deg);
        }
        31.25% { 
          top: ${890 / 5992 * 100}%; 
          left: ${7130 / 8472 * 100}%; 
          transform: translate(-50%, -50%) rotate(-90deg);
        }
        37.5% { 
          top: ${1050 / 5992 * 100}%; 
          left: ${7230 / 8472 * 100}%; 
          transform: translate(-50%, -50%) rotate(-90deg);
        }
        43.75% { 
          top: ${890 / 5992 * 100}%; 
          left: ${7330 / 8472 * 100}%; 
          transform: translate(-50%, -50%) rotate(-90deg);
        }
        50% { 
          top: ${1050 / 5992 * 100}%; 
          left: ${7430 / 8472 * 100}%; 
          transform: translate(-50%, -50%) rotate(-90deg);
        }
        56.25% { 
          top: ${890 / 5992 * 100}%; 
          left: ${7530 / 8472 * 100}%; 
          transform: translate(-50%, -50%) rotate(-90deg);
        }
        62.5% { 
          top: ${1050 / 5992 * 100}%; 
          left: ${7630 / 8472 * 100}%; 
          transform: translate(-50%, -50%) rotate(-90deg);
        }
        75% { 
          top: ${970 / 5992 * 100}%; 
          left: ${7680 / 8472 * 100}%; 
          transform: translate(-50%, -50%) rotate(-90deg);
        }
        100% { 
          top: ${970 / 5992 * 100}%; 
          left: ${8600 / 8472 * 100}%; 
          transform: translate(-50%, -50%) rotate(-90deg);
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Move to a specific point and center it on screen
  const moveTo = (x: number, y: number) => {
    const screenCenterX = window.innerWidth / 2;
    const screenCenterY = window.innerHeight / 2;

    const scaledX = x * scale;
    const scaledY = y * scale;

    const targetX = screenCenterX - scaledX;
    const targetY = screenCenterY - scaledY;

    if (transformRef.current) {
      transformRef.current.setTransform(targetX, targetY, scale);
    }
  };

  // Center after image loads and transform wrapper is ready
  useEffect(() => {
    if (imageLoaded && transformRef.current && !initialized) {
      const timeout = setTimeout(() => {
        moveTo(4070, 2990); // Your preferred view
        setInitialized(true);
      }, 400); // Give TransformWrapper time to initialize

      return () => clearTimeout(timeout);
    }
  }, [imageLoaded, initialized]);

  // Prevent accidental pan on click (only allow if user dragged)
  const handleMouseDown = (e: React.MouseEvent) => {
    clickStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (clickStart.current) {
      const dx = Math.abs(e.clientX - clickStart.current.x);
      const dy = Math.abs(e.clientY - clickStart.current.y);
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 5 && transformRef.current) {
        transformRef.current.resetTransform(); // Reset transform to prevent accidental pan
      }
    }
    clickStart.current = null;
  };

  // Button style for central buttons
  const btnStyle = (top: string, left: string, color: string, rotate: string): React.CSSProperties => ({
    position: 'absolute' as React.CSSProperties['position'],
    top,
    left,
    width: '120px' as React.CSSProperties['width'],
    height: '60px' as React.CSSProperties['height'],
    backgroundColor: color as React.CSSProperties['backgroundColor'],
    border: 'none' as React.CSSProperties['border'],
    color: 'white' as React.CSSProperties['color'],
    fontWeight: 'bold' as React.CSSProperties['fontWeight'],
    fontSize: '16px' as React.CSSProperties['fontSize'],
    padding: '0 4px' as React.CSSProperties['padding'],
    display: 'flex' as React.CSSProperties['display'],
    alignItems: 'center' as React.CSSProperties['alignItems'],
    justifyContent: 'center' as React.CSSProperties['justifyContent'],
    boxShadow: '0 0 5px rgba(0, 0, 0, 0.5)' as React.CSSProperties['boxShadow'],
    transition: 'opacity 0.2s ease' as React.CSSProperties['transition'],
    opacity: 0.8 as React.CSSProperties['opacity'],
    transform: `translate(-50%, -50%) rotate(${rotate})` as React.CSSProperties['transform'],
    transformOrigin: 'center' as React.CSSProperties['transformOrigin'],
    cursor: 'pointer' as React.CSSProperties['cursor'],
  });

  // Return button style
  const returnBtnStyle = (top: string, left: string, color: string): React.CSSProperties => ({
    position: 'absolute' as React.CSSProperties['position'],
    top,
    left,
    width: '180px' as React.CSSProperties['width'],
    height: '180px' as React.CSSProperties['height'],
    backgroundColor: color as React.CSSProperties['backgroundColor'],
    border: 'none' as React.CSSProperties['border'],
    borderRadius: '50%' as React.CSSProperties['borderRadius'],
    zIndex: 20 as React.CSSProperties['zIndex'],
    transform: 'translate(-50%, -50%)' as React.CSSProperties['transform'],
    transformOrigin: 'center' as React.CSSProperties['transformOrigin'],
    cursor: 'pointer' as React.CSSProperties['cursor'],
    color: 'white' as React.CSSProperties['color'],
    fontWeight: 'bold' as React.CSSProperties['fontWeight'],
    fontSize: '16px' as React.CSSProperties['fontSize'],
    padding: '0 4px' as React.CSSProperties['padding'],
    display: 'flex' as React.CSSProperties['display'],
    alignItems: 'center' as React.CSSProperties['alignItems'],
    justifyContent: 'center' as React.CSSProperties['justifyContent'],
    boxShadow: '0 0 5px rgba(0, 0, 0, 0.5)' as React.CSSProperties['boxShadow'],
    transition: 'opacity 0.2s ease' as React.CSSProperties['transition'],
    opacity: 0.8 as React.CSSProperties['opacity'],
  });

  // Slideshow control button style
  const slideshowBtnStyle = (top: string, left: string, color: string): React.CSSProperties => ({
    position: 'absolute' as React.CSSProperties['position'],
    top,
    left,
    width: '40px' as React.CSSProperties['width'],
    height: '40px' as React.CSSProperties['height'],
    backgroundColor: color as React.CSSProperties['backgroundColor'],
    border: 'none' as React.CSSProperties['border'],
    borderRadius: '50%' as React.CSSProperties['borderRadius'],
    zIndex: 20 as React.CSSProperties['zIndex'],
    cursor: 'pointer' as React.CSSProperties['cursor'],
    color: 'white' as React.CSSProperties['color'],
    fontWeight: 'bold' as React.CSSProperties['fontWeight'],
    fontSize: '16px' as React.CSSProperties['fontSize'],
    display: 'flex' as React.CSSProperties['display'],
    alignItems: 'center' as React.CSSProperties['alignItems'],
    justifyContent: 'center' as React.CSSProperties['justifyContent'],
    boxShadow: '0 0 5px rgba(0, 0, 0, 0.5)' as React.CSSProperties['boxShadow'],
    transition: 'opacity 0.2s ease' as React.CSSProperties['transition'],
    opacity: 0.8 as React.CSSProperties['opacity'],
  });

  // Brand button style
  const brandBtnStyle = (top: string, left: string, color: string, rotate: string): React.CSSProperties => ({
    position: 'absolute' as React.CSSProperties['position'],
    top,
    left,
    width: '60px' as React.CSSProperties['width'],
    height: '60px' as React.CSSProperties['height'],
    backgroundColor: color as React.CSSProperties['backgroundColor'],
    border: 'none' as React.CSSProperties['border'],
    borderRadius: '50%' as React.CSSProperties['borderRadius'],
    zIndex: 20 as React.CSSProperties['zIndex'],
    transform: `translate(-50%, -50%) rotate(${rotate})` as React.CSSProperties['transform'],
    transformOrigin: 'center' as React.CSSProperties['transformOrigin'],
    cursor: 'pointer' as React.CSSProperties['cursor'],
    color: 'white' as React.CSSProperties['color'],
    fontWeight: 'bold' as React.CSSProperties['fontWeight'],
    fontSize: '12px' as React.CSSProperties['fontSize'],
    padding: '0 4px' as React.CSSProperties['padding'],
    display: 'flex' as React.CSSProperties['display'],
    alignItems: 'center' as React.CSSProperties['alignItems'],
    justifyContent: 'center' as React.CSSProperties['justifyContent'],
    boxShadow: '0 0 5px rgba(0, 0, 0, 0.5)' as React.CSSProperties['boxShadow'],
    transition: 'opacity 0.2s ease' as React.CSSProperties['transition'],
    opacity: 0.8 as React.CSSProperties['opacity'],
  });

  // Play sound effect
  const playSound = () => {
    const audio = new Audio('/A Stone Thrown In Water _ Sound Effects _ Water Sounds _ Human Sounds 4.mp3');
    audio.play().catch(console.error);
  };

  return (
    <div
      style={{
        position: 'relative' as React.CSSProperties['position'],
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <TransformWrapper
        ref={transformRef}
        initialScale={scale}
        minScale={scale}
        maxScale={scale}
        centerOnInit={false}
        limitToBounds={true}
        panning={{
          disabled: false,
          velocityDisabled: true,
          allowLeftClickPan: true,
        }}
        doubleClick={{ disabled: true }}
        pinch={{ disabled: true }}
        wheel={{ disabled: true }}
      >
        <TransformComponent
          wrapperStyle={{
            width: '100%' as React.CSSProperties['width'],
            height: '100%' as React.CSSProperties['height'],
          }}
          contentStyle={{
            width: `${imageWidth}px` as React.CSSProperties['width'],
            height: `${imageHeight}px` as React.CSSProperties['height'],
            position: 'relative' as React.CSSProperties['position'],
            backgroundColor: '#fff' as React.CSSProperties['backgroundColor'],
          }}
        >
          <div
            style={{
              width: imageWidth,
              height: imageHeight,
              position: 'relative' as React.CSSProperties['position'],
            }}
          >
            {/* Text Box */}
            <div style={textBoxStyle}>
              {selectedBrand && (
                <div>
                  <h2>{brandContent[selectedBrand]?.title}</h2>
                  <p>{brandContent[selectedBrand]?.description}</p>
                </div>
              )}
            </div>

            {/* Slideshow */}
            {showSlideshow && (
              <>
                <div style={slideshowContainerStyle}>
                  <div style={slideshowImageStyle}>
                    <img
                      src={slides[currentSlide]}
                      alt="Slide"
                      style={{
                        width: '100%' as React.CSSProperties['width'],
                        height: '100%' as React.CSSProperties['height'],
                        objectFit: 'cover' as React.CSSProperties['objectFit'],
                      }}
                    />
                  </div>
                  <button
                    onClick={() => handleSlideChange('left')}
                    style={{
                      ...navBtnStyle,
                      left: '10px' as React.CSSProperties['left'],
                    }}
                  >
                    {'<'}
                  </button>
                  <button
                    onClick={() => handleSlideChange('right')}
                    style={{
                      ...navBtnStyle,
                      right: '10px' as React.CSSProperties['right'],
                    }}
                  >
                    {'>'}
                  </button>
                </div>
              </>
            )}

            <img
              src="/Portfolio Website Main Image 4 copy.jpg"
              alt="Portfolio Whiteboard"
              style={{
                width: imageWidth,
                height: imageHeight,
                position: 'absolute' as React.CSSProperties['position'],
                top: 0,
                left: 0,
                cursor: 'grab' as React.CSSProperties['cursor'],
              }}
              onLoad={() => setImageLoaded(true)}
            />

            {/* Navigation Buttons */}
            <button
              onClick={() => moveTo(934, 1200)}
              style={btnStyle('46.783%', '47.299%', 'red', '16deg')}
            >
              1
            </button>
            <button
              onClick={() => moveTo(930, 5320)}
              style={btnStyle('48.806%', '47.236%', 'blue', '-17deg')}
            >
              2
            </button>
            <button
              onClick={() => moveTo(6850, 5075)}
              style={btnStyle('47.936%', '49.236%', 'green', '16deg')}
            >
              3
            </button>
            <button
              onClick={() => moveTo(7014, 1400)}
              style={btnStyle('45.396%', '49.256%', 'yellow', '-18deg')}
            >
              4
            </button>

            {/* Return Buttons */}
            <button
              onClick={() => moveTo(4070, 2990)}
              style={returnBtnStyle('17.72%', '18.70%', 'purple')}
            >
              Return
            </button>
            <button
              onClick={() => moveTo(4070, 2990)}
              style={returnBtnStyle('90.85%', '9.53%', 'purple')}
            >
              Return
            </button>
            <button
              onClick={() => moveTo(4070, 2990)}
              style={returnBtnStyle('78.47%', '84.84%', 'purple')}
            >
              Return
            </button>
            <button
              onClick={() => moveTo(4070, 2990)}
              style={returnBtnStyle('19.66%', '77.95%', 'purple')}
            >
              Return
            </button>

            {/* Brand Buttons */}
            {brandButtons.map((brand, index) => (
              <button
                key={index}
                onClick={() => handleBrandClick(brand.text)}
                style={brandBtnStyle(`${brand.y / imageHeight * 100}%`, `${brand.x / imageWidth * 100}%`, 'orange', '0deg')}
              >
                {brand.text}
              </button>
            ))}

            {/* Eraser Animation */}
            {showEraserAnimation && (
              <div
                style={{
                  ...eraserAnimation,
                  top: eraserPosition.top,
                  left: eraserPosition.left,
                  width: eraserPosition.width,
                  height: eraserPosition.height,
                }}
              >
                <img
                  src="/images/eraser.png"
                  alt="Eraser"
                  style={{
                    width: '100%' as React.CSSProperties['width'],
                    height: '100%' as React.CSSProperties['height'],
                    objectFit: 'contain' as React.CSSProperties['objectFit'],
                  }}
                />
              </div>
            )}
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
};

export default App;
