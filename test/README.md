# Tests

Plain `node` scripts — no dependencies, no build step. The game itself stays a static
PWA; these only load `js/*.js` and assert against the real functions.

```sh
npm test              # all four suites
npm run test:rest     # just one
npm run test:i18n
npm run test:chapters
npm run test:profiles
```

## rest.js — daily limit and bedtime pause

Guards the one feature whose failure is silent: a parent sets a 45-minute limit, and
either it stops play or it does not. There is nothing in the UI to reveal that the
enforcement has gone missing.

The rest screen's *visuals* come from the design project, but the enforcement
(`EQ.restState`, `EQ.restGuard`, `EQ.restNudge`, the `EQT.tick` exclusions) is
hand-written on top of it. A design re-sync can bring back the screen while dropping the
guards. If this test goes red after a re-sync, that is what happened — see
`EQ_REST_FREE` / `EQ_REST_NUDGE` in [js/app.js](../js/app.js).

Covers: the 45 min / 20:00 defaults, the limit and bedtime both stopping play, the stop
staying soft (grown-up area and already-earned rewards still reachable), bonus minutes
pushing both back without carrying into the next day, the pause screen not burning limit
minutes, the bedtime window closing at 05:00, and `limit: 0` meaning no limit.

## i18n.js — the three languages (az / en / ru)

Guards the other silent failure. The strings are not in locale files: they are ~840
inline `{az,en,ru}` objects sitting next to the screens that use them, so nothing
structural stops a new string from shipping with a language missing. `TX()` then falls
back to English and an Azerbaijani child just sees an English sentence — no error, no
warning. The design project is monolingual, so a re-sync is the likeliest way for this to
happen in bulk.

Two halves:

1. **A scanner** over `js/` that finds every `{az,en,ru}` literal and fails on a missing
   key. It matches braces while skipping strings, comments and `${...}` interpolations,
   because a regex cannot survive template literals full of `font:700` and nested braces.
   The suite also asserts a string-count floor and tests the scanner against synthetic
   sources, so a scanner that quietly stops matching cannot pass as "all complete".
2. **Unit tests for the language helpers**, which hold real linguistic logic worth
   pinning down: `RUP` (russian 1/2/5 plurals, including the 11–14 exception), `AZD`
   (azerbaijani ablative by vowel harmony — 6 → `altıdan`, 7 → `yeddidən`), `UPC`
   (dotted `İ` in az), and `TX`/`EQI.deep` resolution — `deep` must localize leaves while
   leaving answer arrays and visual-builder functions intact.

## chapters.js — the chapter structure (3 stages = 1 chapter)

Guards the story spine. The chapter framing used to be three hardcoded strings — the
details screen said `FƏSİL 2 / 3` no matter which stage the child was actually on. It is
now derived from `questDay` by `EQD.chapterAt()`, and every screen (details, story,
quest, map, boss, victory) reads its names, its beats and its boss out of
`EQD.CHAPTERS`. Chapters cycle when the list runs out, but the chapter *number* keeps
climbing, so stage 9 is "chapter 4" rather than a reset to 1.

Two things break silently here:

1. **The shape.** A chapter finale is the longer fight — 6 knowledge hits, not 4 — so
   the generated boss question pool has to hold at least six. Shorten it back to four
   and the sixth hit reuses or crashes on a missing question, with nothing in the UI to
   say so. The suite asserts pool depth ≥ boss hits for every stage of every chapter,
   including the hand-authored day 0 set.
2. **The content.** Each chapter needs a guardian *and* a finale, one beat per stage,
   every trilingual label both bosses use, and the arena colours the boss screen reads.
   A chapter added without a finale would quietly fall back to its guardian and that
   chapter would simply never feel like it ended.

The last half drives the real `EQ.answer()` / `EQ.nextStage()` through two whole
chapters — the state machine itself, not a reimplementation — asserting that stages 1–2
take four hits, stage 3 takes six, that clearing a finale rolls into the next chapter,
and that a finale pays the larger purse. It also renders all six chapter-facing screens
at every stage position in az/en/ru and fails on any `undefined` / `[object Object]` /
`NaN` reaching the markup.

Since the chapter text is ~150 new inline `{az,en,ru}` objects, `i18n.js` covers their
completeness; this suite covers whether the right one is chosen.

## profiles.js — several children on one phone

Guards the failure that cannot be undone. Each child owns a full copy of the game state
under their own `localStorage` key (`js/profiles.js`); the index only remembers who
exists and who is playing. If the per-child key is ever lost, two children share one
key and the second child's first save silently overwrites the first child's entire
adventure — no error, nothing on screen, and no way back.

The "Children" list and the switcher are design-project screens; the store beneath them
is hand-written, so a re-sync can restore the screens while dropping the keys. If this
suite goes red after a re-sync, that is what happened — see `EQP.key()` in
[js/profiles.js](../js/profiles.js).

It loads the real `js/profiles.js` on top of the real `js/app.js` and asserts the
promises the screen makes to the grown-up: a second child never writes over the first,
switching parks the current child's unsaved progress before loading the next (and
restores that child's language), removing erases only that child's storage, the last
child can never be removed, and removing whoever is playing hands the phone to someone
else without overwriting them on the way out.

Two details are load-bearing and pinned here. The first child keeps the *pre-profiles*
storage key, so an adventure that started before this feature existed simply becomes
child 1 — never migrated, never copied, never lost. And a damaged or unreadable index
falls back to that same single child rather than to a blank state, so a corrupt index
costs a grown-up nothing.
