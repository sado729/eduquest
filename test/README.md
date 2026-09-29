# Tests

Plain `node` scripts — no dependencies, no build step. The game itself stays a static
PWA; these only load `js/*.js` and assert against the real functions.

```sh
npm test              # all nineteen suites
npm run test:rest     # just one
npm run test:i18n
npm run test:chapters
npm run test:profiles
npm run test:ranges
npm run test:album
npm run test:missions
npm run test:adaptive
npm run test:care
npm run test:formats
npm run test:regions
npm run test:speech
npm run test:bigtext
npm run test:sound
npm run test:tutor
npm run test:helmets
npm run test:levelup
npm run test:bag
npm run test:home
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

Four things break silently here:

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

4. **The promise.** Every locked slot says how to earn it — "Reach level 5", "Earn a hint
   spark". For a while every sticker really came from the chest in album order and
   nothing ever read those lines: a child reached Level 5 and no rocket came. Now 20
   stickers are earned by exactly what their line says (`EQ.STICKER_RULES`, checked by
   `EQ.checkStickers` after each answer, level, day and stage), and the four chest
   stickers — Leaf, Moon, Cloud, Comet — say "Comes in a chest". The suite plays every
   promise through the real game (right/wrong answers, hints, the tutor's gentler
   question, bosses, a Word Valley round, level-ups, new days) and checks the sticker
   arrives at that moment and not one step before; that a question solved after a hint
   is not the Owl, a guardian is not a finale, another chapter's guardian is not the
   Math Dragon, a region miss does not spoil the Gold Medal; and that a week of play
   gives no sticker twice.

Also covered: the shape of the album data (24 unique ids in the order every saved
transfer mask was written in, every one in a real set, with a drawing, a trilingual name
and its line); the chest showing — by name and drawing — exactly the sticker it then
gives, through all four chest stickers, then showing no sticker slot and giving none;
a child with old chest-order stickers getting the next *chest* sticker; the chest
sticker that finishes the album bringing Questy! with it; **the migration** — a save from
before the rules gets on load everything it shows the child did (levels, days, sparks,
bosses, relics, a Valley round, a new chapter, questions solved unaided), nothing it
cannot show (Medal, Potion), no chest sticker, and loses nothing it already had, even a
sticker today's rules would not give; a stage already under way counting as slipped; the
reveal screen after success / level-up / the chest, with several stickers shown
together, "what earned it" on it, and the child carried on to where they were going; the
"NEW" badge on every sticker not yet looked at, whether the album is opened from the
reveal or from the bag, and not surviving the way out; all pages and screens rendering in
az/en/ru; and the rest screen still governing it.

The album screen is design-shaped but the store and the rules beneath it are
hand-written, so a re-sync can bring back the visuals (and "every chest brings one") and
drop the awarding. If this suite goes red after a re-sync, that is what happened — see
`EQ.awardSticker` / `EQ.checkStickers` / `EQ.STICKER_RULES` / `EQ.cleanStickers` in
[js/app.js](../js/app.js) and `EQD.STICKERS` / `EQD.nextChestSticker` in
[js/data.js](../js/data.js).

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

## regions.js — the four regions beyond the forest

Söz Vadisi (reading), Elm Adası (science), Kosmik Stansiya (space) and Sirli Qala
(riddles and patterns) used to be pictures on the map with nothing behind them, and Söz
Vadisi promised to open "after today's adventure" without ever doing so. They are real
now — [js/regions.js](../js/regions.js) — and the ways they can break are all quiet:

1. **An unanswerable question.** Reading answers depend on the language (🍎 starts with
   A in az/en and Я in ru), so `answers`/`correct` may be `{az,en,ru}` and are resolved
   through `EQD.qa`. The suite builds ~2,000 questions across all fourteen topics, easy
   and hard, tap and hands-on, with their step-downs, and checks every one in every
   language: the right answer is among the choices, the choices are distinct, and no
   `undefined` leaks into what the child reads.
2. **A picture the phone cannot draw.** An emoji newer than the device shows as an empty
   box — as a quiz answer, an unreadable choice. The region content is held to Unicode 11.
3. **The doors.** Söz Vadisi after the first boss, then Levels 10 / 15 / 20 — checked on
   the rule, on the map pins and on the unlock screen.
4. **The separation.** A region round borrows the challenge/hint/tutor/success screens;
   it must never move the daily 5/5, leak a region question into the forest, or lose its
   place across a hint, the tutor's gentler question, a level-up or leaving mid-round.
5. **The grown-up side.** Region topics are suggested only once the child can reach
   them, every one builds as an eight-question mission, and reading/science answers show
   up under Oxu/Elm in the analytics.

Also covered: the first round of a day paying the bonus once, further rounds paying per
question only; a new calendar day starting a fresh round while the lifetime count stays;
the Book Explorer and World Explorer trophies counting real progress; region progress
surviving a file transfer, hostile values being clamped, and region topic stats riding a
packed QR code with the original five topics still at their old numbers.

The region screens are hand-written; a design re-sync would restore the locked pictures
and the false promise. If this suite goes red after a re-sync, that is what happened —
see `EQD.REGIONS` / `EQD.regionSet` in [js/regions.js](../js/regions.js), `EQ.regionOpen`
/ `EQ.regionAdvance` in [js/app.js](../js/app.js) and `EQS.screens.region` /
`EQS.regionPin` in [js/screens-world.js](../js/screens-world.js).

## speech.js — Questy reading the questions aloud

The parent settings had a "Read questions aloud" switch, on by default, and nothing
behind it: it was saved, it rode in the transfer code, and no line of code ever spoke.
[js/speech.js](../js/speech.js) is the voice behind it now (the browser's own
`speechSynthesis`, no server, no audio files), and each way it can break is silent on
screen. `speechSynthesis` is stubbed with a fake engine that records every utterance and
every `cancel()`, over a voice list the test controls; timers are queued, so the test
can change screens between a start and its delayed speak.

1. **The switch.** Off: nothing is read and no speaker is drawn. On: the question is
   read once as the challenge/boss screen opens — also for missions, every region round
   and the hands-on formats — and what is read is the question, cleaned, with the answer
   choices never appended. Switching off cancels at once; switching on plays a sample.
2. **The voice never outlives its screen.** Leaving the question, the rest screen, an
   answer, a language switch and a hidden tab all cancel; a start still queued when the
   screen changes never speaks; a redraw of the same question does not restart it.
3. **The right voice or none.** Only a voice of the game's language is used — az with
   only tr-TR/en-US installed stays silent rather than reading Azerbaijani with Turkish
   or English sounds. Android's `az_AZ` tags are recognised, offline voices beat network
   ones, and an empty first list (Chrome fills it asynchronously) is "loading", not a
   false "no voice".
4. **Söz Vadisi never hears its answer.** ~2,000 reading questions × three languages ×
   challenge/hint/tutor: the voice never says the word on the card or the words on a
   pairing board (worked out in the test from what is drawn, not from `q.hush`), the
   tutor never reads a reading explanation (each one states the answer), and every
   question still has its question read.
5. **The grown-up is told the truth.** The subtitle under the switch says "bu cihazda
   Azərbaycan səsi yoxdur" (and its en/ru twins) when there is no voice, and "this
   browser cannot read aloud" without the API.

Also covered: `<br>`, entities and emoji (ZWJ, flags, keycaps) cleaned out, capital
words lowered so BALIQ is read rather than spelled (with az `İ`→`i`), calm mode slower
and softer, an engine that throws swallowed, every `EQV` call in app.js behind a
`typeof` guard (the other suites load app.js without speech.js), and speech.js being in
index.html and the sw.js precache.

## bigtext.js — the "Bigger text" switch

The parent settings had a "Daha böyük mətn — daha iri yazılar və cavablar" switch that
was saved, rode in the transfer code, and changed nothing on any screen. It now sets
`body.bigtext` (`EQ.applyBig()`, the same pattern as calm mode).

The screens are fixed-px designs with absolutely placed parts, so nothing is scaled
wholesale. Only what the child reads is tagged: `.bt` (running text, grown with `zoom`,
so it reflows inside the width it had) and `.btf` (a label inside a box whose size is part
of the layout — answers, buttons, tiles — grown from its inline `--fs` by `--bz`; a long
word grows less because one word cannot wrap). The question cards are re-anchored in big
text so they grow upward instead of sliding under the answers (`.bt-card`, `.bt-boss`,
`.bt-hands`), and the tutor's card and picture become one column (`.bt-tflow`).

A design re-sync restores the screens without any of these tags, and the switch goes
back to doing nothing with nothing looking broken. The suite covers:

1. **The class follows the setting** — on the switch, at boot, and on switching child:
   the setting is per child, a new child starts without it, removing the playing child
   applies the next child's own.
2. **It moves with the child** — code and file round trips, a code written before this
   change (the bit was already in the format; `transfer.js` is untouched), a file with no
   field reading as off, and the whole import → reload → class on.
3. **The markup** — every topic and format × challenge/hint/tutor/boss × three languages
   carries its tags, and no `.btf` element lacks `--fs` (without it the `calc()` is
   invalid and the label falls back to the inherited size — a 38px answer would drop to
   16px in the very mode meant to make it bigger).
4. **The stylesheet and the ship** — the rules the tags point at exist, nothing is scaled
   outside `body.bigtext`, `boot()` applies it, the sw.js cache was bumped.

Layout (nothing clipped, nothing overlapping, Done on screen) can only be measured in a
browser; that was checked in headless Chrome for every child screen and ~400 generated
questions, three languages, both modes.

## sound.js — the music switch and the sound-effects switch

The parent settings showed "Music · Forest theme · 40%" in a game with no music: the
switch actually silenced the effect cues. [js/sound.js](../js/sound.js) now holds both —
`SFX` (taps, chimes, fanfares; `settings.sfx`) and `EQM` (a synthesized forest melody,
no audio files; `settings.music`). Nothing about a broken version is visible, and most
of it is hard to catch by ear, so a fake `AudioContext` records every oscillator, what
it is wired to, and every level a gain is asked for. It obeys the autoplay rule
(`resume()` only works after a gesture).

Covers: the two switches never affecting each other; the bus really at 0.4 of a cue's
loudness and 0.2 in calm mode (which also halves the cues — the calm line promises
"softer sounds"), and the melody ducking while Questy reads aloud; nothing before the
first touch; silence on the rest screen (including when the limit reroutes there) and in
a hidden tab; the context suspended whenever nothing is sounding, one wake-up per phrase
rather than a ticking timer; transfer codes and backup files written before the split
(bit 8 used to silence everything, so a code without the new marker bit 64 reads `sfx`
from bit 8, and a saved game without `sfx` inherits it from `music`); and the settings,
gate and new "Money & ads" screen (`parent_money`) no longer promising purchases that
never existed, in all three languages.

## tutor.js — the tutor's "Questy, read it" bar and its header

The tutor screen had two microphones — a corner button and a big "hold to talk to
Questy" bar — and both only showed a toast that hold-to-talk "is coming". Real listening
was ruled out, not postponed: browser speech recognition streams the child's voice to
Google's servers (the game says nothing leaves the device), needs a connection, and has
no usable Azerbaijani model for a six-year-old. The bar is now "Questy oxusun": it reads
the card through js/speech.js, on the device. The corner mic is gone.

Covers, in all three languages: the bar reads the card's heading and explanation (and
the "why" once it is open) in the language's own voice; it says "Stop" while speaking and
a second tap hushes it; in Söz Vadisi it never reads an explanation that states the
answer; with the switch off, no voice of the language (the usual az phone), no voices or
no speech API there is **no bar at all** — never a mic, a toast or a "coming"; bigger
text swaps the bar for the card's small speaker; "PARENT-APPROVED" appears only on a
parent's mission, not on daily, guardian or region questions; and no `js/` file uses
`SpeechRecognition`, `getUserMedia` or `MediaRecorder`. Verified red against five seeded
regressions (label always on, bar without a voice, reading answer spoken, mic toast
back, a recognition call added).

## helmets.js — the Diver Helm and the Space Helm

The wardrobe always showed two locked helmets — "Diver Helm · opens on Science Island"
and "Space Helm · reach Level 15" — and no code anywhere could open them, even after
both regions became playable. Now the first full round (all five questions) in Elm Adası
earns the Diver Helm and the first full round in Kosmik Stansiya earns the Space Helm;
that region opens at Level 15, so the old card's level stays true. Both are ordinary
hats (`s.diverHelmOwned` / `s.spaceHelmOwned`, worn through `EQ.wearHat`, drawn by
`EQC.hero`), listed in `EQD.HELMS` in js/regions.js.

Covers: four answers are not a round and a wrong answer earns nothing; the fifth answer
earns exactly that region's helmet, is announced by a toast on the round's end screen
(never over the success beat, never twice) and shown there on the hero with a "put it
on" button; the locked cards state the real condition, plus the region's level while it
is shut; a locked card cannot be worn or reached with the preview arrows; a save from
before this change with at least five correct answers in the region (`regions[r].total`)
gets the helmet on load and is told, while a saved boolean is never re-derived; transfer
codes carry two new flag bits and the hat list is append-only, so a code written by the
previous build (fixture in the suite) still imports with its crown on; an old backup
file derives the helmets from its regions; and every screen that draws the hero shows
the helmet with no `undefined` / `NaN` / `[object Object]`, in all three languages.
Verified red against seven seeded regressions (no earning, no migration, a dropped code
bit, helmet not drawn, silent unlock, reordered hat list, unguarded `wearHat`).

## levelup.js — what the level-up screen promises

The level-up screen came from the design with three fixed lines, all false for most
children: "NEW ITEM UNLOCKED · Explorer Hat · waiting in your wardrobe" on every level
(it is the hat a child starts with, and a level gives no item), "1,500 / 1,500 XP"
whatever the child had, and "N LEVELS AWAY · Science Island" — always the island, and
"0 levels away" from Level 10 on while Kosmik Stansiya and Sirli Qala were still shut.

Now the reward card shows what `EQ.levelGifts(level)` finds — a region whose condition
becomes true (Elm Adası 10, Kosmik Stansiya 15, Sirli Qala 20), else a new rank name,
else no card. Stickers are not a level reward (chests hand them out in album order) and
neither are hats (the helmets are earned by a round inside their region; the card only
points at it). The next-region card is `EQ.nextRegion(level)`: the nearest region still
shut and its real condition — the first boss for Söz Vadisi, levels for the others — and
no card once all four are open. The level size is `EQD.XP_PER_LEVEL`, read by `grant`,
`applyLevelUp`, the HUD bar and the level screens.

Covers: no screen or rule types 1500 itself, and changing the constant moves every place
that uses it; which levels open which region and which change the rank name; the next
region before and after the first boss and at Levels 10 / 15 / 20; the screen at 1→2
(with and without a boss), 5→6, 9→10, 14→15, 19→20 (with and without a boss) and 24→25
in all three languages — no invented item, the child's real XP with what carries over,
the right card or none, never "0 levels away", English/Russian level plurals, and no
`undefined` / `NaN` / `[object Object]`; and the real flow from 9 to 10 opening the
island the card named, with the wardrobe unchanged. Verified red against four seeded
regressions (the design's old screen, a literal 1500 in `grant`, the next region fixed
to the island, the first-boss condition dropped).

## bag.js — what the bag counts

The bag came from the design with five numbers that looked like state and were not:
"Hint spark ×N" read `s.hintSparks`, which nothing ever raised; "Double XP ×1" was a
typed-in 1; the Crystal Shard drew `s.bossBeaten ? 2 : 1` whatever had happened; and the
quest-items row had a map "1" and a magnifier "3".

Now a **hint spark** is earned by a question solved *after* its hint was open — tapped,
or shown after a miss — in the daily quest, a mission, a region round or the boss fight,
at most once per question. The hint stays free and a spark is never spent: it is the
bag's record that asking for help and carrying on is part of winning. The **shard** is
the current chapter's relic (`relic` on each of `EQD.CHAPTERS`: crystal shard / song note
/ star piece): one piece per stage whose boss was really beaten, kept in `s.relics` as
`{ chapterNo: bitmask }` and only ever added to. It cannot be derived from `questDay`,
because a new calendar day moves the adventure to the next stage whether or not the boss
was beaten — such a stage is named as missed, never counted. **Double XP**, the map and the
magnifier are gone: a boost to "play more now" contradicts the rest screen, and the other
two had nothing to count.

Covers: no Double XP / `bossBeaten ? 2 : 1` / `×1` / map / magnifier left in the bag's
source, and every badge and ×N on the rendered bag equal to state across four states;
sparks through the real daily, mission, region and boss flows (none without the hint, one
per question however many misses, the hint open with zero sparks, the success-screen chip
and the boss toast), and no code in `js/` that spends one; relics through the real boss
fight across a whole chapter and into the next, a calendar-skipped stage, old saves
(earlier stages of the current chapter credited — what the old bag showed), junk records
dropped; the code's new twelfth group, an eleven-group code from before, backup files old
and new and a hostile one; the bag clean in every chapter × stage × language. Verified red
against seven seeded regressions (no `earnSpark`, no `earnRelic`, no once-per-question
guard, the typed-in shard badge back, the relic group dropped from the code, unpack
ignoring it, the legacy credit dropped).

## home.js — the room and the trophies it shares with Awards

The room came from the design as a picture that looked like state: a card announcing
"Math Master trophy earned — tap to place it" to every child, a brand-new one included
(it looked only at `s.trophyPlaced`; the trophy needs 100 math questions), a typed-in
"6 of 18 decorations placed" (`trophyPlaced ? 7 : 6`) over a hand-drawn gold cup, a "Math
Master" plaque and a "Reading Champion" sign, and a "Decorate" button that only toasted
that decorating "opens with the next chest". The Awards screen beside it said "N of 40"
(no 40 exists; N was the bosses beaten), and its Bridge Keeper read `bossBeaten`, which
the next stage resets — earned one day, gone the next.

Now the room holds **19 decorations** (`EQD.DECOR` in js/data.js): 3 starters every room
has and labels as such, and 16 earned — the six trophies of the Awards screen, the three
chapter finales (a chapter's third-stage boss, bit 4 of `s.relics`), the first full round
in each region (`s.feats`, the helmets' moment) and three that come out of chests from the
second chest on (the first holds the Wizard Hat; the chest shows which before it opens).
They stand in **12 places** (`EQD.HOME_SPOTS`), one kind each — shelf, wall, floor, rug,
ceiling — so decorating is choosing, and what is not in the room waits in the box. The
Awards screen and the shelf read one table (`EQD.TROPHIES` + `EQ.TROPHY_RULES`), so a
trophy is on both or on neither. The home card appears only for a decoration earned and
never yet placed, one at a time ("2 more waiting"); a full shelf opens decorating with the
trophy in hand. Decorating is tap one, tap where it goes (the put-in-order panel's rule):
a swap puts the other one where the moved one was, and "Put in the box" keeps it owned.

Covers: the typed-in count, the fixed cup/plaques, the chest-promise toast and the "of 40"
gone from the source; the catalogue (sources, rules, three languages, places on the phone
that never overlap); a new child's room — no card, exactly the starters drawn, the header
counting what is there; every decoration at its own edge through the real game (the first
answer, the boss, the seventh day, the hundredth math question, the twentieth reading
question, Level 15's third world, a guardian vs a finale in all three chapters and the
fourth, four answers vs a round and a round split across days, chest 1 → hat, chests 2–4
→ the next decoration shown before it is paid, chest 5 → none); the Awards screen and the
shelf agreeing across six states; the card, several at once (with Russian plurals), a
full shelf, a trophy put away never called back; every decorating move, a locked tile,
600 seeded random taps that never change the owned set or put one decoration in two
places, and moves saved without "Done"; the migration (the old card tapped at 37 vs 100,
a region played before rounds were kept, no chest credit, a damaged save) and being told
once; the code's thirteenth group, two twelve-group codes from the previous build, files
old, new and hostile; every room state × language rendering clean and drawing exactly
what the save places; and every emoji the room shows within Unicode 11. Verified red
against fourteen seeded regressions (the card for everyone, a typed-in count, Math Master
at 99, Bridge Keeper on `bossBeaten`, a swap that drops the other one, putting away that
removes ownership, `trophyPlaced` granting Math Master, regions on lifetime answers, a
chest decoration with the hat, the room dropped from the code, a legacy file handed a
default room, the loader not checking kinds, a late emoji, "of 40" back).
