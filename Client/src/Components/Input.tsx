import React, { useState } from "react";
import { Theme } from "../assets/Theme";
import clsx from "clsx";

interface inputProps {
  placeholder: string;
  type: string;
  darkMode: boolean;
  className?: string;

  // ADD THIS:
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Input: React.FC<inputProps> = ({
  placeholder,
  type,
  darkMode,
  className,
  onChange,
}) => {
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState("");

  const isFloating = focused || value.length > 0;

  return (
    <div className="relative w-full mt-4">
      <label
        className={clsx(
          `
          absolute left-4 transition-all pointer-events-none 
          ${
            isFloating ? "top-1 text-xs opacity-90" : "top-3 text-sm opacity-60"
          }
          ${darkMode ? "text-gray-400" : "text-gray-800"}
        `,
          className
        )}
      >
        {placeholder}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onChange?.(e);
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={clsx(
          `
          w-full px-4 pt-5 pb-2
          rounded-lg outline-none border 
          transition-all text-sm
          ${
            darkMode
              ? `${Theme.dark.secondary} border-gray-700 focus:border-blue-500 text-white`
              : `${Theme.light.secondary} border-gray-300 focus:border-blue-600 bg-white text-black`
          }
        `,
          className
        )}
      />
    </div>
  );
};

export default Input;
