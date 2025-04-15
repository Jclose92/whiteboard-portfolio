import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import GoogleDriveSlideshow from './components/GoogleDriveSlideshow';
import ComedySlideshow from './components/ComedySlideshow';
import RedOverlayButton from './components/RedOverlayButton';
import RedOverlay from './pages/RedOverlay';
import './index.css';
import { detectDeviceType, getInitialZoomLevel, getDeviceCenterPosition } from './utils/deviceDetection';

const App: React.FC = () => {
  // ... existing code remains unchanged ...

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <>
            {/* Existing content */}
            <TransformWrapper
              ref={transformRef}
              initialScale={initialScale}
              minScale={0.3}
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
              <TransformComponent>
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  <img
                    src={imageSrc}
                    alt="Whiteboard"
                    onLoad={() => setImageLoaded(true)}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />
                  
                  {/* Add the red button */}
                  <RedOverlayButton />
                </div>
              </TransformComponent>
            </TransformWrapper>
          </>
        } />
        <Route path="/red-overlay" element={<RedOverlay />} />
      </Routes>
    </Router>
  );
};

export default App;
