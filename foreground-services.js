const { ipcRenderer } = require('electron')

const DEBUG = false

ipcRenderer.setMaxListeners(30)

const resultBuffer = {
  lastUpdate: null,
  results: []
}

function decodeFileAsync(filepath) {
  if (DEBUG)
    console.log('sending decodeFileAsync from renderer process with args: ' + filepath)
  // return new Promise(res => {
    ipcRenderer.send('decodeFileAsync', filepath)
  // })
}

function decodeBase64Async(base64Str) {
  if (DEBUG)
    console.log('sending decodeBase64Async from renderer process')
  // return new Promise(res => {
    ipcRenderer.send('decodeBase64Async', base64Str)
  // })
}

function decodeBufferAsync(imgData, width, height) {
  if (DEBUG)
    console.log('sending decodeBufferAsync from renderer process')
  // return new Promise(res => {
    ipcRenderer.send('decodeBufferAsync', imgData, width, height )
  // })
}

function updateResultBuffer(msg) {
  resultBuffer.lastUpdate = Date.now()
  resultBuffer.results = msg
}

ipcRenderer.on('decodeBufferAsync-done', (evt, msg) => {
  updateResultBuffer(msg)
})

ipcRenderer.on('decodeFileAsync-done', (evt, msg) => {
  updateResultBuffer(msg)
})

ipcRenderer.on('decodeBase64Async-done', (evt, msg) => {
  updateResultBuffer(msg)
})

  module.exports = {
    decodeFileAsync,
    decodeBase64Async,
    decodeBufferAsync,
    resultBuffer
  }
