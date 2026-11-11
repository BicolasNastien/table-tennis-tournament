import { describe, expect, it } from 'vitest';
import type { Player, PoolDraft } from './types';
import { avoidClubConflicts, buildPools, poolMatchOrder } from './pools';

describe('buildPools (RG-03)', () => {
  it('names pools A to F for 22 players in pools of 4', () => {
    const pools = buildPools(makePlayers(22), 4);
    expect(pools.map((p) => p.letter)).toEqual(['A', 'B', 'C', 'D', 'E', 'F']);
  });

  it('More than 26 pools throw an error', () => {
    expect(() => buildPools(makePlayers(81), 3)).toThrow();
  });

  it('26 pools do not throw an error', () => {
    expect(() => buildPools(makePlayers(78), 3)).not.toThrow();
  });

  it('Pool sizes for 22 players in pools of 4', () => {
    const pools = buildPools(makePlayers(22), 4);
    const poolSizes = pools.map((p) => p.players.length);
    expect(poolSizes).toEqual([3, 3, 4, 4, 4, 4]);
  });

  it('Pool composition for 22 players ordered in pools of 4', () => {
    const pools = buildPools(makePlayers(22), 4);
    const composition = pools.map((p) => p.players.map((pl) => pl.id));
    expect(composition).toEqual([
      ['p1', 'p12', 'p13'],
      ['p2', 'p11', 'p14'],
      ['p3', 'p10', 'p15', 'p22'],
      ['p4', 'p9', 'p16', 'p21'],
      ['p5', 'p8', 'p17', 'p20'],
      ['p6', 'p7', 'p18', 'p19'],
    ]);
  });

  it('Pool composition for 22 players unordered in pools of 4', () => {
    const pools = buildPools(makePlayers(22).reverse(), 4);
    const composition = pools.map((p) => p.players.map((pl) => pl.id));
    expect(composition).toEqual([
      ['p1', 'p12', 'p13'],
      ['p2', 'p11', 'p14'],
      ['p3', 'p10', 'p15', 'p22'],
      ['p4', 'p9', 'p16', 'p21'],
      ['p5', 'p8', 'p17', 'p20'],
      ['p6', 'p7', 'p18', 'p19'],
    ]);
  });

  it('Players array is not modified after processing pools', () => {
    const players = makePlayers(22);
    const playersCopy = [...players];
    buildPools(players, 4);
    expect(players).toEqual(playersCopy);
  });
});

describe('avoidClubConflicts (RG-04)', () => {
  it('Simple switch (p1, p5 : X)', () => {
    const pools = buildPools(makePlayers(8, { p1: 'X', p5: 'X' }), 4);
    expect(ids(pools)).toEqual([
      ['p1', 'p4', 'p6', 'p8'],
      ['p2', 'p3', 'p5', 'p7'],
    ]);

    expect(pools.map((p) => p.clubConflicts)).toEqual([[], []]);
  });

  it('Head of series protected (p1, p4: : X)', () => {
    const pools = buildPools(makePlayers(8, { p1: 'X', p4: 'X' }), 4);
    expect(ids(pools)).toEqual([
      ['p1', 'p3', 'p5', 'p8'],
      ['p2', 'p4', 'p6', 'p7'],
    ]);

    expect(pools.map((p) => p.clubConflicts)).toEqual([[], []]);
  });

  it('Switch blocked (p1, p5 : X ; p4, p6 : Y)', () => {
    const pools = buildPools(makePlayers(8, { p1: 'X', p5: 'X', p4: 'Y', p6: 'Y' }), 4);
    expect(ids(pools)).toEqual([
      ['p1', 'p4', 'p5', 'p8'],
      ['p2', 'p3', 'p6', 'p7'],
    ]);

    expect(pools.map((p) => p.clubConflicts)).toEqual([
      [{ club: 'X', playerIds: ['p1', 'p5'] }],
      [],
    ]);
  });

  it('Impossible (8 players X)', () => {
    const pools = buildPools(
      makePlayers(8, { p1: 'X', p2: 'X', p3: 'X', p4: 'X', p5: 'X', p6: 'X', p7: 'X', p8: 'X' }),
      4,
    );
    expect(ids(pools)).toEqual([
      ['p1', 'p4', 'p5', 'p8'],
      ['p2', 'p3', 'p6', 'p7'],
    ]);

    expect(pools.map((p) => p.clubConflicts)).toEqual([
      [{ club: 'X', playerIds: ['p1', 'p4', 'p5', 'p8'] }],
      [{ club: 'X', playerIds: ['p2', 'p3', 'p6', 'p7'] }],
    ]);
  });

  it('Moves the lower-ranked player first (p4, p5 : X)', () => {
    const pools = buildPools(makePlayers(8, { p4: 'X', p5: 'X' }), 4);
    expect(ids(pools)).toEqual([
      ['p1', 'p4', 'p6', 'p8'],
      ['p2', 'p3', 'p5', 'p7'],
    ]);

    expect(pools.map((p) => p.clubConflicts)).toEqual([[], []]);
  });

  it('Falls back to the other player when the lower-ranked one cannot move (p4, p5 : X ; p6, p8 : Y)', () => {
    const pools = buildPools(makePlayers(8, { p4: 'X', p5: 'X', p6: 'Y', p8: 'Y' }), 4);
    expect(ids(pools)).toEqual([
      ['p1', 'p3', 'p5', 'p8'],
      ['p2', 'p4', 'p6', 'p7'],
    ]);

    expect(pools.map((p) => p.clubConflicts)).toEqual([[], []]);
  });

  it('Does not modify the input pools', () => {
    const [p1, p2, p3, p4, p5, p6, p7, p8] = makePlayers(8, { p1: 'X', p5: 'X' });
    const pools: PoolDraft[] = [
      { letter: 'A', players: [p1!, p4!, p5!, p8!], clubConflicts: [] },
      { letter: 'B', players: [p2!, p3!, p6!, p7!], clubConflicts: [] },
    ];
    const copy = structuredClone(pools);

    avoidClubConflicts(pools);

    expect(pools).toEqual(copy);
  });
});

