import React, { useState, useEffect } from "react";
import ToastContainer from "../Components/ToastContainer";
import { setToastHandler, type ToastPayload } from "../utils/Toast";
import Toast from "./toaster";

const ToastProvider: React.FC = () => {
  const [toasts, setToasts] = useState<ToastPayload[]>([]);

  const addToast = (toast: ToastPayload) => {
    setToasts((prev) => [...prev, toast]);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t !== toast));
    }, 3000);
  };

  // Only set the global handler once
  useEffect(() => {
    setToastHandler(addToast);
  }, []);

  return (
    <ToastContainer>
      {toasts.map((t) => (
        <Toast
          key={t.title + t.des + Math.random} // unique key
          title={t.title}
          des={t.des}
          type={t.type}
          darkMode={t.darkMode}
        />
      ))}
    </ToastContainer>
  );
};

export default ToastProvider;
