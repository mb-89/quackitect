---
id: i11-the-engine-fix-bundle-about-twenty-named
status: open
started: 2026-08-16T10:57:55.322Z
opened: 2026-08-12T19:40:52.415Z
goal: "The engine-fix bundle: about twenty named defects, including a stale must-priority security row and a route that tells the reader a shut door is open."
vision: "ENABLER 3 OF 4 (owner, 2026-08-13). The pull pagination inside it is the piece that earns the place: a gate fill answered 236KB, and the reading detour that forces ran a dozen times in one day.\n\nDONE LOOKS LIKE: the named defects are fixed, each with a test that would have caught it.\n\nTWO FOUND ON 2026-08-12 AND WORTH DOING FIRST.\n\nTHE STALE SECURITY ROW. spec/trace/requirement/req-mirror-stays-on-the-machine.md is priority must, characteristic security, breaks_how_badly fatal. Its Detail section opens \"THE DEMAND IS NOT MET TODAY\" and its source_refs cite the old broken call. The code MEETS it: engine/mirror.ts line 915 passes \"127.0.0.1\". A reader of the register sees an open fatal hole — the whole record readable with no authentication by anyone on the network — and there is nothing to fix. It nearly cost a session a false emergency report.\n\nRewrite the Detail and the refs, then SWEEP the other rows minted by the same ISO 25010 checklist pass for the same shape. The underlying fault is structural: VERIFICATION STATUS DOES NOT BELONG IN A REQUIREMENT BODY. That is what evidence is for, and a row that narrates whether it is currently satisfied goes stale every time somebody satisfies it.\n\nTHE MAP LIES. At autonomy 0.2 the pull refuses to enter expeditions, whose door weighs 0.4. route(\"expeditions\") at the same dial returns NO stops_at at all, so the drawn line reads open the whole way and the walk then stops. The cause: routeJudgments weighs the state actually ENTERED, and entering a submachine resolves to its start state, which is mechanical. The container's weight sits on the edge and the route never sees it. This is the defect route.test.ts line 169 already names as \"the one moment the map lies\", reopened by a different path.\n\nTHE REST OF THE BUNDLE: a sub-machine can be skipped whole rather than finishing; build_chart writes the candidate notes but not the candidate drawing, so run-candidates can stand empty under a full chart; the fill answer returns the whole form twice in one response; the battery hands back raw script output where the scoped run hands back parsed structure; reopening a state while standing downstream makes the walk owe the later form first; a node-table field spanning two node kinds can write a column the target kind has no field for; a cutoff mark rides a row so a recomputed order silently redraws the boundary; a compounded axis is represented by its alphabetically first member, so an annoyance can sink a critical; silent fallbacks substitute a default for a missing file; a wired-up offer that resolves to nothing is invisible; the engine cannot be asked how it is, and three crashes were diagnosed by shelling out to the process table; the shim's proxy fetch has no timeout; there is no in-flight tree switch between worktrees of one product; the walk signs states without committing them; a wait inside a sub-machine does not carry its doors.\n\nCARRY V1'S GUARD LESSON while doing this. Guards belong in ONE dispatch pass, never per handler, for coverage uniformity — a new command is guarded by default — and for one tested predicate set with no wording drift. Its recorded tripwire: a rule table past ten per-command entries has become per-command logic in disguise. v1 learned the same lesson twice; its verdict-write guard exists because a test that guarded itself still poisoned the cache.\n\nADDED 2026-08-13, FROM THE NOTE POOL. Seven more, each already diagnosed.\n\nTHE PULL MUST NEVER OVERFLOW - IT PAGINATES (owner ruling, twice on purpose). One gate fill answered about 236KB, roughly seven thousand lines. The host then moves the result to disk and the agent works blind, verifying stamps by re-reading evidence files; that detour ran a dozen times in one day. The answer stays small BY CONSTRUCTION: the form arrives paged or trimmed, carrying field names, grammars and hints, never the template prose the reading already credited. Anything larger serves by reference with offset and limit, exactly as se_file_read does.\n\nTHE PROBE-ASSUMPTIONS EVIDENCE FORM CHECKS NOTHING. Its probes field declares per-item over raid, and all three checks miss it: the ref check returns empty unless the template resolves an artifact, the per-item coverage check runs only on a non-empty items list, and the line pattern is a renderer hint. A free-text box wears a per-item label, and one line saying it looks fine submits. The fix has a precedent in the inbox resolver, which expands live to the pending notes. ONE RULING IS OWED AND IT IS THE OWNER'S: re-check strips live items on purpose, so a retro is not marked suspect by today's inbox, and a standing assumption may want the opposite.\n\nTHREE LANE VERBS ARE MISSING, each measured at a shell call. A COPY verb, because copying through the lane reads the bytes into the message and writes them back, paying twice for what the disk already holds. AN UNDO-THE-LAST-COMMIT verb, whose workaround is dangerous rather than merely absent: shell git works on whatever the current directory happens to be, while the lane's git runs in the bound worktree. A soft reset of an unpushed tip rewrites nothing published, so the verb refuses when the tip is pushed. A READ OF A HOST-PERSISTED SUBAGENT RESULT, which recurs from the 2026-08-10 retro - the log query serves a lane call's own overflow, never a subagent's output, which passed through no lane. ALSO: nothing reports the gaps between calls, so the agent-void ranking the retro asks for cannot be produced at all.\n\nA NEW VERB IS UNREACHABLE IN THE SESSION THAT BUILT IT, and this is settled BEFORE this iteration ships its own. An MCP client learns the tool list once at handshake, and a reload replaces the engine behind the same socket. The tests pass because they build their own server in-process, so everything reads green and the verb is unusable. Check first whether the host acts on the protocol's list-changed notification; if it does, this is small.\n\nTHE ROUTE LIES AT A SUB-MACHINE BOUNDARY. Aiming past a sub-machine answers found with no steps, and the pull turns that into a wait saying the target is where the walk already stands - while the walk is three states short of it. The router not planning through an unentered sub-machine is defensible. The report is not, because one answer covers an arrival and a non-arrival. The route already knows which it is, so it can name the sub-machine and the state to aim at first.\n\nA FAILING TEST LEAF LOSES ITS MESSAGE. A failure inside a suite block comes back as one subtest failed, with the suite's location. The assertion's own message and diff are dropped, which is exactly the part saying what failed. A pattern-scoped run does not help.\n\nA GATE RECORDS ITS ROLE AND NOT ITS CHANNEL, against the requirement that acts carry both.\n\nFULL CONTEXT: project/spec/version-planning.md, section i11."
inputs:
  - "project/spec/version-planning.md"
  - "spec/trace/requirement/req-mirror-stays-on-the-machine.md"
  - "project/deliverable/tests/route.test.ts"