describe('poolMatchOrder (RG-05)', () => {
  it('Pool match order for 3 as pool size', () => {
    expect(poolMatchOrder(3)).toEqual([
      [2, 3],
      [1, 3],
      [1, 2],
    ]);
  });

  it('Pool match order for 4 as pool size', () => {
    expect(poolMatchOrder(4)).toEqual([
      [1, 4],
      [2, 3],
      [1, 3],
      [2, 4],
      [3, 4],
      [1, 2],
    ]);
  });

  it('Pool match order for 5 as pool size', () => {
    expect(poolMatchOrder(5)).toEqual([
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
    ]);
  });

  it('Plays every pair exactly once for 6 players (circle method)', () => {
    const matchOrder = poolMatchOrder(6);
    const keys = matchOrder.map(([a, b]) => `${Math.min(a, b)}-${Math.max(a, b)}`);

    expect(matchOrder).toHaveLength(15);
    expect(new Set(keys).size).toBe(15);
    for (const [a, b] of matchOrder) {
      expect(a).not.toBe(b);
      expect([a, b].every((p) => p >= 1 && p <= 6)).toBe(true);
    }
  });

  it('Throw an error for poolsize > 6', () => {
    expect(() => poolMatchOrder(7)).toThrow('Invalid pool size 7 (expected 3 to 6).');
  });

  it('Throw an error for poolsize < 3', () => {
    expect(() => poolMatchOrder(2)).toThrow('Invalid pool size 2 (expected 3 to 6).');
  });

  it('each player plays once per round for 6 players', () => {
    const order = poolMatchOrder(6);
    for (let r = 0; r < 5; r++) {
      const round = order.slice(r * 3, r * 3 + 3);
      const players = round.flat().sort();
      expect(players).toEqual([1, 2, 3, 4, 5, 6]);
    }
  });

  it('Does not expose the internal rotation table', () => {
    const first = poolMatchOrder(3);
    first[0]![0] = 99;
    expect(poolMatchOrder(3)).toEqual([
      [2, 3],
      [1, 3],
      [1, 2],
    ]);
  });
});

function makePlayers(n: number, clubs: Record<string, string> = {}): Player[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `p${i + 1}`,
    lastName: `Player${i + 1}`,
    firstName: 'Test',
    club: clubs[`p${i + 1}`] ?? `Club${i + 1}`,
    points: 2000 - i * 10,
  }));
}

function ids(pools: PoolDraft[]): string[][] {
  return pools.map((p) => p.players.map((pl) => pl.id));
}
