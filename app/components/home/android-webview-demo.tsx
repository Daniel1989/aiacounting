'use client';

import { useState, useEffect } from 'react';
import { useAndroidWebViewContext } from '@/app/components/android-webview-provider';
import { toast } from 'sonner';

export function AndroidWebViewDemo() {
  const { isAndroidWebView, sendToAndroid, lastMessage } = useAndroidWebViewContext();
  const [message, setMessage] = useState('');

  // Example of listening for a specific message type
  useEffect(() => {
    const handleCustomEvent = (event: CustomEvent) => {
      toast('Received custom event: ' + JSON.stringify(event.detail));
    };

    // Add listener for a specific message type
    window.addEventListener('android-message-custom' as any, handleCustomEvent as EventListener);

    return () => {
      window.removeEventListener('android-message-custom' as any, handleCustomEvent as EventListener);
    };
  }, []);

  const handleSendMessage = () => {
    if (message.trim()) {
      const success = sendToAndroid('message', { text: message });
      if (success) {
        toast.success('Message sent to Android');
        setMessage('');
      } else {
        toast.error('Failed to send message to Android');
      }
    }
  };

  console.log('isAndroidWebView', isAndroidWebView);

  if (!isAndroidWebView) {
    return null; // Don't show anything if not in Android WebView
  }

  return (
    <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
      <h3 className="text-md font-semibold text-blue-700 mb-2">
        Android WebView Connected
      </h3>
      
      <div className="flex items-center gap-2 mb-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message to Android"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSendMessage}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors text-sm"
        >
          Send
        </button>
      </div>
      
      {lastMessage && (
        <div className="mt-2 text-sm">
          <p className="font-medium">Last message from Android:</p>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
            {JSON.stringify(lastMessage, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 