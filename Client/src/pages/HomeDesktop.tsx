import React, { useState } from "react";
import {
  FaBell,
  FaBook,
  FaFile,
  FaHeart,
  FaQuestion,
  FaTag,
} from "react-icons/fa";
import { Theme } from "../assets/Theme";
import { getInitials, illustration } from "../assets/BaasicFunctions";
import { FiArrowRight, FiHeart, FiLogOut } from "react-icons/fi";
import { logoutUser } from "../utils/authServies";
import { useNavigate } from "react-router-dom";
import Notification from "../Components/notification";
import Tooltip from "../Components/Tooltip";
import { useFolders } from "../assets/hooks/useFolder";
import type { folder } from "../assets/DemoData";
import { motion } from "framer-motion";
import Loader2 from "../Components/Loader2";
import Loader from "../Components/Loader";

interface HomeDesktopProps {
  darkMode: boolean;
}

// Then your data array

const HomeDesktop: React.FC<HomeDesktopProps> = ({ darkMode }) => {
  const navigate = useNavigate();
  const [openNoti, setOpenNoti] = useState(false);

  const l = localStorage.getItem("User");
  const user = JSON.parse(l ?? "");

  const {
    folders,
    totalFavorites,
    totalFolders,
    totalPages,
    tagCounts,
    loading,
  } = useFolders();

  // Compute top tag
  const topTag = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0]; // ["Math", 12]

  const data = [
    {
      length: totalFolders,
      name: "folders",
      icon: <FaBook />,
      color: "bg-blue-500",
    },
    {
      length: totalPages,
      name: "Pages",
      icon: <FaFile />,
      color: "bg-green-700",
    },
    {
      length: totalFavorites,
      name: "Favourites",
      icon: <FaFile />,
      color: "bg-red-500",
    },
    {
      length: topTag ? `${topTag[0]} (${topTag[1]})` : "-",
      name: "Top Tag",
      icon: <FaTag />,
      color: "bg-yellow-500",
    },
  ];

  const pages = folders.flatMap((f) => f.pages);
  const findfolderByPageId = (pageId: string) => {
    return (
      folders.find((folder: folder) =>
        folder.pages.some((page) => page._id === pageId),
      ) || null
    );
  };
  return (
    <div
      className={`${
        darkMode ? "bg-[#111111ed]" : "bg-white"
      } w-screen min-h-screen absolute left-0 -z-10 flex flex-col gap-4`}
    >
      {/* main body */}
      <div
        className={`h-[calc(100%)] pb-3 w-[calc(100%-6rem)] relative left-20 ${
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
          className={`flex flex-row justify-between items-center px-16 z-9999 py-5 ${
            darkMode
              ? `${Theme.dark.primary} text-whtie`
              : `${Theme.light.secondary} shadow text-black`
          }`}
        >
          <span className="font-bold text-lg">DASHBOARD</span>
          <div className="flex gap-4">
            <span
              className="relative h-max w-max rounded-full group hover:bg-zinc-800/30 bg-zinc-400/50 trasnsition-all duration-75 p-2"
              onClick={() => setOpenNoti(true)}
            >
              <FaBell size={14} />
              <Notification
                darkMode={darkMode}
                open={openNoti}
                setOpen={setOpenNoti}
              />
              <Tooltip
                text="Notifications"
                darkMode={darkMode}
                className="top-full left-1/2 -translate-x-1/2 mt-1"
              />
            </span>

            <span className="relative h-max w-max rounded-full group hover:bg-zinc-800/30 bg-zinc-400/50 trasnsition-all duration-75 p-2">
              <FaQuestion size={14} />
              <Tooltip
                text="Help"
                darkMode={darkMode}
                className="top-full left-1/2 -translate-y-1/2 mt-1"
              />
            </span>

            <span
              className="relative h-max w-max rounded-full bg-red-500 group text-white font-semibold trasnsition-all duration-75 p-2"
              onClick={() => logoutUser(darkMode, navigate)}
            >
              <FiLogOut size={14} />
              <Tooltip
                text="Log Out"
                darkMode={darkMode}
                className="top-full left-1/2 -translate-x-1/2 mt-1"
              />
            </span>
          </div>
        </div>
        {/* MAIN BODY */}
        <div className="h-[calc(100%-rem)] flex flex-col">
          {/* Cards */}
          <div className="flex gap-4 mt-4 px-4">
            {data.map((card, idx) => (
              <div
                key={idx}
                className={`
                  flex items-center gap-4 p-3 rounded-xl shadow-md text-left w-1/4
                  ${
                    darkMode
                      ? `${Theme.dark.primary} shadow-[#40404077] text-white`
                      : `${Theme.light.secondary} text-gray-800`
                  }
                  min-w-[180px]
                  hover:shadow-lg transition-shadow
                `}
              >
                {/* Icon with colored circle */}
                <div
                  className={`flex items-center justify-center h-10 w-10 rounded-full text-white ${card.color}`}
                >
                  {card.icon}
                </div>

                {/* Text content */}
                <div className="flex flex-col">
                  <span className="text-lg font-semibold">{card.name}</span>
                  {loading ? (
                    <div className="scale-75 -ml-2 mt-2">
                      <Loader2 darkMode={darkMode} />
                    </div>
                  ) : (
                    <span className="text-xl font-bold">{card.length}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="text-black mt-5 grid grid-cols-3 gap-5 px-4 h-max ">
            <div
              className={`col-span-2 h-full min-h-[50%] columns-3 gap-4 p-5 ${
                darkMode
                  ? `${Theme.dark.primary} text-white`
                  : `${Theme.light.secondary} text-black`
              }`}
            >
              <div className="">
                {loading ? (
                  <div className="relative top-32">
                    <Loader darkMode={darkMode} />
                  </div>
                ) : (
                  <div className="">
                    {pages.slice(0, 8).map((page, idx) => {
                      // Logic: Find the parent folder once per page for the color dot
                      const parentFolder = findfolderByPageId(page._id ?? "");

                      return (
                        <motion.div
                          key={page._id || idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className={`w-full relative overflow-hidden max-h-64 text-left shadow-sm border ${
                            darkMode
                              ? "bg-black/5 border-zinc-800 text-white"
                              : "bg-white border-zinc-100 text-black"
                          } mb-4 p-4 rounded-md group cursor-pointer hover:shadow-md transition-all`}
                        >
                          {/* TICKET HOLES - Scaled down for the small recent cards */}
                          <div
                            className={`absolute top-[48%] -left-2 h-4 w-4 rounded-full ${darkMode ? "bg-zinc-800/50" : "bg-zinc-200"}`}
                          />
                          <div
                            className={`absolute top-[48%] -right-2 h-4 w-4 rounded-full ${darkMode ? "bg-zinc-800/50" : "bg-zinc-200"}`}
                          />

                          {/* HEADER: Folder Dot & Page Title */}
                          <div className="flex items-center gap-3 mb-2">
                            <div
                              className="h-3 w-3 rounded-full shadow-sm"
                              style={{
                                background: parentFolder?.color || "#3b82f6",
                              }}
                            />
                            <div className="font-bold text-sm truncate">
                              {page.page}
                            </div>
                          </div>

                          {/* CONTENT PREVIEW: Uses line-clamp for cleaner truncation */}
                          <div
                            className={`text-xs mb-3 line-clamp-2 text-left leading-relaxed opacity-60`}
                          >
                            {page.pageContent ||
                              "No content summary available."}
                          </div>

                          {/* TICKET PERFORATION & TAGS */}
                          <div className="border-t-2 border-dashed border-zinc-500/10 pt-3 mt-2 flex flex-col gap-2">
                            <div className="flex gap-2 flex-wrap items-center">
                              {page.tags.slice(0, 2).map((tag, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-tighter"
                                  style={{
                                    background: darkMode
                                      ? "rgba(59, 130, 246, 0.1)"
                                      : "rgba(59, 130, 246, 0.05)",
                                    color: darkMode ? "#60a5fa" : "#2563eb",
                                  }}
                                >
                                  {tag}
                                </span>
                              ))}

                              {page.tags.length > 2 && (
                                <span className="text-[9px] font-bold opacity-30">
                                  +{page.tags.length - 2} MORE
                                </span>
                              )}
                            </div>

                            {/* RECENT TIMESTAMP: The "Pop" Logic */}
                            <div
                              className={`text-[9px] pl-2 font-mono font-bold uppercase tracking-widest ${darkMode ? "text-blue-400" : "text-blue-600"}`}
                            >
                              Edited{" "}
                              {new Date(
                                page.updatedAt || page.createdAt || Date.now(),
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate("/Folder")}
                      className={`group relative h-20 w-full flex items-center justify-center gap-4 cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 ${
                        darkMode
                          ? "bg-zinc-900/50 border-zinc-800 hover:border-blue-500/50 text-white shadow-2xl shadow-black/20"
                          : "bg-white border-zinc-200 hover:border-blue-500/50 text-black shadow-lg shadow-zinc-200/50"
                      }`}
                    >
                      {/* BACKGROUND GLOW EFFECT (Visible on hover) */}
                      <div
                        className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-r from-blue-500 to-purple-600`}
                      />

                      {/* TEXT LOGIC */}
                      <span className="font-black text-xs uppercase tracking-[0.3em] transition-all duration-300 group-hover:tracking-[0.4em] group-hover:text-blue-500">
                        See All Pages
                      </span>

                      {/* ANIMATED ARROW CONTAINER */}
                      <motion.div
                        className={`flex items-center justify-center p-2.5 rounded-full shadow-lg transition-transform duration-300 group-hover:translate-x-2 ${
                          darkMode
                            ? "bg-blue-500 text-white"
                            : "bg-blue-600 text-white"
                        }`}
                      >
                        <FiArrowRight
                          size={18}
                          className="group-hover:scale-110 transition-transform"
                        />
                      </motion.div>
                    </motion.div>
                  </div>
                )}
              </div>
            </div>
            <div
              className={`h-full ${
                darkMode
                  ? `${Theme.dark.primary} text-white`
                  : `${Theme.light.secondary} text-black`
              }`}
            >
              <div
                className={`${
                  darkMode ? "bg-black" : "bg-[#D9D9D9]"
                } mx-2 mt-3 p-3 rounded-2xl flex flex-row gap-5 items-center`}
              >
                <div className="h-9 w-9 rounded-full overflow-hidden flex items-center justify-center">
                  {user.avatarURL ? (
                    <img
                      src={user.avatarURL}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className={`h-9 w-9 flex items-center justify-center font-semibold tracking-wider text-sm rounded-full py-2 cursor-pointer transition-all duration-200 ${
                        darkMode
                          ? `${Theme.dark.accent} text-white`
                          : `${Theme.light.accent} text-white`
                      } shadow-md`}
                    >
                      {getInitials(user.username)}
                    </div>
                  )}
                </div>

                <div className={`text-left`}>
                  <div
                    className={`text-md ${
                      darkMode ? "text-zinc-50" : "text-zinc-800"
                    }  font-semibold`}
                  >
                    {user.username}
                  </div>
                  <div
                    className={`text-sm text-left ${
                      darkMode ? "text-zinc-200/90" : "text-zinc-700/90"
                    }`}
                  >
                    {user.email}
                  </div>
                </div>
              </div>
              <div className="py-2 px-5 flex flex-col">
                {loading ? (
                  <Loader darkMode={darkMode} />
                ) : (
                  <>
                    {folders.slice(0, 3).map((Folder, idx) => (
                      <div
                        key={idx}
                        className={`flex gap-4 mt-3  w-full shadow-md ${
                          darkMode
                            ? `${Theme.dark.primary} shadow-[#48474739]`
                            : "bg-white"
                        } rounded-xl `}
                        onClick={() => navigate("/Folder")}
                      >
                        <div className={`h-max w-max p-1 `}>
                          <div
                            className="h-28 w-32"
                            dangerouslySetInnerHTML={{
                              __html: illustration(Folder.tags[0]),
                            }}
                          />
                        </div>
                        <div className="flex flex-row justify-between w-full text-left">
                          {/* LEFT */}
                          <div className="text-md flex-col font-semibold flex justify-evenly items-center w-56 my-3  pr-3">
                            <div className="w-full mr-auto">{Folder.title}</div>
                            <div
                              className={`text-xs pr-4 ${
                                darkMode
                                  ? "text-zinc-200/95"
                                  : "text-zinc-800/80"
                              }`}
                            >
                              {Folder.description}
                            </div>
                          </div>
                          {/* RIGHT */}
                          <div className="flex flex-col justify-center items-center gap-2 mt-4 mr-2">
                            {/* Top vertical line */}
                            <svg width="2" height="16">
                              <line
                                x1="0.1"
                                y1="0"
                                x2="0.1"
                                y2="50"
                                stroke={darkMode ? "white" : "black"}
                                strokeWidth="2"
                              />
                            </svg>

                            {/* Color circle */}
                            <span>
                              <div
                                className="h-5 w-5 rounded-full"
                                style={{ background: Folder.color }}
                              />
                            </span>

                            {/* Heart icon */}
                            <span>
                              {Folder.favorite ? (
                                <FaHeart fill="red" />
                              ) : (
                                <FiHeart fill="white" stroke="black" />
                              )}
                            </span>

                            {/* Bottom vertical line */}
                            <svg width="2" height="16">
                              <line
                                x1="0.1"
                                y1="0"
                                x2="0.1"
                                y2="50"
                                stroke={darkMode ? "white" : "black"}
                                strokeWidth="2"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeDesktop;
