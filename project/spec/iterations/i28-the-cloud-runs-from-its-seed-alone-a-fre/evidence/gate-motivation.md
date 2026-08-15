---
form: gate-motivation
amended: "2026-08-15T15:30:13.804Z by agent — The offline finding contradicted a ruling the owner had already given: work starts offline, the claim warns and the walk continues."
bless: blessed by agent
by: agent
signed_off: 2026-08-15T15:10:03.334Z
authors: agent
files:
---

# Evidence form / gate-motivation

## current_situation

M1 is complete. The vision inherited, the as-is extended with witnesses on both halves, the delta framed, the scope cut, and the packet pressure-tested with a PR-FAQ.

THE REGISTER STANDS AT EIGHT ENTRIES, four opened at the kickoff and three more during M1, with one more owed that this gate cannot write.

PAST THIS GATE THE VISION IS AXIOMATIC, which is why the interestingness argument happens here and nowhere later.

## vision_scope_stated

THE PACKET IS COMPLETE, and each part names where it lives.

- THE BIG IDEA is inherited from [[vp-the-engine]] rather than authored, and the delta is zero. The prop already carries this iteration's acceptance criterion as a success metric: acts from clone to first claimed iteration, target two.
- THE TO-BE WORLD is stated by what is absent from it. No handover is read, no folder is repaired, no dependency is inferred, and nobody asks which iterations exist because git answers.
- THE GOAL SYSTEM names three goals and two conflicts, both taken from this walk's own experience rather than imagined. Each conflict carries its resolution and the cost that resolution accepts.
- THE PITCH positions against Codespaces, Gitpod and a written handover, and states plainly which of them is better than us today.
- THE AS-IS extends rather than replaces, with a witness on every claim, and it states the good half as fully as the bad.
- THE DELTA carries the gap as a falsifiable claim, four alternatives with what each sheds, and three things that matured to make now the moment.
- THE SCOPE cuts the owner's five lifecycle points, the seed's six bootstrap failures, and the entry-never-repairs rule, with eight named non-goals each carrying where it went.

NOTHING IN THE PACKET IS EMPTY, and the one field answered `none` is value_props, deliberately, because this delta authors no new proposition and says so.

## problem_agreed

THE DELTA IS REAL AND IT WAS DEMONSTRATED RATHER THAN ARGUED.

THE CLAIM: a machine that has this repository and a seed id cannot start work, because the machinery answers which iterations exist from a folder only the seeding machine has.

THREE INDEPENDENT DEMONSTRATIONS, none of them theoretical.

- THE FIELD, 2026-08-14. The owner's second machine saw zero iterations and had to be taught by hand that iteration state is the merge of git and disk.
- THE CODE, read today. engine/iterations.ts line 71 answers the question with `existsSync`, while engine/survey.ts line 51 answers the same question from the record's status. Two readers, two answers.
- THIS WALK, today. i28's own door was absent from the container because i27 shipped and left a folder. Entry cost about a dozen calls and five shell commands on a machine that was already configured.

WHY THE GOAL IS WORTH HAVING. The owner's own argument for placing this second in the run order: every other enabler saves time inside one machine, and this one adds machines. It multiplies the set rather than any single iteration.

AND THE OWNER'S SHARPER VERSION, given today: "humans also need to be able to do this. We can't have a system where you need to tinker around the edges every time just because you start some work."

THE HONEST COUNTER, which does not defeat it. If only one machine will ever run this product, the case collapses to tidiness. Two machines have already run it, which is why that is not the situation.

## prior_art_positioned

POSITIONED AGAINST WHAT EXISTS, and the comparison names what each does BETTER first.

- CODESPACES AND GITPOD. BETTER THAN US: a workspace is created from a repository reference and destroyed after, so its absence is never read as the work not existing. That is exactly the defect that blocked this iteration's entry. WHAT THEY COST: a hosted control plane and a container per workspace. WHAT WE SHED: both, entirely.
- GIT WORKTREE ITSELF. BETTER THAN US at the one thing we got wrong: its own list is the authority, and its remove refuses a dirty tree. We reimplemented that question with `existsSync` and lost the refusal in the process.
- DEVCONTAINERS. BETTER THAN US at environment reproduction, which is the half of our bootstrap that is prose today. WHAT THEY DO NOT CARRY is a walk to resume, so the record and position half stays ours regardless.
- A WRITTEN HANDOVER, which is our own current answer. BETTER THAN THE ALTERNATIVES at nothing, and it FAILED in the field: the committed handover was false in three places that mattered, and the owner ruled it deleted.

