import { BestOf, Game, GameError, MatchError, Outcome, Side } from './types';

function needed(bestOf: BestOf): number {
  return (bestOf + 1) / 2;
}

const NB_GAME_POINT = 11;

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
  const requiredSets = needed(bestOf);

  let p1SetCount = 0;
  let p2SetCount = 0;
  let p1PointCount = 0;
  let p2PointCount = 0;

  for (const game of games) {
    if (p1SetCount === requiredSets || p2SetCount === requiredSets) {
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

  if (p1SetCount < requiredSets && p2SetCount < requiredSets) {
    return MatchError.Incomplete;
  }

  return {
    winner: p1SetCount === requiredSets ? 'p1' : 'p2',
    sets: { p1: p1SetCount, p2: p2SetCount },
    points: { p1: p1PointCount, p2: p2PointCount },
  };
}

export function forfeitOutcome(forfeiter: Side, bestOf: BestOf): Outcome {
  const requiredSets = needed(bestOf);

  switch (forfeiter) {
    case 'p1':
      return {
        winner: 'p2',
        sets: { p1: 0, p2: requiredSets },
        points: { p1: 0, p2: requiredSets * NB_GAME_POINT },
      };
    case 'p2':
      return {
        winner: 'p1',
        sets: { p1: requiredSets, p2: 0 },
        points: { p1: requiredSets * NB_GAME_POINT, p2: 0 },
      };
  }
}
