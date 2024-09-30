"use client";

import { createContext, useContext, useEffect, useState } from "react";

// Define the type for the DeviceContext
interface DeviceContextType {
  isMobile: boolean;
  viewportHeight: string; // Add viewportHeight to the context type
}

// Create a DeviceContext with a default value (can be an initial state)
const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export const DeviceProvider = ({ children }: any) => {
  const [isMobile, setIsMobile] = useState(false);
  const [viewportHeight, setViewportHeight] = useState("100vh"); // State to store the calculated viewport height

  // Define a function to check screen size and calculate viewport height
  const handleResize = () => {
    const mobile = window.innerWidth <= 600; // Define mobile screen width threshold
    setIsMobile(mobile);

    // Calculate the actual viewport height and set it in CSS variables
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
    setViewportHeight(`calc(var(--vh, 1vh) * 100)`); // Set for use within React
  };

  useEffect(() => {
    // Check the device type and viewport height on initial render
    handleResize();

    // Add event listener to handle window resizing
    window.addEventListener("resize", handleResize);

    // Cleanup the event listener when component unmounts
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <DeviceContext.Provider value={{ isMobile, viewportHeight }}>
      {children}
    </DeviceContext.Provider>
  );
};

// Custom hook for easy access to the context
export const useDevice = () => {
  const context = useContext(DeviceContext);

  if (!context) {
    throw new Error("useDevice must be used within a DeviceProvider");
  }

  return context;
};
