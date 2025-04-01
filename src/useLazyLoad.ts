import { useEffect, useRef, useState } from 'react';

export const useLazyLoad = () => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    console.log('Initializing Intersection Observer');
    const observer = new IntersectionObserver(
      ([entry]) => {
        console.log('Intersection Observer Entry:', entry);
        if (entry.isIntersecting) {
          console.log('Image is intersecting, setting isVisible to true');
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      console.log('Observing element:', elementRef.current);
      observer.observe(elementRef.current);
    } else {
      console.log('Element ref is not set');
    }

    return () => observer.disconnect();
  }, []);

  return { isVisible, elementRef };
};
