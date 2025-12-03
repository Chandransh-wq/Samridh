import React from "react";

const ToastContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      className="
        fixed bottom-6 right-20 z-50
        flex flex-col
        group
      "
    >
      {children}
    </div>
  );
};

export default ToastContainer;
