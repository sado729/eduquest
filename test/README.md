# Tests

Plain `node` scripts — no dependencies, no build step. The game itself stays a static
PWA; these only load `js/*.js` and assert against the real functions.

```sh
npm test              # all nine suites
npm run test:rest     # just one
npm run test:i18n
npm run test:chapters
npm run test:profiles
npm run test:ranges
npm run test:album
npm run test:missions
npm run test:adaptive
npm run test:care
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

## ranges.js — the parent dashboard's date ranges

Guards the numbers. The dashboard is the one place a grown-up is handed *figures* about
their child, and a wrong figure is worse than a missing one — it looks exactly as
trustworthy as a right one. The screen reads a range chosen from the picker (7 / 14 / 30
days) rather than a hardcoded week, so learning time, the comparison with the period
before, the challenge count, the limit tally and the chart all have to move together. If
one of them keeps its own hardcoded 7, the card still renders and simply reports the
wrong period, silently.

The chart also *groups* longer ranges into blocks (5 days per bar for a month, so 30
days is six bars rather than a picket fence). That is where numbers get quietly lost: a
bucketing that drops or double-counts a day still draws a perfectly plausible chart. So
the blocks are asserted to cover every day of the range exactly once and to total what
the range itself totals — the bars and the card can never disagree.

Covers: the three ranges and their day counts, the picker cycling and wrapping, each
range summing only its own days with the previous period stepping back a full span (and
older days never leaking in), bucket arithmetic for all three, single-day blocks labelled
by weekday and wider ones by date, the rendered screen actually changing with the range,
`EQ.cycleRange()` being wired in place of the old "coming soon" toast, an empty history
reading zero instead of `NaN`, and the range resetting to the week on leaving the
grown-up area.

See `EQT.RANGES` / `EQT.buckets()` in [js/tracking.js](../js/tracking.js).


## album.js — the sticker album

Guards a collection, which is the one kind of feature that fails without ever looking
broken. The bag used to carry a counter — `STICKERS FOR YOUR ROOM · 3 OF 24` — over five
fixed drawings, and nothing behind it: `s.stickers` was a number, and *which* stickers a
child owned was recorded nowhere. The screen rendered perfectly while being, to a
seven-year-old, a lie. There is now a real album of 24 named stickers with its own screen,
and `s.stickerIds` underneath it.

Three things break silently here:

1. **The identity.** `s.stickers` must never be anything other than `s.stickerIds.length`.
   Let the two drift and the bag header counts one thing while the album shows another —
   both perfectly plausible, one of them wrong, and no error anywhere.
2. **The migration.** Children are already playing with a count and no ids. Those saves
   have to become real stickers on load, or the album opens empty on a child who has been
   earning them for weeks — which reads exactly like their collection was taken away. The
   same cleaner runs over an imported transfer code, including one written by a version
   that had no album at all.
3. **The carry.** A transfer moves an adventure to another phone. If the ids do not ride
   along, the album arrives empty while the counter arrives full. They pack as a single
   base-36 bitmask, so a full album costs a QR code a handful of characters rather than a
   list of names — asserted here, because a QR that stops scanning is a support call.

Also covered: the shape of the album data (24 unique ids, every one in a real set, every
one with a drawing, a trilingual name, and the line that tells a child what to do to earn
it — a locked slot that says nothing is exactly what this feature replaces); a chest
handing over a *named* sticker and never the same one twice; the chest screen keeping its
own promise ("you always see what's inside before you open it") by naming and drawing the
sticker it is about to give; the album filling to 24 and refusing a 25th; all four pages
and all four screens rendering in az/en/ru at every stage of filling; the bag, the room
and the reveal screen all opening the album; the "NEW" badge appearing on the trip in from
the chest and not surviving the way out; and the rest screen still governing it — the
album can be paused into, a sticker already earned never interrupted.

The album screen is design-shaped but the store beneath it is hand-written, so a re-sync
can bring back the visuals and drop the awarding. If this suite goes red after a re-sync,
that is what happened — see `EQ.awardSticker` / `EQ.cleanStickers` in [js/app.js](../js/app.js)
and `EQD.STICKERS` in [js/data.js](../js/data.js).

## missions.js — parent-approved missions

Guards the last step of the loop the grown-up dashboard exists for:
analytics → recommendation → approval → **play**. Screen 26 promises a parent, in three
languages, that "you approve, then it appears in the child's world". For a long time
nothing behind that button was true: `EQ.addMission()` pushed `{t, day}` into
`s.parentQuests`, the screen turned green, and the entry sat in localStorage where no
child could ever reach it. That is the worst kind of failure in this app — the parent
believes they acted, and there is nothing anywhere to tell them they did not.

What closes the loop is a real mission: eight questions on the approved topic, generated
by the same `EQD._q*` generators the daily quest uses, played on the same challenge,
hint, tutor and success screens. Four things about that break silently:

1. **The appearance.** If the card fails to render on the child's quest list, the
   approval screen still says "added" and the parent still believes it arrived.
2. **The separation.** A mission borrows the adventure's screens. Let its context leak
   and a mission answer advances `challengesDone` — or opens the boss early — and the
   daily adventure quietly plays itself while the child practises something else.
3. **The resumption.** Eight questions is more than one sitting for a six-year-old. The
   questions are seeded from topic + approval day so that stopping halfway and coming
   back continues the *same* mission. Reseed it and the child restarts forever, never
   reaching an end that exists.
4. **The report.** Once a mission is playable, screen 26 has to say what became of it.
   An approval that reports nothing back is the same open loop in a new place.

Also covered: all five approvable topics generating eight answerable, drawable,
hintable, trilingual questions that are all actually the approved topic; the same
mission being the same eight questions twice and a different day being different
practice; the card appearing and disappearing with the mission and naming who sent it;
the full eight-question playthrough never touching `challengesDone`, the chest or the
boss, including when the adventure is already sitting at 5/5; a mission question paying
25 XP rather than the adventure's 50, so approved practice cannot become the fastest way
to farm coins; progress surviving a restart and resuming on the right question; several
approved missions queueing oldest-first; a wrong answer still opening the hint and the
tutor's easier question still counting; the daily limit and bedtime still taking over a
mission in progress; the transfer code carrying how far the child got (as an optional
third field, so a code written before missions were playable still reads); a save from
before missions were playable becoming a playable mission with clamped progress; and
every new string rendering in az/en/ru.

The recommendation screen is a design-project visual and the loop beneath it is
hand-written, so a re-sync can restore the approval button and drop the playing. If this
suite goes red after a re-sync, that is what happened — see `EQ.openMission` /
`EQ.missionAdvance` in [js/app.js](../js/app.js), `EQD.missionSet` in
[js/data.js](../js/data.js) and `EQT.nextMission` in [js/tracking.js](../js/tracking.js).


## adaptive.js — the adaptive daily set

Guards the part of the adventure that is supposed to notice how a child is doing. The
day's five questions are not a fixed lineup: the plan weights topics the child has been
getting wrong and brings topics back on a spaced schedule (3 / 6 / 12 / 21 days). None
of that is visible in the app — a plan that has quietly reverted to the fixed lineup
looks exactly like a plan that is adapting.

Covers: the weighting actually favouring weak topics, the spacing intervals advancing on
a clean answer and collapsing on a miss, the plan being frozen for the day (so the five
questions do not reshuffle underneath a child mid-adventure), the schedule surviving a
device transfer, and the grown-up's progress screen explaining the adaptation in all
three languages.

## care.js — caring for Questy

Guards the coin's second, and only daily, sink. The Star Crown costs 250 and is bought
once; after that a child keeps earning coins that buy nothing, and every reward the game
hands out quietly stops meaning anything. Three small things for Questy — 20 coins each,
once a day — are what the coins are *for* in between.

Three things fail silently here:

1. **The once-a-day.** Care is keyed to the calendar day, not to `resetDaily()`. Lose
   the day key and a child either re-buys the same berry forever (coins drain to zero
   with nothing to show) or can never buy it again (the loop dies after day one). Both
   render perfectly.
2. **The never-decays.** This is the design rule that matters most and the easiest to
   lose to a re-sync that brings back generic "virtual pet" behaviour. Nothing about
   Questy may get worse while a child is away: no hunger, no falling mood, no bar
   draining overnight. A pet that starves while a seven-year-old sleeps punishes them
   for sleeping — and this app already took the opposite position with the rest screen,
   which *stops* play rather than rewarding more of it. Care may only ever be added to.
3. **The carry.** A transfer moves an adventure to a new phone. Care that does not ride
   along lets the child re-buy what they already bought today, or wipes their running
   total.

Also covered: all three items being fully trilingual (name, note, thank-you, and the
kind "already done today" reply — a screen that just goes silent reads, at seven, as
broken); a day of care costing less than a finished adventure pays, so caring sits
beside the Crown rather than competing with it; a child short on coins being told how
far off they are and pointed back at the adventure, never dropped below zero; an unknown
item not being a way to spend coins; the badge and both doors into the screen (the map
and the bedroom); the daily limit and bedtime still taking over the care screen; a
transfer carrying today's care and the running total inside the QR budget; a code
written before care existed still importing as "never cared"; and a corrupt code being
unable to smuggle unknown ids, duplicates or a negative total into the care state.

The Questy drawing is a design-project visual and the loop beneath it is hand-written,
so a re-sync can restore the fox and drop the caring — leaving something you tap for a
chirp and coins with nowhere to go. If this suite goes red after a re-sync, that is what
happened — see `EQ.careGive` / `EQ.careToday` in [js/app.js](../js/app.js), `EQD.CARE`
in [js/data.js](../js/data.js) and `EQS.screens.care` in
[js/screens-collect.js](../js/screens-collect.js).
