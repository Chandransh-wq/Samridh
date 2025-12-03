import React from "react";
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
  FiDownload,
} from "react-icons/fi";
import Tooltip from "./Tooltip";

interface ToolbarProps {
  darkMode: boolean;
  onSelect?: (toolId: string) => void; // optional click handler
}

const Toolbar: React.FC<ToolbarProps> = ({ darkMode, onSelect }) => {
  const tools = [
    { id: "bold", icon: <FiBold size={17} /> },
    { id: "italic", icon: <FiItalic size={17} /> },
    { id: "underline", icon: <FiUnderline size={17} /> },
    { id: "align-left", icon: <FiAlignLeft size={17} /> },
    { id: "align-center", icon: <FiAlignCenter size={17} /> },
    { id: "align-right", icon: <FiAlignRight size={17} /> },
    { id: "align-justify", icon: <FiAlignJustify size={17} /> },
    { id: "bullet-list", icon: <FiList size={17} /> },
    { id: "undo", icon: <FiRotateCcw size={17} /> },
    { id: "redo", icon: <FiRotateCw size={17} /> },
    { id: "link", icon: <FiLink size={17} /> },
    { id: "image", icon: <FiImage size={17} /> },
    { id: "download", icon: <FiDownload size={17} /> },
  ];

  const background = darkMode ? Theme.dark.secondary : Theme.light.secondary;

  return (
    <div
      className={`flex gap-2 rounded-md items-center h-max w-full flex-wrap`}
      style={{ background: background }}
    >
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onSelect && onSelect(tool.id)}
          className={`shadow-lg p-2 rounded-md h-max w-max cursor-pointer group hover:scale-105 transition flex justify-center items-center
            ${darkMode ? "border-[#626161]" : "border-black"}
          `}
        >
          {tool.icon}
          <Tooltip text={tool.id} darkMode={darkMode} className="-top-1/2" />
        </button>
      ))}
      <div className="relative  ">
        <select
          className={`w-full p-2 rounded-md outline-none ${
            darkMode
              ? "bg-zinc-700 text-white border border-zinc-600"
              : "bg-white text-black border border-zinc-300"
          }`}
          defaultValue=""
          onChange={(e) => console.log("Selected font:", e.target.value)}
        >
          <option value="" disabled>
            Select font
          </option>
          <option value="Arial">Arial</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
          <option value="Georgia">Georgia</option>
          <option value="Verdana">Verdana</option>
        </select>
      </div>
    </div>
  );
};

export default Toolbar;
