# i14 doc-review — session handover (2026-07-08)

Written for the next session (and future me). Read this before resuming i14.

## Where we are

i14 (`i0014_doc_review`) is a large book-render rework driven by a 45-comment field
review of the book (owner's commented copy on the Desktop, listed via
`quack note --file2list`). We are MID-BUILD, in the refine cycle. Nothing new is
blessed; the ledger carries the churn. Rule the owner set: **stay in i14 until the
documentation is done** — no i15 for this.

## Done, in the book, building green

- **Unified reader table** (the spine): name + short brief columns, disclosure
  triangle, everything else on expand, controls BELOW the table right-aligned,
  configurable pagination (default 20), multi-facet combinable pills — a needs
  facet on every trace table + category facets, no pill-per-item. Brief = a short
  description/short statement, empty when the statement is long.
- **Details pane**: always-visible bottom overlay in the sidebar, context-sensitive
  help surface (`window.bookDetail(title,html)`), hosts the views + the baseline hash.
- **Sidebar**: one-line search with a `‹ i/N ›` counter (no hit list), one-line
  filter opening help in the pane, top header bar removed.
- **Term/link affordance**: dashed-underlined words → details pane (definition +
  jump link); the `(?)` markers are gone.
- **Glossary** renders only in ch3 (a section, not a back-matter chapter).
- **Presentation** (deck) is out of the reading flow (off-screen; only via its button).
- **README = home** (chapter 1): rendered by a purpose-built `renderReadme` — headings,
  tables, blockquotes, lists, inline images as data URIs. ZERO-DEP (no markdown lib).
- **ch0 → "the document at a glance"** (about the document; the system intro is the README).
- **Rationales chapter folded into the Appendix** (ch8 "Guidance" renamed "Appendix";
  ch7 deleted) — it was too empty.
- **Criteria folded into needs** (crit- node type retired; each need carries its
  `## Success criteria`).
- Comment-UX (warn on unsaved close, no bar jump), the malformed agent-guide code
  block (mdLite got fenced-code support), voice heading-nesting, 258/258 green,
  context-star lines at node borders, trace-graph fixes (all types on, back round-trip).

## The big win: derive-from-code flow analyzer

`deriveDesignFlow()` in book.go statically analyzes the engine's own Go source with
the **standard-library parser** (`go/parser`/`go/ast` — zero-dependency) and returns
the REAL call graph between design elements + which read/write external I/O. Verified:
145 design elements, 226 consume-edges, sensible (e.g. `go-cli-help` → every command).
`debugDesignFlow()` prints a summary. This drives the onion AND can judge the design
(coupling, layering). This is the right pattern: the onion is a rendering of the
design/code, derived, not declared.

## Parked / open

- **THE ONION IS PARKED.** The owner will draft the intended visual (tomorrow). Do NOT
  keep micro-iterating it — that was degenerating (6+ visual passes). Its DATA is solid
  (`deriveDesignFlow`); the LAYOUT is the owner's to draft. Current state: recursive
  (overview rings that skip no-flow layers → per-layer round view: wide ellipse filling
  the width, left half = incoming flow, right half = outgoing flow, an element in both
  gets two boxes, merged+labeled edge arrows for named inputs/outputs, inner-bound → core,
  infra pills below, pan/zoom, browser-Back, breadcrumb-only up-nav, no click-up on the
  graph). Wait for the owner's draft, then implement THAT.
- **Context neighbours as notes + the context diagram (c28)** — deferred. `req-context-diagram`
  captured. Needs a small new modeling concept (neighbour note kind + wire the star to it).
- **Ledger reconciliation**: the new/amended i14 requirements are unblessed and several
  lack design markers (honest design-holes in `quack lint`). Resume by walking the
  reopened cone and blessing the milestones WITH the owner, then ship.

## Method improvements captured as notes (for a later iteration, NOT this one)

- **Structural decomposition should be an architecting step** (M3/M4): the component /
  layer / interface / flow decomposition should FALL OUT of the design process, not be
  reverse-engineered. The deterministic analyzer then verifies code-vs-design and, where a
  language tool exists, derives it.
- **Nested guidance, first application**: per-language tool guidance (Go: go/parser
  shipped; C++: Doxygen; else judge yourself) lives in language-scoped guidance under the
  Appendix.
- **No-flow-layer smell**: a layer where nothing processes/routes is a bad decomposition —
  skip it, push its infra down. The flow tool surfaces this for free.

## Lessons for how I work (resharpen)

1. **Do not blind-iterate an opinionated VISUAL.** The onion ate ~6 subagent passes because
   I kept guessing pixels I could not see. The moment a figure is subjective, get the DATA
   model right (that was the real value), render a reasonable first cut, and hand the visual
   to the owner to draft. One or two visual passes, then stop.
2. **Derive over declare, from the source of truth.** The go/parser analyzer beat every
   attempt to hand-author or approximate the flow. When the truth is in the code, parse it.
3. **Delegating well-scoped book.go edits to fresh subagents preserved my context** across a
   huge batch — keep doing this, sequentially on the same file, with precise specs +
   "gofmt + go build" as the gate.
4. **Template-first, mirror to spec, no drift** held cleanly all session. Keep it.
5. **Capture method gaps as notes in the moment** — don't fold process changes into the walk.
