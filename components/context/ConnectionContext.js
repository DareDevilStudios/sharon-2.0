import React, { createContext, useContext, useState, useEffect } from 'react';

const ConnectionContext = createContext();

export const useConnection = () => {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return context;
};

export const ConnectionProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        await fetch('https://www.google.com/favicon.ico', {
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-cache'
        });
        console.log('online');
        setIsOnline(true);
      } catch (error) {
        console.log('offline');
        setIsOnline(false);
      }
    };

    const handleOnline = () => {
      checkConnection();
    };

    const handleOffline = () => {
      console.log('offline');
      setIsOnline(false);
    };

    // Check initial status
    checkConnection();

    // Set up interval to check every second
    const intervalId = setInterval(checkConnection, 1000);

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <ConnectionContext.Provider value={{ isOnline }}>
      {children}
    </ConnectionContext.Provider>
  );
};