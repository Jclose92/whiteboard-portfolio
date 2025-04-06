import React, { useState, useRef } from 'react';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import '../index.css';

interface ZoomedViewProps {
  initialScale: number;
  imageWidth: number;
  imageHeight: number;
  brandContent: Record<string, { title: string; description: string }>;
  selectedBrand: string | null;
}

const ZoomedView: React.FC<ZoomedViewProps> = ({
  initialScale,
  imageWidth,
  imageHeight,
  brandContent,
  selectedBrand
}) => {
  const transformRef = useRef<ReactZoomPanPinchRef | null>(null);

  // Contact form container style
  const contactFormStyle: React.CSSProperties = {
    position: 'absolute' as React.CSSProperties['position'],
    top: `${4893 / imageHeight * 100}%` as React.CSSProperties['top'],
    left: `${7323 / imageWidth * 100}%` as React.CSSProperties['left'],
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
    transform: 'rotate(10deg)',
  };

  // Text box style
  const textBoxStyle: React.CSSProperties = {
    position: 'absolute' as React.CSSProperties['position'],
    top: '10px' as React.CSSProperties['top'],
    left: '10px' as React.CSSProperties['left'],
    width: '300px',
    height: '200px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    zIndex: 20,
    pointerEvents: 'none',
    fontFamily: 'WhiteboardFont',
  };

  return (
    <div className="App">
      <TransformWrapper
        initialScale={initialScale}
        minScale={0.85}
        maxScale={4}
        ref={transformRef}
        wheel={{ wheelDisabled: true }}
        panning={{
          disabled: false,
          velocityDisabled: true,
          allowLeftClickPan: true,
          excluded: ['input', 'textarea', 'button']
        }}
        doubleClick={{ disabled: true }}
        pinch={{ disabled: true }}
        centerOnInit={true}
      >
        <TransformComponent
          wrapperStyle={{
            width: '100%' as React.CSSProperties['width'],
            height: '100%' as React.CSSProperties['height'],
            overflow: 'hidden',
            touchAction: 'none',
            userSelect: 'none'
          }}
        >
          <img
            src="/whiteboard.jpg"
            alt="Whiteboard"
            style={{
              width: `${imageWidth}px` as React.CSSProperties['width'],
              height: `${imageHeight}px` as React.CSSProperties['height'],
              position: 'absolute' as React.CSSProperties['position'],
              top: '50%' as React.CSSProperties['top'],
              left: '50%' as React.CSSProperties['left'],
              transform: 'translate(-50%, -50%)' as React.CSSProperties['transform'],
            }}
          />

          {/* Text Box */}
          <div style={textBoxStyle}>
            {selectedBrand && (
              <div>
                <h2>{brandContent[selectedBrand]?.title}</h2>
                <p>{brandContent[selectedBrand]?.description}</p>
              </div>
            )}
          </div>

          {/* Return Button */}
          <button
            onClick={() => window.history.back()}
            style={{
              position: 'absolute' as React.CSSProperties['position'],
              top: '10px',
              right: '10px',
              zIndex: 20,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontFamily: 'WhiteboardFont',
            }}
          >
            Return
          </button>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
};

export default ZoomedView;
