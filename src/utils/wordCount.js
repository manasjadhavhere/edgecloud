// src/utils/wordCount.js
// Processes raw responses into word frequency data for the word cloud

/**
 * Takes an array of response objects and returns a sorted word frequency map.
 * Each response has a `words` array (one entry per blank).
 *
 * @param {Array} responses - Array of { name, words: string[] } objects
 * @returns {Array} - [{ text: string, value: number }, ...] sorted by value desc
 */
export function computeWordFrequencies(responses) {
  const freq = {};

  for (const response of responses) {
    const words = response.words || [];
    for (const raw of words) {
      if (!raw) continue;
      // Tokenize: lowercase, split on whitespace/punctuation, filter short words
      const tokens = raw
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 1);

      for (const token of tokens) {
        freq[token] = (freq[token] || 0) + 1;
      }
    }
  }

  return Object.entries(freq)
    .map(([text, value]) => ({ text, value }))
    .sort((a, b) => b.value - a.value);
}

/**
 * Returns top N entries from the sorted frequency list.
 */
export function getTop(frequencies, n = 10) {
  return frequencies.slice(0, n);
}

/**
 * Generates a short random game ID (6 chars, alphanumeric)
 */
export function generateGameId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * Extracts blank placeholders from a sentence.
 * Returns number of __ occurrences.
 */
export function countBlanks(sentence) {
  return (sentence.match(/__/g) || []).length;
}
