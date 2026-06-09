import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Loader2, Sparkles } from 'lucide-react';
import type { ForecastAiContext } from '../lib/aiContext';
import { requestForecastAi } from '../services/aiApi';

type AiForecastPanelProps = {
  context: ForecastAiContext | null;
};

const DISCLAIMER = 'AI-generated, based on official NWS data — not an official NWS product.';

const EXAMPLE_QUESTIONS = [
  'Do I need an umbrella tomorrow?',
  'Will it be windy this weekend?',
  'When is rain most likely?',
  'Should I plan outdoor activities Friday?',
  'Are there any active weather alerts?',
];

const EXAMPLE_ROTATION_MS = 4500;

export function AiForecastPanel({ context }: AiForecastPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [exampleIndex, setExampleIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const aiMutation = useMutation({
    mutationFn: (submittedPrompt: string) => {
      if (!context) {
        throw new Error('Forecast data is still loading.');
      }

      const question = submittedPrompt.trim();

      if (question) {
        return requestForecastAi({
          mode: 'question',
          question,
          context,
        });
      }

      return requestForecastAi({ mode: 'summary', context });
    },
  });

  const currentExample = EXAMPLE_QUESTIONS[exampleIndex] ?? EXAMPLE_QUESTIONS[0];
  const showExampleOverlay = !prompt.trim() && !isFocused;
  const isReady = Boolean(context);
  const isQuestion = Boolean(prompt.trim());
  const pendingLabel = isQuestion ? 'Generating answer...' : 'Generating summary...';

  useEffect(() => {
    if (prompt.trim()) {
      return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setExampleIndex((current) => (current + 1) % EXAMPLE_QUESTIONS.length);
    }, EXAMPLE_ROTATION_MS);

    return () => window.clearInterval(intervalId);
  }, [prompt]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isReady && !aiMutation.isPending) {
      aiMutation.mutate(prompt);
    }
  }

  function applyExample() {
    setPrompt(currentExample);
    inputRef.current?.focus();
  }

  return (
    <section aria-labelledby="ai-heading" className="workspace-panel">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 id="ai-heading" className="section-heading">
            AI interpretation
          </h2>
          <p className="section-copy">Grounded only in the NWS forecast and alerts loaded here.</p>
        </div>
        <Sparkles aria-hidden="true" className="mt-1 h-5 w-5 text-[#0b6e69]" />
      </div>

      <article className="rounded-md border border-[#d8dfd7] bg-[#fbfcfa] p-4">
        <p className="mb-3 text-xs leading-5 text-[#66727d]">
          Leave the field blank for a plain-language summary, or type a question about the loaded
          forecast and alerts.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <label htmlFor="forecast-ai-prompt" className="sr-only">
              Forecast summary or question
            </label>
            <input
              ref={inputRef}
              id="forecast-ai-prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="field"
              placeholder={isFocused ? currentExample : undefined}
              autoComplete="off"
            />
            {showExampleOverlay ? (
              <button
                type="button"
                className="absolute inset-y-0 left-0 right-0 truncate rounded-md px-[0.85rem] py-[0.72rem] text-left text-sm text-[#52616f] transition-colors hover:text-[#334554]"
                onClick={applyExample}
                aria-label={`Use example question: ${currentExample}`}
              >
                <span aria-hidden="true">{currentExample}</span>
              </button>
            ) : null}
          </div>
          <button
            type="submit"
            className="primary-button"
            disabled={!isReady || aiMutation.isPending}
          >
            {aiMutation.isPending ? (
              <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles aria-hidden="true" className="h-4 w-4" />
            )}
            {isQuestion ? 'Ask' : 'Summarize'}
          </button>
        </form>

        <p className="mt-2 text-xs text-[#66727d]">
          {showExampleOverlay ? 'Click the example question to use it.' : null}
        </p>

        <div
          className="mt-3 min-h-16 rounded-md border border-[#dde3dc] bg-white p-3 text-sm leading-6 text-[#334554]"
          aria-live="polite"
          aria-atomic="true"
        >
          {aiMutation.isPending ? <p>{pendingLabel}</p> : null}
          {aiMutation.isError ? (
            <p className="text-red-800">{errorMessage(aiMutation.error)}</p>
          ) : null}
          {aiMutation.data ? <p>{aiMutation.data}</p> : null}
          {!aiMutation.isPending && !aiMutation.isError && !aiMutation.data ? (
            <p className="text-[#66727d]">
              Official forecast cards and alerts stay visible below this interpretation.
            </p>
          ) : null}
        </div>
      </article>

      <p className="mt-4 text-xs font-semibold text-[#52616f]">{DISCLAIMER}</p>
    </section>
  );
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'AI request failed.';
}
