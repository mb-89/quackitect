---
id: prep-state-machines-and-forms
statement: Preparation for the owner session on the state machine pictures and the rigor matrix.
---

# The state machines and the rigors — what to decide

Nine decisions are waiting. Four are cheap and mechanical. Five are yours alone.

The picture problem is half solved and the two halves live in different versions. Version 3 draws real arrows with guard labels. Version 2 computed a top-to-bottom rank but never sorted by it. Neither ever shipped both.

The rigor matrix is complete as data and half-wired as machinery. All 50 steps exist. The compiler that tailors them by change size works and is tested. Four authored fields reach no consumer at all, and the iteration lane has never been walked once.

Evidence forms are untyped. Worse, 70 of their 122 fields never reach the agent, because the tick packet does not carry them.

---

## 1. The decisions

1. **Layout source for machine pictures.** Pick one: keep authored drawings only; rotate the existing generated layout so milestones become rows; or lift version 2's dependency ranker. Recommendation below is the rotation. ==> Lift from V2, but render it better

2. **Does the version 2 figures decision still bind?** A human-adjudicated architecture decision record in version 2 rejects view-time diagram rendering and names deterministic graph layout an infrastructure grave. It did not carry into version 3. Yes it binds, or no it is retired. ==> yes, no figures for now. will do later

3. **Enforce the floor law in the compiler.** Four steps are marked as never-struck. Nothing checks it. Yes or no. ==> yes, as refusal

4. **Wire the escalation reopen ledger.** The list of steps that must be re-earned is computed, written into the pin, and then discarded. Yes wire it, or no delete it.

5. **What is the `product` change size for?** It compiles to a machine identical to `major` — same 51 states, same identifiers. Give it steps, merge it into `major`, or leave it as posture-only.

6. **Deliver evidence fields to the agent.** The tick packet omits them. Yes add them to the packet, or no keep evidence a person-only surface. ==> yes

7. **Type the evidence fields.** Pick a scope: none; the six core types; or the six plus `matrix`, `run_ref` and `derived`.

8. **Restore the agent submit path.** Version 2 had a tool that took a field-name-keyed object of evidence. Version 3 has nothing. Yes restore it, or no keep file writes as the only route. ==> yes, merge into 6

9. **Size the first iteration.** The matrix instructs that a product's first iteration is `product`, which is the top size and cannot escalate. Follow it, or seed a `patch` to retire integration risk first. ==> first iteration is always product, since it is where we desribe in details what we do (at least thats the proposal the agent makes. user can override)

---

## 2. Where the machine picture stands

### The bottom line

Version 3 has the arrows. Version 2 had the ranking. Nobody combined them.

The arrows are in `machineSvg` at project/deliverable/engine/render.ts:173-308. Real markers, real guard labels, drawn per edge:

- the line with its arrowhead, project/deliverable/engine/render.ts:207;
- the guard text at the midpoint, project/deliverable/engine/render.ts:209;
- the double border marking a sub-machine, project/deliverable/engine/render.ts:227-230.

### What version 1 did

Version 1 drew one machine figure, from one function: `svgModelGraph` in project/engine-go/models.go:325-390.

It had arrowheads and edge labels. It had no layout. A state machine is a single-layer graph, so it fell into the flat branch: a vertical column at x=400, ordered by sorted state identifier (project/engine-go/models.go:330 `sort.Strings(ids)`, placement at :358-363).

Alphabetical order means every non-adjacent transition is a long line crossing the whole column. That is the rendering you remember as poor.

Version 1 also had no walk to show. The figure is static book content with no runtime instance behind it.

These version 1 claims come from the first research pass only. The verification pass did not re-check them, and neither did I. Treat them as unverified.

### What version 2 did

Version 2's board drew HTML boxes in a flexbox column and no edges at all. Between consecutive boxes it emitted a `▼` character (project/deliverable/bin/se-board.ts:438 and :452, at reference `v2`). That glyph means "and then", not "from A to B".

