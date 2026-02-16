import React, { useEffect, useState } from "react";
import { FaBell, FaHeart, FaPlus } from "react-icons/fa";
import { Theme } from "../assets/Theme";
import { TAGS, type Page, type folder } from "../assets/DemoData";
import {
  COLORS_Light,
  getRandomColor,
  illustration,
} from "../assets/BaasicFunctions";
import { FiHeart, FiLogOut, FiTrash } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../utils/authServies";
import DropDown from "../Components/DropDown";
import { AnimatePresence, motion } from "framer-motion";
import Input from "../Components/Input";
import Pages from "./Page";
import Notification from "../Components/notification";
import Tooltip from "../Components/Tooltip";
import {
  createFolder,
  createPage,
  deleteFolder,
  updateFolder,
} from "../assets/Services/user.service";
import { toast } from "../utils/Toast";
import { useFolders } from "../assets/hooks/useFolder";
// @ts-ignore: Suppression of casing error
import Loader from "../Components/Loader";

interface FolderProps {
  darkMode: boolean;
}

export interface sendPage {
  title: string;
  pageContent: string;
  tags: string[];
}

const FolderDesktop: React.FC<FolderProps> = ({ darkMode }) => {
  const { folders, setFolders, loading, refreshFolders } = useFolders();

  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedPage, setSelectedPage] = useState(0);
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState("");
  const [favourite, setFavourite] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [save, setSaved] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    const refresh = async () => {
      if (save) await refreshFolders();
      if (deleted) await refreshFolders();

      setSaved(false);
      setDeleted(false);
    };
    refresh();
  }, [save, deleted]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  useEffect(() => {
    document.body.style.overflowY = selectedOption !== "" ? "hidden" : "auto";
  }, [selectedOption]);

  const handleUpdateTitle = (
    pageIndex: number,
    newTitle: string,
    newContent?: string,
  ) => {
    if (selected === null) return;

    setFolders((prev) => {
      const updated = [...prev];

      // @ts-ignore: selected might be viewed as null/any by the compiler here
      const targetFolder = updated[selected];

      if (!targetFolder) return prev;

      const folderCopy = { ...targetFolder };
      const content = newContent ?? folderCopy.pages[pageIndex].pageContent;

      folderCopy.pages = [...folderCopy.pages];
      folderCopy.pages[pageIndex] = {
        ...folderCopy.pages[pageIndex],
        page: newTitle,
        pageContent: content,
        updatedAt: new Date().toISOString(),
      };

      // @ts-ignore: ignoring index type check
      updated[selected] = folderCopy;
      return updated;
    });
  };

  const handleCreate = async () => {
    try {
      if (selectedOption === "Folder") {
        const newFolder: folder = {
          title: title,
          description: description,
          color: selectedColor || COLORS_Light[0],
          favorite: favourite,
          updatedAt: `Date.now()`,
          tags: selectedTags,
          icon: <div></div>,
          pages: [],
        };
        await createFolder(newFolder, darkMode);
        setFolders((prev) => [...prev, newFolder]);
      } else {
        const newPage: sendPage = {
          title: activeFolder.pages.length == 0 ? " " : "Untitled",
          pageContent: "",
          tags: selectedTags,
        };
        await createPage(newPage, darkMode, activeFolder._id ?? "");
      }
      await refreshFolders();
      setSelectedOption("");
      setSelectedTags([]);
      setSelectedColor("");
      setFavourite(false);
      setDialogOpen(false);
    } catch (error) {
      console.log(error);
      toast.error("Error", "There was an error", darkMode);
    }
  };
  const [openNoti, setOpenNoti] = useState(false);
  const activeFolder = folders.find((f) => f._id === selected) || folders[0];

  const handleDelete = async () => {
    try {
      await deleteFolder(activeFolder._id ?? "", darkMode, activeFolder.title);
      await refreshFolders();
      setShowDialog(false);
    } catch (error) {
      toast.error("Error", "There was an error", darkMode);
      console.log(error);
    }
  };

  const updateFavorite = async () => {
    const folderId = activeFolder._id;
    if (!folderId) return;

    // 1. Capture original state for rollback
    const previousFavorite = activeFolder.favorite;
    const newFavorite = !previousFavorite;

    // 2. IMMEDIATE UI UPDATE
    // This updates the global 'folders' state instantly
    setFolders((prev) =>
      prev.map((f) =>
        f._id === folderId ? { ...f, favorite: newFavorite } : f,
      ),
    );

    try {
      const updatedFolder: folder = {
        ...activeFolder,
        favorite: newFavorite,
      };

      // 3. Run API call in background (removed 'response' capture if not needed immediately)
      await updateFolder(updatedFolder, darkMode, folderId);

      // 4. Background sync (no 'await' here so UI isn't blocked)
      refreshFolders();
    } catch (error) {
      // 5. ROLLBACK on error
      setFolders((prev) =>
        prev.map((f) =>
          f._id === folderId ? { ...f, favorite: previousFavorite } : f,
        ),
      );
      console.error("Failed to update favorite status:", error);
      // Optional: add a toast notice here
    }
  };

  return (
    <div>
      <div
        className={`${
          darkMode ? "bg-[#111111ed]" : "bg-white"
        } w-screen min-h-screen absolute left-0 z-0 flex flex-col gap-4`}
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
            className={`flex flex-row justify-between items-center relative z-20 px-16 py-5 ${
              darkMode
                ? `${Theme.dark.primary} text-white`
                : `${Theme.light.secondary} shadow text-black`
            }`}
          >
            <span className="font-bold text-lg">FOLDERS</span>
            <div className="flex gap-5 z-35 relative">
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
              className={`right-32 top-[4.5rem] z-25 rounded-t-none ${
                darkMode ? Theme.dark.secondary : "bg-gray-500"
              }`}
              elements={[
                {
                  name: "Folder",
                  setSelectedOption: (value) => setSelectedOption(value),
                },
              ]}
            />
          )}

          {/* MAIN GRID */}
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="Loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-[80vh] w-full items-center justify-center"
              >
                <Loader darkMode={darkMode} />
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="min-h-[calc(100%-5rem)] grid grid-cols-3 gap-8 p-6"
              >
                {/* LEFT COLUMN: DYNAMIC FOLDERS */}
                <div className="col-span-2">
                  {/* Logic: columns-2 creates the masonry effect where heights vary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div className="flex flex-col gap-6">
                      {folders
                        .filter((_, i) => i % 2 === 0)
                        .map((folder, idx) => (
                          <motion.div
                            key={folder._id || idx}
                            layout // Logic: Smoothly animates size changes
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => setSelected(folder._id ?? "")}
                            className={`break-inside-avoid inline-block w-full p-6 rounded-4xl border transition-all duration-300 cursor-pointer group relative
                ${darkMode ? "bg-zinc-900 border-zinc-800 hover:border-zinc-700" : "bg-white border-zinc-200 shadow-sm hover:shadow-xl"}
                ${selected === folder._id ? "ring-2 ring-blue-500 border-transparent shadow-2xl shadow-blue-500/10" : ""}
              `}
                          >
                            {/* Selection Glow */}
                            {selected === folder._id && (
                              <div className="absolute inset-0 bg-blue-500/5 rounded-4xl pointer-events-none" />
                            )}

                            {/* Folder Header */}
                            <div className="flex justify-between relative z-2 items-start mb-4">
                              <div
                                className="h-84 w-84 rounded-2xl bg-zinc-500/10 p-2 flex items-center justify-center"
                                dangerouslySetInnerHTML={{
                                  __html: illustration(folder.tags[0]),
                                }}
                              />
                              <div className="flex flex-col items-end gap-2">
                                <div
                                  className="h-5 w-5 rounded-full shadow-lg"
                                  style={{ background: folder.color }}
                                />
                                {folder.favorite ? (
                                  <FaHeart className="text-red-500 drop-shadow-md scale-110" />
                                ) : (
                                  <FiHeart
                                    size={18}
                                    className={`${darkMode ? "text-zinc-500" : "text-zinc-400"} hover:text-red-400 transition-colors`}
                                  />
                                )}
                              </div>
                            </div>

                            {/* Content Area - Variable Height */}
                            <div className="text-left">
                              <h3
                                className={`text-xl font-bold ${selected === folder._id ? "text-blue-600" : darkMode ? "text-white" : "text-black"} tracking-tight mb-2 group-hover:text-blue-500 transition-colors`}
                              >
                                {folder.title}
                              </h3>
                              {/* Logic: No line-clamp here allows the card to grow with the text length */}
                              <p
                                className={`text-sm leading-relaxed mb-5 ${darkMode ? "text-zinc-400" : "text-zinc-600"}`}
                              >
                                {folder.description ||
                                  "Project workspace and resources."}
                              </p>
                            </div>

                            {/* Tags & Meta */}
                            <div className="flex flex-col gap-4">
                              <div className="flex gap-2 flex-wrap">
                                {folder.tags.map((tag, tIdx) => (
                                  <span
                                    key={tIdx}
                                    className={` px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white`}
                                    style={{
                                      background: getRandomColor(darkMode),
                                    }}
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>

                              <div
                                className={`flex justify-between items-center pt-4 border-t border-zinc-500/10 ${darkMode ? "text-white" : "text-black"}`}
                              >
                                <span className="text-[10px] font-semibold uppercase tracking-tighter opacity-50">
                                  {folder.pages.length} Documents
                                </span>
                                <span className="text-[10px] opacity-50 font-mono">
                                  {new Date(
                                    folder.updatedAt || Date.now(),
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                    </div>
                    <div className="flex flex-col gap-6">
                      {folders
                        .filter((_, i) => i % 2 !== 0)
                        .map((folder, idx) => (
                          <motion.div
                            key={folder._id || idx}
                            layout // Logic: Smoothly animates size changes
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => setSelected(folder._id ?? "")}
                            className={`break-inside-avoid inline-block w-full p-6 rounded-4xl border transition-all duration-300 cursor-pointer group relative
                ${darkMode ? "bg-zinc-900 border-zinc-800 hover:border-zinc-700" : "bg-white border-zinc-200 shadow-sm hover:shadow-xl"}
                ${selected === folder._id ? "ring-2 ring-blue-500 border-transparent shadow-2xl shadow-blue-500/10" : ""}
              `}
                          >
                            {/* Selection Glow */}
                            {selected === folder._id && (
                              <div className="absolute inset-0 bg-blue-500/5 rounded-4xl pointer-events-none" />
                            )}

                            {/* Folder Header */}
                            <div className="flex justify-between items-start mb-4">
                              <div
                                className="h-84 w-84 rounded-2xl bg-zinc-500/10 p-2 flex items-center justify-center"
                                dangerouslySetInnerHTML={{
                                  __html: illustration(folder.tags[0]),
                                }}
                              />
                              <div className="flex flex-col items-end gap-2">
                                <div
                                  className="h-5 w-5 rounded-full shadow-lg"
                                  style={{ background: folder.color }}
                                />
                                {folder.favorite ? (
                                  <FaHeart className="text-red-500 drop-shadow-md scale-110" />
                                ) : (
                                  <FiHeart
                                    size={18}
                                    className={`${darkMode ? "text-zinc-500" : "text-zinc-400"} hover:text-red-400 transition-colors`}
                                  />
                                )}
                              </div>
                            </div>

                            {/* Content Area - Variable Height */}
                            <div className="text-left">
                              <h3
                                className={`text-xl font-bold ${selected === folder._id ? "text-blue-600" : darkMode ? "text-white" : "text-black"} tracking-tight mb-2 group-hover:text-blue-500 transition-colors`}
                              >
                                {folder.title}
                              </h3>
                              {/* Logic: No line-clamp here allows the card to grow with the text length */}
                              <p
                                className={`text-sm leading-relaxed mb-5 ${darkMode ? "text-zinc-400" : "text-zinc-600"}`}
                              >
                                {folder.description ||
                                  "Project workspace and resources."}
                              </p>
                            </div>

                            {/* Tags & Meta */}
                            <div className="flex flex-col gap-4">
                              <div className="flex gap-2 flex-wrap">
                                {folder.tags.map((tag, tIdx) => (
                                  <span
                                    key={tIdx}
                                    className={` px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white`}
                                    style={{
                                      background: getRandomColor(darkMode),
                                    }}
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>

                              <div
                                className={`flex justify-between items-center pt-4 border-t border-zinc-500/10 ${darkMode ? "text-white" : "text-black"}`}
                              >
                                <span className="text-[10px] font-semibold uppercase tracking-tighter opacity-50">
                                  {folder.pages.length} Documents
                                </span>
                                <span className="text-[10px] opacity-50 font-mono">
                                  {new Date(
                                    folder.updatedAt || Date.now(),
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: STICKY PAGES PREVIEW */}
                {/* RIGHT PAGES LIST */}
                <div
                  className={`p-5 ${
                    darkMode
                      ? `${Theme.dark.primary} text-white`
                      : `${Theme.light.secondary} text-black`
                  }`}
                >
                  {/* TOP STICKY HEADER - Added layoutId for smooth switching */}
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={activeFolder?._id} // Logic: Re-animates when folder changes
                    className={`${
                      darkMode ? Theme.dark.background : Theme.light.primary
                    } w-full shadow-md p-4 rounded-2xl sticky top-10 z-20 flex items-center gap-4 text-left transition-colors duration-300`}
                  >
                    <motion.div
                      layoutId="active-indicator"
                      className="h-4 w-4 rounded-full shadow-sm"
                      style={{
                        background: activeFolder?.color || "#3b82f6",
                      }}
                    />

                    <div className="flex flex-col leading-tight gap-2 w-full">
                      <div className="flex justify-between w-full items-center">
                        <span className="font-semibold text-base tracking-tight">
                          {activeFolder?.title || "Select a Folder"}
                        </span>
                        <div className="flex items-center gap-1">
                          <div
                            className="h-max w-max p-1.5 bg-red-300 rounded-full hover:scale-105 transition-all duration-100"
                            onClick={() => setShowDialog(true)}
                          >
                            <FiTrash
                              size={12}
                              className="text-red-950 relative left-[0.1px]"
                            />
                          </div>
                          <motion.div
                            whileTap={{ scale: 0.8 }}
                            whileHover={{ scale: 1.1 }}
                            className="flex items-center"
                            onClick={() => updateFavorite()}
                          >
                            {activeFolder?.favorite ||
                            activeFolder?.favorite ? (
                              <FaHeart className="text-red-500 drop-shadow-sm" />
                            ) : (
                              <FiHeart
                                className={
                                  darkMode ? "text-zinc-500" : "text-zinc-400"
                                }
                              />
                            )}
                          </motion.div>
                        </div>
                        <AnimatePresence>
                          {showDialog && (
                            <div className="fixed inset-0 flex items-center justify-center p-4 z-9999">
                              {/* 1. BACKDROP */}
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowDialog(false)}
                                className={`absolute inset-0  bg-black/40 backdrop-blur-sm`}
                              />

                              {/* 2. DIALOG CARD */}
                              <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className={`relative z-90 w-full max-w-md overflow-hidden rounded-xl  p-6 shadow-2xl ${darkMode ? "dark:bg-zinc-900" : "bg-white"}`}
                              >
                                <h2
                                  className={`text-xl font-semibold ${darkMode ? "text-zinc-100" : "text-zinc-900"}`}
                                >
                                  Confirm Deletion
                                </h2>
                                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                                  Are you sure you want to delete{" "}
                                  <span
                                    className={`font-medium ${darkMode ? "text-zinc-200" : "text-zinc-900"}`}
                                  >
                                    {activeFolder.title}
                                  </span>
                                  ? This action cannot be undone.
                                </p>

                                {/* 3. ACTION BUTTONS */}
                                <div className="mt-6 flex justify-end gap-3">
                                  <button
                                    onClick={() => setShowDialog(false)}
                                    className={`rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition-colors duration-200 ${!darkMode ? "hover:bg-zinc-200 dark:text-zinc-400" : "hover:bg-zinc-800"}    `}
                                  >
                                    No, cancel
                                  </button>
                                  <button
                                    onClick={() => handleDelete()}
                                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 active:bg-red-800"
                                  >
                                    Yes, delete page
                                  </button>
                                </div>
                              </motion.div>
                            </div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        {activeFolder?.tags?.map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md bg-zinc-500/20 opacity-70"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>

                  {/* PAGES LIST - Ticket Style */}
                  <div
                    className={`sticky top-40 mt-5 gap-5 flex flex-col ${
                      darkMode ? Theme.dark.primary : Theme.light.secondary
                    }`}
                  >
                    <AnimatePresence mode="popLayout">
                      {activeFolder?.pages && activeFolder.pages.length > 0 ? (
                        activeFolder.pages.map((page: Page, idx) => (
                          <motion.div
                            key={page._id || idx}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{
                              delay: idx * 0.05,
                              type: "spring",
                              stiffness: 100,
                            }}
                            whileHover={{ scale: 1.02, x: -5 }}
                            whileTap={{ scale: 0.98 }}
                            /* Added 'relative' and 'overflow-hidden' for the ticket holes */
                            className={`${
                              darkMode
                                ? Theme.dark.secondary
                                : Theme.light.background
                            } shadow-sm border border-transparent hover:border-blue-500/30 p-4 rounded-md mb-3 text-left cursor-pointer transition-all duration-200 relative overflow-hidden`}
                            onClick={() => {
                              setSelectedPage(idx);
                              setOpen(true);
                            }}
                          >
                            {/* LEFT HOLE - The 'Ticket' Cut-out */}
                            <div
                              className={`absolute bottom-[55px] -left-3 h-6 w-6 rounded-full z-10 shadow-inner ${
                                darkMode ? "bg-[#111111ed]" : "bg-zinc-200"
                              }`}
                            />

                            {/* RIGHT HOLE */}
                            <div
                              className={`absolute bottom-[55px] -right-3 h-6 w-6 rounded-full z-10 shadow-inner ${
                                darkMode ? "bg-[#111111ed]" : "bg-zinc-200"
                              }`}
                            />

                            <span className="font-semibold text-lg mt-1 block">
                              {page.page}
                            </span>

                            <p className="text-sm opacity-60 leading-relaxed my-1 mb-2 line-clamp-2">
                              {page?.pageContent ||
                                "No content summary available."}
                            </p>

                            <div className="flex gap-2 flex-wrap mb-3">
                              {page.tags?.map((tag, tIdx) => (
                                <span
                                  key={tIdx}
                                  className="px-2 py-1 text-[10px] font-black uppercase rounded bg-blue-500/10 text-blue-500"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>

                            {/* TICKET PERFORATION - Changed border-t to dashed and increased margin */}
                            <div className="text-[10px] flex flex-col gap-1 font-mono border-t-2 border-dashed border-zinc-500/20 pt-4 mt-2">
                              {/* Created Date */}
                              <span
                                className={`flex justify-between opacity-60 uppercase text-[10px] tracking-tighter ${
                                  darkMode ? "text-white" : "text-black"
                                }`}
                              >
                                <span>Created</span>
                                <span>
                                  {new Date(
                                    page.createdAt || Date.now(),
                                  ).toLocaleString("en-UK", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}
                                </span>
                              </span>

                              {/* Edited Date */}
                              <span
                                className={`flex justify-between font-bold uppercase tracking-tighter ${
                                  darkMode ? "text-blue-400" : "text-blue-600"
                                }`}
                              >
                                <span>Last Edited</span>
                                <span>
                                  {new Date(
                                    page.updatedAt || Date.now(),
                                  ).toLocaleString("en-UK", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}
                                </span>
                              </span>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.5 }}
                          className="mt-32 text-center cursor-crosshair flex flex-col items-center gap-2"
                        >
                          <div
                            className="h-10 w-10 rounded-full border-2 border-dashed border-zinc-500 flex items-center justify-center text-black hover:rotate-90 transition-all duration-500"
                            onClick={() => {
                              setSelected(activeFolder._id ?? "");
                              handleCreate();
                            }}
                          >
                            <span
                              className={`${darkMode ? "text-white" : "text-black"} text-xl relative -top-0.5`}
                            >
                              +
                            </span>
                          </div>
                          <span
                            className={`text-sm italic ${darkMode ? "text-white" : "text-black"}`}
                          >
                            No Pages created in this folder
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
                          className={`h-4 w-4 p-2 rounded-full border transition-all duration-200 ${
                            selectedColor === color
                              ? "border-blue-500 border-2"
                              : "border-[#52525c44]"
                          }`}
                          style={{ background: color }}
                          onClick={() => setSelectedColor(color)}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-2 mt-4 flex-wrap max-w-100 max-h-40 overflow-y-auto myscrollbar p-1">
                {/* 1. RENDER EXISTING PRESETS */}
                {selectedTags.map((tag, idx) => (
                  <button
                    key={idx}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all border border-zinc-300 ${
                      selectedTags.includes(tag)
                        ? "bg-blue-500 text-white shadow-md scale-105"
                        : `${darkMode ? "bg-zinc-800 text-zinc-400" : "bg-zinc-100 text-zinc-500"} hover:scale-105`
                    }`}
                  >
                    {tag}
                  </button>
                ))}
                {TAGS.filter((tag) => !selectedTags.includes(tag)).map(
                  (tag, tIdx) => (
                    <button
                      key={tIdx}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all border border-zinc-300 ${
                        selectedTags.includes(tag)
                          ? "bg-blue-500 text-white shadow-md scale-105"
                          : `${darkMode ? "bg-zinc-800 text-zinc-400" : "bg-zinc-100 text-zinc-500"} hover:scale-105`
                      }`}
                    >
                      {tag}
                    </button>
                  ),
                )}

                {/* 2. THE "CUSTOM PUNCH" INPUT */}
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="+ Custom Tag"
                    className={`px-3 py-1 rounded-full text-xs font-bold outline-none border-2 border-dashed transition-all w-28 focus:w-40 ${
                      darkMode
                        ? "bg-transparent border-zinc-700 text-blue-400 focus:border-blue-500"
                        : "bg-transparent border-zinc-300 text-blue-600 focus:border-blue-500"
                    }`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const newTag = e.currentTarget.value.trim();
                        if (newTag && !selectedTags.includes(newTag)) {
                          toggleTag(newTag); // Add to selection
                          e.currentTarget.value = ""; // Clear input
                        }
                      }
                    }}
                    onBlur={(e) => {
                      const newTag = e.currentTarget.value.trim();
                      if (newTag && !selectedTags.includes(newTag)) {
                        toggleTag(newTag); // Add to selection
                        e.currentTarget.value = ""; // Clear input
                      }
                    }}
                  />
                </div>
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
        page={activeFolder?.pages}
        folder={activeFolder}
        selected={selectedPage}
        open={open}
        setOpen={setOpen}
        darkMode={darkMode}
        onUpdateTitle={handleUpdateTitle}
        setSaved={setSaved}
        setDeleted={setDeleted}
      />
    </div>
  );
};

export default FolderDesktop;
