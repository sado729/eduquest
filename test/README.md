# Tests

Plain `node` scripts — no dependencies, no build step. The game itself stays a static
PWA; these only load `js/*.js` and assert against the real functions.

```sh
npm test          # both suites
npm run test:rest # just one
npm run test:i18n
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
