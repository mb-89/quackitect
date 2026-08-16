---
minted_in: i28-the-cloud-runs-from-its-seed-alone-a-fre
id: req-entering-repairs-itself-or-names-the-remedy
type: "[[requirement]]"
statement: When a walk enters an iteration, the engine shall complete every preparation that entry needs, or refuse in one sentence naming the remedy, and every iteration the walk cannot enter shall appear in the offer carrying the reason.
kind: functional
characteristic: interaction-capability
verify_method: test
breaks_if_removed: Starting work becomes work. A door can be silently absent, so nothing is wrong, nothing is refused, and the thing is simply not there.
breaks_how_badly: crippling
refines:
  - uc-start-an-unattended-machine
source_refs:
  - uc-start-an-unattended-machine ext 2a
  - uc-start-an-unattended-machine ext 4b
  - uc-start-an-unattended-machine ext 5a
  - stk-engineer-driving-agents
  - stk-agent
priority: must
---

## Detail

THREE OUTCOMES ARE ALLOWED AND A FOURTH IS FORBIDDEN.

| outcome | when | what the person sees |
| --- | --- | --- |
| entered | everything the entry needs is there or can be made | the walk under way |
| repaired, then entered | something was missing and the engine could make it | the walk under way, and what it fixed |
| refused | something was missing and the engine could not make it | one sentence, naming the remedy |
| ABSENT | forbidden | nothing at all |

SILENT ABSENCE IS THE FAILURE THIS ROW EXISTS TO REMOVE. On 2026-08-15 i28's
own door was not on the container's offer. Nothing was wrong, nothing was
refused, and the thing was not there. Clearing it took about a dozen calls and
five shell commands under an explicit exemption, on a machine that was already
configured.

A PERSON MUST BE ABLE TO CLEAR IT. Reading two engine files and comparing 34
paths byte for byte is not a bar anybody should clear to begin a day's work.

## Where the demand comes from

OWNER RULING, 2026-08-15: "Starting an iteration is going in it and starting
it, not cleaning stuff up." And: "humans also need to be able to do this. We
can't have a system where you need to tinker around the edges every time just
because you start some work."

## Why it is not a quality row

It has no measure and it does not want one. The demand is a shape of outcome
rather than a bound on one, and a count of repair calls would be satisfied by
an engine that refuses everything.
