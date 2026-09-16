# Tests

Plain `node` scripts — no dependencies, no build step. The game itself stays a static
PWA; these only load `js/*.js` and assert against the real functions.

```sh
npm test          # or: node test/rest.js
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
