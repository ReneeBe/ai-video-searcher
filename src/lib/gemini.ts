import type { UploadedFile, Timestamp } from '../types';

const BASE = import.meta.env.DEV
  ? '/api/gemini'
  : 'https://generativelanguage.googleapis.com';

const MODEL = 'gemini-3.1-pro-preview';

// Upload a video file to the Gemini Files API with XHR for progress tracking
export function uploadVideo(
  apiKey: string,
  file: File,
  onProgress: (pct: number) => void
): Promise<UploadedFile> {
  return new Promise((resolve, reject) => {
    // Step 1: initiate resumable upload
    fetch(`${BASE}/upload/v1beta/files?uploadType=resumable&key=${apiKey}`, {
      method: 'POST',
      headers: {
        'X-Goog-Upload-Protocol': 'resumable',
        'X-Goog-Upload-Command': 'start',
        'X-Goog-Upload-Header-Content-Length': String(file.size),
        'X-Goog-Upload-Header-Content-Type': file.type,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ file: { display_name: file.name } }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Upload init failed: ${res.status}`);
        const uploadUrl = res.headers.get('X-Goog-Upload-URL');
        if (!uploadUrl) throw new Error('No upload URL returned');
        return uploadUrl;
      })
      .then((uploadUrl) => {
        // Step 2: upload bytes via XHR for progress events
        const xhr = new XMLHttpRequest();
        xhr.open('POST', uploadUrl);
        xhr.setRequestHeader('Content-Length', String(file.size));
        xhr.setRequestHeader('X-Goog-Upload-Offset', '0');
        xhr.setRequestHeader('X-Goog-Upload-Command', 'upload, finalize');

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText);
            resolve({
              name: data.file.name,
              uri: data.file.uri,
              mimeType: data.file.mimeType,
              displayName: data.file.displayName,
            });
          } else {
            reject(new Error(`Upload failed: ${xhr.status} ${xhr.responseText}`));
          }
        };
        xhr.onerror = () => reject(new Error('Upload network error'));
        xhr.send(file);
      })
      .catch(reject);
  });
}

// Poll until the file state is ACTIVE
export async function waitForFile(apiKey: string, fileName: string): Promise<void> {
  for (let i = 0; i < 60; i++) {
    const res = await fetch(`${BASE}/v1beta/${fileName}?key=${apiKey}`);
    const data = await res.json();
    if (data.state === 'ACTIVE') return;
    if (data.state === 'FAILED') throw new Error('File processing failed');
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error('File processing timed out');
}

const TIMESTAMP_PROMPT = (query: string) => `
You are a video analysis assistant. Watch this entire video carefully.

Find every moment where: "${query}"

Return ONLY a valid JSON array with no markdown, no explanation. Each object must have:
{
  "timestamp": "MM:SS",
  "seconds": <number>,
  "description": "<one concise sentence describing exactly what's happening at this moment>"
}

If nothing matches, return [].
`.trim();

interface GeminiContent {
  candidates?: Array<{
    content: { parts: Array<{ text: string }> };
  }>;
}

export async function queryTimestamps(
  apiKey: string,
  file: UploadedFile,
  query: string
): Promise<Timestamp[]> {
  const res = await fetch(
    `${BASE}/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { fileData: { mimeType: file.mimeType, fileUri: file.uri } },
              { text: TIMESTAMP_PROMPT(query) },
            ],
          },
        ],
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: { message?: string } })?.error?.message ?? `HTTP ${res.status}`);
  }

  const data = (await res.json()) as GeminiContent;
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '[]';
  const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();

  try {
    return JSON.parse(cleaned) as Timestamp[];
  } catch {
    throw new Error('Gemini returned an unexpected response. Please try again.');
  }
}
