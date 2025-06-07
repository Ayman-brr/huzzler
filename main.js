import { initFFmpeg, generateVideos, splitSegments } from './extra.ts';

let videoFile, video, textBox, rotationInput, sizeInput, alignInput;

window.addEventListener("DOMContentLoaded", async () => {
  video = document.getElementById("video-preview");
  textBox = document.getElementById("text-box");
  rotationInput = document.getElementById("rotation");
  sizeInput = document.getElementById("font-size");
  alignInput = document.getElementById("align");

  document.getElementById("video-upload").addEventListener("change", handleUpload);
  document.getElementById("text-input").addEventListener("input", handleText);
  rotationInput.addEventListener("input", applyStyles);
  sizeInput.addEventListener("input", applyStyles);
  alignInput.addEventListener("change", applyStyles);
  document.getElementById("generate").addEventListener("click", generateAll);

  await initFFmpeg();
});

function handleUpload(e) {
  const file = e.target.files[0];
  videoFile = file;

  const url = URL.createObjectURL(file);
  video.src = url;

  video.onloadedmetadata = () => {
    video.style.aspectRatio = `${video.videoWidth}/${video.videoHeight}`;
  };
}

function handleText(e) {
  const segments = splitSegments(e.target.value);
  const output = document.getElementById("multi-text-output");
  output.innerHTML = `
    <p>${segments.length} video(s) will be generated.</p>
    <details><summary>View Segments</summary>
    <ul>${segments.map((s, i) => `<li><strong>Video ${i + 1}:</strong> ${s}</li>`).join("")}</ul>
    </details>
  `;
  textBox.innerText = segments[0];
}

function applyStyles() {
  const deg = rotationInput.value;
  const size = sizeInput.value;
  const align = alignInput.value;

  textBox.style.transform = `rotate(${deg}deg)`;
  textBox.style.fontSize = `${size}px`;
  textBox.style.textAlign = align;
}

async function generateAll() {
  const segments = splitSegments(document.getElementById("text-input").value);
  const status = document.getElementById("status");

  status.innerText = "Generating videos...";
  const position = textBox.getBoundingClientRect();
  const videoRect = video.getBoundingClientRect();

  const settings = {
    x: position.left - videoRect.left,
    y: position.top - videoRect.top,
    width: position.width,
    height: position.height,
    rotation: parseInt(rotationInput.value),
    fontSize: parseInt(sizeInput.value),
    align: alignInput.value,
    font: "Roboto"
  };

  await generateVideos(videoFile, segments, settings);

  status.innerText = "Export complete!";
}
