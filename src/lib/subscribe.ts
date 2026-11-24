export type SubscribeStatus =
  | 'idle'
  | 'submitting'
  | 'success'
  | 'rate_limited'
  | 'blocked_or_error';

export interface SubscribeResult {
  status: SubscribeStatus;
  message: string;
  fallbackUrl?: string;
}

export interface SubscribeConfig {
  endpointUrl: string;
  hostedUrl: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Decoupled zero-secret static SubscribeAdapter (Buttondown public embed form endpoint).
 * Handles validation, honeypot bot guard, 8s AbortController timeout, rate limits,
 * and ad-blocker/CORS network failures with automatic hosted-page + RSS fallback.
 */
export async function submitSubscription(
  rawEmail: string,
  honeypot: string,
  config: SubscribeConfig,
): Promise<SubscribeResult> {
  const email = rawEmail.trim();

  // Silent discard for automated bots that populate the hidden honeypot field
  if (honeypot.trim().length > 0) {
    return {
      status: 'success',
      message: 'Check your inbox to confirm your subscription.',
    };
  }

  if (!EMAIL_RE.test(email)) {
    return {
      status: 'blocked_or_error',
      message: 'Please enter a valid email address.',
    };
  }

  const fetchFn = config.fetchImpl ?? globalThis.fetch;
  const timeoutMs = config.timeoutMs ?? 8_000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const body = new URLSearchParams({ email, embed: '1' });
    const response = await fetchFn(config.endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json, text/plain, */*',
      },
      body: body.toString(),
      signal: controller.signal,
    });

    if (response.status === 429) {
      return {
        status: 'rate_limited',
        message: 'Too many requests right now. Please try again in a minute or subscribe via the hosted form.',
        fallbackUrl: config.hostedUrl,
      };
    }

    if (response.ok) {
      return {
        status: 'success',
        message: 'Subscription requested. Please confirm the double opt-in email in your inbox.',
      };
    }

    return {
      status: 'blocked_or_error',
      message: 'Could not complete subscription directly from this browser. Use the hosted signup page or RSS feed below.',
      fallbackUrl: config.hostedUrl,
    };
  } catch {
    return {
      status: 'blocked_or_error',
      message:
        'Subscription request timed out or was blocked by browser privacy rules. Use the hosted signup page or RSS feed below.',
      fallbackUrl: config.hostedUrl,
    };
  } finally {
    clearTimeout(timer);
  }
}
