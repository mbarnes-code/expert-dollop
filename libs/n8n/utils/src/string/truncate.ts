/**
 * Truncate text to a maximum length with ellipsis
 * 
 * @param text - The text to truncate
 * @param length - Maximum length (default: 30)
 * @returns Truncated text with ellipsis if needed
 */
export const truncate = (text: string, length = 30): string =>
  text.length > length ? text.slice(0, length) + '...' : text;

/**
 * Replace part of given text with ellipsis following the rules below:
 *
 * - Remove chars just before the last word, as long as the last word is under 15 chars
 * - Otherwise preserve the last 5 chars of the name and remove chars before that
 * 
 * @param text - The text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text with ellipsis
 */
export function truncateBeforeLast(text: string, maxLength: number): string {
  const chars: string[] = [];

  const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });

  for (const { segment } of segmenter.segment(text)) {
    chars.push(segment);
  }

  if (chars.length <= maxLength) {
    return text;
  }

  const lastWhitespaceIndex = chars.findLastIndex((ch) => ch.match(/^\s+$/));
  const lastWordIndex = lastWhitespaceIndex + 1;
  const lastWord = chars.slice(lastWordIndex);
  const ellipsis = '…';
  const ellipsisLength = ellipsis.length;

  if (lastWord.length < 15) {
    const charsToRemove = chars.length - maxLength + ellipsisLength;
    const indexBeforeLastWord = lastWordIndex;
    const keepLength = indexBeforeLastWord - charsToRemove;

    if (keepLength > 0) {
      return (
        chars.slice(0, keepLength).join('') + ellipsis + chars.slice(indexBeforeLastWord).join('')
      );
    }
  }

  return (
    chars.slice(0, maxLength - 5 - ellipsisLength).join('') + ellipsis + chars.slice(-5).join('')
  );
}