WHAT FAILED, from our own history. v1 shipped a shell entrypoint beside the PowerShell one and this version dropped it, which is a capability lost rather than never had.

THE LIMIT OF THIS COMPARISON, stated rather than hidden. Neither Codespaces nor Gitpod was run against this workload. This compares their documented behaviour against our measured behaviour. That is enough to say which shape to copy and not enough to claim we beat them at anything.

## success_measurable

EVERY NEED CARRIES A PASS LINE, and one of them was already written by the value prop rather than by this iteration.

- A MACHINE JOINS AND WORKS. Metric: acts from clone to first claimed iteration. Pass line: two. Source: [[vp-the-engine]]'s own success criteria, unchanged.
- A FRESH CLONE SEES THE WORK. Metric: iterations visible after clone with no manual fetch. Pass line: all seeds present in git. Today: zero.
- ENTERING NEVER REPAIRS. Metric: calls between choosing an iteration and its first state, on an already-configured machine. Pass line: no repair call at all. Today: about a dozen, measured this session.
- A FAILURE SAYS WHICH STEP. Metric: bootstrap failures whose message names the failing step. Pass line: all of them. Today: the first cloud run reported every failure as "the server is not there".
- THE DISK MEANS ONE THING. Metric: folders on disk for iterations nobody is working. Pass line: zero. Today: 27.
- THE CONTAINER STAYS INSIDE THE SECOND. Metric: time to draw the iterations list at the real iteration count. Pass line: under one second, per the standing requirement. Today: met with the disk test, and the git test is unmeasured, which is the kill-criterion.

THE LAST ONE IS THE ONE THAT CAN FAIL THE WHOLE CHANGE, and it is recorded as an assumption with a written probe rather than assumed.

## risks_logged

THE REGISTER IS OPEN WITH EIGHT ENTRIES, every one carrying an owner and a trigger, and none of them a topic rather than a claim.

- FOUR OPENED AT THE KICKOFF: the git-cost assumption that is this change's kill-criterion, the close destroying uncommitted work, the ordering risk across the four lifecycle steps, and the cloud-validation debt with its Repayment section.
- THREE OPENED DURING M1: the read proof locking weaker models out, the folder removal making the engine the only door, and no iterations being visible without a reachable remote.
- ONE FOUND BY THIS GATE AND NOT YET WRITTEN, because a gate cannot author. It is named in round 2 and carried in follow-up.

GRADES ARE NOT UNIFORM, which is the sign they were judged rather than stamped: one fatal, two crippling, three corrosive, one abrasive.

THE ONE THAT MATTERS MOST is not the fatal one. It is the assumption, because it is the only entry whose falsification would mean the whole design is wrong rather than merely dangerous.

## round_0_verify

- evidence vs claims: pass — every claim in the M1 packet carries a witness, and the three central ones are a field report, two lines of our own code read today, and this session's own measured failure
- types: pass by vacuity — M1 changed no code, and the eleven files written are markdown
- lint: NOT RUN and not claimed — se_lint is refused at a gate under SE-C-110, so the eight register entries and five evidence forms are unlinted, and the sweep is carried in follow-up rather than assumed
- tests: NOT RUN and not needed — the last battery stands green at 1314 of 1314 from i12's close this morning and no code has changed since, so a run would answer no question

## round_1_validate

- exercised against the goal: pass — the goal is that a machine with a seed id and one command produces a walking agent, and the packet's scope is that goal decomposed into a reader change, an entry path, a close path, a lane verb and a bootstrap script
- missing: the kill-criterion probe has not run, and it is the only thing in the packet that could invalidate the design rather than complicate it; nothing else named in the seed or the owner's rulings is absent
- wrong: one thing in the inputs was wrong and measurement corrected it — the owner expected old archived iterations lying around, and the disk holds none, so the sweep is about 27 folders for OPEN iterations instead
- out of scope: eight non-goals are named, each with where it went, and the two largest are the cloud validation which became a debt and the one-pager programme which moved to i19
- prior art: compared rather than cited, with what each does better stated first — Codespaces and Gitpod are better than us today at exactly the property we lack, git worktree is better than us at the refusal we discarded, devcontainers are better at environment reproduction, and our own written handover failed in the field; the limit is that none of them was run against this workload, so it is their documented behaviour against our measured behaviour

## round_2_red_team

