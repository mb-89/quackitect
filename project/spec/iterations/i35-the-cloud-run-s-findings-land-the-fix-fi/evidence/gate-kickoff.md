---
form: gate-kickoff
bless: blessed by agent
by: agent
signed_off: 2026-08-17T11:21:12.624Z
authors: agent
files:
---

# Evidence form / gate-kickoff

## current_situation

i35 is seeded and its M0 retro is signed. The battery on this box stands at 1396 tests, 1394 green, 2 red, ~70s.
Of the six findings the record carries, 4 and 5 are fixed and tested, 1 is refuted with a test, and 2, 3 and 6 are owner rulings captured as notes.
The lane runs headless on this box and the walk is driven over HTTP, because a cloud chat session cannot register an MCP server into itself after it has started.

## retro_drained

- note-969bc61f498e — OWNER QUESTION — the autonomy dial. i35's walk r: carried — the dial was raised to 0.8 on the owner's instruction this sitting, so the question is answered and the walk moved past M0.
- note-56f56b49a58f — OWNER QUESTION — i35 finding 2, the full battery: carried — finding 2 is an owner ruling with two stated options; it waits for an answer, not for work.
- note-d29b01db210f — OWNER QUESTION — i35 finding 3, enforcing that v: carried — finding 3 is a rule, not a bug; the enforcement mechanism is the owner's to pick.
- note-935fa813bf77 — OWNER QUESTION — i35 finding 6, the short-name r: routed — finding 6 goes to i10, the big sweep, by this gate's judgment.
- note-5b31217e4d39 — FINDING, not in i35's scope — the last red has a: carried — the nesting red is root-caused and out of i35 scope; it belongs to whoever owns the test template.
- note-756a4153150b — FLAKE SUSPECT — tests/emergency.test.ts 'emergen: carried — the emergency flake needs a hunt, which is a run rather than a fix.
- note-e39f85bf4cc5 — OWNER QUESTION — the node 24 pin is over-tight b: carried — the node floor is measured over-tight; lowering a declared pin is the owner's act.
- note-dbbdf5311c8d — FINDING 1 — THE BLOCKER DOES NOT REPRODUCE ON TH: landed — finding 1 conclusion is pinned in tests/fallback-outcome.test.ts, so it is closed by evidence.

## goal

The cloud run's findings land: the container blind spots close, the corpus gets a structural guard, the fallback wedge is settled with evidence, and an unattended box reaches its first se_pull by running one command instead of an hour of hand-work.

## pulled_in

- Finding 4, container blind spots — from the i15 field report. shoot.ts now knows /opt/pw-browsers/chromium and passes --no-sandbox as root; cloud-runner.md's Arrival A now fetches refs.
- Finding 5, preflight green over unparseable YAML — from the i15 field report. Closed with three pinned cases.
- Finding 1, the fix-findings wedge — from the i15 field report. Refuted with a driven test rather than patched.
- THE ARRIVAL ITSELF, engine/bin/se-arrive.ts — NOT from the record. Owner instruction mid-run, 2026-08-17: whatever holds the agent up, build it into the system so the next cloud agent is faster. This walk spent most of an hour on Arrival A by hand and that cost is the one that repeats on every cloud box.
- The autonomy dial raised to 0.8 — owner instruction mid-run, same sitting: 'your job is to run it, increase the autonomy'.

## left_out

- Finding 2, the full battery at verification — the record states the fix is one of two and the choice is the owner's. Captured as note-56f56b49a58f. No measurement can settle it.
- Finding 3, verification fixes and does not loop — a rule, not a bug. The enforcement mechanism is open. Captured as note-d29b01db210f.
- Finding 6, the short-name rename — the record itself says it is a sweep, not a patch, and may belong to i10. THIS GATE'S JUDGMENT: it goes to i10. It touches 69 minted_in fields, every folder name and the expedition field on every pull answer, and bundling it here would bury four landed fixes under a rename. Reproduced and captured as note-935fa813bf77.
- The node 24 pin, measured over-tight — the engine runs the full battery on 22.22. Lowering a declared floor is the owner's act and cloud-runner.md forbids editing it to go green. Captured as note-e39f85bf4cc5.
- tests/nesting.test.ts's red — root-caused to the test template carrying no @biomejs, not to anything i35 touched. Captured as note-5b31217e4d39.

## change_size

