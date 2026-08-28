---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: raid-asm-the-answering-model-can-be-recorded-when-only-the-agent-knows-it
type: "[[raid]]"
kind: assumption
statement: Stamping the answering model onto every call is treated as achievable, while the only party that knows which model answered is the agent being measured, and the lane's handshake carries no model at all.
owner: the walking agent
trigger: the design state that decides where the model value comes from, and the first call whose stamped model cannot be corroborated
status: open
impact: Attribution after the fact rests on self-report. The design's one safety rule — a stronger model needs no argument, a weaker one needs a recorded reason — then asks the cheap model to declare that it is the cheap model, which is the exact actor the rule exists to catch.
breaks_how_badly: crippling
how_likely: plausible
probe: "READ THE HANDSHAKE AT THE i38 KICKOFF GATE, 2026-08-20. engine/mcp.ts:58 and :68 declare clientInfo as {name, version?} and nothing else — a client name, no model. Nothing else in the transport carries one. So the value can only arrive as something the caller puts on the call. AND THE CALLER CAN BE HONESTLY WRONG, established the same day from the harness vendor's own documentation: this harness performs AUTOMATIC MODEL FALLBACK, re-running a flagged request on a different model and continuing the session on it, and the notice is suppressed under JSON output formats — the served model has to be read from a result field rather than from the warning. So even a truthful agent reporting the model it was started with can be reporting the wrong one."
probed: 2026-08-20
source_refs:
  - i38-the-machine-sizes-its-own-driver-every-s
weighs_with: none
weighs_against: none
---

## The shape of the hole

THE GOAL IS ATTRIBUTION AFTER THE FACT: read the log later and say which model
walked which state.

THE ONLY SOURCE IS THE CALLER. The transport hands the engine a client name.
The environment carries nothing. So whatever lands in the record is what the
agent said, and an agent that is wrong about which model is serving it will be
wrong in the record too, consistently and invisibly.

## The honest agent is also wrong, and that is the sharper half

SELF-REPORT WAS THE FIRST WORRY AND IT IS NOT THE WORST ONE. A dishonest agent
is a designed-for adversary. An HONEST agent reporting the model it believes it
is running on, while the harness has silently moved it to another, produces a
record that is wrong with nobody at fault and nothing to detect it.

THE HARNESS DOES THIS BY DESIGN. A flagged request re-runs on a different model
and the session continues there. It can fire on the very first request of a
session from workspace context alone, and the notice that would say so is
suppressed under the JSON output formats a machine reads.

SO THE VALUE MUST COME FROM WHAT SERVED THE CALL, never from what was asked
for. The distinction is standard: OpenTelemetry's conventions carry
`gen_ai.request.model` and `gen_ai.response.model` as separate attributes, and
the canonical example given for the pair IS the drift case — a family name
requested, a dated build served.

## Why it is worse here than in ordinary telemetry

MOST TELEMETRY MEASURES SOMETHING THAT IS NOT WATCHING BACK. This one measures
the party writing the value, and the rule it feeds is a rule about that party's
own honesty.

## Probe

ASK THE TRANSPORT WHAT IT CARRIES, WHICH IS ONE READ. `engine/mcp.ts:58` and
`:68` declare `clientInfo` as `{name, version?}`. If a model ever appears
there, the assumption dissolves and the value is observed rather than claimed.

THEN ASK WHETHER THE SELF-REPORT IS EVEN RELIABLE, which is the harder half
and needs a live comparison: run one walk whose driver is known from outside —
the process that spawned it knows what it spawned — and compare that against
what the calls stamped. Agreement does not prove honesty, but disagreement
settles it at once.

WHAT WOULD FALSIFY THE ASSUMPTION:

- A stamped model that does not match what the spawner started.
- A host that silently serves a different model than the one requested, which
  makes even an honest agent wrong.
- A walk where no model was stamped at all and nothing noticed.

UNTIL EITHER HALF IS DONE, the field is a claim and must be read as one.

## What would settle it, in rising order of cost

- ACCEPT SELF-REPORT AND SAY SO on the field, so a reader knows the record is a
  claim rather than an observation. Cheapest, honest, and it does not pretend.
- HAVE THE DRIVER STAMP IT, not the walker: whoever performed the spawn knows
  what it spawned, and it is not the thing being measured.
- CORROBORATE IT against something the agent does not author.

WHAT MUST NOT HAPPEN is a field that reads like an observation and is a claim.
That is the failure this entry exists to stop.