The edges existed in the model with roles and guard labels. The projection threw them away at the boundary: a frame's states carry no edges field (project/deliverable/engine/project.ts:56, reference `v2`).

### The research contradicted itself here, and the correction matters

The first pass reported that version 2 had working automatic top-to-bottom layout. The verification pass said it did not. I checked, and the verification pass is right.

The ranking function is real. `stateRows` at project/deliverable/engine/project.ts:65-80 (reference `v2`) computes a longest-path rank, breaks cycles by declaration order, and floors terminals last. I read all sixteen lines. They are correct.

The board never sorted by it. Two lines settle it, both at reference `v2`:

- project/deliverable/bin/se-board.ts:451 `while (i < f.states.length)` — the board walks the states array in its own order;
- project/deliverable/bin/se-board.ts:436 `let j = i + 1` — the side-by-side scan starts at the next neighbour and stops at the first mismatch.

So the rank was only an adjacency test. Two states band side by side when they share a rank **and** already sit next to each other in the Obsidian canvas file. The vertical order a person saw was raw file order.

On the largest authored machine this fails visibly. In the M1 Frame group of project/spec/ledger/se/machine-systematic.canvas (reference `v2`), seven states have ranks 2, 3, 4, 5, 3, 5, 6 in file order. No two neighbours match, so nothing bands and the board draws a seven-box chain joined by "and then" glyphs. Two of those implied transitions do not exist in the drawing.

### What version 3 kept and what it dropped

Version 3 rebuilt version 2's viewing conventions and added the arrows. It also added the strongest walk-position marks in any version:

- an ordered spline route through the states the walk passed, project/deliverable/engine/render.ts:278-279;
- a rotated "you are here" arrowhead, project/deliverable/engine/render.ts:299-302;
- a road-closure ring carrying its reason as a tooltip, project/deliverable/engine/render.ts:290-297.

It dropped automatic layout for drawn machines by explicit ruling. project/deliverable/engine/render.ts:92-103 reads: "THE DRAWING IS THE TRUTH, SIZE INCLUDED (owner ruling 2026-07-28) ... So the render now takes the geometry VERBATIM — position and size both. Fix it in Obsidian and it is fixed here."

### The research contradicted itself again, and this one is good news

The outside-art first pass claimed version 3 has no graph layout at all. That is false. The verification pass caught it and I confirmed the correction.

Version 3 lays out every **generated** machine. The important one is `pinnedCanvas` at project/deliverable/engine/iterations.ts:562-583. It is a layered layout:

- each distinct milestone group becomes a column, project/deliverable/engine/iterations.ts:563-567;
- states stack downward inside their column, project/deliverable/engine/iterations.ts:573-575;
- coordinates are `x: col * 560, y: row * 260`, project/deliverable/engine/iterations.ts:576;
- edges are emitted for every transition, project/deliverable/engine/iterations.ts:580.

The milestone is the group. The compiler sets it at project/deliverable/engine/rigor-matrix.ts:270 `group: row.milestone`.

So the pinned rigor walk **already renders with computed coordinates and real arrows today**. It flows left-to-right across milestones M0 to M9, and top-to-bottom within one milestone. That is the opposite axis from what you asked for, and it is a constant swap away.

Two other generated layouts exist: the expedition machine (project/deliverable/engine/expmachine.ts:69-116) and the iterations container (project/deliverable/engine/iterations.ts:526-535). Both are hand-tuned with their own constants. Node box sizes come from one shared sizer, `nodeSize` at project/deliverable/engine/canvas.ts:71-75.

### One thing breaks on any vertical flow

Edge attachment is horizontal-only by default. `sidePoint` at project/deliverable/engine/render.ts:40-53 has this default branch:

```
default: {
  const ox = other.x + other.width / 2;
  return [ox < cx ? el.x : el.x + el.width, cy];
}
```

It always returns the vertical centre and always picks a left or right face. Top and bottom are reachable only when a canvas author set the side explicitly (project/deliverable/engine/render.ts:46-47).

