import React, { useCallback, useEffect, useRef, useState } from "react";
import { TAGS, type folder, type Page as PageType } from "../assets/DemoData";
import { Theme } from "../assets/Theme";
import { AnimatePresence, motion } from "framer-motion";
import Toolbar from "../Components/Toolbar";
import remarkBreaks from "remark-breaks";
import {
  FiChevronRight,
  FiDownload,
  FiSave,
  FiSearch,
  FiTag,
  FiTrash,
} from "react-icons/fi";
import Tooltip from "../Components/Tooltip";
import { deletePage, updatePage } from "../assets/Services/user.service";
import type { sendPage } from "./FolderDesktop";
import { useFolders } from "../assets/hooks/useFolder";
import getCaretCoordinates from "textarea-caret";
import { searchWeb } from "../assets/Services/api.service";
import Loader2 from "../Components/Loader2";
import ReactMarkdown from "react-markdown";

import rehypeRaw from "rehype-raw";
import ToolbarFloat from "../Components/ToolbarFloat";

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

interface download {
  title: string;
  desc: string;
  darkMode: boolean;
}

const DownloadCard: React.FC<download> = ({ title, desc, darkMode }) => (
  <button
    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group ${
      darkMode
        ? "border-white/5 hover:bg-white/5 hover:border-white/10"
        : "border-gray-100 hover:bg-gray-50 hover:border-gray-200"
    }`}
  >
    <div>
      <div className="text-xs font-bold">{title}</div>
      <div className="text-[10px] opacity-50 font-medium">{desc}</div>
    </div>
    <FiChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
  </button>
);

const Pages: React.FC<PageProps> = ({
  page,
  folder,
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
  const [showDialog, setShowDialog] = useState(false);
  // 1. New State for visual feedback
  const [isSaving, setIsSaving] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectedText, setSelectedText] = useState<string>("");
  const [newSelectedText, setNewSelectedText] = useState<string>("");
  const [secondaryDialogs, setSecondaryDialogs] = useState(false);
  const [searching, setSearching] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [query, setQuery] = useState<string>("");
  const [loadingResponse, setLoadingResponse] = useState<boolean>(false);
  const [showTools, setShowTools] = useState<boolean>(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  const handleSelect = (e: any) => {
    const { selectionStart, selectionEnd, value } = e.target;

    if (selectionStart !== selectionEnd) {
      const selection = value.substring(selectionStart, selectionEnd);

      // 1. Internal caret position (relative to textarea top-left)
      const caret = getCaretCoordinates(e.target, selectionEnd);

      // 2. Textarea position on the screen
      const rect = e.target.getBoundingClientRect();

      setMenuPos({
        // Top: Rect top + Caret offset - Textarea scroll + Window scroll - padding
        top: rect.top + caret.top - e.target.scrollTop + window.scrollY - 600,
        // Left: Rect left + Caret offset - Textarea scroll
        left: rect.left + caret.left - e.target.scrollLeft + 110,
      });

      setSelectedText(selection);
      setShowTools(true);
    } else {
      setShowTools(false);
    }
  };

  useEffect(() => {
    if (!page || page.length == 0) setOpen(false);
  }, [page, setOpen]);

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

  // 1. Wrap save in useCallback so it doesn't trigger the useEffect unnecessarily
  const save = useCallback(async () => {
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = null;
    }

    const currentPage = page[index];
    if (!currentPage) return;

    try {
      setIsSaving(true);
      const updatedPage: sendPage = {
        title: title,
        pageContent: content,
        tags: selectedTags,
      };

      await updatePage(updatedPage, darkMode, currentPage._id ?? "");

      setSaved(true);
      setTagDialog(false);
      setIsSaving(false);
      refreshFolders();
    } catch (error) {
      console.error("Save Error:", error);
      setIsSaving(false);
    }
  }, [
    title,
    content,
    selectedTags,
    index,
    page,
    darkMode,
    refreshFolders,
    setSaved,
  ]);

  // 2. The Auto-Save Effect is now safe
  // 1. Add a ref to track if we are currently saving to avoid loops

  const saving = useRef(false);
  // 1. Add this Ref at the top of your component
  const lastSavedSnapshot = useRef({ title: "", content: "", tags: "" });

  useEffect(() => {
    const currentPage = page?.[index];
    if (!currentPage || saving.current) return;

    // 2. Compare against the PHYSICAL snapshot of what we last saved,
    // NOT the 'page' prop which might be stale or mid-update.
    const currentTagsStr = JSON.stringify(selectedTags);
    const isDirty =
      title !== lastSavedSnapshot.current.title ||
      content !== lastSavedSnapshot.current.content ||
      currentTagsStr !== lastSavedSnapshot.current.tags;

    if (!isDirty) return;

    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);

    autoSaveTimer.current = setTimeout(async () => {
      // 3. Update snapshot IMMEDIATELY to prevent double-triggering
      // while the async save is in flight
      lastSavedSnapshot.current = { title, content, tags: currentTagsStr };

      saving.current = true;
      setEditingTitle(false);

      try {
        await save();
      } finally {
        saving.current = false;
      }
    }, 1000);

    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };

    // 4. CRITICAL: Remove 'page' and 'save' from dependencies.
    // We only want to trigger this when the USER changes the input fields.
  }, [title, content, selectedTags, index]);

  // 4. Update handleDelete for Index Safety
  const handleDelete = async () => {
    const pageId = page[index]?._id;
    if (!pageId) return;

    try {
      // Shift index locally first if on last page to prevent "undefined" crash
      if (index > 0 && index === page.length - 1) {
        setIndex(index - 1);
      }

      await deletePage(pageId, darkMode, page[index].page ?? "");
      setDeleted(true); // Signal parent
      setShowDialog(false);
      await refreshFolders();
    } catch (error) {
      console.log(error);
    }
  };

  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      // If the dialog is open and the click target is NOT inside the dialog, close it
      if (
        tagDialog &&
        dialogRef.current &&
        !dialogRef.current.contains(event.target)
      ) {
        setTagDialog(false);
      }
    };

    // Attach listener to the entire document
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [tagDialog]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editingContent && textareaRef.current) {
      const length = textareaRef.current.value.length;
      // Move cursor to the end
      textareaRef.current.setSelectionRange(length, length);
      // Ensure it's focused (backup for autoFocus)
      textareaRef.current.focus();
    }
  }, [editingContent]);

  const handleSearch = async () => {
    const answer = await searchWeb(query, darkMode, setLoadingResponse);

    if (answer) {
      // Wrap in a formatted block for better research organization
      const formattedResult = `\n\n #### ${query}\n\n${answer}`;

      setContent((prev) => prev + formattedResult);

      // Automatically close dialog on success
      setSecondaryDialogs(false);
      setQuery("");
    }
  };

  useEffect(() => {
    if (newSelectedText !== selectedText) {
      const updatedContent = content.replace(selectedText, newSelectedText);
      setContent(updatedContent);
    }
  }, [newSelectedText]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9999]"
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
            } p-5 pb-0 shadow-xl fixed top-0 left-8 w-[calc(100%-6rem)] h-full my-scrollbar flex flex-col gap-5 myscrollbar`}
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
                  onClick={() => {
                    setSecondaryDialogs(true);
                    setSearching(false);
                    setDownloading(true);
                  }}
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
                  onClick={() => {
                    setSecondaryDialogs(true);
                    setDownloading(false);
                    setSearching(true);
                  }}
                >
                  <FiSearch />
                  <Tooltip
                    text="Search the web"
                    darkMode={darkMode}
                    className="-top-1/2"
                  />
                </button>
                <AnimatePresence>
                  {secondaryDialogs && (
                    <>
                      {/* Dimmed Backdrop */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSecondaryDialogs(false)}
                        className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[60]"
                      />

                      {/* Main Dialog Container */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className={`fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-md z-[70] overflow-hidden rounded-2xl border shadow-2xl transition-all ${
                          darkMode
                            ? "bg-zinc-900/90 border-white/10 text-zinc-100 backdrop-blur-2xl"
                            : "bg-white/90 border-gray-200 text-gray-900 backdrop-blur-2xl"
                        }`}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") {
                            setSecondaryDialogs(false);
                            setQuery("");
                          }
                        }}
                      >
                        {/* Header Section */}
                        <div
                          className={`px-4 py-3 flex items-center gap-2 border-b text-[10px] font-black uppercase tracking-[0.2em] ${
                            darkMode
                              ? "border-white/5 text-zinc-500"
                              : "border-gray-100 text-gray-400"
                          }`}
                        >
                          {searching ? (
                            <FiSearch size={14} />
                          ) : (
                            <FiDownload size={14} />
                          )}
                          {searching ? "Web Search" : "Export Document"}
                          {loadingResponse ? (
                            <div className="h-1/2 w-1/4">
                              <Loader2 />
                            </div>
                          ) : (
                            <div></div>
                          )}
                        </div>

                        <div className="p-4">
                          {searching ? (
                            <div className="relative group">
                              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
                              <input
                                autoFocus
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => {
                                  if (
                                    e.key === "Enter" &&
                                    query.trim() !== ""
                                  ) {
                                    handleSearch();
                                    console.log(query);
                                  }
                                }}
                                type="text"
                                placeholder="Search notes, citations, or files..."
                                className={`w-full pl-10 pr-4 py-3 rounded-xl outline-none transition-all text-sm ${
                                  darkMode
                                    ? "bg-white/5 focus:bg-white/10 border-transparent focus:border-blue-500/50 border"
                                    : "bg-gray-50 focus:bg-white border-transparent focus:border-blue-500/30 border shadow-sm"
                                }`}
                              />
                            </div>
                          ) : downloading ? (
                            <div className="space-y-2">
                              <DownloadCard
                                title="Current Page"
                                desc="Export this document as a PDF"
                                darkMode={darkMode}
                              />
                              <DownloadCard
                                title="Entire Folder"
                                desc="Export all pages in this folder as a PDF"
                                darkMode={darkMode}
                              />
                            </div>
                          ) : null}
                        </div>

                        {/* Shortcut Hint Footer */}
                        <div
                          className={`px-4 py-2 text-[9px] font-mono opacity-30 border-t flex justify-between ${
                            darkMode ? "border-white/5" : "border-gray-100"
                          }`}
                        >
                          <span>ESC to Close</span>
                          <span>ENTER to Confirm</span>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>

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
                        ref={dialogRef}
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
                {/* STATUS INDICATOR UI */}
                <div className="z-10 h-max w-max flex items-center">
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

              <div>
                <Toolbar
                  darkMode={darkMode}
                  setSelectedText={setNewSelectedText}
                  selectedText={selectedText}
                />
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
                      <>
                        <textarea
                          ref={textareaRef}
                          autoFocus
                          className="text-md font-normal bg-transparent outline-none w-full max-h-[90vh] min-h-[75vh] myscrollbar overflow-y-auto resize-none whitespace-pre-wrap"
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && e.ctrlKey) saveContent();
                            if (e.key === "Escape") setEditingContent(false);
                          }}
                          onBlur={saveContent}
                          onSelect={handleSelect}
                        />
                        {showTools && (
                          <ToolbarFloat
                            darkMode={darkMode}
                            selectedText={selectedText}
                            setSelectedText={setNewSelectedText}
                            setEditingContent={setEditingContent}
                            show={showTools}
                            setShow={setShowTools}
                            menuPos={menuPos}
                          />
                        )}
                      </>
                    ) : (
                      <div
                        className="cursor-text w-full max-h-[90vh] min-h-[75vh]"
                        style={{
                          whiteSpace: "pre-wrap",
                          maxHeight: "70vh", // or 75vh, choose what fits your layout
                        }}
                        onClick={() => setEditingContent(true)}
                      >
                        <div
                          className="w-full max-w-none g-max whitespace-pre-wrap cursor-text  leading-4"
                          onClick={() => setEditingContent(true)}
                        >
                          {content.length === 0 ? (
                            <span className="opacity-50 italic">
                              Start typing...
                            </span>
                          ) : (
                            <div className="prose max-w-none prose-p:my-0 my-0 max-h-[60vh] min-h-[75vh] overflow-auto mynewscrollbar prose-headings:my-0 whitespace-pre-wrap">
                              <ReactMarkdown
                                rehypePlugins={[rehypeRaw]}
                                remarkPlugins={[remarkBreaks]}
                              >
                                {content}
                              </ReactMarkdown>
                            </div>
                          )}
                        </div>
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
