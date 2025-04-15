export type DeviceType = 'desktop' | 'tablet' | 'mobile';
export type Orientation = 'portrait' | 'landscape';

export interface DeviceInfo {
  type: DeviceType;
  orientation: Orientation;
}

export const detectDeviceType = (): DeviceInfo => {
  const userAgent = navigator.userAgent;
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const isPortrait = screenWidth < screenHeight;

  // Check for mobile devices
  if (/(Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini)/i.test(userAgent)) {
    return {
      type: 'mobile' as DeviceType,
      orientation: isPortrait ? 'portrait' : 'landscape' as Orientation
    };
  }

  // Check for tablets based on screen size
  if (screenWidth >= 600 && screenWidth <= 1200) {
    return {
      type: 'tablet' as DeviceType,
      orientation: isPortrait ? 'portrait' : 'landscape' as Orientation
    };
  }

  // Default to desktop
  return {
    type: 'desktop' as DeviceType,
    orientation: 'landscape' as Orientation
  };
};

export const getInitialZoomLevel = () => {
  const { type } = detectDeviceType();
  
  const zoomLevels: Record<DeviceType, number> = {
    desktop: 1.0,
    tablet: 0.64,  // Reduced from 0.65 to 0.64
    mobile: 0.41
  };

  return zoomLevels[type];
};

export const getDeviceCenterPosition = () => {
  const { type, orientation } = detectDeviceType();
  
  const centerPositions: Record<DeviceType, Record<Orientation, { x: number; y: number }>> = {
    desktop: {
      landscape: { x: 3636, y: 1703 },
      portrait: { x: 1703, y: 3636 }
    },
    tablet: {
      landscape: { x: 3636, y: 1703 },
      portrait: { x: 1703, y: 3636 }
    },
    mobile: {
      landscape: { x: 3636, y: 1703 },
      portrait: { x: 1703, y: 3636 }
    }
  };

  return centerPositions[type][orientation];
};
