---
form: verification
by: agent
signed_off: 2026-08-16T18:37:22.592Z
authors: agent
files:
---

# Evidence form / verification

## current_situation

THE BATTERY IS OWED SIX RUNS DEEP. Chunks six through eleven were built while se_test was deadlocked in the running engine — SE-C-112 refusing an agent-initiated battery here, SE-C-131 answering the scoped run with 42 changed files and ordering the battery. Each named the other. Chunks eight and nine deleted that deadlock and the replacement cannot load until idle, so this submit is the first battery since the build began.

NINE FILES WERE RUN THROUGH se_run UNDER no_tool_reason in the meantime, each reason logged. They answered real questions and found two real defects. They are not a substitute for this run.

TWELVE NON-TEST SPECS OWE A DELIBERATE CHECK. Seven cannot be observed from this machine and each names its carrier. Five were observed, and what each rests on is below.

## claims

- [x] tsp-autonomy-tiers
- [owed] tsp-bound-surface — raid-debt-the-bound-surface-demo-leans-on-two-open-records
- [x] tsp-derivation-analysis
- [owed] tsp-desk-and-gates — raid-debt-human-observed-demonstrations
- [owed] tsp-first-run — raid-debt-human-observed-demonstrations
- [owed] tsp-panel-walkthrough — raid-debt-human-observed-demonstrations
- [x] tsp-prose-inspection
- [x] tsp-read-back-inspection
- [x] tsp-record-inspection
- [owed] tsp-tour-run — raid-debt-human-observed-demonstrations
- [owed] tsp-two-machines — raid-debt-cloud-validation-needs-a-machine-this-one-cannot-make
- [owed] tsp-unattended-start — raid-debt-cloud-validation-needs-a-machine-this-one-cannot-make

## follow_up

THE BATTERY'S VERDICT DECIDES THE NEXT DOOR. Green goes to gate-implementation. Red opens fix-findings, and the row's own rule is to collect everything before fixing anything.

WHAT THIS RUN IS CARRYING, and why a red would be unsurprising: six build chunks landed without a battery behind them, and two of the nine scoped runs found real defects — chunk ten's remedy and an over-broad case of my own. A first full run over that much unrun change is where the rest surfaces.

FOUR THINGS GO TO sweep-consistency, all found by reading rather than by looking for them.

- Three stale comments naming an autonomy slider that no longer exists.
- dsp-record-lifecycle's statement still says records are carried by one worktree each, and its constraint still says two open records never share a tree. i34 deleted worktrees.
- req-product-is-a-folder carries an empty "## Detail" twice.
- Three files still cite the dead i27 long id.

ONE THING GOES TO THE RETRO: the fresh-eyes tester the method demands and the harness forbids.

## anything_else

### What each checked box rests on

NO BOX IS CHECKED ON AN UNOBSERVED CLAIM. Each of the five names what was read or run.

tsp-autonomy-tiers — INSPECTION, SWEPT. Its claim is that no numeric autonomy value and no slider survives on any surface, state note or guidance page. A sweep of the engine for a range input returns nothing, and for a numeric autonomy assignment nothing. THREE STALE COMMENTS DO NAME A SLIDER, in se-mcp.ts, se-manual.ts and render.ts. They are prose about a control that no longer exists, not the control, so the requirement holds and the prose does not. Noted for sweep-consistency as note-9da98c3b66d4.

tsp-derivation-analysis — ANALYSIS, AND IT HAD TO BE REFRESHED. Its own Approach says it refreshes when the surfaces or the offer change, and this delta changed the offer: nine gate rows gained se_file_write and se_file_patch. THE CAPABILITY SET DID NOT GROW. Both verbs were already in the offer at other states and already traced; nine more states now reach them. So capability coverage is unchanged and the reason is recorded rather than assumed. ON VIEW DERIVATION: the one view this delta touched is the design trace, and it derives from the design-spec nodes — which is why the three new files were claimed by editing the NODES and the table followed.

tsp-prose-inspection — INSPECTION, SWEPT. Its third item is the one this delta could break: stored records carry roles, zero usernames or hostnames. A sweep of project/spec for account names and home paths returned two hits, BOTH THE WORD in prose — i11 and i27's own evidence describing this very check. Zero real hits. Entry documents and tour text were untouched by this record.

tsp-read-back-inspection — UNTOUCHED. Its subject is the resolution seam proving a write by reading back through the store the answer named. This delta changed no resolution code, so its standing verdict carries.

tsp-record-inspection — OBSERVED, WITH ONE EXCEPTION NAMED. Seven trace nodes were minted here and every one carries its upward links in its own file. Most of its twelve items are not exercised: no product begun, no record seeded, no divergence, no made choice, no filled story. THE EXCEPTION IS THE LAST ITEM: any test run recorded with the question it answered. This iteration's runs went through se_run rather than se_test, because of the deadlock above, so they carry a logged reason rather than a question field. That is the deadlock's cost stated plainly rather than checked past.

### The seven that are owed, and by whom

FOUR SIT ON raid-debt-human-observed-demonstrations, open since i3 and re-accepted at i12's retro with the owner's words recorded on it. They need a first-time reader, a second host, and a person watching a screen.

TWO SIT ON raid-debt-cloud-validation-needs-a-machine-this-one-cannot-make. Both spec files name that entry themselves, in their own closing sections, so the citation is the primary source rather than my reading of it.

ONE HAD NO CARRIER AND NOW HAS. tsp-bound-surface says in its own "What it leans on" that the procedure cannot run until two records can stand open with satellites serving both. Nothing carried that, so every iteration met the same blank and re-derived the same conclusion — which is the exact waste the i3 debt row exists to stop, applied to a spec that sat outside it.

### Two of those references did not resolve, and that was a defect rather than an answer

THE CHECK REFUSED THE TWO CLOUD SPECS on the first submit, because their carrier's status is `accepted` and engine/stateform.ts tested for exactly `open`. Its own comment named a different rule: closed, decided or missing refuse, because there is nobody left holding the claim.

ACCEPTED IS THE STRONGEST CARRIER THERE IS. Somebody looked at it and decided to ship anyway, on the record. Refusing it forced a choice between a fabricated tick and a stall.

SO THE CHECK NOW MATCHES ITS COMMENT: closed, decided and superseded are settled and carry nothing; open, probed, mitigated, accepted and deferred are live. tests/owed-ref.test.ts drives all eight and the file joins tsp-the-bucket.

THE REGISTER HAD ASKED FOR THIS PROBE. raid-asm-an-entry-status-says-whether-it-is-open says in as many words: read the eight status values and rule which count as open for this guard. It predicted the failing case too — "the interesting cases are `accepted` and `deferred`". It now carries the result and stays open, because its second half needs a close-side reader that does not exist.

### The fresh-eyes tester was not spawned

THE ROW ASKS FOR ONE: an agent verifying here spawns a tester subagent with fresh context. THE HARNESS THIS SESSION RUNS UNDER FORBIDS IT unless the person asks, and they have not.

SO THE VERIFICATION IS SELF-ADJUDICATED, and that is a real weakening rather than a formality. The five checks above are the same eyes that wrote the code. What protects them is that four of the five are SWEEPS with a stated command and a stated result, which a second reader can re-run rather than re-judge.

IT IS WORTH A RULING AT THE RETRO. The method wants fresh eyes and the harness will not give them; one of the two has to move.
