/* jshint node: true */
'use strict'

const electron = require('electron')
const path = require('path')
const barista = require('./barista')
const fs = require('fs')
const exec = require('child_process').exec
const types = require('./utils/pagetypes')
const {
  ipcMain
} = electron
const {
  app,
  dialog,
  BrowserWindow
} = electron

const dirname = __dirname || path.resolve(path.dirname())
const location = `file://${dirname}/dist/index.html`

let mainWindow = null

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('ready', function onReady () {
  mainWindow = new BrowserWindow({
    width: 1000,
    minWidth: 900,
    height: 800,
    minHeight: 800,
    title: 'Ember Barista',
    titleBarStyle: process.platform === 'darwin' ? 'hidden-inset' : ''
  })

  delete mainWindow.module

  mainWindow.loadURL(location)

  mainWindow.webContents.on('did-fail-load', function () {
    mainWindow.loadURL(location)
  })

  mainWindow.on('closed', function () {
    mainWindow = null
  })

  process.on('uncaughtException', function (err) {
    console.log(`Exception: ${err}`)
  })
  ipcMain.on('get-types', (event) => {
    event.sender.send('types', types)
    event.returnValue = types
  })
  ipcMain.on('publish', (event, scenarios) => {
    console.log(JSON.stringify(scenarios))
    barista.generate({
      name: 'Test Name'
    }, scenarios).then(function (content) {
      dialog.showSaveDialog(function (file) {
        if (!file) return
        fs.writeFile(file, content, function (err) {
          if (!err)
            exec(`open ${file}`)
        })
      })
    })
  })
})
