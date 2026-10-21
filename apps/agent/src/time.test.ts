import { afterEach, describe, expect, it, vi } from 'vitest';
import { getCurrentTime } from './time.js';

afterEach(() => vi.useRealTimers());

describe('get_current_time', () => {
  it('returns the time in the requested zone', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-22T09:00:00Z'));
    const result = await getCurrentTime.invoke({ timeZone: 'Asia/Tokyo' });
    expect(result).toContain('Asia/Tokyo');
    expect(result).toContain('18:00:00');
  });

  it('lets the agent recover from an invalid zone', async () => {
    expect(await getCurrentTime.invoke({ timeZone: 'Not/AZone' })).toContain(
      'Unknown time zone',
    );
  });
});
