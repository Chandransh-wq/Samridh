import { folderData, notifications } from "./DemoData";
import { basic } from "./Illustrations";

export const getInitials = (name: string) => {
  const words = name.split(" ");
  let res = "";
  for (let i = 0; i < 2; i++) {
    res += words[i].charAt(0); // usually first letter of each word
  }
  return res.toUpperCase();
};

// Total number of folders
const totalfolders = folderData.length;

// Total number of pages
let totalPages = 0;

// Total number of favorites
let totalFavorites = 0;

// Tag insights
const tagCounts: Record<string, number> = {};

for (const folder of folderData) {
  totalPages += folder.pages.length;

  if (folder.favorite) totalFavorites += 1;

  // Count folder tags
  folder.tags.forEach((tag) => {
    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
  });

  // Count tags on each page
  folder.pages.forEach((page) => {
    page.tags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
}

// Optional: get top N tags
const topTags = Object.entries(tagCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .map(([tag, count]) => `${tag} (${count})`);

// Get all the pages
const pages = folderData.flatMap((Folder) => Folder.pages);

//assign illustation
const illustration = (type: string): string => {
  return basic[type as keyof typeof basic] || basic.Other;
};
// Predefined safe Tailwind colors
export const COLORS_Light = [
  "bg-red-500/60",
  "bg-blue-500/60",
  "bg-green-500/60",
  "bg-yellow-500/60",
  "bg-purple-500/60",
  "bg-pink-500/60",
  "bg-indigo-500/60",
  "bg-orange-500/60",
];

const COLORS_Dark = [
  "bg-red-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-orange-500",
];

export const getRandomColor = (darkMode: boolean) => {
  const index = Math.floor(Math.random() * COLORS_Light.length);
  return darkMode ? COLORS_Dark[index] : COLORS_Light[index];
};

//find page's folder
export const findfolderByPageId = (pageId: string) => {
  return (
    folderData.find((folder) =>
      folder.pages.some((page) => page.id === pageId)
    ) || null
  );
};

export const notification = notifications;

// Export all metrics
export {
  totalfolders,
  totalPages,
  totalFavorites,
  tagCounts,
  topTags,
  pages,
  illustration,
};
