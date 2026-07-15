# M1 — Frame the problem & vision (evidence)

## vision & scope stated  → i22-m1-vision-scope-stated

Vision (Moore): FOR the owner-adjudicator and the driving agent, WHO lose correction
rounds to agent drift, THE engine-laws iteration is a set of engine guards THAT refuse
unlawful walk moves, record honest battery verdicts, and put the agent on the MCP lane.
UNLIKE harness hooks (TDD Guard, agent-guardrails), the refusal lives in the ledger's
own engine: it travels with the workspace and binds every harness the same way.

Goal, actual, delta:

- Goal: a walk law that CAN be enforced mechanically IS enforced mechanically.
- Actual: the laws live in prompts. i21 logged five drift incidents in three days.
- Delta: eleven requirements across four use-cases (the approved plan).

Scope: engine guards, battery trust and UX, the MCP agent channel, two lints.
Out of scope: harness-side hooks, the phone lane, book or render work.

PR-FAQ pressure test (Working Backwards, condensed): "Quackitect now refuses its
agent's own bad habits." Q: Does this slow the agent? A: No. Refusals answer instantly
and name the lawful lane; the battery gets faster (cache, batch, cores). Q: Can the
agent bypass it? A: Not on the ledger; the guards live where the record is made.
Q: What if a guard is wrong? A: raid-over-blocking carries the escape lanes.

## problem agreed  → i22-m1-problem-agreed-the

The problem: the walk's laws live in prompt prose. Prose bends under agent drift.
The engine executes none of it.

The recorded evidence, all from one iteration (i21, 2026-07-12 to 2026-07-14):

- Selftest over-checking. The call log counted 72 selftest calls, 35 failing. The owner complained live (NOTE-20260714-152053). The law ("the battery belongs to gates") existed the whole time.
- Red-ritual slip. Two lint selftests reached green with no recorded red (i21 b13, NOTE-20260714-091639). The prompt carried the ritual; nothing refused the slip.
- Busy-guard poisoning. A busy render guard recorded a vacuous false verdict into the cache. It self-perpetuated on cache hits (NOTE-20260714-164933, raid-busy-record).
- Channel drift. The MCP surface shipped in i18. The agent still drives the bare CLI (NOTE-20260714-152053).
- Unattended work by convention. The overnight M1-M5 batch ran on a chat-only grant. Nothing recorded its scope or expiry (NOTE-20260714-090128).

The delta: each law that CAN be enforced mechanically becomes an engine refusal or guard.
This is the repo's own learning ladder (instance → prompt → determinizer), applied to the
walk itself. Prompts keep only what needs judgment.

Worth solving: every listed incident cost a correction round with the owner. The engine
half is small, testable Go. The lesson stops repeating.

## state of the art checked  → i22-m1-state-of-the

Scanned 2026-07-14 (two web sweeps; sources below). Four enforcement families exist:

- Harness hooks. Claude Code PreToolUse hooks receive each tool call and can block it deterministically. Policy packs exist (agent-guardrails, LaneKeep). Design maxim found there: a guardrail an agent can bypass is not a guardrail.
- TDD enforcers. TDD Guard, its successor Probity, and Ultraship block implementation edits until a failing test is verified. This is the closest prior art to req-first-green-guard.
- Permission surfaces. Claude Code permission modes, OpenAI Agents SDK and Codex CLI gate tools with per-tool approval policies (always / never / callback).
- Repo and OS gates. Git pre-commit hooks, branch protection, CI required checks; ActPlane (research) pushes policy to the OS level.

Positioning: every found system enforces at the HARNESS, repo, or OS layer. Quackitect
enforces in the ENGINE and its ledger: the refusal travels with the workspace, binds every
harness equally, and leaves a hashed record. The busy-no-record guard and the recorded
standing grant (scope, expiry, morning-review collection) have no counterpart in the found
set; per-tool "always/never" approval is the nearest relative of the grant and lacks its
audit half. The idea stands; the differences are real.

Sources: [agent-guardrails](https://github.com/roboticforce/agent-guardrails),
[Agentic Coding Hooks](https://ranthebuilder.cloud/blog/agentic-coding-hooks-deterministic-ai-guardrails/),
[AI Agent Security 2026](https://slavadubrov.github.io/blog/2026/04/20/ai-agent-security/),
[TDD Guard](https://github.com/nizos/tdd-guard),
[TDD Guard skill page](https://mcpmarket.com/tools/skills/tdd-guard-testing-enforcement),
[ActPlane](https://arxiv.org/pdf/2606.25189).

## success is measurable  → i22-m1-success-is-measurable

The Ch1 criteria, each checkable at M7:

1. Refusals fire. Each guard (selftest gate, first-green, busy-no-record, CLI block, out-of-scope grant bless) demonstrably refuses its unlawful move, live and in a selftest.
2. No false verdicts. A busy-guard run leaves no cache entry. The poisoned-entry class of i21 cannot recur.
3. The battery is watchable. A console run shows one numbered line per test, live.
4. No redundant full runs. A repeat selftest over unchanged content answers from the cache.
5. The grant is a ledger fact. Scope, expiry, and the collected blesses are readable at the morning review.
6. The agent lane is MCP. The tools are discoverable in a fresh session, and the bare CLI refuses the agent channel.
7. The lints exist. A dash-joined or overlong statement draws a flag. A broken recital chain fails the selftest.

## top risks logged  → i22-m1-top-risks-logged

Three new RAID nodes, minted in [spec/raid/](../../raid/):

- [raid-over-blocking](../../raid/raid-over-blocking.md): a new refusal hits a lawful move. Mitigation: every refusal names the lawful lane; the console channel stays refusal-free.
- [raid-grant-rubberstamp](../../raid/raid-grant-rubberstamp.md): the morning review habituates. Mitigation: evidence-linked collection, per-stretch expiry, the amended metric.
- [raid-guard-timing-flakes](../../raid/raid-guard-timing-flakes.md): timing tests flake under load. Mitigation: assert order and overlap, never durations.

The open i21 quartet was checked: raid-busy-record's class fix IS this iteration
(req-busy-no-record). The other three stand unchanged.

## Review rounds and verdict  → i22-m1-gate

Round 1, verify: every subtask section above points at its referent. The problem
section carries five incidents with note ids. The scan carries its sources. The
criteria map one-to-one onto the eleven requirements. The risks exist as nodes.

Round 2, validate: the frame covers all four owner-approved clusters and nothing
else. Both open questions were decided by the owner in-chat before this gate
(q-cli-steering: A, q-grant-honesty: A). No open question rides this cone.

Round 3, red-team: the opposing case says this is self-referential tooling polish.
Counter: the owner ordered the scope, and the metric (correction rounds burned on
drift) is real cost, five incidents in three days. Second attack: over-blocking is
under-weighted. Held: raid-over-blocking carries the escape lanes, and M5 spikes
the riskiest predicate (review-in-hand detection) before anything builds on it.
Kill criterion, recorded: if the M5 spike shows the review-in-hand predicate cannot
be computed reliably, req-selftest-gate's shape goes back to the owner at M4/M5
rather than shipping a flaky refusal.

Verdict: PASS. All five subtasks delivered. Blessed under the standing grant
(2026-07-14 evening, chat-recorded); collected for the morning review.
