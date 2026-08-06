---
id: req-tour-reads-what-stands
type: "[[requirement]]"
statement: "When a tour runs, the engine shall derive every stop from the live machinery and read zero stored tour scripts."
kind: functional
verify_method: demonstration
breaks_if_removed: "The tour rots the day it is written; a shipped part stays invisible until someone rewrites a script."
refines:
  - uc-learn-the-machinery
source_refs:
  - uc-learn-the-machinery step 2
  - uc-learn-the-machinery ext 2a
priority: should
---

## Detail

## Detail

- A part shipped since the last tour appears on the next tour with zero authored changes.
- The stop list derives at tour time; zero stored tour scripts exist.