Generated canvases set no sides (project/deliverable/engine/iterations.ts:580). So every generated edge hits that default. On a top-to-bottom flow the arrows would leave and enter box sides instead of bottoms and tops. The fix is to compare vertical distance against horizontal distance and return the top or bottom face when vertical wins. It is a few lines, and it is required, not polish.

### The three options

**Option A — rotate the existing generated layout.** Make the milestone a horizontal band and stack milestones downward. States inside one milestone sit side by side. Change project/deliverable/engine/iterations.ts:576 to `x: row * W, y: col * H`, plus the vertical branch in `sidePoint`.

- Cost: roughly ten lines in two files. No new algorithm. No dependency.
- Buys: top-to-bottom flow with real arrows and guard labels, on the machine that matters most.
- Does not buy: true dependency ranks. Two steps in the same milestone sit side by side even when one depends on the other.

**Option B — lift version 2's ranker.** Take `stateRows` from project/deliverable/engine/project.ts:65-80 (reference `v2`), use it as a sort key and multiply the rank into a y-coordinate.

- Cost: roughly twenty lines, plus two corrections version 2 never made. It must actually sort, which version 2 never did. Its cycle break at project/deliverable/engine/project.ts:71 uses declaration order, so a forward edge that runs backward in the file is silently dropped from the layout. Replace that with a real topological order.
- Buys: real dependency ranks. Parallel steps land on the same row because they are parallel, not because they share a milestone.
- Also needs: a within-rank ordering rule. Version 2 has none beyond declaration order, and its banding code is a worked example of getting this wrong.

**Option C — import a layout library.** ELK.js is the maintained layered engine. dagre is the small unmaintained original. Graphviz compiled to WebAssembly loads its binary at runtime.

- Cost: a megabyte-class dependency, plus offline wiring for a locked-down editor panel.
- Collides with decision 2 below.

### The recommendation

Take Option A now. Keep Option B in reserve.

Reason: the pinned walk is the only machine anyone reads at length, its milestones are already meaningful bands, and the change is a constant swap in code that already works. It does not touch drawn machines, so the "the drawing is the truth" ruling stands untouched.

Move to Option B only if milestone bands prove too coarse in practice. That is a judgement you can only make once you have looked at a rotated picture.

### The prior ruling nobody in version 3 can see

An architecture decision record in version 2 governs this and was never carried forward. It is at project/spec/ledger/se/adr-figures-derived-set.md, reference `v2`, adjudicated by a person.

Its statement, line 4: "The engine derives a small fixed set of diagram kinds as inline SVG with real text ... View-time diagram rendering is rejected, since the visual would be script-created."

Its rationale, line 20: "deterministic layout of arbitrary graphs is the recorded infra grave (dagre exists for a reason)."

Version 3 has no `project/spec/ledger/` directory at all. I listed `project/spec` and it holds exactly two entries: `expeditions` and `v3-plan.md`.

Read carefully, the ruling forbids the **viewer** drawing the diagram by script. It does not forbid the engine computing coordinates and emitting finished SVG, which is what version 3 already does. It does warn against generalised graph layout, which is an argument for Option A over Option B and a strong argument against Option C.

Whether it still binds is unrecorded. That is decision 2.

### Mermaid, settled

The editor now ships Mermaid built in. Measured on this machine on 2026-08-01: Visual Studio Code 1.131.0, built-in extension `mermaid-markdown-features`, bundle 25,841,858 bytes, containing `stateDiagram` and ELK. The bundled Mermaid is version 11.6 or newer, identified by diagram types present, not by a version string.

That gives a free static lane: emit a markdown fence and the preview renders it offline.

It is not a replacement for the drawn view. Mermaid can highlight a node. It cannot draw a route spline over the boxes, a heading-rotated position arrow, or a per-hop closure with its reason. Version 3's hand-written SVG already does all three.

One live offline hazard sits in project/deliverable/engine/bin/mermaid-check.ts:37, a direct import from a content delivery network. It is a build-time syntax harness that writes an HTML file for a real browser, not panel code. It would break if copied into a panel.

