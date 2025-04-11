export const detectDeviceType = () => {
  const userAgent = navigator.userAgent;
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  // Check for mobile devices
  if (/(Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini)/i.test(userAgent)) {
    return 'mobile';
  }

  // Check for tablets based on screen size
  // Tablets typically have a screen size between 600px and 1200px
  if (screenWidth >= 600 && screenWidth <= 1200) {
    return 'tablet';
  }

  // Default to desktop
  return 'desktop';
};

export const getInitialZoomLevel = () => {
  const deviceType = detectDeviceType();
  
  // These values can be adjusted based on testing
  const zoomLevels = {
    desktop: 1.0,
    tablet: 0.75,
    mobile: 0.4
  };

  return zoomLevels[deviceType];
};
