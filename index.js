window.onload = () => {
  document.getElementById('file-selector').onchange = handleFileChange
  document.getElementById('file-select-btn').onclick = decodeFileAsync
  document.getElementById('file-selector').onclick = (e) => {e.target.value = ""}
  document.getElementById('video-capture-btn').onclick = initCamera
  this.updateId = updateResultsPeriodically()
}

const services = require('./foreground-services.js')

// Video options
let videoConfig = {
  width: 640,
  height: 360
}

const env = {
  cvs: new OffscreenCanvas(videoConfig.width, videoConfig.height),
  updateFreq: 30  // Update frequency of results
}

var capturing = false // Video decoding indicator

function decodeFileAsync() {
  document.getElementById('file-selector').click()
}

async function handleFileChange(evt) {
  const file = evt.target.files[0]
  const results = services.decodeFileAsync(file.path)
}

async function updateResults(results) {
  // Remove existing results
  const container = document.getElementById('result-box')
  container.innerHTML = ''
  const nodes = []
  // Create result node DOM
  results.forEach(result => {
    nodes.push(`<div class="result-card"> \
                  <p>Format: ${result.format}</p> \
                  <p>Text: ${result.value}</p> \
                </div>`
              )
  })
  // Insert into the UI
  container.innerHTML = nodes.join('')
}

function initCamera() {
  const framerate = 1
  // Get/Create video element
  const video = document.querySelector('video') || document.createElement("video")
  const navigator = window.navigator  // window.navigator reference
  const stream = navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'user', width: videoConfig.width, height: videoConfig.height }
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
      .then(() => {
        document.getElementById('video-container').innerHTML = ''
        clearInterval(window.itvId)
        video.srcObject = null
        capturing = false
        services.stopVideoDecode()
      })
  }
}

// Get current frame of video by canvas
function getFrame(videoElement) {
  const cvs = env.cvs // Refer to the created canvas. One canvas is created only.
  const ctx = cvs.getContext('2d')
  ctx.drawImage(videoElement, 0, 0, cvs.width, cvs.height)
  const imgData = ctx.getImageData(0, 0, cvs.width, cvs.height)
  decodeFromFrame(imgData)
}

async function decodeFromFrame(frame) {
  services.setFrameBuffer(frame.data, frame.width, frame.height, 4)
}

/**
 * Update the result card
 */
function updateResultsPeriodically() {
  const buffer = services.resultBuffer
  return setInterval(() => updateResults(buffer.results), 1000/env.updateFreq)
}