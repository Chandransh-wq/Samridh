import React, { useState } from "react";
import {
  FaBell,
  FaBook,
  FaFile,
  FaHeart,
  FaQuestion,
  FaTag,
} from "react-icons/fa";
import Tooltip from "../Components/Tooltip";
import { FiHeart, FiLogOut } from "react-icons/fi";
import { logoutUser } from "../utils/authServies";
import { Theme } from "../assets/Theme";
import { useNavigate } from "react-router-dom";
import NotificationMobile from "../Components/notificationMobile";
import { getRandomColor, illustration } from "../assets/BaasicFunctions";
import { useFolders } from "../assets/hooks/useFolder";
import { motion } from "framer-motion";
import Loader from "../Components/Loader";
import Loader2 from "../Components/Loader2";

interface HomeMobileProps {
  darkMode: boolean;
}

const HomeMobile: React.FC<HomeMobileProps> = ({ darkMode }) => {
  const [openNoti, setOpenNoti] = useState(false);
  const navigate = useNavigate();

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

  return (
    <div
      className={`${
        darkMode ? "bg-[#111111ed]" : "bg-white"
      } w-[calc(100%+4rem)] min-h-screen absolute -left-17 -z-10`}
    >
      {/* MAIN WRAPPER (scrollable) */}
      <div
        className={`min-h-screen w-[calc(100%-6rem)] relative left-20 ${
          darkMode ? "bg-zinc-950" : "bg-zinc-50"
        } overflow-y-auto`}
        style={{
          boxShadow: darkMode
            ? "rgb(255 255 255 / 4%) -1px 10px 20px 0px"
            : "0px 0px 20px #00000042",
        }}
      >
        {/* HEADER */}
        <div
          className={`flex flex-row justify-between items-center relative z-999 px-5 py-5 ${
            darkMode
              ? `${Theme.dark.primary} text-white`
              : `${Theme.light.secondary} shadow text-black`
          }`}
        >
          <span className="font-bold text-lg">DASHBOARD</span>

          <div className="flex gap-5 z-50 relative">
            <span
              className="h-max w-max rounded-full group hover:bg-zinc-800/30 bg-zinc-400/50 p-2 transition-all duration-75"
              onClick={() => setOpenNoti(!openNoti)}
            >
              <FaBell size={14} />

              <NotificationMobile
                darkMode={darkMode}
                open={openNoti}
                setOpen={setOpenNoti}
              />

              <Tooltip
                text="Notifications"
                darkMode={darkMode}
                className="top-full -translate-x-1/2 mt-1"
              />
            </span>

            <span className="h-max w-max rounded-full hover:bg-zinc-800/30 bg-zinc-400/50 p-2 transition-all group duration-75">
              <FaQuestion size={14} />
              <Tooltip
                text="Help"
                darkMode={darkMode}
                className="top-full -translate-x-1/2 mt-1"
              />
            </span>

            <span
              className="h-max w-max rounded-full bg-red-500 text-white font-semibold p-2 group"
              onClick={() => logoutUser(darkMode, navigate)}
            >
              <FiLogOut size={14} />
              <Tooltip
                text="Log Out"
                darkMode={darkMode}
                className="top-full -translate-x-1/2 mt-1"
              />
            </span>
          </div>
        </div>

        {/* MAIN CONTENT SCROLLS */}
        <div className="w-full flex flex-col pb-20">
          {/* CARDS */}
          <div className="flex flex-col w-full gap-4 mt-4 px-4">
            {data.map((card, idx) => (
              <div
                key={idx}
                className={`
        flex items-center gap-4 p-3 rounded-xl shadow-md text-left w-full
        ${
          darkMode
            ? `${Theme.dark.primary} shadow-[#40404077] text-white`
            : `${Theme.light.secondary} text-gray-800`
        }
        min-w-[180px]
        hover:shadow-lg transition-shadow duration-300
      `}
              >
                <div
                  className={`flex items-center justify-center h-10 w-10 rounded-full text-white shadow-inner ${card.color}`}
                >
                  {card.icon}
                </div>

                <div className="flex flex-col justify-center min-h-[3rem]">
                  <span className="text-xs opacity-50 uppercase font-black tracking-widest">
                    {card.name}
                  </span>

                  {/* LOGIC: If length is missing/loading, show Loader2. Otherwise, show the number. */}
                  <div className="mt-1">
                    {!loading ? (
                      <motion.span
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xl font-bold leading-none mt-1"
                      >
                        {card.length}
                      </motion.span>
                    ) : (
                      <div className="scale-75 -ml-2 mt-2">
                        <Loader2 darkMode={darkMode} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* FOLDER PREVIEW */}
          <div className={`w-full mt-6 px-4 rounded-t-4xl pt-5 `}>
            {loading ? (
              <div>
                <Loader darkMode={darkMode} />
              </div>
            ) : (
              folders.map((Folder, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col gap-4 mt-3 w-full shadow-md ${
                    darkMode
                      ? `${Theme.dark.primary} shadow-[#48474739]`
                      : "bg-white"
                  } rounded-xl`}
                  onClick={() => navigate("/Folder")}
                >
                  <div className="flex">
                    <div className="h-max w-max p-1">
                      <div
                        className="h-28 w-32"
                        dangerouslySetInnerHTML={{
                          __html: illustration(Folder.tags[0]),
                        }}
                      />
                    </div>

                    <div className="flex flex-col justify-between w-full text-left">
                      <div className="text-md flex-col font-semibold flex justify-evenly items-center w-56 my-3 pr-3">
                        <div
                          className={`w-full mr-auto pr-16 ${
                            darkMode ? "text-white" : "text-black"
                          }`}
                        >
                          {Folder.title}
                        </div>
                        <div
                          className={`text-xs pr-12 flex-wrap flex w-full ${
                            darkMode ? "text-zinc-200/95" : "text-zinc-800/80"
                          }`}
                        >
                          {Folder.description}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row justify-center items-center gap-2 mt-4 mr-2 px-2 mb-4">
                    <div className="flex flex-row gap-2">
                      <span>
                        <div
                          className="h-5 w-5 rounded-full"
                          style={{ background: Folder.color }}
                        />
                      </span>

                      <span>
                        {Folder.favorite ? (
                          <FaHeart fill="red" />
                        ) : (
                          <FiHeart fill="white" stroke="black" />
                        )}
                      </span>
                    </div>
                    <div
                      className={`flex flex-row text-xs font-semibold gap-2 w-full flex-wrap ${
                        darkMode ? "text-white" : "text-black"
                      }`}
                    >
                      {Folder.tags.map((tag, idx) => (
                        <div
                          className={`h-max w-max ${getRandomColor(
                            darkMode,
                          )} p-1 px-2 rounded-md`}
                          key={idx}
                        >
                          {tag}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeMobile;
