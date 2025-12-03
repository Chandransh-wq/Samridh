import clsx from "clsx";
import React from "react";

interface TooltipProps {
  darkMode: boolean;
  text: string;
  className?: string; // for custom placement (top, bottom, etc.)
}

const Tooltip: React.FC<TooltipProps> = ({ darkMode, text, className }) => {
  return (
    <div
      className={clsx(
        darkMode
          ? "bg-zinc-900/80 text-white shadow-md"
          : "bg-zinc-100/80 text-black shadow",
        "absolute z-50 px-2 py-1 rounded-md text-xs whitespace-nowrap hidden group-hover:block",
        className // parent chooses placement
      )}
    >
      {text}
    </div>
  );
};

export default Tooltip;
