# Playable Reference Parity Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Bring the playable to 1:1 visual and behavioral parity with the reference runner in Playbox.

**Architecture:** Keep the existing PixiJS game loop and state machine, but swap the remaining handwritten UI compositions for reference-matched asset layouts. Treat the current code as the gameplay backbone and focus changes on screen composition, asset placement, finish-line presentation, and verification via browser screenshots.

**Tech Stack:** PixiJS v8, TypeScript, Vite, Actionbook browser automation, `@imagegen` for missing assets.

---

### Task 1: Capture a baseline diff

**Files:**
- Modify: `src/main.ts`
- Modify: `src/Game.ts`
- Test: browser screenshots / Actionbook snapshots

**Step 1: Capture the local baseline**

Run: `npm run build`
Run: `actionbook --no-daemon --block-images --auto-dismiss-dialogs --no-animations --rewrite-urls browser fetch "https://playbox.play.plbx.ai/playoff/runner" --format text --json`

**Step 2: Record the current local screen flow**

Run: `npm run dev`
Run: browser screenshots on local `http://localhost:5173`

**Step 3: Write the mismatch list**

Document exact differences for:
- start screen
- tutorial overlay
- HUD / footer
- collectible art
- finish line
- win / lose / CTA screens

**Step 4: Commit the baseline notes**

Run: `git add docs/plans/2026-03-31-playable-reference-parity.md`
Run: `git commit -m "docs: add playable reference parity plan"`

### Task 2: Make the HUD and footer match the reference

**Files:**
- Modify: `src/HUD.ts`
- Modify: `src/utils/assets.ts` only if a missing texture alias is needed

**Step 1: Add a failing visual expectation**

Check that the HUD no longer uses ad-hoc PayPal iconography or extra text labels that are not present in the reference.

**Step 2: Implement the asset-driven layout**

Use the exact footer asset, money counter layout, and spacing from the reference.

**Step 3: Verify in browser**

Run: `npm run build`
Run: local browser screenshot comparison on the HUD and footer

### Task 3: Align the start and tutorial screens

**Files:**
- Modify: `src/screens/StartScreen.ts`
- Modify: `src/screens/TutorialOverlay.ts`

**Step 1: Capture the current start-state mismatch**

Check title placement, hand animation, overlay opacity, and spacing against the reference.

**Step 2: Recompose the screens**

Match the reference composition for:
- start prompt text
- hand pointer
- tutorial pause text
- overlay darkness

**Step 3: Verify in browser**

Run: `npm run build`
Run: browser screenshot comparison for the first two states

### Task 4: Replace the finish line with the reference assets

**Files:**
- Modify: `src/FinishRibbon.ts`
- Modify: `src/Level.ts` if finish visibility timing needs adjustment

**Step 1: Replace the hand-drawn ribbon**

Use the provided finish-line assets instead of the current procedural graphic.

**Step 2: Match the show/break timing**

Keep the finish trigger behavior, but make the visual break and reveal match the reference timing.

**Step 3: Verify in browser**

Run: `npm run build`
Run: a local playthrough that reaches the finish line

### Task 5: Rebuild win, lose, and CTA screens

**Files:**
- Modify: `src/screens/WinScreen.ts`
- Modify: `src/screens/LoseScreen.ts`
- Modify: `src/screens/CTAScreen.ts`

**Step 1: Use the captured assets**

Prefer the provided banner, fail, footer, and card imagery over handwritten shapes and extra copy.

**Step 2: Remove non-reference copy**

Drop any extra explanatory text that does not exist in the reference flow.

**Step 3: Match the button geometry**

Keep only the buttons that appear in the reference and align their size, placement, and color.

**Step 4: Verify in browser**

Run: `npm run build`
Run: screenshot comparison for win, lose, and CTA states

### Task 6: Generate only the missing assets, if any

**Files:**
- Create: `assets/<generated-file>.png` or `.webp` only if the reference requires a missing art piece
- Modify: `src/utils/assets.ts`

**Step 1: Decide whether an asset is actually missing**

Do not generate art unless the reference really uses something we do not already have.

**Step 2: Generate the asset with `@imagegen`**

Use `@imagegen` for any missing banner, icon, or panel art.

**Step 3: Wire the asset into the game**

Add the alias in `src/utils/assets.ts` and use it in the matching screen or HUD component.

**Step 4: Verify in browser**

Run: `npm run build`
Run: local screenshot comparison for the updated screen

### Task 7: Final parity pass

**Files:**
- Modify: any of `src/Game.ts`, `src/Level.ts`, `src/Player.ts`, `src/HUD.ts`, `src/screens/*`, `src/FinishRibbon.ts`

**Step 1: Compare side by side**

Review the reference and local screens in the same order:
- start
- play
- tutorial pause
- win
- lose
- CTA

**Step 2: Fix remaining spacing and scale mismatches**

Only change what is still visibly different.

**Step 3: Run the final verification**

Run: `npm run build`
Run: one complete local playthrough

**Step 4: Commit the parity pass**

Run: `git add .`
Run: `git commit -m "feat: align playable with reference flow"`
