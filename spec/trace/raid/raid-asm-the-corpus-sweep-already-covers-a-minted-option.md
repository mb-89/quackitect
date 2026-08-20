---
minted_in: i17-the-options-pool-triage-a-raw-note-into-
id: raid-asm-the-corpus-sweep-already-covers-a-minted-option
type: "[[raid]]"
kind: assumption
statement: prose-inspect's identity sweep already walks anything under spec, so a minted option is swept for leaked names and paths on the day the pool exists, with no new check written.
owner: the driving agent
trigger: the first mint, or any change to where the pool is stored
status: open
impact: It is free coverage the design is counting on. If the pool lands anywhere the sweep does not walk, the second success criterion of vp-the-ledger - zero identity needles in minted options - has nothing measuring it, and nobody would notice the gap because the criterion would keep reading as met.
breaks_how_badly: crippling
how_likely: conceivable
probe: "HOLDS. Run 2026-08-18 against a throwaway root carrying one minted option under spec/trace/option/, with a git identity and a HOME belonging to nobody real and the option body carrying both. prose-inspect came back RED with two findings, naming the file and the line for the username and for the home directory, exit 1. It does NOT settle the inherited blind spot: a leaked name that is also common project vocabulary is muted here as everywhere."
probed: 2026-08-18
source_refs:
  - vp-the-ledger
  - raid-asm-the-pool-is-a-node-kind-under-project-spec
  - raid-iss-an-exit-script-may-not-read-unpinned-host-state
weighs_with: none
weighs_against: none
---

## Probe

HOLDS. RUN 2026-08-18, and it is a real channel rather than a reading.

A throwaway root was built carrying one minted option under
`spec/trace/option/`, with a git identity and a HOME belonging to
nobody real, and the option's body carrying both of them. prose-inspect was run
against that root.

    prose-inspect RED - 2 finding(s)
    - item 3 - spec/trace/option/opt-a-minted-option.md:6 - carries the git user name
    - item 3 - spec/trace/option/opt-a-minted-option.md:6 - carries the home directory
    EXIT=1

BOTH NEEDLE KINDS WERE FOUND, both named by file and by line, and the exit code
was 1. The coverage the design counts on is real and it costs nothing.

WHAT THE PROBE DOES NOT SETTLE, and it is the same limit the check carries
everywhere: a leaked name that is also a common project word is muted as
vocabulary and would not be found in a minted option either. That blind spot is
inherited, not introduced.

## What was read before it was run

The half that is a reading, kept because it says WHY the run passed.
`prose-inspect.ts` walks `join(root, "spec")` recursively over every
`.md` file. A node under `spec/trace/option/` is inside that walk by
construction.

WHAT IS NOT CHECKED is that the pool lands there. That is the neighbouring
assumption, and this one is its consequence rather than an independent belief -
which is why it is conceivable rather than plausible.

THE PROBE: mint one option carrying a deliberate needle into a throwaway root
and run prose-inspect. It must go red and name the file. That is a test, and it
belongs beside the identity-collision cases already written.

AND THE SWEEP ITSELF HAS A KNOWN BLIND SPOT that this assumption inherits: a
bare word the records already use in more than three files is muted as
vocabulary. A leaked name that is also a common project word will not be found
in a minted option either.