- STEELMAN: keeping a folder per iteration is a real design, not laziness — it is browsable by any tool, greppable, and survives an engine that will not start, so removing it makes the engine the only door to the work => answered partly and the cost is accepted rather than denied, since `git show it/<id>:<path>` reads anything with no engine, at the price of one command and knowing the branch name; logged as [[raid-removing-the-folder-makes-the-engine-the-only-door]]
- THE CHEAPER ALTERNATIVE: just fix the fetch refspec and keep the folders, which closes the field's original complaint at a fraction of the cost => rejected on a specific case rather than on principle, because a finished iteration's leftover folder would still read as open, which is the exact defect that made this iteration unenterable; fetching harder makes the stale answer arrive faster
- A CRASHED WALK LEAVES A FOLDER THAT MEANS NOTHING, and the rule "a folder means somebody is working it right now" was stated as a definition rather than as a guarantee => on a cloud machine a stopped container is the expected ending, so the answer lives in a claim that can go stale rather than in a folder that must be trustworthy; now [[raid-a-crashed-walk-leaves-a-folder-that-means-nothing]], written one state later because a gate could not write
- THE OFFLINE CASE: what happens when git is not reachable => CORRECTED 2026-08-15, and the first answer here was WRONG. It said entering offline was impossible because the claim must reach the remote. The owner had already ruled otherwise before this iteration opened: work starts offline, the claim fails gracefully and WARNS, the walk continues unclaimed, and the desync risk is accepted knowingly. Reading the list is local in either case, provided the implementation reads local refs rather than querying the remote. Now [[raid-no-iterations-are-visible-without-a-reachable-remote]], rewritten to match the ruling.
- KILL-CRITERION: this whole design is the wrong call if an iteration's status cannot be read from git cheaply and reliably without a worktree, because then the folder was a cache earning its keep => recorded as [[raid-asm-git-answers-open-without-a-worktree]] with a probe that times both paths over the real 27 iterations, and the probe is scheduled first in the build rather than last
- THE GATE IS JUDGING A DESIGN NOBODY HAS BUILT, so round 0 has little to verify and two of its four checks pass by vacuity => stated plainly rather than dressed up, because that is what honest M1 evidence looks like
- THIS ROUND ANSWERED A QUESTION THE PROJECT HAD ALREADY SETTLED, and answered it wrong => the finding under it: a pressure test that folds a discovery upstream never checked whether the discovery contradicted a standing ruling, and nothing in the method asks it to

## raid_additions

- [[raid-the-read-proof-locks-weaker-models-out-of-the-system]]
- [[raid-removing-the-folder-makes-the-engine-the-only-door]]
- [[raid-no-iterations-are-visible-without-a-reachable-remote]]

## verdict

pass — the delta is demonstrated three independent ways rather than argued, the packet is complete in every part, the prior art is compared with what the others do better stated first, and every need carries a pass line with today's value beside it.

WHAT IS NOT BEING WAVED THROUGH, and it is why this is a plain pass rather than a clean one. The red team found a hole the design does not answer: a crashed walk leaves a folder that means nothing, and on a cloud machine that ending is expected rather than exceptional. The gate cannot author a node, so it is named in round 2 and owed in follow-up to the next writable state. If it is not written there, this verdict was wrong.

NO OVERRIDES. Nothing passes here with a dissent attached, and the register additions are three real entries rather than a `none` covering silence.

## follow_up

- MINT THE CRASHED-WALK ENTRY at the first state that can write, as an assumption with the probe already drafted in round 2: kill a bound walk, then ask the container and the disk what they each say
- SWEEP THE EIGHT REGISTER ENTRIES AND FIVE EVIDENCE FORMS with se_lint at the first state that allows it, since a gate refuses the tool
- RUN THE KILL-CRITERION PROBE FIRST in the build rather than last, timing status-from-git against existsSync over the real 27 iterations
- CARRY THE OFFLINE CONSTRAINT INTO M3 as a testable requirement row, because reading local refs rather than querying the remote is easy to get wrong by accident
- M2 IS NEXT and its stakeholder work has a live question already: the cloud is a neighbour rather than a setting, and it has no node today
- nothing is parked, and no note was written from M1

## anything_else

ONE PROCESS FINDING, recorded because it cost this walk real time and it is the same class this iteration exists to fix.

THE WALK OFFERED NO ROUTE TO AN UNWALKED FORK BRANCH. Twice in M1 the join reported a branch still owed, the pull offered only the join itself, and SE-C-123's remedy said "walk the branch that is still owed" without saying how. se_aim found the way both times.

THAT REMEDY FAILS ITS OWN TEST, which is whether somebody could act on it without asking a second question. It belongs to i11's engine-fix bundle rather than here, and it is recorded in this iteration's as-is with its witness.
