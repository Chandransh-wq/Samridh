import React, { useState } from "react";
import clsx from "clsx";
// Optional: install lucide-react for icons, or use text like I did below
import { GoEye, GoEyeClosed } from "react-icons/go";

interface inputProps {
  placeholder: string;
  type: string;
  darkMode: boolean;
  className?: string;
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
  const [showPassword, setShowPassword] = useState(false);

  const isFloating = focused || value.length > 0;

  // Toggle logic: if original type is password, we switch between 'text' and 'password'
  const isPasswordField = type === "password";
  const currentType = isPasswordField && showPassword ? "text" : type;

  return (
    <div className="relative w-full mt-4">
      <label
        className={clsx(
          `absolute left-4 transition-all pointer-events-none z-10
          ${
            isFloating
              ? "top-1 text-[10px] uppercase font-semibold tracking-wider"
              : "top-3 text-sm opacity-60"
          }
          ${darkMode ? "text-white" : "text-black"}`,
          !isFloating && (darkMode ? "text-gray-400" : "text-gray-500"),
          className,
        )}
      >
        {placeholder}
      </label>

      <div className="relative flex items-center">
        <input
          type={currentType}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            onChange?.(e);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={clsx(
            `w-full px-4 pt-5 pb-2 rounded-lg outline-none border transition-all text-sm
            ${isPasswordField ? "pr-12" : ""} 
            ${
              darkMode
                ? `bg-gray-800 border-gray-700 focus:border-blue-500 text-white`
                : `bg-white border-gray-300 focus:border-blue-600 text-black`
            }`,
            className,
          )}
        />

        {/* Visibility Toggle Button */}
        {isPasswordField && value.length > 0 && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`absolute right-3 top-[60%] -translate-y-1/2 p-1 rounded-md transition-colors
              ${
                darkMode
                  ? "text-gray-400 hover:text-white"
                  : "text-gray-500 hover:text-black"
              }`}
          >
            {showPassword ? (
              <span className="text-[10px] font-bold">
                <GoEye size={18} />
              </span>
            ) : (
              <span className="text-[10px] font-bold">
                <GoEyeClosed size={18} />
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default Input;
