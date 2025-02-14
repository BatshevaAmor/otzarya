const { contextBridge, ipcRenderer } = require('electron');
const os = require('os');

contextBridge.exposeInMainWorld('electron', {
    homeDir: () => os.homedir(),
    osVersion: () => os.arch(),
});

contextBridge.exposeInMainWorld('ipcRenderer', {
    send: (channel, data) => ipcRenderer.send(channel, data),
    homeDir: () => os.homedir(),
    on: (channel, func) =>
        ipcRenderer.on(channel, (event, ...args) => func(event, ...args)),
});