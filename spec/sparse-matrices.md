---
id: sparse-matrices
statement: How this project should visualise sparse matrices, and what "sparse mode" should mean.
---

# Sparse matrices, and what "sparse mode" should be

## 1. The answer

Do not build a global sparse mode, because the premise it rests on does not hold. Only one artefact in this repository is 1-3% dense, and nothing renders it as a matrix. The two grids the product actually draws are 100% full: the rigor tailoring table is 250 of 250 cells filled, and the voice matrix is 70 of 70. The one genuine cross-domain mapping in the repository, states against permitted tools, is 49.88% dense. What the project needs is not a sparsity switch but a SHAPE PROBE: a short function that measures any grid and names which renderer it deserves. For the one sparse artefact we do have, the dependency graph, the probe's answer is that a matrix is the wrong default. That graph is a chain of 41 levels whose widest level holds three rows, and the file naming already encodes it as an ordered list. Build the probe, render the dependency graph as the list it already is, and implement one reordering algorithm as a VALIDATOR rather than as a reorderer.

## 2. Is a matrix even right at 2% density

For the dependency graph, no. For the tailoring table, yes, and it needs no sparse mode at all.

### What the evidence says

The result everyone cites for "matrices beat node-link diagrams" does not cover our regime. Ghoniem, Fekete and Castagliola tested graph sizes of 20, 50 and 100 nodes at link densities of 0.2, 0.4 and 0.6. Their finding was that above twenty vertices the matrix wins on most tasks, with path finding the consistent exception. Their sparsest condition is far denser than ours. How much denser is UNKNOWN, because their density formula was not confirmed from the paper itself in this work. Depending on the convention used, the gap is somewhere between four and nine times. Their published venues are confirmed: IEEE InfoVis 2004, pages 17-24, and Information Visualization 4(2), pages 114-135, 2005.

The one controlled study run near our density found the opposite. Okoe, Jianu and Kobourov ran 557 crowdsourced participants over 14 tasks on a single real network, and I read their preprint in full. Their result: node-link diagrams were better for most connectivity tasks. Their stated mechanism is precisely our problem, quoted verbatim from their Discussion:

> Matrices favor dense networks (as number of edges increases, matrix size remains constant) but not sparse ones (empty matrices are as large as a dense ones).

Their conclusion is that node-link is "a better choice for visualizing datasets similar to the one we evaluated, provided a similar interaction set".

### Where that study must be read carefully

Three cautions apply, and all three come from the paper's own text.

- The paper contradicts itself on memorability. Its Results section says node-link supported memorability better. Its Conclusions say the two were comparable. Do not bank either claim.
- The paper contradicts itself on node counts. Section 3.1 says 258 nodes; the Conclusions say 256 nodes. Both say 1090 edges.
- Which density measure you pick flips the comparison. By the formula the paper computes, edges divided by nodes squared, their network is 0.016 and our dependency graph is 0.0232 — we are DENSER than they were. By the edge-to-node ratio the same paper endorses as the better indicator, their network is roughly 4.2 and ours is 1.16 — we are far sparser.

Be honest about that last point. We are not simply "at their density". We are sparser on one measure and denser on the other.

### The task that decides it

Our dependency graph exists to be walked. Path following is the one task where every study agrees the matrix is worst. Bae and Watson measured path finding at 46.6 seconds with their layered Quilts depiction, 58.3 seconds with node-link, and 71.2 seconds with a centred matrix. The matrix came last. At 200 nodes the ordering was unchanged.

### The finding that ends the argument

Nothing in this project renders an adjacency matrix. I searched the whole engine directory for adjacency, matrix-rendering and grid construction. Every hit is either CSS grid used for card layout or a key-value table used for detail panes. The two files named `matrix.base` define table views over frontmatter fields, not adjacency views. So "should we add a sparse mode to our matrix" is a question about a view that does not exist yet.

### The earlier claim that did not survive

An earlier pass argued that a sparse mode would be unreachable code, because the loader refuses a missing cell. That did not survive measurement. The tailoring table holds 42 cells whose value is the explicit `none`, and the patch column alone is 33 `none` out of 50. Explicitly valued is not the same as informative. A mode that de-emphasises not-applicable has real work to do.

## 3. Reordering

Implement one algorithm, and implement it as a validator.

### The one to implement

