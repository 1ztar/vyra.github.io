# VYRA V12 — Precision Lyrics + Desktop Quality

Built from the user's bug-fixed `my-app.zip` as the source of truth.

## Precision synced lyrics
- Added `src/lib/components/SyncedLyrics.svelte`.
- Added shared timing helpers in `src/lib/lyricsEngine.js`.
- Lyrics use the precise Web Playback SDK interpolation clock instead of waiting for the global UI state frame.
- Active line is selected directly from the LRCLIB timestamp boundary with binary search.
- Current line progress is tied to the exact timestamp window between the current and next LRCLIB line.
- The lyric camera follows that timing continuously and is separate from line activation.
- Manual wheel/touch scrolling pauses camera-follow briefly so VYRA does not fight the user.
- Playback anchor is corrected for >60ms drift without forcing a whole-app rerender; large drift still performs the full player-state correction.
- Spotify player state is sampled every 750ms for tighter lyric-clock correction.
- Fullscreen, drawer, Focus Lyrics, and the new Inspector all use the same precision lyric engine.
- LRCLIB supplies line-level timestamps, not true word-level timestamps. VYRA does not pretend approximate word timing is exact.

## Desktop quality
- Resizable sidebar with keyboard-accessible resize handle; width persists.
- Unified right Inspector with Lyrics / Queue / Info tabs.
- Inspector width persists and is resizable.
- Bottom player gets an Inspector toggle.
- Continue Listening shelf on Home based on recent album listening history.
- Better artwork swap motion.

## Performance / library
- Added a true windowed `VirtualTrackList.svelte` for Liked Songs and local VYRA playlists.
- Only visible track rows plus a small buffer are mounted.
- Cmd/Ctrl click selects tracks; Shift click selects a range.
- Selected tracks can be played, queued, or removed in bulk where supported.
- Global player UI state is reduced to ~20fps while the precision lyric engine keeps its own RAF clock.

## Architecture
- Extracted lyric timing math to `$lib/lyricsEngine.js` so parent player state and lyric UIs share one implementation.

## Validation performed
- Svelte compiler parse/compile validation on all 37 `.svelte` files: 0 failures.
- Svelte compiler warnings: 0.
- JavaScript syntax check passed for all `src/**/*.js` files.
- CSS brace check: balanced (1361 / 1361).
- Full `npm run check` could not run in this Linux container because the uploaded Windows `node_modules` does not include Rolldown's Linux native binding. This is an environment/dependency-platform issue, not a Svelte parse failure.
