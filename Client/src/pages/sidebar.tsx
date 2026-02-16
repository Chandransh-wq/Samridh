import React from "react";
import { getInitials } from "../assets/BaasicFunctions";
import { FaFolder, FaHome, FaMap, FaMoon, FaSun } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { Theme } from "../assets/Theme";
import Tooltip from "../Components/Tooltip";

interface SidebarProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

const LINKS = [
  { name: "Dashboard", icon: <FaHome />, link: "/" },
  { name: "Folders", icon: <FaFolder />, link: "/Folder" },
  { name: "Mind Map", icon: <FaMap />, link: "/map" },
];

/* ---------------- Desktop Sidebar ---------------- */

const SidebarDesktop: React.FC<SidebarProps> = ({ darkMode, setDarkMode }) => {
  const location = useLocation();

  const l = localStorage.getItem("User");
  const user = JSON.parse(l ?? "");

  return (
    <div
      className={`w-fit ${
        darkMode ? "bg-zinc-950" : "bg-zinc-50"
      } h-[calc(100%-0.5rem)] mt-1 fixed left-2 py-5 px-2 z-1 rounded-full flex flex-col items-center justify-between`}
      style={{
        boxShadow: darkMode
          ? "rgb(255 255 255 / 4%) -1px 10px 20px 0px"
          : "0px 0px 20px #00000042",
      }}
    >
      {/* Account details */}
      <div className="relative flex items-center justify-center group">
        {user.avatarURL ? (
          <img
            src={user.avatarURL}
            alt="avatar"
            className="w-10 h-10 rounded-full mt-2 border-2 border-white dark:border-gray-700"
          />
        ) : (
          <div
            className={`w-8 h-8 rounded-full mt-2 flex items-center justify-center font-semibold tracking-wider text-sm ${
              darkMode ? Theme.dark.accent : Theme.light.accent
            }`}
          >
            {getInitials(user.username)}
          </div>
        )}

        {/* Tooltip */}
        <div
          className={`absolute left-full ml-3 top-14 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none rounded-lg shadow-xl p-3 z-50 ${
            darkMode
              ? "bg-[#171717] text-[#f0eceb]"
              : "bg-[#F3F3F3] text-[#14100f]"
          }`}
        >
          <div className="flex flex-col gap-1 min-w-[180px]">
            <span className="font-semibold text-sm">{user.userName}</span>
            <span className="text-xs text-gray-400 dark:text-gray-300">
              @{user.username}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-300">
              {user.email}
            </span>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="flex flex-col items-center gap-16">
        {LINKS.map((link, idx) => {
          const active = location.pathname === link.link;

          return (
            <div
              key={idx}
              className="relative flex flex-col items-center group"
            >
              <Link
                to={link.link}
                className={`p-3 rounded-full ${
                  active
                    ? "bg-zinc-800"
                    : darkMode
                      ? "text-white"
                      : "text-black"
                }`}
              >
                {link.icon}
              </Link>

              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                <Tooltip darkMode={darkMode} text={link.name} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Dark/Light toggle */}
      <div>
        <div
          className={`${
            darkMode ? "bg-yellow-400 text-black" : "bg-zinc-900 text-white"
          } p-3 rounded-full`}
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? <FaSun /> : <FaMoon />}
        </div>
      </div>
    </div>
  );
};

/* ---------------- Mobile Sidebar ---------------- */

const SidebarMobile: React.FC<SidebarProps> = ({ darkMode, setDarkMode }) => {
  const location = useLocation();

  const l = localStorage.getItem("User");
  const user = JSON.parse(l ?? "");

  return (
    <div
      className={`w-screen ${
        darkMode ? "bg-zinc-950" : "bg-zinc-50"
      } h-max mt-1 fixed py-3 px-5 z-10 flex items-center bottom-[0rem] justify-between`}
      style={{
        boxShadow: darkMode
          ? "rgba(255, 255, 255, 0.04) -1px -12px 20px 0px"
          : "0px 0px 20px #00000042",
      }}
    >
      {/* Avatar / Initials (mobile) */}
      {user.avatarURL ? (
        <img
          src={user.avatarURL}
          alt="avatar"
          className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-700"
        />
      ) : (
        <div
          className={`h-10 w-10 flex items-center justify-center rounded-full font-semibold tracking-wider text-sm ${
            darkMode ? Theme.dark.accent : Theme.light.accent
          }`}
        >
          {getInitials(user.name)}
        </div>
      )}

      {/* Links */}
      <div className="flex items-center gap-7">
        {LINKS.map((link, idx) => {
          const active = location.pathname === link.link;

          return (
            <div
              key={idx}
              className={`relative flex items-center group transition-all duration-100 ${
                active
                  ? "bg-zinc-800 rounded-full text-white -translate-y-2"
                  : "bg-transparent"
              }`}
            >
              <Link
                to={link.link}
                className={`p-3 rounded-full ${
                  darkMode ? "text-white" : active ? "text-white" : "text-black"
                }`}
              >
                {link.icon}
              </Link>

              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                <Tooltip darkMode={darkMode} text={link.name} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Dark/Light toggle */}
      <div>
        <div
          className={`${
            darkMode ? "bg-yellow-400 text-black" : "bg-zinc-900 text-white"
          } p-3 rounded-full`}
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? <FaSun /> : <FaMoon />}
        </div>
      </div>
    </div>
  );
};

/* ---------------- Wrapper ---------------- */

const Sidebar: React.FC<SidebarProps> = ({ darkMode, setDarkMode }) => {
  return (
    <>
      <div className="hidden md:block relative z-1">
        <SidebarDesktop darkMode={darkMode} setDarkMode={setDarkMode} />
      </div>

      <div className="block md:hidden">
        <SidebarMobile darkMode={darkMode} setDarkMode={setDarkMode} />
      </div>
    </>
  );
};

export default Sidebar;
