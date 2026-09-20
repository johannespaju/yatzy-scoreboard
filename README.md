# Yatzy Scoreboard

Mobile-first scoreboard for Scandinavian Yatzy. Replaces the paper score pad: players roll
real dice, pass one phone around, and type in their scores. No backend — the current game is
saved in localStorage.

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
