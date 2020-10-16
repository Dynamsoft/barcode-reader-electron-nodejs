const { ipcMain } = require('electron')
const dbr = require('./libs/nodejs-barcode/index')
const barcodeTypes = dbr.barcodeTypes

const DEBUG = false

function decodeFileAsync(evt, filepath) {
  if (DEBUG)
    console.log('ipcMain: decodeFileAsync invoked: ' + filepath)
    dbr.decodeFileAsync(filepath, barcodeTypes, (err, msg) => {
      if (err)
        console.log(err)
      let results = [];
      for (index in msg) {
        let result = Object()
        let res = msg[index];
        result.format = res['format']
        result.value = res['value']
        results.push(result)
      }
      evt.reply('decodeFileAsync-done', results)
    })
}

function decodeBase64Async(evt, base64Str) {
  if (DEBUG)
    console.log('ipcMain: decodeBase64Async is invoked')
  dbr.decodeBase64Async(base64Str, barcodeTypes, (err, msg) => {
    if (err)
      console.error(err)
    let results = [];
    for (index in msg) {
      let result = Object()
      let res = msg[index];
      result.format = res['format']
      result.value = res['value']
      results.push(result)
    }
    evt.reply('decodeBase64Async-done', results)
  })
}

function decodeBufferAsync(evt, imgData, width, height) {
  if (DEBUG)
    console.log('ipcMain: decodeBufferAsync is invoked')
  dbr.decodeBufferAsync(imgData, width, height, width*4, barcodeTypes, (err, msg) => {
    if (err)
      console.error(err)
    let results = [];
    for (index in msg) {
      let result = Object()
      let res = msg[index];
      result.format = res['format']
      result.value = res['value']
      results.push(result)
    }
    evt.reply('decodeBufferAsync-done', results)
  })
}

function register() {
  if (DEBUG)
    console.log('background service to register')
  ipcMain.on('decodeFileAsync', decodeFileAsync)
  ipcMain.on('decodeBase64Async', decodeBase64Async)
  ipcMain.on('decodeBufferAsync', decodeBufferAsync)
}

module.exports = {
  register
}