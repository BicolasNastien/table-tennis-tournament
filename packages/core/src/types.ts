export type Id = string;

export interface Player {
  id: Id;
  lastName: string;
  firstName: string;
  club: string;
  points: number;
}

export interface Game {
  p1: number;
  p2: number;
}

export const GameError = {
  InvalidScore: 'invalid-score',
  BelowEleven: 'below-eleven',
  LoserTooHigh: 'loser-too-high',
  NotTwoPointsGap: 'not-two-points-gap'
} as const;

export type GameError = (typeof GameError)[keyof typeof GameError];

export const MatchKind = {
  Played: 'played',
  Forfeit: 'forfeit',
} as const;

export type MatchKind = (typeof MatchKind)[keyof typeof MatchKind];

interface Played {
  kind: typeof MatchKind.Played;
  p1: Id;
  p2: Id;
  games: Game[];
}

interface Forfeit {
  kind: typeof MatchKind.Forfeit;
  p1: Id;
  p2: Id;
  forfeiter: Id;
}

export type PlayedMatch = Played | Forfeit;

export interface Scoring {
  win: number;
  loss: number;
  forfeit: number;
}
