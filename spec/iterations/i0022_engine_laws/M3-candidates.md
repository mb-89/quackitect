# M3 — Candidate architectures (evidence)

## ≥2 alternatives elaborated  → i22-m3-2-alternatives-elaborated

The design question: WHERE do the guards live? Three candidates, elaborated.

Candidate A — one guard layer in dispatch.
Every command passes one `guardCheck(cmd, channel, state)` function before its handler
runs. The refusal logic sits in one file. The predicates (channel / review-in-hand /
MCP-served) are computed once per dispatch.
Strengths: one home. One test surface. Uniform refusal messages. Trivially covers new
commands. Weaknesses: dispatch grows a state lookup it never needed; per-command nuance
(selftest allows single-test runs?) needs a rule table anyway.

Candidate B — per-command guards.
Each guarded command (selftest / bless / the CLI entry) checks its own preconditions at
the top of its handler.
Strengths: nuance lives where the command lives; no dispatch coupling. Weaknesses:
guard logic scatters across files. A new command ships unguarded by default. Refusal
wording drifts apart. Three near-identical predicate blocks to test.

Candidate C — config-layer policy.
A policy file in the workspace (or the overlay) declares rules; a generic interpreter
enforces them.
Strengths: rules changeable without a rebuild; vehicles could tune policy. Weaknesses:
a policy file is data an agent could edit — the no-bypass maxim falls. An interpreter
is a new engine subsystem for five rules. The owner's configuration-vs-code question
(field #6) is a LATER discussion, not this iteration's call.

Battery-side candidates (orthogonal, for the three battery requirements):
- run-layer guard: the busy/no-record and first-green checks wrap the single verdict-recording function.
- per-test guards: each selftest self-checks. Rejected on sight: the i21 incident happened exactly because per-test guards were the only defense.

## criteria weighted  → i22-m3-criteria-weighted-derived

Derived from the requirements and the RAID set. Weights sum to 1.

- 0.30 trust: no bypass, no false record, honest stamps (req-busy-no-record, req-first-green-guard, q-grant-honesty A).
- 0.25 over-blocking safety: a wrong refusal must be cheap to see and cheap to escape (raid-over-blocking).
- 0.20 coverage uniformity: a new command or test is guarded by default, not by memory (the i21 drift lesson).
- 0.15 walk speed: no added latency on hot commands (req-lazy-verdicts precedent, responsiveness guide).
- 0.10 build cost: small, testable Go; no new subsystem (rule-of-cool does not override cost here).

## feasibility rough-checked  → i22-m3-feasibility-rough-checked

- Review-in-hand detection (A and B need it): feasible. The ledger knows every gate's readiness; "a milestone gate is ready or suspect" is computable from the same state `next` already loads. M5 spikes the exact predicate.
- MCP-served detection (for the CLI block): feasible with a boundary. The engine cannot see the harness config; it CAN see its own channel (piped vs console) and refuse ledger commands on the piped lane, pointing at MCP. The block needs no session detection at all.
- Busy-guard reach (run-layer): feasible. Verdict recording already flows through one cache-write path; the busy flag reaches it as a return state.
- Config interpreter (C): feasible but heavy. A new parser, a new trust surface, a new test corpus. Weeks, not days.

## Review rounds and verdict  → i22-m3-gate

Round 1, verify: three genuine command-side candidates plus the orthogonal battery
pair. Each carries strengths, weaknesses and a feasibility line. The criteria
derive from named requirements and RAID nodes, weighted and summing to one.

Round 2, validate: the candidates answer exactly the M1 delta (laws into engine).
Candidate C honestly connects to the parked configuration-vs-code field question
instead of quietly deciding it.

Round 3, red-team: is B a straw man? No — B is today's de-facto pattern in the
engine (attest checks sit per-command) and would work. Its scatter cost is the real
argument, not a rigged one. Is the battery per-test candidate dismissed too fast?
No — it is the documented failure mode from i21, cited.

Verdict: PASS. The decision itself belongs to M4. Blessed under the standing grant.
