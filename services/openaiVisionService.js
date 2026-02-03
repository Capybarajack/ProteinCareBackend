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
  const rawText = String(data && data.output_text ? data.output_text : '');

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
