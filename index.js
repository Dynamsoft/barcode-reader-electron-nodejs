window.onload = () => {
  document.getElementById('file-selector').onchange = handleFileChange
  document.getElementById('file-select-btn').onclick = decodeFileAsync
  document.getElementById('video-capture-btn').onclick = initCamera
}

const services = require('./foreground-services.js')

var capturing = false

function decodeFileAsync() {
  document.getElementById('file-selector').click()
}

async function handleFileChange(evt) {
  const file = evt.target.files[0]
  const results = await services.decodeFileAsync(file.path)
  updateResults(results)
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
  const framerate = 5
  // Create video element
  const video = document.querySelector('video') || document.createElement("video")
  const navigator = window.navigator
  const stream = navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'user', width: 1280, height: 720 }
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
    })
    .catch(err => {
      console.error(err)
    })
  } else {
    video.srcObject.getTracks().forEach(track => track.stop())
    document.getElementById('video-container').innerHTML = ''
    clearInterval(window.itvId)
    capturing = false
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
  const cvs = new OffscreenCanvas(640, 360)
  const ctx = cvs.getContext('2d')
  ctx.drawImage(videoElement, 0, 0, cvs.width, cvs.height)
  const imgData = ctx.getImageData(0, 0, cvs.width, cvs.height)
  decodeFromFrame(imgData)
}

async function decodeFromFrame(frame) {
  const res = await services.decodeBufferAsync(frame.data, frame.width, frame.height)
  updateResults(res.data)
}