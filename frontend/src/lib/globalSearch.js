import { universalSearch } from "./universalSearch";

// Global search helper that scores common fields and falls back to universal search data
export const globalSearch = async (query, data) => {
  if (!query?.trim()) return [];

  const q = query.toLowerCase();
  const source = data ?? (await universalSearch(query))?.results ?? [];

  return source
    .map((item) => {
      // Fold additional metadata into the keyword space to improve matches
      const keywordPool = [
        item.keywords,
        item.subtitle,
        item.description,
        item.metadata?.company,
        item.metadata?.jobTitle,
        item.metadata?.location,
        Array.isArray(item.metadata?.skills) ? item.metadata.skills.join(" ") : undefined,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      let score = 0;

      if (item.title?.toLowerCase().includes(q)) score += 5;
      if (item.description?.toLowerCase().includes(q)) score += 3;
      if (keywordPool.includes(q)) score += 4;
      if (item.type?.toLowerCase().includes(q)) score += 2;

      // Preserve existing relevance if provided by universalSearch
      if (item.matchScore) score += item.matchScore;

      return score > 0 ? { ...item, score } : null;
    })
    .filter(Boolean)
    .sort((a, b) => (b.score || 0) - (a.score || 0));
};
