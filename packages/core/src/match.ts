import { BestOf, Game, GameError, MatchError, Outcome } from './types';

export function validateGame(a: number, b: number): GameError | null {
  const loser = Math.min(a, b);
  const winner = Math.max(a, b);

  if (loser < 0) {
    return GameError.InvalidScore;
  }

  if (!Number.isInteger(loser) || !Number.isInteger(winner)) {
    return GameError.InvalidScore;
  }

  if (winner < 11) {
    return GameError.BelowEleven;
  }

  if (winner === 11 && loser > 9) {
    return GameError.LoserTooHigh;
  }

  if (winner > 11 && winner - loser !== 2) {
    return GameError.NotTwoPointsGap;
  }

  return null;
}

export function matchOutcome(games: Game[], bestOf: BestOf): Outcome | MatchError {
  const needed = (bestOf + 1) / 2;

  let p1SetCount = 0;
  let p2SetCount = 0;
  let p1PointCount = 0;
  let p2PointCount = 0;

  for (const game of games) {
    if (p1SetCount === needed || p2SetCount === needed) {
      return MatchError.ExtraGames;
    }
    if (game.p1 > game.p2) {
      p1SetCount++;
    } else {
      p2SetCount++;
    }
    p1PointCount += game.p1;
    p2PointCount += game.p2;
  }

  if (p1SetCount < needed && p2SetCount < needed) {
    return MatchError.Incomplete;
  }

  return {
    winner: p1SetCount === needed ? 'p1' : 'p2',
    sets: { p1: p1SetCount, p2: p2SetCount },
    points: { p1: p1PointCount, p2: p2PointCount },
  };
}
