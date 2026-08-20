---
id: machine-format
statement: What format should draw a state machine that is being walked, inside VS Code — the answer, the candidates, and what it costs.
---

# The drawing format for a walked machine

## 1. The answer

Nothing replaces the Obsidian canvas. Keep JSON Canvas 1.0 with the Advanced Canvas plugin fields, keep the engine's own hand-emitted SVG renderer, and spend the effort on three things the format was never the cause of. Every surveyed alternative loses something the owner named as required, and the incumbent is the only candidate that clears all five constraints for hand-drawn machines. The three real gaps are these: generated machines have an automatic layout with no way to override it, five places in the renderer collapse the token list to its first entry, and the per-agent field exists but nothing ever writes to it. For the generated half, add a pin-override file that the generator merges — roughly thirty lines, zero dependencies. Adopt a layout library only if that proves insufficient, and then adopt Graphviz compiled to WebAssembly (`@viz-js/viz` 3.28.0, MIT, 1,185,576 bytes as ECMAScript modules, Graphviz 15.0.0), because it is the only engine whose per-node pinning was proved by running it.

## 2. The table

Five constraints, one column each. "Marks the walk" means it can show a machine while it is being walked, with a position. "Pinning" means the owner can fix one node's placement while the rest lays out automatically.

<div style="overflow-x:auto">

| Candidate | Offline | Marks the walk | Several active at once | Pinning | VS Code support | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| **JSON Canvas + our SVG renderer** (hand-drawn machines) | Yes. Zero third-party bytes on the drawing path | Yes. Active class, route spline, "you are here" arrow, closure ring | Yes for the box fill. No for the arrow, the header button, the walk buttons | Total. Every x and y is the owner's. No layout runs at all | Already shipped. Served from localhost into an iframe inside a webview | **Viable, incumbent** |
| **JSON Canvas + our SVG renderer** (generated machines) | Yes | Yes, same renderer | Same as above | **None.** Coordinates are arithmetic in TypeScript | Same | **Partial. This is the gap** |
| **Graphviz DOT** via `@viz-js/viz` 3.28.0 | Yes. WebAssembly runs in Node, where no policy applies | Not in the format. We would draw it | Not in the format. Unlimited colours per node when we render | **Yes, proved by execution.** `pin=true` on a subset holds those nodes and auto-places the rest | Library only. No extension | **Viable. Best pinning** |
| **ELK JSON** via `elkjs` 0.12.0 | Yes. Pure JavaScript, no WebAssembly | Not in the format | Not in the format | **Contested.** One agent measured exact cross-axis pinning. Another measured the nodes moving | Library only | **Unsettled — see below** |
| **Mermaid stateDiagram-v2** 11.16.0 | Browser yes. **Node no** — `mermaid.render` throws `document is not defined` | Only by rewriting the source text every tick, which re-runs layout | Yes, via `classDef` and `class A,B,C name` | **None.** No coordinate syntax in any state or flowchart grammar | Native in the built-in Markdown preview since VS Code 1.121 | **Disqualified on two constraints** |
| **Mermaid flowchart** 11.16.0 | Same as above | Same as above | Same as above | None | Same | **Disqualified. Also no fork or join** |
| **PlantUML** via `@plantuml/core` 1.2026.6 | Yes. MIT, 10,620,275 bytes, pure JavaScript, no Java | Only by rewriting the source text every tick | Yes for drawing. Concurrent regions, fork and join are first-class | **None.** No settable coordinate | Library only. The marketplace extensions need Java | **Partial. Best vocabulary, no pinning** |
| **SCXML** (W3C, 1 September 2015) | No maintained renderer. We would draw it ourselves | Not in the format. Position is a run-time notion | Semantically the best fit. `<parallel>` and a configuration that is a set | Only through a foreign namespace, per-tool, not standard | One authoring extension. Nothing native | **Partial. A model, not a drawing** |
| **XState snapshot** (version 5) | **No.** The visualiser is a hosted web application | The one format that serialises the active configuration | Yes. Nested object per parallel region | **None.** Layout lives in the vendor's service | Authoring extension, cloud visualiser | **Disqualified** |
| **draw.io XML** via `hediet.vscode-drawio` 1.9.0 | Yes. Bundled copy, offline defaults to true | No. An authoring canvas, not a viewer for a walk in progress | Only by rewriting the owner's file every tick | Yes, and it has six automatic layouts too | Extension, custom editor. Licence is GPL-3.0 | **Disqualified on constraint 2** |
| **Hand-rolled layered layout** | Yes by definition | Whatever we draw | Whatever we draw | Total | Library only | **Do not.** See section 6 |

