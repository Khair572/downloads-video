
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DOWNLOAD_DIR = path.join(__dirname, 'downloads');
if (!fs.existsSync(DOWNLOAD_DIR)) fs.mkdirSync(DOWNLOAD_DIR);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.post('/api/download', (req, res) => {
  const { url, format } = req.body;
  if (!url || !format) return res.status(400).json({ error: 'URL dan format wajib diisi' });

  const timestamp = Date.now();
  const outputPath = path.join(DOWNLOAD_DIR, `video_${timestamp}.%(ext)s`);
  const ytCommand = format === 'mp3' 
    ? `yt-dlp --extract-audio --audio-format mp3 -o "${outputPath}" "${url}"`
    : `yt-dlp -f best -o "${outputPath}" "${url}"`;

  exec(ytCommand, async (error, stdout, stderr) => {
    if (error) {
      console.error("yt-dlp error:", stderr);
      return res.status(500).json({ error: 'Gagal mengunduh video' });
    }

    const downloaded = fs.readdirSync(DOWNLOAD_DIR).find(f => f.includes(`video_${timestamp}`));
    if (!downloaded) return res.status(404).json({ error: 'File tidak ditemukan' });

    const fullPath = path.join(DOWNLOAD_DIR, downloaded);
    const fileSize = (fs.statSync(fullPath).size / (1024 * 1024)).toFixed(1);

    try {
      await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: `📥 *Video berhasil diunduh*\n\n🔗 URL: ${url}\n📁 File: \\`${downloaded}\\`\n📏 Size: \\`${fileSize} MB\\``,
        parse_mode: 'Markdown'
      });
    } catch (e) {
      console.error("Telegram error:", e.message);
    }

    res.download(fullPath, downloaded, () => {
      fs.unlinkSync(fullPath);
    });
  });
});

app.listen(PORT, () => console.log(`✅ Server berjalan di http://localhost:${PORT}`));
