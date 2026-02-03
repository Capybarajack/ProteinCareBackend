const ApiError = require('../utils/ApiError');
const httpStatus = require('../utils/httpStatus');

function getApiKey() {
  const direct = (process.env.OPENAI_API_KEY || '').trim();
  if (direct) return direct;

  // Optional: read from a file path (local dev). Do NOT expose this to clients.
  const filePath = (process.env.OPENAI_API_KEY_FILE || '').trim();
  if (filePath) {
    try {
      // eslint-disable-next-line global-require
      const fs = require('node:fs');
      const raw = fs.readFileSync(filePath, 'utf8');
      const key = String(raw || '').trim();
      if (key) return key;
    } catch {
      // fall through
    }
  }

  throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Missing OPENAI_API_KEY (or OPENAI_API_KEY_FILE)');
}

function buildPrompt() {
  return [
    'You are a nutritionist assistant. Analyze the food in the photo.',
    'Return STRICT JSON only (no markdown, no code fences).',
    'Schema:',
    '{',
    '  "summary": string,',
    '  "items": [',
    '    { "name": string, "estimated_portion": string, "calories_kcal": number, "protein_g": number, "carbs_g": number, "fat_g": number }',
    '  ],',
    '  "total": { "calories_kcal": number, "protein_g": number, "carbs_g": number, "fat_g": number },',
    '  "confidence": number,',
    '  "assumptions": string[]',
    '}',
    'Notes:',
    '- If uncertain, make conservative estimates and explain in assumptions.',
    '- If multiple foods, split into multiple items.',
  ].join('\n');
}

function extractOutputText(data) {
  // The raw HTTP Responses API JSON does not always include `output_text`.
  // SDKs provide conveniences; here we normalize by reading `output` messages.
  try {
    const out = Array.isArray(data?.output) ? data.output : [];
    const texts = [];

    for (const item of out) {
      if (!item || item.type !== 'message') continue;
      const content = Array.isArray(item.content) ? item.content : [];
      for (const c of content) {
        if (!c) continue;
        // Common content shapes:
        // { type: 'output_text', text: '...' }
        // Some providers may use { type: 'text', text: '...' }
        if ((c.type === 'output_text' || c.type === 'text') && typeof c.text === 'string') {
          texts.push(c.text);
        }
      }
    }

    return texts.join('\n').trim();
  } catch {
    return '';
  }
}

async function analyzeFoodImage({ imageDataUrl, detail = 'high' }) {
  if (!imageDataUrl || typeof imageDataUrl !== 'string' || !imageDataUrl.startsWith('data:image/')) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'imageDataUrl must be a data:image/... base64 URL');
  }

  // Rough size guard for base64 payload.
  if (imageDataUrl.length > 12_000_000) {
    throw new ApiError(httpStatus.PAYLOAD_TOO_LARGE, 'Image payload too large');
  }

  if (typeof fetch !== 'function') {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Global fetch is not available in this Node runtime');
  }

  const apiKey = getApiKey();
  const prompt = buildPrompt();

  const res = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      input: [
        {
          role: 'user',
          content: [
            { type: 'input_text', text: prompt },
            { type: 'input_image', image_url: imageDataUrl, detail },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new ApiError(
      httpStatus.BAD_GATEWAY,
      `OpenAI API error: ${res.status} ${res.statusText} ${errText ? `- ${errText.slice(0, 300)}` : ''}`
    );
  }

  const data = await res.json();
  const rawText = extractOutputText(data);

  let parsed = null;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    parsed = null;
  }

  return { result: parsed, rawText };
}

module.exports = {
  analyzeFoodImage,
};
