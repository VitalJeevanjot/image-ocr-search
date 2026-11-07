// End-to-end test: launches the built Electron app, indexes the images in
// test/e2e/fixtures with the real Tesseract worker pool, then searches them.
//
// Run with `yarn test:e2e` (it builds the app first). Linux needs a display,
// so CI runs `xvfb-run -a yarn test:e2e`.

import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import playwright from "playwright-core";

const { _electron } = playwright;
const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const electronBinary = require("electron"); // resolves to the Electron executable
const appDir = path.join(root, "dist/electron/UnPackaged");
const fixtures = path.join(root, "test/e2e/fixtures");
const isLinux = process.platform === "linux";

const bodyIncludes = (win, text) =>
  win.waitForFunction((t) => document.body.innerText.includes(t), text, {
    timeout: 30_000,
  });

test("indexes a folder of images and finds them by their text", { timeout: 180_000 }, async () => {
  const app = await _electron.launch({
    executablePath: electronBinary,
    args: [...(isLinux ? ["--no-sandbox"] : []), appDir],
  });
  try {
    // Replace the native folder picker so the test can choose the fixtures.
    // createThumbnailFromPath only exists on macOS and Windows, so Linux
    // gets a simple resize instead.
    await app.evaluate(
      ({ dialog, nativeImage }, { dir, shimThumbnails }) => {
        dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [dir] });
        if (shimThumbnails) {
          nativeImage.createThumbnailFromPath = async (p, size) =>
            nativeImage.createFromPath(p).resize({ width: size.width });
        }
      },
      { dir: fixtures, shimThumbnails: isLinux }
    );

    const win = await app.firstWindow();
    await win.click("#button_main"); // Home: "Start indexing"
    await win.waitForURL(/filesIndexing/);
    await win.click("#button_main"); // Pick folder (stubbed) and start OCR
    await win.waitForSelector("#button_main", { state: "detached" });
    await win.waitForSelector("#button_main", { timeout: 120_000 }); // back when done

    await win.click('button:has(i:text-is("arrow_back"))');
    await win.click('button:has(i:text-is("image_search"))');

    // Five images are indexed and todo.txt is skipped. IMG_0042.JPG and
    // meeting-notes.jpeg are only found since extensions ignore case and
    // .jpeg counts.
    await bodyIncludes(win, "1 / 1 (5)");

    // "invoice" is in the text of two images, not in both file names.
    await win.fill("input.q-field__native", "invoice");
    await win.press("input.q-field__native", "Enter");
    await bodyIncludes(win, "1 / 1 (2)");
    const body = await win.innerText("body");
    assert.match(body, /invoice-1042\.png/);
    assert.match(body, /meeting-notes\.jpeg/);
  } finally {
    await app.close();
  }
});
