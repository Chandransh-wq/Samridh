import { useEffect, useMemo, useState } from "react";
import { allFolders } from "../Services/user.service";
import type { folder } from "../DemoData";

export const useFolders = () => {
  const [folders, setFolders] = useState<folder[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshFolders = async () => {
    try {
      const data = await allFolders();
      setFolders(data);
    } finally {
      setLoading(false);
    }
  };

  // Logic: Derived Metrics (Recalculate automatically when folders state updates)
  const stats = useMemo(() => {
    let totalPages = 0;
    let totalFavorites = 0;
    const tagCounts: Record<string, number> = {};

    folders.forEach((f) => {
      totalPages += f.pages?.length || 0;
      if (f.favorite) totalFavorites++;

      // Count Folder & Page Tags
      [...(f.tags || []), ...f.pages.flatMap((p) => p.tags || [])].forEach(
        (tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        },
      );
    });

    return {
      totalPages,
      totalFavorites,
      tagCounts,
      totalFolders: folders.length,
    };
  }, [folders]);

  useEffect(() => {
    refreshFolders();
  }, []);

  return { folders, loading, ...stats, refreshFolders, setFolders };
};
