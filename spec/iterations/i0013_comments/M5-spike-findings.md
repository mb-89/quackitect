# M5 — prove the riskiest unknowns (i0013_comments)

## Riskiest assumptions validated → i13-m5-riskiest-validated

Timeboxed spike: a probe script injected into a real book copy (spec/book.html, 370 KB). The script ran in headless Chromium. Verdicts were read back mechanically. Spike home: data home `spikes/i13-annotator/` (throwaway). Four claims:

| claim | verdict | evidence |
|---|---|---|
| P1 CSS Custom Highlight API paints without DOM mutation | **pass** | highlight registered; body byte-identical before/after |
| P2 quote+position anchors resolve inside real unit anchors | **pass** | Range built over a live unit's text, non-empty |
| P3 SVG sub-elements are id-addressable | **FAIL** | no id-carrying child inside any of the 225 figures |
| P4 island write/read/remove stays byte-confined | **pass** | hostile payload round-tripped; body untouched |

Not spiked: the File System Access API save (needs a user gesture — no headless path). The residual assumption is low risk (TiddlyWiki precedent, documented API). It is exercised live in the M7 killer-use-case demo.

## Spike results recorded — design advanced → i13-m5-spike-recorded

Two findings change the build plan:

1. **The emitter must stamp ids onto figure sub-elements at render.** Today req-comment-figure-target has nothing to anchor to. Without emitter work, every figure comment lands on the whole figure (the req-comment-figure-fallback path). M6 gets a build step for it.
2. **The island serializer must escape `</script>` inside comment JSON.** The spike itself broke on this exact trap (an inline script terminated by a comment body). The escape is one line (`<\/`). test-comment-escape's selftest now covers island serialization, not just render.

One tooling observation, noted for the record: the spike's headless-probe pattern (inject -> dump -> extract verdict) worked and is reusable for the M7 demos.

## Design is buildable → i13-m5-design-buildable

Scope guard holds. The build is:

- one annotator script + sidebar, emitted into the book shell (vanilla JS, zero-dep);
- one JSON island schema (W3C vocabulary);
- one read-back lane: `quack note --file2list` (Go, in the existing note command);
- emitter addition: figure sub-element ids (spike finding 1);
- the engine workshop family: ten diagnosed fixes, no open design.

Nothing needs a library. Nothing needs a service. Nothing needs a new top-level command. Every piece lands in an existing home:

- book shell JS
- emitter
- note command
- engine internals

## Review rounds & verdict

- **Verify.** The probe ran against the real artifact, not a mock; verdicts were extracted mechanically from the rendered DOM; the spike files sit in the data home for inspection until discarded.
- **Validate.** The riskiest claims (paint-without-mutation, in-file anchoring, island confinement) are the ones the architecture stands on — all proven on the real book. The one failure (P3) produced a concrete build step instead of an M3 step-back: the architecture survives, the emitter grows one duty.
- **Red-team.** Attack: "the save path — the Acrobat feel itself — was not spiked." Held: acknowledged openly as the residual assumption; it is API-documented, precedented, and demonstrated live at M7; a failure there degrades to the download fallback, which needs no API at all. Kill-criterion check from M1: the mark→save→read-back round-trip had to prove out — mark and island proved here, save carries a named fallback. No step-back triggered.

**Verdict: pass.** The killer (riskiest-validated) and the gate go to the adjudicator.