---

## 3. The rigor matrix and the iteration lane

### The bottom line

The data is finished. The compiler works and is tested. Four authored things reach nothing, and no iteration has ever been walked.

The full test suite is green: 300 tests, 300 pass, 0 fail.

### The shape of a row

One step is one file under project/deliverable/machines/rigor_matrix/rows/. The frontmatter carries everything:

- the step definition — name, statement, state kind, who fills it, dependencies;
- the evidence form, as a list of `{name, description, required?, killer?}`;
- five column cells and five matching prose notes.

The body carries one `## Guidance` section and nothing else.

A body `## Evidence form` section is refused outright (project/deliverable/engine/rigor-matrix.ts:68-74). The frontmatter is the single truth. That is an owner ruling from 2026-07-30 and it means the row grammar and the form-template grammar must stay separate.

### The columns

Five columns, four of them pinnable. From project/deliverable/engine/rigor-matrix.ts:17-18:

- `patch`, `minor`, `major`, `product` — the change sizes, pinnable;
- `specification` — how the step's output becomes documentation, never pinnable.

The first research pass reported only three change sizes. There are four. `product` is real and can be blessed.

Applied step counts against the live 50 rows:

- patch — 17 applied, 33 struck;
- minor — 41 applied, 9 struck;
- major — 50 applied, 0 struck;
- product — 50 applied, 0 struck.

### What compiles

`compileColumn` at project/deliverable/engine/rigor-matrix.ts:214-289 tailors by deletion and contraction. Rows whose cell is `none` vanish. Every survivor's dependencies are resolved transitively through the struck ones, so the graph stays connected.

Priority is derived, never authored. Gate outgoing edges become approval edges. A row marked as a fallback gets a fallback edge in and a recovery edge back.

Monotonicity is tested: patch is a subset of minor is a subset of major (project/deliverable/tests/rigor-matrix.test.ts:121-130).

### What the compiler ignores

Only `none` has mechanical meaning. The check at project/deliverable/engine/rigor-matrix.ts:217 filters it, and the cell value is never read again. `full`, `tailored` and `inherit` are indistinguishable to the compiler. They reach the machine only as prose, spliced into guidance at project/deliverable/engine/rigor-matrix.ts:274.

That is why `product` compiles identically to `major`: 51 states, same identifiers, byte-identical apart from guidance wording. The two columns differ on six rows, and only between `full` and `tailored`. Never `none`.

The whole escalation ladder, computed against the live matrix:

- patch to minor — adds 24 steps, marks 8 reopened;
- minor to major — adds 9 steps, marks 20 reopened;
- major to product — adds 0 steps, marks 4 reopened.

The largest escalation in the system adds nothing.

### What is owed

**The floor law is not enforced.** Four steps are marked never-struck: the kickoff gate, verification, the consistency sweep, and the release gate. The flag is parsed at project/deliverable/engine/rigor-matrix.ts:151 and read by no code. The only check anywhere is four assertions in project/deliverable/tests/rigor-matrix.test.ts:68-72, and only for `patch`. A `minor: none` on the release gate would compile a machine with no release gate and every test would stay green.

**The specification column has no consumer.** All 50 rows carry a filled specification note describing document form. A repository-wide search finds only the rows themselves, the Obsidian table view, the README, the declaration and one refusal test. That is 50 authored cells with nothing reading them.

**The killer flag is cosmetic.** It reaches the author inside an HTML comment (project/deliverable/engine/session.ts:301), and the checker strips HTML comments before looking (project/deliverable/engine/session.ts:327). A killer field is exactly a required field, and required already defaults to true.

**The escalation reopen ledger is inert.** The demands ledger and the reopen diff are computed correctly at project/deliverable/engine/iterations.ts:352-368. I read them. The comment above states the law: a filled step survives escalation only while its demand stands. Then project/deliverable/engine/session.ts:587 calls `pinIteration(this.root, it, size);` as a bare statement and discards the return value. The reopen list is written into the pin and read by nobody. The machinery to do it properly exists at project/deliverable/engine/machine.ts:172-251 and has exactly one caller, the unrelated jump-back path.

