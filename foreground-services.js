const { ipcRenderer } = require('electron')

const DEBUG = false

function decodeFileAsync(filepath) {
  if (DEBUG)
    console.log('sending decodeFileAsync from renderer process with args: ' + filepath)
  return new Promise(res => {
    ipcRenderer.send('decodeFileAsync', filepath)
    ipcRenderer.on('decodeFileAsync-done', (evt, msg) => {
      res(msg)
    })
  })
}

function decodeBase64Async(base64Str) {
  if (DEBUG)
    console.log('sending decodeBase64Async from renderer process')
  return new Promise(res => {
    ipcRenderer.send('decodeBase64Async', base64Str)
    ipcRenderer.on('decodeBase64Async-done', (evt, msg) => {
      res({ time: new Date(), data: msg })
    })
  })
}

function decodeBufferAsync(imgData, width, height) {
  if (DEBUG)
    console.log('sending decodeBufferAsync from renderer process')
    return new Promise(res => {
    ipcRenderer.send('decodeBufferAsync', imgData, width, height )
    ipcRenderer.on('decodeBufferAsync-done', (evt, msg) => {
      res({ time: new Date(), data: msg })
    })
  })
}

function testCapture() {
}

module.exports = {
  decodeFileAsync,
  decodeBase64Async,
  decodeBufferAsync
}