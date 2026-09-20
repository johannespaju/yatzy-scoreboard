import type { ICategory, TDieValue } from "./types";

const FACES: readonly TDieValue[] = [1, 2, 3, 4, 5, 6];

/** How many dice show each face, indexed by face (index 0 unused). */
function countFaces(dice: readonly TDieValue[]): number[] {
  const counts = [0, 0, 0, 0, 0, 0, 0];
  for (const die of dice) counts[die]++;
  return counts;
}

function sum(dice: readonly TDieValue[]): number {
  return dice.reduce<number>((total, die) => total + die, 0);
}

/** Faces that appear at least `min` times, highest first. */
function facesWithAtLeast(counts: number[], min: number): TDieValue[] {
  return FACES.filter((face) => counts[face] >= min).reverse();
}

function longestRun(counts: number[]): number {
  let longest = 0;
  let current = 0;
  for (const face of FACES) {
    current = counts[face] > 0 ? current + 1 : 0;
    longest = Math.max(longest, current);
  }
  return longest;
}

/** Score `dice` in `category`, or 0 if the dice don't qualify. */
export function scoreDice(category: ICategory, dice: readonly TDieValue[]): number {
  const scoring = category.scoring;
  const counts = countFaces(dice);

  switch (scoring.kind) {
    case "face":
      return counts[scoring.face] * scoring.face;

    case "ofAKind": {
      const [best] = facesWithAtLeast(counts, scoring.count);
      return best ? best * scoring.count : 0;
    }

    case "twoPairs": {
      const [high, low] = facesWithAtLeast(counts, 2);
      return high && low ? 2 * high + 2 * low : 0;
    }

    case "fullHouse": {
      const present = counts.filter((n) => n > 0).sort();
      return present.length === 2 && present[0] === 2 && present[1] === 3 ? sum(dice) : 0;
    }

    case "straight": {
      const distinct = facesWithAtLeast(counts, 1).reverse();
      const matches = distinct.length === scoring.faces.length && distinct.every((face, i) => face === scoring.faces[i]);
      return matches ? scoring.score : 0;
    }

    case "run":
      return longestRun(counts) >= scoring.length ? scoring.score : 0;

    case "yatzy":
      return facesWithAtLeast(counts, 5).length > 0 ? scoring.score : 0;

    case "chance":
      return sum(dice);
  }
}
