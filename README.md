# Playable Runner

Single-file Pixi.js playable built as a clone of the Playoff Runner reference:
`https://playbox.play.plbx.ai/playoff/runner`

## What is included

- Core runner gameplay implemented from scratch in TypeScript + Pixi.js
- Single-file production build via Vite + `vite-plugin-singlefile`
- Inline assets in `dist/index.html`
- Automated coverage for gameplay state, audio, polish interactions, and smoke flows

## Local development

```bash
npm install
npm run dev
```

## Verification

```bash
npm test
npm run build
npm run size
npx playwright test tests/e2e/playable-smoke.spec.js
```

`npm run size` fails if `dist/index.html` grows beyond 5 MB.

For submission packaging:

```bash
npm run package:submission
```

For the full pre-send check:

```bash
npm run verify:submission
```

## Output

- Production bundle: `dist/index.html`
- Handoff-ready HTML file: `release/playable-runner.html`
- Current packaging mode: one self-contained HTML file with inlined scripts, styles, and assets

## Project structure

- `src/Game.ts`: main loop, state machine, collisions, end flow
- `src/Level.ts`: obstacle and reward spawning
- `src/Player.ts`: runner animation, jump, hurt, squash/stretch
- `src/Background.ts`: background art and moving road stripes
- `src/FinishRibbon.ts`: procedural finish ribbon with rope-style break
- `src/utils/sounds.ts`: synthesized SFX and music control
- `tests/`: Vitest + Playwright coverage
- `COMPARISON.md`: parity checklist against the reference

## Deployment

Any static host works because the final artifact is a single HTML file.

- GitHub Pages: publish `dist/index.html`
- Vercel: serve the built `dist/` directory as a static site
- Repo includes [vercel.json](/home/roxy/projects/playable/.worktrees/reference-parity/vercel.json) and [deploy-pages.yml](/home/roxy/projects/playable/.worktrees/reference-parity/.github/workflows/deploy-pages.yml)

## Notes

- Assets were extracted or rebuilt to match the reference creative direction
- Current git history already contains multiple scoped commits for the assignment review
