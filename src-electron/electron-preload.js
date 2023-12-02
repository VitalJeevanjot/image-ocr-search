/**
 * This file is used specifically for security reasons.
 * Here you can access Nodejs stuff and inject functionality into
 * the renderer thread (accessible there through the "window" object)
 *
 * WARNING!
 * If you import anything from node_modules, then make sure that the package is specified
 * in package.json > dependencies and NOT in devDependencies
 *
 * Example (injects window.myAPI.doAThing() into renderer thread):
 *
 *   import { contextBridge } from 'electron'
 *
 *   contextBridge.exposeInMainWorld('myAPI', {
 *     doAThing: () => {}
 *   })
 *
 * WARNING!
 * If accessing Node functionality (like importing @electron/remote) then in your
 * electron-main.js you will need to set the following when you instantiate BrowserWindow:
 *
 * mainWindow = new BrowserWindow({
 *   // ...
 *   webPreferences: {
 *     // ...
 *     sandbox: false // <-- to be able to import @electron/remote in preload script
 *   }
 * }
 */

import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("imgSearchAPI", {
  selectFile: async () => {
    return await ipcRenderer.invoke("select-file");
  },
  openFolder: async () => {
    return await ipcRenderer.invoke("open-folder");
  },
  getImage: async (path) => {
    return await ipcRenderer.invoke("get-img", path);
  },
  startWorker: async () => {
    return await ipcRenderer.invoke("start-worker");
  },
  terminateWorker: async () => {
    return await ipcRenderer.invoke("terminate-worker");
  },
  processImg: async (img) => {
    return await ipcRenderer.invoke("process-img", img);
  },
  openImageInDefault: async (img) => {
    return await ipcRenderer.invoke("open-img", img);
  },
  getImageThumbnail: async (img) => {
    return await ipcRenderer.invoke("get-img-thumbnail", img);
  },
  searchTextInApp: async (text) => {
    return await ipcRenderer.invoke("search-text-in-app", text);
  },
  stopSearchTextInApp: async () => {
    return await ipcRenderer.invoke("stop-search-text-in-app");
  },
});
