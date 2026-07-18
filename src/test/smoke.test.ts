import { describe, expect, it } from 'vitest';

describe('test harness', () => {
  it('runs TypeScript tests in jsdom', () => {
    expect(document.createElement('div')).toBeInstanceOf(HTMLDivElement);
  });
});
