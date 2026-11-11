import type { Id, Player, PoolDraft } from './types';

export function buildPools(players: Player[], poolSize: number): PoolDraft[] {
  const poolCount = Math.ceil(players.length / poolSize);

  // the naming process handle only to 26 letter A-Z.
  if (poolCount > 26) {
    throw new Error('Too many pools: 26 maximum (A to Z).');
  }

  const sorted = [...players].sort((a, b) => b.points - a.points);

  const pools: PoolDraft[] = Array.from({ length: poolCount }, (_, i) => ({
    letter: String.fromCharCode(65 + i),
    players: [],
    clubConflicts: [],
  }));

  sorted.forEach((player, i) => {
    const row = Math.floor(i / poolCount);
    const pos = i % poolCount;
    const poolIndex = row % 2 === 0 ? pos : poolCount - 1 - pos;
    pools[poolIndex]!.players.push(player);
  });

  return avoidClubConflicts(pools);
}

function hasClub(pool: PoolDraft, club: string, except: Player): boolean {
  for (const player of pool.players) {
    if (player.id === except.id) {
      continue;
    }

    if (player.club === club) {
      return true;
    }
  }

  return false;
}

function canSwap(poolA: PoolDraft, a: Player, poolB: PoolDraft, b: Player): boolean {
  return !hasClub(poolA, b.club, a) && !hasClub(poolB, a.club, b);
}

export function avoidClubConflicts(pools: PoolDraft[]): PoolDraft[] {
  const result = pools.map((p) => ({ ...p, players: [...p.players] }));

  for (const pool of result) {
    // RG-04: bottom-up, so the lower-ranked player of a conflict is moved first
    for (let row = pool.players.length - 1; row >= 1; row--) {
      const player = pool.players[row]!;

      if (!hasClub(pool, player.club, player)) {
        continue;
      }

      for (const other of result) {
        const candidate = other.players[row];
        if (other === pool || candidate === undefined) {
          continue;
        }

        if (canSwap(pool, player, other, candidate)) {
          [pool.players[row], other.players[row]] = [candidate, player];
          break;
        }
      }
    }
  }

  // US-11 : Notice residual conflicts
  for (const pool of result) {
    const byClub = new Map<string, Id[]>();
    for (const p of pool.players) {
      byClub.set(p.club, [...(byClub.get(p.club) ?? []), p.id]);
    }
    pool.clubConflicts = [...byClub]
      .filter(([, ids]) => ids.length >= 2)
      .map(([club, playerIds]) => ({ club, playerIds }));
  }

  return result;
}

// RG-05 : official rotation tables (favorites plays the last match)
const ROTATION: Record<number, [number, number][]> = {
  3: [
    [2, 3],
    [1, 3],
    [1, 2],
  ],
  4: [
    [1, 4],
    [2, 3],
    [1, 3],
    [2, 4],
    [3, 4],
    [1, 2],
  ],
  5: [
    [2, 5],
    [3, 4],
    [1, 5],
    [2, 4],
    [1, 3],
    [2, 3],
    [4, 5],
    [1, 4],
    [3, 5],
    [1, 2],
  ],
};

export function poolMatchOrder(size: number): [number, number][] {
  if (size < 3 || size > 6) {
    throw new Error(`Invalid pool size ${size} (expected 3 to 6).`);
  }

  const table = ROTATION[size];

  // Return a copy: the caller must not be able to modify the shared ROTATION table
  return table ? table.map(([a, b]) => [a, b]) : circleMethod(size);
}

function circleMethod(size: number): [number, number][] {
  const others = Array.from({ length: size - 1 }, (_, i) => i + 2);
  const matches: [number, number][] = [];

  for (let round = 0; round < size - 1; round++) {
    const last = others[others.length - 1]!;
    matches.push([1, last]);

    for (let i = 0; i < size / 2 - 1; i++) {
      matches.push([others[i]!, others[others.length - 2 - i]!]);
    }

    others.unshift(others.pop()!);
  }

  return matches;
}
