// Modules to control application life and create native browser window
const {app, BrowserWindow, Tray} = require('electron')
var data = require('./data/products.json');

const locals = {products: data.products}
const setupPug = require('electron-pug')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

let createWindow = async () => {
  // Create the browser window.
  try {
    let pug = await setupPug({pretty: true}, locals)
    pug.on('error', err => console.error('electron-pug error', err))
  } catch (err) {
    // Could not initiate 'electron-pug'
  }
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 720,
    minHeight: 720,
    minWidth: 1200,
    webPreferences: {
      nodeIntegration: true
    },
    titleBarStyle: 'hidden',
    backgroundColor: '#2e2c29',
    icon: './images/logo.jpg' 
  })
  //mainWindow.webContents.openDevTools()
  // and load the index.html of the app.
  mainWindow.loadFile('./views/index.pug')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
    

  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
