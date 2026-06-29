# engage — advance the iteration:  start | next | refine | ship

## start  (plan + begin an iteration)
1. **retro** — run `/review retro`. It opens with the field-feedback question and emits notes.
2. **triage** — process `.quack/notes/inbox/` (see triage.md).
3. **migration** — walk the ready backlog. For each item: keep, drop, or pull into this iteration.
<!-- design: versioning-method  implements: versioning :: A version IS an iteration. Create a planned one by writing iteration.md; ids are i_NNNN_name; only engage start mints versions; notes stay trunk-owned. -->
4. **version planning** — assess what is NEW: retro notes, the drained backlog, field feedback. Then suggest how to version it.
   - Things that go together belong in one version.
   - Prefer folding small tool or infra work into the ACTIVE iteration. Do not spin a dedicated tooling version for it.
   - Create a **planned** version with `uv run quack start --plan <id> "<one-line motivation>"`. It writes the planned `iteration.md`. Type and rigor stay unset until you activate it.
   - You MAY add to an already-planned version that has not started.
   - **Only `engage start` creates versions.** Never mint them ad-hoc. Ids are `i<NNNN>_<name>`, four-digit zero-padded.
<!-- enddesign -->
<!-- design: planning-method  implements: planning :: quack start composes the project type over a rigor floor, tailors it to the idea (above the floor, never removing a killer), runs a plausibility check, and bakes a self-contained checklist of gates+subtasks. -->
5. **plan & bake** (for the version being started now):
   a. Confirm the project TYPE and RIGOR (`.quack/config.toml`). If the vision mismatches either, run the plausibility check. Re-confirm with the human. Then `uv run quack start <version> "<motivation>"` — it activates the version (status active, type/rigor inherited) and points config at it. A planned version flips to active. The motivation surfaces in the report's iteration detail.
   b. `uv run quack gather <version>` — collect ALL the rigor and type source into `.quack/gather/<version>/source.md`. That is checklists, prose, prompts, spreadsheets, and links.
   c. Read the WHOLE bundle. Open any flagged file. Follow any link. Then COMPOSE the plan as two separate layers in `spec/iterations/<version>/`:
      - **Trace** (content) — the typed design nodes: need, use-case, requirement, design, test, ADR. Use semantic edges only: refines, implements, verifies, addresses. The trace is content, not gates. It is never blessed and carries no DONE/SUSPECT/OPEN. It only ripples change downstream.
      - **Gates** — SEED every milestone of the rigor checklist into `tasks/` as a GATE plus its subtasks:
        - **Milestone gate** — id `m<n>-gate`, `class: review`, `killer: true`, `milestone: M<n>`, `depends_on` its subtasks. It is the increasing-scrutiny review (`guides/milestone-review.md`).
        - **Subtask** — one per acceptance item, `milestone: M<n>`. A subtask that checks the TRACE is **derived**: `class: executed`, `verify: coverage:<rule>` — the engine computes it live, no human stamp. The rest are **judgment**: `class: review`.
        - **Coverage rules**: `req-traced`, `req-has-test`, `req-has-design`, `adr-traced`, `designs-realized`, `tests-pass`.
        No milestone may be empty.
      Then tailor the statements to THIS idea. Add subtasks above the rigor floor. Never remove a killer gate.
   d. On the human's approval, run `uv run quack bless --all` to lock the plan.
<!-- enddesign -->

## next  (walk the next forward check)
0. **Pick the version.** Default to the latest not-done version. If every version is done, start the earliest planned one. Compose its checklist as in `start`. Announce which you chose. If several versions are open and the human names one, lock onto that version. Hold it for this and the following `next` calls until told otherwise.
1. `uv run quack next` — the determinizer hands you the next ready check. Its upstreams are satisfied.
2. **FILL** it. Do the work. Produce the evidence. For executed checks, make `verify` pass.
   - **Code that realizes a requirement IS its design node.** Declare it inline where the code lives, never in a `.md`:
     ```
     # design: <id>  implements: <req-id>
     # one-line description of the design (becomes the node's statement)
     <the code>
     # enddesign
     ```
     The engine scans `product/` for these markers. `quack lint` surfaces a requirement with no design. It folds the region's hash into the design. So editing the code reopens the design SUSPECT. Architectural **decisions** stay as ADRs in `spec/`. Only **realized code** gets a `design:` marker. A requirement with no realized code is an honest design-hole. Leave it.
3. **ADJUDICATE.** A gate → present the evidence. Ask the human to run `uv run quack bless <id>`. Never bless on their behalf. An executed check passes on re-run. Then run `uv run quack next` again.
Repeat until `next` reports "done".

<!-- design: refine-method  implements: refine-track :: Refine is a track orthogonal to rigor: explore an idea in a gitignored spike, capture the keeper backward into a design-input check (which reopens the affected cone via suspect), then re-walk. It is the default working mode in late phases. -->
## refine  (explore an idea, capture the keeper backward)  ← default in late phases
Once a build exists (post-M6) and you are NOT starting a new iteration, refine is the default working mode. It is M5's spike, turned into a cycle.
1. Take the human's **idea and their motivation**. Run a light coherence check. Does it fit the frame and vision? This is a quick judgment, not a gate. If it clearly does not fit, capture it as a note and stop.
2. **SPIKE** it in `.quack/spikes/<id>/`. This is throwaway, gitignored scratch space. Do NOT touch `product/` or any gated check yet. Iterate fast. Keep or discard.
3. On a **keeper**, **capture backward**. Write what you learned into the right design-input check (M1, M2, or M3 — the requirement or design it really was). That edit reopens the affected checks SUSPECT.
4. `uv run quack next` then walks exactly the reopened cone. A contained change reopens little. An architecture-break steps back to M3. Re-walk. Then keep refining, or `ship`.
Discard the spike when done. A rejected idea → archive a note WITH its reason. That makes the rejection durable.
<!-- enddesign -->

## ship  (output the iteration)
`uv run quack ship` packages `product/` into `.quack/out/`. Ship is the END of a forward iteration. The zip is ephemeral output. Do not commit it.

Reaches: `defer` (push a check to a later iteration), `retire` (drop one).
