import { describe, it, expect } from 'vitest';
import { matchOutcome, validateGame, forfeitOutcome } from './match';
import { type Game, GameError, MatchError } from './types';

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

describe('matchOutcome (RG-01)', () => {
  it('p1 win 3-0 for best of 5', () => {
    expect(matchOutcome(games('11-8 11-5 11-3'), 5)).toEqual({
      winner: 'p1',
      sets: { p1: 3, p2: 0 },
      points: { p1: 33, p2: 16 },
    });
  });

  it('p1 win 3-2 for best of 5', () => {
    expect(matchOutcome(games('11-5 10-12 13-11 9-11 12-10'), 5)).toEqual({
      winner: 'p1',
      sets: { p1: 3, p2: 2 },
      points: { p1: 55, p2: 49 },
    });
  });

  it('p2 win 3-1 for best of 5', () => {
    expect(matchOutcome(games('0-11 1-11 12-10 12-14'), 5)).toEqual({
      winner: 'p2',
      sets: { p1: 1, p2: 3 },
      points: { p1: 25, p2: 46 },
    });
  });

  it('p2 win 2-1 for best of 3', () => {
    expect(matchOutcome(games('11-7 6-11 10-12'), 3)).toEqual({
      winner: 'p2',
      sets: { p1: 1, p2: 2 },
      points: { p1: 27, p2: 30 },
    });
  });

  it('p1 win 4-3 for best of 7', () => {
    expect(matchOutcome(games('11-9 9-11 11-7 7-11 11-6 6-11 17-15'), 7)).toEqual({
      winner: 'p1',
      sets: { p1: 4, p2: 3 },
      points: { p1: 72, p2: 70 },
    });
  });

  it('Empty list must return Incomplete MatchError', () => {
    expect(matchOutcome(games(''), 5)).toBe(MatchError.Incomplete);
  });

  it('4-0 for best of 5 must return ExtraGames MatchError', () => {
    expect(matchOutcome(games('11-8 11-5 12-10 11-0'), 5)).toBe(MatchError.ExtraGames);
  });

  it('3-0 followed by a game lost must return ExtraGames MatchError', () => {
    expect(matchOutcome(games('11-7 11-2 11-3 10-12'), 5)).toBe(MatchError.ExtraGames);
  });

  it('2-2 must return Incomplete MatchError', () => {
    expect(matchOutcome(games('11-3 12-10 3-11 10-12'), 5)).toBe(MatchError.Incomplete);
  });

  function games(score: string): Game[] {
    if (score === '') return [];
    return score.split(' ').map((g) => {
      const [p1, p2] = g.split('-').map(Number);
      return { p1: p1!, p2: p2! };
    });
  }
});

describe('forfeitOutcome (RG-07)', () => {
  it('forfeit from p1, best of 5', () => {
    expect(forfeitOutcome('p1', 5)).toEqual({
      winner: 'p2',
      sets: { p1: 0, p2: 3 },
      points: { p1: 0, p2: 33 },
    });
  });

  it('forfeit from p2, best of 5', () => {
    expect(forfeitOutcome('p2', 5)).toEqual({
      winner: 'p1',
      sets: { p1: 3, p2: 0 },
      points: { p1: 33, p2: 0 },
    });
  });

  it('forfeit from p1, best of 3', () => {
    expect(forfeitOutcome('p1', 3)).toEqual({
      winner: 'p2',
      sets: { p1: 0, p2: 2 },
      points: { p1: 0, p2: 22 },
    });
  });

  it('forfeit from p2, best of 7', () => {
    expect(forfeitOutcome('p2', 7)).toEqual({
      winner: 'p1',
      sets: { p1: 4, p2: 0 },
      points: { p1: 44, p2: 0 },
    });
  });
});
