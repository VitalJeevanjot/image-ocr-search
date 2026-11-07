// Helpers for finding image files and checking paths that the renderer
// sends over IPC. They have no Electron imports, so they run under plain
// Node and are covered by test/image-files.test.mjs.

import { readdir, stat } from "node:fs/promises";
import path from "node:path";

// The OCR pipeline only reads these formats. The check ignores case,
// so camera files such as IMG_0001.JPG are included.
export const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png"];

// True when the file name ends in a supported image extension.
export function isImageFile(fileName) {
  if (typeof fileName !== "string") return false;
  const ext = path.extname(fileName).slice(1).toLowerCase();
  return IMAGE_EXTENSIONS.includes(ext);
}

// True for an absolute path to a supported image file. The IPC handlers
// use this so a compromised renderer cannot read or open arbitrary files.
export function isAllowedImagePath(filePath) {
  return (
    typeof filePath === "string" &&
    path.isAbsolute(filePath) &&
    isImageFile(filePath)
  );
}

// Lists the image files directly inside each folder (not recursive).
// path.join builds paths with the right separator for each OS; the old
// code hard-coded "\\", which only worked on Windows. An unreadable
// folder or file is skipped, so one bad entry doesn't stop the scan.
export async function listImageFiles(folderPaths, fs = { readdir, stat }) {
  const filesPaths = [];
  for (const folder of folderPaths ?? []) {
    let entries;
    try {
      entries = await fs.readdir(folder);
    } catch (err) {
      console.log(`Skipping unreadable folder ${folder}: ${err.message}`);
      continue;
    }
    for (const entry of entries) {
      if (!isImageFile(entry)) continue;
      const fullPath = path.join(folder, entry);
      try {
        if ((await fs.stat(fullPath)).isFile()) filesPaths.push(fullPath);
      } catch (err) {
        console.log(`Skipping unreadable file ${fullPath}: ${err.message}`);
      }
    }
  }
  return filesPaths;
}