</div>

## 3. Why this one

The offline constraint turned out not to bind anything, and that finding reorders the whole survey.

The premise was that the drawing runs inside a VS Code webview under a strict content security policy, so no hosted script and no cloud render. The first half is false. The extension builds a shell page whose entire body is one `<iframe>`, and the policy at `deliverable/vscode/src/extension.ts` line 370 governs only that shell. The drawing lives inside the frame, in a page served by our own engine over `http://localhost`. A search for `Content-Security-Policy` across the whole deliverable returns exactly one hit — that line. The engine's HTTP server sets no policy header on any route. It already serves a third-party npm browser bundle from its own origin at `/vendor/vscode-elements.js`, resolved out of the engine's own `node_modules`.

The binding rule is different, and it is written down in six places: **no build step**. A candidate is disqualified if it needs a bundler to produce something the browser can load. It is not disqualified for being large, for being WebAssembly, or for coming from npm. Every sibling analysis that scored candidates against a strict policy scored them against the wrong bar.

That leaves the incumbent winning on merits rather than on inertia.

- It is the only candidate where the walk position is not a source rewrite. Every text format — Mermaid, PlantUML, DOT, draw.io — marks the active state by re-emitting the document, which re-runs layout, which can move the picture when nothing structural changed. Our renderer changes a class attribute.
- It is the only candidate that cannot move under a highlight change, because no layout runs at render time for hand-drawn machines.
- It already honours the token list for the box fill. `render.ts` line 2390 builds a set from the whole `active` array, and line 223 marks every member.
- It carries sixteen state fields and three edge fields that no diagram language models. Eleven of them are load-bearing at dispatch, not at draw time: the legal tool list, the repair tool list, the priority gate, the entry and exit conditions, the evidence form, and the sub-machine reference.
- One arrowhead flag doubles the edge set. An edge drawn with heads on both ends manufactures a reverse transition (`compile.ts` lines 265 to 267). Eight of the main machine's edges use this. A format that normalises a two-headed line into one directed edge silently deletes forty-two percent of the main machine's transitions.

### The cost being accepted

Three costs, named plainly.

- **The generated half stays weaker than the hand-drawn half.** Seven canvas files are authored. Everything else is built in code, and the majority of machines by count are generated. Their layout is a grid: the pinned walk machine places nodes at `x = column * 560` and `y = row * 260`, with the column chosen by milestone group. Edges are ignored by that layout entirely.
- **Portability is partial.** Three load-bearing fields are Advanced Canvas plugin extensions, not JSON Canvas 1.0: the machine header in `metadata.frontmatter`, the start and end pill shape, and the edge role channel. The specification covers node geometry and edge ends and nothing else. Any tool that round-trips the file as pure JSON Canvas drops those three silently.
- **The renderer work does not go away.** Keeping the format means the five single-token collapses and the missing per-agent layer are ours to fix. No format change would have fixed them either — but choosing the incumbent means choosing to do that work rather than hoping a library does it.

## 4. The second-best

Graphviz compiled to WebAssembly, as a layout pass under the canvas rather than as a replacement for it.

**What it does better.** It pins per node, and that was proved by running it, not by reading documentation. Two independent runs confirmed two mechanisms:

- `neato` with `pin=true` and a position on a subset held nodes `a` and `b` at their authored coordinates while unpinned node `c` was placed automatically at `(2.05, 0.50)`. That is literally "mostly automatic layout with hand override".
- The two-pass route also works. `dot` produces the layout, the owner edits the coordinates worth moving, then `neato` with the no-op flag treats every position as final and computes only the edge routes. A node moved to `pos="400,90"` held exactly, nothing else moved, and all four edges were re-routed with five control points each.

It also routes edges around nodes properly with splines, which our renderer does not do, and it is a finished, thirty-year-old implementation that we would never maintain.