---

# i11-the-engine-fix-bundle-about-twenty-named

## Goal

The engine-fix bundle: about twenty named defects, including a stale must-priority security row and a route that tells the reader a shut door is open.

## Rough vision

ENABLER 3 OF 4 (owner, 2026-08-13). The pull pagination inside it is the piece that earns the place: a gate fill answered 236KB, and the reading detour that forces ran a dozen times in one day.

DONE LOOKS LIKE: the named defects are fixed, each with a test that would have caught it.

TWO FOUND ON 2026-08-12 AND WORTH DOING FIRST.

THE STALE SECURITY ROW. spec/trace/requirement/req-mirror-stays-on-the-machine.md is priority must, characteristic security, breaks_how_badly fatal. Its Detail section opens "THE DEMAND IS NOT MET TODAY" and its source_refs cite the old broken call. The code MEETS it: engine/mirror.ts line 915 passes "127.0.0.1". A reader of the register sees an open fatal hole — the whole record readable with no authentication by anyone on the network — and there is nothing to fix. It nearly cost a session a false emergency report.

Rewrite the Detail and the refs, then SWEEP the other rows minted by the same ISO 25010 checklist pass for the same shape. The underlying fault is structural: VERIFICATION STATUS DOES NOT BELONG IN A REQUIREMENT BODY. That is what evidence is for, and a row that narrates whether it is currently satisfied goes stale every time somebody satisfies it.

THE MAP LIES. At autonomy 0.2 the pull refuses to enter expeditions, whose door weighs 0.4. route("expeditions") at the same dial returns NO stops_at at all, so the drawn line reads open the whole way and the walk then stops. The cause: routeJudgments weighs the state actually ENTERED, and entering a submachine resolves to its start state, which is mechanical. The container's weight sits on the edge and the route never sees it. This is the defect route.test.ts line 169 already names as "the one moment the map lies", reopened by a different path.

