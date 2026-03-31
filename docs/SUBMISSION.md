# Submission Checklist

## Deliverables

1. Hosted build URL
2. Git repository URL
3. Final single HTML file: `release/playable-runner.html`
4. Optional short approach summary

## Commands

```bash
npm install
npm run verify:submission
npm run package:submission
```

## What these commands produce

- `dist/index.html`: production single-file playable
- `release/playable-runner.html`: handoff-ready HTML file

## Hosting options

### Vercel

- Import the repository into Vercel
- Vercel uses [vercel.json](/home/roxy/projects/playable/.worktrees/reference-parity/vercel.json)
- Build command: `npm run build`
- Output directory: `dist`

### GitHub Pages

- Push the repository to GitHub
- Enable Pages with GitHub Actions
- The workflow in [.github/workflows/deploy-pages.yml](/home/roxy/projects/playable/.worktrees/reference-parity/.github/workflows/deploy-pages.yml) will build and publish `dist/`

## Current technical status

- Single-file HTML build: yes
- Bundle size under 5 MB: yes
- Source code preserved: yes
- Multiple meaningful commits: yes
- Finish ribbon with rope break: yes

## Before sending

- Replace placeholder repository URL with the final public repo
- Replace hosted build URL with the final production link
- Attach `release/playable-runner.html`
