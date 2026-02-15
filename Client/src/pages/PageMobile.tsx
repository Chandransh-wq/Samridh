import React, { useEffect, useState } from "react";
import { TAGS, type folder, type Page as PageType } from "../assets/DemoData";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiArrowDown,
  FiArrowUp,
  FiDownload,
  FiSave,
  FiSearch,
  FiTag,
} from "react-icons/fi";
import { useFolders } from "../assets/hooks/useFolder";
import { updatePage } from "../assets/Services/user.service";
import Tooltip from "../Components/Tooltip";

// Local interface to match your desktop implementation
interface sendPage {
  title: string;
  pageContent: string;
  tags: string[];
}

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

const PageMobile: React.FC<PageProps> = ({
  page,
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

  const [editingTitle, setEditingTitle] = useState(false);
  const [editingContent, setEditingContent] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // 1. Sync local index if the selected prop changes from parent
  useEffect(() => {
    if (selected !== undefined) setIndex(selected);
  }, [selected]);

  // 2. Sync Title, Content, and Tags whenever the index or page data changes
  useEffect(() => {
    if (page && page[index]) {
      setTitle(page[index].page || "");
      setContent(page[index].pageContent || "");
      setSelectedTags(page[index].tags || []);
    }
  }, [index, page]);

  // 3. Handle Body Scroll Lock
  useEffect(() => {
    if (open) document.body.style.overflowY = "hidden";
    else document.body.style.overflowY = "auto";
    return () => {
      document.body.style.overflowY = "auto";
    };
  }, [open]);

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

  // 4. Integrated Save Logic (Matches Desktop Backend Sync)
  const save = async () => {
    const currentPage = page[index];
    if (!currentPage) return;

    try {
      const updatedPage: sendPage = {
        title: title,
        pageContent: content,
        tags: selectedTags,
      };

      await updatePage(updatedPage, darkMode, currentPage._id ?? "");

      setSaved(true);
      setTagDialog(false);

      // Reset saved notification after 2 seconds
      setTimeout(() => setSaved(false), 2000);

      await refreshFolders();
    } catch (error) {
      console.error("Mobile Save Error:", error);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9999] mx-5 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* BACKDROP */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* TICKET MODAL */}
          <motion.div
            initial={{ y: "100%", scale: 0.9 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: "100%", scale: 0.9 }}
            className={`relative top-8 max-h-screen min-h-screen min-w-[calc(100vw-1rem)] overflow-hidden rounded-t-lg shadow-2xl flex flex-col ${
              darkMode ? "bg-zinc-900 text-white" : "bg-white text-black"
            }`}
          >
            {/* TICKET HOLES (Sides) */}
            <div
              className={`absolute top-[14.4%] -left-4 h-8 w-8 rounded-full z-20 ${darkMode ? "bg-zinc-800/80" : "bg-zinc-200"}`}
            />
            <div
              className={`absolute top-[14.4%] -right-4 h-8 w-8 rounded-full z-20 ${darkMode ? "bg-zinc-800/80" : "bg-zinc-200"}`}
            />

            {/* UPPER TICKET STUB */}
            <div className="p-6 pb-4 border-b-2 border-dashed border-zinc-500/20 relative">
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={() => setOpen(false)}
                  className="px-4 py-1.5 bg-red-500/10 text-red-500 font-bold rounded-full text-xs uppercase tracking-widest"
                >
                  Close
                </button>
                <div className="flex gap-2">
                  <button
                    className={`p-2 rounded-full ${darkMode ? "bg-zinc-800" : "bg-zinc-100"}`}
                  >
                    <FiDownload size={16} />
                  </button>
                  <button
                    className={`p-2 rounded-full ${darkMode ? "bg-zinc-800" : "bg-zinc-100"}`}
                  >
                    <FiSearch size={16} />
                  </button>
                  <button
                    className={`p-2 rounded-full ${darkMode ? "bg-zinc-800" : "bg-zinc-100"}`}
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
                          className={`absolute top-16 right-5 p-3 rounded-b-2xl shadow-2xl border backdrop-blur-md flex flex-wrap gap-2 z-50 w-59 outline-none ${
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
                                backgroundColor: darkMode
                                  ? "#3b82f6"
                                  : "#2563eb",
                                color: "#fff",
                              }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => toggleTag(tag)}
                              className={`px-3 py-1.5 flex items-center gap-1 rounded-xl text-xs font-bold cursor-pointer transition-colors duration-200 bg-blue-500 text-white`}
                            >
                              {tag}

                              <span className="text-sm relative -top-px">
                                ×
                              </span>
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
                                  if (
                                    newTag &&
                                    !selectedTags.includes(newTag)
                                  ) {
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
                    className="shadow-lg p-2 rounded-full bg-blue-400 text-white h-max w-max cursor-pointer active:scale-95 transition flex justify-center items-center"
                    onClick={save}
                  >
                    <FiSave />
                  </button>
                </div>
              </div>

              {/* Pager Logic */}
              <div className="flex justify-between items-center bg-zinc-500/5 p-2 rounded-xl">
                <button
                  disabled={index === 0}
                  onClick={() => setIndex((prev) => Math.max(0, prev - 1))}
                  className={`p-2 ${index === 0 ? "opacity-10" : "opacity-100"}`}
                >
                  <FiArrowUp />
                </button>
                <span className="text-xs font-mono opacity-50 uppercase">
                  Page {index + 1} of {page.length}
                </span>
                <button
                  disabled={index === page.length - 1}
                  onClick={() =>
                    setIndex((prev) => Math.min(page.length - 1, prev + 1))
                  }
                  className={`p-2 ${index === page.length - 1 ? "opacity-10" : "opacity-100"}`}
                >
                  <FiArrowDown />
                </button>
              </div>
            </div>

            {/* MAIN TICKET BODY */}
            <div className="flex-1 overflow-y-auto p-6 myscrollbar text-left">
              {editingTitle ? (
                <input
                  autoFocus
                  className="text-2xl font-bold bg-transparent outline-none w-full border-b-2 border-blue-500 pb-1"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={saveTitle}
                  onKeyDown={(e) => e.key === "Enter" && saveTitle()}
                />
              ) : (
                <h2
                  className="text-2xl font-bold tracking-tight cursor-pointer border-b-zinc-400 border-b"
                  onClick={() => setEditingTitle(true)}
                >
                  {title || "Untitled Page"}
                </h2>
              )}

              <div className="mt-6">
                {editingContent ? (
                  <textarea
                    autoFocus
                    className="w-full max-h-[62vh] min-h-[60vh] bg-transparent outline-none text-md leading-relaxed resize-none font-normal"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onBlur={saveContent}
                  />
                ) : (
                  <div
                    className="text-md leading-relaxed opacity-80 cursor-pointer max-h-[62vh] min-h-[60vh]"
                    style={{ whiteSpace: "pre-wrap" }}
                    onClick={() => setEditingContent(true)}
                  >
                    {content || "Tap to add content..."}
                  </div>
                )}
              </div>
            </div>

            {/* LOWER TICKET STUB */}
            <div className="p-6 bg-zinc-500/5 border-t-2 border-dashed border-zinc-500/20">
              <div className="text-[10px] font-mono flex flex-col gap-1">
                <div className="flex justify-between opacity-40">
                  <span>CREATED</span>
                  <span>
                    {new Date(
                      page[index]?.createdAt || Date.now(),
                    ).toLocaleDateString("en-GB")}
                  </span>
                </div>
                <div
                  className={`flex justify-between font-bold ${darkMode ? "text-blue-400" : "text-blue-600"}`}
                >
                  <span>LAST EDITED</span>
                  <span>
                    {new Date(
                      page[index]?.updatedAt || Date.now(),
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PageMobile;
