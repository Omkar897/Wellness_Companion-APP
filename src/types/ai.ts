export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: 'json_object' };
}

export interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
  };
}

export interface WellnessResponse {
  explanation: string;
  copingStrategies: string[];
  mindfulnessExercise: string;
  encouragement: string;
}

export interface AIError {
  code: 'TIMEOUT' | 'RATE_LIMIT' | 'INVALID_RESPONSE' | 'SAFETY_BLOCK' | 'API_ERROR';
  message: string;
  retryable: boolean;
}
