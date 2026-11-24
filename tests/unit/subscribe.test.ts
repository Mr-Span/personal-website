import { describe, expect, it, vi } from 'vitest';
import { submitSubscription } from '../../src/lib/subscribe';

const BASE_CONFIG = {
  endpointUrl: 'https://buttondown.com/api/emails/embed-subscribe/claudiuspan',
  hostedUrl: 'https://buttondown.com/claudiuspan',
};

describe('SubscribeAdapter (Buttondown static form)', () => {
  it('silently accepts honeypot bot submissions without calling fetch', async () => {
    const mockFetch = vi.fn();
    const res = await submitSubscription('bot@spam.example', 'https://spam.example', {
      ...BASE_CONFIG,
      fetchImpl: mockFetch,
    });
    expect(res.status).toBe('success');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('rejects malformed email addresses client-side', async () => {
    const mockFetch = vi.fn();
    const res = await submitSubscription('not-an-email', '', {
      ...BASE_CONFIG,
      fetchImpl: mockFetch,
    });
    expect(res.status).toBe('blocked_or_error');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('returns success on HTTP 200 response', async () => {
    const mockFetch = vi.fn().mockResolvedValue(new Response('ok', { status: 200 }));
    const res = await submitSubscription('recruiter@company.com', '', {
      ...BASE_CONFIG,
      fetchImpl: mockFetch,
    });
    expect(res.status).toBe('success');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('returns rate_limited with hosted fallback on HTTP 429', async () => {
    const mockFetch = vi.fn().mockResolvedValue(new Response('rate limit', { status: 429 }));
    const res = await submitSubscription('recruiter@company.com', '', {
      ...BASE_CONFIG,
      fetchImpl: mockFetch,
    });
    expect(res.status).toBe('rate_limited');
    expect(res.fallbackUrl).toBe(BASE_CONFIG.hostedUrl);
  });

  it('returns blocked_or_error with hosted fallback on ad-blocker/CORS rejection', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    const res = await submitSubscription('recruiter@company.com', '', {
      ...BASE_CONFIG,
      fetchImpl: mockFetch,
    });
    expect(res.status).toBe('blocked_or_error');
    expect(res.fallbackUrl).toBe(BASE_CONFIG.hostedUrl);
  });

  it('aborts and returns fallback when timeout expires', async () => {
    const mockFetch = vi.fn(
      (_url: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new Error('Aborted')));
        }),
    );

    const res = await submitSubscription('recruiter@company.com', '', {
      ...BASE_CONFIG,
      timeoutMs: 25,
      fetchImpl: mockFetch,
    });
    expect(res.status).toBe('blocked_or_error');
    expect(res.fallbackUrl).toBe(BASE_CONFIG.hostedUrl);
  });
});
