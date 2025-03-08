'use client';

/**
 * Utility function to detect if the current device is mobile
 * @returns boolean indicating if the device is mobile
 */
export function isMobileDevice(): boolean {
  // Only run on client side
  if (typeof window === 'undefined') {
    return false;
  }
  
  // Check for mobile user agent
  const userAgent = window.navigator.userAgent;
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  
  return mobileRegex.test(userAgent);
} 