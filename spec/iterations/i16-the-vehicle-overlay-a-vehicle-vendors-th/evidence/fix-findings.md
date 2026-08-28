---
form: fix-findings
by: agent
signed_off: 2026-08-18T19:49:45.603Z
authors: agent
files: null
---

# Evidence form / fix-findings

## current_situation

THE BATTERY IS GREEN. 1471 of 1471, and all four scripts pass.

### The one finding, and what it actually was

THE CHURN ALARM. `tests/frontmatter.test.ts` reprints every note WITHOUT writing, counts how many would come out different, and fails at half or more. It stood at 877 of 1698, which is 51.6 percent.

IT IS NOT ABOUT CORRECTNESS. Every note parsed and every note was fine. It measures DRIFT between what the formatter would write and what people wrote by hand, and its own comment says why that matters: once they disagree on most of the corpus, the first real edit lands in a diff nobody can read.

IT HAD BEEN FAILING SILENTLY. Three test-spec nodes carried `minted_in` twice, so the test threw on the parse error before it could count anything. Fixing those duplicates let it reach its own assertion.

### The fix, and the order it was done in

ONE CALL: the vault formatter. 877 of 1698 reformatted, 3075 insertions and 2004 deletions.

THE ITERATION WAS COMMITTED FIRST, and that is the part worth recording. The whole of i16 stood uncommitted — 87 modified files and 150 new ones. Reformatting into that would have mixed 877 mechanical changes with every considered change of the iteration, in one diff, which is precisely the harm the alarm exists to prevent. Two commits: the work, then the reformat.

### And it broke one thing, which the battery caught

THE PROMPT LAYER WENT STALE. It is projected verbatim from `project/guidance/`, so reformatting guidance made the projection no longer match its source. Preflight said so and named the remedy. Re-projected, and the second confirm run is green.

THAT IS THE FOUR-LEG RULE ARRIVING UNINVITED. A change to guidance is never only a change to guidance.

## follow_up

IMMEDIATELY: verification's recovery edge, then gate-implementation — which is the owner's to bless.

### What the confirm run proves and what it does not

IT PROVES THE CORPUS STILL MEANS WHAT IT MEANT. The test directly above the alarm reprints the whole vault and asserts no note's data and no note's body changes; it passes, so every unquoted value still parses to what it was.

IT DOES NOT PROVE THE FORMATTER'S STYLE IS THE RIGHT ONE. The alarm measures AGREEMENT and cannot tell which side should move. Half the corpus disagreeing is equally evidence that the formatter is wrong, and the main thing it did was strip quotes that YAML does not strictly require. note-0e680e4fe9d5 carries that reservation with what would settle it.

### The five findings the tester left standing, none of them the battery's

THESE ARE NOT THIS STATE'S. fix-findings fixes what the BATTERY surfaced, and the battery surfaced one thing. The tester's other five came from reading rather than from running, and each has its note:

- the call log names every vehicle the engine produced, against a spec that forbids it — note-db6817fd0aa0, and raid-iss-the-call-log-names-every-vehicle-the-engine-produced
- `drivenBy` and `inventory` are reachable by nothing — note-c1c3a1142cb1
- the product name is spelled in nine places below the root, against a requirement that says zero — note-8aae512f9e01
- the inventory reports committed work only — note-6b6478039e3e
- the reachability test covers two verbs where the enumeration for every verb exists — note-d0884030dc6c

### And two claims are owed rather than green

BOTH CARRY OPEN REGISTER ENTRIES, which is how verification records a claim that does not stand: the demonstration nobody has performed, and the call log naming what it produced.

## anything_else

### Why this state exists, shown rather than argued

UNTIL 2026-08-18 NOTHING HELD IT. A state with no evidence form and no exit script completes the moment it is entered, so the walk fell into the repair state and straight out of it, having repaired nothing. Its own guidance quotes the measurement: "the state whose whole job is repair cannot be occupied long enough to repair anything."

THE CONFIRM RUN IS WHAT HOLDS IT NOW, and it held this round exactly as designed. The first confirm run came back red on the prompt layer — a consequence of the fix rather than the original finding — and the walk stayed here until that was fixed too.

SO THE MECHANISM EARNED ITS KEEP ON ITS FIRST REAL USE. Without it, the reformat would have shipped with a stale prompt layer, and the next session would have read a projection that no longer matched its source.

### One thing the owner should know about the shape rather than the content

THE EXIT SCRIPT FIRES SYNCHRONOUSLY AND BLOCKS THE PULL for the battery's full 68 seconds. Two calls timed out at the tool boundary before a third returned, and one of the timed-out calls HAD landed — its read proof was credited while the caller was told the operation failed.

THAT IS THE WORST SHAPE A LONG CALL CAN HAVE: not slow, but ambiguous. The owner ruled on it the same day and note-8b3ef63d1a36 carries it, paired with the poll verb note as one design rather than two.
