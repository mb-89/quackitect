---
name: deep-research
description: Run thorough, current, primary-source research across standards and supported agent harnesses. Use for vendor behavior, portability, comparisons, limits, hooks, tools, skills, MCP, or any request for deep research.
---

# Deep research

Use this workflow when a claim depends on current external facts.

Do not treat model memory as research.

## Start with the question

Write the decision the research must support.

Split it into a coverage matrix:

- standards and protocols
- each supported harness
- competing implementations
- failure and lifecycle behavior
- documented limits
- measured local behavior

Name any row that does not apply.

## Discover sources

Call `se_web_search` first.

That verb selects its configured or keyless server-side provider.

If it returns a native `WebSearch` handoff, use that tool when the harness exposes it.

Use `se_web_fetch` for known URLs and for every result that may support a claim.

Search results are leads, not evidence.

If discovery remains unavailable, state which backends failed.

Continue with known primary URLs.

Mark the final result incomplete.

## Prefer primary evidence

Use sources in this order:

1. Current specifications and schemas.
2. Official vendor documentation.
3. Official source code and changelogs.
4. Official issue trackers for observed defects.
5. Independent measurements.
6. Secondary explanations only when the primary source is unavailable.

A vendor page proves what the vendor claims.

It does not prove quality or superiority.

## Research in rounds

Run one broad discovery round.

Then run focused rounds per coverage row.

For each important claim, search for:

- the feature
- its limit
- its configuration path
- its failure mode
- its lifecycle behavior
- a contradiction or removal

Fetch the supporting pages.

Repeat with changed wording until two consecutive focused rounds add no new capability, contradiction, or source class.

That is the stopping rule.

## Keep an evidence ledger

Record each material claim with:

- claim
- source URL
- source owner
- publication or update date
- access date
- primary or secondary status
- what the source actually proves
- uncertainty or conflict

Keep search queries too.

A reader should be able to repeat the scan.

## Compare honestly

State what the other system does better first.

Then state what this product does.

A comparison needs evidence on both sides.

When one side does not exist, say the comparison is not possible.

Do not fill the gap with a judgment.

## Test the research against the product

Compare documented behavior with local probes.

Keep these separate:

- vendor claim
- protocol guarantee
- local measurement
- inference

A failed search or tool call is a research finding.

Capture provider gaps, offloads, cancellations, and stale documentation as improvement work.

## Land the result

Write durable findings into the reference corpus.

Include:

- scope and date
- query ledger
- source ledger
- findings
- contradictions
- unverified claims
- product implications
- follow-up probes

Do not bless requirements, architecture, or a comparison that depends on missing research.
