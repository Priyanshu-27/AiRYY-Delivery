
export const shortenFileName = fileName => {
  const maxLength = 10;
  if (fileName.length > maxLength) {
    return `${fileName.substring(0, maxLength)}...`;
  }
  return fileName;
};