**What it costs.** These are real, not rhetorical.

- Two engines, not one. Automatic layout comes from `dot`; pinning comes from `neato`. They are different algorithms with different behaviour, and `dot` ignores `pos` and `pin` entirely — I confirmed this is documented as "neato, fdp only" and it was reproduced by execution.
- A unit trap. `neato` and `fdp` read positions as inches. The no-op engines read them as points. A five-unit input came back as five inches under one and as 0.0694 inches under the other.
- A DOT string round-trip, and edge geometry that must be parsed back out of position strings.
- An unresolved licence. The wrapper is MIT (`@viz-js/viz`) or Apache-2.0 (`@hpcc-js/wasm-graphviz`), but Graphviz upstream has historically been EPL-1.0 and neither agent established what the compiled blob carries. This matters only if the extension is ever distributed rather than kept private.
- An untested interaction that is the most likely place it breaks. Graphviz clusters are a `dot` feature and interact badly with `neato` specifically. Our machines have group boxes and sub-machine references. Nobody ran Graphviz on the real `main.canvas`, only on synthetic graphs of three to five nodes. **Spike this before committing.**

That last point is why this is second and not first. The pinning is proved; the fit with our actual graph shape is not.

### The ELK.js disagreement, unresolved

Two agents ran `elkjs` 0.12.0 and got opposite results. Neither reconciled them, and I am not going to smooth it.

- One measured **exact** cross-axis pinning. With the layered algorithm plus four interactive strategies — layering, cycle-breaking, crossing-minimisation and node-placement — a node moved to `x = -300` came back with every node's x offset by exactly 312. That is a single global translation, so every supplied coordinate was honoured to the digit. Adding a node then drifted every existing node by exactly 12, again a pure translation, with zero relative movement.
- The other measured the nodes **moving**. Setting `org.eclipse.elk.position` under the layered algorithm produced output identical to the default run. Setting `org.eclipse.elk.stress.fixed` did not hold its nodes. The layered algorithm with interactive strategies was described as using coordinates only as soft ordering hints while re-placing everything.

The likely difference is the exact option set — the successful run included `nodePlacement.strategy: INTERACTIVE`, which is the coordinate-assignment phase, and the failing description lists only three of the four. That is a hypothesis, not a finding. Until somebody re-runs both configurations side by side, **ELK.js pinning is unsettled** and it should not be adopted on the strength of either report.

## 5. What "sometimes I want control" actually costs

The owner cannot move a node in the machine an agent actually walks. That is the concrete gap, and it is not a format problem.

Hand-drawn machines have total control and no automatic layout. The `main`, `boot` and `ideation` canvases carry a literal position and size on every node, and the renderer uses them verbatim. The reader comment is explicit that a width the owner sets in Obsidian is theirs and the render never re-imposes it. There is nothing to override because nothing is computed.

Generated machines have the opposite. The pinned rigor-matrix walk machine, the build-chunk machine, the archive columns and the decade machines all compute their coordinates in TypeScript arithmetic. There is no override file, no hint, no merge step. Regenerating discards any hand edit by construction.

### How pinning would work

**The cheap fix, no dependency.** A pin file keyed by state identifier, read by the generator and merged over the computed grid. Roughly thirty lines. A pinned state takes its stored position; an unpinned state takes `column * 560, row * 260` as today. This solves constraint 5 completely for generated machines and changes nothing else.

**The Graphviz fix, if the grid proves unreadable.** The generator emits DOT with a `pos` attribute and `pin=true` on every state the owner has moved, and nothing on the rest. Graphviz places the unpinned states around the pinned ones. The output is parsed back into the canvas node list, and the renderer draws it exactly as it draws a hand-drawn canvas today.

### What breaks when a pinned node conflicts with the layout

Four failure modes, in the order they will be met.

