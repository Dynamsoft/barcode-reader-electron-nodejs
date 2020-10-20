const { ipcRenderer } = require('electron')

const DEBUG = true

ipcRenderer.setMaxListeners(30)

const resultBuffer = {
  lastUpdate: null,
  results: []
}

const frameBuffer = {
  lastUpdate: null,
  imgData: Uint8ClampedArray.from([]),
  width: 0,
  height: 0,
  channel: 0,
  decoding: false
}

function setFrameBuffer(img, width, height, channel) {
  console.log('frame buffer to update')
  frameBuffer.imgData = img
  frameBuffer.width = width
  frameBuffer.height = height
  frameBuffer.channel = channel
  frameBuffer.lastUpdate = Date.now()
}

function startVideoDecode() {
  frameBuffer.decoding = true
  videoDecode()
}

function stopVideoDecode() {
  frameBuffer.decoding = false
}

function videoDecode() {
  ipcRenderer.send('videoDecode', frameBuffer.imgData, frameBuffer.width, frameBuffer.height)
}

ipcRenderer.on('videoDecode-next', (evt, msg) => {
  updateResultBuffer(msg)
  if (frameBuffer.decoding)
    videoDecode()
})

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
    setFrameBuffer,
    startVideoDecode,
    stopVideoDecode,
    resultBuffer
  }