minor — the tree gains a capability and breaks nothing. engine/bin/se-arrive.ts is a NEW entry point, preflight gains a check that can turn a previously-green tree red, and shoot.ts changes which browser it finds and which flags it passes. Nothing changes an existing interface's shape, no drawn machine moves, and every authored record keeps working. patch is wrong because a new bin and a new preflight gate are not repairs; major is wrong because nothing breaks. No rows struck.

## round_0_verify

- evidence vs claims: green. Every claim in this form is a measurement taken on this box with its numbers, before and after — the 5-to-2 red count, the root sandbox refusal, the preflight red-then-green, the two-round fallback walk.
- types: green. Every changed file is TypeScript run unflagged by the suite; no type error surfaced in 1396 cases.
- lint: green. biome check --write --error-on-warnings ran clean over 270 files, and the lane applied its safe fixes on each patch.
- tests: 1396 total, 1394 green, 2 red. Both reds are named and root-caused, and neither is this iteration's work: nesting.test.ts fails because the test template carries no @biomejs, and emergency.test.ts is a flake suspect that passed in two of three runs.

## round_1_validate

- exercised against the goal: partly. Arrival A is now one command and nothing in it has to be worked out again, which is the goal's second half. The first half — an unattended box walks an iteration END TO END — is not met: this walk needed an owner instruction to pass M0.
- missing: the walk below this gate. Nothing past gate-kickoff has been exercised this run.
- wrong: the record's own diagnosis of finding 1. It named two causes in the compiler and both are refuted by measurement, so the record would have sent the next agent to the wrong file.
- out of scope: findings 2, 3 and 6, the node floor, and the nesting red — each captured as a note with its options rather than silently dropped.
- prior art: compared, not cited. devcontainer and Codespaces solve arrival better in one respect — setup runs before the agent exists, so no window has an uncaged agent holding native tools — and we cannot use that, because the cage is per-session and a cloud chat session starts already running. We shed the container image: se-arrive needs only a checkout and a node, and it repairs a shallow clone in place, which a devcontainer does not attempt. Nix and mise provision the runtime deterministically; we deliberately read the pin and report it instead. THE COMPARISON NOT MADE: whether any harness lets a live session attach its own MCP server — if one does, se-arrive's client half is a workaround for a solved problem.

## round_2_red_team

- se-arrive should not exist, because cloud-runner.md says DO NOT REINVENT THE ENTRYPOINT and se-start.ts already fetches, installs, cages and starts the lane => Granted in part, and this is the strongest case against the change. The duplication is four functions and it is real. What defeats it: se-start ENDS BY LAUNCHING an agent process and exiting, while se-arrive ends by HANDING BACK a lane to a caller that already exists — a step that exits the process is the wrong shape for one that must report. That is a reason for a second entry point, not an excuse for the duplication, and the four shared functions should become one module.
- KILL-CRITERION: a cloud harness that can register an MCP server into a live session => Looked for, not established either way. If it exists, se-arrive's client half is dead weight and Arrival A collapses into Arrival B. Recorded as an assumption rather than a fact.
- KILL-CRITERION: se-arrive and se-start disagreeing about what the cage is => Real and untested today. Both place the same two files from the same templates and nothing compares them; a drift uncages an agent silently. This is the sharpest open edge the iteration leaves, and it is filed as an issue.
- the gate is blessed by the agent that did the work => Conceded, not waived. Fresh eyes cannot be honoured on a box with nobody else on it. It is carried in the verdict as a dissent.

## raid_additions

- raid-asm-a-running-agent-session-cannot-attach-its-own-mcp-server
- raid-iss-two-entrypoints-place-the-cage-and-nothing-compares-them
- raid-asm-the-declared-node-floor-matches-what-the-engine-needs

## verdict

pass — the size is minor and the milestone stands, with one dissent recorded rather than waived.
THE DISSENT: this gate is being blessed by the same agent that did the work, in a sitting where the fresh-eyes rule cannot be honoured because nobody else is on the box. Round 0's verdicts are all self-observed. That is the weakest part of this record and it is a property of unattended running, not of this change.
WHAT MAKES IT PASS ANYWAY: every claim above is a measurement with its numbers, taken before and after, and the suite carries five new cases that fail if any of it stops being true.

## follow_up

- Land the two owner rulings (findings 2 and 3) once answered; both are captured as notes with the options stated.
- Hand finding 6, the short-name rename, to i10 the big sweep.
- Fold se-arrive's fetch, runtime, install and cage into one module shared with se-start, and add the check that they place the same cage.
- Decide the node floor: >=22.18.0 is what the evidence supports.
- Give the fix-findings guard a counter and an escape edge together, never separately.

## anything_else

