---
id: se.machine-systematic-onboard-retro
kind: machine_state
statement: "Onboarding opens with the retro: the field-feedback question first, then the notes inbox drains."
provenance:
  iteration: i3-machine-and-retro
  ai_involvement: agent-drafted
machine: se.machine-systematic
state: onboard_retro
state_kind: work
filled_by: agent
---

## Guidance

Blameless: fix the system, never a person. Open with the field-feedback question - what came back from the field since the last ship - before anything else. Then drain the notes inbox: every note gets a disposition (pull into this iteration, route to a durable home, or reject with a recorded reason). Mine the call history since the last retro: aggregate the call log - tool counts, rejection rate per clause, slow calls - and walk every logged se_help miss; each miss is recorded demand for a tool that does not exist yet. A repeated miss, rejection, or hand-rolled workaround is a determinizer lead. Hunt wasted effort in the record: rework, reversals, reinventing. Standing question, every iteration: has the process itself gone stale against the state of the art ([[meth-state-of-the-art]], process dimension). Aim each improvement at a durable home - a prompt, a template, an engine refusal - never at a memory.

## Evidence form

- field_feedback | what came back from the field, or an explicit "nothing yet" | required
- notes_drained | inbox count before and after, with each note's disposition | required
- call_log_mined | counts, rejection clauses, and se_help misses since the last retro, with the leads drawn | required
- waste_leads | rework or waste found in the record | optional
- process_stale | the standing state-of-the-art check on the process itself | required
