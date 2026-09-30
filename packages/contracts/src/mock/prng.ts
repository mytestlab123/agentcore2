/**
 * Small hand-written seeded PRNG. No external dependencies.
 *
 * mulberry32 is a well-known 32-bit generator: fast, tiny, and fully
 * deterministic for a given seed, which is exactly what the synthetic dataset
 * needs so tests can assert stable output across runs.
 */
export class SeededRandom {
  private state: number;

  constructor(seed: number) {
    // Force an unsigned 32-bit integer state.
    this.state = seed >>> 0;
  }

  /** Next float in [0, 1). */
  next(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Integer in [min, max] inclusive. */
  int(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1));
  }

  /** Pick one element from a non-empty array. */
  pick<T>(items: readonly T[]): T {
    if (items.length === 0) {
      throw new Error("SeededRandom.pick requires a non-empty array");
    }
    return items[this.int(0, items.length - 1)] as T;
  }

  /** Return true with probability p. */
  chance(p: number): boolean {
    return this.next() < p;
  }
}
