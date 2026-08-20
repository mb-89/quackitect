---
form: find_by_probing
by: agent
signed_off: 2026-08-19T15:33:31.813Z
authors: agent
files:
---

# Evidence form / find_by_probing

## current_situation

Four probes ran, all four returned, and three of them killed a claim this iteration was carrying.

ONE OPTION CAME OUT, and it could not have come from reading. The engine has one canonical corpus reader and one live second reader that walks the corpus itself while its own comment says it does not. The two disagree about a malformed node, and both answers are on a numbered line.

THREE CLAIMS DIED. That the collapse endangers branch independence. That it flips the packaging default from safe to unsafe. That the five-second open bound needs a cache. Each was reasonable, each was written down, and each is now measured otherwise.

A FOURTH DIED IN THE ITERATION'S OWN VISION. It says the folder will be tracked with its contents ignored, the way this repository already does for the editor's folder. That line does the opposite of what it is cited for.

NOTHING RAN OUT OF ITS TIMEBOX. Every probe was a throwaway script against the engine's real code, and all four together cost under an hour.

## applies

yes

## probes

| question | timebox | what_was_faked | verdict |
| --- | --- | --- | --- |
| P1. After the machine-state folder moves inside the opened folder, does one checkout still get exactly one of them, and does a worktree nested inside a checkout leak into the outer corpus read? | 15 min, about 10 spent | THE COLLAPSE ITSELF, which has not happened. A tree was BUILT to the collapsed shape in the scratchpad rather than migrating the real one. The inner worktree was a plain directory, not a real git worktree, so this tested path resolution and the exclusion filter and NOT git's own behaviour. The engine's own loadTrace, seDir and isExcluded were run unmodified. | ONE PER CHECKOUT BEFORE AND AFTER. The count comes from the checkout, never from the depth. The outer reader returned its own 3 nodes and not the inner tree's 2, because traceDir anchors at project/spec/trace and a nested worktree is not under it. isExcluded also returned true for project/.se/calls.jsonl, so moving the folder deeper costs the lane's exclusion nothing. |
| P2. What does one full corpus read cost, and is a cache load-bearing for the five-second open bound? | 15 min, about 5 spent | NOTHING IN THE LOADER. The engine's own loadTrace ran. What flatters the number is a warm file cache after the first run, and one developer laptop is the only machine measured. | 1097 NODES. First read 359 ms. Four repeats 11 to 13 ms each, which is the stamp check rather than a re-read. So a full read is about 7 percent of a five-second budget and the bound does not need a cache. What the cache pays for is REPETITION inside one pass. Separately, the loader's own comment reasons about 328 files and the corpus is now 1097. |
| P3. Does the machine-state folder travel into a produced copy after the collapse, and do the producing paths need fixing separately? | 20 min, about 15 spent | THE ROOT PASSED TO travels NAMES NO REAL DIRECTORY. travels is pure string arithmetic, and the run proves it by returning true for four files that must travel. THE EDITOR PACKAGER WAS NEVER RUN, because no .vscodeignore exists anywhere to run it against. | WITHHELD AT BOTH DEPTHS, and inside a nested worktree too. produce.ts line 93 tests every path segment against a set of names, so depth is irrelevant to it. package.ts imports the same travels, so the two paths already share one list. Both halves of the standing option's argument are therefore false today, and the option now says so. |
| P4. How many places read the trace corpus, and do they agree? | 10 min, about 8 spent | NO STUB. A static count over the engine's 154 TypeScript files, plus reading the lines that disagree. What it cannot see is a reader whose directory walk my pattern did not match. | ONE loadTrace, DEFINED ONCE, WITH 20 CALLERS. Seven other places walk the trace tree themselves: five are one-off bin scripts, one is the loader's own walk, and ONE IS LIVE. trace.ts line 515 DROPS a node that will not parse. stateform.ts line 722 KEEPS it with an empty frontmatter mapping. preflight.ts line 206 asserts every reader does the second, which is false of the first. |

## options

- project/spec/trace/option/opt-the-second-reader-is-deleted-rather-than-reconciled.md

## dead_ends

- P1 KILLED THE BRANCH-INDEPENDENCE WORRY. The iteration's vision asks for a test pinning the machine-state folder to one place, on the reasoning that the collapse endangers it. Measured, the collapse changes depth and not multiplicity, and one folder per checkout is what happens either way. The test is still worth writing as a regression pin. It is not a fix.
- P3 KILLED THE CLAIM THAT THE DEFAULT FLIPS FROM SAFE TO UNSAFE. Every producing act excludes the folder BY NAME at any depth, so the depth change costs nothing. opt-exclude-at-the-packaging-boundary-and-prove-it now carries the measurement and the narrower risk.
- P3 ALSO KILLED THE CLAIM THAT TWO PRODUCING PATHS NEED FIXING SEPARATELY. They shared one list already. produce.ts records that they were once two, that the difference was 20.8 MB of release archives in every vehicle, and that they were merged.
- P3 KILLED THE VISION'S GITIGNORE ANALOGY. It says the folder will be tracked and its contents ignored, the way line 10 already does for the editor's folder. Line 10 ignores ONE FILE and tracks the rest of that folder, which is the opposite. Git cannot track an empty directory at all, so the marker has to be a named committed file and the ignore rule has to name the contents.
- P2 KILLED THE CLAIM THAT THE OPEN BOUND NEEDS A CACHE. 359 ms against 5000 ms. The cache earns its place inside a pass, where the same corpus is asked for dozens of times, and that is a different argument from the one being made for it.
- NO PROBE RAN OUT OF ITS TIMEBOX, so no verdict here is the budget speaking.

## follow_up

THREE OF THE FOUR PROBES ARGUED AGAINST WORK THIS ITERATION HAD PLANNED, and that is the finder doing its job rather than a problem.

WHAT THE DESIGN MILESTONE SHOULD CARRY FORWARD.

- The malformed-node answer is now a choice between three named behaviours rather than two, and all three exist in the source today: drop it, keep it blank, or refuse.
- The gitignore shape has to be decided as a rule about FILES. A rule about the folder cannot express what the vision wants.
- The exclusion test the M2 gate asked for is still owed. Its argument is now that a producing act added later inherits nothing, rather than that today's default is wrong.

ONE STRAY WAS FILED RATHER THAN CHASED. The lane's read exclusion does not hide a nested worktree, while version control and the producing act both do. The trace corpus is unaffected, and deciding what else belongs in that set is not this iteration's.

THE LOADER'S OWN COMMENT IS OUT OF DATE BY A FACTOR OF THREE. It reasons about 328 files and there are 1097. Nothing is broken by that, and the optimisation it describes is carrying more weight than the person who wrote it measured.

## anything_else

