---
minted_in: i11-the-engine-fix-bundle-about-twenty-named
id: raid-iss-the-seeds-live-defects-outlive-i11
type: "[[raid]]"
kind: issue
statement: The 2026-08-12 seed's defects that are still live after i11, each read against the system i34 left and each left deliberately unfixed.
owner: the owner
trigger: seeding the next engine iteration, or any of these being hit again
status: open
impact: without this list the seed's unfixed half is invisible — i11's record reads as though the whole bundle shipped, and the next reader either re-audits it or trusts a stale list.
breaks_how_badly: corrosive
how_likely: expected
weighs_with: none
weighs_against: none
source_refs:
  - "i11 record.md: THE REST OF THE BUNDLE, seeded 2026-08-12"
  - "i11 record.md: ADDED 2026-08-13, FROM THE NOTE POOL"
  - "build-chunks.md: anything live but outside this surface is RECORDED, not fixed"
---

## Why this is recorded rather than fixed

THE CHUNK'S OWN RULE. `audit-the-twenty` says anything already fixed is struck
with its evidence, and anything live but outside i11's surface is RECORDED.
i11's surface is what a lane call costs. These are not that.

WITHOUT THAT RULE THE BUNDLE NEVER CLOSES. The plan says so in as many words:
the list grows every time somebody reads it.

## Live, and off i11's surface

### The engine cannot be asked how it is

NO HEALTH VERB EXISTS. `se_run {job}` asks a JOB how it is doing; nothing asks
the ENGINE. Three crashes were diagnosed by shelling out to the process table.

### The shim's proxy fetch has no timeout

Unprobed in this audit. The seed states it; nothing here confirms or denies it,
and saying so is more useful than a guess.

### The battery hands back raw script output

A scoped run answers parsed structure — counts, and only the failures' detail.
The battery answers `results[].output`, capped raw text. Two shapes for one
verb, and the raw one is the harder to read.

### A sub-machine can be skipped whole rather than finishing

### build_chart writes the candidate notes but not the candidate drawing

so run-candidates can stand empty under a full chart.

### Reopening a state while standing downstream makes the walk owe the later form first

### A node-table field spanning two node kinds can write a column the target kind has no field for

### A cutoff mark rides a row, so a recomputed order silently redraws the boundary

### A compounded axis is represented by its alphabetically first member

so an annoyance can sink a critical.

### A wired-up offer that resolves to nothing is invisible

### The walk signs states without committing them

### A wait inside a sub-machine does not carry its doors

### Three lane verbs are missing

A COPY verb, an UNDO-THE-LAST-COMMIT verb, and a READ OF A HOST-PERSISTED
SUBAGENT RESULT. Each was measured at a shell call. Nothing reports the gaps
between calls either, so the agent-void ranking the retro asks for cannot be
produced at all.

### A new verb is unreachable in the session that built it

An MCP client learns the tool list once at handshake. UNPROBED HERE, and it
matters for this iteration specifically: i11 added `ops` to se_amend and a
`whereNow` argument to the run lane. Both were exercised only through in-process
test servers.

### The route lies at a sub-machine boundary, the OTHER way

i11 fixed the weight half: a container's own door now shuts the route. The
seed's second half is separate and still live — aiming PAST a sub-machine
answers `found` with no steps, and the pull turns that into a wait saying the
target is where the walk already stands, while it is three states short.

### A gate records its role and not its channel

against the requirement that acts carry both. Unprobed here.

## Live, and blocked on a ruling rather than on work

### The probe-assumptions evidence form checks nothing

Its `probes` field declares per-item over raid and all three checks miss it.
ONE RULING IS OWED AND IT IS THE OWNER'S: re-check strips live items on purpose
so a retro is not marked suspect by today's inbox, and a standing assumption may
want the opposite.

## The structural fault behind the stale security row

VERIFICATION STATUS DOES NOT BELONG IN A REQUIREMENT BODY. i11 rewrote
req-mirror-stays-on-the-machine's Detail and its stale refs, and left the sweep:
the other rows minted by the same ISO 25010 checklist pass have the same shape
and will go stale the same way.

A ROW THAT NARRATES WHETHER IT IS CURRENTLY SATISFIED GOES STALE EVERY TIME
SOMEBODY SATISFIES IT, and a reader cannot tell a stale narration from a live
one. That row's own body claimed an open fatal security hole for an iteration
after the hole was closed, and nearly cost a session a false emergency.

## The shape worth naming, because it recurred three times in one chunk

READING AN ABSENT VALUE AS AN ANSWER.

- A blank `minted_in` read as "this record's".
- An absent fold-back read as "folded nothing back".
- An unresolvable record read as a confident owner string.

All three are in one function, all three were separately diagnosed, and the
third was introduced while fixing the first. It is worth one pass asking
whether any other law in `stateform.ts` treats absence as evidence.
