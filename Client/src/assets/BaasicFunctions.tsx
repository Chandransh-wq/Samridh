import { folderData, notifications } from "./DemoData";
import { basic } from "./Illustrations";

export const getInitials = (name: string) => {
  if (!name) return "";

  // Split by whitespace and filter out empty strings
  const words = name.trim().split(/\s+/);

  let res = "";
  // Loop up to 2 times, but stay within the actual number of words found
  for (let i = 0; i < Math.min(words.length, 2); i++) {
    res += words[i].charAt(0);
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
  "rgba(239, 68, 68, 0.6)", // red-500
  "rgba(59, 130, 246, 0.6)", // blue-500
  "rgba(34, 197, 94, 0.6)", // green-500
  "rgba(234, 179, 8, 0.6)", // yellow-500
  "rgba(168, 85, 247, 0.6)", // purple-500
  "rgba(236, 72, 153, 0.6)", // pink-500
  "rgba(99, 102, 241, 0.6)", // indigo-500
  "rgba(249, 115, 22, 0.6)", // orange-500
];

export const COLORS_Dark = [
  "rgb(239, 68, 68)", // red-500
  "rgb(59, 130, 246)", // blue-500
  "rgb(34, 197, 94)", // green-500
  "rgb(234, 179, 8)", // yellow-500
  "rgb(168, 85, 247)", // purple-500
  "rgb(236, 72, 153)", // pink-500
  "rgb(99, 102, 241)", // indigo-500
  "rgb(249, 115, 22)", // orange-500
];

export const getRandomColor = (darkMode: boolean) => {
  const index = Math.floor(Math.random() * COLORS_Light.length);
  return darkMode ? COLORS_Dark[index] : COLORS_Light[index];
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
