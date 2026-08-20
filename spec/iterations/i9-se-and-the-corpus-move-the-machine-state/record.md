---
id: i9-se-and-the-corpus-move-the-machine-state
status: open
started: 2026-08-19T10:38:56.618Z
opened: 2026-08-12T19:39:42.160Z
goal: ".se and the corpus: move the machine-state folder into the product, make it a committed marker, split the lane's exclusion by file instead of by directory, and give the engine one corpus reader."
vision: |-
  FIRST AFTER THE FOUR ENABLERS (owner, 2026-08-13). It is the only agent record that unlocks DECISIONS of the owner's: it leads to i10, and i10 makes i21 and i22 available. Running it early spreads the owner's load rather than piling those two on later.

  DONE LOOKS LIKE: .se sits inside project/ beside .obsidian. The folder is tracked and its contents ignored, so a fresh clone still finds the marker. The lane serves everything in .se except the three files with a structured door. A method write reaches trunk and every open worktree in one act. One reader answers what the corpus is.

  RUNS BEFORE THE BIG SWEEP. The 121 broken citations cannot be repaired until .se is readable.

  WHERE .se IS TODAY: at the project root, one level ABOVE project/. engine/paths.ts line 30 resolves it as join(root, ".se", "roots.json").

  THE OLD RULING IS NOT IN THE WAY. engine/paths.ts lines 150 to 152 pin .se to the project root, but that ruling is about BRANCH INDEPENDENCE — session state belongs to the machine, not to a branch. It says nothing about depth. One phrase changes and the intent survives. Add ONE TEST asserting seDir resolves to one place while a record is bound, so branch independence stays pinned rather than trusted. seDir is three lines.

  THE MARKER: change .gitignore so .se itself is tracked and its CONTENTS are ignored. Our own .gitignore already does exactly this for Obsidian — line 10 ignores .obsidian/workspace.json and not .obsidian/. A marker that is never committed cannot mark anything for somebody who clones.

  WEIGH V1'S SHARPER ANSWER FIRST (product/engine-go/truth.go at ref main). v1 used a committed FILE as the marker, found by walking UP from the current directory, with absence a LOUD ERROR and never a silent fallback. The invariant that made it work is the part to steal: ENGINE WRITES INTO THE REPO ARE EXACTLY FOUR NAMED TRUTH MUTATIONS, so git status stays clean after any other command.

  THE EXCLUSION SPLITS BY FILE. engine/paths.ts line 18 hides five directory names and records NO REASON for any of them. Hiding .se wholesale costs three things: 121 citations across 80 requirement files point at .se/req-mine-v1.md and .se/req-mine-v2.md and can be followed by nobody; guidance/method/retro.md step 8 instructs a read of .se/test-last-run.json that the lane forbids; and the agent cannot read back the roots declaration its own header says it maintains.

  Hide only what has a structured door: calls.jsonl behind se_log_query, notes.jsonl behind se_survey, and the reading behind the pull. Keep .git, node_modules, .venv and __pycache__ hidden.

  .quack-watch.json MOVES INSIDE the marker folder. v1 had a law behind this: at most about five visible files and folders per level, dotfolders exempt.

  THE REQ-MINE FILES ARE NOT COMMITTED — they go to the scratchpad. So the 121 citations cannot be repaired by committing their sources. They must be REWRITTEN, most likely to reference notes for the v1 and v2 corpora at their refs. That repair itself belongs to the big sweep, not here.

  FULL CONTEXT: project/spec/version-planning.md, section i9.
inputs:
  - project/spec/version-planning.md
  - engine/paths.ts lines 18 and 133-161
  - product/engine-go/truth.go at ref main
---

# i9-se-and-the-corpus-move-the-machine-state

## Goal

.se and the corpus: move the machine-state folder into the product, make it a committed marker, split the lane's exclusion by file instead of by directory, and give the engine one corpus reader.

## Rough vision

FIRST AFTER THE FOUR ENABLERS (owner, 2026-08-13). It is the only agent record that unlocks DECISIONS of the owner's: it leads to i10, and i10 makes i21 and i22 available. Running it early spreads the owner's load rather than piling those two on later.

DONE LOOKS LIKE: .se sits inside project/ beside .obsidian. The folder is tracked and its contents ignored, so a fresh clone still finds the marker. The lane serves everything in .se except the three files with a structured door. A method write reaches trunk and every open worktree in one act. One reader answers what the corpus is.

RUNS BEFORE THE BIG SWEEP. The 121 broken citations cannot be repaired until .se is readable.

WHERE .se IS TODAY: at the project root, one level ABOVE project/. engine/paths.ts line 30 resolves it as join(root, ".se", "roots.json").

