import { AnimatePresence, motion } from "framer-motion";
import React, { useState, useCallback } from "react";
import {
  FiBold,
  FiCheck,
  FiChevronDown,
  FiItalic,
  FiList,
  FiUnderline,
} from "react-icons/fi";
import Tooltip from "./Tooltip";
import { AiOutlineExpand } from "react-icons/ai";
import { MdShortText } from "react-icons/md";
import { summarize, type summarizeProps } from "../assets/Services/api.service";
import { toast } from "../utils/Toast";

// 1. Static Configuration outside to prevent re-allocation on every keystroke
const MARKDOWN_MAP: Record<string, [string, string]> = {
  bold: ["**", "**"],
  italic: ["*", "*"],
  underline: ["<u>", "</u>"],
  link: ["[", "](url)"],
};

const FONTS = ["Inter", "Playfair Display", "JetBrains Mono"];

interface ActionButtonProps {
  icon: React.ReactElement;
  label: string;
  darkMode: boolean;
  hoverClass?: string;
  isActive?: boolean;
  onClick?: () => void;
}

// 2. Memoized Sub-components
const ActionButton = React.memo(
  ({
    icon,
    label,
    darkMode,
    hoverClass,
    isActive,
    onClick,
  }: ActionButtonProps) => (
    <button
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`h-8 w-8 flex items-center justify-center rounded-xl transition-all duration-200 group relative ${
        isActive
          ? darkMode
            ? "bg-blue-500/20 text-blue-400"
            : "bg-blue-50 text-blue-600"
          : hoverClass ||
            (darkMode
              ? "hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100"
              : "hover:bg-gray-100 text-gray-500 hover:text-gray-900")
      }`}
    >
      <span className="group-active:scale-90 transition-transform duration-100">
        {icon}
      </span>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 translate-y-1 group-hover:translate-y-0 z-[100]">
        <Tooltip text={label} darkMode={darkMode} />
      </div>
    </button>
  ),
);

const Separator: React.FC<{ darkMode: boolean }> = ({ darkMode }) => (
  <div
    className={`w-[1px] h-5 self-center mx-1 transition-colors ${darkMode ? "bg-white/10" : "bg-gray-200"}`}
  />
);

interface ToolbarFloatProps {
  show: boolean;
  setShow: (state: boolean) => void;
  darkMode: boolean;
  setEditingContent: (state: boolean) => void;
  selectedText: string;
  setSelectedText: (text: string) => void;
  menuPos: {
    top: number;
    left: number;
  };
}

