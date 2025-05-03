import React, { useState, useEffect, useRef } from 'react';
// No router imports needed
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import GoogleDriveSlideshow from '../components/GoogleDriveSlideshow';
import ComedySlideshow from '../components/ComedySlideshow';
import '../index.css';
import { detectDeviceType, getInitialZoomLevel, getDeviceCenterPosition } from '../utils/deviceDetection';

const MainPage: React.FC = () => {
  // No navigation needed
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
  
  // Page detection – are we on /zoomfly?
  const isZoomFly = typeof window !== 'undefined' && window.location.pathname.includes('zoomfly');

  // Remove ZoomFly button entirely in this duplicate page
  // No ZoomFly button needed

  return (
    <div className="App">
      {/* Your component content here */}
      {/* ZoomFly button removed */}
    </div>
  );
};

export default MainPage;
