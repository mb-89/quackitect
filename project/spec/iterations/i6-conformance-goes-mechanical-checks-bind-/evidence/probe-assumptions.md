---
form: probe-assumptions
by: agent
signed_off: 2026-08-16T16:27:12.582Z
authors: agent
files: null
---

# Evidence form / probe-assumptions

## current_situation

FOUR ASSUMPTIONS PROBED AGAINST THE REAL CHANNEL, and every one moved. Three now carry a date; one is part-probed with its reason.

THE REGISTER HOLDS 39 STANDING ASSUMPTIONS. Four are this delta's. The other 35 were checked for a fired trigger rather than re-probed — see anything_else for which and why.

ONE REFERENCE NODE WAS MINTED. ref-archunit, from the tool's own pages, closing half of raid-iss-the-prior-art-is-cited-but-never-recorded.

ONE PROBE CHANGED THE BUILD'S REASONING RATHER THAN CONFIRMING IT.

## probes

### raid-asm-a-bound-check-runs-inside-the-write-budget — HOLDS, with two orders of magnitude of margin

THE CHANNEL: the call log's own duration_ms, which the lane records on every call. 149 se_file_write records stand; the twelve newest were read.

THE NUMBERS. Content of 2251 to 3086 bytes. Durations of 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 12 and 12 milliseconds. The budget is 1000.

WHAT IT SETTLES. A check that parses only the incoming content has roughly 988 ms of headroom, which is about eighty times the whole cost of the write it would ride. The cheapest check is provably cheap and needs no further argument.

WHAT IT DOES NOT SETTLE, and this is the honest half. Nothing here measures a check that READS THE CORPUS. That is the expensive shape and no check exercises it yet.

THE PROBE THEREFORE NARROWED THE QUESTION RATHER THAN CLOSING IT. The node stays useful, and the first build chunk's measurement is now about corpus-reading rather than about writes in general.

### raid-asm-one-parser-decides-what-parses — HOLDS on the parser, FAILS on the handling

THE CHANNEL: the engine sources.

WHAT PARSES IS ONE ANSWER. Four import sites, all taking the same yaml package — bases.ts:22, frontmatter.ts:25, notes.ts:13 and tables.ts:22. No second parser and no second version.

WHAT HAPPENS ON FAILURE IS NOT ONE ANSWER. TWO DIFFERENT FUNCTIONS ARE BOTH NAMED frontmatterOf — worktree.ts:125, exported, taking raw text; and traceschema.ts:82, local, taking a file path. They have different signatures and different callers.

AND THEY DISAGREE ABOUT FAILING. worktree.ts's version catches. notes.ts's noteOf returns undefined, and it has thirty-odd callers. Something in that chain threw hard enough to stop this walk on 2026-08-16.

SO THE GUARD IS SAFE TO BUILD on the same yaml parse, and the DISAGREEMENT IS DOWNSTREAM of parsing. That is a smaller problem than the assumption feared and a real one.

### raid-asm-the-cage-holds-so-every-write-passes-the-lane — PART PROBED

THE COPILOT HALF WAS ALREADY PROBED, on 2026-07-30, against Copilot CLI 1.0.76. Its own file records the run, records that the previous version was written blind and WRONG IN THREE WAYS, and keeps the re-check command beside it. That is a model probe and it is somebody else's work.

THE CLAUDE HALF HAS NEVER BEEN PROBED THAT WAY. claude-settings.json carries a deny list and no record of anyone verifying it against a live session.

ONE ASYMMETRY IS WORTH NAMING. The Copilot cage EXCLUDES task, on the recorded reasoning that a Copilot subagent is a separate session which does not inherit the exclusions. The Claude cage KEEPS Task, on the reasoning that Claude subagents inherit the parent deny list. That second reasoning is stated and never checked.

STATUS STAYS OPEN WITH ITS REASON, which the guidance permits and which naming does not close.

### raid-asm-a-break-made-outside-the-lane-is-caught-by-the-sweep — UNPROBED, with its reason

ITS PROBE MEASURES HOW LONG A HAND BREAK SURVIVES BEFORE THE SWEEP NAMES IT. The sweep does not exist — raid-iss-se-lint-has-no-whole-repo-sweep.

