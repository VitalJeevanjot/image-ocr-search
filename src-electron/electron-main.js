import {
  app,
  BrowserWindow,
  dialog,
  nativeImage,
  ipcMain,
  shell,
} from "electron";
import { readFile } from "node:fs/promises";
import path from "path";
import os from "os";
import Tesseract from "tesseract.js";
import { isAllowedImagePath, listImageFiles } from "./image-files.mjs";

// needed in case process is undefined under Linux
const platform = process.platform || os.platform();

let mainWindow;

function createWindow() {
  /**
   * Initial window options
   */
  // console.log(path.resolve(__dirname));
  mainWindow = new BrowserWindow({
    icon: path.resolve(__dirname, "icons/icon.png"), // tray icon
    width: 1000,
    height: 600,
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      // More info: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/electron-preload-script
      preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
    },
  });

  mainWindow.loadURL(process.env.APP_URL);

  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    mainWindow.webContents.openDevTools();
  } else {
    // we're on production; no access to devtools pls
    mainWindow.webContents.on("devtools-opened", () => {
      mainWindow.webContents.closeDevTools();
    });
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.on("window-all-closed", () => {
  if (platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.whenReady().then(() => {
  ipcMain.handle("select-file", handleFileSelect);
  ipcMain.handle("open-folder", handleFolderOpen);
  ipcMain.handle("get-img", getImageData);
  ipcMain.handle("open-img", handleImageOpen);
  ipcMain.handle("get-img-thumbnail", getThumbnail);
  ipcMain.handle("start-worker", handleStartWorker);
  ipcMain.handle("terminate-worker", handleTerminateWorker);
  ipcMain.handle("process-img", processImage);
  ipcMain.handle("search-text-in-app", handleSearchTextInApp);
  ipcMain.handle("stop-search-text-in-app", handleStopSearchTextInApp);
  ipcMain.handle("increase-workers", handleIncreasingWorkers);
  ipcMain.handle("get-number-of-workers", handleGettingTotalNumberOfWorkers);
  createWindow();
});

function handleStopSearchTextInApp(event) {
  return mainWindow.webContents.stopFindInPage("clearSelection");
}
function handleSearchTextInApp(event, text) {
  return mainWindow.webContents.findInPage(text);
}

var workers = [];
var schedulers = [];
var totalSchedulers = 4;
var currentSchedulers = 0;
async function handleStartWorker() {
  // Reset both lists together: processImage pairs schedulers[i] with
  // workers[i], so stale schedulers from an earlier run would misalign them.
  workers = [];
  schedulers = [];
  currentSchedulers = 0;
  for (let i = 0; i < totalSchedulers; i++) {
    schedulers.push(await Tesseract.createScheduler());
    workers.push(
      await Tesseract.createWorker("eng", 1, {
        langPath: path.resolve(__dirname),
      })
    );
    currentSchedulers++;
    await schedulers[i].addWorker(workers[i]);
  }
}

async function handleIncreasingWorkers() {
  let worker = await Tesseract.createWorker("eng", 1, {
    langPath: path.resolve(__dirname),
  });
  workers.push(worker);
  schedulers.push(await Tesseract.createScheduler());
  await schedulers[schedulers.length - 1].addWorker(worker);
  currentSchedulers++;
  return currentSchedulers;
}
async function handleGettingTotalNumberOfWorkers() {
  if (schedulers) {
    return currentSchedulers;
  }
}

async function handleTerminateWorker() {
  // console.log(schedulers);
  if (schedulers) {
    for (var i = 0; i < workers.length; i++) {
      await schedulers[i].terminate();
      // console.log("£££Terminated");
    }
    schedulers = [];
  }
  if (workers) {
    for (var i = 0; i < workers.length; i++) {
      // console.log("Terminating " + i);
      await workers[i].terminate();
    }
    workers = [];
  }
  currentSchedulers = 0;
}
async function processImage(event, img) {
  var result = [];
  // console.log(schedulers);
  let _schedulers = img.length;

  let _result = [];
  for (var i = 0; i < _schedulers; i++) {
    // A path that isn't an image yields empty text instead of being read,
    // so the result array still lines up with the renderer's batch.
    _result.push(
      isAllowedImagePath(img[i])
        ? schedulers[i].addJob("recognize", img[i])
        : Promise.resolve({ data: { text: "" } })
    );
    // console.log("pushed job in scheduler-> " + i);
    // console.log(_result);
  }
  result = (await Promise.all(_result)).map((a) => a.data.text);
  // console.log(result);
  // return result;
  // console.log(result.data.text);
  // const {
  //   data: { text },
  // } = await worker.recognize(img);
  return result;
}

async function getThumbnail(e, path) {
  if (!isAllowedImagePath(path)) return null;
  let result = await nativeImage.createThumbnailFromPath(path, {
    width: 300,
    height: 300,
  });
  return result.toDataURL();
}

async function handleImageOpen(e, path) {
  // Only hand image files to the OS. shell.openPath would also launch
  // executables if the renderer ever sent one.
  if (!isAllowedImagePath(path)) return;
  let error = await shell.openPath(path);
  if (error) console.log(error);
}

async function handleFileSelect(e) {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: "Select directories with jpg/png",
    properties: ["openFile"],
    filters: [{ name: "Images", extensions: ["jpg", "png"] }],
  });
  return filePaths[0];
}
async function handleFolderOpen(event) {
  //  console.log("inside dialog -> " + Date().toString())
  //  return "nothing"
  const { canceled, filePaths: folderPaths } = await dialog.showOpenDialog({
    title: "Select directories with jpg/png",
    properties: ["openDirectory", "multiSelections"],
  });
  if (!canceled) {
    const filesPaths = await listImageFiles(folderPaths);
    return { filesPaths, folderPaths };
  } else {
    return 0;
  }
}

async function getImageData(event, path) {
  if (!isAllowedImagePath(path)) return null;
  const contents = await readFile(path);
  // const base64Image = await Buffer.from(contents).toString("base64");
  // const dataUrl = `data:image/${isImage(path)};base64,${base64Image}`;
  return contents;
}
