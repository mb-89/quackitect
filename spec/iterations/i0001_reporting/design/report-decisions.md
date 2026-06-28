# i0001_reporting — design decisions (captured from the build)

Design input for the report, recorded as the decisions were made during the walk. Extends
[dashboard_draft.md](dashboard_draft.md) (the original sketch). Order ≈ chronological.

## Shape & determinism
- **Deliverable:** a deterministic `quack report` → ONE self-contained `report.html` snapshot of
  the gate ledger. A *snapshot*, not a live dashboard — so it is auditable and emailable. No
  Obsidian, no server.
- **Determinism is load-bearing:** byte-identical HTML on an unchanged ledger. Timestamp comes
  from the git HEAD commit (not wall-clock); rows/nodes sorted by id; vendored cytoscape pinned.
- **Self-contained:** all CSS + JS inlined; no network/CDN; opens from `file://`.

## Layout (three columns)
- **LEFT — Iterations:** one expandable row per iteration (current expanded). Rows are clickable
  and feed the Details panel.
- **MIDDLE — Trace graph:** the design DAG, **input → output**, laid out top-to-bottom with the
  foundation (e.g. `report-frame`) on top. One tab per connected cluster ("root"). Built-in
  `breadthfirst` layout (not dagre — avoids a missing standalone dep).
- **RIGHT — Details (top) → Metrics → What's next.**

## Trace graph encoding
- **Fill colour = verifier class** (judgment / review / executed) — answers "what kind of node".
- **Border = state** (done solid green / open dashed grey / suspect thick amber).
- **★ prefix = killer gate.** Arrow = flow ("leads to"). A **legend** explains all of it.
- Note (deferred): the trace currently mixes design atoms and build *steps*; steps belong in a
  per-iteration task list, not the trace. See the project note + [i0002_disentangle_trace].

## Details panel (right column, persistent, titled "Details")
- Placeholder **"click an element to show detail"** when nothing is selected.
- Fed by BOTH a graph node click and an iteration row click.
- Shows the **load-bearing fields inline** (id, class, state, killer, statement, depends-on,
  verify) so the substance travels with the report even off-repo.
- **"details ↗"** link opens the full prose `.md` in a new tab. Fallback message
  *"original source not present on this machine"* when detectable (served over http); on
  `file://` it is best-effort (browsers block the existence probe).
- **Click the project title** → project info (name + tagline only).
- **Click an iteration** → its motivation + status (+ type·rigor when active; "tbd" when planned).

## Iterations & versions
- Each iteration has `spec/iterations/<id>/iteration.md`: frontmatter `status` (+ `type`/`rigor`
  once active), body = a one-line **motivation/vision**, shown in the iteration detail.
- **Naming:** `i<NNNN>_<name>` (4-digit zero-padded).
- **Version planning:** a **planned** version = just an `iteration.md` (status: planned, no checks
  yet) → shows as "planned", type·rigor "tbd". **Only `engage start` creates versions** (never
  ad-hoc). `engage start` suggests groupings (things that go together share a version); planned
  versions are mutable until started.
- **`engage next` version selection:** latest not-done version by default; earliest planned if all
  done; announces its choice; locks onto a human-named version when several are open.
- (Engine gap noted: deterministic `quack next` is still global — selection is method-followed.)

## Metrics
- Computed from the ledger, each shown **with its formula**: gate state, suspect frontier, killer
  coverage, executed ratio, trace coverage.
- **Deferred** (need an append-only attest event log / actor, not yet kept): reversal rate, rework
  rate, self-cert ratio — shown as "—". Backlog note captured.

## Integrity
- Header shows the **Merkle root fingerprint** (⛓). The date says *when*; the fingerprint says
  *which exact state*. It is the audit anchor — same value ⇒ identical ledger.

## DRY (a firm user principle — no duplicated data, UI or code)
- Removed from the header: per-iteration version, the verdict-counts line, type/rigor.
- Removed the redundant "All checks" table (its data is in graph + Details + iterations).
- Project-title detail shows only name + description (iterations/hash/date/counts live elsewhere).
- Links open in a new tab.
