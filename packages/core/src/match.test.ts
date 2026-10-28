import { describe, it, expect } from 'vitest';
import { validateGame } from './match';

describe('validateGame (RG-02)', () => {
  it('accept 11-9', () => expect(validateGame(11, 9)).toBeNull());
  it('reject 11-10', () => expect(validateGame(11, 10)).not.toBeNull());
  it('accept 12-10', () => expect(validateGame(12, 10)).toBeNull());
  it('reject 13-10', () => expect(validateGame(13, 10)).not.toBeNull());
});