**One seed has no runner.** The step at project/deliverable/machines/rigor_matrix/rows/M8_10_fill-story-evidence.md declares `seeds: demos` and demands evidence that demos were seeded. No row anywhere declares `runs: demos`. Nothing will ever walk it.

**No iteration has ever been run.** Zero branches match `it/*`. There is no `project/spec/iterations/` directory — I listed `project/spec` and it is not there. Every claim about a pinned walk at runtime rests on unit tests against temporary directories. The `iter/*` branches on this machine belong to version 2 and are not evidence to the contrary.

### The first-iteration tension

The kickoff step instructs, in capitals, at project/deliverable/machines/rigor_matrix/rows/M0_90_gate-kickoff.md:70: "THE FIRST ITERATION OF A PRODUCT IS `product`: it authors the vision packet, the stakeholders and the actual state, and every later iteration inherits those by pointer."

`product` is the top of the size order. De-escalation is refused at project/deliverable/engine/iterations.ts:337-345, with the message "a prediction that proved too big is finished at its size".

So following that instruction commits the never-yet-run first walk to all 50 steps with no way down. Ignoring it means the vision, stakeholder and actual-state rows never get authored, and every later iteration inherits from nothing.

The research pulled both ways here. The first pass recommended seeding one small `patch` iteration to retire integration risk cheaply. The verification pass found the matrix's own instruction and flagged the contradiction. Both are honest. It is decision 9 and only you can settle it.

---

## 4. Evidence forms as parameter trees

### The bottom line

The fields are untyped, and most of them are undelivered.

The tick packet does not carry them. I read `tickInfo` at project/deliverable/engine/session.ts:2158-2190. It builds the agent's per-state object from identifier, kind, statement, guidance, priority, legal tools, entry, exit, exit status, pulled documents, lookahead reading and next edges. There is no evidence form key.

So an agent walking a step is never told what evidence the step asks for. Typing a field the agent cannot see buys nothing. Delivery comes first.

### The census

Counted mechanically across project/deliverable/machines/rigor_matrix/rows/:

- 50 rows, 49 carrying evidence (the terminal is exempt);
- 122 evidence fields total;
- 10 gate rows, carrying 52 of those fields;
- 9 fields flagged killer;
- 4 fields marked not required.

### The single consumer

`assertGateReport` at project/deliverable/engine/session.ts:281-350 is the only code that reads a step's field list. It has one call site, project/deliverable/engine/session.ts:2297, guarded by the state being a gate.

So 70 of the 122 fields are parsed, checked for mere presence, hashed into the pin, and then read by nothing.

Two fragile seams sit under that guard:

- the guard also tests that the machine identifier ends in `-walk`. That suffix holds only because project/deliverable/engine/iterations.ts:515 renames the machine compiled at project/deliverable/engine/rigor-matrix.ts:286. Rename the sub-machine and every gate report silently stops being checked.
- the kickoff state is built with kind `work` at project/deliverable/engine/iterations.ts:490, while being handed a gate row's five fields at :494. So `change_size` — the field that decides the whole machine's shape — is never checked.

### What "filled" means today

`const filled = content !== "";` — project/deliverable/engine/forms.ts:96, after HTML comments are stripped.

An agent writing "TBD" or a single period satisfies every required field in the system. The prefill law is the only thing standing between a machine and a passed gate.

Version 1 solved this better, and not by banning "TBD". It made it a counted state. `tbdValue` at project/engine-go/schemas.go:202-204 recognises the marker; a field that is missing, empty or "TBD" counts as open; a node is undecided while any core field is open. Porting that predicate into project/deliverable/engine/forms.ts:96 closes the biggest hole with no type system at all.

### The type list

Six types cover roughly 95 of the 122 real fields.

