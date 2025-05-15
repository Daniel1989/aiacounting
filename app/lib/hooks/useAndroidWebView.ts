'use client';

import { useState, useEffect, useCallback } from 'react';

interface AndroidMessage {
    type: string;
    data: any;
}

interface H5Port {
    postMessage(message: string | {[key: string]: any}): void;
};

/**
 * Hook to handle communication with Android WebView
 * @param onMessage - Callback function to handle messages from Android
 * @returns Object containing methods to interact with Android WebView
 */
export function useAndroidWebView(onMessage?: (message: AndroidMessage) => void) {
    const [isAndroidWebView, setIsAndroidWebView] = useState(false);
    const [h5port, setH5port] = useState<null | H5Port>(null);

    // Function to send messages to Android
    const sendToAndroid = useCallback((type: string, data: any) => {
        if (isAndroidWebView && h5port) {
            try {
                h5port.postMessage(JSON.stringify({ type, data }));
                return true;
            } catch (error) {
                console.error('Error sending message to Android:', error);
                return false;
            }
        }
        return false;
    }, [isAndroidWebView, h5port]);

    useEffect(() => {
        // Check if running in Android WebView
        const checkAndroidWebView = () => {
            // debugger;
            const userAgent = navigator.userAgent.toLowerCase();
            const isAndroid = /OpenHarmony/i.test(userAgent);
            const isWebView = /ArkWeb/i.test(userAgent);
            return isAndroid && isWebView;
        };

        setIsAndroidWebView(checkAndroidWebView());

        // Handler for messages from Android
        const handleAndroidMessage = (event: MessageEvent) => {
            console.log('handleAndroidMessage', event);
            try {
                if (event.data === '__init_port__') {
                    if (event.ports[0] !== null) {
                        const h5Port = event.ports[0]; // 1. 保存从应用侧发送过来的端口。
                        h5Port.onmessage = function (event: MessageEvent) {
                          // 2. 接收ets侧发送过来的消息。
                          var msg = 'Got message from ets:';
                          var result = event.data;
                          if (typeof(result) === 'string') {
                            console.info(`received string message from html5, string is: ${result}`);
                            msg = msg + result;
                          } else if (typeof(result) === 'object') {
                            if (result instanceof ArrayBuffer) {
                              console.info(`received arraybuffer from html5, length is: ${result.byteLength}`);
                              msg = msg + 'length is ' + result.byteLength;
                            } else {
                              console.info('not support');
                            }
                          } else {
                            console.info('not support');
                          }
                          onMessage && onMessage(result);
                        }
                        setH5port(h5Port);
                    }
                }
            } catch (error) {
                console.error('Error parsing message from Android:', error);
            }
        };

        // Add event listener for messages from Android
        window.addEventListener('message', handleAndroidMessage);
        // Clean up
        return () => {
            window.removeEventListener('message', handleAndroidMessage);
        };
    }, [onMessage]);

    return {
        isAndroidWebView,
        sendToAndroid
    };
}
