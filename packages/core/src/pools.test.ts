import { describe, expect, it } from 'vitest';
import type { Player } from './types';
import { buildPools } from './pools';

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

  function makePlayers(n: number): Player[] {
    return Array.from({ length: n }, (_, i) => ({
      id: `p${i + 1}`,
      lastName: `Player${i + 1}`,
      firstName: 'Test',
      club: `Club${i + 1}`,
      points: 2000 - i * 10,
    }));
  }
});
