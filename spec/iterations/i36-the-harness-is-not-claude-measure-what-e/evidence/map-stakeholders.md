---
form: map-stakeholders
by: agent
signed_off: 2026-08-19T09:47:02.502Z
reopened: 2026-08-19T09:46:50.413Z — Gate motivation was re-signed after restoring ISO quality hierarchy; stakeholder roles remain unchanged.
authors: agent
files: null
---

# Evidence form / map-stakeholders

## current_situation

The context boundary is signed.

I36 extends `vp-qualities` and `vp-rigor-without-toil`.

Both existing propositions serve `stk-engineer-driving-agents`.

The agent stakeholder carries the cancellation-diagnosis concern.

## roles

- project/spec/trace/stakeholder/stk-engineer-driving-agents.md
- project/spec/trace/stakeholder/stk-agent.md
- project/spec/trace/stakeholder/stk-newcomer.md
- project/spec/trace/stakeholder/stk-vehicle-owner.md

## coverage

The inherited value props resolve to `stk-engineer-driving-agents`.

Always-on classes remain covered:

- acquirer: `stk-vehicle-owner`
- user: `stk-engineer-driving-agents`
- newcomer: `stk-newcomer`
- agent: `stk-agent`
- project-owner and assessor: `stk-engineer-driving-agents`
- communicator: carried by the accountable engineer role for this change

No technical mechanism creates a new stakeholder role.

Extended service classes remain covered or ruled out as previously recorded.

## follow_up

Re-sign the four i36 stories against the inherited value props.

Then re-sign their use cases and judge `gate-inputs` without recreating technical propositions.

## anything_else

No new stakeholder node is needed.

The change shifts concerns inside existing roles rather than creating a new role.