- **Overlap.** Graphviz will not move a pinned node to resolve a collision. Two nodes pinned four hundred units apart with a six-hundred-unit box between them will overlap, and nothing warns. The pin file needs a validation pass that reports collisions rather than silently drawing a mess.
- **Edges crossing pinned boxes.** Routing goes around what it can. A pinned node dropped into a dense edge bundle produces lines through the box. This is cosmetic but it is exactly the ugliness the owner would be pinning to avoid.
- **A pin outliving its state.** A state renamed or deleted leaves an orphan entry. The pin file must be keyed by state identifier and must warn on an unknown key, or it rots invisibly.
- **The flow axis stays quantised under ELK.js and free under Graphviz.** If ELK.js is ever adopted, the owner picks which rank a node sits in but not its exact position along the flow direction. Only the Graphviz no-op pass honours an arbitrary position on both axes. That is a real difference in what "control" means, and the owner should know which one he is buying.

One thing does not break. Marking a different state active changes a class attribute and the route path only. It reads no coordinate and touches no layout input. The drawing physically cannot jump when the walk moves — with the incumbent, with the pin file, or with a Graphviz pass, because layout would run at generation time rather than at render time.

## 6. The counter-argument

Version 2's architecture decision record on derived figures (`se.adr-figures-derived-set`) has a rationale line that reads directly against a layout engine:

> deterministic layout of arbitrary graphs is the recorded infra grave (dagre exists for a reason)

Its statement goes further. It caps the engine to four derived figure kinds — context model, building-block tree, timeline, stakeholder matrix — and ends: "View-time diagram rendering is rejected, since the visual would be script-created." It was decided by a person in version 1 iteration `i0012_spec_book`, migrated at bootstrap `b3`, and amended in version 2 to fold into the projection catalogue.

**The case, stated fairly.** Graph layout is a genuine engineering swamp. Writing one means owning cycle-breaking, layer assignment, crossing minimisation, coordinate assignment and orthogonal edge routing, and the last two are where months disappear. The record is not stale reasoning from 2019 — it was written recently, and nothing found in this survey makes the problem cheaper than it was. The parenthetical names the exact library one would reach for and treats its existence as the proof that this is solved work. The provenance clause is also serious: a script-created visual cannot be marked with authorship the way prose can.

**Does it still bind?** In two parts, and the parts differ.

The layout half **binds, and should be obeyed**. Do not write a layered layout engine. One analysis argued for a bounded hand-rolled implementation on the grounds that it was the only option offering true per-node coordinate pinning. That premise did not survive: Graphviz was shown by execution to pin a subset while placing the rest, so the hand-rolled option now buys a capability that is available off the shelf. Its own parenthetical — "dagre exists for a reason" — reads straight as an argument for adopting rather than writing. Read that way, the record forbids the hand-rolled option and licenses the adopted ones.

The view-time half **does not appear to bind here, and this needs an owner ruling rather than my assumption**. Its scope is the four spec-book figure kinds, folded at version 2 into the projection catalogue. The mirror is not a spec figure; it is a live instrument. More decisively, the mirror already creates its entire SVG at view time in `render.ts` — that clause has demonstrably never governed it. And a hand-authored SVG cannot, even in principle, show where three agents are standing right now, which is the whole requirement. I would not call the record wrong. I would call it out of scope, and I would rather say that to the owner than route around it.

## 7. What this does not solve

**Constraint 4 has no data behind it.** Several agents cannot be marked distinguishably because nothing records which agent is where. The field exists — `claims`, declared at `machine.ts` line 94 as "which session holds which active state". I searched the engine myself: six hits, of which one is the declaration and three are deletions at lines 249, 277 and 350. There is no writer anywhere. The renderer has one active class and no per-agent styling. This is a data-layer gap, and no format choice touches it.

**Multiple active states are unreachable through the tick.** The kernel is a genuine token net and the multi-token path is tested. But the tool surface refuses to produce one. An unnamed advance is refused whenever a state has more than one edge, and a named advance fires exactly one edge. The one machine designed for parallelism — the build-chunk machine with its join — was reproduced deadlocking: completing the first chunk empties the token set, and the wedge guard refuses the move. A build plan with more than one independent chunk cannot currently be walked.

**Five surfaces still collapse the token list to its first entry.**

- The route, computed from the first active state only.
- The "you are here" arrow, drawn once at the first stop.
- The header state button.
- The client-side current-state variable, set twice from `active[0]`.
- The walk buttons in the detail pane, which unlock only for the state equal to that variable. With two tokens the second cannot be advanced through the mirror. That is a functional defect, not a cosmetic one.

