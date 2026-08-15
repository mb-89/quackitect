---
form: find_by_heuristic
by: agent
signed_off: 2026-08-15T16:43:02.742Z
authors: agent
files:
---

# Evidence form / find_by_heuristic

## current_situation

M4's divergence, the heuristics finder. Eight rules held against five clusters, forty cells, and the misses written rather than left blank.

THE SWEEP IS DEDUCTION RATHER THAN INVENTION, and it earns its place here by confirming three design choices with a reason that is not our own, and by producing one option the design did not have.

## applies

yes

## sweep

| heuristic | cluster | what_it_suggests |
| --- | --- | --- |
| group what changes together, separate what changes apart | the-record-life | seeding, entering and closing all move one fact - whether a folder exists - so one module owns that lifecycle rather than three call sites |
| group what changes together, separate what changes apart | the-bootstrap | the entrypoint's seven steps change together whenever the install changes, so they belong in one script rather than spread between a script and prose |
| group what changes together, separate what changes apart | the-account | nothing |
| group what changes together, separate what changes apart | the-holding-pen | nothing |
| group what changes together, separate what changes apart | the-walk | nothing |
| make the common case cheap, make the rare case possible | the-account | listing what exists is the common case and must batch; the measured naive read costs 1004 ms against 58.7 ms batched |
| make the common case cheap, make the rare case possible | the-record-life | entering is common and materialising is its cost, so the materialisation is what to make cheap - a thin checkout rather than a full one |
| make the common case cheap, make the rare case possible | the-bootstrap | a machine that already has the toolchain is the common case, so verify-then-skip beats install-always |
| make the common case cheap, make the rare case possible | the-holding-pen | nothing |
| make the common case cheap, make the rare case possible | the-walk | nothing |
| one source of truth, everything else derives | the-record-life | git is the truth about which iterations exist and the disk derives; this is the iteration's central change and the rule states it in one line |
| one source of truth, everything else derives | the-account | the call log is the truth and every view derives, which already holds |
| one source of truth, everything else derives | the-walk | the drawn machine is the truth and the walk derives, which already holds |
| one source of truth, everything else derives | the-bootstrap | the repository is the truth about how to start, so the entrypoint is IN it rather than described beside it |
| one source of truth, everything else derives | the-holding-pen | nothing |
| push decisions to the last responsible moment | the-record-life | the folder is created at entry rather than at seeding, because entry is the last moment before it is needed |
| push decisions to the last responsible moment | the-bootstrap | the runtime version is checked at start rather than assumed at build, since the host is unknown until then |
| push decisions to the last responsible moment | the-walk | nothing |
| push decisions to the last responsible moment | the-account | nothing |
| push decisions to the last responsible moment | the-holding-pen | nothing |
| make the illegal unrepresentable, not merely checked | the-record-life | a folder with no live claim should be impossible rather than swept - this is the one cell that produced an option the design did not have |
| make the illegal unrepresentable, not merely checked | the-bootstrap | a half-installed machine should be impossible rather than detected, so the entrypoint is transactional or it exits |
| make the illegal unrepresentable, not merely checked | the-walk | a state with unmet inputs cannot be entered, which already holds by construction |
| make the illegal unrepresentable, not merely checked | the-account | nothing |
| make the illegal unrepresentable, not merely checked | the-holding-pen | nothing |
| small interfaces between big parts beat the reverse | the-bootstrap | the entrypoint takes three arguments - repository, iteration id, command - and that is the whole boundary to a machine nobody prepared |
| small interfaces between big parts beat the reverse | the-record-life | the record store's interface to the rest is one question, is this iteration open, so it stays one question rather than a folder API |
| small interfaces between big parts beat the reverse | the-walk | nothing |
| small interfaces between big parts beat the reverse | the-account | nothing |
| small interfaces between big parts beat the reverse | the-holding-pen | nothing |
| if it must be remembered, it must be recorded | the-bootstrap | the start procedure is a script rather than a handover document, which is this iteration's whole thesis and the rule states it independently |
| if it must be remembered, it must be recorded | the-account | already holds - every act is logged, which is what the cluster is for |
| if it must be remembered, it must be recorded | the-record-life | what a machine holds must be in the claim rather than in an operator's head, which is why an unclaimed entry warns rather than passes silently |
| if it must be remembered, it must be recorded | the-holding-pen | already holds - a stray is a note rather than a memory |
| if it must be remembered, it must be recorded | the-walk | nothing |
| the default should be the safe thing | the-bootstrap | the default on a held port is refuse and name the holder, never take it; taking it turns a careless restart into a cascade |
| the default should be the safe thing | the-record-life | the default at close is commit-or-refuse rather than remove, because the unsafe direction is unrecoverable |
| the default should be the safe thing | the-account | nothing |
| the default should be the safe thing | the-walk | nothing |
| the default should be the safe thing | the-holding-pen | nothing |

## options

- [[opt-the-folder-cannot-exist-without-a-live-claim]]
- [[opt-the-branch-is-the-record]]
- [[opt-worktree-per-record]]

## follow_up

- ONE OPTION IS GENUINELY NEW: a folder that cannot exist without a live claim, which is the unrepresentable version of what the design currently checks for
- IT CARRIES A CONTRADICTION ALREADY, and the node says so: offline entry has no claim to hang a folder on, and that is settled the other way
- THREE CELLS CONFIRMED CHOICES ALREADY MADE, with a reason that is not our own - git as the single truth, materialise at the last responsible moment, and the procedure being a script rather than a document
- TWENTY-TWO OF FORTY CELLS SAID NOTHING, and they are written out rather than omitted
- the remaining five finders run next, and trimming is the one most likely to add
- nothing is parked from this state

## anything_else

### What the sweep is worth

EIGHTEEN OF FORTY CELLS BIT. That ratio is the argument for running the catalogue whole rather than reaching for the rules that feel relevant: the-bootstrap answered to seven of eight rules and would have been swept once by instinct.

THE MISSES ARE WRITTEN because a blank row and an unasked question look identical afterwards. the-holding-pen answered to two rules of eight and nothing else, which is a fact about this iteration's cone rather than about the cluster.

### The one cell that produced something

"Make the illegal unrepresentable, not merely checked", held against the-record-life.

THE DESIGN ALREADY HAD THE WEAKER VERSION: the close removes the folder, and a sweep removes what earlier closes left. Both are checks, and both leave a crashed walk's folder standing.

THE RULE ASKS FOR THE VERSION WITH NOTHING TO CHECK. If the folder exists only as a side effect of a live claim, a folder with no claim cannot happen rather than being caught afterwards.

IT IS RECORDED WITH ITS CONTRADICTION rather than as a clean idea. Offline entry proceeds without a claim by owner ruling, and an option that needs a claim to own a folder has no answer for that yet. Writing the option without that line would have been the finder producing something that looks better than it is.