Tarjan's strongly-connected-components algorithm, followed by condensation, followed by Kahn's topological sort, with longest-path levels taken from the same pass. A strongly connected component is a group of states that can all reach each other. Condensation collapses each such group to a single node. Topological sort then orders the result so every dependency precedes what depends on it. The longest-path level of each node is the banding, which shows what could run in parallel.

The sources are canonical.

- R. Tarjan, "Depth-first search and linear graph algorithms", SIAM Journal on Computing 1(2), pages 146-160, 1972.
- A. B. Kahn, "Topological sorting of large networks", Communications of the ACM 5(11), pages 558-562, 1962.
- I. S. Duff and J. K. Reid, "An implementation of Tarjan's algorithm for the block triangularization of a matrix", ACM Transactions on Mathematical Software 4(2), pages 137-147, 1978.

### Its cost

The algorithm is O(V+E), where V is the number of states and E the number of transitions. It scales with the MARKS, not with the cells. That is the whole reason it is the right choice at 2% density: every other candidate costs O(n squared) or worse, and so pays for the 98% of the grid that is empty.

- At 100 states with about 150 edges: roughly 250 operations.
- At 1000 states with about 1500 edges: roughly 2500 operations.

Both are sub-millisecond in JavaScript. That figure is DERIVED from the complexity bound and an operation count. Nobody in this work benchmarked a JavaScript implementation, and no performance number for any render exists anywhere in this project.

### Two requirements that are not details

The tie-break must be the authored file order. An earlier pass recommended a canonical tie-break by row identifier. A later measurement showed that an alphabetical tie-break moves 9 of the 50 rows and breaks the milestone reading. Only a tie-break that IS the file order leaves the matrix where the owner put it. Pin this, or the output moves between runs and violates the byte-identical-regeneration rule.

Ship it as a validator, not as a reorderer. On our dependency graph it moves nothing, because the file order is already a valid topological order. What it earns is different: it asserts acyclicity where acyclicity is expected, it names any strongly connected component it finds, and it proves the bandwidth.

### What not to implement

Reverse Cuthill-McKee is a measured regression on our data. It reduces bandwidth for symmetric matrices, and it does so by ignoring edge direction. On our 50-row graph it moves bandwidth from 4 up to 5, and it flips roughly 54 of the 58 marks to the wrong side of the diagonal. That destroys the only thing a dependency matrix means. Its author agrees: Jean-Daniel Fekete annotates both bandwidth entries in his own reorder.js documentation with "(bad)". The original citation is Cuthill and McKee, Proceedings of the 24th ACM National Conference, 1969, pages 157-172.

The seriation family is built for a pattern we do not have. I read Table III of ReorderBench directly (Zhu, Wang, Shen, Wei, Tian, Liu and Liu, arXiv:2408.12169, version 2, revised 10 April 2025). It evaluates 45 reordering algorithms against four visual patterns. On BLOCK patterns the best classical algorithms score 0.892 and 0.895. On BAND patterns, which is what a dependency chain makes, the best classical result is 0.304. On STAR patterns, which is what our main state machine makes, the best is 0.495. The paper's own conclusion, verbatim:

> existing algorithms perform well on block and off-diagonal block patterns but poorly on star and band patterns.

An earlier pass reported this table as 44 algorithms and presented 0.304 as the ceiling. Neither survived. The count is 45. The same table's final row is the authors' own deep-learning reordering model at 0.757 on band and 0.828 on star — roughly 2.5 times the best classical band result. The practical conclusion is unchanged, because a convolutional-network ensemble is not shippable in an offline editor panel. But the argument had to be made rather than skipped.

Two limits on those numbers. ReorderBench generates SYMMETRIC matrices only, at sizes from 100 by 100 to 400 by 400. It does not state the densities of the generated matrices anywhere found in this work. So its scores are evidence about band and star patterns generally, not about directed matrices at 1-3% density.

### Libraries

No JavaScript or TypeScript library provides what we need. The reorder.js library ships barycenter, Cuthill-McKee, optimal leaf ordering, spectral ordering and a bandwidth measure. It has no strongly-connected-components pass and no topological sort. Its `components` function computes WEAKLY connected components, which is not the same thing. The graphology-components package is MIT licensed and has the same limitation. So write it: about 100 lines of TypeScript.

The reorder.js licence is UNKNOWN as a precise identifier. One pass reported BSD-2-Clause from the npm registry; another reported BSD-3-Clause from the GitHub interface. It is permissive either way. Confirm the exact variant before depending on it.