THE OLD RULING IS NOT IN THE WAY. engine/paths.ts lines 150 to 152 pin .se to the project root, but that ruling is about BRANCH INDEPENDENCE — session state belongs to the machine, not to a branch. It says nothing about depth. One phrase changes and the intent survives. Add ONE TEST asserting seDir resolves to one place while a record is bound, so branch independence stays pinned rather than trusted. seDir is three lines.

THE MARKER: change .gitignore so .se itself is tracked and its CONTENTS are ignored. Our own .gitignore already does exactly this for Obsidian — line 10 ignores .obsidian/workspace.json and not .obsidian/. A marker that is never committed cannot mark anything for somebody who clones.

WEIGH V1'S SHARPER ANSWER FIRST (product/engine-go/truth.go at ref main). v1 used a committed FILE as the marker, found by walking UP from the current directory, with absence a LOUD ERROR and never a silent fallback. The invariant that made it work is the part to steal: ENGINE WRITES INTO THE REPO ARE EXACTLY FOUR NAMED TRUTH MUTATIONS, so git status stays clean after any other command.

THE EXCLUSION SPLITS BY FILE. engine/paths.ts line 18 hides five directory names and records NO REASON for any of them. Hiding .se wholesale costs three things: 121 citations across 80 requirement files point at .se/req-mine-v1.md and .se/req-mine-v2.md and can be followed by nobody; guidance/method/retro.md step 8 instructs a read of .se/test-last-run.json that the lane forbids; and the agent cannot read back the roots declaration its own header says it maintains.

Hide only what has a structured door: calls.jsonl behind se_log_query, notes.jsonl behind se_survey, and the reading behind the pull. Keep .git, node_modules, .venv and __pycache__ hidden.

.quack-watch.json MOVES INSIDE the marker folder. v1 had a law behind this: at most about five visible files and folders per level, dotfolders exempt.

THE REQ-MINE FILES ARE NOT COMMITTED — they go to the scratchpad. So the 121 citations cannot be repaired by committing their sources. They must be REWRITTEN, most likely to reference notes for the v1 and v2 corpora at their refs. That repair itself belongs to the big sweep, not here.

FULL CONTEXT: project/spec/version-planning.md, section i9.

## Inputs

- project/spec/version-planning.md
- engine/paths.ts lines 18 and 133-161
- product/engine-go/truth.go at ref main

## Standing instruction for this iteration

THE OWNER DECIDES EVERY GATE HERE, and no gate passes without their word (owner
instruction 2026-08-19). Their words on giving the go: they will look at what
the agent is doing at the gates, so nothing is blessed without them.

HOW THE DECISION GETS RECORDED, since the two are not the same act. The owner
may press the bless themselves on the mirror, or give it in words and have the
agent stamp what they said. Either way the DECISION is theirs.

WHERE THE WORD CAME IN CHAT, THE STAMP CARRIES THE AGENT'S HAND. The ledger
counts stamps rather than decisions, so a gate decided by the owner and stamped
by the agent reads as an agent bless in the metric. That is a known gap between
what the number measures and what happened, and the form's own verdict says
whose call it was.

THE AGENT NEVER DECIDES ONE HERE. It may only record a decision already made.

WHAT ACTUALLY HAPPENED AT THE FIRST GATE, recorded because the agent read it
wrong once. The owner pressed the bless on the mirror themselves, and the form
carries `blessed by human`. The agent had read the form a moment earlier, seen
no bless, and concluded the decision would have to be stamped for them.

SO THE LEDGER READS TRUE HERE, and the paragraph above describes a fallback
that was not needed. Check the form before assuming which of the two happened.

THIS OVERRIDES THE AUTONOMY DIAL for this iteration. At high autonomy an agent
may normally stamp its own gate. Not here, whatever the dial reads.

WHY IT IS WRITTEN DOWN RATHER THAN REMEMBERED. It was said in chat, and chat
does not survive a compaction. `vp-the-ledger` targets zero agent blesses, and
three of i16's gates carry one against that target.

EVERYTHING ELSE IN THIS ITERATION IS THE AGENT'S. The same instruction said to
work through the rest alone.

## One scope item is stale

THE WORKTREE FAN-OUT IS OBSOLETE. The vision above asks that a method write
reach trunk and every open worktree in one act. i34 shipped on 2026-08-16 and
retired worktrees entirely, and the owner ruled the worktree-and-trunk pair
obsolete on 2026-08-18.

SO THAT ITEM DROPS and this iteration is smaller than its vision reads. Method
now resolves to the machine root whichever record is bound, which is the
resolution that replaced the old refusal.

## Carried work tokens

These stood in the options pool referenced by no iteration at all. Assigned
here in a pass over the pool.

- wt-enginesearchts-never-reaches-the-one-path-visibility-seam-in
