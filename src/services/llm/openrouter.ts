import { OPENROUTER_BASE_URL, AI_CONFIG } from '../../utils/constants';
import type { OpenRouterRequest, OpenRouterResponse, AIError } from '../../types/ai';

async function fetchWithTimeout(url: string, options: RequestInit, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function callOpenRouter(
  request: OpenRouterRequest,
  apiKey: string,
  attempt = 0,
): Promise<string> {
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': window.location.origin,
    'X-Title': 'AI Wellness Companion',
  };

  let response: Response;
  try {
    response = await fetchWithTimeout(
      `${OPENROUTER_BASE_URL}/chat/completions`,
      { method: 'POST', headers, body: JSON.stringify(request) },
      AI_CONFIG.TIMEOUT_MS,
    );
  } catch (err) {
    const isAbort = err instanceof DOMException && err.name === 'AbortError';
    if (!isAbort && attempt < AI_CONFIG.MAX_RETRIES) {
      await delay(AI_CONFIG.RETRY_DELAY_MS * (attempt + 1));
      return callOpenRouter(request, apiKey, attempt + 1);
    }
    const error: AIError = {
      code: isAbort ? 'TIMEOUT' : 'API_ERROR',
      message: isAbort ? 'Request timed out' : 'Network error',
      retryable: !isAbort,
    };
    throw error;
  }

  if (response.status === 429) {
    if (attempt < AI_CONFIG.MAX_RETRIES) {
      await delay(AI_CONFIG.RETRY_DELAY_MS * 2 * (attempt + 1));
      return callOpenRouter(request, apiKey, attempt + 1);
    }
    const error: AIError = { code: 'RATE_LIMIT', message: 'Rate limit exceeded', retryable: true };
    throw error;
  }

  if (!response.ok) {
    const error: AIError = {
      code: 'API_ERROR',
      message: `API error ${response.status}`,
      retryable: response.status >= 500,
    };
    throw error;
  }

  const data: OpenRouterResponse = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    const error: AIError = {
      code: 'INVALID_RESPONSE',
      message: 'Empty response from AI',
      retryable: true,
    };
    throw error;
  }
  return content;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
