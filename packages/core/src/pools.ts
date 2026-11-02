import { Player, PoolDraft } from './types';

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
  }));

  sorted.forEach((player, i) => {
    const row = Math.floor(i / poolCount);
    const pos = i % poolCount;
    const poolIndex = row % 2 === 0 ? pos : poolCount - 1 - pos;
    pools[poolIndex]!.players.push(player);
  });

  return pools;
}