## 4. Sparse mode

Sparse mode is not one switch. It is a per-artefact decision made from a measured probe. These are the rules.

### Always shown

- The shape line. Every grid carries a text line stating rows, columns, marks, density and bandwidth. A blank screenful is otherwise ambiguous between genuinely empty and scrolled somewhere wrong.
- Every row and every column of an adjacency grid, including empty ones. See the next rule.
- The marks, drawn as small centred glyphs rather than filled cells. At 2% density, cell shading makes the 2442 empty cells the dominant visual mass. A point pattern inverts figure and ground. This follows the scientific-computing "spy plot" convention. That convention was NOT confirmed from any primary source in this work, so the rule rests on the perceptual argument alone.

### Never hidden

Empty rows and columns of the adjacency grid stay. This is the rule everyone reaches for first, and it is worthless here. Measured: 1 of 50 rows and 2 of 50 columns are entirely empty. Hiding them yields a 49 by 48 grid, which is 2352 cells instead of 2500 — a 5.92% saving. Hiding a row whose column survives also moves the diagonal off the 45-degree axis, which destroys the diagonal as an identity cue. The saving does not buy the damage.

### Not built at all

The band viewport does not survive. The arithmetic looks attractive: all 58 marks sit within 4 positions of the diagonal, and the strict upper band is 190 of 2500 cells, or 7.6% of the grid holding 100% of the marks. But reaching that saving requires SHEARING the columns, so that column position encodes offset-from-diagonal rather than which state it is. The column header can then no longer name a state. What you have built is an adjacency list with extra rules. Keeping columns fixed and windowing four of them shows about 4.6 marks at a time and needs thirteen scrolls.

An earlier pass proposed this as the centrepiece and quoted 450 cells at 12.89% density. Neither figure survived. The correct count is 190 cells at 30.5%. More importantly, the property does not generalise. Our main state machine has a hub of degree 10, and any linear ordering of a degree-d node forces bandwidth of at least d/2 rounded up. That floor is 5, so the band covers 132 of 144 cells — 91.7% of the matrix still drawn.

Geometric distortion stays unbuilt. No fisheye lens, no magnifying focus. An earlier pass argued that editable cells disqualify distortion because distortion hurts pointing. That did not survive: Horak, Berger, Schumann, Dachselt and Tominski built Responsive Matrix Cells (IEEE TVCG 27(2), 2021) as a focus-plus-context technique specifically for EDITING matrix cells. The defensible reason is different and narrower. Yang, Xia, Lekschas, Nobre, Krueger and Pfister (CHI 2022) compared techniques inside matrices and found plain panning and zooming faster than a fisheye lens. So build panning and zooming, which is free, and skip the lens.

### Toggleable

Three controls, no more.

- Marks only, or marks with gridlines.
- Cross-highlight on or off.
- Full detail, or reduced detail above a size threshold.

Cross-highlight has a precise rule. Hovering a CELL highlights its row and its column. Hovering a row or column LABEL highlights that one axis only. The Okoe study states plainly that marking both the row and the column for the same NODE confuses users, and cites two earlier papers for it. An earlier pass proposed a full cross on every hover plus dimming everything else. The node half did not survive, and the dimming half has no source at all.

All three controls are named categories rendered as buttons. No sliders. That is owner law, recorded in the interface guidance on 2026-08-01: a slider implies a continuum and a total order, and most such controls were really a set of named categories.

### Where hide-empty DOES belong

Offer hide-empty-COLUMN on the attribute tables, which is the exact view an earlier pass ruled out of scope. Measured across the 50 rows: the `comment` field is filled in 0 of 50 rows, so the "Open review comments" view renders zero rows today. The `seeds` field is 4 of 50, `floor` is 4 of 50, `runs` is 3 of 50, and `command`, `edge_role` and `guard` are 1 of 50 each. A column at 2% occupancy is sparser than the adjacency matrix. Rows always stay; only columns collapse.

## 5. What our data actually looks like

Every number in this section is my own measurement, taken from the repository as it stands.

### The dependency graph

The rigor matrix rows form a graph of 50 nodes and 58 edges in 2500 cells: 2.320% dense. There are no unresolved references.

