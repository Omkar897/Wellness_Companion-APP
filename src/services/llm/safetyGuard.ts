const CRISIS_PATTERNS = [
  /\b(kill|hurt|harm|suicide|end my life|not worth living|give up on life)\b/i,
  /\b(self.?harm|cut myself|don.?t want to exist)\b/i,
];

const UNSAFE_ADVICE_PATTERNS = [
  /\b(stop taking medication|don.?t see a doctor|ignore professional)\b/i,
];

export interface SafetyCheckResult {
  safe: boolean;
  crisisDetected: boolean;
  crisisMessage?: string;
  sanitizedText?: string;
}

export function checkInputSafety(text: string): SafetyCheckResult {
  for (const pattern of CRISIS_PATTERNS) {
    if (pattern.test(text)) {
      return {
        safe: false,
        crisisDetected: true,
        crisisMessage: getCrisisMessage(),
      };
    }
  }
  return { safe: true, crisisDetected: false };
}

export function checkResponseSafety(response: string): SafetyCheckResult {
  for (const pattern of UNSAFE_ADVICE_PATTERNS) {
    if (pattern.test(response)) {
      return {
        safe: false,
        crisisDetected: false,
        sanitizedText: sanitizeResponse(response),
      };
    }
  }

  for (const pattern of CRISIS_PATTERNS) {
    if (pattern.test(response)) {
      return {
        safe: false,
        crisisDetected: true,
        crisisMessage: getCrisisMessage(),
      };
    }
  }

  return { safe: true, crisisDetected: false };
}

function getCrisisMessage(): string {
  return `I can sense you're going through something very difficult right now. Please reach out for immediate support:

**iCall (India):** 9152987821
**Vandrevala Foundation:** 1860-2662-345 (24/7)
**iYouth (WhatsApp):** +919370198674

You don't have to face this alone. A trained counselor is available right now.`;
}

function sanitizeResponse(text: string): string {
  return text.replace(UNSAFE_ADVICE_PATTERNS[0], '[consult your doctor]');
}
