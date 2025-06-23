
# 🎥 Video Downloader (Railway-ready)

Fullstack Node.js server for downloading videos using yt-dlp with Telegram notifications.

## 🚀 How to Use

1. Set environment variables in Railway:
   - TELEGRAM_BOT_TOKEN
   - TELEGRAM_CHAT_ID

2. Deploy from GitHub.

3. `POST /api/download` with JSON:
```json
{
  "url": "https://youtube.com/...",
  "format": "mp3" or "mp4"
}
```
