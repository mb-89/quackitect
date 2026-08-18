---
minted_in: i17-the-options-pool-triage-a-raw-note-into-
id: raid-iss-an-exit-script-may-not-read-unpinned-host-state
type: "[[raid]]"
kind: issue
statement: An exit script that reads unpinned host state decides a gate on a property of the machine, so it is green where it was written and red everywhere else.
owner: the owner
trigger: already live - prose-inspect returned 64 false findings on the first foreign machine to run it, 2026-08-18
status: open
impact: A condition is supposed to say whether the WORK is ready. One that reads the environment says whether the HOST is familiar, and the two are indistinguishable from the refusal. The failure lands at boot, where the agent has the least room to diagnose it.
breaks_how_badly: corrosive
how_likely: expected
probe: "PARTLY CLOSED. prose-inspect's own two causes are fixed and pinned by tests/identity-collision.test.ts, which stands in for a foreign host. What is NOT closed is the rule: nothing stops the next exit script reading a path, a hostname or a locale."
probed: 2026-08-18
source_refs:
  - i17-the-options-pool-triage-a-raw-note-into-
  - raid-iss-boot-grants-no-tools-while-promising-repair
weighs_with: none
weighs_against: none
---

## The shape of it

`engine/bin/prose-inspect.ts` hunts a leaked identity by asking git and the
environment for its needles AT RUNTIME. That is a good design for the check and
a bad one for a GATE.

TWO WAYS IT WENT WRONG ON ONE MACHINE, 2026-08-18:

- The host sets `git config user.name` to the AGENT's own name, and the records
  name that agent on nearly every page. 64 findings, every one false.
- `HOME` is the container's own root-owned directory, and the match was a
  plain substring, so a test fixture path read as a leaked home directory.

BOTH ARE FIXED. The rule they break is not.

## The rule this asks for

AN EXIT SCRIPT'S VERDICT MAY NOT DEPEND ON UNPINNED HOST STATE. A check may
READ the environment - that is often the point - but what it turns RED on must
be a property of the repository.

WHERE A CHECK CANNOT TELL THE TWO APART, it says so as a blind spot and stays
green. prose-inspect does that now, and the reasoning is written beside its own
collision guard: a check that is permanently red gets muted, which is worse
than one that is honest about what it could not see.

## Repayment

A line in the craft guidance stating the rule, and a case per environment-reading
exit script standing in for a foreign host. The second half is built for
prose-inspect and for nothing else.
