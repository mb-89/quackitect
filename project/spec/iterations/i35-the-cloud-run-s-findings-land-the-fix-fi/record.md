---
id: i35-the-cloud-run-s-findings-land-the-fix-fi
status: open
started: 2026-08-17T10:53:33.649Z
opened: 2026-08-17T10:28:33.420Z
goal: "The cloud run's findings land: the fix-findings fallback that stops every walk, the full battery that never fires at verification, the container blind spots a POSIX box keeps rediscovering, and the short-name rename that never finished."
vision: "DONE MEANS AN UNATTENDED BOX WALKS AN ITERATION END TO END, and nobody works anything out that this run already worked out.\n\nThe source is the field report at project/scratchpad/fieldreport.md, written after i15 ran on a cloud machine on 2026-08-16 from 15:25 to 20:00 UTC. It lists ten things fixed on that box that do NOT travel. Every one is rediscovered by the next run unless it lands here.\n\n## 1. THE BLOCKER — the fix-findings fallback\n\ni15's walk stopped at verification with SE-C-123: a join still waits for other inbound edges. Both ends report clear on their own. se_why verification says nothing holds it. se_why fix-findings says nothing upstream is waiting. No form can be submitted, because the pull answers `do` rather than `fill`.\n\nCHECKED 2026-08-17: the source row project/deliverable/machines/rigor_matrix/rows/M7_60_fix-findings.md declares ONE inbound dependency, verification, and marks it edge_role: fallback. So either the compiler adds inbound edges the row does not declare, or it does not honour edge_role: fallback.\n\nTHAT ROW IS SHARED MACHINERY. Every record with a fix-findings step compiles from it, so this is not i15's seeded copy and it is not one iteration's problem.\n\nDONE LOOKS LIKE: i15's walk moves forward, and a test drives the case so it cannot come back.\n\nRelated notes: note-ed0ce3eea951, on the fallback being gated on the condition it exists to answer.\n\n## 2. THE FULL BATTERY NEVER FIRES AT VERIFICATION\n\nBoth sides point at each other and neither acts.\n\n- The matrix row M7_50_verification.md says filled_by: engine, the full battery runs mechanically, and calls it a floor never struck at any size.\n- The engine refuses an unscoped se_test outside verification with text saying the full battery runs at verification, where the engine fires it.\n\nNOTHING FIRES IT. The engine only stops refusing once the walk is at verification. It never initiates. MEASURED: i15's verification signed with .se/test-last-run.json recording 2 tests against a suite of 1325.\n\nTHE FIX IS ONE OF TWO AND THE CHOICE IS THE OWNER'S.\n\n- The engine fires the battery on ENTERING verification, as both texts already claim.\n- Or filled_by: engine is struck from the row, verification cannot sign without a battery verdict newer than the delta, and the agent fires it explicitly.\n\nRelated note: note-4ead924e4cab, the agent asking for the battery and reporting without waiting for the verdict.\n\n## 3. VERIFICATION FIXES, IT DOES NOT LOOP — owner ruling 2026-08-16\n\nTHE OWNER'S WORDS: \"I actually don't want these loops in the verification. I want verification to fix issues. I don't like these loops. The idea is, if you have a problem higher up in the trace, you write some technical debt for it. And then you still finish.\"\n\nWHAT THE WALK DID INSTEAD, measured: verification signed at 19:04, then front_desk, then run-candidates re-entered six times, then verification again at 19:42. Thirty-eight minutes, about 140 calls, and the evidence count did not move — 39 of 52 states before and after.\n\nTHE RULE STATED FORWARD:\n\n- Verification fixes what it finds, in place, where the fix is legal.\n- A finding belonging higher up the trace becomes a raid entry of kind debt, with its `## Repayment` section written at the moment the debt is taken.\n- And then the walk finishes. It does not go back up.\n\nWHAT WOULD ENFORCE IT, and the choice is open: the engine refuses a transition to a state whose evidence already stands unless the person aims there deliberately, or verification's own row gains the alternative in as many words.\n\nRelated notes: note-0af46cbcd41f, note-4be3cfe2a2fe.\n\n## 4. THE CONTAINER BLIND SPOTS\n\nFour small fixes, each measured on the box.\n\n- engine/shoot.ts line 77 passes no --no-sandbox, and chromium refuses to run as root. One conditional on process.getuid?.() === 0 takes three red tests to green and the box from 5 red to 2. Conditional deliberately, because unconditional weakens a desktop run.\n- The BROWSERS list in the same file does not know /opt/pw-browsers/chromium, which is where every Playwright image puts one.\n- guidance/method/cloud-runner.md's Arrival A never says to fetch. A cloud clone carries one branch, so any record citing `ref: main` is dead on arrival. It needs `git fetch --all --prune` AND `git branch main origin/main`, because `git show main:...` fails when only origin/main exists. This cost i15 four refused calls, a wrongly-minted assumption, and a false claim that spread through six evidence forms.\n- engine/bin/se-start.ts's fetch step still dies when refs/remotes/origin/it/<id> is absent. i34 retired per-iteration branches and the comment in that file says so. It passes on this repo only because those branches happen to still exist.\n\n## 5. PREFLIGHT RUNS GREEN OVER UNPARSEABLE YAML\n\nMEASURED: a regex for a terminated frontmatter block returned NO on a trace file at 17:39, and preflight.ts printed `preflight green` at 17:40.\n\nSE-C-135 checks the payload arrived VERBATIM, never that it was WELL-FORMED, and se_file_write is the one lane verb that replaces a whole file with no structural guard.\n\nThe corpus is what every query and coverage check is built ON, so a green check over broken YAML there is the worst place for it. One regex per spec/trace/**/*.md closes it.\n\n## 6. THE SHORT-NAME RENAME NEVER FINISHED\n\nBoth forms are live. The machine's doors and state keys take the short id, `iterations/i15`. The record itself still carries the long one — the folder name, record.md's own `id:`, 69 `minted_in:` fields under spec/trace, and the `expedition` field on every single pull answer.\n\nWHAT IT COST, twice, to two different readers: an aim at the long id refused SE-C-110 with no drawn path, and the walking agent made the same mistake at 19:26 and spent about 20 minutes and 93 calls, 17 of them refused.\n\nWHY IT IS WORSE THAN COSMETIC: every surface an agent reads teaches it the LONG name, and exactly one surface accepts only the SHORT one. The system spends all day teaching the wrong identifier and then refuses it.\n\nThis is a sweep, not a patch. It may be right to hand it to the big-sweep iteration instead — that judgment belongs at this iteration's kickoff.\n\n## What is deliberately NOT in here\n\n- SE_BRAVE_API_KEY is configuration in the lane's environment, not code. It is the owner's one-line act, and it is what let a prior-art risk ride open through four gates.\n- The operator's own four mistakes, listed in the field report, taught the playbook and need no code.\n- The report's design suggestions are separate: a person recording an answer through the mirror, a stop hook that knows whose walk it is, a warning when two agents pull one session, and a nudge preferring se_file_patch over a whole-file write."
inputs:
  - "project/scratchpad/fieldreport.md"
  - "note-ed0ce3eea951"
  - "note-0af46cbcd41f"
  - "note-4ead924e4cab"
  - "note-4be3cfe2a2fe"
  - "note-868eb96e8b61"
