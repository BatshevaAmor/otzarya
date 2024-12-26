console.log('Initiation process working');
const {contextBridge, ipcRenderer, app, BrowserWindow, globalShortcut} = require('electron')
//const app = electron.app;
//const BrowserWindow = electron.BrowserWindow;
const path = require("path");
const url = require("url");
var fs = require('fs');
const {ipcMain} = require('electron/main');
let win;

//console.log(!!document)
function createWindow() {
    win = new BrowserWindow({
        width: 1700,
        height: 1100,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });
    win.loadURL(url.format({
// and load the index.html of the app.
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true
    }));
// Open the DevTools.
    win.webContents.openDevTools();
    win.on('closed', () => {
        win = null;
    });
}

app.on('ready', createWindow);
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});
app.on('activate', () => {
// On OS X it's common to re-create a window in the app when the
// dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
app.on('activate', () => {
    if (win === null) {
        createWindow()
    }
});

//ipcMain.on("button-clicked", (event, data) => console.log(data))

ipcMain.on('submit:todoForm', async (e, opt) => {
    const resp = await axios.post('http://127.0.0.1:8000/api/task', opt);
    const data = resp.data.task;
    win.webContents.send('task:added', {task: data});
});
ipcMain.on('file:upload', async (e, opt) => {
    var isWindows = process.platform === 'win32' || process.platform === 'win64'
    var getHome = isWindows ? process.env.USERPROFILE : process.env.HOME;
    console.log(getHome)
    const files = fs.readdirSync(getHome, {withFileTypes: true});
    console.log(files);
    for (var i in files) {
        var name = getHome + '/' + files[i].name;
        if (name.includes('.')) {
            files[i].type = 'file';
        } else {
            files[i].type = 'dir';
        }
    }
    win.webContents.send('upload:complete', files.filter(function (file) {
        return file.name.substring(0, 1) !== '.';
    }));
    return files;
});
ipcMain.on('go', async (e, opt) => {
    //console.log(e)
    console.log(opt)
    var isWindows = process.platform === 'win32' || process.platform === 'win64'
    var getHome = isWindows ? process.env.USERPROFILE : process.env.HOME;
    //const path = getHome + '/' + opt
    //console.log(path)///Users/batshevaamor/Postman
    const files = fs.readdirSync(opt, {withFileTypes: true});
    for (var i in files) {
        var name = getHome + '/' + files[i].name;
        if (name.includes('.')) {
            files[i].type = 'file';
        } else {
            files[i].type = 'dir';
        }
    }
    console.log(files);
    win.webContents.send('upload:complete', files.filter(function (file) {
        return file.name.substring(0, 1) !== '.';
    }));
    return files;
    /*fs.readdir(opt, {withFileTypes: true}, function (err, res) {
        if (err) console.log(err)
        console.log(res);
        win.webContents.send('upload:complete', res.filter(function (file) {
            return file.substring(0, 1) !== '.';
        }));
        return res;
    });*/
});
ipcMain.on('openn', async (e, opt) => {
    console.log('abc')
    console.log(opt)
    //const data = fs.readFileSync(opt, {encoding: 'utf8', flag: 'r'});
    openFile(opt);
    //console.log(data)
});


function reverse(name) {
    const parts = name.split('.');
    parts[parts.length - 1] = reverseFile(parts[parts.length - 1]);
    return parts.join('.');
}

function reverseFile(name) {
    const names = name.split('.');
    names[0] = names[0].reverse();
    return names.join('.');
}

ipcMain.on("button-clicked", (event, data) => console.log(data));


function openFile(_path) {
    let win2 = new BrowserWindow({
        width: 1700,
        height: 1100,
        webPreferences: {
            nodeIntegration: true,
            //defaultEncoding: 'UTF-8'
            preload: path.join(__dirname, 'preload.js')
        }
    });
    win2.loadURL(url.format({
        pathname: _path,
        protocol: 'file',
        slashes: true
    }))
    win2.webContents.executeJavaScript(`debugger;
        document.body.innerHTML = document.body.childNodes[0].textContent;
        document.dir='rtl';
        document.body.style.fontFamily='cursive';
        ipcRenderer.on('on-find', (e, args) => {
        debugger
            findInPage.openFindWindow();
        })
`);
    win2.webContents.on('found-in-page', (event, result) => {
        if (result.finalUpdate) win.webContents.stopFindInPage('clearSelection')
    })
    const parts = _path.split('/');
    win2.setTitle(parts.pop().split('.')[0]);
    win2.webContents.openDevTools();
    win2.on('closed', () => {
        win2 = null;
    });

    win2.on('focus', () => {
        globalShortcut.register('CmdorCtrl+F', () => {
            console.log('searching')
            win2.webContents.send('find_request', '');
        });
    });

    win2.webContents.on('found-in-page', (event, result) => {
        if (result.finalUpdate) {
            win2.webContents.stopFindInPage('keepSelection');
        }
    });
    ipcMain.on('search-text', (event, arg) => {
        win2.webContents.findInPage(arg);
    });

    win2.on('blur', () => {
        globalShortcut.unregister('CmdorCtrl+F');
    });
}