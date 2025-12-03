// Components/DropDown.tsx
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useRef } from "react";

interface DropDownItem {
  name: string;
  setSelectedOption?: (value: string) => void;
  des?: string;
}

interface DropDownProps {
  darkMode: boolean;
  open: boolean;
  setOpen: (v: boolean) => void;
  elements: DropDownItem[];
  title?: string;
  className?: string;
  desClass?: string;
}

const DropDown: React.FC<DropDownProps> = ({
  darkMode,
  open,
  setOpen,
  elements,
  title = "Options",
  className,
  desClass,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  });

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          initial={{ y: -200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{
            y: -100,
            opacity: 1,
            scale: 1,
            transition: {
              duration: 0.1,
            },
          }}
          transition={{ duration: 0.2 }}
          className={clsx(
            `absolute ${
              darkMode ? " text-white" : "bg-white text-black"
            } p-3 rounded-xl shadow-xl z-10 w-max px-5 text-left`,
            className
          )}
        >
          <div className="font-semibold mb-2 px-5">{title}</div>

          <div className="flex flex-col gap-2">
            {elements.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  if (item.setSelectedOption) {
                    item.setSelectedOption(item.name);
                  }
                  setOpen(false);
                }}
                className={`px-3 py-2 rounded-md ${
                  darkMode
                    ? "hover:bg-zinc-700 text-white"
                    : "hover:bg-zinc-300 text-black"
                } text-left`}
              >
                {item.name}
                {item.des && (
                  <div
                    className={clsx("text-sm text-zinc-500 w-100", desClass)}
                  >
                    {item.des}
                  </div>
                )}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DropDown;
