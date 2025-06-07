import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

const ffmpeg = createFFmpeg({ log: true });

export async function initFFmpeg() {
  if (!ffmpeg.isLoaded()) await ffmpeg.load();
}

export function splitSegments(input: string): string[] {
  return input
    .split(/\n\s*\.\.\s*\n/g)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

export async function generateVideos(videoFile: File, texts: string[], settings: any) {
  ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(videoFile));

  for (let i = 0; i < texts.length; i++) {
    const text = texts[i].replace(/"/g, '\\"');
    const drawText = [
      `fontsize=${settings.fontSize}`,
      `fontfile=/fonts/Roboto-Regular.ttf`,
      `fontcolor=white`,
      `x=${settings.x}`,
      `y=${settings.y}`,
      `text='${text}'`,
      `box=0`,
      `borderw=3`,
      `rotation=${settings.rotation}`
    ].join(':');

    await ffmpeg.run(
      '-i', 'input.mp4',
      '-vf', `drawtext=${drawText}`,
      `output${i}.mp4`
    );

    const data = ffmpeg.FS('readFile', `output${i}.mp4`);
    const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `video${i + 1}.mp4`;
    a.click();
  }
}
