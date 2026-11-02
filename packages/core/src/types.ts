export type Id = string;

export interface Player {
  id: Id;
  lastName: string;
  firstName: string;
  club: string;
  points: number;
}

export type Game = Record<Side, number>;

export const GameError = {
  InvalidScore: 'invalid-score',
  BelowEleven: 'below-eleven',
  LoserTooHigh: 'loser-too-high',
  NotTwoPointsGap: 'not-two-points-gap',
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

export type BestOf = 3 | 5 | 7;

export type Side = 'p1' | 'p2';

export interface Outcome {
  winner: Side;
  sets: Record<Side, number>;
  points: Record<Side, number>;
}

export const MatchError = {
  Incomplete: 'incomplete',
  ExtraGames: 'extra-games',
} as const;

export type MatchError = (typeof MatchError)[keyof typeof MatchError];

export interface PoolDraft {
  letter: string;
  players: Player[];
}