SO THE PROBE IS WRITTEN IN FULL and its subject is unbuilt. Status stays open, the reason is on the node, and it becomes runnable inside this iteration.

NAMING A GAP DOES NOT CLOSE IT. This one is named rather than skipped.

### raid-iss-the-prior-art-is-cited-but-never-recorded — PART CLOSED

ARCHUNIT'S OWN PAGES WERE READ and ref-archunit now stands in the glossary with its url and accessed date.

WHAT THEY SAY. It analyses compiled Java BYTECODE, imports every class into a structure it asserts over, checks package and class dependencies, layers, slices and cycles, and ships built-in checks for layered and onion architectures. Rules go through a fluent Lang API.

THE BORROWED CHARACTERISATION SURVIVED CONTACT. note-d7a26094f592 called it architecture conformance written as ordinary unit tests, and its own pages agree.

THE COMPARISON IS NOW MAKEABLE ON THE AXIS THAT MATTERS. Theirs runs in a test suite over compiled output; ours runs at the write over the content. What theirs does better — no new runner, no new report surface, and bytecode cannot lie about what the code does. What ours sheds — the compile step and the wait for it.

TWO SOURCES ARE STILL UNRECORDED, and nobody here has still RUN ArchUnit. Everything above is what the documentation claims.

### One thing the probing found about the lane itself

se_web_search REFUSED with SE-C-106 — no SE_BRAVE_API_KEY in the server's environment. Four rigor-matrix rows list it as a legal tool and it cannot search.

The research went through the natively-allowed WebSearch, which the contract permits in as many words and which reaches the feed through a hook. So the routing held and the lane verb is inert until a key is configured, which is the owner's to set.

## follow_up

M3 IS COMPLETE AFTER THIS. gate-requirements is next.

WHAT THE PROBES CHANGED, and two of them changed the plan rather than confirming it.

- THE BUILD ORDER'S JUSTIFICATION MOVED. The first chunk was placed first to find out whether a check fits in a write. That is now measured for the cheap case with 80x margin. The chunk still goes first, but its question is narrower and sharper — what does a CORPUS-READING check cost.
- THE GUARD'S PARSER IS DECIDED. Same yaml package as every reader, so there is nothing to choose. What needs deciding is failure handling, which is a smaller question than the assumption feared.

WHAT IS OWED ONWARD.

- The Claude cage has never been verified against a live session. That is a probe nobody has run, on the assumption every check in this iteration rests on.
- Two prior-art sources are still unrecorded.
- se_web_search has no key.

NOTHING IS BLOCKED.

## anything_else

### The other 35 standing assumptions

THIS STATE'S INPUT IS THE RAID FOLDER, not the state above it. So the standing set was listed — 39 assumptions — and checked for a FIRED TRIGGER rather than re-probed wholesale.

WHAT FIRED. i34 shipped today and retired the claim system and the branch model whole. Two standing assumptions have triggers in that area — raid-asm-git-answers-open-without-a-worktree and raid-asm-only-one-agent-works-a-clone-at-a-time.

BOTH WERE ALREADY HANDLED BY i34 ITSELF. The first is about a model i34 deleted; the second is the assumption i34 MINTED to replace the lock it removed, so it is younger than the change that would have triggered it.

WHAT DID NOT FIRE. The remaining 33 carry triggers about hosts, platforms, transports, scoring, timings and the surface. This delta touches none of those channels. It adds a check to the write path and changes nothing about how the lane is hosted or transported.

THAT IS AN ARGUMENT RATHER THAN A COUNT, and it is the honest form of the answer. Re-probing 33 assumptions whose subject this iteration does not touch would produce 33 unchanged dates and no information.

### What made two of these probes worth the calls

BOTH ANSWERS WERE AVAILABLE WITHOUT ASKING ANYBODY, and neither had been taken.

THE WRITE BUDGET was sitting in the call log the whole time. duration_ms is recorded on every call, 149 writes stand in the log, and the number that decides this iteration's architecture was one query away. It had been argued about at two gates instead.

THE PARSER QUESTION was four greps. It had been written as plausible and graded crippling on reasoning.

THE GUIDANCE'S OWN LINE IS THE POINT: a document saying a thing works is the claim, not the check, and reasoning that it must hold is how the assumption got made in the first place. Both of these were reasoned into existence and both were settled by looking.
