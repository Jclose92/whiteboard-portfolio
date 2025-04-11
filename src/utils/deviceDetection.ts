export type DeviceType = 'desktop' | 'tablet' | 'mobile';
export type Orientation = 'portrait' | 'landscape';

export const detectDeviceType = () => {
  const userAgent = navigator.userAgent;
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const isPortrait = screenWidth < screenHeight;

  // Check for mobile devices
  if (/(Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini)/i.test(userAgent)) {
    return {
      type: 'mobile',
      orientation: isPortrait ? 'portrait' : 'landscape'
    };
  }

  // Check for tablets based on screen size
  if (screenWidth >= 600 && screenWidth <= 1200) {
    return {
      type: 'tablet',
      orientation: isPortrait ? 'portrait' : 'landscape'
    };
  }

  // Default to desktop
  return {
    type: 'desktop',
    orientation: 'landscape'
  };
};

export const getInitialZoomLevel = () => {
  const { type } = detectDeviceType();
  
  const zoomLevels = {
    desktop: 1.0,
    tablet: 0.8,
    mobile: 0.42
  };

  return zoomLevels[type];
};

export const getDeviceCenterPosition = () => {
  const { type, orientation } = detectDeviceType();

  const positions = {
    desktop: { x: 4070, y: 2990 },
    tablet: {
      portrait: { x: 4150, y: 3050 },
      landscape: { x: 4100, y: 3000 }
    },
    mobile: {
      portrait: { x: 4200, y: 3100 },
      landscape: { x: 4150, y: 3050 }
    }
  };

  return type === 'desktop' 
    ? positions.desktop 
    : positions[type][orientation];
};
