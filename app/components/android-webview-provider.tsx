'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { useAndroidWebView } from '@/app/lib/hooks/useAndroidWebView';
import { toast } from 'sonner';

// Define the context type
interface AndroidWebViewContextType {
  isAndroidWebView: boolean;
  sendToAndroid: (type: string, data: any) => boolean;
  lastMessage: any | null;
}

// Create the context with default values
const AndroidWebViewContext = createContext<AndroidWebViewContextType>({
  isAndroidWebView: false,
  sendToAndroid: () => false,
  lastMessage: null
});

// Hook to use the Android WebView context
export const useAndroidWebViewContext = () => useContext(AndroidWebViewContext);

interface AndroidWebViewProviderProps {
  children: ReactNode;
}

export function AndroidWebViewProvider({ children }: AndroidWebViewProviderProps) {
  const [lastMessage, setLastMessage] = useState<any | null>(null);

  // Handle messages from Android
  const handleMessage = (message: any) => {
    console.log('Received message from Android:', message);
    setLastMessage(message);
    
    // Handle specific message types
    switch (message.type) {
      case 'toast':
        toast(message.data.message, {
          style: message.data.style,
          duration: message.data.duration
        });
        break;
      
      // Add more message type handlers as needed
      
      default:
        // Custom event for other components to listen to specific message types
        const event = new CustomEvent(`android-message-${message.type}`, { 
          detail: message.data 
        });
        window.dispatchEvent(event);
        break;
    }
  };

  // Initialize the Android WebView hook
  const { isAndroidWebView, sendToAndroid } = useAndroidWebView(handleMessage);

  const contextValue = {
    isAndroidWebView,
    sendToAndroid,
    lastMessage
  };

  return (
    <AndroidWebViewContext.Provider value={contextValue}>
      {children}
    </AndroidWebViewContext.Provider>
  );
} 