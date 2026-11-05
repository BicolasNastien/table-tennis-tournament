import { Id, Player, PoolDraft } from './types';

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
    for (let row = 1; row < pool.players.length; row++) {
      const player = pool.players[row]!;

      if (!hasClub(pool, player.club, player)) {
        continue;
      }

      for (const other of result) {
        const candidate = other.players[row];
        if (other.players === pool.players || candidate === undefined) {
          continue;
        }

        if (canSwap(pool, player, other, candidate)) {
          [pool.players[row], other.players[row]] = [candidate, player];
          break;
        }
      }
    }
  }
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
