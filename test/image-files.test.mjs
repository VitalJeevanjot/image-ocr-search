// Unit tests for src-electron/image-files.mjs.
// Run with `yarn test` (Node's built-in test runner, no extra dependencies).

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  isImageFile,
  isAllowedImagePath,
  listImageFiles,
} from "../src-electron/image-files.mjs";

test("isImageFile accepts jpg, jpeg and png in any case", () => {
  for (const name of ["a.jpg", "b.JPG", "c.jpeg", "d.Png", "e.PNG"]) {
    assert.equal(isImageFile(name), true, name);
  }
});

test("isImageFile rejects other files and bad input", () => {
  for (const name of ["a.gif", "notes.txt", "jpg", ".png", "archive.png.zip", ""]) {
    assert.equal(isImageFile(name), false, name);
  }
  assert.equal(isImageFile(undefined), false);
  assert.equal(isImageFile(42), false);
});

test("isAllowedImagePath needs an absolute path to an image", () => {
  const abs = path.join(tmpdir(), "scan.png");
  assert.equal(isAllowedImagePath(abs), true);
  assert.equal(isAllowedImagePath("scan.png"), false); // relative
  assert.equal(isAllowedImagePath(path.join(tmpdir(), "run.exe")), false);
  assert.equal(isAllowedImagePath(path.join(tmpdir(), "script.sh")), false);
  assert.equal(isAllowedImagePath(null), false);
  assert.equal(isAllowedImagePath(["/tmp/a.png"]), false);
});

test("listImageFiles finds images across folders with OS path separators", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "ocr-test-"));
  try {
    const a = path.join(root, "a");
    const b = path.join(root, "b");
    await mkdir(a);
    await mkdir(b);
    await mkdir(path.join(a, "nested.png")); // a folder named like an image
    await writeFile(path.join(a, "one.jpg"), "x");
    await writeFile(path.join(a, "TWO.PNG"), "x");
    await writeFile(path.join(a, "readme.txt"), "x");
    await writeFile(path.join(b, "three.jpeg"), "x");

    const found = await listImageFiles([a, b]);

    assert.deepEqual(found.sort(), [
      path.join(a, "TWO.PNG"),
      path.join(a, "one.jpg"),
      path.join(b, "three.jpeg"),
    ].sort());
    for (const p of found) assert.ok(path.isAbsolute(p), p);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("listImageFiles skips a missing folder and keeps scanning", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "ocr-test-"));
  try {
    await writeFile(path.join(root, "ok.png"), "x");
    const found = await listImageFiles([path.join(root, "missing"), root]);
    assert.deepEqual(found, [path.join(root, "ok.png")]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("listImageFiles handles empty or missing input", async () => {
  assert.deepEqual(await listImageFiles([]), []);
  assert.deepEqual(await listImageFiles(undefined), []);
});
