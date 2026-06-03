import type { Handler } from '@netlify/functions';
import OpenAI from 'openai';

type AiMode = 'summary' | 'question';

type ForecastAiPayload = {
  mode?: AiMode;
  question?: string;
  context?: unknown;
};

const MODEL = 'gpt-4o-mini';
const SYSTEM_PROMPT = [
  'You interpret official National Weather Service forecast and alert data for a public demo.',
  'Use only the provided JSON context. Do not invent, extrapolate, or predict weather beyond it.',
  'If the data does not answer the request, say the data does not cover that timeframe or detail.',
  'Do not say you checked live data. The app already supplied the data.',
].join(' ');

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Use POST for AI requests.' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return jsonResponse(500, { error: 'OPENAI_API_KEY is not configured.' });
  }

  let payload: ForecastAiPayload;

  try {
    payload = JSON.parse(event.body || '{}') as ForecastAiPayload;
  } catch {
    return jsonResponse(400, { error: 'Request body must be valid JSON.' });
  }

  const validationError = validatePayload(payload);
  if (validationError) {
    return jsonResponse(400, { error: validationError });
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      temperature: 0.2,
      max_tokens: payload.mode === 'summary' ? 110 : 130,
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: buildUserPrompt(payload),
        },
      ],
    });

    const text = completion.choices[0]?.message?.content?.trim();

    if (!text) {
      return jsonResponse(502, { error: 'OpenAI returned an empty response.' });
    }

    return jsonResponse(200, { text });
  } catch {
    return jsonResponse(502, { error: 'Unable to generate the AI forecast response right now.' });
  }
};

function validatePayload(payload: ForecastAiPayload) {
  if (payload.mode !== 'summary' && payload.mode !== 'question') {
    return 'Mode must be summary or question.';
  }

  if (!payload.context || typeof payload.context !== 'object') {
    return 'Forecast context is required.';
  }

  if (payload.mode === 'question' && !getQuestion(payload)) {
    return 'Question is required.';
  }

  return '';
}

function buildUserPrompt(payload: ForecastAiPayload) {
  const task =
    payload.mode === 'summary'
      ? 'Write a 2-3 sentence plain-language summary of this provided forecast and alerts. Mention active alerts if present. Keep it practical and do not add unsupported advice.'
      : `Answer this user question in 1-3 short sentences using only the provided forecast and alerts: "${getQuestion(payload)}"`;

  return JSON.stringify({
    task,
    forecastContext: payload.context,
  });
}

function getQuestion(payload: ForecastAiPayload) {
  return typeof payload.question === 'string' ? payload.question.trim() : '';
}

function jsonResponse(statusCode: number, payload: unknown) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify(payload),
  };
}
