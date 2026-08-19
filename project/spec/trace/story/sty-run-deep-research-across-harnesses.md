---
minted_in: i36
id: sty-run-deep-research-across-harnesses
type: "[[story]]"
statement: An engineer asks for current harness research and receives a repeatable primary-source comparison without choosing a search backend.
actor: stk-engineer-driving-agents
refines:
  - vp-rigor-without-toil
priority: must
---

## Deck

An engineer needs a current answer about MCP and several agent harnesses.
|||
HAPPENED. This iteration opened on exactly that question: what does each
supported host actually provide, and where do our assumptions about Claude
Code stop being true elsewhere.

---

The agent invokes the project-owned deep-research workflow.
|||
HAPPENED. The workflow is `guidance/skills/deep-research/SKILL.md`, projected
to three harness locations by `se_prompt_place`, so it is the project's copy
rather than the host's.

---

One lane search verb selects an available provider and logs each query.
|||
PARTLY. Every query reached the log, but the provider was not selected by the
lane. `se_web_search` has no configured Brave key on this machine, so native
search carried the queries under the standing exception. Closing that is a
named item on `raid-debt-harness-fallback-and-bounds-need-implementation-proof`.

---

The agent fetches primary sources and separates vendor claims from local measurements.
|||
HAPPENED, and the separation is visible in the result. The report is
`project/spec/references/ref-agent-harness-portability-2026-08-19.md`. Each
figure it carried into `engine/harness.ts` arrives as a `measured` field
naming its provenance, so a documented claim and an observed number cannot be
confused.

---

Focused rounds continue until two consecutive rounds add no capability, contradiction or source class.
|||
PARTLY. The rounds ran and stopped, but the stopping test was the author's
judgment rather than a recorded saturation check. Three primary sources —
Codex, Cursor and Claude — were unreachable, and that is recorded as an open
item rather than papered over.

---

The answer lands with its query ledger, source ledger, gaps and product implications.
|||
HAPPENED. The reference carries its sources and its gaps, and the product
implications became work: five measured breaks, ten build chunks, and two
register entries — `raid-asm-documented-harness-limits-stay-stable` and
`raid-asm-the-harness-scan-still-matches-current-releases`, each with a
trigger for the next scan.

## Unlike

A single web query returns leads.

This story produces repeatable evidence that survives the harness and the session.

## What this deck does not claim

TWO SLIDES ARE PARTIAL AND SAY SO. The provider was not chosen by the lane,
and saturation was judged rather than recorded. Both are named on the open
debt entry rather than counted as served.
