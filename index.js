const express = require('express');
const ytdl = require('@distube/ytdl-core');
const ffmpeg = require('ffmpeg-static');
const cp = require('child_process');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send(`
    <h2>🎵 YouTube to MP3 Converter</h2>
    <form action="/download" method="get">
      <input type="text" name="url" placeholder="Enter YouTube URL" size="50" />
      <button type="submit">Convert to MP3</button>
    </form>
  `);
});

app.get('/download', async (req, res) => {
  const videoURL = req.query.url;

  if (!ytdl.validateURL(videoURL)) {
    return res.send('❌ Invalid YouTube URL!');
  }

  const info = await ytdl.getInfo(videoURL);
  const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');

  res.setHeader('Content-Disposition', `attachment; filename="${title}.mp3"`);

  const stream = ytdl(videoURL, { quality: 'highestaudio' });

  const ffmpegProcess = cp.spawn(ffmpeg, [
    '-i', 'pipe:3',
    '-f', 'mp3',
    '-ab', '192000',
    '-vn',
    'pipe:4',
  ], {
    stdio: [
      'inherit', 'inherit', 'inherit',
      'pipe', 'pipe'
    ]
  });

  stream.pipe(ffmpegProcess.stdio[3]);
  ffmpegProcess.stdio[4].pipe(res);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
