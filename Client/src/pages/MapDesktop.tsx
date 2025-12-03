import React from "react";
import { FaBell } from "react-icons/fa";
import Graph from "../Components/Graph";

interface MapDesktopProps {
  darkMode: boolean;
}

const MapDesktop: React.FC<MapDesktopProps> = ({ darkMode }) => {
  return (
    <div
      className={`${
        darkMode ? "bg-[#111111ed]" : "bg-white"
      } w-screen h-screen absolute left-0 -z-10`}
    >
      {/* main body */}
      <div
        className={`h-[calc(100%)] w-[calc(100%-6rem)] relative left-20 ${
          darkMode ? "bg-zinc-950" : "bg-zinc-50"
        }`}
        style={{
          boxShadow: darkMode
            ? "rgb(255 255 255 / 4%) -1px 10px 20px 0px"
            : "0px 0px 20px #00000042",
        }}
      >
        {/* Title */}
        <div
          className={`flex flex-row justify-between px-16 py-5 items-center ${
            darkMode ? " bg-[#0f0f0fc8]" : "bg-[#dbdada] text-black"
          }`}
        >
          <span className="font-bold">MAP</span>
          <span>
            <FaBell />
          </span>
        </div>
      </div>
      <Graph />
    </div>
  );
};

export default MapDesktop;