THE REST OF THE BUNDLE: a sub-machine can be skipped whole rather than finishing; build_chart writes the candidate notes but not the candidate drawing, so run-candidates can stand empty under a full chart; the fill answer returns the whole form twice in one response; the battery hands back raw script output where the scoped run hands back parsed structure; reopening a state while standing downstream makes the walk owe the later form first; a node-table field spanning two node kinds can write a column the target kind has no field for; a cutoff mark rides a row so a recomputed order silently redraws the boundary; a compounded axis is represented by its alphabetically first member, so an annoyance can sink a critical; silent fallbacks substitute a default for a missing file; a wired-up offer that resolves to nothing is invisible; the engine cannot be asked how it is, and three crashes were diagnosed by shelling out to the process table; the shim's proxy fetch has no timeout; there is no in-flight tree switch between worktrees of one product; the walk signs states without committing them; a wait inside a sub-machine does not carry its doors.

CARRY V1'S GUARD LESSON while doing this. Guards belong in ONE dispatch pass, never per handler, for coverage uniformity — a new command is guarded by default — and for one tested predicate set with no wording drift. Its recorded tripwire: a rule table past ten per-command entries has become per-command logic in disguise. v1 learned the same lesson twice; its verdict-write guard exists because a test that guarded itself still poisoned the cache.

ADDED 2026-08-13, FROM THE NOTE POOL. Seven more, each already diagnosed.

THE PULL MUST NEVER OVERFLOW - IT PAGINATES (owner ruling, twice on purpose). One gate fill answered about 236KB, roughly seven thousand lines. The host then moves the result to disk and the agent works blind, verifying stamps by re-reading evidence files; that detour ran a dozen times in one day. The answer stays small BY CONSTRUCTION: the form arrives paged or trimmed, carrying field names, grammars and hints, never the template prose the reading already credited. Anything larger serves by reference with offset and limit, exactly as se_file_read does.

THE PROBE-ASSUMPTIONS EVIDENCE FORM CHECKS NOTHING. Its probes field declares per-item over raid, and all three checks miss it: the ref check returns empty unless the template resolves an artifact, the per-item coverage check runs only on a non-empty items list, and the line pattern is a renderer hint. A free-text box wears a per-item label, and one line saying it looks fine submits. The fix has a precedent in the inbox resolver, which expands live to the pending notes. ONE RULING IS OWED AND IT IS THE OWNER'S: re-check strips live items on purpose, so a retro is not marked suspect by today's inbox, and a standing assumption may want the opposite.

THREE LANE VERBS ARE MISSING, each measured at a shell call. A COPY verb, because copying through the lane reads the bytes into the message and writes them back, paying twice for what the disk already holds. AN UNDO-THE-LAST-COMMIT verb, whose workaround is dangerous rather than merely absent: shell git works on whatever the current directory happens to be, while the lane's git runs in the bound worktree. A soft reset of an unpushed tip rewrites nothing published, so the verb refuses when the tip is pushed. A READ OF A HOST-PERSISTED SUBAGENT RESULT, which recurs from the 2026-08-10 retro - the log query serves a lane call's own overflow, never a subagent's output, which passed through no lane. ALSO: nothing reports the gaps between calls, so the agent-void ranking the retro asks for cannot be produced at all.

A NEW VERB IS UNREACHABLE IN THE SESSION THAT BUILT IT, and this is settled BEFORE this iteration ships its own. An MCP client learns the tool list once at handshake, and a reload replaces the engine behind the same socket. The tests pass because they build their own server in-process, so everything reads green and the verb is unusable. Check first whether the host acts on the protocol's list-changed notification; if it does, this is small.

THE ROUTE LIES AT A SUB-MACHINE BOUNDARY. Aiming past a sub-machine answers found with no steps, and the pull turns that into a wait saying the target is where the walk already stands - while the walk is three states short of it. The router not planning through an unentered sub-machine is defensible. The report is not, because one answer covers an arrival and a non-arrival. The route already knows which it is, so it can name the sub-machine and the state to aim at first.

A FAILING TEST LEAF LOSES ITS MESSAGE. A failure inside a suite block comes back as one subtest failed, with the suite's location. The assertion's own message and diff are dropped, which is exactly the part saying what failed. A pattern-scoped run does not help.

A GATE RECORDS ITS ROLE AND NOT ITS CHANNEL, against the requirement that acts carry both.

FULL CONTEXT: project/spec/version-planning.md, section i11.

## ADDED 2026-08-16, FROM i34'S RETRO — THE SPEED-UP SET

THE OWNER'S FRAME: "We need to develop some pace here. What would speed you up
the most?" Ten items, each measured or ruled rather than guessed. The measure
comes from one logged day: 2,850 calls, of which BUILDING WAS 7%.

### The ones with numbers behind them

