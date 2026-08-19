---
minted_in: i35-the-cloud-run-s-findings-land-the-fix-fi
id: tsp-the-graph-answers-what-a-change-touches
type: "[[test-spec]]"
statement: "An agent answers what a change touches by asking the corpus rather than by grepping it, and disposes of every candidate coupling the graph does not already name — verified by demonstration, because the claim is about what a person can TRUST rather than about a return value."
method: "demonstration"
demonstrates:
  - "sty-answer-what-does-this-touch"
  - "sty-dispose-a-candidate-coupling"
verifies:
  - "none — demonstrates: sty-answer-what-does-this-touch carries the edge; the requirement id this once named is retired and no requirement carries it"
files:
  - "none — the procedure below is the definition; the observed run is the evidence"
---

## Scope

The two halves of asking the corpus a question: the STRUCTURED answer, and the
ranked candidates for coupling no edge names.

WHY DEMONSTRATION AND NOT TEST. A test can prove a verb returns rows. It cannot
prove the agent stopped grepping, or that every candidate was disposed of rather
than the top hit taken — and those are the claims. Both are about behaviour
under real work, observed once, on a real change.

WHAT IS DELIBERATELY OUT: the verb's own correctness. When it ships it owes a
method: test spec of its own; this one is about how it is USED.

## Procedure

1. Take a change already made, whose couplings are not yet known.
2. Ask the corpus for the nodes of the relevant kind, naming the fields wanted back.
3. Ask the ranked sibling for candidate coupled nodes, described in plain words.
4. Write down a disposition for EVERY candidate returned — real coupling, or not.
5. Count what the disposition found that the graph's own edges did not.

## Pass lines

- Step 2 returns rows, or an explicit empty result naming why. Never a silent miss.
- Step 4 covers every candidate. A partial list fails this outright.
- Step 5 is reported honestly, including zero.

## What was observed on 2026-08-17

NOT RUN, AND THE REASON IS RECORDED RATHER THAN HIDDEN: neither verb exists yet.
i15 stands status: open, and the lane's 34 tools carry no structured query over
the trace graph.

WHAT i35 OBSERVED INSTEAD, on the same shape of problem: it built se-arrive.ts
and discovered — only when the ELEMENT MATRIX was drawn — that four of its
functions were already implemented in se-start.ts. No edge named that coupling.
It was found before the change shipped, by a decomposition step that happened to
sit between the build and the gate, and nothing forced it.

SO THE NEED IS DEMONSTRATED AND THE MECHANISM IS NOT. That is the honest state of
these two stories, and it is why this spec exists rather than leaving them
uncovered.
