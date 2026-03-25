# AI Video Searcher

Search any video for specific moments using plain English. Powered by Gemini. Day 11 of my [50 projects challenge](https://reneebe.github.io).

**[Live demo →](https://reneebe.github.io/ai-video-searcher/)**

## How it works

1. Enter your [Gemini API key](https://aistudio.google.com/apikey)
2. Upload a video (MP4, WebM, MOV, AVI)
3. Watch the animated progress while your video uploads and Gemini processes it
4. Type any plain-English query — "find moments where someone laughs", "when does text appear on screen", "every time there's a cut"
5. Get a list of clickable timestamps — click any to jump straight to that moment in the video
6. Run as many queries as you want against the same video without re-uploading

## Features

- **Plain English search** — no timecodes, no scrubbing, just describe what you're looking for
- **Multiple queries** — ask as many questions as you want after a single upload
- **Click to seek** — every result jumps the video player to that exact moment
- **Animated upload progress** — fun shimmer ring with rotating status messages
- **Your API key, your data** — key is stored in session only, cleared when you close the tab

## Model

Uses `gemini-3.1-pro-preview` via the Gemini Files API for video understanding.

## Stack

- [Vite](https://vite.dev/) + [React](https://react.dev/) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com/)
- Gemini Files API for video upload + processing
- Gemini generateContent API for timestamp extraction

## Running locally

```bash
npm install
npm run dev
```

You'll need a Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey).