TESTS ARE ASKED FOR, NEVER POLLED. 494 se_test calls produced 66 verdicts, so
about 428 asked only whether a job had finished. The owner's design: start a
long task, carry on working, and let its updates PIGGYBACK on the answers to
calls already being made — the same mechanism narration already uses. A scoped
run should simply block and answer.

THE FULL BATTERY IS THE ENGINE'S AND THE LANE SHOULD SAY SO. M7_50_verification
already reads `filled_by: engine`, "THE ONE PLACE the full battery runs", and
"its verdict records itself". Two runs per iteration is the designed maximum.
The agent ran five on its own judgment. Refuse an agent-initiated full battery
outside verification and the row enforces itself.

THE WAKE PROBLEM DISSOLVES RATHER THAN NEEDING A FIX. note-cd0853236644 asks
for a way to wake a sleeping agent when a background job finishes. Nothing
needs waking if the verdict lands in the WALK: the next pull carries it.

AN AMEND PATCHES, NEVER RESENDS. se_amend takes a field WHOLE. Correcting three
lines in a 207-row register meant resending all 207 rows, twice, in one day.
The patch shape already exists in se_file_patch.

THE FILE TOOLS DISAGREE ON THEIR OWN ARGUMENT NAMES. se_file_search takes
`query`, se_file_glob takes `glob`, se_file_list takes `dir`, se_file_read
takes `path`. Seven SE-C-101 refusals in one day, each a wasted round trip.

### The ones that come from rulings

DROP `reentry: "restart"` FROM THE CONTAINERS. Re-entering throws away which
edges have fired, so a leg already walked must be walked again. This is where
i34's re-walking actually came from — not from the ripple, which was measured
and works.

se_why NAMES THE ROOT IN ONE ANSWER. Reaching a root three levels up took six
se_why calls, one per level, plus an escape and a re-entry. note-de843867720b
holds the fix; this is its third sighting.

A FINDING ROUTES INTO A BUCKET (owner, 2026-08-16). A defect that breaks
nothing should not stop the walk. Name it, bucket it, carry on, and empty the
bucket before the close. BOTH ENDS ALREADY EXIST AND ARE UNUSED: the checklist
template accepts `- [owed] <item> — <open raid ref>`, and
req-close-refuses-loose-ends guards the other end. What is missing is that
nothing ROUTES a finding there — a grey claim offers fix or reopen, never
accept-as-owed. The prior art is NASA NPR 7123.1: a review is complete when
every finding has an agreed DISPOSITION, not when every finding is fixed.

TWO BUTTONS ON THE MIRROR (owner ruling 2026-08-16, note-3f15f19e2165). A
FREEZE that stops the agent moving any state, and a BLESS that is the person's
thumb, separate from it. The stop hook overrode a rule-9 stop five times in one
session, because it reads the walk's POSITION and cannot see the REASON.

THE EMPTY-INBOX RETRO SKIP NEEDS ITS MECHANICAL HALF (note-e28a7b6df2ab). The
rule is landed in both retro surfaces. What the engine lacks is a condition the
router can route PAST rather than block on: onboard-retro sits on a mandatory
path, where an unmet entry condition wedges the record instead of skipping the
state.

### One slice pulled forward from i18

BEFORE A NODE GOES, NAME WHAT POINTS AT IT. This is the single fix for i34's
dominant defect, which appeared FOUR times in one iteration: deleting a
function orphaned two requirements; deleting ten requirements left a register
three states upstream naming three of them; deleting a test-spec orphaned a
MUST story; deleting requirements left twenty dangling citations. Every one was
caught by a coverage law several states downstream.

IT IS A QUERY, NOT A DESIGN. The engine already builds this graph for the
coverage laws. i18's harder half — splitting a large cone so it stays
reviewable — stays in i18 and is deliberately NOT pulled in here.

### Read this bundle before committing to it

SEEDED 2026-08-12, AND i34 HAS SINCE REWRITTEN SEVERAL OF THESE AREAS. The
resolution seam, the containers, the claim system and the archive all moved.
Some of the twenty named defects may already be gone, and one may have been
made worse.

CHECK THE LIST AT KICKOFF RATHER THAN TRUSTING IT. Acting on a stale list
without checking what still stands is precisely the failure that cost i34 the
most, and repeating it here would be the joke writing itself.

## Inputs

- project/spec/version-planning.md
- spec/trace/requirement/req-mirror-stays-on-the-machine.md
- project/deliverable/tests/route.test.ts
