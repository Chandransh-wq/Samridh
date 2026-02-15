import React, { useEffect, useState, useMemo } from "react";
import { FaBell, FaHeart, FaPlus } from "react-icons/fa";
import { Theme } from "../assets/Theme";
import {
  COLORS_Light,
  getRandomColor,
  illustration,
} from "../assets/BaasicFunctions";
import { FiHeart, FiLogOut, FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../utils/authServies";
import { AnimatePresence, motion } from "framer-motion";
import PageMobile from "./PageMobile";
import { useFolders } from "../assets/hooks/useFolder";
import { createFolder, createPage } from "../assets/Services/user.service";
import Tooltip from "../Components/Tooltip";
import NotificationMobile from "../Components/notificationMobile";
import DropDown from "../Components/DropDown";
import { MdCancel } from "react-icons/md";
import Input from "../Components/Input";
import { TAGS, type folder } from "../assets/DemoData";
import Loader from "../Components/Loader";
import type { sendPage } from "./FolderDesktop";
import { toast } from "../utils/Toast";

interface FolderMobileProps {
  darkMode: boolean;
}

const FolderMobile: React.FC<FolderMobileProps> = ({ darkMode }) => {
  const navigate = useNavigate();
  const { folders, setFolders, loading, refreshFolders } = useFolders();
  const [selected, setSelected] = useState<string | null>(null);

  console.log(selected);

  // Logic: Use _id for selection to prevent Masonry/Filter bugs
  const [selectedId, setSelectedId] = useState<string | null>("");

  const [selectedPageIdx, setSelectedPageIdx] = useState(-1);
  const [openNoti, setOpenNoti] = useState(false);
  const [open, setOpen] = useState(false);

  const [selectedOption, setSelectedOption] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState("");
  const [favourite, setFavourite] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [save, setSaved] = useState(false);

  useEffect(() => {
    const refresh = async () => {
      if (save) await refreshFolders();

      setSaved(false);
    };
    refresh();
  }, [save]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  // Logic: Find the active folder object for the Page View
  const activeFolder = useMemo(
    () => folders.find((f) => f._id === selectedId) || folders[0],
    [folders, selectedId],
  );

  // Scroll lock for dialogs
  useEffect(() => {
    document.body.style.overflowY =
      selectedOption !== "" || open ? "hidden" : "auto";
    return () => {
      document.body.style.overflowY = "auto";
    };
  }, [selectedOption, open]);

  // Logic: Immutable update using .map() to avoid reference bugs
  const handleUpdateTitle = (
    pageIndex: number,
    newTitle: string,
    newContent?: string,
  ) => {
    setFolders((prev) =>
      prev.map((f) => {
        if (f._id !== selectedId) return f;

        const updatedPages = [...f.pages];
        updatedPages[pageIndex] = {
          ...updatedPages[pageIndex],
          page: newTitle,
          pageContent: newContent ?? updatedPages[pageIndex].pageContent,
          updatedAt: new Date().toISOString(),
        };

        return { ...f, pages: updatedPages };
      }),
    );
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

  if (loading)
    return (
      <div className="flex h-screen w-screen bg-white items-center justify-center">
        <Loader darkMode={darkMode} />
      </div>
    );

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

          <div
            className="flex gap-5 z-50 relative"
            onClick={() => setSelectedOption("Folder")}
          >
            <span className="h-max w-max rounded-full hover:bg-zinc-800/30 bg-zinc-400/50 p-2 transition-all group duration-75">
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
              onClick={() => setSelectedId(folder._id ?? "")}
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
                          darkMode,
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

        <AnimatePresence mode="wait">
          {selectedId && selectedId !== "" && (
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`fixed inset-0 z-[9999] overflow-y-auto ${
                darkMode ? "bg-zinc-950" : "bg-zinc-50"
              } font-semibold`}
            >
              {/* STICKY HEADER */}
              <div
                className={`flex flex-row w-full justify-between fixed top-0 items-center text-left text-lg z-[10000] px-5 py-6 backdrop-blur-md ${
                  darkMode
                    ? "bg-zinc-900/90 text-white border-b border-white/5"
                    : "bg-white/90 shadow-sm text-black"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-3 w-3 rounded-full animate-pulse"
                    style={{ background: activeFolder?.color || "#3b82f6" }}
                  />
                  <span className="tracking-tight font-bold">
                    {activeFolder?.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="h-max w-max p-1 rounded-full border-2 border-dashed border-zinc-500 flex items-center justify-center text-black hover:rotate-90 transition-all duration-500"
                    onClick={() => {
                      setSelected(activeFolder._id ?? "");
                      handleCreate();
                    }}
                  >
                    <span
                      className={`${darkMode ? "text-white" : "text-black"} relative `}
                    >
                      <FiPlus size={20} />
                    </span>
                  </div>
                  <motion.span
                    whileTap={{ scale: 0.8 }}
                    className="p-1 transition-opacity"
                    onClick={() => setSelectedId("")}
                  >
                    <MdCancel size={28} className="text-red-500" />
                  </motion.span>
                </div>
              </div>

              {/* TICKET LIST AREA */}
              <div className="mt-28 px-4 flex flex-col gap-6 pb-32">
                <AnimatePresence mode="popLayout">
                  {activeFolder?.pages.map((page, idx) => (
                    <motion.div
                      key={page._id || idx}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative overflow-hidden p-5 rounded-lg shadow-md border ${
                        darkMode
                          ? "bg-zinc-900 border-zinc-800 text-white"
                          : "bg-white border-zinc-100 text-black"
                      }`}
                      onClick={() => {
                        setSelectedPageIdx(idx);
                        setOpen(true);
                      }}
                    >
                      {/* TICKET CUT-OUTS (Holes) */}
                      <div
                        className={`absolute top-[60%] -left-3 h-6 w-6 rounded-full z-10 ${darkMode ? "bg-zinc-950" : "bg-zinc-200"}`}
                      />
                      <div
                        className={`absolute top-[60%] -right-3 h-6 w-6 rounded-full z-10 ${darkMode ? "bg-zinc-950" : "bg-zinc-200"}`}
                      />

                      <div className="text-left w-full text-xl font-bold tracking-tight mb-2">
                        {page.page}
                      </div>

                      <p className="w-full text-left font-normal text-sm opacity-60 leading-relaxed line-clamp-3">
                        {page.pageContent || "No content summary available."}
                      </p>

                      {/* TAGS */}
                      <div className="flex gap-2 text-[10px] mt-4 flex-wrap">
                        {page.tags.map((tag, tIdx) => (
                          <div
                            key={tIdx}
                            className="p-1 px-2 font-black uppercase tracking-wider rounded-md bg-blue-500/10 text-blue-500"
                          >
                            {tag}
                          </div>
                        ))}
                      </div>

                      {/* TICKET PERFORATION & METADATA */}
                      <div className="text-[10px] flex flex-col gap-1 font-mono border-t-2 border-dashed border-zinc-500/10 pt-4 mt-4">
                        <span className="flex justify-between opacity-30 uppercase tracking-tighter">
                          <span>Created</span>
                          <span>
                            {new Date(
                              page.createdAt || Date.now(),
                            ).toLocaleDateString("en-UK", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </span>

                        <span
                          className={`flex justify-between font-bold uppercase tracking-tighter ${darkMode ? "text-blue-400" : "text-blue-600"}`}
                        >
                          <span>Edited</span>
                          <span>
                            {new Date(
                              page.updatedAt || page.createdAt || Date.now(),
                            ).toLocaleString("en-UK", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </span>
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
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
              className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-9999 w-[calc(100%-1rem)] h-max p-5 rounded-xl ${
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
                      className={`w-full pr-5 ${
                        darkMode ? Theme.dark.secondary : "bg-white"
                      } h-max p-3 flex flex-wrap items-center gap-5 rounded-lg border-[#52525c44] border`}
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
      {selectedId !== "" && (
        <PageMobile
          page={activeFolder?.pages}
          folder={activeFolder}
          selected={selectedPageIdx}
          open={open}
          setOpen={setOpen}
          darkMode={darkMode}
          onUpdateTitle={handleUpdateTitle}
          setSaved={setSaved}
        />
      )}
    </div>
  );
};

export default FolderMobile;
