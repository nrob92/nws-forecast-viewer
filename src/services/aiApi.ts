import type { ForecastAiContext } from '../lib/aiContext';

export type AiMode = 'summary' | 'question';

type AiRequest = {
  mode: AiMode;
  context: ForecastAiContext;
  question?: string;
};

type AiResponse = {
  text: string;
};

export async function requestForecastAi(request: AiRequest): Promise<string> {
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  const payload = (await response.json()) as Partial<AiResponse> & { error?: string };

  if (!response.ok) {
    throw new Error(payload.error || 'AI request failed.');
  }

  if (!payload.text) {
    throw new Error('AI response did not include text.');
  }

  return payload.text;
}
