import React, { useEffect, useState } from "react";
import { type folder, type Page as PageType } from "../assets/DemoData";
import { Theme } from "../assets/Theme";
import { AnimatePresence, motion } from "framer-motion";
import Toolbar from "../Components/Toolbar";
import { FiDownload, FiSearch } from "react-icons/fi";
import Tooltip from "../Components/Tooltip";

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

const Pages: React.FC<PageProps> = ({
  page,
  folder,
  selected,
  open,
  setOpen,
  darkMode,
  onUpdateTitle,
}) => {
  const [index, setIndex] = useState(selected ?? 0);

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
                  onClick={() => {
                    setOpen(false);
                    setIndex(0);
                  }}
                  className="px-3 py-1 bg-red-500 text-white rounded-md"
                >
                  Close
                </button>
                <button className="p-2 rounded-full bg-blue-400 shadow text-white group">
                  <FiDownload />
                  <Tooltip
                    text="Download"
                    darkMode={darkMode}
                    className="top-full left-16 group-hover:block hidden"
                  />
                </button>
                <button className="p-2 rounded-full bg-blue-400 shadow text-white group">
                  <FiSearch />
                  <Tooltip
                    text="Search Web"
                    darkMode={darkMode}
                    className="top-full left-16 group-hover:block hidden"
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
                    key={idx}
                    className={`${
                      darkMode
                        ? `${Theme.dark.secondary} shadow-[#66666673]`
                        : Theme.light.background
                    } shadow p-4 rounded-2xl mb-3 cursor-pointer`}
                    onClick={() => setIndex(idx)}
                  >
                    <span className="font-semibold text-lg mb-2">{p.page}</span>

                    <p className="text-sm opacity-80 leading-snug">
                      {p.pageContent?.slice(0, 75)}
                      {p.pageContent?.length > 75 ? "..." : ""}
                    </p>

                    <div className="flex gap-2 flex-wrap mt-2">
                      {p.tags?.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-1 text-xs rounded-md bg-zinc-500/20"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="text-xs opacity-50 mt-2 flex flex-col">
                      <span>
                        Created:{" "}
                        {new Date(p.createdAt || Date.now()).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "long",
                            day: "numeric",
                            month: "short",
                          },
                        )}
                      </span>

                      <span>
                        Last Edited:{" "}
                        {new Date(p.updatedAt || Date.now()).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "long",
                            day: "numeric",
                            month: "short",
                          },
                        )}
                      </span>
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
                      className="text-xl font-semibold bg-transparent border-b border-zinc-400 outline-none w-full"
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
                      className="text-xl font-semibold cursor-text text-left"
                      onClick={() => setEditingTitle(true)}
                    >
                      {title}
                    </h2>
                  )}

                  <div className="text-left mt-4">
                    {editingContent ? (
                      <textarea
                        autoFocus
                        className="text-md font-normal bg-transparent outline-none border-b w-full max-h-[90vh] min-h-[75vh] myscrollbar overflow-y-auto resize-none"
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
                        className="cursor-text overflow-auto mynewscrollbar"
                        style={{
                          whiteSpace: "pre-wrap",
                          maxHeight: "70vh", // or 75vh, choose what fits your layout
                        }}
                        onClick={() => setEditingContent(true)}
                      >
                        {content}
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
