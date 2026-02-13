import { notifications, type folder, type Page } from "./DemoData";
import { basic } from "./Illustrations";

/**
 * 1. INITIALS HELPER
 */
export const getInitials = (name: string): string => {
  if (!name) return "";
  const words = name.trim().split(/\s+/);
  let res = "";
  for (let i = 0; i < Math.min(words.length, 2); i++) {
    res += words[i].charAt(0);
  }
  return res.toUpperCase();
};

/**
 * 2. METRICS CALCULATOR
 * Pass your folder array here to get all stats.
 */
export const getMetrics = (folderData: folder[]) => {
  let totalPages = 0;
  let totalFavorites = 0;
  const tagCounts: Record<string, number> = {};

  folderData.forEach((f: folder) => {
    totalPages += f.pages.length;
    if (f.favorite) totalFavorites += 1;

    // Count folder tags
    f.tags.forEach((tag: string) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });

    // Count page tags
    f.pages.forEach((p: Page) => {
      p.tags.forEach((tag: string) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
  });

  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag, count]) => `${tag} (${count})`);

  const allPages = folderData.flatMap((f: folder) => f.pages);

  return {
    totalFolders: folderData.length,
    totalPages,
    totalFavorites,
    tagCounts,
    topTags,
    pages: allPages,
  };
};

/**
 * 3. ILLUSTRATIONS & COLORS
 */
export const illustration = (type: string): string => {
  return (basic as any)[type] || basic.Other;
};

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

/**
 * 4. SEARCH HELPERS
 */
export const findfolderByPageId = (folderData: folder[], pageId: string) => {
  return (
    folderData.find((f: folder) =>
      f.pages.some((p: Page) => p.id === pageId)
    ) || null
  );
};

export const notification = notifications;
