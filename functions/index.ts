export const truncateMiddle = (
  text: string,
  startChars: number,
  endChars: number
) => {
  if (text.length <= startChars + endChars) {
    return text; // No need to truncate if the text is already short
  }
  const start = text.slice(0, startChars); // Get the first part
  const end = text.slice(-endChars); // Get the last part
  return `${start}...${end}`;
};
