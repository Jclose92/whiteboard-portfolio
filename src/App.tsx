import React, { useRef, useEffect, useState } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import exampleImage from './Portfolio Website Main Image 4 copy.jpg';

const App: React.FC = () => {
  const transformRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const applyTransform = () => {
      if (transformRef.current) {
        const containerWidth = window.innerWidth;
        const containerHeight = window.innerHeight;
        const initialX = (containerWidth / 2) - 4070;
        const initialY = (containerHeight / 2) - 2990;
        console.log(`Initial transform: (${initialX}, ${initialY})`);
        if (isNaN(initialX) || isNaN(initialY)) {
          console.error('NaN detected in initial transform values');
        }
        transformRef.current.setTransform(initialX, initialY, 5);
        setTimeout(() => setLoading(false), 50);
      }
    };

    const timeoutId = setTimeout(applyTransform, 150);
    return () => clearTimeout(timeoutId);
  }, []);

  const moveToArea = (x: number, y: number) => {
    console.log(`Button clicked to move to: (${x}, ${y})`);
    if (isNaN(x) || isNaN(y)) {
      console.error('Invalid coordinates:', x, y);
      return;
    }

    if (transformRef.current) {
      const containerWidth = window.innerWidth;
      const containerHeight = window.innerHeight;
      console.log(`Container dimensions: width=${containerWidth}, height=${containerHeight}`);
      const targetX = (containerWidth / 2) - x;
      const targetY = (containerHeight / 2) - y;
      console.log(`Calculated target coordinates: (${targetX}, ${targetY})`);
      if (isNaN(targetX) || isNaN(targetY)) {
        console.error('NaN value detected in target coordinates');
        return;
      }
      transformRef.current.setTransform(targetX, targetY, 5, {
        animationTime: 1600,
        easingFunction: 'easeInOutQuad',
      });
    } else {
      console.error('transformRef is not set');
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      {loading && <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'white', zIndex: 10 }} />}
      <TransformWrapper
        initialScale={5}
        minScale={5}
        maxScale={5}
        wheel={{ disabled: true }}
        doubleClick={{ disabled: true }}
        pinch={{ disabled: true }}
        panning={{ velocityDisabled: true }}
        ref={transformRef}
      >
        <TransformComponent>
          <img
            src={exampleImage}
            alt="Portfolio Website Main"
            style={{ width: '100%', height: 'auto', cursor: 'grab' }}
          />
          {/* Buttons for navigation */}
          <button onClick={() => moveToArea(934, 1200)} style={{ position: 'absolute', top: '46.313%', left: '47.099%', width: '23.47px', height: '11.25px', backgroundColor: 'red', zIndex: 20, transform: 'rotate(16deg)' }}>1</button>
          <button onClick={() => moveToArea(930, 5320)} style={{ position: 'absolute', top: '48.336%', left: '47.036%', width: '23.47px', height: '11.25px', backgroundColor: 'blue', zIndex: 20, transform: 'rotate(-17deg)' }}>2</button>
          <button onClick={() => moveToArea(6850, 5075)} style={{ position: 'absolute', top: '47.616%', left: '49.006%', width: '23.47px', height: '11.25px', backgroundColor: 'green', zIndex: 20, transform: 'rotate(16deg)' }}>3</button>
          <button onClick={() => moveToArea(7014, 1400)} style={{ position: 'absolute', top: '44.996%', left: '48.926%', width: '23.47px', height: '11.25px', backgroundColor: 'yellow', zIndex: 20, transform: 'rotate(-18deg)' }}>4</button>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
};

export default App;
