import React, { useEffect } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, type = "info", onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const typeStyles = {
    success: "bg-green-600 text-white",
    error: "bg-red-600 text-white",
    info: "bg-blue-600 text-white",
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 px-4 py-2 rounded shadow-lg ${typeStyles[type]}`}>
      {message}
      <button className="ml-4 text-white font-bold" onClick={onClose} aria-label="Close">×</button>
    </div>
  );
};
