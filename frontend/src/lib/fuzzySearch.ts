/**
 * Simple fuzzy search implementation
 * Matches search term against target string, allowing for gaps
 */
export function fuzzyMatch(search: string, target: string): boolean {
  const searchLower = search.toLowerCase();
  const targetLower = target.toLowerCase();

  let searchIndex = 0;
  let targetIndex = 0;

  while (searchIndex < searchLower.length && targetIndex < targetLower.length) {
    if (searchLower[searchIndex] === targetLower[targetIndex]) {
      searchIndex++;
    }
    targetIndex++;
  }

  return searchIndex === searchLower.length;
}

/**
 * Calculate fuzzy match score (higher is better)
 * Factors:
 * - Consecutive character matches score higher
 * - Earlier matches score higher
 * - Exact substring matches score highest
 */
export function fuzzyScore(search: string, target: string): number {
  const searchLower = search.toLowerCase();
  const targetLower = target.toLowerCase();

  // Exact match gets highest score
  if (targetLower === searchLower) {
    return 1000;
  }

  // Exact substring match gets very high score
  if (targetLower.includes(searchLower)) {
    const startIndex = targetLower.indexOf(searchLower);
    // Earlier matches score higher
    return 500 - startIndex;
  }

  // Fuzzy match scoring
  if (!fuzzyMatch(search, target)) {
    return 0;
  }

  let score = 100;
  let searchIndex = 0;
  let consecutiveMatches = 0;

  for (let i = 0; i < targetLower.length && searchIndex < searchLower.length; i++) {
    if (targetLower[i] === searchLower[searchIndex]) {
      // Consecutive matches get bonus points
      consecutiveMatches++;
      score += consecutiveMatches * 2;

      // Earlier matches get bonus points
      score += Math.max(0, 20 - i);

      searchIndex++;
    } else {
      consecutiveMatches = 0;
    }
  }

  return score;
}

/**
 * Search and rank results by fuzzy match score
 */
export function fuzzySearch<T>(
  items: T[],
  search: string,
  getSearchText: (item: T) => string,
  limit = 10
): T[] {
  if (!search.trim()) {
    return items.slice(0, limit);
  }

  return items
    .map((item) => ({
      item,
      score: fuzzyScore(search, getSearchText(item)),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ item }) => item);
}
