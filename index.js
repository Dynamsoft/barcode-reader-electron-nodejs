window.onload = () => {
  document.getElementById('file-selector').onchange = handleFileChange
  document.getElementById('file-select-btn').onclick = decodeFileAsync
  document.getElementById('file-selector').onclick = (e) => {e.target.value = ""}
  document.getElementById('video-capture-btn').onclick = initCamera
  document.getElementById('test-btn').onclick = decode1KTimes
  this.updateId = updateResultsPeriodically()
}

const services = require('./foreground-services.js')
const env = {
  cvs: new OffscreenCanvas(640, 360)
}

var capturing = false

function decode1KTimes() {
  let counter = 0
  var id = setInterval(() => {
    services.decodeFileAsync('/Users/jerrycha/Code/dbr-nodejs-electron/libs/nodejs-barcode/images/test.tif')
    counter += 1
    if (counter === 1000) {
      clearInterval(id)
    }
  }, 1000/30)
}

function decodeFileAsync() {
  document.getElementById('file-selector').click()
}

async function handleFileChange(evt) {
  const file = evt.target.files[0]
  const results = services.decodeFileAsync(file.path)
  // updateResults(results)
}

async function updateResults(results) {
  // Remove existing results
  const container = document.getElementById('result-box')
  container.innerHTML = ''
  const nodes = []
  results.forEach(result => {
    nodes.push(`<div class="result-card"> \
                  <p>Format: ${result.format}</p> \
                  <p>Text: ${result.value}</p> \
                </div>`
              )
  })
  container.innerHTML = nodes.join('')
}

function initCamera() {
  const framerate = 1
  // Create video element
  const video = document.querySelector('video') || document.createElement("video")
  const navigator = window.navigator
  const stream = navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'user', width: 640, height: 360 }
  })

  if (!capturing) {
    stream.then(stream => {
      video.srcObject = stream
      video.onplay = (evt) => {
        window.itvId = setInterval( ()=>{ getFrame(video) }, 1000/framerate)
      }
      const container = document.getElementById('video-container')
      container.innerHTML = ''
      container.appendChild(video)
      video.play()
      capturing = true
      services.startVideoDecode()
    })
    .catch(err => {
      console.error(err)
    })
  } else {
    stream.then(stream => {
      stream.getTracks().forEach(track => {
        track.stop()
      })
    })
      .then((stream) => {
        console.log(stream)
        document.getElementById('video-container').innerHTML = ''
        clearInterval(window.itvId)
        video.srcObject = null
        capturing = false
        services.stopVideoDecode()
      })
    // video.srcObject.getTracks().forEach(track => track.stop())
  }
}

function _base64ToUint8Array(base64) {
  const binStr = window.atob(base64)
  const length = binStr.length
  const bytes = new Uint8Array(length)
  for (let i = 0; i < length; i++)
    bytes[i] = binStr.charCodeAt(i)
  return bytes
}

function decodeFrameHandler(evt) {
  getFrame(document.querySelector('video'))
}

function getFrame(videoElement) {
  const cvs = env.cvs
  const ctx = cvs.getContext('2d')
  ctx.drawImage(videoElement, 0, 0, cvs.width, cvs.height)
  const imgData = ctx.getImageData(0, 0, cvs.width, cvs.height)
  decodeFromFrame(imgData)
}

async function decodeFromFrame(frame) {
  // const res = services.decodeBufferAsync(frame.data, frame.width, frame.height)
  services.setFrameBuffer(frame.data, frame.width, frame.height, 4)
  // updateResults(res.data)
}

function updateResultsPeriodically() {
  const buffer = services.resultBuffer
  return setInterval(() => updateResults(buffer.results), 1000/30)
}