depends_on: []
---

# i35-the-cloud-run-s-findings-land-the-fix-fi

## Goal

The cloud run's findings land: the fix-findings fallback that stops every walk, the full battery that never fires at verification, the container blind spots a POSIX box keeps rediscovering, and the short-name rename that never finished.

## Rough vision

DONE MEANS AN UNATTENDED BOX WALKS AN ITERATION END TO END, and nobody works anything out that this run already worked out.

The source is the field report at project/scratchpad/fieldreport.md, written after i15 ran on a cloud machine on 2026-08-16 from 15:25 to 20:00 UTC. It lists ten things fixed on that box that do NOT travel. Every one is rediscovered by the next run unless it lands here.

## 1. THE BLOCKER — the fix-findings fallback

i15's walk stopped at verification with SE-C-123: a join still waits for other inbound edges. Both ends report clear on their own. se_why verification says nothing holds it. se_why fix-findings says nothing upstream is waiting. No form can be submitted, because the pull answers `do` rather than `fill`.

CHECKED 2026-08-17: the source row project/deliverable/machines/rigor_matrix/rows/M7_60_fix-findings.md declares ONE inbound dependency, verification, and marks it edge_role: fallback. So either the compiler adds inbound edges the row does not declare, or it does not honour edge_role: fallback.

THAT ROW IS SHARED MACHINERY. Every record with a fix-findings step compiles from it, so this is not i15's seeded copy and it is not one iteration's problem.

DONE LOOKS LIKE: i15's walk moves forward, and a test drives the case so it cannot come back.

Related notes: note-ed0ce3eea951, on the fallback being gated on the condition it exists to answer.

## 2. THE FULL BATTERY NEVER FIRES AT VERIFICATION

Both sides point at each other and neither acts.

- The matrix row M7_50_verification.md says filled_by: engine, the full battery runs mechanically, and calls it a floor never struck at any size.
- The engine refuses an unscoped se_test outside verification with text saying the full battery runs at verification, where the engine fires it.

