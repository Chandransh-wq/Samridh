import React, { useEffect, useState } from "react";
import { type folder, type Page as PageType } from "../assets/DemoData";
import { AnimatePresence, motion } from "framer-motion";
import { FiArrowDown, FiArrowUp, FiDownload, FiSearch } from "react-icons/fi";

interface PageProps {
  page: PageType[];
  folder: folder;
  selected?: number;
  open: boolean;
  setOpen: (value: boolean) => void;
  darkMode: boolean;

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
}) => {
  const [index, setIndex] = useState(selected ?? 0);

  // Sync with page change logic
  useEffect(() => {
    if (open) document.body.style.overflowY = "hidden";
    else document.body.style.overflowY = "auto";
    return () => {
      document.body.style.overflowY = "auto";
    };
  }, [open]);

  const [editingTitle, setEditingTitle] = useState(false);
  const [editingContent, setEditingContent] = useState(false);
  const [title, setTitle] = useState(page[index]?.page || "");
  const [content, setContent] = useState(page[index]?.pageContent || "");

  useEffect(() => {
    if (!page[index]) return;
    setTitle(page[index].page);
    setContent(page[index].pageContent);
  }, [index, page]);

  const saveTitle = () => {
    onUpdateTitle(index, title, content);
    setEditingTitle(false);
  };

  const saveContent = () => {
    onUpdateTitle(index, title, content);
    setEditingContent(false);
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

            {/* UPPER TICKET STUB (Navigation & Actions) */}
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
                </div>
              </div>

              {/* Pager Logic */}
              <div className="flex justify-between items-center bg-zinc-500/5 p-2 rounded-xl">
                <button
                  onClick={() => setIndex((prev) => Math.max(0, prev - 1))}
                  className="p-2"
                >
                  <FiArrowUp />
                </button>
                <span className="text-xs font-mono opacity-50 uppercase">
                  Page {index + 1} of {page.length}
                </span>
                <button
                  onClick={() =>
                    setIndex((prev) => Math.min(page.length - 1, prev + 1))
                  }
                  className="p-2"
                >
                  <FiArrowDown />
                </button>
              </div>
            </div>

            {/* MAIN TICKET BODY (Editable Content) */}
            <div className="flex-1 overflow-y-auto p-6 myscrollbar text-left">
              {editingTitle ? (
                <input
                  autoFocus
                  className="text-2xl font-bold bg-transparent outline-none w-full border-b-2 border-blue-500 pb-1"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={saveTitle}
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
                    className="w-full min-h-[40vh] bg-transparent outline-none text-md leading-relaxed resize-none font-normal"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onBlur={saveContent}
                  />
                ) : (
                  <div
                    className="text-md leading-relaxed opacity-80 cursor-pointer min-h-[40vh]"
                    style={{ whiteSpace: "pre-wrap" }}
                    onClick={() => setEditingContent(true)}
                  >
                    {content || "Tap to add content..."}
                  </div>
                )}
              </div>
            </div>

            {/* LOWER TICKET STUB (Metadata) */}
            <div className="p-6 bg-zinc-500/5 border-t-2 border-dashed border-zinc-500/20">
              <div className="text-[10px] font-mono flex flex-col gap-1">
                <div className="flex justify-between opacity-40">
                  <span>CREATED</span>
                  <span>
                    {new Date(
                      page[index]?.createdAt || Date.now(),
                    ).toLocaleDateString()}
                  </span>
                </div>
                <div
                  className={`flex justify-between font-bold ${darkMode ? "text-blue-400" : "text-blue-600"}`}
                >
                  <span>LAST EDITED</span>
                  <span>
                    {new Date(
                      page[index]?.updatedAt || Date.now(),
                    ).toLocaleTimeString()}
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