- All 58 marks sit strictly below the diagonal in file-name order. The authored order is already a valid topological order.
- Bandwidth is 4. Mean absolute offset is 1.500.
- The offset histogram is 39 marks at offset 1, 12 at offset 2, 4 at offset 3, and 3 at offset 4. An earlier pass reported 38, 14, 3, 3. That did not survive.
- Out-degree: 1 row has none, 43 have one, 3 have two, 3 have three.
- In-degree: 2 rows have none, 40 have one, 6 have two, 2 have three.
- There are 41 topological levels, the widest holding 3 rows, mean width 1.22. Exactly 8 levels hold more than one row. An earlier pass said 9; that did not survive.
- One edge is transitively redundant. The dependency from `gate-validation` to `fill-story-evidence` is already implied through `sweep-consistency`.

The shape is a chain. Two-thirds of the marks say nothing but "the next step".

### The compiled column is not acyclic

The raw dependency data has zero back-edges. The machine that actually runs does not. The row `M7_60_fix-findings.md` carries `edge_role: fallback` and the guard `verification_attempts < 3`. The compiler at `deliverable/engine/rigor-matrix.ts` lines 242-247 pushes the fallback edge and then pushes a `recovery` edge back to the dependency, with the comment "The recovery edge closes the loop back to the dependency." So every compiled column contains a two-state cycle. An earlier pass reported zero cycles without qualification. That did not survive.

### The state machines

There are seven canvas files holding 30 state nodes and 23 drawn edges. Text cards and group boxes are not states, and no edge touches one. Earlier passes reported 39 nodes, 15 states for the main machine, and 13 states for the main machine. None of those survived; the main machine has 12 state nodes.

The main machine compiles differently from how it is drawn. Eight of its eleven edges carry `fromEnd: "arrow"`, which is a double-headed arrow. The compiler at `deliverable/engine/machines/compile.ts` lines 265-266 synthesises a matching return edge for each one. Compiled, the main machine is 12 states and 19 edges.

- No machine in this repository is 1-3% dense. Measured: boot 18.75%, ideation 13.89%, main 13.19% compiled, and the four two-state stubs 25% each.
- The main machine is a STAR, not a chain. The `idle` state carries 10 of the 22 edge endpoints, or 45.5%.
- Tarjan's algorithm on the compiled main machine returns exactly one non-trivial strongly connected component, holding 9 of the 12 states. Every double-headed arrow shares `idle`, so they merge into one irreducible block covering 75% of the machine.

Sparsity here is a consequence of SIZE, not of structure. At about one edge per state, density is simply one divided by the number of states. The 1-3% regime arrives only near 50 to 100 states, and the largest machine that exists today has 12.

### The grids that are actually rendered

- The rigor tailoring table is 50 rows by 5 columns: 250 of 250 cells filled. The values are 139 `full`, 65 `tailored`, 42 `none` and 4 `inherit`.
- The voice matrix is 10 rows by 7 lanes: 70 of 70 filled.
- Both are defined in `matrix.base` files as table views over frontmatter fields. Neither is an adjacency view.

One correction to an earlier source citation. It attributed the five columns to the constant `CHANGE_COLUMNS` at line 17. That constant holds four columns. Line 18 defines `ALL_COLUMNS`, which adds `specification` to make five. The arithmetic was right; the name was wrong.

The tailoring table is also more compressible than it looks. Across 50 rows there are only 16 distinct patterns, and the top four cover 25 rows. Two of the five columns are near-constant: `major` is 46 `full` and 4 `tailored`, and `product` is 48 `full` and 2 `tailored`.

### The two cross-domain mappings, which invert the owner's premise

A domain-mapping matrix maps one kind of thing against a different kind. The repository already contains two, derivable from fields the loader already parses.

States against permitted tools is 50 rows by 16 columns: 800 cells holding 399 marks, or 49.88% DENSE. Its occupancy is sharply banded. Six tools appear in 48 of 50 rows. Two more appear in 39. Then comes the tail that carries the information: `se_run` in 8 rows, `se_web_search`, `se_web_fetch` and `se_git` in 5 each, `se_lint` in 4, and `se_survey`, `se_note_drain` and `se_test` in 2 each. There are 11 distinct row signatures. This grid earns its shape.

States against evidence kinds is the opposite failure: 50 rows by 121 columns, 6050 cells holding 122 marks, at 2.02%. Only one evidence name appears in more than one row. All 50 row signatures are distinct. There is no column to read down, so this should never be drawn as a grid at all.

### What that implies

The owner's premise, that most of our matrices will be sparse, does not survive. The population is four different shapes: two grids at 100% density, one mapping at 49.88%, one adjacency graph at 2.32%, and one degenerate mapping at 2.02% that is a list wearing a grid. One global sparse-mode toggle is the wrong control surface for that population.

