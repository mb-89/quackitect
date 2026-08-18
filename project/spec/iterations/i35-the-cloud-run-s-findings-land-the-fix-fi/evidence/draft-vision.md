---
form: draft-vision
by: agent
signed_off: 2026-08-17T11:29:34.005Z
authors: agent
files:
---

# Evidence form / draft-vision

## current_situation

i35 stands at M1 with its size pinned minor and the kickoff gate blessed.

Four of the six seeded findings are settled. Findings 4 and 5 are fixed and pinned by tests. Finding 1 is refuted by driving the shipped matrix. Finding 6 is reproduced and routed to i10.

The battery reads 1397 tests, 1395 green, 2 red, 74s. Both reds are pre-existing and root-caused.

The arrival is no longer prose: one command and a SessionStart hook now do what cost this run most of an hour by hand.

## goal_system

THE BIG IDEA: an unattended box walks an iteration end to end, and nobody works anything out that a previous run already worked out.

THE GOALS, in the order this iteration rules them.

1. THE ARRIVAL IS MECHANICAL. Everything between a fresh clone and the first se_pull is a script, not a card somebody reads. This ranks first because it is the only goal whose failure stops all the others: an agent that never reaches the lane cannot walk anything.
2. A FINDING TRAVELS WITH ITS EVIDENCE. What one run measured, the next run does not re-measure. The fix is a test, never a paragraph.
3. THE BOX DOES NOT NEED A PERSON TO GET PAST M0. A default that cannot enter the first gate of every iteration is not an unattended default.
4. THE CORPUS CANNOT GO QUIETLY BROKEN. A structural guard where a whole-file write has none.

THE CONFLICTS, NAMED OPENLY. There are three and none of them dissolves.

CONFLICT 1 — AUTONOMY AGAINST THE DIAL'S PURPOSE. Goal 3 wants the box to move without a person. The dial exists precisely so a person decides what an agent may enter alone. Raising it to walk unattended does not satisfy the dial's intent, it overrides it.
RULED: the dial stays the person's, and the fix is CONFIGURATION rather than a lower bar. se-arrive and the hook take SE_AUTONOMY, so an owner sets the cloud default once, deliberately, instead of an agent raising it mid-walk. What is NOT ruled, and is owed to the owner, is what that default should be.

CONFLICT 2 — ONE ENTRYPOINT AGAINST TWO ARRIVALS. cloud-runner.md says DO NOT REINVENT THE ENTRYPOINT. se-arrive is a second one.
RULED: two entrypoints, and the duplication is admitted rather than denied. se-start ends by LAUNCHING an agent and exiting; se-arrive ends by HANDING BACK a lane to an agent that already exists. A step that exits the process is the wrong shape for one that must report. The four shared functions are a debt, filed as raid-iss-two-entrypoints-place-the-cage-and-nothing-compares-them, and the cage is the part that must never drift.

CONFLICT 3 — FIXING AGAINST RULING. Findings 2, 3 and 6 could each be decided by an agent with a plausible argument. Deciding them would move the walk faster and would also be the agent choosing the process.
RULED: they stay the owner's, captured as notes with their options stated. Speed does not buy the right to rule on the method.

THE PRIORITY ORDER, ruled: 1 over 2 over 3 over 4. Goal 1 gates every other goal, so it wins any tie. Goal 4 ranks last only because a broken corpus is loud once looked at, while the other three are silent.

## follow_up

- Owner: set the cloud default for the autonomy dial. Nothing walks past M0 unattended at 0.4.
- Owner: rule findings 2 and 3; both are captured with their options.
- i10: take the short-name rename, routed here by the kickoff gate.
- Fold se-arrive's refs, runtime, install and cage into one module shared with se-start, and add the check that both place the same cage bytes.
- Give the fix-findings guard a counter and an escape edge TOGETHER, never separately.
- Decide the node floor: >=22.18.0 is what the evidence supports.

## anything_else

THE VISION IS ALREADY PARTLY DISPROVED BY THIS RUN, and that is worth writing down while it is cheap.

'End to end' did not happen. This walk reached M1 of a machine the project sizes at roughly a day of agent work, and it needed an owner instruction to pass M0 at all.

SO THE HONEST CLAIM IS NARROWER: the ARRIVAL is now unattended, and the WALK is not yet. The first is mechanical and is done. The second is a question about the dial, and it is the owner's.

ONE THING THE SEED GOT WRONG IS WORTH KEEPING VISIBLE. It named two causes for the blocker and both were in the compiler. Neither was true. An agent that trusted the seed would have spent its afternoon in rigor-matrix.ts. What made the difference was driving the machine rather than reading it — and the artifact that would have settled it in minutes, i15's instance state, lives in gitignored .se/ and never travelled.
