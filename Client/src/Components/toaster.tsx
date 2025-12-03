import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { color, iconGive } from "../assets/icons";

interface toastProps {
  darkMode: boolean;
  title: string;
  des: string;
  type: string;
}

const Toast: React.FC<toastProps> = ({ darkMode, title, des, type }) => {
  const [progress, setProgress] = useState(100);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p == 0) {
          clearInterval(timer);
          // Give the exit animation time before hiding completely
          setTimeout(() => setVisible(true), 10000); // 2s exit duration
          return 0;
        }
        return p - 1;
      });
    }, 29);

    return () => clearInterval(timer);
  }, []);

  const shrink = () => `${progress}%`;

  return (
    <AnimatePresence>
      <div className="transition-all -mb-20 group-hover:mb-1 -translate-y-20 group-hover:translate-y-0">
        {!visible && (
          <motion.div
            initial={{ opacity: 0, x: 900, scale: 1 }}
            animate={{ opacity: 1, x: 70, scale: 1 }}
            exit={{
              opacity: 1,
              x: 900,
              scale: 1,
              transition: { duration: 40 },
            }}
            transition={{ duration: 0.5 }}
            className={`flex flex-col gap-4 text-left p-4 w-80 rounded-xl shadow-lg border
              ${
                darkMode
                  ? "bg-zinc-900 border-zinc-800"
                  : "bg-white border-zinc-200"
              }`}
          >
            <div className="flex gap-4 items-start">
              <div className="h-10 w-10 flex items-center justify-center rounded-full px-2 bg-zinc-800/10">
                {iconGive(type, darkMode)}
              </div>

              <div className="flex flex-col">
                <span
                  className={`font-medium ${
                    darkMode ? "text-zinc-100" : "text-zinc-900"
                  }`}
                >
                  {title}
                </span>
                <span
                  className={`text-sm ${
                    darkMode ? "text-zinc-400" : "text-zinc-600"
                  }`}
                >
                  {des}
                </span>
              </div>
            </div>

            <div
              className={`transition-all duration-75 h-1 rounded-full ${color(
                type
              )}`}
              style={{ width: shrink() }}
            />
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
};

export default Toast;
