import React, { useEffect, useState } from "react";
import { FaBell, FaHeart, FaPlus } from "react-icons/fa";
import { Theme } from "../assets/Theme";
import { folderData, TAGS, type Page, type folder } from "../assets/DemoData";
import {
  COLORS_Light,
  getRandomColor,
  illustration,
} from "../assets/functions";
import { FiHeart, FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../utils/authServies";
import DropDown from "../Components/DropDown";
import { AnimatePresence, motion } from "framer-motion";
import Input from "../Components/Input";
import { createFolder, createPage } from "../utils/folderServices";
import Pages from "./Page";
import Notification from "../Components/notification";
import Tooltip from "../Components/Tooltip";

interface FolderProps {
  darkMode: boolean;
}

const FolderDesktop: React.FC<FolderProps> = ({ darkMode }) => {
  const navigate = useNavigate();
  const [folders, setFolders] = useState<folder[]>(folderData);
  const [selected, setSelected] = useState(0);
  const [selectedPage, setSelectedPage] = useState(0);
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState("");
  const [favourite, setFavourite] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  useEffect(() => {
    document.body.style.overflowY = selectedOption !== "" ? "hidden" : "auto";
  }, [selectedOption]);

  const handleUpdateTitle = (
    pageIndex: number,
    newTitle: string,
    newContent?: string
  ) => {
    setFolders((prev) => {
      const updated = [...prev];
      const folderCopy = { ...updated[selected] };
      const content = newContent ?? folderCopy.pages[pageIndex].pageContent;

      folderCopy.pages = [...folderCopy.pages];
      folderCopy.pages[pageIndex] = {
        ...folderCopy.pages[pageIndex],
        page: newTitle,
        pageContent: content,
        editedAt: new Date().toISOString(),
      };

      updated[selected] = folderCopy;
      return updated;
    });
  };

  const handleCreate = () => {
    if (selectedOption === "Folder") {
      const newFolder: folder = {
        id: `folder-${Date.now()}`,
        title: title,
        description: description,
        color: selectedColor || COLORS_Light[0],
        favorite: favourite,
        tags: selectedTags,
        icon: <div></div>,
        pages: [],
      };
      createFolder(newFolder);
      setFolders((prev) => [...prev, newFolder]);
    } else if (selectedOption === "Topic") {
      const newPage: Page = {
        id: `page-${Date.now()}`,
        page: title,
        pageContent: "",
        createdAt: new Date().toISOString(),
        editedAt: new Date().toISOString(),
        tags: selectedTags,
      };
      const folderIndex =
        (document.getElementById("selectFolder") as HTMLSelectElement)
          ?.selectedIndex ?? 0;
      createPage(newPage, folderIndex);
      setFolders((prev) => {
        const copy = [...prev];
        copy[folderIndex].pages.push(newPage);
        return copy;
      });
    }

    setSelectedOption("");
    setSelectedTags([]);
    setSelectedColor("");
    setFavourite(false);
    setDialogOpen(false);
  };
  const [openNoti, setOpenNoti] = useState(false);

  return (
    <div>
      <div
        className={`${
          darkMode ? "bg-[#111111ed]" : "bg-white"
        } w-[100%-6rem] min-h-screen absolute left-0 z-0 flex flex-col gap-4`}
      >
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
          {/* HEADER */}
          <div
            className={`flex flex-row justify-between items-center relative z-999 px-16 py-5 ${
              darkMode
                ? `${Theme.dark.primary} text-white`
                : `${Theme.light.secondary} shadow text-black`
            }`}
          >
            <span className="font-bold text-lg">FOLDERS</span>
            <div className="flex gap-5 z-50 relative">
              <span
                className="h-max w-max rounded-full hover:bg-zinc-800/30 bg-zinc-400/50 p-2 transition-all group duration-75"
                onClick={() => setDialogOpen(true)}
              >
                <FaPlus size={14} />
                <Tooltip
                  text="Add"
                  darkMode={darkMode}
                  className="top-full  -translate-x-1/2 mt-1"
                />
              </span>

              <span
                className="h-max w-max rounded-full group hover:bg-zinc-800/30 bg-zinc-400/50 p-2 transition-all duration-75"
                onClick={() => setOpenNoti(!openNoti)}
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
                  className="top-full  -translate-x-1/2 mt-1"
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
                  className="top-full  -translate-x-1/2 mt-1"
                />
              </span>
            </div>
          </div>

          {dialogOpen && (
            <DropDown
              darkMode={darkMode}
              open={dialogOpen}
              setOpen={setDialogOpen}
              title="Select what to Add"
              className={`right-32 top-[3.85rem] rounded-t-none ${
                darkMode ? Theme.dark.secondary : "bg-gray-500"
              }`}
              elements={[
                {
                  name: "Folder",
                  setSelectedOption: (value) => setSelectedOption(value),
                },
                {
                  name: "Topic",
                  setSelectedOption: (value) => setSelectedOption(value),
                },
              ]}
            />
          )}

          {/* MAIN GRID */}
          <div className="min-h-[calc(100%-5rem)] grid grid-cols-3 gap-5 p-4">
            {/* LEFT LIST OF FOLDERS */}
            <div
              className={`col-span-2 h-full gap-4 p-5 w-full ${
                darkMode ? `${Theme.dark.primary} text-white` : `text-black`
              }`}
            >
              <div className="flex flex-col gap-10 w-full">
                {folders.map((folder, idx) => (
                  <div
                    key={idx}
                    className={`${
                      darkMode
                        ? `${Theme.dark.primary} shadow-[#52525255]`
                        : Theme.light.secondary
                    } flex gap-4 w-full p-5 rounded-2xl shadow-md`}
                    onClick={() => setSelected(idx)}
                  >
                    <div
                      className="h-[50%] w-[50%]"
                      dangerouslySetInnerHTML={{
                        __html: illustration(folder.tags[0]),
                      }}
                    />

                    <div className="flex flex-col text-left w-[calc(100%-15rem)]">
                      <div className="flex justify-between items-center w-full">
                        <span className="text-lg font-semibold">
                          {folder.title}
                        </span>
                      </div>

                      <div className="w-[calc(100%-5rem)]">
                        <span>{folder.description}</span>
                      </div>

                      <div className="flex gap-2 mt-2 flex-wrap">
                        {folder.tags.length <= 2 ? (
                          folder.tags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className={`${getRandomColor(
                                darkMode
                              )} px-3 py-1 rounded-lg text-sm`}
                            >
                              {tag}
                            </span>
                          ))
                        ) : (
                          <>
                            {folder.tags.slice(0, 2).map((tag, tIdx) => (
                              <span
                                key={tIdx}
                                className={`${getRandomColor(
                                  darkMode
                                )} px-3 py-1 rounded-lg text-sm`}
                              >
                                {tag}
                              </span>
                            ))}
                            <span
                              className={`${getRandomColor(
                                darkMode
                              )} px-3 py-1 rounded-lg text-sm`}
                            >
                              +{folder.tags.length - 2}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col justify-between items-center ml-auto pl-4">
                      <span
                        className={`w-max p-2 px-4 rounded-md mb-2 ${
                          darkMode
                            ? `${Theme.dark.background}`
                            : `${Theme.light.background}`
                        }`}
                      >
                        Pages: {folder.pages.length}
                      </span>

                      <div className="flex flex-col gap-2 items-center mb-4">
                        <div
                          className="h-5 w-5 rounded-full"
                          style={{ background: folder.color }}
                        />
                        {folder.favorite ? (
                          <FaHeart fill="red" />
                        ) : (
                          <FiHeart fill="white" stroke="black" />
                        )}
                      </div>

                      <div
                        className="h-full w-[0.1px]"
                        style={{ background: darkMode ? "white" : "black" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT PAGES LIST */}
            <div
              className={`p-5 ${
                darkMode
                  ? `${Theme.dark.primary} text-white`
                  : `${Theme.light.secondary} text-black`
              }`}
            >
              <div
                className={`${
                  darkMode ? Theme.dark.background : Theme.light.primary
                } w-full shadow-md p-4 rounded-2xl sticky top-10 flex items-center gap-4 text-left`}
              >
                <div
                  className="h-4 w-4 rounded-full"
                  style={{ background: folders[selected].color }}
                />

                <div className="flex flex-col leading-tight gap-2 w-full">
                  <div className="flex justify-between w-full items-center">
                    <span className="font-semibold text-base">
                      {folders[selected].title}
                    </span>

                    {folders[selected].favorite ? (
                      <FaHeart fill="red" />
                    ) : (
                      <FiHeart />
                    )}
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {folders[selected].tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-xs rounded-md bg-zinc-500/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div
                className={`sticky top-40 mt-5 gap-5 flex flex-col ${
                  darkMode ? Theme.dark.primary : Theme.light.secondary
                }`}
              >
                {folders[selected].pages.map((page, idx) => (
                  <div
                    key={idx}
                    className={`${
                      darkMode ? Theme.dark.secondary : Theme.light.background
                    } shadow p-4 rounded-2xl mb-3 text-left`}
                    onClick={() => {
                      setSelectedPage(idx);
                      setOpen(true);
                    }}
                  >
                    <span className="font-semibold text-lg mt-1">
                      {page.page}
                    </span>

                    <p className="text-sm opacity-80 leading-relaxed my-1 mb-2">
                      {page.pageContent.slice(0, 150)}
                      {page.pageContent.length > 150 ? "..." : ""}
                    </p>

                    <div className="flex gap-2 flex-wrap mb-2">
                      {page.tags?.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-1 text-xs rounded-md bg-zinc-500/20"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="text-xs opacity-50 flex flex-col">
                      <span>
                        Created:{" "}
                        {new Date(page.createdAt).toLocaleDateString("en-UK", {
                          weekday: "long",
                          day: "numeric",
                          month: "short",
                        })}
                      </span>

                      <span>
                        Last Edited:{" "}
                        {new Date(page.editedAt).toLocaleDateString("en-UK", {
                          weekday: "long",
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CREATE MODAL */}
      <AnimatePresence>
        {selectedOption !== "" && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/90 z-9998"
              onClick={() => {
                setSelectedOption("");
                setSelectedTags([]);
              }}
            />

            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.8, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              transition={{ duration: 0.2 }}
              className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-9999 w-max h-max p-5 rounded-xl ${
                darkMode ? Theme.dark.primary : Theme.light.secondary
              } ${darkMode ? "text-white" : "text-black"} shadow-lg`}
            >
              <span className="text-xl font-semibold mb-4">
                {selectedOption === "Folder"
                  ? "Add a new Folder"
                  : "Add a new Topic"}
              </span>

              {selectedOption === "Topic" && (
                <select
                  id="selectFolder"
                  className={`w-full p-2 rounded-md outline-none mt-5 shadow ${
                    darkMode
                      ? "bg-zinc-700 text-white border border-zinc-600"
                      : "bg-white text-black border border-zinc-300"
                  }`}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select Folder
                  </option>
                  {folders.map((folder, idx) => (
                    <option value={folder.title} key={idx}>
                      {folder.title}
                    </option>
                  ))}
                </select>
              )}

              <Input
                onChange={(e) => setTitle(e.target.value)}
                darkMode={darkMode}
                type="text"
                placeholder={`Enter a title for the ${selectedOption}`}
              />

              {selectedOption === "Folder" && (
                <>
                  <Input
                    onChange={(e) => setDescription(e.target.value)}
                    darkMode={darkMode}
                    type="text"
                    placeholder="Enter a description for the Folder"
                    className={`h-26 flex-wrap`}
                  />

                  <div className="flex items-center mt-4 gap-3">
                    <div
                      className={`h-max w-max p-3 ${
                        darkMode ? Theme.dark.secondary : "bg-white"
                      } border rounded-lg border-[#52525c44]`}
                      onClick={() => setFavourite(!favourite)}
                    >
                      {favourite ? <FaHeart fill="red" /> : <FiHeart />}
                    </div>

                    <div
                      className={`w-full ${
                        darkMode ? Theme.dark.secondary : "bg-white"
                      } h-max p-3 flex items-center gap-5 rounded-lg border-[#52525c44] border`}
                    >
                      {COLORS_Light.map((color, idx) => (
                        <div
                          key={idx}
                          className={`h-4 w-4 p-2 rounded-full border transition-all duration-200 ${color} ${
                            selectedColor === color
                              ? "border-blue-500 border-2"
                              : "border-[#52525c44]"
                          }`}
                          onClick={() => setSelectedColor(color)}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center w-lg mt-4 leading-2  flex-wrap gap-2">
                {TAGS.map((tag, idx) => (
                  <div
                    key={idx}
                    className={`${
                      selectedTags.includes(tag)
                        ? "bg-blue-600 text-white"
                        : darkMode
                        ? Theme.dark.secondary + " text-white"
                        : "bg-zinc-400 text-black"
                    } h-max w-max p-3 px-4 rounded-lg transition-all duration-200 cursor-default`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </div>
                ))}
              </div>

              <div>
                <button
                  className={`${Theme.light.accent} w-full p-2 rounded-lg mt-4 text-white font-semibold`}
                  onClick={handleCreate}
                >
                  Create
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* PAGE MODAL */}
      <Pages
        page={folders[selected].pages}
        folder={folders[selected]}
        selected={selectedPage}
        open={open}
        setOpen={setOpen}
        darkMode={darkMode}
        onUpdateTitle={handleUpdateTitle}
      />
    </div>
  );
};

export default FolderDesktop;
