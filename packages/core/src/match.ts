import { GameError } from "./types";

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

  if (winner > 11 && (winner - loser !== 2)) {
    return GameError.NotTwoPointsGap;
  }

  return null;
}