1. **claim** — an assertion plus its argument, judged met or unmet. 52 fields: every field of all ten gate rows. Examples: "every requirement carries its named verify method"; "every function allocated exactly once"; "the battery passes, all iterations".
2. **table** — rows over declared columns. About 17 fields, and their descriptions already name the columns in English. Examples: risks "each with kind, owner and trigger"; criteria "each with weight and scoring definition"; probes "each assumption, its probe, its result".
3. **prose** — free paragraphs, today's only behaviour. About 25 fields.
4. **list** — one item per line. About 7 fields, several of which say "one line each" in their description.
5. **verdict** — one of a declared closed set, plus a mandatory reason. 4 fields. The gate verdict already exists as a string-prefix test at project/deliverable/engine/session.ts:335-336, which today accepts "PASSABLE".
6. **files** — paths that must exist in the record's evidence directory. About 7 fields. The check already exists at project/deliverable/engine/forms.ts:106-111, but at form level, not per field.

Three more, each buying a check nothing else can:

7. **matrix** — a two-dimensional grid whose columns are data, with cells prunable and a reason attached. 6 fields. Defer this if scope is tight; `table` is a survivable stand-in.
8. **run_ref** — a citation of a captured command run, so the engine can resolve it and read the exit code. 2 fields. Version 2 shipped this as a documented convention with the rule "reference a run, never re-type output".
9. **derived** — the engine computes it and refuses a hand-written value. About 8 fields, all currently claims an author retypes. These are exactly the claims a machine would fabricate: "the matrix shows no empty rows"; "every function allocated exactly once"; "the battery passes, all iterations".

### Modifiers, not types

Four flags cut across every type:

- `required` — exists, defaults true;
- `killer` — exists, does nothing;
- `none_ok` — needed by about 10 fields whose description says "or an explicit none", enforced by nothing today;
- `when` — needed by the 2 fields faking a conditional requirement by declaring themselves optional. Both are market-related and both are required, conditionally.

Version 1's pair is better than a plain boolean. It used `tier: core | deferrable` (project/engine-go/schemas.go, with the authored schemas under project/quackitect/method/config/schemas/). That distinguishes "blocks" from "counts but never blocks", which is what the ten "or an explicit none" fields are reaching for in prose.

### The prior art is in this repository

Version 1 shipped a complete typed field-schema system. It is not a sketch. It is tested, requirement-traced code with nine authored schema files.

- types and attributes — project/engine-go/schemas.go:24-32, covering enum, bool, string, int and pattern, with min, max, tier and default;
- a schema tester that refuses an unknown key, an unknown type, a malformed enum or a default outside its own enum — project/engine-go/schemas.go:390-391;
- the "TBD" predicate and the open-field rule — project/engine-go/schemas.go:202-232;
- per-field provenance and a traffic light, refusing self-reported confidence — project/engine-go/schemas.go:236-297;
- the generator — `applySchemaPrefill` at project/engine-go/mint.go:230-306.

The generator worked out the hard case. The placeholder must itself satisfy the field's type. An enum gets its first option plus a provenance line asking for a veto, because a "TBD" text would break the enum's own rule. A pattern or integer with no default gets nothing written, because the absence is the honest state.

Its limit: version 1's fields were all frontmatter scalars. It types roughly 15 of version 3's 122 fields and is silent on tables, matrices, prose and file lists. Take the machinery — merge, tier, default, provenance, the tester. Invent the composite types.

### Person versus agent

The person's surface is built. The agent's is not.

What a person gets today:

- a text area per field with its description as a subtitle;
- a confirm button per unconfirmed prefill, project/deliverable/engine/render.ts:1399;
- the evidence folder as a click;
- the problems list inline.

What an agent gets today:

- at a non-gate step, nothing — the fields are not in the packet;
- at a gate, a refusal whose remedy points at a template path;
- for a gate report only, a fully rendered scaffold handed back as write arguments, project/deliverable/engine/session.ts:304-310;
- no submit tool at all;
- at the release gate, not even write permission — the step's legal tools list omits file writing.

What the agent version needs and the person's does not:

