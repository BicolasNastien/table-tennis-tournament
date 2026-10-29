import { describe, it, expect } from 'vitest';
import { validateGame } from './match';
import { GameError } from './types';

describe('validateGame (RG-02)', () => {
  it('accept 11-9', () => expect(validateGame(11, 9)).toBeNull());
  it('accept 12-10', () => expect(validateGame(12, 10)).toBeNull());
  it('accept 0-11', () => expect(validateGame(0, 11)).toBeNull());
  it('accept 14-12', () => expect(validateGame(14, 12)).toBeNull());
  it('reject 11-10', () => expect(validateGame(11, 10)).toBe(GameError.LoserTooHigh));
  it('reject 13-10', () => expect(validateGame(13, 10)).toBe(GameError.NotTwoPointsGap));
  it('reject 5-3', () => expect(validateGame(5, 3)).toBe(GameError.BelowEleven));
  it('reject 11-11', () => expect(validateGame(11, 11)).toBe(GameError.LoserTooHigh));
  it('reject -1-11', () => expect(validateGame(-1, 11)).toBe(GameError.InvalidScore));
  it('reject 25-0', () => expect(validateGame(25, 0)).toBe(GameError.NotTwoPointsGap));
  it('reject 11-8.5', () => expect(validateGame(11, 8.5)).toBe(GameError.InvalidScore));
});
