import React, { useState, useMemo } from "react";
import { Theme } from "../assets/Theme";
import {
  FiBold,
  FiItalic,
  FiUnderline,
  FiAlignLeft,
  FiAlignCenter,
  FiAlignRight,
  FiAlignJustify,
  FiList,
  FiRotateCcw,
  FiRotateCw,
  FiLink,
  FiImage,
  FiChevronDown,
  FiCheck,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Tooltip from "./Tooltip";

interface ToolbarProps {
  darkMode: boolean;
  onSelect?: (toolId: string) => void;
  selectedText?: string;
  setSelectedText?: (text: string) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  darkMode,
  onSelect,
  selectedText = "",
  setSelectedText,
}) => {
  const [fontOpen, setFontOpen] = useState(false);
  const [selectedFont, setSelectedFont] = useState("Inter");

  const fonts = ["Inter", "Georgia", "JetBrains Mono", "Playfair Display"];

  // Defined in a memo to prevent re-renders and centralize syntax
  const markdownMap: Record<string, [string, string]> = useMemo(
    () => ({
      bold: ["**", "**"],
      italic: ["*", "*"],
      underline: ["<u>", "</u>"],
      link: ["[", "](url)"],
      image: ["![alt text](", ")"],
      "bullet-list": ["- ", ""],
      "align-left": ['<div align="left">\n\n', "\n\n</div>"],
      "align-center": ['<div align="center">\n\n', "\n\n</div>"],
      "align-right": ['<div align="right">\n\n', "\n\n</div>"],
      "align-justify": ['<div align="justify">\n\n', "\n\n</div>"],
    }),
    [],
  );

  const groups = [
    { id: "history", tools: ["undo", "redo"] },
    { id: "style", tools: ["bold", "italic", "underline"] },
    {
      id: "layout",
      tools: ["align-left", "align-center", "align-right", "align-justify"],
    },
    { id: "structure", tools: ["bullet-list"] },
    { id: "insert", tools: ["link", "image"] },
  ];

  const allIcons: Record<string, React.ReactNode> = {
    bold: <FiBold />,
    italic: <FiItalic />,
    underline: <FiUnderline />,
    "align-left": <FiAlignLeft />,
    "align-center": <FiAlignCenter />,
    "align-right": <FiAlignRight />,
    "align-justify": <FiAlignJustify />,
    "bullet-list": <FiList />,
    undo: <FiRotateCcw />,
    redo: <FiRotateCw />,
    link: <FiLink />,
    image: <FiImage />,
  };

  // Helper to check if the current selection is already wrapped in a tool's markup
  const isToolActive = (toolId: string) => {
    const wrapper = markdownMap[toolId];
    if (!wrapper || !selectedText) return false;
    const [prefix, suffix] = wrapper;
    return selectedText.startsWith(prefix) && selectedText.endsWith(suffix);
  };

  const handleToolClick = (toolId: string) => {
    onSelect?.(toolId);

    if (!selectedText || !setSelectedText) return;

    // Special Case: Bullet List (Multi-line support)
    if (toolId === "bullet-list") {
      const lines = selectedText.split("\n");

      // Check if it's already a list (to toggle it off)
      const isAlreadyList = lines.every(
        (line) => line.trim() === "" || line.startsWith("- "),
      );

      if (isAlreadyList) {
        // Toggle OFF: Remove "- " from the start of each line
        const unwrapped = lines
          .map((line) =>
            line.startsWith("- ") ? line.replace("- ", "") : line,
          )
          .join("\n");
        setSelectedText(unwrapped);
      } else {
        // Toggle ON: Add "- " to the start of each line
        const wrapped = lines
          .map((line) =>
            line.trim() !== "" && !line.startsWith("- ") ? `- ${line}` : line,
          )
          .join("\n");
        setSelectedText(wrapped);
      }
      return; // Exit early for lists
    }

    // Standard Case: Inline/Block Wrappers (Bold, Italic, Align, etc.)
    const wrapper = markdownMap[toolId];
    if (wrapper) {
      const [prefix, suffix] = wrapper;

      if (isToolActive(toolId)) {
        const unwrapped = selectedText.slice(
          prefix.length,
          selectedText.length - suffix.length,
        );
        setSelectedText(unwrapped);
      } else {
        setSelectedText(`${prefix}${selectedText}${suffix}`);
      }
    }
  };

  const isEnabled = selectedText.length > 0;

  return (
    <div
      className={`flex items-center px-4 py-1.5 w-full border-b relative z-30 transition-colors gap-2 overflow-visible ${
        darkMode ? "border-zinc-800/60" : "border-gray-200"
      }`}
      style={{
        background: darkMode ? Theme.dark.secondary : Theme.light.secondary,
      }}
    >
      {/* 1. CUSTOM FONT DROPDOWN */}
      <div className="relative">
        <button
          onClick={() => setFontOpen(!fontOpen)}
          onMouseDown={(e) => e.preventDefault()}
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 border transition-all ${
            darkMode
              ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500"
              : "bg-gray-100 border-gray-200 text-gray-700 hover:border-gray-400"
          }`}
        >
          <span className="text-[10px] font-black uppercase tracking-widest">
            {selectedFont}
          </span>
          <FiChevronDown
            size={12}
            className={`transition-transform ${fontOpen ? "rotate-180" : ""}`}
          />
        </button>

        <AnimatePresence>
          {fontOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setFontOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`absolute top-full mt-2 left-0 w-48 rounded-xl shadow-2xl border p-1 z-50 backdrop-blur-xl ${
                  darkMode
                    ? "bg-zinc-900/95 border-zinc-800"
                    : "bg-white/95 border-gray-200"
                }`}
              >
                {fonts.map((f) => (
                  <button
                    key={f}
                    onClick={() => {
                      setSelectedFont(f);
                      setFontOpen(false);
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
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
                    {selectedFont === f && <FiCheck size={14} />}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {groups.map((group) => (
        <React.Fragment key={group.id}>
          <div
            className={`w-[1px] h-4 mx-1 ${darkMode ? "bg-zinc-800" : "bg-gray-200"}`}
          />
          <div className="flex gap-0.5">
            {group.tools.map((id) => {
              const active = isToolActive(id);
              const isStyleTool = !!markdownMap[id];
              const shouldDisable = isStyleTool && !isEnabled;

              return (
                <div key={id} className="relative group">
                  <button
                    disabled={shouldDisable}
                    onClick={() => handleToolClick(id)}
                    onMouseDown={(e) => e.preventDefault()}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      active
                        ? darkMode
                          ? "bg-blue-500/20 text-blue-400 shadow-inner"
                          : "bg-blue-50 text-blue-600"
                        : shouldDisable
                          ? "opacity-20 cursor-not-allowed"
                          : darkMode
                            ? "text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800"
                            : "text-gray-500 hover:text-black hover:bg-gray-100"
                    }`}
                  >
                    {React.cloneElement(
                      allIcons[id] as React.ReactElement<{ size: number }>,
                      {
                        size: 15,
                      },
                    )}
                  </button>

                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 translate-y-[-4px] group-hover:translate-y-0 z-[100]">
                    <Tooltip text={id} darkMode={darkMode} />
                  </div>
                </div>
              );
            })}
          </div>
        </React.Fragment>
      ))}

      <div className="ml-auto pr-2 opacity-20 text-[9px] font-black uppercase tracking-[0.2em] hidden md:block">
        V 1.2.4
      </div>
    </div>
  );
};

export default Toolbar;