## 6. What to build first

Build the shape probe. It is one function, it renders nothing, and it is about 60 lines.

Given a set of rows and a field name, it returns:

- rows, columns, cells and marks
- density
- bandwidth under the authored order, and whether that order is topological
- the count and size of strongly connected components
- the maximum and minimum column occupancy
- the number of distinct row signatures

From those it prints one verdict line naming the renderer the grid deserves. A grid with few distinct row signatures and a banded occupancy profile is a matrix. A grid where almost every column appears once is a list. A grid whose marks all sit within a few positions of the diagonal is a sequence.

That probe would have answered this entire question in an afternoon, and it would have caught the thing four research strands walked past: that the sparse artefact is not the one being drawn.

Build second, once the probe reports something worth ordering: the Tarjan and Kahn validator from section 3, with the tie-break pinned to authored file order.

Build nothing else yet. Specifically, do not build the band viewport, hide-empty on adjacency grids, Reverse Cuthill-McKee, hierarchical collapse, a fisheye lens, or any of the hybrid representations. NodeTrix exists for graphs that are globally sparse but locally dense, and with a maximum degree of 3 we have no dense neighbourhood anywhere. BioFabric's documented wins begin above 100,000 edges. Quilts pays off when layers are wide, and ours average 1.22 states.

## 7. What this does not solve

These are open. Treat each as unknown, not as settled.

- No performance number exists anywhere in this project. Every cost in this document is derived from a complexity bound. Nobody has measured a real render or a real reorder.
- The density at which a matrix stops paying is unknown. The evidence brackets it between 0.016 and 0.2, and nobody has measured the interval between. The two bracketing studies also differ in whether their matrix was reordered, which confounds density with row order.
- No study used a near-linear directed acyclic graph. The evaluated graphs were random, scale-free, engineering connectivity models, or layered with wide layers. Our shape is more extreme than anything tested. Every transfer here is argument, not measurement.
- No study compared a plain LIST against a matrix with sighted readers. The only list condition found is Yang, Marriott, Butler, Goncu and Holloway (CHI 2020), which is tactile with 8 blind or low-vision participants.
- Ghoniem's density formula was not confirmed from the paper in this work. One pass reported extracting it; it was not independently reproduced here. Until someone reads the 2005 journal version directly, state the gap as "four to nine times denser", never "an order of magnitude".
- The survey written specifically to tell you which reordering algorithm to pick could not be read by anyone on this work. Behrisch, Bach, Henry Riche, Schreck and Fekete, "Matrix Reordering Methods for Table and Network Visualization", Computer Graphics Forum 35(3), pages 693-716, 2016. The citation is confirmed; the content is not. Every mirror is a PDF that the fetch tooling returns as raw bytes.
- Jacques Bertin's own writing was not read by anyone. All claims about the reorderable matrix as a method are second-hand from Perin, Fekete and Dragicevic (Cartography and Geographic Information Science 46(2), 2018). Note the author order: an earlier pass had it as Perin, Dragicevic and Fekete, which did not survive.
- The Compressed Adjacency Matrices paper could not be obtained. Dinkla, Westenberg and van Wijk, IEEE TVCG 18(12), pages 2457-2466, 2012. Its citation is confirmed from the Okoe bibliography. Its stated precondition — directed, low bounded in-degree, few small cycles — describes a state machine almost exactly. If a matrix-shaped sparse mode is ever insisted on, this is the paper to obtain.
- ReorderBench does not state the densities of its generated matrices, and it generates symmetric matrices only. Its band and star scores are therefore indicative for our patterns, not decisive for a directed machine.
- The reorder.js licence variant is unconfirmed: BSD-2-Clause and BSD-3-Clause were both reported. It is permissive either way.
- The 100-state hand-edited machine is entirely hypothetical. The largest machine that exists has 12 states and is a star. Every projection to 100 states assumes the topology scales, and that is exactly the assumption that measurement destroyed for the band pattern.
- Nothing enforces that the file-name order stays topological. It holds today only because milestone numbering happens to agree with dependency order. No test asserts it. If someone adds a dependency that violates it, the grid silently stops being triangular and nobody is told.
- Nobody established who asked for a sparse mode, or for which artefact. Given that no adjacency view exists, that should be settled before any of this is commissioned.
