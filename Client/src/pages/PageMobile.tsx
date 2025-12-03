import React, { useEffect, useState } from "react";
import { type folder, type Page as PageType } from "../assets/DemoData";
import { Theme } from "../assets/Theme";
import { AnimatePresence, motion } from "framer-motion";
import Toolbar from "../Components/Toolbar";
import { FiArrowDown, FiArrowUp, FiDownload, FiSearch } from "react-icons/fi";
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
    newContent?: string
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

  useEffect(() => {
    if (open) document.body.style.overflowY = "hidden";
    else document.body.style.overflowY = "auto";

    return () => {
      document.body.style.overflowY = "auto";
    };
  }, [open]);

  const [editingTitle, setEditingTitle] = useState(false);
  const [editingContent, setEditingContent] = useState(false);
  const [title, setTitle] = useState(page[index]?.page);
  const [content, setContent] = useState(page[index]?.pageContent);

  // Sync with page change
  useEffect(() => {
    if (!page[index]) return; // <- prevents crash
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
          className="fixed inset-0 z-9999 w-[calc(100%+5rem)]"
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
            } p-5 pb-0 shadow-xl fixed top-0 left-0 w-[calc(100%-0.5rem)] h-full overflow-y-auto flex flex-col gap-5 myscrollbar`}
          >
            {/* HEADER */}
            <div className="flex flex-col gap-3 justify-between items-center mb-1">
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
                <div
                  className="h-max w-max rounded-full text-black bg-zinc-400/90 p-2 cursor-pointer"
                  onClick={() => setIndex((prev) => prev + 1)}
                >
                  <Tooltip
                    text="Navigate down"
                    darkMode={darkMode}
                    className="-top-1/2"
                  />
                  <FiArrowDown />
                </div>
                <div
                  className="h-max w-max rounded-full text-black bg-zinc-400/90 p-2 cursor-pointer"
                  onClick={() => setIndex((prev) => prev - 1)}
                >
                  <Tooltip
                    text="Navigate down"
                    darkMode={darkMode}
                    className="-top-1/2"
                  />
                  <FiArrowUp />
                </div>
              </div>
              <div className="w-120 pl-27 flex-wrap relative -left-12">
                <Toolbar darkMode={darkMode} />
              </div>
            </div>

            <div className=" gap-4 grid  h-[calc(100%-4.5rem)]">
              {/* LEFT LIST PANEL */}

              {/* MAIN PAGE CONTENT */}
              <div className=" px-2 h-[calc(100%)] relative -top-1">
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

                  <div className="text-left mt-4 pb-15">
                    {editingContent ? (
                      <textarea
                        autoFocus
                        className="text-md pb-5 font-normal bg-transparent outline-none border-b w-full max-h-[90vh] min-h-[75vh] myscrollbar overflow-y-auto resize-none"
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

export default PageMobile;
