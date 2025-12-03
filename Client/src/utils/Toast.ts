// utils/toast.ts
export type ToastPayload = {
  title: string;
  des: string;
  type: "Urgent" | "Info" | "Success" | "Warning";
  darkMode: boolean;
};

let addToast: (toast: ToastPayload) => void;

// API you can call anywhere
export const toast = {
  success: (title: string, des: string, darkMode: boolean) => {
    addToast?.({ title, des, type: "Success", darkMode });
  },
  error: (title: string, des: string, darkMode: boolean) => {
    addToast?.({ title, des, type: "Urgent", darkMode });
  },
  info: (title: string, des: string, darkMode: boolean) => {
    addToast?.({ title, des, type: "Info", darkMode });
  },
  warning: (title: string, des: string, darkMode: boolean) => {
    addToast?.({ title, des, type: "Warning", darkMode });
  },
};

// internal function used by ToastManager
export const setToastHandler = (handler: (toast: ToastPayload) => void) => {
  addToast = handler;
};
