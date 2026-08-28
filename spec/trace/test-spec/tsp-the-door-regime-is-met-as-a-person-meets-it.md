---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: tsp-the-door-regime-is-met-as-a-person-meets-it
type: "[[test-spec]]"
statement: The three things a person meets directly — a sweep that names what nothing invokes, a refusal that demands a reason, and a list that says why each module is allowed past — are verified by demonstration, because each claim is about what somebody can TRUST rather than about a return value.
method: demonstration
demonstrates:
  - sty-find-working-code-that-no-surface-can-reach
  - sty-an-exception-without-a-reason-is-refused
  - sty-read-why-the-code-departs-from-its-own-design
verifies:
  - none — this spec demonstrates three stories end to end, so the demonstrates edge above carries its trace; the mechanics underneath are test-verified by tsp-the-door-rule-refuses-and-reports and inspected by tsp-the-door-regime-s-static-attributes
files:
  - none — the procedure below is the definition; the observed runs are the evidence, and each has its own report
---

# The door regime, met as a person meets it

## Why demonstration and not test

A test can prove the sweep's predicate. It cannot prove the answer is worth
reading. A test can prove a write is refused. It cannot prove the refusal gets
somebody unstuck.

EACH OF THE THREE CLAIMS IS ABOUT TRUST, and trust is watched rather than
asserted.

## Procedure

### One — the sweep names what nothing invokes

1. Run the sweep against the REAL tree, not a fixture. The boot state runs it as
   its own exit script, so entering a session is enough.
2. Read what it printed. It must NAME each entry point nothing invokes rather
   than count them.
3. Record the figures it gave and the names it listed.

WATCH FOR THE STALE ENGINE. The lane server caches modules at import, so a run
against code edited in the same session answers with the old code. Reload first,
or the observation is of something else.

### Two — the refusal demands a reason

1. Attempt a write that adds a departure carrying a path and no reason.
2. Record the refusal verbatim: the clause, the file, the line, the remedy.
3. SEND THE REMEDY BACK AS IT WAS HANDED OVER. This step is the one that matters
   and the one easiest to skip. A remedy that cannot be applied is a diagnosis,
   and the refusal contract promises recovery in one turn.
4. Record what came back.

### Three — the list says why each module is allowed past

1. SPAWN A READER WITH NO SHARE OF THE BUILD. The hand that wrote the reasons
   cannot judge whether a stranger can read them.
2. Have it open the departure list and, for each entry, answer whether the reason
   explains the departure or is filler.
3. Have it CHECK each reason against the code it describes, rather than rating
   its prose.
4. Have it say what the list does NOT tell a reader.

## What each observation must record

- WHAT WAS PRINTED, quoted, not paraphrased.
- WHAT WAS NOT SHOWN. A property held by a unit case is that case's evidence,
  never the demonstration's.
- WHAT IT FOUND that the builder believed otherwise about.

## The pass line

Each of the three yields a report naming what was observed, and a demonstration
that confirms everything the builder already believed has not been performed
hostilely enough to count.