- a write address per field, since the mapping from field name to markdown heading lives only inside the panel's save path;
- a scaffold in the refusal, which the gate path already does and the form path does not;
- a shape it can be refused against, which is the whole argument for types.

What the person needs and the agent must never have: the confirm button. The prefill law works only because an agent cannot press it. `prefills` at project/deliverable/engine/forms.ts:56-58 returns the comment blocks as a list, which is what makes confirmation one field at a time. That is the genuine invention here. No outside prior art does per-field human confirmation of machine-suggested content. The nearest protocol pattern gives a person accept or decline over a whole form.

### The migration cost, corrected

The research disagreed about this and the smaller number is right.

The pin hashes the evidence specification: `evidence: JSON.stringify(row.evidence_form)` at project/deliverable/engine/iterations.ts:356, compared at :362-368. Adding a `type` key to every field changes every hash.

The first pass concluded that every pinned iteration would reopen every filled step on the next tick. It would not. The comparison runs only inside the pin function, which refuses any non-escalating size first (project/deliverable/engine/iterations.ts:335-345). I read that guard.

Real cost: one reopen per iteration that escalates after the migration. Nothing on ordinary ticks. Normalising a default type out of the hash is a nicety, not a blocker.

And since the reopen ledger is inert today (decision 4), the cost is currently zero either way.

### One boundary nobody tested

Field names are located by exact heading match. If a field name is not reproduced byte for byte as a markdown heading, the section reads as empty rather than refusing. The matrix rows use short lowercase names. The two form templates use full sentences as names. Both conventions already coexist and neither has a test.

---

## 5. The open questions

Each of these can be answered yes or no, or by naming one option.

1. **Layout.** Option A rotate the pinned layout so milestones become rows; Option B lift version 2's dependency ranker; Option C import a layout library. Which?
2. **The version 2 figures decision.** Does project/spec/ledger/se/adr-figures-derived-set.md still bind version 3? Yes or no. If yes, it should be restated somewhere version 3 can see it.
3. **Vertical edge attachment.** Add the top and bottom faces to the default in project/deliverable/engine/render.ts:48-51? Yes or no. Any vertical layout needs it.
4. **The floor law.** Enforce the never-struck flag inside the compiler, so a bad cell edit cannot strike the release gate? Yes or no.
5. **The reopen ledger.** Wire escalation to the existing reopen mechanism, or delete the ledger as dead weight? Wire, or delete.
6. **The `product` size.** It is `major` with different words. Give it steps, merge it into `major`, or leave it as posture-only? Pick one.
7. **The killer flag.** Give it code, or delete it from the documented semantics? Code, or delete.
8. **The specification column.** Build a consumer, or park the 50 authored cells until there is a document generator? Build, or park.
9. **The `demos` seed.** Author the missing runner row, or drop the seed and its evidence demand? Author, or drop.
10. **Evidence delivery.** Add the evidence form to the tick packet, so all 122 fields reach the agent? Yes or no.
11. **Evidence typing.** None; the six core types; or the six plus matrix, run reference and derived? Pick one.
12. **The "TBD" rule.** Port version 1's predicate into the filled check, so "TBD" stops passing? Yes or no. It is three lines and independent of typing.
13. **The agent submit tool.** Restore a tool taking a field-name-keyed evidence object? Yes or no.
14. **The first iteration.** Follow the matrix and size it `product`, accepting all 50 steps with no way down; or seed a `patch` first to retire integration risk. Which?

---

## What this document does not cover

- Version 1's rendering claims were not verified by anyone. They come from one research pass and stand unchecked.
- The claim that the gate report scaffold belongs in the forms directory rather than in code was not investigated.
- Version 2's submit tool was read only at its declaration and two filter lines. Whether it did any shape checking beyond non-emptiness is unknown. The two lines read say it did not.
- No measurement exists for a standalone layout library bundle. The 25.8 megabyte figure is the editor's combined Mermaid and ELK payload, an upper bound, not the cost of a layout engine alone.