**A token standing in a parent machine is invisible.** The leaf lookup returns the deepest sub-machine's tokens only. If the main machine holds two tokens and one enters a sub-machine, the sibling is dropped from the position, from the poll comparison and from the drawing.

**A partly-satisfied join draws like an untouched one.** The join fuel — the fired edge list, keyed `from->to` — never reaches the renderer. A join at two of three inbound edges is pixel-identical to a join at zero of three.

**The arrow vanishes on arrival.** The heading arrow is drawn only when there are at least two stops. A token standing at its destination has a position and the drawing stops showing it.

**A live defect in the VS Code card.** The webview carries a sandbox attribute, and sandbox flags inherit into nested browsing contexts, so the localhost iframe inherits them. The inherited set omits `allow-popups`. Four `window.open` calls in `render.ts` — the control-click and shift-click "open in new tab or window" handlers — are therefore blocked inside a card and return null silently. They work only when the mirror is opened directly in a browser. This was inferred from the sandbox construction, not observed; one control-click on a clickable state settles it.

### Claims that did not survive verification

Reported because a smoothed disagreement is worse than a loud one. Each of these was asserted by a first pass and refuted by a second.

- **"VS Code imposes no content security policy on webviews."** False as stated. The webview host page carries one. It does not govern our content document, so the conclusion held, but the flat claim would mislead anyone repeating it.
- **"Offline: yes, and unconstrained."** False. The sandbox constrains it, and that is what hides the `window.open` defect above.
- **"PlantUML needs a Java runtime."** False. That belongs to the marketplace extension, not to PlantUML. `@plantuml/core` 1.2026.6 is MIT, 10,620,275 bytes, compiled to pure JavaScript, with Graphviz as WebAssembly for layout and no server. It still fails pinning, so the verdict stands and the reasoning does not.
- **"Mermaid has no fixed-coordinate placement in any diagram type."** False. The `block-beta` type is built for manual placement. It has no fork, join or concurrent regions, so the verdict stands on a narrower fact: the type with the machine vocabulary has no placement control, and the type with placement control has no machine vocabulary.
- **"draw.io has no automatic layout at all."** False. It ships six layout algorithms. Its disqualification rests solely on being an authoring canvas rather than a viewer for a walk in progress.
- **"Pinning is the only mode; no automatic layout exists in this repo."** False, and this is the one that matters most. The pinned rigor-matrix walk machine computes its geometry. Constraint 5 is not over-satisfied; for the machines that matter it is unsatisfied.
- **"No test asserts two simultaneously active states."** False. One does, and it exercises both the OR and the AND fan-in branches.
- **"Two active states in different sub-machines with the same leaf name collide."** Impossible. The active list is built with one shared prefix and state identifiers are unique within a machine, so no two entries can merge.
- **"Mermaid renders offline."** True in a browser, false in Node — `mermaid.render` throws `document is not defined`. Since this engine renders server-side, Mermaid would need a headless Chromium. That is a second disqualifier the first pass missed entirely.
- **"bpmn-js is MIT."** False. It ships under the bpmn.io licence, which requires a permanent, never-overlapped watermark linking back to the vendor. Requests for exceptions have been refused.
- **"The draw.io extension is Apache-2.0."** False. Version 1.9.0 is GPL-3.0. That is a materially different fact for a private product.
- **"The engine has one third-party dependency."** False. It has six, two of which are browser libraries already served into the mirror page.
- **Occurrence counts quoted from the VS Code Mermaid bundle** were wrong by large factors on two of three. Do not quote them.

### Unestablished

- Whether ELK.js pins. Two runs, two opposite results, no reconciliation. Section 4 has the detail.
- Whether Graphviz handles our group boxes and sub-machine structure. Only synthetic graphs of three to five nodes were tested. Clusters are a `dot` feature and interact badly with `neato`.
- The licence of the compiled Graphviz binary inside either wrapper package.
- Whether `claims` is meant to hold a session identifier, an agent name, or something else. No writer, no test, no documentation beyond the one-line comment.
- Whether the owner wants a position override for generated machines at all, or whether the computed grid was a deliberate choice.
- No performance measurement of any kind. Every size quoted is a raw published byte count, not compressed, with no parse time and no layout time on a real machine file.
