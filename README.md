# Yatzy Scoreboard

**Play it here: https://johannespaju.github.io/yatzy-scoreboard/**

Mobile-first scoreboard for Scandinavian and Best Yatzy. Replaces the paper score pad:
players roll real dice, pass one phone around, and type in their scores. No backend — the
current game is saved in localStorage.

## Rule sets

- **Scandinavian Yatzy** – the standard rules: 1-2-3-4-5 and 2-3-4-5-6 straights, Full House
  scored as the sum of the dice, 50-point bonus at 63.
- **Best Yatzy** – the house rules we play at home, and the preferred choice. Identical to
  Scandinavian except for the straights, which use the American scoring: any four in a row
  is a Small Straight worth 30, and any five in a row is a Large Straight worth 40.

## Development

```bash
npm install
npm run dev              # http://localhost:3000
npm run dev -- -H 0.0.0.0  # open on a phone on the same network
```

## Commands

| Command            | What it does                          |
|--------------------|---------------------------------------|
| `npm run dev`      | Dev server                            |
| `npm run build`    | Static export to `out/`               |
| `npm test`         | Unit tests (Vitest)                   |
| `npm run test:e2e` | End-to-end tests (Playwright)         |
| `npm run lint`     | Lint                                  |

## Structure

- `src/rules/` – rule sets as plain data (categories, valid values, totals)
- `src/state/` – pure game reducer, selectors and the `useGame` hook
- `src/components/` – UI grouped by feature
- `e2e/` – Playwright tests

See `CLAUDE.md` for the rules table and conventions.

## Deployment

Every push to `main` runs `.github/workflows/deploy.yml`, which runs the unit tests, builds the
static export with `BASE_PATH=/yatzy-scoreboard`, and publishes `out/` to GitHub Pages.
