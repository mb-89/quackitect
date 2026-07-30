---
kind: matrix-row
name: onboard-retro
statement: "Onboarding opens with the retro: the field-feedback question first, then the notes inbox drains."
state_kind: work
filled_by: agent
depends_on: []
COMMENT: "state: doesnt need its own content. we already have a retro method. reference it, merge whats new here in it"
---

## Guidance

Blameless: fix the system, never a person. Open with the field-feedback question - what came back from the field since the last ship - before anything else. Then drain the notes inbox: every note gets a disposition (pull into this iteration, route to a durable home, or reject with a recorded reason). Mine the call history since the last retro: aggregate the call log - tool counts, rejection rate per clause, slow calls. A repeated miss, rejection, or hand-rolled workaround is a determinizer lead. Hunt wasted effort in the record: rework, reversals, reinventing. Standing question, every iteration: has the process itself gone stale against the state of the art ([[meth-state-of-the-art]], process dimension). Aim each improvement at a durable home - a prompt, a template, an engine refusal - never at a memory.

## Evidence form

- field_feedback | what came back from the field, or an explicit "nothing yet" | required
- notes_drained | inbox count before and after, with each note's disposition | required
- call_log_mined | counts and rejection clauses since the last retro, with the leads drawn | required
- waste_leads | rework or waste found in the record | optional
- process_stale | the standing state-of-the-art check on the process itself | required
