# Yatzy Scoreboard

Mobile-first scoreboard for Scandinavian Yatzy. Replaces the paper score pad: players roll
real dice, pass one phone around, and type in their scores. No backend.

## Stack

- Next.js (App Router, `src/`), React, TypeScript (strict)
- Tailwind CSS v4 (theme in `src/app/globals.css` via `@theme`)
- `useReducer` for state, localStorage for saving. No Zustand/Redux.
- Vitest for unit tests (`rules/`, `state/`); Playwright for E2E
- Static export (`output: 'export'`); will be hosted on AWS later.
  Don't use server-only features (API routes, server actions, middleware, image optimization).
- Frontend only. Anything that needs saving goes to localStorage.

## Commands

- `npm run dev`: dev server (`-- -H 0.0.0.0` to open on a phone)
- `npm run build`: static build to `out/`
- `npm test`: tests
- `npm run lint`: lint

## Rules (Scandinavian Yatzy, 5 dice)

| Category        | Score                                      |
|-----------------|--------------------------------------------|
| Ones–Sixes      | Sum of dice showing that face              |
| Bonus           | 50 if upper sum ≥ 63                       |
| One Pair        | Sum of the highest pair                    |
| Two Pairs       | Sum of two different pairs                 |
| Three of a Kind | Sum of the three matching dice             |
| Four of a Kind  | Sum of the four matching dice              |
| Small Straight  | 1-2-3-4-5 = 15                             |
| Large Straight  | 2-3-4-5-6 = 20                             |
| Full House      | 3 + 2 of different faces = sum of all dice |
| Chance          | Sum of all dice                            |
| Yatzy           | Five of a kind = 50                        |

Any category can be scratched (0). Max total is 374. Scores are typed in and checked against
each category's valid values, which are listed as data in the rule set.

## Structure

- `src/rules/`: rule sets as plain TypeScript data (categories, valid values, totals).
  The UI never hard-codes categories, so US Yahtzee can be added later.
- `src/state/`: pure game reducer + `useGame` hook (localStorage).
- `src/components/`: UI. `Game.tsx` is the `'use client'` entry point; `app/page.tsx` just renders it.
- Store only entered scores. Totals, bonus, current player and game over are calculated from them.
- Read localStorage only after mount (in `useEffect`) to avoid hydration errors.

## Conventions

- Interfaces are prefixed with `I` (`IPlayer`), enums with `E` (`ECategory`).

## Working style

- Ask before adding dependencies.
- This is a learning project: briefly explain what changed and why.