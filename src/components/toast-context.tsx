"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";
import { Toast } from "./Toast";

type ToastType = "success" | "error" | "info";

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [type, setType] = useState<ToastType>("success");
  const [duration, setDuration] = useState(3000);

  const showToast = (
    message: string,
    type: ToastType = "success",
    duration: number = 3000
  ) => {
    setMessage(message);
    setType(type);
    setDuration(duration);
    setIsVisible(true);
  };

  const hideToast = () => {
    setIsVisible(false);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast
        message={message}
        isVisible={isVisible}
        onClose={hideToast}
        type={type}
        duration={duration}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
} 