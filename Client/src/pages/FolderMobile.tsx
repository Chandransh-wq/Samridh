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
import Tooltip from "../Components/Tooltip";
import { MdCancel } from "react-icons/md";
import PageMobile from "./PageMobile";
import NotificationMobile from "../Components/notificationMobile";

interface FolderMobileProps {
  darkMode: boolean;
}

const FolderMobile: React.FC<FolderMobileProps> = ({ darkMode }) => {
  const navigate = useNavigate();
  const [folders, setFolders] = useState<folder[]>(folderData);
  const [selected, setSelected] = useState(-1);
  const [selectedPage, setSelectedPage] = useState(-1);
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

  // scroll lock
  useEffect(() => {
    document.body.style.overflowY = selectedOption !== "" ? "hidden" : "auto";
    return () => {
      document.body.style.overflowY = "auto";
    };
  }, [selectedOption]);

  // correct title update logic
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
        title,
        description,
        color: selectedColor || COLORS_Light[0],
        favorite: favourite,
        tags: selectedTags,
        icon: <div></div>,
        pages: [],
      };
      createFolder(newFolder);
      setFolders((prev) => [...prev, newFolder]);
    } else if (selectedOption === "Topic") {
      const select = document.getElementById(
        "selectFolder"
      ) as HTMLSelectElement;

      // correct folderIndex (no off-by-one)
      const folderIndex = select ? Number(select.value) : 0;

      const newPage: Page = {
        id: `page-${Date.now()}`,
        page: title,
        pageContent: "",
        createdAt: new Date().toISOString(),
        editedAt: new Date().toISOString(),
        tags: selectedTags,
      };

      createPage(newPage, folderIndex);

      // avoid mutation
      setFolders((prev) => {
        const updated = [...prev];
        updated[folderIndex] = {
          ...updated[folderIndex],
          pages: [...updated[folderIndex].pages, newPage],
        };
        return updated;
      });
    }

    setSelectedOption("");
    setSelectedTags([]);
    setSelectedColor("");
    setFavourite(false);
    setDialogOpen(false);
  };

  const [openNoti, setOpenNoti] = useState(false);

  // remove problematic effect (fixes loop)
  useEffect(() => {
    if (!open) setSelectedPage(-1);
  }, [open]);

  // scroll to top when folder overlay opens
  useEffect(() => {
    if (selected !== -1) {
      window.scrollTo({ top: 1, behavior: "smooth" });
    }
  }, [selected]);

  return (
    <div
      className={`${
        darkMode ? "bg-[#111111ed]" : "bg-white"
      } w-[calc(100%+4rem)] h-max absolute -left-17 -z-10 overflow-x-hidden`}
    >
      {/* main body */}
      <div
        className={`h-max min-h-screen w-[calc(100%-6rem)] relative left-20 ${
          darkMode ? "bg-zinc-950" : "bg-zinc-50"
        }`}
        style={{
          boxShadow: darkMode
            ? "rgb(255 255 255 / 4%) -1px 10px 20px 0px"
            : "0px 0px 20px #00000042",
        }}
      >
        {/* Header */}
        <div
          className={`flex flex-row justify-between items-center relative z-999 px-5 py-5 ${
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
              <NotificationMobile
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

        {/* MAIN BODY */}
        <div className="flex flex-col gap-10 w-full px-2 mt-5 pb-22">
          {folders.map((folder, idx) => (
            <div
              key={idx}
              className={`${
                darkMode
                  ? `${Theme.dark.primary} shadow-[#52525255]`
                  : Theme.light.secondary
              } gap-4 w-full p-5 rounded-2xl shadow-md grid grid-cols-3`}
              onClick={() => setSelected(idx)}
            >
              <div className="col-span-1 flex items-center justify-center">
                <div
                  className="h-20 w-20"
                  dangerouslySetInnerHTML={{
                    __html: illustration(folder.tags[0]),
                  }}
                />
              </div>

              <div
                className={`col-span-2 flex flex-col ${
                  darkMode ? "text-white" : "text-black"
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-base text-left">
                    {folder.title}
                  </span>
                  {folder.favorite ? <FaHeart fill="red" /> : <FiHeart />}
                </div>

                <span className="text-sm text-zinc-500 text-left">
                  {folder.description.slice(0, 120)}
                  {folder.description.length > 120 ? "..." : ""}
                </span>

                <div className="flex items-center mt-3 gap-3">
                  <div
                    className="h-4 w-4 rounded-full border border-zinc-400"
                    style={{ background: folder.color }}
                  />

                  <div className="flex flex-wrap gap-2">
                    {folder.tags.map((tag, idx2) => (
                      <div
                        key={idx2}
                        className={`px-2 py-1 rounded-md text-xs font-medium ${getRandomColor(
                          darkMode
                        )}`}
                      >
                        {tag}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <AnimatePresence>
          {selected !== -1 && (
            <motion.div
              initial={{ scale: 0, y: 5000 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0, y: 5000 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={`absolute min-h-screen h-full w-full z-9999 top-0 left-0 ${
                darkMode ? Theme.dark.background : Theme.light.background
              } font-semibold text-black ${
                selected !== -1 ? "block" : "hidden"
              }`}
            >
              <div
                className={`flex flex-row w-[calc(100%-2rem)] justify-between fixed items-center text-left mb-16 text-lg z-999 px-5 py-5 ${
                  darkMode
                    ? `${Theme.dark.primary} text-white`
                    : `${Theme.light.secondary} shadow text-black`
                }`}
              >
                {folders[selected]?.title}

                <span
                  className="h-max w-max rounded-full"
                  onClick={() => setSelected(-1)}
                >
                  <MdCancel size={24} />
                </span>
              </div>

              <div className="mt-28 px-3 flex flex-col gap-4 pb-24 ">
                {folders[selected]?.pages.map((page, idx) => (
                  <div
                    key={idx}
                    className={`h-max w-[calc(100%)] shadow-md rounded-lg ${
                      darkMode
                        ? `${Theme.dark.secondary} text-white`
                        : `${Theme.light.secondary} text-black`
                    } p-2`}
                    onClick={() => {
                      setSelectedPage(idx);
                      setOpen(true);
                    }}
                  >
                    <div className="text-left w-full text-lg">{page.page}</div>

                    <div className="w-full text-left font-normal leading-[21px] mt-2">
                      {page.pageContent.slice(0, 125)}
                      {page.pageContent.length > 125 ? "..." : ""}
                    </div>

                    <div className="flex gap-2 text-sm mt-2 flex-wrap">
                      {page.tags.map((tag, idx) => (
                        <div
                          key={idx}
                          className={`p-1 px-2 rounded-lg ${
                            darkMode ? "bg-zinc-400/50" : "bg-zinc-400/50"
                          }`}
                        >
                          {tag}
                        </div>
                      ))}
                    </div>

                    <div className="text-xs opacity-50 flex flex-col font-normal text-left mt-2">
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
            </motion.div>
          )}
        </AnimatePresence>

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
      </div>

      {/* CREATE FOLDER/TOPIC MODAL */}
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
              className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-9999 w-[calc(100%-2rem)] h-max p-5 rounded-xl ${
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
                  className={`w-max p-2 rounded-md outline-none mt-5 shadow ${
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
                    <option value={idx} key={idx}>
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
                      className={`w-[calc(100%-3rem)] ${
                        darkMode ? Theme.dark.secondary : "bg-white"
                      } h-max p-3 flex items-center flex-wrap gap-5 rounded-lg border-[#52525c44] border`}
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

              <div className="flex items-center w-full mt-4 leading-2 flex-wrap gap-2">
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
      {selected > -1 && (
        <PageMobile
          page={folders[selected].pages}
          folder={folders[selected]}
          selected={selectedPage}
          open={open}
          setOpen={setOpen}
          darkMode={darkMode}
          onUpdateTitle={handleUpdateTitle}
        />
      )}
    </div>
  );
};

export default FolderMobile;
