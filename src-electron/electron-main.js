import {
  app,
  BrowserWindow,
  dialog,
  nativeImage,
  ipcMain,
  shell,
} from "electron";
import { readdir, stat, readFile } from "node:fs/promises";
import path from "path";
import os from "os";
import Tesseract from "tesseract.js";

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
  createWindow();
});

function handleStopSearchTextInApp(event) {
  return mainWindow.webContents.stopFindInPage("clearSelection");
}
function handleSearchTextInApp(event, text) {
  return mainWindow.webContents.findInPage(text);
}

var worker1 = null;
var worker2 = null;
var worker3 = null;
var worker4 = null;
var worker5 = null;
var worker6 = null;
var worker7 = null;
var worker8 = null;
var scheduler = null;
async function handleStartWorker() {
  worker1 = await Tesseract.createWorker("eng", 1, {
    langPath: path.resolve("./public/languageData"),
  });

  worker2 = await Tesseract.createWorker("eng", 1, {
    langPath: path.resolve("./public/languageData"),
  });

  worker3 = await Tesseract.createWorker("eng", 1, {
    langPath: path.resolve("./public/languageData"),
  });

  worker4 = await Tesseract.createWorker("eng", 1, {
    langPath: path.resolve("./public/languageData"),
  });

  worker5 = await Tesseract.createWorker("eng", 1, {
    langPath: path.resolve("./public/languageData"),
  });

  worker6 = await Tesseract.createWorker("eng", 1, {
    langPath: path.resolve("./public/languageData"),
  });

  worker7 = await Tesseract.createWorker("eng", 1, {
    langPath: path.resolve("./public/languageData"),
  });

  worker8 = await Tesseract.createWorker("eng", 1, {
    langPath: path.resolve("./public/languageData"),
  });

  scheduler = await Tesseract.createScheduler();

  await scheduler.addWorker(worker1);
  await scheduler.addWorker(worker2);
  await scheduler.addWorker(worker3);
  await scheduler.addWorker(worker4);
  await scheduler.addWorker(worker5);
  await scheduler.addWorker(worker6);
  await scheduler.addWorker(worker7);
  await scheduler.addWorker(worker8);
}
async function handleTerminateWorker() {
  await scheduler.terminate();
}
async function processImage(event, img) {
  const result = await scheduler.addJob("recognize", img);
  // console.log(result.data.text);
  // const {
  //   data: { text },
  // } = await worker.recognize(img);
  return result.data.text;
}

async function getThumbnail(e, path) {
  let result = await nativeImage.createThumbnailFromPath(path, {
    width: 300,
    height: 300,
  });
  return result.toDataURL();
}

async function handleImageOpen(e, path) {
  let error = await shell.openPath(path);
  if (error) console.log(error);
}

function isImage(fileName) {
  const extensions = ["jpg", "png"];
  const ext = fileName.split(".").pop();
  return extensions.find((_ext) => _ext == ext);
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
    let dirContent = [];
    let filesPaths = [];

    try {
      for (let i = 0; i < folderPaths?.length; i++) {
        dirContent = await readdir(folderPaths[i]);
        // console.log(dirContent);
        for (let k = 0; k < dirContent?.length; k++) {
          const stats = await stat(`${folderPaths[i]}\\${dirContent[k]}`);
          const imageType = isImage(dirContent[k]);
          // console.log(k);
          if (stats.isFile() && imageType) {
            try {
              filesPaths.push(`${folderPaths[i]}\\${dirContent[k]}`);
            } catch (err) {
              console.log("err2");
              console.log(err);
            }
          }
        }
      }
    } catch (err) {
      console.log("err1");
      console.log(err);
    }
    return { filesPaths, folderPaths };
  } else {
    return 0;
  }
}

async function getImageData(event, path) {
  const contents = await readFile(path);
  // const base64Image = await Buffer.from(contents).toString("base64");
  // const dataUrl = `data:image/${isImage(path)};base64,${base64Image}`;
  return contents;
}
