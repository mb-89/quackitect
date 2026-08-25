---
id: i66-the-overhaul-gets-its-mechanisms-a-check
status: seeded
opened: 2026-08-25T13:35:13.957Z
goal: "The overhaul gets its mechanisms: a check can land frozen, a check knows whether it is trusted, a check carries its own fix, and the sweep knows where it last stopped. Seeded by the 2026-08-25 overhaul, from the field scan its own step zero ran."
vision: "EIGHT THINGS, and they are one design because each is a property a CHECK has to carry before an overhaul can lean on it.\n\nTHE RATCHET. A newly minted check over a grown corpus reports hundreds of violations, and today the only answers are fix-them-all or suppress-it. Record the count, report only what is NEW, let the baseline fall and never rise. The named prior art is ArchUnit's freezing rule and Betterer, both in spec/references/. Measured here: the voice lint over the machines corpus reported 53 findings in one call, which is exactly the moment this exists for.\n\nTHE FALSE-POSITIVE BUDGET. Google publishes a rate just under five percent for its own analysers, watches it, and switches off anything above it. We mint checks and measure nothing. Give every check a way for a reader to say a finding was useless, and a published rate. The first entry already exists: the pyramid rule fires on a file whose body is empty, counting frontmatter blocks as paragraphs.\n\nTHE FIX RIDES THE FINDING. Filing bugs from tool output failed at Google, with 84 percent never fixed. What worked was the finding carrying its repair. Where the repair is mechanical, the voice lint applies it and says so, the way the formatter already does.\n\nTHE SECOND DELTA. The sweep is scoped by rules that CHANGED. Drift also happens when a rule stands still and the code moves under it. Compute the code-and-prose delta since the last overhaul and sweep against every rule, not only the moved ones.\n\nTHE BOUNDARY. Nothing records when the last overhaul ran. The retro has one, computed from the call log; the overhaul has none, and the call log cannot serve because a fresh clone starts it empty. Make it mechanical from git, and let the sweep scope itself.\n\nSHARDING. An executed sweep lands as one change today. Google shards by ownership and gives each shard its own test-and-review pipeline, and the agentic-PR evidence says large changes merge least often. Emit many small independently revertible commits instead.\n\nSTABLE FINDING IDENTITY. The rule \"seen twice means it was always a lint\" is unfalsifiable while recurrence lives in an agent's memory. Give a finding a fingerprint that survives across runs.\n\nTHE DOOR-ACCESS REGRESSION, carried in as a defect with its evidence rather than as a fresh question. deliverable/tests/drift.test.ts asserts that recordDone sweeps the corpus once. It measures 898 door accesses against a ceiling of 800 and a recorded honest cost of 245. The test file has not changed since the i45 strays commit, so the engine moved under it. The asks-equals-one assertion still passes, so the operation collects its input once and something else is reading. This needs instrumenting rather than guessing, which is why it is here and not in the sweep.\n\nWHAT DONE LOOKS LIKE. A check can be minted against this corpus without drowning its reader. An overhaul run ends with a green battery and a stamped boundary. And the next overhaul scopes itself without a person telling it where the last one stopped."
inputs:
  - "guidance/method/overhaul.md"
  - "spec/references/ref-archunit.md"
  - "spec/references/ref-betterer.md"
  - "spec/references/ref-swe-at-google.md"
  - "spec/references/ref-reflexion-models.md"
  - "spec/references/ref-agentic-refactoring.md"
  - "deliverable/tests/drift.test.ts"
  - "note-fbf9f3dac40d"
depends_on: []
---

# i66-the-overhaul-gets-its-mechanisms-a-check

## Goal

The overhaul gets its mechanisms: a check can land frozen, a check knows whether it is trusted, a check carries its own fix, and the sweep knows where it last stopped. Seeded by the 2026-08-25 overhaul, from the field scan its own step zero ran.

## Rough vision

EIGHT THINGS, and they are one design because each is a property a CHECK has to carry before an overhaul can lean on it.

THE RATCHET. A newly minted check over a grown corpus reports hundreds of violations, and today the only answers are fix-them-all or suppress-it. Record the count, report only what is NEW, let the baseline fall and never rise. The named prior art is ArchUnit's freezing rule and Betterer, both in spec/references/. Measured here: the voice lint over the machines corpus reported 53 findings in one call, which is exactly the moment this exists for.

THE FALSE-POSITIVE BUDGET. Google publishes a rate just under five percent for its own analysers, watches it, and switches off anything above it. We mint checks and measure nothing. Give every check a way for a reader to say a finding was useless, and a published rate. The first entry already exists: the pyramid rule fires on a file whose body is empty, counting frontmatter blocks as paragraphs.

THE FIX RIDES THE FINDING. Filing bugs from tool output failed at Google, with 84 percent never fixed. What worked was the finding carrying its repair. Where the repair is mechanical, the voice lint applies it and says so, the way the formatter already does.

THE SECOND DELTA. The sweep is scoped by rules that CHANGED. Drift also happens when a rule stands still and the code moves under it. Compute the code-and-prose delta since the last overhaul and sweep against every rule, not only the moved ones.

THE BOUNDARY. Nothing records when the last overhaul ran. The retro has one, computed from the call log; the overhaul has none, and the call log cannot serve because a fresh clone starts it empty. Make it mechanical from git, and let the sweep scope itself.

SHARDING. An executed sweep lands as one change today. Google shards by ownership and gives each shard its own test-and-review pipeline, and the agentic-PR evidence says large changes merge least often. Emit many small independently revertible commits instead.

STABLE FINDING IDENTITY. The rule "seen twice means it was always a lint" is unfalsifiable while recurrence lives in an agent's memory. Give a finding a fingerprint that survives across runs.

THE DOOR-ACCESS REGRESSION, carried in as a defect with its evidence rather than as a fresh question. deliverable/tests/drift.test.ts asserts that recordDone sweeps the corpus once. It measures 898 door accesses against a ceiling of 800 and a recorded honest cost of 245. The test file has not changed since the i45 strays commit, so the engine moved under it. The asks-equals-one assertion still passes, so the operation collects its input once and something else is reading. This needs instrumenting rather than guessing, which is why it is here and not in the sweep.

WHAT DONE LOOKS LIKE. A check can be minted against this corpus without drowning its reader. An overhaul run ends with a green battery and a stamped boundary. And the next overhaul scopes itself without a person telling it where the last one stopped.

## Inputs

- guidance/method/overhaul.md
- spec/references/ref-archunit.md
- spec/references/ref-betterer.md
- spec/references/ref-swe-at-google.md
- spec/references/ref-reflexion-models.md
- spec/references/ref-agentic-refactoring.md
- deliverable/tests/drift.test.ts
- note-fbf9f3dac40d