// 3. Optimized Main Component
const ToolbarFloat: React.FC<ToolbarFloatProps> = ({
  show,
  setShow,
  darkMode,
  setEditingContent,
  selectedText,
  setSelectedText,
  menuPos,
}) => {
  const [fontOpen, setFontOpen] = useState(false);
  const [selectedFont, setSelectedFont] = useState("Inter");

  // 4. Memoized Formatting Logic
  const isToolActive = useCallback(
    (toolId: string) => {
      if (!selectedText) return false;
      if (toolId === "list")
        return selectedText.split("\n").some((l) => l.startsWith("- "));

      const wrapper = MARKDOWN_MAP[toolId];
      if (!wrapper) return false;
      const [pre, suf] = wrapper;
      return selectedText.startsWith(pre) && selectedText.endsWith(suf);
    },
    [selectedText],
  );

  const handleFormat = useCallback(
    (toolId: string) => {
      if (!selectedText || !setSelectedText) return;

      if (toolId === "list") {
        const lines = selectedText.split("\n");
        const isList = lines.every(
          (l) => l.trim() === "" || l.startsWith("- "),
        );
        setSelectedText(
          isList
            ? lines
                .map((l: any) => (l.startsWith("- ") ? l.slice(2) : l))
                .join("\n")
            : lines.map((l: any) => (l.trim() ? `- ${l}` : l)).join("\n"),
        );
        return;
      }

      const [pre, suf] = MARKDOWN_MAP[toolId];
      if (isToolActive(toolId)) {
        setSelectedText(
          selectedText.slice(pre.length, selectedText.length - suf.length),
        );
      } else {
        setSelectedText(`${pre}${selectedText}${suf}`);
      }
    },
    [selectedText, setSelectedText, isToolActive],
  );

  const handleSummarize = async () => {
    // Client-side Guard: Backend requires 50+ characters
    if (!selectedText || selectedText.length < 50) {
      toast.error("Error", "Selection too short (min 50 chars)", darkMode);
      return;
    }

    const query: summarizeProps = {
      text: selectedText,
      mode: "narrative",
    };

    // 1. Await the actual string result from the API
    const result = await summarize(query, darkMode);

    // 2. Pass the STRING result to your setter
    if (result && setSelectedText) {
      setSelectedText(result);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(e) => {
              e.preventDefault();
              setShow(false);
              setFontOpen(false);
              setEditingContent(true);
            }}
            className="fixed inset-0 z-40"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10, x: "-50%" }}
            animate={{ opacity: 1, scale: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, scale: 0.95, y: 10, x: "-50%" }}
            style={{
              top: menuPos.top,
              left: menuPos.left,
              position: "fixed",
            }}
            className={`z-50 flex items-center shadow-2xl p-1.5 gap-1 rounded-2xl border backdrop-blur-2xl transition-all duration-200 ${
              darkMode
                ? "bg-zinc-900/90 border-white/10 ring-1 ring-white/5 text-zinc-400"
                : "bg-white border-gray-200 text-gray-600"
            }`}
          >
            <div className="flex px-1 gap-0.5">
              <ActionButton
                icon={<MdShortText size={20} />}
                label="Summarize"
                darkMode={darkMode}
                onClick={handleSummarize}
                hoverClass={
                  darkMode
                    ? "hover:bg-purple-500/20 text-purple-400"
                    : "hover:bg-purple-100 text-purple-600"
                }
              />
              <ActionButton
                icon={<AiOutlineExpand size={18} />}
                label="Expand"
                darkMode={darkMode}
                hoverClass="hover:text-blue-400"
              />
            </div>

            <Separator darkMode={darkMode} />

            <div className="flex gap-0.5 px-1">
              {(["bold", "italic", "underline"] as const).map((id) => (
                <ActionButton
                  key={id}
                  icon={
                    id === "bold" ? (
                      <FiBold size={16} />
                    ) : id === "italic" ? (
                      <FiItalic size={16} />
                    ) : (
                      <FiUnderline size={16} />
                    )
                  }
                  label={id.charAt(0).toUpperCase() + id.slice(1)}
                  darkMode={darkMode}
                  isActive={isToolActive(id)}
                  onClick={() => handleFormat(id)}
                />
              ))}
              <ActionButton
                icon={<FiList size={16} />}
                label="List"
                darkMode={darkMode}
                isActive={isToolActive("list")}
                onClick={() => handleFormat("list")}
              />
            </div>

            <Separator darkMode={darkMode} />

            <div className="relative px-1">
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setFontOpen(!fontOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all text-[10px] font-black uppercase tracking-tighter ${
                  darkMode
                    ? "hover:bg-zinc-800 text-zinc-300"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                {selectedFont.split(" ")[0]}
                <FiChevronDown
                  className={`transition-transform ${fontOpen ? "rotate-180" : ""}`}
                  size={10}
                />
              </button>

              <AnimatePresence>
                {fontOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 5 }}
                    className={`absolute bottom-full left-0 mb-3 w-40 rounded-xl shadow-2xl border p-1 backdrop-blur-xl ${darkMode ? "bg-zinc-900/95 border-zinc-800" : "bg-white/95 border-gray-200"}`}
                  >
                    {FONTS.map((f) => (
                      <button
                        key={f}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setSelectedFont(f);
                          setFontOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[11px] font-medium transition-colors ${
                          selectedFont === f
                            ? darkMode
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-blue-50 text-blue-600"
                            : darkMode
                              ? "hover:bg-white/5 text-zinc-400"
                              : "hover:bg-gray-100 text-gray-600"
                        }`}
                      >
                        {f}
                        {selectedFont === f && <FiCheck size={12} />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ToolbarFloat;
