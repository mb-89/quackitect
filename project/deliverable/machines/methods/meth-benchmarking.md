---
kind: method
statement: "Benchmarking and legacy: what competitors ship, what our own predecessor did, and what reverse engineering shows — options that already survived contact with users."
source: "@ai/sya_kb/digest/sya/01_Architecting.md"
---

## Situation

M4 enumerate-space, as one of the parallel finders.

It answers a question none of the others do: what is ALREADY RUNNING, in
front of real users, and what did it cost whoever built it.

## WHY IT IS NOT THE SAME AS PRIOR ART

THE SPLIT IS WHAT YOU ARE HOLDING, never what the thing is (owner ruling
2026-08-08). Yes, most prior art describes things that shipped. That is not
the question.

- [[meth-prior-art]] holds a WRITTEN ACCOUNT. It gives the mechanism and the
  reason, generalised, usually with the failure modes named.
- This holds an OBSERVATION of a running artifact. It gives the what,
  concretely, plus evidence it survived real users.

The interesting decisions in a shipped product are usually the ones nobody
wrote a paper about. That is exactly what this finder is for.

THE OVERLAP IS REAL AND IT IS FINE. A shipped product with a paper about it
belongs to both, and both may mint an option for it. The chart dedupes, and
`found_by` records which lens turned it up.

THE TIE-BREAK: did you READ a description, or did you LOOK at the artifact?
Reading is prior art. Looking is here.

THE TWO FAILURE MODES ARE OPPOSITE, and that is the real argument for running
both. Prior art fails by being aspirational — a design nobody ran, whose
costs nobody paid. Benchmarking fails by being opaque — behaviour you can see
and a mechanism you are guessing at. Each one's blind spot is the other's
evidence.

## THREE SOURCES, AND THE THIRD IS THE ONE PEOPLE SKIP

- COMPETITORS. What does the nearest product do for this function?
- OUR OWN PREDECESSOR. What did the last version do, and why was it changed?
- REVERSE ENGINEERING. What can be read off the artifact itself.
  - The file format.
  - The wire protocol.
  - The error messages.
  - The shape of the config.

THE PREDECESSOR IS THE RICH ONE. It was built by people who knew this
problem, its failures are recorded, and nobody has to guess at the context.

## THE PROCEDURE

1. Name the function cluster being served. Not the product, the cluster.
2. For each source, find what fills that cluster and describe the MECHANISM
   rather than the marketing.
3. Say what it cost them. A feature list without its price is half a finding.
4. Say what our context breaks. An option that works because they have
   something we do not is not an option here.

## WHAT A FEATURE LIST IS EVIDENCE OF

That a feature is CLAIMED. Never that it is good, and never that it beats
ours.

A COMPARATIVE CLAIM NEEDS EVIDENCE ON BOTH SIDES. "They do X better" needs
what they do AND what we do. Where our side does not exist yet, the
comparison is not weak — it is impossible, and writing it is fabrication.

## THE FAILURE MODE

Copying the SURFACE. A competitor's screen is the output of constraints you
cannot see, and adopting it imports decisions nobody here made.

Transfer the mechanism and the reason. Leave the shape.

## Sources

- The SyA corpus at @ai/sya_kb, chapter 01: benchmarking, reverse
  engineering and legacy named among the ways of using available knowledge.
- v1's i0016, where the prior-art check ADDED a requirement rather than
  confirming the set. That is what a check with teeth looks like.
