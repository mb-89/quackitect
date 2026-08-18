---
form: gate-release
bless: blessed by agent
by: agent
signed_off: 2026-08-18T11:44:13.834Z
authors: agent
files:
---

# Evidence form / gate-release

## current_situation

`dist/quackitect-4.6.0.zip` is built, unpacked into a bare directory outside
the repository, installed from its own lockfile and driven end to end: its
engine booted as 4.6.0, served 34 lane tools, answered a pull with its own boot
card, and captured a note.

THE NARROW QUESTION at this gate is whether the package stands. It does, and
the check that proved it also found one thing the last two package checks did
not look for.

## market_block


## round_0_verify

- evidence vs claims: CHECKED, AND THE CHECK IS THE STORY OF THIS GATE. The package's own `works` claim was tested by doing more than a reader would — running the shipped suite inside the unpacked archive — and fifteen cases fail there. Every one is a missing corpus path the package excludes on purpose. Filed as raid-iss-the-shipped-archive-carries-fifteen-tests-that-cannot-pass-in-it rather than quietly left
- types: RUN AND GREEN across the tree
- lint: RUN AND GREEN. biome over 289 files, no fixes applied, no warnings
- tests: RUN AND GREEN IN THE REPOSITORY — 1475 tests, 143 suites, 0 failures, and preflight and the corpus sweep green beside them. IN THE SHIPPED ARCHIVE the same suite is 1460 of 1475, for the reason above
- the package: ASSEMBLED BY SCRIPT in 426 ms, 2.87 MB. Assembling by hand is the defect this state names and no hand touched it

## round_1_validate

- exercised against the goal: YES, and the archive is where it is finally checkable. The pool code, the work-token item card and the swept walking.md all ship. A reader installing 4.6.0 gets the mechanism and the documents that teach it, which is the pair this iteration was cut to deliver
- missing: THE MIGRATION, and one machine cannot run it. The pool also has no surface a person touches, which is i23's, and the pool folder does not yet exist in any clone because nothing has been minted outside a test
- wrong: FIFTEEN SHIPPED REDS, found here and not before. Not a regression and not this iteration's — the packaging rule and the corpus laws both predate it, and nobody had put them in the same room
- out of scope: the merge, the machine-evaluable wake, the owned queue, the routing, the criteria machinery. All named at kickoff and none arrived late
- prior art: MADE AT M1 and unchanged since gate-validation. This gate judges the archive, not the field

## goals_served

- the pool travels: draining a note to backlog mints a committed, rewritten item on trunk: SHIPPED. engine/pool.ts and the work-token item card are both in the archive, and the version bump is a minor because the mechanism adds rather than changes
- the rewrite is the privacy boundary: a raw note never enters version control, and what cannot be stated cleanly is refused rather than guessed: SHIPPED WITH ITS LIMIT DOCUMENTED. SE-C-140 ships in refusals.md, so a reader who hits the refusal finds the rule rather than folklore. The RELEASES entry says in plain words that a single bare name is not caught
- an unattended walk can file into the pool, so a finding survives the box being released: SHIPPED, and this record is its own first evidence. Every defect this walk found — three at boot, the repair loop, two uncrossed flows, the stale projection, the fifteen shipped reds — is in the tree rather than in a container that is about to be reclaimed
- engine improvements: SHIPPED, and two landed after the implementation gate. se_prompt_place now belongs to the two states that can invalidate the prompt layer, which closes a state that could see a failure and not clear it

## bound_breaches

- if-agent-harness-to-entrypoint: the pulls carrying documents and the form submits, as at every gate in this record. Nothing new and no new cause. The count remains a floor rather than a rate, because this clone's call log starts inside this session
- if-test-runner-to-toolchain: three battery runs in this milestone at 69s, 68s and 68s wall, plus one 68s run inside the unpacked archive. The boundary declares a bound deliberately not one second, so none is a breach

## round_2_red_team

- STEELMAN: a release gate that has just found fifteen failing tests should not ship => The strongest version says a ship gate exists to stop a broken artifact, fifteen tests in the artifact fail, and shipping anyway is the gate abdicating. WHAT DEFEATS IT: the fifteen do not test the reader's install. They are corpus laws about OUR repository, reading paths the package excludes on purpose because that folder is where the reader's own records go. Holding 4.6.0 for them would hold a working mechanism hostage to a suite that was never about the reader. What is legitimately damning is that nobody looked until now, and that is filed rather than argued away
- KILL-CRITERION: if the shipped pool code does not actually run in a fresh install, nothing here matters => Falsified directly. The archive was installed into an empty directory, its engine reported 4.6.0, and it served 34 tools including se_note and se_note_drain. The pool module and the work-token card are both present in the unpacked tree
- THE MINT HAS NEVER RUN OUTSIDE A TEST => Conceded, and it is the largest thing this gate ships without. Every case runs on a temp root, and the pool folder does not exist in any clone. The first real mint happens at the next retro, and this release is what makes that possible rather than a report that it happened
- THE RELEASE NOTE PROMISES A CROSSING NOBODY HAS WATCHED => Checked against the text and it does not. The entry says a finding "can be picked up on another" machine and lists what does not change, including that nothing on screen shows the pool. A reader is told the mechanism, its limit, and that their own parked notes have not moved
- THIS GATE IS THE SAME AGENT SIGNING ITS OWN WORK FOR THE FIFTH TIME => True, and it is the standing condition of an unattended run rather than a property of this delta. What makes it survivable is that nothing here rests on my judgment alone: every mechanical check is the engine's, the eleven verification findings came from a tester with fresh context, and the two limits carried forward are each pinned by a case that fails the day somebody changes its terms

## raid_additions

- raid-iss-the-shipped-archive-carries-fifteen-tests-that-cannot-pass-in-it

## verdict

pass with overrides — the archive is built by script, installed into a bare directory and driven from there, and the two things it ships without are named rather than carried quietly.

TWO OVERRIDES, both carried forward from validation and neither closed by packaging.

1. THE MINT HAS NEVER RUN OUTSIDE A TEST. Every case runs on a temp root and no clone holds a work token. The mechanism is green on both halves and its first real use is the next retro's.

2. THE SHIPPED SUITE CARRIES FIFTEEN REDS. Found by this gate's own check, filed as an issue with two candidate fixes and a recommendation, and not fixed here because the fix is the packaging's rather than this delta's.

WHY SHIP. The mechanism a reader installs works, and it was proved by installing it. Both overrides are properties of what one machine can demonstrate and of a packaging rule older than this record, not work this iteration left undone.

## follow_up

- The retro's field-feedback question opens the next start, and it is the owner's own report from outside the machine
- The fifteen shipped reds want a skip guard on the corpus laws, so an absent corpus reads as a skip rather than a failure
- The migration of what is already parked runs where those notes are, and its first act is a report of what did not fit
- The guard that would have caught the name collision — refusing a node kind whose folder or id_prefix another kind already declares — is still named and not built
- The criteria machinery, the other half of this record's seed, is still owed its own iteration

## anything_else

WHAT THIS RELEASE IS, in one line for whoever reads the archive first: parking
a note during a look-back now writes a real item into the project, so the next
person to open a copy sees what could be done next.