NOTHING FIRES IT. The engine only stops refusing once the walk is at verification. It never initiates. MEASURED: i15's verification signed with .se/test-last-run.json recording 2 tests against a suite of 1325.

THE FIX IS ONE OF TWO AND THE CHOICE IS THE OWNER'S.

- The engine fires the battery on ENTERING verification, as both texts already claim.
- Or filled_by: engine is struck from the row, verification cannot sign without a battery verdict newer than the delta, and the agent fires it explicitly.

Related note: note-4ead924e4cab, the agent asking for the battery and reporting without waiting for the verdict.

## 3. VERIFICATION FIXES, IT DOES NOT LOOP — owner ruling 2026-08-16

THE OWNER'S WORDS: "I actually don't want these loops in the verification. I want verification to fix issues. I don't like these loops. The idea is, if you have a problem higher up in the trace, you write some technical debt for it. And then you still finish."

WHAT THE WALK DID INSTEAD, measured: verification signed at 19:04, then front_desk, then run-candidates re-entered six times, then verification again at 19:42. Thirty-eight minutes, about 140 calls, and the evidence count did not move — 39 of 52 states before and after.

THE RULE STATED FORWARD:

- Verification fixes what it finds, in place, where the fix is legal.
- A finding belonging higher up the trace becomes a raid entry of kind debt, with its `## Repayment` section written at the moment the debt is taken.
- And then the walk finishes. It does not go back up.

WHAT WOULD ENFORCE IT, and the choice is open: the engine refuses a transition to a state whose evidence already stands unless the person aims there deliberately, or verification's own row gains the alternative in as many words.

Related notes: note-0af46cbcd41f, note-4be3cfe2a2fe.

## 4. THE CONTAINER BLIND SPOTS

Four small fixes, each measured on the box.

- engine/shoot.ts line 77 passes no --no-sandbox, and chromium refuses to run as root. One conditional on process.getuid?.() === 0 takes three red tests to green and the box from 5 red to 2. Conditional deliberately, because unconditional weakens a desktop run.
- The BROWSERS list in the same file does not know /opt/pw-browsers/chromium, which is where every Playwright image puts one.
- guidance/method/cloud-runner.md's Arrival A never says to fetch. A cloud clone carries one branch, so any record citing `ref: main` is dead on arrival. It needs `git fetch --all --prune` AND `git branch main origin/main`, because `git show main:...` fails when only origin/main exists. This cost i15 four refused calls, a wrongly-minted assumption, and a false claim that spread through six evidence forms.
- engine/bin/se-start.ts's fetch step still dies when refs/remotes/origin/it/<id> is absent. i34 retired per-iteration branches and the comment in that file says so. It passes on this repo only because those branches happen to still exist.

## 5. PREFLIGHT RUNS GREEN OVER UNPARSEABLE YAML

MEASURED: a regex for a terminated frontmatter block returned NO on a trace file at 17:39, and preflight.ts printed `preflight green` at 17:40.

SE-C-135 checks the payload arrived VERBATIM, never that it was WELL-FORMED, and se_file_write is the one lane verb that replaces a whole file with no structural guard.

The corpus is what every query and coverage check is built ON, so a green check over broken YAML there is the worst place for it. One regex per spec/trace/**/*.md closes it.

## 6. THE SHORT-NAME RENAME NEVER FINISHED

Both forms are live. The machine's doors and state keys take the short id, `iterations/i15`. The record itself still carries the long one — the folder name, record.md's own `id:`, 69 `minted_in:` fields under spec/trace, and the `expedition` field on every single pull answer.

WHAT IT COST, twice, to two different readers: an aim at the long id refused SE-C-110 with no drawn path, and the walking agent made the same mistake at 19:26 and spent about 20 minutes and 93 calls, 17 of them refused.

WHY IT IS WORSE THAN COSMETIC: every surface an agent reads teaches it the LONG name, and exactly one surface accepts only the SHORT one. The system spends all day teaching the wrong identifier and then refuses it.

This is a sweep, not a patch. It may be right to hand it to the big-sweep iteration instead — that judgment belongs at this iteration's kickoff.

## What is deliberately NOT in here

- SE_BRAVE_API_KEY is configuration in the lane's environment, not code. It is the owner's one-line act, and it is what let a prior-art risk ride open through four gates.
- The operator's own four mistakes, listed in the field report, taught the playbook and need no code.
- The report's design suggestions are separate: a person recording an answer through the mirror, a stop hook that knows whose walk it is, a warning when two agents pull one session, and a nudge preferring se_file_patch over a whole-file write.

## Inputs

- project/scratchpad/fieldreport.md
- note-ed0ce3eea951
- note-0af46cbcd41f
- note-4ead924e4cab
- note-4be3cfe2a2fe
- note-868eb96e8b61
