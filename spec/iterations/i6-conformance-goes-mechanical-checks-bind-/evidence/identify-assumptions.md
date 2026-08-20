---
form: identify-assumptions
amended: 2026-08-16T16:28:07.459Z by agent — the four nodes gained Probe sections and probe outcomes at probe-assumptions; the set identified here is unchanged
by: agent
signed_off: 2026-08-16T16:23:32.610Z
authors: agent
files: null
---

# Evidence form / identify-assumptions

## current_situation

THREE NEW ASSUMPTIONS, all found by walking the eight new requirement rows rather than by memory.

THE REGISTER NOW CARRIES FOUR ASSUMPTIONS FROM THIS DELTA. The fourth, raid-asm-a-bound-check-runs-inside-the-write-budget, was minted at the kickoff gate and stands with them.

STANDING ASSUMPTIONS ARE NOT RE-IDENTIFIED. probe-assumptions probes all of them; this state only adds.

THE THREE NEW ONES SHARE A SHAPE. Each is a condition under which the write-path checks are worth anything, and not one of them is inside this project's control.

AMENDED 2026-08-16, AFTER PROBING. Each node listed here gained the `## Probe` section the corpus check demands, and three later gained a probe outcome and a date. What this state claims — which assumptions were identified, and what each source turned up — is unchanged by either edit.

## assumptions

- raid-asm-the-cage-holds-so-every-write-passes-the-lane
- raid-asm-one-parser-decides-what-parses
- raid-asm-a-break-made-outside-the-lane-is-caught-by-the-sweep
- raid-asm-a-bound-check-runs-inside-the-write-budget

## sweep

- environment: NONE NEW, with a reason. The checks assume the corpus sits on a local filesystem the engine can read and stat cheaply. That is already relied on and already measured — worktree.ts keys its branch listing to a ref stamp taken by statSync, on the finding that a bare git spawn costs 40.6 ms of blocking. The environment half of this delta rests on nothing the engine has not already leaned on and measured.
- toolchain: ONE, and it is raid-asm-one-parser-decides-what-parses. req-a-write-that-breaks-the-corpus-refuses says the guard refuses what the engine's own reader cannot parse, and that sentence assumes one reader. The engine loads frontmatter in several places — frontmatterOf and noteOf both appear among the corpus readers — and whether they share an implementation has never been established. A LENIENT GUARD IS THE DANGEROUS DIRECTION, because it admits what a reader will throw on and puts a false assurance on top of the original failure.
- host: ONE, and it is the largest thing on this page. raid-asm-the-cage-holds-so-every-write-passes-the-lane. Every check this iteration builds stands at the lane's file verbs, so a write that does not go through them meets no check at all. What keeps writes in the lane is a CONFIGURATION FILE the host reads, in two formats today, kept in agreement by authorship. Graded fatal. It has already been observed missing — se-start.ts places the cage template into a fresh clone precisely because a clone does not carry it and an agent started there would run uncaged.
- platform: NONE NEW, with a reason. Line endings and encoding are the platform's usual bite here, and the lane already handles them — se_file_patch corrects a CRLF or LF mismatch in the file's own endings and names the correction on the result rather than refusing. A guard reading the incoming content inherits that handling, so nothing new is leaned on.
- neighbours: NONE, with a reason. No system outside this repository writes to the corpus. There is no importer, no sync and no external tool with write access, and after i34 nothing pushes either. The neighbour surface for a write-path check is empty rather than unexamined.
- people: ONE, and it is raid-asm-a-break-made-outside-the-lane-is-caught-by-the-sweep. A person editing in their own editor is an EXPECTED writer — req-every-artifact-is-readable-text makes hand-editability a promise rather than an accident. No cage applies to them and none should. What is assumed is that hand breaks are rare and the sweep names them soon enough. Graded likely to be wrong today, because the sweep does not exist yet.

## follow_up

PROBE-ASSUMPTIONS IS NEXT, and it is the busiest state left in M3.

WHAT IS OWED THERE, and it probes ALL standing assumptions rather than only these four.

- raid-asm-a-bound-check-runs-inside-the-write-budget needs its number, and the number can move the architecture.
- raid-asm-one-parser-decides-what-parses needs a handful of malformed samples fed to the guard and to every reader.
- raid-asm-the-cage-holds-so-every-write-passes-the-lane needs a native write attempted under a caged session on each supported host.
- raid-asm-a-break-made-outside-the-lane-is-caught-by-the-sweep cannot be probed yet. Its probe measures how long a hand break survives, against a sweep that is unbuilt. That is a stated blocker on the probe rather than a skipped one, and it clears inside this iteration.
- raid-iss-the-prior-art-is-cited-but-never-recorded rides along, because probe-assumptions is the only state left on this walk whose legal tools include se_web_search.

NOTHING IS BLOCKED.

## anything_else

### Why the per-source sweep earned its keep here

THE GUIDANCE SAYS A NIL ANSWER IS CHEAP WHEN GIVEN ONCE AND EXPENSIVE WHEN OWED PER SOURCE WITH A REASON. That was borne out on this pass.

WALKING THE REQUIREMENTS ALONE FOUND ONE ASSUMPTION — the parser one, which falls straight out of req-a-write-that-breaks-the-corpus-refuses' own wording.

THE HOST QUESTION CAME FROM THE SOURCE LIST, not from any row. No requirement says "the cage holds". Every one of them silently needs it, and none of them mentions it. That is exactly the shape the guidance describes: true only under a condition nobody established and nobody controls.

IT IS ALSO THE BIGGEST THING FOUND IN M3. Graded fatal, and a single uncaged write defeats every check in the iteration.

### The three nil answers are arguments, not blanks

ENVIRONMENT and PLATFORM are nil because the lane already leans on those things and has already handled them. The ref-stamp measurement and the CRLF correction are both cited rather than asserted.

NEIGHBOURS is nil because the surface is empty. Nothing outside this repository writes the corpus, and after i34 nothing pushes either.

A NIL WITH A CITATION READS DIFFERENTLY FROM A NIL WITH NOTHING BEHIND IT, and only the first should count as swept.

### One probe cannot be run, and says so

raid-asm-a-break-made-outside-the-lane-is-caught-by-the-sweep measures how long a hand break survives before the sweep names it. The sweep does not exist — raid-iss-se-lint-has-no-whole-repo-sweep.

ITS probed FIELD SAYS THAT, so the assumption reads neither probed nor neglected.

THE GUIDANCE'S RULE IS THAT AN ASSUMPTION WHOSE PROBE CANNOT BE WRITTEN IS NOT ONE — it is a worry, and belongs in a risk's body. This one's probe IS written, in full, with its outcomes and what each decides. What is missing is the subject it measures against, and that is inside this iteration's own scope.
