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
import {
  findfolderByPageId,
  getInitials,
  getRandomColor,
  illustration,
  getMetrics,
} from "../assets/BaasicFunctions";
import { FiArrowRight, FiHeart, FiLogOut } from "react-icons/fi";
import { logoutUser } from "../utils/authServies";
import { useNavigate } from "react-router-dom";
import Notification from "../Components/notification";
import Tooltip from "../Components/Tooltip";
import { allFolders } from "../assets/Services/user.service";

interface HomeDesktopProps {
  darkMode: boolean;
}

// Compute top tag
const HomeDesktop: React.FC<HomeDesktopProps> = ({ darkMode }) => {
  const navigate = useNavigate();
  const [openNoti, setOpenNoti] = useState(false);
  const folderData = allFolders();

  // 1. Get all metrics and pages from the data
  const { totalFolders, totalPages, totalFavorites, tagCounts, pages } =
    getMetrics(folderData);

  // 2. Compute the top tag entry
  const topTagEntry = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0];

  // 3. Define the stats array inside the component scope
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
      icon: <FaHeart />,
      color: "bg-red-500",
    },
    {
      length: topTagEntry ? `${topTagEntry[0]} (${topTagEntry[1]})` : "-",
      name: "Top Tag",
      icon: <FaTag />,
      color: "bg-yellow-500",
    },
  ];

  // 4. Handle User data safely
  const l = localStorage.getItem("User");
  const user = l ? JSON.parse(l) : { username: "Guest" };

  // UI rendering continues here...

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
                  <span className="text-xl font-bold">{card.length}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-black mt-4 grid grid-cols-3 gap-5 px-4 h-max ">
            <div
              className={`col-span-2 h-full grid grid-cols-3 gap-4 p-5 ${
                darkMode
                  ? `${Theme.dark.primary} text-white`
                  : `${Theme.light.secondary} text-black`
              }`}
            >
              {pages.slice(0, 8).map((page, idx) => (
                <div
                  key={idx}
                  className={`w-full shadow-md ${
                    darkMode
                      ? `${Theme.dark.primary} shadow-[#48474739] `
                      : "bg-white"
                  } mb-2 p-2 rounded-xl`}
                >
                  <div className="flex items-center gap-5 mb-2">
                    <div
                      className={`h-4 w-4 rounded-full`}
                      style={{
                        background: findfolderByPageId(folderData, page.id)
                          ?.color,
                      }}
                    />
                    <div>{page.page}</div>
                  </div>
                  <div className="flex gap-4 text-xs">
                    {page.tags.slice(0, 2).map((tag, i) => (
                      <div
                        key={i}
                        className={`${getRandomColor(
                          darkMode
                        )} text-white text-sm h-5 py-3 flex items-center px-3 rounded-xl`}
                      >
                        {tag}
                      </div>
                    ))}

                    {page.tags.length > 2 && (
                      <div
                        className={`${getRandomColor(
                          darkMode
                        )} text-white text-xs h-6 w-6 flex items-center justify-center p-2 rounded-full`}
                      >
                        +{page.tags.length - 2}
                      </div>
                    )}
                  </div>
                  <div
                    className={`text-sm mt-2 ${
                      darkMode ? "text-zinc-200/80" : "text-zinc-800/80"
                    } text-left`}
                  >
                    {page.pageContent.slice(0, 64)}
                    {page.pageContent.length > 64 ? "..." : ""}
                  </div>
                </div>
              ))}
              <div
                className={`h-40 ${
                  darkMode ? `${Theme.dark.primary}` : `${Theme.light.primary}`
                } shadow-md shadow-[#605f5f56] hover:shadow-none w-full rounded-xl flex justify-center items-center gap-4 hover:gap-2 transition-all duration-200`}
                onClick={() => navigate("/Folder")}
              >
                SEE MORE
                <div
                  className={`h-max w-max p-2 ${
                    darkMode ? `${Theme.dark.accent}` : `${Theme.light.accent}`
                  } rounded-full text-white`}
                >
                  <FiArrowRight />
                </div>
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
                      {getInitials(user.userName)}
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
                {folderData.slice(0, 3).map((Folder, idx) => (
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
                            darkMode ? "text-zinc-200/95" : "text-zinc-800/80"
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeDesktop;
