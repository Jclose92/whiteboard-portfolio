import React, { useState, useEffect, useRef } from 'react';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import GoogleDriveSlideshow from './components/GoogleDriveSlideshow';
import ComedySlideshow from './components/ComedySlideshow';
import './index.css';
import { detectDeviceType, getInitialZoomLevel, getDeviceCenterPosition } from './utils/deviceDetection';

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

  // Get initial zoom level based on device type
  const initialScale = getInitialZoomLevel();
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
    x: 6900 - 12 - 10 + 8, // Move left by 12px and then 10px more, then 8px right
    y: 924 - 12 - 14 - 8 - 6 - 25 - 15, // Move up by 12px and then 14px more, then 8px more, then 6px more, then 25px more, then 15px more
    width: 250 - 15 - 5 - 8 + 20 + 8 + 8 + 20 + 20 + 15 + 5, // Make 28px narrower total (15px + 5px + 8px) and add 20px as requested, plus 8px more, plus 8px more, plus 20px more, plus 20px more, plus 15px more, plus 5px more
    height: 200 + 20 + 30 + 25, // Increase height by 20px and then 30px more, then 25px more
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
    Spiders: "Spiders\n\n2023\nWhere is Mr Tayto?\nGold in Social Media",
    ICAD: "ICADs\n\n2023\nWhere is Mr Tayto?\nBronze in Integrated",
    Sharks: "Kinsale Sharks\n\n2024\nAer Lingus \"Calm\"\nBronze in Digital\n\n2022\nWhere is Mr Tayto?\nSilver in PR & Tactical\nBronze in Food & Confectionery/ Social Media/ Integrated Campaign/ Social Media for influencer content",
    APMCs: "APMCs\n\n2024\nLyons \"We're Square\"\nSilver in Non-Alc Beverage\nBronze in Integrated Campaign / Use of Talent\n\n2023\nWhere is Mr Tayto?\nGold in Use of Digital / FMCG\nSilver in Integrated Campaign",
    DMAs: "Digital Media Awards\n\n2022\nWhere is Mr Tayto?\nGold in Strategy",
    IAAs: "Irish Audio Awards\n\n2025\nLyons Gen Tea\nWin in Casting\nShortlists in Innovation / Consumer\n\n2024\nHeadstuff \"If this sounds like you…\"\nShortlist in Copywriting Craft",
    Impact: "European Impact Awards\n\n2024\nLyons \"We're Square\"\nBronze in Integrated\n\n2023\nWhere is Mr Tayto?\nGold in Integrated"
  };

  // Add eraser animation state
  const [eraserPosition, setEraserPosition] = useState({
    top: `${850 / 5992 * 100}%`,
    left: `${5500 / 8472 * 100}%`,
    width: '667px',
    height: '230px',
  });

  // Brand text content
  const [currentSlide, setCurrentSlide] = useState(0);
  const brandContent: Record<string, { description: string; slides: { url: string; type: 'video' | 'image' }[] }> = {
    Lyons: {
      description: currentSlide >= 10 && currentSlide <= 17 
        ? 'Gen Tea\nWhat?\nReaffirm Lyons\' \"Puts the Talk into Tea\" position in a campaign that needed to be radio first.\nHow?\nCharming cut downs of real chats between actual Lyons tea drinkers from different generations, showing tea brings us together no matter our age.'
        : 'We\'re Square\nWhat?\nTransition them from their beloved pyramid bags to their new square ones.\nHow?\nA full PR and advertising campaign celebrating just how spiritually square both tea and the people who drink it are, and how great it is when we own that.',
      slides: [
        { url: 'https://drive.google.com/file/d/1NQrYVED2G54hhl4cKv_zPrfWuMuwVtH4/preview', type: 'video' },
        { url: 'https://lh3.googleusercontent.com/d/1CpzUwRmRax9c8PSlZEw-mR4FX0dubYe-', type: 'image' },
        { url: 'https://lh3.googleusercontent.com/d/1Nd2qIlW45gLmUfKOdfAex8BWYyNP6ec-', type: 'image' },
        { url: 'https://lh3.googleusercontent.com/d/1ryHRz4AXdNsmcEO7AzP4_c0wGuZX5RAj', type: 'image' },
        { url: 'https://lh3.googleusercontent.com/d/1lClZrPKMdeKOcG4-veYuj8a-RtQ9wWzp', type: 'image' },
        { url: 'https://lh3.googleusercontent.com/d/1IUHwGiyWL54CDFWzz5MTy9wbHd9iv1rd', type: 'image' },
        { url: 'https://lh3.googleusercontent.com/d/1hTAGaHk50rrtIrVStjptZmnNv_lDbXhk', type: 'image' },
        { url: 'https://lh3.googleusercontent.com/d/1JPKghp0qQSWakjdZtZ0F70mr5OzdCeAK', type: 'image' },
        { url: 'https://lh3.googleusercontent.com/d/1ozA3J-7YBS8BmApUxT5hqBAQvHCgw0XN', type: 'image' },
        { url: 'https://drive.google.com/file/d/1TmiHdwrUVQstabfuQ1A6FDOkpGrUiySl/preview', type: 'video' },
        { url: 'https://drive.google.com/file/d/1j687Vgae0nsUlW3TnAugtW7ND4713Y4e/preview', type: 'video' },
        { url: 'https://drive.google.com/file/d/1NatbnSB6u2h8zrZ5Z7HjEtoZd-rmntKq/preview', type: 'video' },
        { url: 'https://drive.google.com/file/d/1Fy3qsbCOL9AG67p5mKD9Cy8zUuz3bukU/preview', type: 'video' },
        { url: 'https://drive.google.com/file/d/1Tk5Hb_X9zwr4-f_ndSACik2cQj58qgZq/preview', type: 'video' },
        { url: 'https://drive.google.com/file/d/11__8QbUNirZW7dGc_eW61a2A-tTyX2-k/preview', type: 'video' },
        { url: 'https://drive.google.com/file/d/1Df6zl2wRhgLlxUXKQDNcexHMyL-RHvM4/preview', type: 'video' },
        { url: 'https://drive.google.com/file/d/12c1Eh-xowoibPFIRTDfpvIPxEpwDHFU5/preview', type: 'video' },
        { url: 'https://lh3.googleusercontent.com/d/1CD3KmCVd8mNH5dfNiVWXpiLoZcvDbBfm', type: 'image' }
      ]
    },
    Tayto: {
      description: 'Where Is Mr Tayto\nWhat?\nWe made Mr. Tayto relevant to the Gen-Z audience.\nHow?\nA 2 week PR stunt touting Mr Tayto\'s disappearance from packaging before unveiling a 50 video, TikTok campaign of him travelling the globe in-person, doubling Tayto\'s online following.',
      slides: [
        { url: 'https://drive.google.com/file/d/1QKtDkmBtEpkBdfXOiajz9i7atViXJy8K/preview', type: 'video' },
        { url: 'https://drive.google.com/file/d/19uvguWDXZa_vyjI4SdPgC9wB-frpgwJs/preview', type: 'video' },
        { url: 'https://drive.google.com/file/d/1SkK0GWSf2ilXQJOWnh-Gt7-G1XORLsTJ/preview', type: 'video' },
        { url: 'https://drive.google.com/file/d/1lCBUzBlKKHmZ1Rj5yhCvfdcfLdBlwmJQ/preview', type: 'video' },
        { url: 'https://drive.google.com/file/d/1clYdMoRyXKsvj1SmlNZn0iMGJGF8XnD0/preview', type: 'video' },
        { url: 'https://drive.google.com/file/d/1eFi9_1z9d7xU7QiWppQ0Z1BGdV8w_PNI/preview', type: 'video' },
        { url: 'https://drive.google.com/file/d/1LN-KrS3rSjXAWDDAGyYqr0cEstnGKKS8/preview', type: 'video' },
        { url: 'https://lh3.googleusercontent.com/d/1zebyXCigSxhSe3Pt4Bitqa3nMa61Yklj', type: 'image' }
      ]
    },
    Kerry: {
      description: 'Pride of Kerry\nWhat?\nWe celebrated their 30 year sponsorship of the Kerry GAA team.\nHow?\nA docu-film showing where both Kerry, the team, and everyone in The Kingdom\'s overwhelming pride comes from, perfectly timing its release for the All Ireland.',
      slides: [
        { url: 'https://drive.google.com/file/d/1NE3dQCKTOFJYPHpygrctYd27uyvCoYI-/preview', type: 'video' },
        { url: 'https://drive.google.com/file/d/1ZuxMQ7a2tBTTYQT-xJEcogXHBH9Bmeot/preview', type: 'video' },
        { url: 'https://drive.google.com/file/d/1e5BSWf5i0gQgKMkLGngBZuXGPDhSGkgX/preview', type: 'video' },
        { url: 'https://drive.google.com/file/d/1VwmvseffaV5PXmQ_kRlHULvndk8zaogB/preview', type: 'video' }
      ]
    },
    Certa: {
      description: 'Breaking Boundaries\nWhat?\nLaunch their sponsorship of the Irish women\'s cricket team.\nHow?\nThree digital videos of outdated cricket relics being smashed apart in mesmerising slow motion, along with any old notions of the sport or this exceptional team.',
      slides: [
        { url: 'https://drive.google.com/file/d/15sOBTvKH2tJhCtTX5DeDK9FtmgrDGvq8/preview', type: 'video' },
        { url: 'https://drive.google.com/file/d/1qdGHIrpxSBt6uaToELrr_IBtAwDQn7Wm/preview', type: 'video' },
        { url: 'https://drive.google.com/file/d/1h0qHaHhrToued1LACuCCkGJyB0FZzWPH/preview', type: 'video' }
      ]
    },
    Headstuff: {
      description: 'Join the Cast\nWhat?\nWe brought them fresh listeners and ideas for podcasts.\nHow?\nA competition, which we bolstered with 2 audio ads, requiring a short voice note pitch for a podcast, where finalists record a pilot for a clash to win their own series.',
      slides: [
        { url: 'https://drive.google.com/file/d/1kA0teOILfxwbxkwk3iwZVwIx19ymVPKO/preview', type: 'video' },
        { url: 'https://drive.google.com/file/d/1LNjQUX_HL1AWM6pYyBTy5knO-Iq-wcAc/preview', type: 'video' }
      ]
    },
    'Aer Lingus': {
      description: currentSlide === 1 
        ? 'Calm\nWhat?\nDemonstrate how welcoming and soothing it is aboard their flights.\nHow?\nA series of 8 hour long ambience videos for their YouTube, immersing audiences into Aer Lingus window seats and aeroplane soundscapes, perfect to work or relax to.'
        : 'Sadie\'s Home\nWhat?\nFilm their Christmas within an incredibly quick turnaround time.\nHow?\nEfficiently delivering a heart melting twist on a classic airport reunion and showing Aer Lingus\' passion for bringing us together at Christmas time.',
      slides: [
        { url: 'https://drive.google.com/file/d/1JelRhbwXGZxNb84EED35Ers7JXSRB1R_/preview', type: 'video' },
        { url: 'https://drive.google.com/file/d/1kS-hfb3RmxUtkFw2VcTpjLWQ5KvJyIfq/preview', type: 'video' }
      ]
    }
  };

  // Move to a specific point and center it on screen
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

  // Center after image loads and transform wrapper is ready
  useEffect(() => {
    if (imageLoaded && transformRef.current && !initialized) {
      const timeout = setTimeout(() => {
        const { x, y } = getDeviceCenterPosition();
        moveTo(x, y);
        setInitialized(true);
      }, 400);

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

  // Text box style
  const textBoxStyle: React.CSSProperties = {
    position: 'absolute' as React.CSSProperties['position'],
    top: `${textBoxPosition.y / imageHeight * 100}%` as React.CSSProperties['top'],
    left: `${textBoxPosition.x / imageWidth * 100}%` as React.CSSProperties['left'],
    width: `${textBoxPosition.width}px` as React.CSSProperties['width'],
    height: `${textBoxPosition.height}px` as React.CSSProperties['height'],
    backgroundColor: 'transparent',
    padding: '8px' as React.CSSProperties['padding'],
    borderRadius: '8px' as React.CSSProperties['borderRadius'],
    zIndex: 10 as React.CSSProperties['zIndex'],
    display: 'flex' as React.CSSProperties['display'],
    alignItems: 'flex-start' as React.CSSProperties['alignItems'],
    justifyContent: 'flex-start' as React.CSSProperties['justifyContent'],
  };

  // Initial text style
  const initialTextStyle: React.CSSProperties = {
    fontSize: '25px',
    lineHeight: '1.5'
  };

  // Brand text style
  const brandTextStyle: React.CSSProperties = {
    fontSize: '19.5px',
    lineHeight: '1.3',
    whiteSpace: 'pre-wrap'
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
        src="/images/Slideshow Overlay.jpg"
        alt="Overlay"
        style={overlayImageStyle}
      />
    </div>
  );

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
    transition: 'opacity 0.2s ease, transform 0.2s ease',
    opacity: 0.8,
    transform: `translate(-50%, -50%) rotate(${rotate})`,
    cursor: 'pointer'
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
    zIndex: 10,
    transform: 'translate(-50%, -50%)',
    transformOrigin: 'center',
  });

  // Hover text box style
  const hoverTextBoxStyle: React.CSSProperties = {
    position: 'absolute',
    top: `${(582 + 5) / imageHeight * 100}%`,
    left: `${(1086 - 6) / imageWidth * 100}%`,
    width: '180px',
    height: '250px',
    backgroundColor: 'transparent',
    border: 'none',
    padding: '8px',
    borderRadius: '4px',
    zIndex: 13,
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    fontFamily: 'WhiteboardFont',
    fontSize: '18px',
    overflow: 'auto',
    whiteSpace: 'pre-wrap'
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
    fontSize: '32px',  
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
    cursor: 'pointer',
    border: 'none',
    outline: 'none',
    transition: 'background-color 0.3s ease',
    zIndex: 15,
    pointerEvents: 'auto',
    transform: 'translate(-50%, -50%)',
    fontFamily: 'WhiteboardFont',
    display: 'flex',
    padding: 0,
  };

  // Send button image style
  const sendButtonImageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    display: 'block',
  };

  // Define text box type
  interface TextBox {
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    text?: string;
  }

  // Text box positions
  const textBoxes: TextBox[] = [
    { 
      name: 'About', 
      x: 1052, 
      y: 1057, 
      width: 265, 
      height: 174, 
      rotation: 0,
      text: "Hi there, I'm John Close.\n\nI've been a copywriter at Verve|Showrunner since 2022.\n\nPet my dog, and I'll tell you more about me."
    },
    { 
      name: 'Telescope', 
      x: 1468, 
      y: 1155, 
      width: 80, 
      height: 33, 
      rotation: 40,
      text: "Award Scope"
    },
    { 
      name: 'Turn Back', 
      x: 2190, 
      y: 4573, 
      width: 120, 
      height: 45, 
      rotation: -17,
      text: "Danger!\nTurn Back!"
    },
    { 
      name: 'Comedy Section', 
      x: 1240, 
      y: 5407, 
      width: 155, 
      height: 80, 
      rotation: 0,
      text: "Click the projector to check out my comedy."
    },
    { 
      name: 'Work Sign', 
      x: 7252, 
      y: 1372, 
      width: 156, 
      height: 82, 
      rotation: 0,
      text: "Chuck a Stone in and watch work ripple to the surface."
    },
    { 
      name: 'Zoom Wizard', 
      x: 4531, 
      y: 5127, 
      width: 95, 
      height: 80, 
      rotation: 0,
      text: "Wish you could zoom out?\n\nTake this!"
    }
  ];

  // About text pieces
  const aboutTexts = [
    "Hi there, I'm John Close.\n\nI've been a copywriter at Verve|Showrunner since 2022.\n\nPet my dog, and I'll tell you more about me.",
    "Good work! Now...",
    "I'm a copywriter for money. And for love.\n\nBut mostly for money.",
    "I like my work to be enjoyable and honest.\n\nLike that bit about the money.",
    "I also like to create ads that are smart and simple.\n\nThat way, people actually enjoy them and they stay great quality.",
    "It's the only way I can feel good about my ideas when friends and family ask about them.",
    "Particularly my niece...\n\nShe's too young to know polite from cutthroat.\n\nMy doodle may be smiling, but the writer behind it is wincing at the thought.",
    "Now, many great advertisers aim for honest, smart, simple work.\n\nBut these are the things that really set me apart:",
    "My 'yes and' attitude to ideas.\n\nBrave the 'Danger' section, and you'll see I'm a dedicated improviser.",
    "My delightful golden retriever energy.\n\nMessage me for a coffee and you'll get the picture.\n\nAnd hopefully want to work with me.",
    "Finally, I'll go the distance to bring an idea to life.\n\nWhether it's learning new skills or working on the weekend.",
    "Just take this whiteboard website. I'm not a coder or a designer.\n\nThis is all DIY, baby!",
    "Anyway, I'm proud to say this has led me to a fair few awards.\n\nHover over them in the sky above for more details on what I've won.",
    "And if you want to see the work they're for, head over to my work section.",
    "Oh, you want me to say all this again?\n\nWell... if you insist."
  ];

  // State for current text index
  const [currentAboutIndex, setCurrentAboutIndex] = useState(0);

  // Handle button click
  const handleDogClick = () => {
    setCurrentAboutIndex((prevIndex) => (prevIndex + 1) % aboutTexts.length);
  };

  // Text box style
  const textBoxStyle2: React.CSSProperties = {
    position: 'absolute',
    backgroundColor: 'transparent', 
    border: 'none',
    boxShadow: 'none',
    fontFamily: 'WhiteboardFont',
    color: '#000000',
    pointerEvents: 'none',
    zIndex: 10,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    padding: '2px 4px',
    cursor: 'default',
    whiteSpace: 'pre-line'
  };

  // Button style
  const buttonStyle: React.CSSProperties = {
    position: 'absolute',
    width: '225px',
    height: '130px',
    backgroundColor: 'transparent',
    borderRadius: '25px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    top: '1410px',
    left: '1327px',
    transform: 'translate(-50%, -50%)',
    zIndex: 10,
    transition: 'background-color 0.3s ease',
  };

  // Button hover style
  const buttonHoverStyle: React.CSSProperties = {
    backgroundColor: '#FFA500',
  };

  // Comedy slideshow configuration
  const comedySlideshow = {
    slides: [
      { url: 'https://lh3.googleusercontent.com/d/18IukjC7Bfj0fEovg9T-tkZnDwGlnlONH', type: 'image' },
      { url: 'https://drive.google.com/file/d/1uXkXPzRdHxyh3w6jG30wHA1Ui5xzDNnu/preview', type: 'video' },
      { url: 'https://lh3.googleusercontent.com/d/1nXenwLfnnvjmA3R4PUyhwJSB2r5t23AM', type: 'image' },
      { url: 'https://lh3.googleusercontent.com/d/1lDPGyQymQ4ASZ9O7c37Vewzy8grrzXil', type: 'image' },
      { url: 'https://lh3.googleusercontent.com/d/1coWXwzX0e0kcCO4aseFXaSVZnMB7yCoi', type: 'image' },
      { url: 'https://lh3.googleusercontent.com/d/1BWL2gTrk29mYswZqgrrIhCDQ3EV1cxJ1', type: 'image' },
      { url: 'https://lh3.googleusercontent.com/d/1yJcB1RMX1g6BFIXHVuAC9KXB7RV4HWBI', type: 'image' },
      { url: 'https://lh3.googleusercontent.com/d/1I70Z61a_3w7sY5rdcOpDWh8gSYV8Wfum', type: 'image' },
      { url: 'https://lh3.googleusercontent.com/d/11b6Osj9KAHEchHe3ElMu1EGgFOb5rMRr', type: 'image' },
      { url: 'https://lh3.googleusercontent.com/d/1LE8zRTJd81AUDZ3BGoU2hn-VJSIQhbjK', type: 'image' },
      { url: 'https://lh3.googleusercontent.com/d/13D4OPBrmEtT-9ZojVhJE2ibNPxrSCEKY', type: 'image' },
      { url: 'https://lh3.googleusercontent.com/d/1ZrST0o-HkQCjeXmyotViK0bskSdfGdFB', type: 'image' },
      { url: 'https://lh3.googleusercontent.com/d/1OWZ1a8XEp0Y1-6kAXWvJ-q39SHvX48zv', type: 'image' },
      { url: 'https://lh3.googleusercontent.com/d/1Jm5iAgRKV6Q8NPnlAORnxu8hb7xeInkn', type: 'image' },
      { url: 'https://lh3.googleusercontent.com/d/1tU6griG5MkEjJP1g02-qpeLJCclN0imy', type: 'image' }
    ] as { url: string; type: 'video' | 'image' }[],
    x: 888,
    y: 5084, // 5124 - 40
    width: 400,
    height: 240  // 200 + 40
  };

  // Comedy button position
  const comedyButtonPosition = {
    x: 1046,
    y: 5454,
    width: 130,
    height: 100
  };

  // Add zoom handling
  const [zoomLevel, setZoomLevel] = useState(initialScale);
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    // Get the container dimensions
    const container = document.querySelector('#root');
    if (container) {
      setContainerWidth(container.clientWidth);
      setContainerHeight(container.clientHeight);
    }

    // Calculate optimal zoom level based on container size
    const calculateOptimalZoom = () => {
      const containerAspect = containerWidth / containerHeight;
      const imageAspect = imageWidth / imageHeight;
      
      // Calculate the zoom level that maintains the aspect ratio
      let zoom = 1.0;
      if (containerAspect > imageAspect) {
        // Container is wider than the image
        zoom = containerHeight / imageHeight;
      } else {
        // Container is taller than the image
        zoom = containerWidth / imageWidth;
      }
      
      // Apply a minimum zoom level to ensure the image is visible
      const minZoom = 0.5;
      const maxZoom = 1.5;
      const optimalZoom = Math.max(minZoom, Math.min(maxZoom, zoom));
      
      setZoomLevel(optimalZoom);
    };

    // Calculate initial zoom
    calculateOptimalZoom();

    // Recalculate zoom on window resize
    const handleResize = () => {
      if (container) {
        setContainerWidth(container.clientWidth);
        setContainerHeight(container.clientHeight);
        calculateOptimalZoom();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [containerWidth, containerHeight]);

  // Update TransformWrapper configuration
  const transformWrapperStyle: React.CSSProperties = {
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden'
      }}
    >
      <TransformWrapper
        ref={transformRef}
        initialScale={initialScale}
        minScale={0.5}
        maxScale={3}
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
            width: '100%',
            height: '100%',
          }}
          contentStyle={{
            width: `${imageWidth}px`,
            height: `${imageHeight}px`,
            position: 'relative',
            backgroundColor: '#fff',
          }}
        >
          <div
            style={{
              width: imageWidth,
              height: imageHeight,
              position: 'relative',
            }}
          >
            {/* Text Box */}
            <div style={textBoxStyle}>
              {!selectedBrand ? (
                <div style={initialTextStyle}>
                  <h2>Pick a piece of work.</h2>
                  <p>I'll tell you what the hook is.</p>
                </div>
              ) : (
                <div style={brandTextStyle}>
                  <p style={{ fontSize: '19.5px' }}>{brandContent[selectedBrand]?.description}</p>
                </div>
              )}
            </div>

            {/* Slideshow */}
            {showSlideshow && selectedBrand && (
              <div style={{
                position: 'absolute',
                top: `${slideshowPosition.y / imageHeight * 100}%`,
                left: `${slideshowPosition.x / imageWidth * 100}%`,
                width: `${slideshowPosition.width}px`,
                height: `${slideshowPosition.height}px`,
                zIndex: 10,
              }}>
                <GoogleDriveSlideshow
                  slides={brandContent[selectedBrand].slides}
                  autoPlay={true}
                  autoPlayInterval={5000}
                  showControls={true}
                  showNavigation={true}
                  showTitle={false}
                  showDescription={false}
                  width="100%"
                  height="100%"
                  className="slideshow-container"
                  onSlideChange={(slideIndex) => setCurrentSlide(slideIndex)}
                />
              </div>
            )}
            {showOverlay && renderOverlay()}
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

            {/* New Text Boxes */}
            <div
              style={{
                position: 'absolute',
                top: `${2974 / 5992 * 100}%`,
                left: `${3491 / 8472 * 100}%`,
                width: '275px', // Increased width by 15px
                height: '110px',
                pointerEvents: 'none',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                fontFamily: 'WhiteboardFont',
                color: '#000000',
                fontSize: '23px',
                lineHeight: '1.4',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontWeight: 'bold'
              }}
            >
              Advertising, Copywriting, Creative, Strategy, Direction, Writing, Ideation.
            </div>

            <div
              style={{
                position: 'absolute',
                top: `${3042 / 5992 * 100}%`,
                left: `${4007 / 8472 * 100}%`,
                width: '150px',
                height: '80px',
                pointerEvents: 'none',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                fontFamily: 'WhiteboardFont',
                color: '#000000',
                fontSize: '27px', // Increased font size
                lineHeight: '1.5',
                fontWeight: 'bold' // Added bold styling
              }}
            >
              John Close<br/>
              Copywriter
            </div>

            {/* Social Media Links */}
            <a
              href="https://www.instagram.com/johncloseinbriefs/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                position: 'absolute',
                top: `${(5244 - (120 / 2)) / 5992 * 100}%`,
                left: `${(6894 - (120 / 2)) / 8472 * 100}%`,
                width: '120px',
                height: '120px',
                pointerEvents: 'auto',
                zIndex: 10,
                cursor: 'pointer'
              }}
            />

            <a
              href="https://www.linkedin.com/in/john-close/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                position: 'absolute',
                top: `${(5246 - (130 / 2)) / 5992 * 100}%`,
                left: `${(7024 - (110 / 2)) / 8472 * 100}%`,
                width: '110px',
                height: '130px',
                pointerEvents: 'auto',
                zIndex: 10,
                cursor: 'pointer'
              }}
            />

            {/* Navigation Buttons */}
            <button
              style={btnStyle('46.783%', '47.299%', 'red', '16deg')}
              onClick={() => moveTo(1252, 1257)}
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
              onClick={() => moveTo(7272, 1231)}
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
            {brandButtons.map((brand) => (
              <button
                key={brand.text}
                onClick={() => handleBrandClick(brand.text)}
                style={{
                  position: 'absolute',
                  top: `${brand.y / imageHeight * 100}%`,
                  left: `${brand.x / imageWidth * 100}%`,
                  width: `${brand.width}px`,
                  height: `${brand.height}px`,
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
                  transition: 'opacity 0.2s ease, transform 0.2s ease',
                  opacity: 0.8,
                  transform: `translate(-50%, -50%) rotate(0deg)`,
                  cursor: 'pointer'
                }}
              />
            ))}
            {/* Hoverable Items */}
            {hoverableItems.map((item) => (
              <button
                key={item.text}
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
                  width: `${box.width}px`,
                  height: `${box.height}px`,
                  top: `${box.y / imageHeight * 100}%`,
                  left: `${box.x / imageWidth * 100}%`,
                  transform: `rotate(${box.rotation}deg)`,
                  fontSize: box.name === 'Telescope' || box.name === 'Work Sign' || box.name === 'Zoom Wizard' 
                    ? '20px' 
                    : box.name === 'Turn Back' 
                      ? '24px' 
                      : '24px'
                }}
              >
                {box.name === 'About' ? aboutTexts[currentAboutIndex] : <span style={{ fontSize: '20px' }}>{box.text}</span>}
              </div>
            ))}
            {/* Speech Bubble */}
            {!isSubmitted && (
              <div style={speechBubbleContainerStyle}>
                <img 
                  src="/images/speechbubble.png" 
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
                  src={process.env.NODE_ENV === 'production' ? '/RavenOverlay.png' : 'ravenoverlay.png'}
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
            {/* Button */}
            <button
              style={{
                ...buttonStyle,
              }}
              onClick={handleDogClick}
            >
              Pet Dog
            </button>
            {/* Comedy Slideshow */}
            <ComedySlideshow
              slides={comedySlideshow.slides}
              x={comedySlideshow.x}
              y={comedySlideshow.y}
              width={comedySlideshow.width}
              height={comedySlideshow.height}
            />
            {/* Comedy Button */}
            <button
              style={{
                position: 'absolute',
                top: `${comedyButtonPosition.y / 5992 * 100}%`,
                left: `${comedyButtonPosition.x / 8472 * 100}%`,
                width: `${comedyButtonPosition.width}px`,
                height: `${comedyButtonPosition.height}px`,
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                pointerEvents: 'auto',
                zIndex: 10
              }}
              onClick={() => {
                // This will be handled by the ComedySlideshow component
              }}
            >
              {/* Button content will be added later */}
            </button>
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
};

export default App;
