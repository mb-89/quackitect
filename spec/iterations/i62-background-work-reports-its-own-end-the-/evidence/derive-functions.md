---
form: derive-functions
by: agent
signed_off: 2026-08-24T16:08:48.912Z
authors: agent
files: null
---

# Evidence form / derive-functions

## current_situation

Six requirement rows stand for the delta. The function structure is extended for them and not re-derived.

Three new functions hang under the standing root fn-run-a-governed-walk, all in the cluster the-record-life. One standing function gained a requirement rather than a sibling being minted.

No new cluster was needed. That is the tell the kickoff asked for: a new function fitting no existing cluster would mean the architecture is moving, and this would be a major rather than a minor.

## functions

- fn-run-a-governed-walk.keep-the-account-true
- fn-run-a-governed-walk.bound-a-wait
- fn-run-a-governed-walk.hold-a-workspace-alone
- fn-run-a-governed-walk.keep-the-record

## flows

- flow-existence-answer
- flow-settled-entry
- flow-wait-bound
- flow-workspace-hold

## neutrality

THE TEST RAN ON EVERY NEW FUNCTION: could two honestly different designs both do this?

keep-the-account-true says work is noticed as ended, however it ended, and marked finished once. It does not say a timer runs, that a handle is held, or that anything is asked at all. A design where every piece of work reports its own ending and nothing ever asks satisfies it. So does the opposite.

bound-a-wait says a wait has an end it reaches on its own. It does not say the bound is measured in time. A design counting attempts rather than seconds satisfies it.

hold-a-workspace-alone was the one that nearly failed. The obvious statement names a network port, and the requirement above it does name one. The function says instead that the hold must release itself when its holder dies, which is the PROPERTY a port has and a lock file lacks. The mechanism stays M4's to choose.

THREE TELLS WERE CHECKED ON EACH. No noun is a product. No verb is an implementation: ping, poll, cache and index appear in none of the three statements. And each was read back asking what it would be called in a design that was rejected, which is the tell no word list catches.

WHERE A SOLUTION IS GENUINELY FORCED, IT IS A CONSTRAINT AND NOT A FUNCTION. Nothing here met that bar. The port is a strong candidate for M4 and it is argued in the requirement's Detail, which is where a forced choice belongs.

## follow_up

The requirements are swept for assumptions next.

One is already standing and will be picked up there: raid-asm-a-launched-process-can-be-asked-whether-it-still-exists. Deriving the functions sharpened it. The third value of flow-existence-answer is exactly what that assumption failing looks like in the design, so the fallback exists whichever way the probe goes.

## anything_else

WHAT EACH FUNCTION CONSUMES AND PRODUCES, since the field above carries references only.

- keep-the-account-true consumes flow-work-under-way and flow-existence-answer, and produces flow-settled-entry.
- bound-a-wait consumes flow-wait-bound and produces flow-settled-entry.
- hold-a-workspace-alone consumes flow-workspace-hold and produces flow-refusal.
- keep-the-record is the standing function, and its flows are unchanged.

THE OUTPUT-NOBODY-CONSUMES WALK RAN AND FOUND NOTHING OPEN. flow-settled-entry is consumed by fn-run-a-governed-walk.account-for-work-out-of-sight, the standing function that states what is under way. flow-refusal is a standing flow already consumed where refusals are served.

ONE THING THAT WALK SURFACED. flow-existence-answer carries three values and not two: there, gone, and could not be asked. The third came out of writing the flow rather than out of the requirement, and it is now the fallback named in extension 4b of uc-close-the-record-of-work-that-has-ended.
