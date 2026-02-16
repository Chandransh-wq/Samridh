import React, { useCallback, useEffect, useRef, useState } from "react";
import { TAGS, type folder, type Page as PageType } from "../assets/DemoData";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiArrowDown,
  FiArrowUp,
  FiDownload,
  FiSave,
  FiSearch,
  FiTag,
  FiTrash,
} from "react-icons/fi";
import { useFolders } from "../assets/hooks/useFolder";
import { deletePage, updatePage } from "../assets/Services/user.service";
import Tooltip from "../Components/Tooltip";

// Local interface to match your desktop implementation

interface PageProps {
  page: PageType[];
  folder: folder;
  selected?: number;
  open: boolean;
  setOpen: (value: boolean) => void;
  darkMode: boolean;
  setSaved: (value: boolean) => void;
  setDeleted: (value: boolean) => void;
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
  setDeleted,
}) => {
  const [index, setIndex] = useState(selected ?? 0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagDialog, setTagDialog] = useState(false);
  const { refreshFolders } = useFolders();

  const [editingTitle, setEditingTitle] = useState(false);
  const [editingContent, setEditingContent] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [showDialog, setShowDialog] = useState(false);

  // Auto-save Status States
  const [isSaving, setIsSaving] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1. Sync Index when prop changes
  useEffect(() => {
    if (selected !== undefined) setIndex(selected);
  }, [selected]);

  // 2. IMPORTANT: Only sync local text when switching PAGES (prevents overwrites while typing)
  useEffect(() => {
    if (page && page[index]) {
      setTitle(page[index].page || "");
      setContent(page[index].pageContent || "");
      setSelectedTags(page[index].tags || []);
    }
  }, [index]);

  const saveTitle = () => {
    onUpdateTitle(index, title, content);
    setEditingTitle(false);
  };

  const saveContent = () => {
    onUpdateTitle(index, title, content);
    setEditingContent(false);
  };

  // 3. Handle Body Scroll Lock
  useEffect(() => {
    document.body.style.overflowY = open ? "hidden" : "auto";
    return () => {
      document.body.style.overflowY = "auto";
    };
  }, [open]);

  // 4. Modal Auto-Close
  useEffect(() => {
    if (!page || page.length === 0) setOpen(false);
  }, [page, setOpen]);

  // 5. MEMOIZED SAVE FUNCTION (Snapshot safe)
  const save = useCallback(
    async (snapshot?: { id: string; t: string; c: string; tags: string[] }) => {
      // Clear any pending timer if save is called (manual or auto)
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
        autoSaveTimer.current = null;
      }

      const targetId = snapshot?.id || page[index]?._id;
      if (!targetId) return;

      try {
        setIsSaving(true);

        // Map your local 'title' state to the 'page' key the backend expects
        const updatedPage: any = {
          title: snapshot?.t ?? title, // <--- This MUST match the backend key 'page'
          pageContent: snapshot?.c ?? content,
          tags: snapshot?.tags ?? selectedTags,
        };

        const targetId = snapshot?.id || page[index]?._id;
        if (!targetId) return;

        await updatePage(updatedPage, darkMode, targetId);
        setSaved(true);
        setIsSaving(false);

        // ... rest of logic
      } catch (error) {
        console.error("Save Error:", error);
      }
    },
    [title, content, selectedTags, index, page, darkMode],
  );

  // 6. AUTO-SAVE & SWITCH-SAVE EFFECT
  useEffect(() => {
    const currentPage = page?.[index];
    if (!currentPage) return;

    const snapshot = {
      id: currentPage._id ?? "",
      t: title,
      c: content,
      tags: [...selectedTags],
    };

    const isDirty =
      title !== (currentPage.page || "") ||
      content !== (currentPage.pageContent || "") ||
      JSON.stringify(selectedTags) !== JSON.stringify(currentPage.tags || []);

    if (!isDirty) return;

    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);

    autoSaveTimer.current = setTimeout(() => {
      save(snapshot);
    }, 1500); // 1.5s for Mobile

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
        // FORCE INSTANT SAVE IF LEAVING PAGE
        if (isDirty && snapshot.id) {
          setIsSaving(true);
          save(snapshot);
          setIsSaving(false);
        }
      }
    };
  }, [title, content, selectedTags, index, save]);

  const handleDelete = async () => {
    const pageId = page[index]?._id;
    if (!pageId) return;
    try {
      if (index > 0 && index === page.length - 1) {
        setIndex(index - 1);
      }
      await deletePage(pageId, darkMode, page[index].page ?? "");
      setDeleted(true);
      setShowDialog(false);
      await refreshFolders();
    } catch (error) {
      console.log("Delete Error:", error);
    }
  };

  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (
        tagDialog &&
        dialogRef.current &&
        !dialogRef.current.contains(event.target)
      ) {
        setTagDialog(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [tagDialog]);

  if (!page || !page[index]) return null;
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
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
            initial={{ y: "100%", scale: 1 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: "100%", scale: 0.9 }}
            transition={{
              type: "tween", // "tween" removes the spring physics entirely
              ease: "easeOut",
              duration: 0.1,
            }}
            className={`relative top-2 max-h-screen min-h-screen min-w-[calc(100vw-1rem)] overflow-hidden rounded-t-lg shadow-2xl flex flex-col ${
              darkMode ? "bg-zinc-900 text-white" : "bg-white text-black"
            }`}
          >
            {/* LOWER TICKET STUB */}
            <div className="p-4 bg-zinc-500/5 border-b-2 border-dashed border-zinc-500/20">
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
            {/* TICKET HOLES (Sides) */}
            <div
              className={`absolute top-[22.35%] -left-4 h-8 w-8 rounded-full z-20 ${darkMode ? "bg-zinc-800/80" : "bg-zinc-200"}`}
            />
            <div
              className={`absolute top-[22.35%] -right-4 h-8 w-8 rounded-full z-20 ${darkMode ? "bg-zinc-800/80" : "bg-zinc-200"}`}
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
                          ref={dialogRef}
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
                    onClick={() => save()}
                  >
                    <FiSave />
                  </button>
                  <button
                    className={`shadow-lg p-2 rounded-full bg-red-400 text-white h-max w-max cursor-pointer group hover:scale-105 transition flex justify-center items-center
            ${darkMode ? "border-[#626161]" : "border-black"}
          `}
                    onClick={() => setShowDialog(true)}
                  >
                    <FiTrash />
                    <Tooltip
                      text="Delete the page"
                      darkMode={darkMode}
                      className="-top-1/2"
                    />
                  </button>
                </div>
                <AnimatePresence>
                  {showDialog && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                      {/* 1. BACKDROP */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowDialog(false)}
                        className={`absolute inset-0 bg-black/40 backdrop-blur-sm`}
                      />

                      {/* 2. DIALOG CARD */}
                      <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className={`relative w-full max-w-md overflow-hidden rounded-xl  p-6 shadow-2xl ${darkMode ? "dark:bg-zinc-900" : "bg-white"}`}
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
                            {page[index].page}
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
                  onBlur={() => saveTitle()}
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
                    className="w-full max-h-[58vh] min-h-[56vh] bg-transparent outline-none text-md leading-relaxed resize-none font-normal"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onBlur={() => saveContent()}
                  />
                ) : (
                  <div
                    className="text-md leading-relaxed opacity-80 cursor-pointer max-h-[58vh] min-h-[57vh]"
                    style={{ whiteSpace: "pre-wrap" }}
                    onClick={() => setEditingContent(true)}
                  >
                    {content || "Tap to add content..."}
                  </div>
                )}
              </div>
              {/* STATUS INDICATOR UI */}
              <div className="z-10 relative -top-[3rem] left-60 h-max w-max flex items-center">
                <AnimatePresence mode="wait">
                  {isSaving ? (
                    <motion.div
                      key="sav"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={`shadow-lg px-4 py-2 rounded-full bg-blue-400 text-white flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest border transition
                          ${darkMode ? "border-[#626161]" : "border-black"}
                        `}
                    >
                      <div className="h-1.5 w-1.5 animate-ping rounded-full bg-white" />
                      Saving...
                    </motion.div>
                  ) : (
                    <motion.div
                      key="syn"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`shadow-md px-4 py-2 rounded-full flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest border transition opacity-50
                          ${
                            darkMode
                              ? "bg-zinc-800 border-zinc-700 text-zinc-400"
                              : "bg-zinc-100 border-zinc-200 text-zinc-500"
                          }
                        `}
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-current" />
                      Synced
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PageMobile;
