import React, { useState, useEffect, useRef } from 'react';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import './index.css';

const App: React.FC = () => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [showEraserAnimation, setShowEraserAnimation] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayAnimation, setOverlayAnimation] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [hasPlayedAnimations, setHasPlayedAnimations] = useState(false);

  const transformRef = useRef<ReactZoomPanPinchRef | null>(null);
  const clickStart = useRef<{ x: number; y: number } | null>(null);

  const scale = 1.5;
  const imageWidth = 8472;
  const imageHeight = 5992;

  // Calculate percentage positions for brand buttons
  const brandButtons = [
    { text: 'Certa', x: 7074, y: 1406, width: 190, height: 120 },
    { text: 'Tayto', x: 7084, y: 1544, width: 320, height: 100 },
    { text: 'Lyons', x: 7094, y: 1660, width: 450, height: 100 },
    { text: 'Kerry', x: 7580, y: 1420, width: 170, height: 85 },
    { text: 'Aer Lingus', x: 7580, y: 1532, width: 350, height: 130 },
    { text: 'Headstuff', x: 7580, y: 1693, width: 440, height: 180 },
  ];

  // Calculate percentage positions for text box and slideshow
  const textBoxPosition = {
    x: 6900 - 5, // Move left by 5px
    y: 924 - 15, // Move up by 15px
    width: 250 - 15 - 5 - 8, // Make 28px narrower total (15px + 5px + 8px)
    height: 200,
  };

  const slideshowPosition = {
    x: 7200 + 100 - 30, // Move right by 70px
    y: 924 + 50 - 30, // Move down by 20px
    width: 400 + 240, // Make 240px wider
    height: 300 + 60, // Make 60px taller
  };

  const hoverTextBoxPosition = {
    x1: 1119, // New position
    y1: 610, // New position
    x2: 1239, // Width reduced by 30px (1244 - 1124 = 120px)
    y2: 793, // Height reduced by 30px (768 - 623 = 145px)
  };

  // Calculate percentage positions for hover areas
  const hoverAreas = [
    { text: 'Spiders', x: 1381, y: 520, width: 135, height: 150 }, // 10px higher
    { text: 'ICAD', x: 952, y: 736, width: 90, height: 120 }, // 10px wider
    { text: 'Sharks', x: 990, y: 510, width: 220, height: 170, rotation: 6 },
    { text: 'APMCs', x: 1177, y: 490, width: 100, height: 100 },
    { text: 'DMAs', x: 1401, y: 714, width: 135, height: 150 },
    { text: 'IAAs', x: 1354, y: 932, width: 170, height: 95, rotation: -6 },
    { text: 'Impact', x: 975, y: 951, width: 100, height: 165 }, // 15px taller
  ];

  // Hoverable items data
  const hoverableItems = [
    { text: 'Spiders', x: 1381, y: 520, width: 135, height: 150 },
    { text: 'ICAD', x: 952, y: 736, width: 90, height: 120 },
    { text: 'Sharks', x: 990, y: 510, width: 220, height: 170, rotation: 6 },
    { text: 'APMCs', x: 1177, y: 490, width: 100, height: 100 },
    { text: 'DMAs', x: 1401, y: 714, width: 135, height: 150 },
    { text: 'IAAs', x: 1354, y: 932, width: 170, height: 95, rotation: -6 },
    { text: 'Impact', x: 975, y: 951, width: 100, height: 165 },
  ];

  // Hover text content
  const hoverTextContent = {
    Spiders: 'Spiders are an important part of our ecosystem, helping to control pest populations.',
    ICAD: 'ICAD (International Conference on Animal Diversity) is a leading event in the field.',
    Sharks: 'Sharks play a crucial role in maintaining marine ecosystem balance.',
    APMCs: 'APMCs (Animal Population Management Centers) are dedicated to wildlife conservation.',
    DMAs: 'DMAs (Digital Media Analytics) track and analyze animal behavior patterns.',
    IAAs: 'IAAs (International Animal Awards) celebrate outstanding contributions to animal welfare.',
    Impact: 'Impact Awards recognize significant achievements in animal conservation and research.',
  };

  // Add eraser animation state
  const [eraserPosition, setEraserPosition] = useState({
    top: `${850 / 5992 * 100}%`,
    left: `${5500 / 8472 * 100}%`,
    width: '667px',
    height: '230px',
  });

  // Projector slideshow state
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isSlideshowLoading, setIsSlideshowLoading] = useState(false);
  const [projectorSlides, setProjectorSlides] = useState<string[]>([]);

  // Projector button position
  const projectorButtonPosition = {
    x: 1053 - (130 / 2), // 1053 is the center, subtract half the width
    y: 5458 - (90 / 2), // 5458 is the center, subtract half the height
    width: 130,
    height: 90,
  };

  // Slideshow container position
  const slideshowContainerPosition = {
    x1: 912,
    y1: 5128,
    x2: 1258,
    y2: 5290,
  };

  // Load slides from public/slides directory
  useEffect(() => {
    const loadSlides = async () => {
      try {
        const response = await fetch('/slides/manifest.json');
        if (response.ok) {
          const manifest = await response.json();
          setProjectorSlides(manifest.slides);
        }
      } catch (error) {
        console.error('Error loading slides:', error);
      }
    };
    loadSlides();
  }, []);

  // Projector button style
  const projectorButtonStyle: React.CSSProperties = {
    position: 'absolute' as React.CSSProperties['position'],
    top: `${projectorButtonPosition.y / imageHeight * 100}%` as React.CSSProperties['top'],
    left: `${projectorButtonPosition.x / imageWidth * 100}%` as React.CSSProperties['left'],
    width: `${projectorButtonPosition.width}px` as React.CSSProperties['width'],
    height: `${projectorButtonPosition.height}px` as React.CSSProperties['height'],
    backgroundColor: 'transparent',
    border: 'none' as React.CSSProperties['border'],
    color: 'transparent',
    cursor: 'pointer' as React.CSSProperties['cursor'],
    display: 'flex' as React.CSSProperties['display'],
    alignItems: 'center' as React.CSSProperties['alignItems'],
    justifyContent: 'center' as React.CSSProperties['justifyContent'],
    opacity: 0,
  };

  // Projector slideshow container style
  const projectorContainerStyle: React.CSSProperties = {
    position: 'absolute' as React.CSSProperties['position'],
    top: `${slideshowContainerPosition.y1 / imageHeight * 100}%` as React.CSSProperties['top'],
    left: `${slideshowContainerPosition.x1 / imageWidth * 100}%` as React.CSSProperties['left'],
    width: `${slideshowContainerPosition.x2 - slideshowContainerPosition.x1}px` as React.CSSProperties['width'],
    height: `${slideshowContainerPosition.y2 - slideshowContainerPosition.y1}px` as React.CSSProperties['height'],
    backgroundColor: 'white',
    borderRadius: '8px' as React.CSSProperties['borderRadius'],
    display: 'flex' as React.CSSProperties['display'],
    flexDirection: 'column' as React.CSSProperties['flexDirection'],
    alignItems: 'center' as React.CSSProperties['alignItems'],
    justifyContent: 'center' as React.CSSProperties['justifyContent'],
    zIndex: 13 as React.CSSProperties['zIndex'],
    overflow: 'hidden',
  };

  // Projector slide style
  const projectorSlideStyle: React.CSSProperties = {
    width: '100%' as React.CSSProperties['width'],
    height: '100%' as React.CSSProperties['height'],
    transition: 'transform 0.5s ease-in-out' as React.CSSProperties['transition'],
    position: 'absolute' as React.CSSProperties['position'],
    top: 0 as React.CSSProperties['top'],
    left: 0 as React.CSSProperties['left'],
    opacity: 0 as React.CSSProperties['opacity'],
    transform: 'translateX(100%)' as React.CSSProperties['transform'],
  };

  // Handle projector slide change
  const handleProjectorSlideChange = () => {
    if (isSlideshowLoading) return;

    setIsSlideshowLoading(true);
    
    // Play sound effect
    const audio = new Audio('/Website Projector Slide Change Sound Effect 🔉📽 _ HQ 4.mp3');
    audio.play().catch(console.error);

    // Update current slide
    const nextIndex = (currentSlideIndex + 1) % projectorSlides.length;
    setCurrentSlideIndex(nextIndex);

    // Reset loading state after animation
    setTimeout(() => {
      setIsSlideshowLoading(false);
    }, 500);
  };

  // Get slide transform
  const getSlideTransform = (index: number) => {
    if (index === currentSlideIndex) {
      return {
        opacity: 1,
        transform: 'translateX(0)',
      };
    }
    return {
      opacity: 0,
      transform: 'translateX(100%)',
    };
  };

  // Original slideshow state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Handle original slide change
  const handleOriginalSlideChange = (direction: 'left' | 'right') => {
    if (isLoading) return;

    setIsLoading(true);
    
    const newSlide = direction === 'left'
      ? (currentSlide - 1 + slides.length) % slides.length
      : (currentSlide + 1) % slides.length;

    setCurrentSlide(newSlide);
    setTimeout(() => setIsLoading(false), 500);
  };

  // Slideshow slide style
  const slideshowSlideStyle: React.CSSProperties = {
    width: '100%' as React.CSSProperties['width'],
    height: '100%' as React.CSSProperties['height'],
    transition: 'transform 0.5s ease-in-out' as React.CSSProperties['transition'],
    position: 'absolute' as React.CSSProperties['position'],
    top: 0 as React.CSSProperties['top'],
    left: 0 as React.CSSProperties['left'],
    opacity: 0 as React.CSSProperties['opacity'],
    transform: 'translateX(100%)' as React.CSSProperties['transform'],
  };

  // Hover text box style
  const hoverTextBoxStyle: React.CSSProperties = {
    position: 'absolute' as React.CSSProperties['position'],
    top: `${hoverTextBoxPosition.y1 / imageHeight * 100}%` as React.CSSProperties['top'],
    left: `${hoverTextBoxPosition.x1 / imageWidth * 100}%` as React.CSSProperties['left'],
    width: `${hoverTextBoxPosition.x2 - hoverTextBoxPosition.x1}px` as React.CSSProperties['width'],
    height: `${hoverTextBoxPosition.y2 - hoverTextBoxPosition.y1}px` as React.CSSProperties['height'],
    backgroundColor: 'transparent',
    border: 'none',
    padding: '8px' as React.CSSProperties['padding'],
    borderRadius: '4px' as React.CSSProperties['borderRadius'],
    zIndex: 13 as React.CSSProperties['zIndex'],
    pointerEvents: 'none' as React.CSSProperties['pointerEvents'],
    display: 'flex' as React.CSSProperties['display'],
    alignItems: 'flex-start' as React.CSSProperties['alignItems'],
    justifyContent: 'flex-start' as React.CSSProperties['justifyContent'],
    fontFamily: 'WhiteboardFont' as React.CSSProperties['fontFamily'],
    fontSize: '18px' as React.CSSProperties['fontSize'],
  };

  // Hover item style
  const getHoverItemStyle = (item: { x: number; y: number; width: number; height: number; rotation?: number }) => {
    const style: React.CSSProperties = {
      position: 'absolute' as React.CSSProperties['position'],
      top: `${(item.y - item.height / 2) / imageHeight * 100}%` as React.CSSProperties['top'],
      left: `${(item.x - item.width / 2) / imageWidth * 100}%` as React.CSSProperties['left'],
      width: `${item.width}px` as React.CSSProperties['width'],
      height: `${item.height}px` as React.CSSProperties['height'],
      backgroundColor: 'transparent',
      display: 'flex' as React.CSSProperties['display'],
      alignItems: 'center' as React.CSSProperties['alignItems'],
      justifyContent: 'center' as React.CSSProperties['justifyContent'],
      cursor: 'pointer' as React.CSSProperties['cursor'],
      zIndex: 12 as React.CSSProperties['zIndex'],
      transition: 'opacity 0.2s ease',
      opacity: 1 as React.CSSProperties['opacity'],
      border: 'none',
    };

    return style;
  };

  // Handle hover
  const handleHover = (text: string) => {
    setHoveredItem(text);
  };

  const handleHoverLeave = () => {
    setHoveredItem(null);
  };

  // Render hover text
  const renderHoverText = () => {
    if (!hoveredItem) return null;
    return (
      <div style={hoverTextBoxStyle}>
        <p>{hoverTextContent[hoveredItem as keyof typeof hoverTextContent]}</p>
      </div>
    );
  };

  // Play sound effect
  const playSound = () => {
    const audio = new Audio('/A Stone Thrown In Water _ Sound Effects _ Water Sounds _ Human Sounds 4.mp3');
    audio.play().catch(console.error);
  };

  // Handle button click with overlay animation
  const handleBrandClick = (brand: string) => {
    playSound();
    setSelectedBrand(brand);
    
    // Only show overlay if it hasn't been shown before
    if (!hasPlayedAnimations) {
      setShowSlideshow(true);
      setShowOverlay(true);
      
      // Only set hasPlayedAnimations to true if it hasn't been set before
      setHasPlayedAnimations(true);
      
      // Start overlay animation
      setTimeout(() => {
        setOverlayAnimation(true);
        
        // Hide overlay after animation completes
        setTimeout(() => {
          setShowOverlay(false);
          setOverlayAnimation(false);
        }, 2100);
      }, 1000);

      // Show eraser animation
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
      }, 3700);
    } else {
      // For subsequent clicks, just show the slideshow without the overlay
      setShowSlideshow(true);
    }

    // Load slides for the selected brand
    const brandSlides = brandContent[brand]?.slides || [];
    setSlides(brandSlides);
    setCurrentSlide(0);
  };

  // Button style for central buttons
  const btnStyle = (top: string, left: string, color: string, rotate: string): React.CSSProperties => ({
    position: 'absolute',
    top,
    left,
    width: '120px',
    height: '60px',
    backgroundColor: 'transparent',
    border: 'none',
    color: 'black',
    fontWeight: 'bold',
    fontSize: '32px',
    fontFamily: 'WhiteboardFont, sans-serif',
    padding: '0 4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'opacity 0.2s ease',
    opacity: 0.8,
    transform: `translate(-50%, -50%) rotate(${rotate})`,
  });

  // Return button style
  const returnBtnStyle = (top: string, left: string, color: string, width: string = '220px', height: string = '220px'): React.CSSProperties => ({
    position: 'absolute',
    top,
    left,
    width,
    height,
    backgroundColor: 'transparent',
    color: 'black',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: '24px',
    fontFamily: 'WhiteboardFont, sans-serif',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    transform: 'translate(-50%, -50%)',
    transformOrigin: 'center',
  });

  // Text box style
  const textBoxStyle: React.CSSProperties = {
    position: 'absolute' as React.CSSProperties['position'],
    top: `${textBoxPosition.y / imageHeight * 100}%` as React.CSSProperties['top'],
    left: `${textBoxPosition.x / imageWidth * 100}%` as React.CSSProperties['left'],
    width: `${textBoxPosition.width}px` as React.CSSProperties['width'],
    height: `${textBoxPosition.height}px` as React.CSSProperties['height'],
    backgroundColor: 'white',
    padding: '16px' as React.CSSProperties['padding'],
    borderRadius: '8px' as React.CSSProperties['borderRadius'],
    zIndex: 10 as React.CSSProperties['zIndex'],
    display: 'flex' as React.CSSProperties['display'],
    alignItems: 'center' as React.CSSProperties['alignItems'],
    justifyContent: 'center' as React.CSSProperties['justifyContent'],
  };

  // Slideshow container style
  const slideshowContainerStyle: React.CSSProperties = {
    position: 'absolute' as React.CSSProperties['position'],
    top: `${slideshowPosition.y / imageHeight * 100}%` as React.CSSProperties['top'],
    left: `${slideshowPosition.x / imageWidth * 100}%` as React.CSSProperties['left'],
    width: `${slideshowPosition.width}px` as React.CSSProperties['width'],
    height: `${slideshowPosition.height}px` as React.CSSProperties['height'],
    backgroundColor: 'white',
    borderRadius: '8px' as React.CSSProperties['borderRadius'],
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

  // Slideshow overlay style
  const overlayStyle: React.CSSProperties = {
    position: 'absolute' as React.CSSProperties['position'],
    top: `${slideshowPosition.y / imageHeight * 100}%` as React.CSSProperties['top'],
    left: `${slideshowPosition.x / imageWidth * 100}%` as React.CSSProperties['left'],
    width: `${slideshowPosition.width}px` as React.CSSProperties['width'],
    height: `${slideshowPosition.height}px` as React.CSSProperties['height'],
    backgroundColor: 'transparent',
    border: 'none',
    overflow: 'hidden',
    zIndex: 11 as React.CSSProperties['zIndex'],
    pointerEvents: 'none',
    clipPath: overlayAnimation ? 'inset(0 0 0 100%)' : 'inset(0 0 0 0)',
    transition: `clip-path 1.89s ease-in-out`,
  };

  // Overlay image style
  const overlayImageStyle: React.CSSProperties = {
    position: 'absolute' as React.CSSProperties['position'],
    top: 0,
    left: 0,
    width: '100%' as React.CSSProperties['width'],
    height: '100%' as React.CSSProperties['height'],
    objectFit: 'cover' as React.CSSProperties['objectFit'],
  };

  // Add the keyframes to the document
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes overlaySlide {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Render the overlay
  const renderOverlay = () => (
    <div style={overlayStyle}>
      <img
        src="/images/Slideshow Overlay.png"
        alt="Overlay"
        style={overlayImageStyle}
      />
    </div>
  );

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
    transition: 'opacity 0.2s ease' as React.CSSProperties['transition'],
    opacity: 0.8 as React.CSSProperties['opacity'],
  });

  // Brand button style
  const brandBtnStyle = (top: string, left: string, color: string, rotate: string, width: string, height: string): React.CSSProperties => ({
    position: 'absolute' as React.CSSProperties['position'],
    top,
    left,
    width,
    height,
    backgroundColor: 'transparent',
    border: 'none' as React.CSSProperties['border'],
    borderRadius: '50%' as React.CSSProperties['borderRadius'],
    transform: `translate(-50%, -50%) rotate(${rotate})` as React.CSSProperties['transform'],
    cursor: 'pointer' as React.CSSProperties['cursor'],
    zIndex: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'none',
    pointerEvents: 'auto',
    transition: 'opacity 0.3s ease',
  });

  // Eraser animation style
  const eraserAnimation: React.CSSProperties = {
    position: 'absolute' as React.CSSProperties['position'],
    zIndex: 20 as React.CSSProperties['zIndex'],
    animation: 'eraserArc 3.2s linear',
    backgroundColor: 'transparent',
    border: 'none',
    display: 'flex' as React.CSSProperties['display'],
    alignItems: 'center' as React.CSSProperties['alignItems'],
    justifyContent: 'center' as React.CSSProperties['justifyContent'],
    opacity: 1 as React.CSSProperties['opacity'],
    transform: 'rotate(-90deg)' as React.CSSProperties['transform'],
    transformOrigin: 'center' as React.CSSProperties['transformOrigin'],
    willChange: 'transform' as React.CSSProperties['willChange'],
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
          top: ${(970 + 120) / 5992 * 100}%; 
          left: ${7080 / 8472 * 100}%; 
          transform: translate(-50%, -50%) rotate(-90deg);
        }
        31.25% { 
          top: ${(890 + 120) / 5992 * 100}%; 
          left: ${7130 / 8472 * 100}%; 
          transform: translate(-50%, -50%) rotate(-90deg);
        }
        37.5% { 
          top: ${(1050 + 120) / 5992 * 100}%; 
          left: ${7230 / 8472 * 100}%; 
          transform: translate(-50%, -50%) rotate(-90deg);
        }
        43.75% { 
          top: ${(890 + 120) / 5992 * 100}%; 
          left: ${7330 / 8472 * 100}%; 
          transform: translate(-50%, -50%) rotate(-90deg);
        }
        50% { 
          top: ${(1050 + 120) / 5992 * 100}%; 
          left: ${7430 / 8472 * 100}%; 
          transform: translate(-50%, -50%) rotate(-90deg);
        }
        56.25% { 
          top: ${(890 + 120) / 5992 * 100}%; 
          left: ${7530 / 8472 * 100}%; 
          transform: translate(-50%, -50%) rotate(-90deg);
        }
        62.5% { 
          top: ${(1050 + 120) / 5992 * 100}%; 
          left: ${7630 / 8472 * 100}%; 
          transform: translate(-50%, -50%) rotate(-90deg);
        }
        75% { 
          top: ${(970 + 120) / 5992 * 100}%; 
          left: ${7680 / 8472 * 100}%; 
          transform: translate(-50%, -50%) rotate(-90deg);
        }
        100% { 
          top: ${(970 + 120) / 5992 * 100}%; 
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

  // Eraser animation styles
  const eraserImageStyle: React.CSSProperties = {
    width: '100%' as React.CSSProperties['width'],
    height: '100%' as React.CSSProperties['height'],
    objectFit: 'contain' as React.CSSProperties['objectFit'],
  };

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [sendButtonVisible, setSendButtonVisible] = useState(true);

  // Speech bubble position
  const speechBubblePosition = {
    x: 6773,  // Moved 30px to the right from 6743
    y: 4859,
    width: 300,
    height: 200
  };

  // Speech bubble container style
  const speechBubbleContainerStyle: React.CSSProperties = {
    position: 'absolute',
    top: `${speechBubblePosition.y / imageHeight * 100}%`,
    left: `${speechBubblePosition.x / imageWidth * 100}%`,
    width: `${speechBubblePosition.width}px`,
    height: `${speechBubblePosition.height}px`,
    zIndex: 15,
    pointerEvents: 'none',
    transform: 'rotate(4deg)',
    display: isSubmitted ? 'none' : 'block'
  };

  // Speech bubble image style
  const speechBubbleImageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1
  };

  // Speech bubble text style
  const speechBubbleTextStyle: React.CSSProperties = {
    position: 'absolute',
    top: '20%',
    left: '10%',
    width: '80%',
    height: '60%',
    fontFamily: 'WhiteboardFont',
    fontSize: '32px',  // Changed from 16px to 32px (2 times larger)
    color: '#000000',
    zIndex: 2,
    padding: '10px',
    pointerEvents: 'none'
  };

  // Contact form container style
  const contactFormStyle: React.CSSProperties = {
    position: 'absolute',
    top: `${4893 / imageHeight * 100}%`,
    left: `${7275 / imageWidth * 100}%`,
    width: '300px',
    height: '450px',
    backgroundColor: 'transparent',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: 'none',
    zIndex: 15,
    pointerEvents: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    fontFamily: 'WhiteboardFont',
    boxSizing: 'border-box' as React.CSSProperties['boxSizing'],
    cursor: 'text',
    border: 'none',
    transform: 'rotate(4deg)',
  };

  // Input field style
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px',
    borderRadius: '4px',
    border: 'none',
    fontSize: '20px',
    color: '#333',
    background: 'transparent',
    WebkitUserSelect: 'text',
    MozUserSelect: 'text',
    msUserSelect: 'text',
    userSelect: 'text',
    pointerEvents: 'auto',
    touchAction: 'none',
    outline: 'none',
    transition: 'border-color 0.3s ease',
    fontFamily: 'WhiteboardFont',
    transform: 'rotate(4deg)',
  };

  // Textarea style
  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    height: '230px',
    resize: 'none',
    overflow: 'auto',
    transform: 'translate(-20px, 10px) rotate(8deg)',
  };

  // Handle form input changes
  const handleInputChange = (field: keyof typeof contactForm) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newForm = { ...contactForm, [field]: event.target.value };
    setContactForm(newForm);
    validateForm(newForm);
  };

  // Validate form
  const validateForm = (form: typeof contactForm) => {
    const isValid = form.name.trim() !== '' && 
                   form.email.trim() !== '' && 
                   form.message.trim() !== '';
    setIsFormValid(isValid);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!isFormValid || isSending) return;

    setIsSending(true);
    
    // Play sound effect
    const audio = new Audio('/Website Crow Sound Effect 4.mp3');
    audio.play().catch(console.error);

    // Simulate form submission
    try {
      // In a real application, you would send this data to your backend
      console.log('Form submitted:', contactForm);
      setShowSuccessMessage(true);
      setContactForm({ name: '', email: '', message: '' });
      setIsFormValid(false);
      setIsSubmitted(true);
      setSendButtonVisible(false);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Success message style
  const successMessageStyle: React.CSSProperties = {
    position: 'absolute',
    top: `${4893 / imageHeight * 100}%`,
    left: `${7323 / imageWidth * 100}%`,
    width: '250px',
    height: '300px',
    backgroundColor: 'transparent',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: 'none',
    zIndex: 15,
    pointerEvents: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    fontFamily: 'WhiteboardFont',
    boxSizing: 'border-box' as React.CSSProperties['boxSizing'],
    cursor: 'text',
    border: 'none',
    transform: 'rotate(10deg)',
  };

  // Success message text style
  const successMessageTextStyle: React.CSSProperties = {
    fontSize: '30px',
    color: '#333',
    textAlign: 'center' as React.CSSProperties['textAlign'],
    fontFamily: 'WhiteboardFont',
    margin: 'auto',
    lineHeight: '1.5',
  };

  // Send button style
  const sendButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: `${5083 / imageHeight * 100}%`,
    left: `${6710 / imageWidth * 100}%`,
    width: '260px',
    height: '217px',
    backgroundColor: 'transparent',
    borderRadius: '8px',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    border: 'none',
    outline: 'none',
    transition: 'background-color 0.3s ease',
    zIndex: 15,
    pointerEvents: 'auto',
    transform: 'translate(-50%, -50%)',
    fontFamily: 'WhiteboardFont',
    display: 'flex',
  };

  // Send button image style
  const sendButtonImageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    display: 'block',
  };

  // Text box positions
  const textBoxes = [
    { name: 'About', x: 1062, y: 1047 },
    { name: 'Telescope', x: 1491, y: 1149 },
    { name: 'Turn Back', x: 2190, y: 4593 },
    { name: 'Comedy Section', x: 1248, y: 5412 },
    { name: 'Work Sign', x: 7266, y: 1386 },
    { name: 'Zoom Wizard', x: 4545, y: 5145 }
  ];

  // Text box style
  const textBoxStyle2: React.CSSProperties = {
    position: 'absolute',
    width: '30px',
    height: '30px',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    border: '1px solid rgba(0, 0, 0, 0.3)',
    borderRadius: '4px',
    fontFamily: 'WhiteboardFont',
    fontSize: '12px',
    color: '#000000',
    pointerEvents: 'none',
    zIndex: 10,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    padding: '2px 4px'
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
          excluded: ['input', 'textarea', 'button']
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

            {/* Projector Slideshow */}
            <button
              onClick={handleProjectorSlideChange}
              style={projectorButtonStyle}
            >
              Projector
            </button>

            <div style={projectorContainerStyle}>
              {projectorSlides.map((slide, index) => (
                <div
                  key={index}
                  style={{
                    ...projectorSlideStyle,
                    ...getSlideTransform(index),
                  }}
                >
                  <img
                    src={slide}
                    alt="Slide"
                    style={{
                      width: '100%' as React.CSSProperties['width'],
                      height: '100%' as React.CSSProperties['height'],
                      objectFit: 'cover' as React.CSSProperties['objectFit'],
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Original Slideshow */}
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
                    onClick={() => handleOriginalSlideChange('left')}
                    style={{
                      ...slideshowBtnStyle,
                      left: '10px' as React.CSSProperties['left'],
                    }}
                  >
                    {'<'}
                  </button>
                  <button
                    onClick={() => handleOriginalSlideChange('right')}
                    style={{
                      ...slideshowBtnStyle,
                      right: '10px' as React.CSSProperties['right'],
                    }}
                  >
                    {'>'}
                  </button>
                </div>
                {showOverlay && renderOverlay()}
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
              style={btnStyle('46.783%', '47.299%', 'red', '16deg')}
              onClick={() => moveTo(934, 1200)}
            >
              About
            </button>

            <button
              style={btnStyle('48.806%', '47.236%', 'blue', '-17deg')}
              onClick={() => moveTo(930, 5320)}
            >
              Danger
            </button>

            <button
              style={btnStyle('47.936%', '49.236%', 'green', '16deg')}
              onClick={() => moveTo(6850, 5075)}
            >
              Contact
            </button>

            <button
              style={btnStyle('45.396%', '49.256%', 'yellow', '-18deg')}
              onClick={() => moveTo(7014, 1400)}
            >
              Work
            </button>

            {/* Return Buttons */}
            <button
              style={returnBtnStyle('17.55%', '19.3%', 'purple', '230px', '230px')} 
              onClick={() => moveTo(4070, 2990)}
            >
              Return
            </button>

            <button
              style={returnBtnStyle('90.85%', '9.53%', 'purple', '260px', '260px')}
              onClick={() => moveTo(4070, 2990)}
            >
              Return
            </button>

            <button
              style={returnBtnStyle('78.47%', '84.84%', 'purple', '260px', '260px')}
              onClick={() => moveTo(4070, 2990)}
            >
              Return
            </button>

            <button
              style={returnBtnStyle('19.66%', '77.95%', 'purple', '260px', '260px')}
              onClick={() => moveTo(4070, 2990)}
            >
              Return
            </button>

            {/* Brand Buttons */}
            {brandButtons.map((brand, index) => (
              <button
                key={index}
                onClick={() => handleBrandClick(brand.text)}
                style={brandBtnStyle(`${brand.y / imageHeight * 100}%`, `${brand.x / imageWidth * 100}%`, 'transparent', '0deg', `${brand.width}px`, `${brand.height}px`)}
              />
            ))}
            {/* Hoverable Items */}
            {hoverableItems.map((item, index) => (
              <button
                key={index}
                onMouseOver={() => handleHover(item.text)}
                onMouseLeave={handleHoverLeave}
                style={getHoverItemStyle(item)}
              />
            ))}
            {/* Hover Text Box */}
            {renderHoverText()}
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
                  style={eraserImageStyle}
                />
              </div>
            )}
            {/* Text Boxes */}
            {textBoxes.map((box) => (
              <div
                key={box.name}
                style={{
                  ...textBoxStyle2,
                  top: `${box.y / imageHeight * 100}%`,
                  left: `${box.x / imageWidth * 100}%`,
                }}
              >
                {box.name}
              </div>
            ))}
            {/* Speech Bubble */}
            {!isSubmitted && (
              <div style={speechBubbleContainerStyle}>
                <img 
                  src="speechbubble.png" 
                  alt="Speech Bubble" 
                  style={speechBubbleImageStyle}
                />
                <div style={speechBubbleTextStyle}>
                  click me when you've written your message
                </div>
              </div>
            )}
            {/* Contact Form */}
            <div style={contactFormStyle}>
              {isSubmitted ? null : (
                <>
                  <input
                    type="text"
                    name="name"
                    value={contactForm.name}
                    onChange={handleInputChange('name')}
                    placeholder="Name"
                    style={inputStyle}
                  />
                  <input
                    type="email"
                    name="email"
                    value={contactForm.email}
                    onChange={handleInputChange('email')}
                    placeholder="Email"
                    style={inputStyle}
                  />
                  <textarea
                    name="message"
                    value={contactForm.message}
                    onChange={handleInputChange('message')}
                    placeholder="Message"
                    style={textareaStyle}
                  />
                </>
              )}
            </div>
            {sendButtonVisible && (
              <button
                onClick={handleSubmit}
                style={sendButtonStyle}
              >
                <img
                  src="ravenoverlay.png"
                  alt="Send"
                  style={sendButtonImageStyle}
                />
              </button>
            )}
            {showSuccessMessage && (
              <div style={successMessageStyle}>
                <p style={successMessageTextStyle}>
                  Thank You!<br/>
                  The Raven Will Deliver Your Message.
                </p>
              </div>
            )}
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
};

export default App;
