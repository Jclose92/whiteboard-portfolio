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
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '50%' as React.CSSProperties['borderRadius'],
    display: 'flex' as React.CSSProperties['display'],
    alignItems: 'center' as React.CSSProperties['alignItems'],
    justifyContent: 'center' as React.CSSProperties['justifyContent'],
    cursor: 'pointer' as React.CSSProperties['cursor'],
    zIndex: 14 as React.CSSProperties['zIndex'],
    border: '2px solid #000' as React.CSSProperties['border'],
    opacity: 0.8 as React.CSSProperties['opacity'],
    transition: 'opacity 0.2s ease' as React.CSSProperties['transition'],
    pointerEvents: isSlideshowLoading ? 'none' : 'auto',
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

  // Hoverable items data
  const hoverableItems = [
    { text: 'Impact', x: 975, y: 951, width: 100, height: 150 },
    { text: 'ICAD', x: 952, y: 736, width: 80, height: 120 },
    { text: 'Sharks', x: 990, y: 510, width: 220, height: 170, rotation: 6 },
    { text: 'APMCs', x: 1177, y: 490, width: 100, height: 100 },
    { text: 'Spiders', x: 1381, y: 530, width: 135, height: 150 },
    { text: 'DMAs', x: 1401, y: 714, width: 135, height: 150 },
    { text: 'IAAs', x: 1354, y: 932, width: 155, height: 90, rotation: -6 },
  ];

  // Text box position
  const hoverTextBoxPosition = {
    x1: 1137,
    y1: 643,
    x2: 1214,
    y2: 765,
  };

  // Hover item style
  const getHoverItemStyle = (item: { x: number; y: number; width: number; height: number; rotation?: number }) => {
    const style: React.CSSProperties = {
      position: 'absolute' as React.CSSProperties['position'],
      top: `${(item.y - item.height / 2) / imageHeight * 100}%` as React.CSSProperties['top'],
      left: `${(item.x - item.width / 2) / imageWidth * 100}%` as React.CSSProperties['left'],
      width: `${item.width}px` as React.CSSProperties['width'],
      height: `${item.height}px` as React.CSSProperties['height'],
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: '50px' as React.CSSProperties['borderRadius'],
      display: 'flex' as React.CSSProperties['display'],
      alignItems: 'center' as React.CSSProperties['alignItems'],
      justifyContent: 'center' as React.CSSProperties['justifyContent'],
      cursor: 'pointer' as React.CSSProperties['cursor'],
      zIndex: 12 as React.CSSProperties['zIndex'],
      transition: 'opacity 0.2s ease' as React.CSSProperties['transition'],
      opacity: 0.8 as React.CSSProperties['opacity'],
      border: '2px solid #000' as React.CSSProperties['border'],
      fontFamily: 'WhiteboardFont' as React.CSSProperties['fontFamily'],
      fontSize: '14px' as React.CSSProperties['fontSize'],
    };

    if (item.rotation) {
      style.transform = `rotate(${item.rotation}deg)` as React.CSSProperties['transform'];
    }

    return style;
  };

  // Hover text box style
  const hoverTextBoxStyle: React.CSSProperties = {
    position: 'absolute' as React.CSSProperties['position'],
    top: `${hoverTextBoxPosition.y1 / imageHeight * 100}%` as React.CSSProperties['top'],
    left: `${hoverTextBoxPosition.x1 / imageWidth * 100}%` as React.CSSProperties['left'],
    width: `${hoverTextBoxPosition.x2 - hoverTextBoxPosition.x1}px` as React.CSSProperties['width'],
    height: `${hoverTextBoxPosition.y2 - hoverTextBoxPosition.y1}px` as React.CSSProperties['height'],
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: '8px' as React.CSSProperties['padding'],
    borderRadius: '4px' as React.CSSProperties['borderRadius'],
    zIndex: 13 as React.CSSProperties['zIndex'],
    pointerEvents: 'none' as React.CSSProperties['pointerEvents'],
    display: 'flex' as React.CSSProperties['display'],
    alignItems: 'center' as React.CSSProperties['alignItems'],
    justifyContent: 'center' as React.CSSProperties['justifyContent'],
    fontFamily: 'WhiteboardFont' as React.CSSProperties['fontFamily'],
    fontSize: '16px' as React.CSSProperties['fontSize'],
  };

  // Handle hover
  const handleHover = (text: string) => {
    setHoveredItem(text);
  };

  const handleHoverLeave = () => {
    setHoveredItem(null);
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
    setShowSlideshow(true);
    setShowOverlay(true);
    
    // Start animation after delay
    setTimeout(() => {
      setOverlayAnimation(true);
      
      // Hide overlay after animation completes
      setTimeout(() => {
        setShowOverlay(false);
        setOverlayAnimation(false);
      }, 1000);
    }, 1000);

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

  // Overlay style
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
    transition: `clip-path 1s ease-in-out`,
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

  // Contact form box coordinates
  const contactFormBoxes = {
    name: {
      x1: 7323,
      y1: 4893,
      x2: 7439,
      y2: 4913,
      x3: 7318,
      y3: 4920,
      x4: 7433,
      y4: 4940,
    },
    email: {
      x1: 7469,
      y1: 4918,
      x2: 7576,
      y2: 4935,
      x3: 7464,
      y3: 4944,
      x4: 7572,
      y4: 4962,
    },
    message: {
      x1: 7316,
      y1: 4946,
      x2: 7566,
      y2: 4982,
      x3: 7275,
      y3: 5202,
      x4: 7512,
      y4: 5261,
    },
  };

  // Send button position
  const sendButtonPosition = {
    x: 6710 - (230 / 2), // 6710 is the center, subtract half the width
    y: 5083 - (187 / 2), // 5083 is the center, subtract half the height
    width: 230,
    height: 187,
  };

  // Get box style with skew
  const getSkewedBoxStyle = (box: { x1: number; y1: number; x2: number; y2: number; x3: number; y3: number; x4: number; y4: number }) => {
    const width = box.x2 - box.x1;
    const height = box.y2 - box.y1;
    
    // Calculate skew angles
    const angle1 = Math.atan2(box.y2 - box.y1, box.x2 - box.x1) * (180 / Math.PI);
    const angle2 = Math.atan2(box.y4 - box.y3, box.x4 - box.x3) * (180 / Math.PI);

    return {
      position: 'absolute' as React.CSSProperties['position'],
      top: `${box.y1 / imageHeight * 100}%` as React.CSSProperties['top'],
      left: `${box.x1 / imageWidth * 100}%` as React.CSSProperties['left'],
      width: `${width}px` as React.CSSProperties['width'],
      height: `${height}px` as React.CSSProperties['height'],
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      border: '2px solid #000' as React.CSSProperties['border'],
      zIndex: 15 as React.CSSProperties['zIndex'],
      transform: `skew(${angle1}deg, ${angle2}deg)` as React.CSSProperties['transform'],
      fontFamily: 'WhiteboardFont' as React.CSSProperties['fontFamily'],
      fontSize: '14px' as React.CSSProperties['fontSize'],
      padding: '8px' as React.CSSProperties['padding'],
      display: showSuccessMessage ? 'none' : 'block',
      boxSizing: 'border-box' as React.CSSProperties['boxSizing'],
      cursor: 'text' as React.CSSProperties['cursor'],
    };
  };

  // Input field styles
  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    border: 'none',
    background: 'transparent',
    outline: 'none',
    fontSize: '14px',
    fontFamily: 'WhiteboardFont',
    color: '#000',
    padding: '8px',
    boxSizing: 'border-box',
    transform: 'skew(-10deg, -10deg)', // Counter-skew to match the container
    resize: 'none' as React.CSSProperties['resize'],
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
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Success message style
  const successMessageStyle = {
    position: 'absolute' as React.CSSProperties['position'],
    top: `${contactFormBoxes.message.y1 / imageHeight * 100}%` as React.CSSProperties['top'],
    left: `${contactFormBoxes.message.x1 / imageWidth * 100}%` as React.CSSProperties['left'],
    width: `${contactFormBoxes.message.x2 - contactFormBoxes.message.x1}px` as React.CSSProperties['width'],
    height: `${contactFormBoxes.message.y2 - contactFormBoxes.message.y1}px` as React.CSSProperties['height'],
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    border: '2px solid #000' as React.CSSProperties['border'],
    zIndex: 15 as React.CSSProperties['zIndex'],
    fontFamily: 'WhiteboardFont' as React.CSSProperties['fontFamily'],
    fontSize: '14px' as React.CSSProperties['fontSize'],
    padding: '8px' as React.CSSProperties['padding'],
    display: showSuccessMessage ? 'block' : 'none',
  };

  // Send button style
  const sendButtonStyle: React.CSSProperties = {
    position: 'absolute' as React.CSSProperties['position'],
    top: `${sendButtonPosition.y / imageHeight * 100}%` as React.CSSProperties['top'],
    left: `${sendButtonPosition.x / imageWidth * 100}%` as React.CSSProperties['left'],
    width: `${sendButtonPosition.width}px` as React.CSSProperties['width'],
    height: `${sendButtonPosition.height}px` as React.CSSProperties['height'],
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '50%' as React.CSSProperties['borderRadius'],
    alignItems: 'center' as React.CSSProperties['alignItems'],
    justifyContent: 'center' as React.CSSProperties['justifyContent'],
    cursor: 'pointer' as React.CSSProperties['cursor'],
    zIndex: 16 as React.CSSProperties['zIndex'],
    border: '2px solid #000' as React.CSSProperties['border'],
    opacity: 0.8 as React.CSSProperties['opacity'],
    transition: 'opacity 0.2s ease' as React.CSSProperties['transition'],
    pointerEvents: isSending || !isFormValid ? 'none' : 'auto',
    display: showSuccessMessage ? 'none' : 'flex',
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
                      ...navBtnStyle,
                      left: '10px' as React.CSSProperties['left'],
                    }}
                  >
                    {'<'}
                  </button>
                  <button
                    onClick={() => handleOriginalSlideChange('right')}
                    style={{
                      ...navBtnStyle,
                      right: '10px' as React.CSSProperties['right'],
                    }}
                  >
                    {'>'}
                  </button>
                </div>
                {showOverlay && (
                  <div style={overlayStyle}>
                    <img
                      src="/images/Slideshow Overlay.png"
                      alt="Overlay"
                      style={overlayImageStyle}
                    />
                  </div>
                )}
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
            {/* Hoverable Items */}
            {hoverableItems.map((item, index) => (
              <button
                key={index}
                onMouseOver={() => handleHover(item.text)}
                onMouseLeave={handleHoverLeave}
                style={getHoverItemStyle(item)}
              >
                {item.text}
              </button>
            ))}
            {/* Hover Text Box */}
            {hoveredItem && (
              <div style={hoverTextBoxStyle}>
                <p>{hoveredItem}</p>
              </div>
            )}
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
            {/* Contact Form */}
            <div style={getSkewedBoxStyle(contactFormBoxes.name)}>
              <input
                type="text"
                value={contactForm.name}
                onChange={handleInputChange('name')}
                placeholder="Name"
                style={inputStyle}
              />
            </div>
            <div style={getSkewedBoxStyle(contactFormBoxes.email)}>
              <input
                type="email"
                value={contactForm.email}
                onChange={handleInputChange('email')}
                placeholder="Email"
                style={inputStyle}
              />
            </div>
            <div style={getSkewedBoxStyle(contactFormBoxes.message)}>
              <textarea
                value={contactForm.message}
                onChange={handleInputChange('message')}
                placeholder="Message"
                style={inputStyle}
              />
            </div>
            <button
              onClick={handleSubmit}
              style={sendButtonStyle}
            >
              Send
            </button>
            {showSuccessMessage && (
              <div style={successMessageStyle}>
                <p>Thank you for your message!</p>
              </div>
            )}
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
};

export default App;
