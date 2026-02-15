import React, { useEffect, useState } from "react";
import { TAGS, type folder, type Page as PageType } from "../assets/DemoData";
import { Theme } from "../assets/Theme";
import { AnimatePresence, motion } from "framer-motion";
import Toolbar from "../Components/Toolbar";
import { FiDownload, FiSave, FiSearch, FiTag } from "react-icons/fi";
import Tooltip from "../Components/Tooltip";
import { updatePage } from "../assets/Services/user.service";
import type { sendPage } from "./FolderDesktop";
import { useFolders } from "../assets/hooks/useFolder";

interface PageProps {
  page: PageType[];
  folder: folder;
  selected?: number;
  open: boolean;
  setOpen: (value: boolean) => void;
  darkMode: boolean;
  setSaved: (value: boolean) => void;

  onUpdateTitle: (
    pageIndex: number,
    newTitle: string,
    newContent?: string,
  ) => void;
}

const Pages: React.FC<PageProps> = ({
  page,
  folder,
  selected,
  open,
  setOpen,
  darkMode,
  onUpdateTitle,
  setSaved,
}) => {
  const [index, setIndex] = useState(selected ?? 0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagDialog, setTagDialog] = useState(false);
  const { refreshFolders } = useFolders();

  useEffect(() => {
    if (open) document.body.style.overflowY = "hidden";
    else document.body.style.overflowY = "auto";

    return () => {
      document.body.style.overflowY = "auto";
    };
  }, [open]);

  const [editingTitle, setEditingTitle] = useState(false);
  const [editingContent, setEditingContent] = useState(false);
  // 1. Safe state initialization
  const [title, setTitle] = useState(
    page && page[index] ? page[index].page : "",
  );
  const [content, setContent] = useState(
    page && page[index] ? page[index].pageContent : "",
  );

  useEffect(() => {
    if (content.length > 1650) console.log("Stop");
  }, [content]);

  // 2. Safe useEffect sync (Line 46)
  useEffect(() => {
    if (page && page[index]) {
      setTitle(page[index].page);
      setContent(page[index].pageContent);
    }
  }, [index, page]);

  const saveTitle = () => {
    onUpdateTitle(index, title, content);
    setEditingTitle(false);
  };

  const saveContent = () => {
    onUpdateTitle(index, title, content);
    setEditingContent(false);
  };
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const save = async () => {
    try {
      const updatedPage: sendPage = {
        title: title,
        pageContent: content,
        tags: selectedTags,
      };
      await updatePage(updatedPage, darkMode, page[index]._id ?? "");
      setSaved(true);
      setTagDialog(false);
    } catch (error) {
      console.log(error);
    }
    await refreshFolders();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-9999"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* BACKDROP */}
          <motion.div
            className={`fixed inset-0 ${
              darkMode ? `bg-zinc-950/20` : `bg-black/40`
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />

          {/* SLIDE-UP MODAL */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              type: "tween",
              stiffness: 100,
              damping: 20,
            }}
            className={`${
              darkMode
                ? `${Theme.dark.secondary} text-white`
                : `${Theme.light.secondary} text-black`
            } p-5 pb-0 shadow-xl fixed top-0 left-8 w-[calc(100%-6rem)] h-full overflow-y-auto flex flex-col gap-5 myscrollbar`}
          >
            {/* HEADER */}
            <div className="flex justify-between items-center mb-1">
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => setOpen(false)}
                  className="px-4 py-1.5 bg-red-500/10 text-red-500 font-bold rounded-full text-xs uppercase tracking-widest transition-all duration-400 hover:bg-red-500 hover:text-white"
                >
                  Close
                </button>

                <button
                  className={`shadow-lg p-2 rounded-full bg-blue-400 text-white h-max w-max cursor-pointer group hover:scale-105 transition flex justify-center items-center
            ${darkMode ? "border-[#626161]" : "border-black"}
          `}
                >
                  <FiDownload />
                  <Tooltip
                    text="Download the document"
                    darkMode={darkMode}
                    className="-top-1/2"
                  />
                </button>
                <button
                  className={`shadow-lg p-2 rounded-full bg-blue-400 text-white h-max w-max cursor-pointer group hover:scale-105 transition flex justify-center items-center
            ${darkMode ? "border-[#626161]" : "border-black"}
          `}
                >
                  <FiSearch />
                  <Tooltip
                    text="Search the web"
                    darkMode={darkMode}
                    className="-top-1/2"
                  />
                </button>
                <button
                  className={`shadow-lg p-2 rounded-full bg-blue-400 text-white h-max w-max cursor-pointer group hover:scale-105 transition flex justify-center items-center
            ${darkMode ? "border-[#626161]" : "border-black"}
          `}
                  onClick={() => setTagDialog((prev) => !prev)}
                >
                  <FiTag />
                  <Tooltip
                    text="Add a tag"
                    darkMode={darkMode}
                    className="-top-1/2"
                  />
                </button>
                <div
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                      setTagDialog(false);
                    }
                  }}
                >
                  <AnimatePresence>
                    {tagDialog && (
                      <motion.div
                        // 1. BLUR & FOCUS MANAGEMENT
                        tabIndex={-1}
                        autoFocus
                        // 2. ENTRANCE ANIMATION
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className={`absolute top-16 left-5 p-3 rounded-b-2xl shadow-2xl border backdrop-blur-md flex flex-wrap gap-2 z-50 w-59 outline-none ${
                          darkMode
                            ? "bg-zinc-900/90 border-zinc-700 shadow-black/50"
                            : "bg-white/90 border-zinc-200 shadow-zinc-200/50"
                        }`}
                      >
                        {selectedTags.map((tag) => (
                          <motion.div
                            key={tag}
                            layout // This makes the list "slide" when items are removed
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{
                              scale: 1.05,
                              backgroundColor: darkMode ? "#3b82f6" : "#2563eb",
                              color: "#fff",
                            }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => toggleTag(tag)}
                            className={`px-3 py-1.5 flex items-center gap-1 rounded-xl text-xs font-bold cursor-pointer transition-colors duration-200 bg-blue-500 text-white`}
                          >
                            {tag}

                            <span className="text-sm relative -top-px">×</span>
                          </motion.div>
                        ))}
                        {/* 3. MAPPING TAGS WITH LAYOUT ANIMATION */}
                        {TAGS.slice(0, 12)
                          .filter((tag) => !selectedTags.includes(tag))
                          .map((tag) => (
                            <motion.div
                              key={tag}
                              layout // This makes the list "slide" when items are removed
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              whileHover={{
                                scale: 1.05,
                                backgroundColor: darkMode
                                  ? "#3b82f6"
                                  : "#2563eb",
                                color: "#fff",
                              }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => toggleTag(tag)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors duration-200 ${
                                darkMode
                                  ? "bg-zinc-800 text-zinc-300"
                                  : "bg-zinc-100 text-zinc-700"
                              }`}
                            >
                              {tag}
                            </motion.div>
                          ))}
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

                        {/* 4. EMPTY STATE */}
                        {TAGS.filter((tag) => !selectedTags.includes(tag))
                          .length === 0 && (
                          <span className="text-[10px] opacity-40 italic p-2">
                            All tags selected
                          </span>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <button
                  className={`shadow-lg p-2 rounded-full bg-blue-400 text-white h-max w-max cursor-pointer group hover:scale-105 transition flex justify-center items-center
            ${darkMode ? "border-[#626161]" : "border-black"}
          `}
                  onClick={() => save()}
                >
                  <FiSave />
                  <Tooltip
                    text="Save the document"
                    darkMode={darkMode}
                    className="-top-1/2"
                  />
                </button>
              </div>

              <div>
                <Toolbar darkMode={darkMode} />
              </div>
            </div>

            <div className="grid-cols-4 gap-4 grid px-4 h-[calc(100%-4.5rem)]">
              {/* LEFT LIST PANEL */}
              <div className="col-span-1 gap-2 flex flex-col max-h-screen overflow-auto myscrollbar p-1 text-left">
                {folder.pages.map((p, idx) => (
                  <div
                    key={p._id || idx}
                    className={`relative overflow-hidden p-4 rounded-lg mb-4 text-left cursor-pointer transition-all duration-300 border-2 ${
                      index === idx
                        ? "bg-blue-500/10 border-blue-500 shadow-lg shadow-blue-500/20"
                        : darkMode
                          ? `${Theme.dark.secondary} border-transparent shadow-md hover:border-zinc-700`
                          : `${Theme.light.background} border-transparent shadow-sm hover:border-zinc-200`
                    }`}
                    onClick={() => setIndex(idx)}
                  >
                    {/* LEFT HOLE */}
                    <div
                      className={`absolute bottom-[50px] -left-3 h-6 w-6 rounded-full z-20 ${
                        darkMode ? "bg-zinc-950" : "bg-zinc-50 shadow-inner"
                      }`}
                    />

                    {/* RIGHT HOLE */}
                    <div
                      className={`absolute bottom-[50px] -right-3 h-6 w-6 rounded-full z-20 ${
                        darkMode ? "bg-zinc-950" : "bg-zinc-50 shadow-inner"
                      }`}
                    />

                    <div className="relative z-10">
                      {/* HEADER & STATUS DOT */}
                      <div className="flex justify-between items-start mb-1">
                        <span
                          className={`font-bold text-lg leading-tight transition-colors ${
                            index === idx
                              ? "text-blue-500"
                              : darkMode
                                ? "text-white"
                                : "text-black"
                          }`}
                        >
                          {p.page || "Untitled Page"}
                        </span>
                      </div>

                      {/* CONTENT PREVIEW */}
                      <p className="text-xs leading-relaxed opacity-60 line-clamp-2 min-h-[32px]">
                        {p.pageContent?.slice(0, 75)}
                        {p.pageContent?.length > 75 ? "..." : ""}
                      </p>

                      {/* TAGS */}
                      <div className="flex gap-1.5 flex-wrap mt-3">
                        {p.tags?.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className={`px-2 py-0.5 text-[9px] font-semibold pt-[2.7px] uppercase rounded ${
                              index === idx
                                ? "bg-blue-500 text-white"
                                : "bg-zinc-500/20 text-zinc-400"
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* PERFORATION & DATES */}
                      <div
                        className={`mt-5 pt-4 border-t-2 border-dashed flex justify-between items-end transition-colors ${
                          index === idx
                            ? "border-blue-500/30"
                            : "border-zinc-500/10"
                        }`}
                      >
                        <div className="flex flex-col gap-0.5 font-mono text-[10px]">
                          <span className="opacity-40 uppercase text-[8px]  font-bold tracking-widest">
                            Last Edited{" "}
                          </span>
                          <span className="opacity-70">
                            {new Date(
                              p.updatedAt || Date.now(),
                            ).toLocaleDateString("en-US", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </span>
                        </div>

                        <span
                          className={`text-[10px] font-semibold flex items-center w-20 gap-3 justify-center uppercase tracking-tighter ${
                            index === idx
                              ? "text-blue-500"
                              : darkMode
                                ? "text-white"
                                : "text-black"
                          }`}
                        >
                          {index == idx
                            ? editingContent || editingTitle
                              ? "Editing"
                              : "Reading"
                            : "Stored"}
                          <div
                            className={`w-2 h-2 rounded-full relative -top-1 mt-2 ${
                              index === idx
                                ? editingContent || editingTitle
                                  ? "bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"
                                  : "bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"
                                : "bg-zinc-500/30"
                            }`}
                          />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* MAIN PAGE CONTENT */}
              <div className="col-span-3 px-2 h-[calc(100%)] relative -top-1">
                <div className="py-2 px-3 bg-white h-full shadow-md rounded-md text-black">
                  {/* Editable Title */}
                  {editingTitle ? (
                    <input
                      autoFocus
                      className="text-xl font-semibold bg-transparent border-b pb-2 border-zinc-400 outline-none w-full"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveTitle();
                        if (e.key === "Escape") setEditingTitle(false);
                      }}
                      onBlur={saveTitle}
                    />
                  ) : (
                    <h2
                      className="text-xl font-semibold cursor-text text-left border-b border-zinc-300 pb-2"
                      onClick={() => setEditingTitle(true)}
                    >
                      {title.length == 1 ? "Untitled" : title}
                    </h2>
                  )}

                  <div className="text-left mt-4">
                    {editingContent ? (
                      <textarea
                        autoFocus
                        className="text-md font-normal bg-transparent outline-none w-full max-h-[90vh] min-h-[75vh] myscrollbar overflow-y-auto resize-none"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && e.ctrlKey) saveContent();
                          if (e.key === "Escape") setEditingContent(false);
                        }}
                        onBlur={saveContent}
                      />
                    ) : (
                      <div
                        className="cursor-text overflow-auto mynewscrollbar max-h-[90vh] min-h-[75vh]"
                        style={{
                          whiteSpace: "pre-wrap",
                          maxHeight: "70vh", // or 75vh, choose what fits your layout
                        }}
                        onClick={() => setEditingContent(true)}
                      >
                        {content.length == 0 ? "Temporary" : content}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Pages;
