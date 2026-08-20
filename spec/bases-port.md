---
statement: Can we port Obsidian Bases to TypeScript and render it in VS Code markdown, as one central view layer for matrices and everything else?
---

# Porting Bases: the answer

## 1. The answer

It is portable. We should not port Obsidian Bases. We should port OUR OWN evaluator, which already exists.

Obsidian Bases — the query-and-table feature built into Obsidian — is closed source. "Porting" it always meant reimplementing it from documentation. But version 1 of this system already did that once. `engine-go/base.go` at git ref `main` is a 943-line pinned-subset Bases evaluator in Go with zero external dependencies, written by the owner. Version 1 shipped 48 `.base` query files. It already rendered both embedding forms the request asks for. So the real work is a Go-to-TypeScript port of a known quantity.

Two hard limits shape everything after that. A design structure matrix is a states-by-states grid, DSM for short. Bases cannot produce one, in any version, so that part is ours regardless. And a view embedded in a VS Code markdown preview can be interactive but cannot be connected. A paginated matrix that talks to our engine therefore needs our own webview, which we already have.

## 2. What Bases actually is

### The implementation is not readable

Bases is a closed-source core plugin of Obsidian, a proprietary commercial application. There is no source to fork.

The npm package `obsidian` version 1.13.2 is MIT-licensed but ships type definitions only. Its `package.json` declares `"main": ""` and `"types": "obsidian.d.ts"`. No implementation is included.

The proof that the engine is deliberately withheld sits at `obsidian.d.ts` line 5315. `QueryController` — the object every custom view is constructed from — is declared with an entirely empty class body. Its own docstring says it is "Responsible for executing the Bases query and evaluating filters and formulas." The behaviour is advertised and the code is withheld.

Only the file format is public, in Obsidian's own help repository. We reimplement against the format. We can never lift the code.

### The file format

A `.base` file is YAML with exactly five top-level keys. There is no `from` or `source` clause. The help text states it plainly: "By default a base includes every file in the vault." Filters narrow that set.

The five keys are:

- `filters` — a recursive tree of `and`, `or` and `not` over expression strings.
- `formulas` — named computed columns.
- `properties` — per-property display settings, mainly `displayName`.
- `summaries` — named aggregate expressions.
- `views` — the list of rendered views.

Global `filters` and per-view `filters` are concatenated with a logical AND.

This is the canonical complete example, verbatim from Obsidian's help repository:

```yaml
filters:
  or:
    - file.hasTag("tag")
    - and:
        - file.hasTag("book")
        - file.hasLink("Textbook")
formulas:
  ppu: "(price / age).toFixed(2)"
properties:
  status:
    displayName: Status
views:
  - type: table
    name: "My table"
    limit: 10
    groupBy:
      property: note.age
      direction: DESC
    order:
      - file.name
      - formula.ppu
    summaries:
      formula.ppu: Average
```

### The expression language

Operators are ordinary. Arithmetic is `+ - * / % ( )`. Comparison is `== != > < >= <=`. Boolean is `! && ||`.

Property references are namespaced by a prefix of `note.`, `file.` or `formula.`. A bare name defaults to `note.`.

The function library holds 68 documented entries across types, which reduce to 58 distinct names. The first research pass said "roughly 60". The verified count is 58 distinct, and that pass understated it.

Three functions take BARE EXPRESSIONS rather than lambdas, with implicit bindings:

```
[1, 2, 3, 4].filter(value > 2)   returns [3, 4]
[1, 2, 3, 4].map(value + 1)      returns [2, 3, 4, 5]
[1, 2, 3].reduce(acc + value, 0) returns 6
```

This is call-by-name. It is the single largest structural constraint on any interpreter. A straightforward evaluator that evaluates its arguments first cannot implement this language.

### The documentation is not a specification

The first research pass concluded that "the documented behaviour is complete enough to reimplement." That claim did not survive verification.

Three independent documentation defects were verified:

- The function reference asserts that `5.isEmpty()` returns `false` and `123.toString()` returns `"123"`. An independent implementation rejects both with a parse error. The same page silently switches to `(2.5).round()` form elsewhere. Whether Obsidian itself accepts the bare form is UNKNOWN — nobody had a running Obsidian to test against.
- The official `summaries` example calls `values.mean()`. That function appears nowhere in the function list.
- The two official pages disagree on the file-property set. One lists 13 properties including `file.backlinks` but omits `file.basename`. The other lists 11 including `file.basename` but omits `file.backlinks`. Neither is a superset of the other.

The published type definitions are also partial rather than authoritative. `BasesConfigFileView.groupBy` is declared as an empty object literal, and `limit` has no field at all despite appearing in the official example.

### View types and embedding

Four view types ship. Table and cards arrived in Obsidian 1.9, list and map in 1.10, and map additionally requires the Maps plugin. Plugins can register more view types through `registerBasesView`, available since 1.10.0.

Two embedding forms exist, and both are officially documented:

- Transclusion of a separate file: `![[File.base]]`, or `![[File.base#View]]` to pick a named view.
- An inline fenced code block tagged `base`, containing the same YAML with no separate file.

The first research pass listed the fenced block as observed-but-undocumented. Verification found it documented in Obsidian's own "Create a base" help page, so that gap is closed.

### The data model refuses matrices

Bases hands a view a flat or singly-grouped list of file rows. `BasesQueryResult` exposes `data: BasesEntry[]` and `groupedData: BasesEntryGroup[]`. Each entry is one file.

Grouping is single-property only. Obsidian's help says so directly: "Currently, Obsidian supports grouping by only one property."

A design structure matrix needs cells indexed by row state and column state. Nothing in Bases produces that. The owner's own version 1 file `spec/queries/vv-matrix.base` records the collision in a comment. A `groupBy` over a multi-valued property "fans a multi-requirement test into duplicate rows - a render error." That is not a bug to fix. It is the shape of the model refusing the shape of the problem.

### The format is not a stable target

Obsidian 1.9.2 in June 2025 shipped breaking changes to Bases, overhauling both the formula syntax and the `.base` file format. This is single-sourced secondary reporting, not verified against Obsidian's own changelog, so treat it as reported. It is consistent with the owner's own version 1 decision to PIN a subset and fail loudly outside it.

## 3. Can VS Code render a view inside markdown

### Yes, and it is cheap

The mechanism is one contribution point plus one exported function. VS Code hands the extension its own markdown parser instance, so no parser dependency is needed.

```json
"contributes": {
    "markdown.markdownItPlugins": true
}
```

```ts
export function activate(context: vscode.ExtensionContext) {
  return {
    extendMarkdownIt(md: any) {
      const fence = md.renderer.rules.fence;
      md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        if (tokens[idx].info.trim() === 'se-view') {
          return renderView(tokens[idx].content, env.currentDocument);
        }
        return fence(tokens, idx, options, env, self);
      };
      return md;
    }
  };
}
```

The return value of `activate()` IS the registration. Returning nothing contributes nothing, silently.

This is exactly how the Mermaid diagram extension worked before Microsoft merged it into VS Code as a built-in in version 1.121.

### It renders into the preview pane, never the editor

The markdown preview is a webview with its own Content Security Policy, or CSP — the browser rule that decides what a page may load and run. The default policy is generated fresh per render with a nonce:

```
default-src 'none';
img-src 'self' ${rule} https: data:;
script-src 'nonce-${nonce}';
style-src 'self' ${rule} 'unsafe-inline' https: data:;
```

Three consequences follow directly.

Inline styles WORK, because `style-src` carries `'unsafe-inline'`. Per-cell colouring and sticky headers need no JavaScript at all.

Scripts written into the markdown source NEVER run. The preview re-creates script tags preserving only a fixed attribute set, so source-authored scripts have no nonce and the policy kills them. Only extension-contributed preview scripts get the nonce injected.

Network access is blocked at every security level except "Disable". There is no `connect-src` directive, so it falls back to `default-src 'none'`. The preview webview is also created without port mapping. Our engine on `http://localhost:7333` is unreachable from a rendered markdown block.

### How interactive it can be

Interactive yes, connected no. Contributed preview scripts run with the nonce injected. Over data already in the page, these all work:

- Click handlers.
- Sorting.
- Filtering.
- Paging.

The first research pass claimed interaction state survives editing elsewhere in the document. That did not survive verification, and the correction matters for a paginated matrix.

The preview applies updates with a DOM-diffing library. Its skip test compares the LIVE, script-mutated DOM against the freshly rendered pristine HTML. Any class added, row hidden or element injected makes them unequal, so the diffing library patches the widget back to pristine. This happens on every re-render, meaning every edit anywhere in the document, debounced at 300 milliseconds. The only element explicitly preserved is an open `<details>`.

State must therefore be held in a JavaScript variable OUTSIDE the DOM, and re-applied when the preview fires its re-hydration event:

```js
window.addEventListener('vscode.markdown.updateContent', rehydrate);
```

Four further constraints were verified and are worth carrying:

- The fence rule is SYNCHRONOUS. It must return a string immediately. Data must be pre-cached by the extension host and read synchronously.
- A fence rule returning raw HTML discards the source-map attributes the preview sets on tokens. Scroll-sync and double-click-to-source break over the view unless the wrapper emits `class="code-line" data-line="..."` itself.
- An extension contributing only markdown-it plugins gets NO local resource root. Images pointing at the extension folder are blocked until at least one preview style or script is also contributed.
- Forms are disabled. The webview is created with `enableForms: false`.

Two mechanisms the first pass missed both help us:

- The fence rule's fourth argument carries `currentDocument`, the URI of the file being rendered. Without it, vault-relative queries cannot resolve.
- `markdown.preview.refresh` is a real command that clears the token cache and refreshes every open preview. The extension host can watch files and push a re-bake. This turns "baked once" into "re-bakeable on demand", at the cost of losing script state.

### The verdict for a paginated collapsible matrix

A static, colour-coded, scrollable matrix with clickable cells lives happily in a markdown preview. Links work with no JavaScript, through the preview's own click handler.

A paginated matrix that pages over data too large to inline, or reflects a live walk, does NOT. It needs our own webview.

The escape hatch, if we ever want it, is a custom text editor registered on `*.md` with `priority: "option"`. The file on disk stays plain markdown and edits round-trip through a workspace edit. The first pass argued Microsoft is shipping two of these as the sanctioned shape. That argument is weaker than claimed. `vscode.markdown.editor` shipped in VS Code 1.131 built on a package that parses with micromark, not markdown-it, so contributed markdown-it plugins do NOT apply inside it. Its per-editor-kind `priority` object also needs a proposed API we cannot use. Take the pattern, not the syntax.

## 4. Dataview and the other prior art

### Dataview

Dataview is the MIT-licensed TypeScript predecessor to Bases, with 9,200 GitHub stars. It is effectively dormant. The latest release is 0.5.70, published 2025-04-07, with the last commit a day later. That is about sixteen months idle.

Its useful contribution is a shape, not code. Its headless query call returns exactly the right seam for one central view layer:

```ts
public async query(source: string | Query, originFile?: string, settings?: QueryApiSettings)
    : Promise<Result<QueryResult, string>>

export type TableResult = { type: "table"; headers: string[]; values: Literal[][]; idMeaning };
```

Build the engine to return that object and a table, a matrix and a list become three consumers rather than three systems.

The first research pass costed Dataview's query language as "copyable in an afternoon". That did not survive. It measured only the abstract syntax tree file at 122 lines and never opened the expression directory. The verified language surface is 2,952 lines across eight files. The single largest file registers roughly 70 built-in functions in 972 lines, each dispatching across a value lattice of eleven types. Operator-times-type coercion lives in its own file again. The abstract syntax tree is four percent of the language.

Dataview also cannot be lifted whole. Its index does not walk the filesystem. It consumes Obsidian's own metadata cache and subscribes to Obsidian's file events. That layer would have to be built.

### Foam

Foam is an MIT-licensed TypeScript extension that ALREADY does the fenced-block trick inside VS Code, offline, under the exact CSP in question. Its `foam-query` blocks render as live tables over frontmatter in the markdown preview. Its fence hook is the reference blueprint, and it is thirty lines.

The first research pass concluded that Foam solves the rigor matrix and ordinary frontmatter views outright. That did not survive contact with our data.

Two verified defects block it:

- Its field resolver splits a dotted path on the FIRST dot only, then uses the remainder as a single key. One level of nesting, no more.
- Its renderer collapses any array with `value.join(', ')`.

Our rigor matrix rows carry `evidence` as an array of objects. Foam renders that column as `[object Object], [object Object]`. Scalar columns and plain string lists would render fine.

Its output format is also a closed TypeScript union of `'table' | 'list' | 'count'`. There is no registration hook. A matrix format requires forking it.

The one thing worth stealing from Foam is a decision, not code. Its whole query engine is 1,392 lines — roughly half Dataview's — because it does NOT own an expression language. It delegates to Jexl, a small sandboxed expression library, and it deliberately REMOVED its former JavaScript field for security reasons.

### What does not help

- Logseq is AGPL-3.0 licensed ClojureScript. The licence alone disqualifies reuse.
- SilverBullet is MIT TypeScript and maintained, but is a Deno server application, not a VS Code fit.
- Both prior attempts to port Dataview to VS Code are dead. One has two commits, the last in January 2023.

### The design structure matrix has no library at all

GitHub's `design-structure-matrix` topic returns exactly four repositories. All four are Java, C# or Python. There is no JavaScript or TypeScript DSM library.

The reordering half exists. `reorder.js` version 2.2.6 is BSD-2-Clause licensed and maintained, and supplies seriation algorithms. It explicitly does NOT do DSM partitioning. There is no strongly-connected-component decomposition, no triangularization and no tearing in its source tree.

The partitioning core is small enough not to need a library. A strongly connected component is a group of states that all reach each other, so it cannot be ordered internally. Tarjan's algorithm finds those, condensation collapses each into one node, and a topological sort orders the result. That is about 100 lines of TypeScript. `graphology-components` is MIT and supplies the component step if we want it.

None of that is a rendering problem. A 50-by-50 matrix is an HTML table with inline styles, which the strict CSP explicitly permits.

## 5. What we already have

### Version 1 built this and it works

`engine-go/base.go` at git ref `main` is 943 lines. I read its header and confirmed its size directly. It calls itself "the pinned-subset Obsidian-Bases evaluator". Its `go.mod` is three lines with no dependencies.

It hand-rolls three things a port must reproduce:

- A YAML subset parser.
- A tokenizer.
- A four-level recursive-descent precedence parser, running or, then and, then comparison, then primary, then call.

Its pinned subset is broader than the first research pass described. It supports four view keys the first pass omitted:

- `order`
- `sort`
- `limit`
- `groupBy`

It accepts `groupBy` as either a bare scalar or the documented object form. The bare-scalar form is what all 48 version 1 files actually use. The official documentation shows only the object form.

It also carries a law the first pass never mentioned. Volatile functions `now()` and `today()` REFUSE BY NAME, because byte-identical regeneration is contractual. Any port inherits that.

`engine-go/book.go` already renders both embedding forms, through two committed regular expressions. I read them. One matches `![[name.base#View Name]]`. One matches an inline fenced block or a pooled embed.

Version 1 also crossed the hardest boundary: a two-pass evaluation with a link graph. The bare property `referenced` is true only where the emitter's link graph marks an item used. Queries using it DEFER behind a placeholder token until the whole chapter pass has built the graph. That is a rendering pipeline, not a function.

Counts I verified myself with `git ls-tree`:

- Version 1 (`main`) holds 48 `.base` files.
- Version 2 (`v2`) holds zero.
- The version 3 working tree holds two.

### matrix.base exists, and nothing reads it

`deliverable/tests/fixtures/rigor-matrix.base` is a real 95-line Bases file. I read it in full. It declares 14 properties with display names and five views, all of type `table`, all filtering `kind == "matrix-row"`. There is a second one for the voice matrix.

Obsidian's Bases plugin is switched on in this repo's vault, at `.obsidian/core-plugins.json`.

No engine code reads a `.base` file. A repo-wide search returns eight hits, all in a decisions log or in prose comments. The rigor matrix therefore has exactly ONE renderer today, and it is Obsidian. The mirror on `localhost:7333` cannot show the matrix at all. That is the whole gap.

### The two generations are already incompatible

Version 1 pins top-level keys to `filters` and `views` only, and refuses anything else by name. Version 3's `matrix.base` opens with a top-level `properties:` block and puts `filters` inside each view.

Version 1's evaluator would refuse today's file as out-of-subset. The port starts by widening the subset. It is not a lift-and-shift.

### Two defects to fix while we are here

- `deliverable/tests/fixtures/voice-matrix.base` line 39 lists `- COMMENT` in its `order:` block. The property is declared and filtered as lowercase `comment` in the same file. The column will render empty. Both matrices' "Open review comments" views are currently dead anyway, because no row carries a `comment:` key yet. The bug is latent and will surface at the next review round.
- `deliverable/machines/panels/controls.md` documents only three parameter types under its Types heading. The renderer handles five. The refusal message names five, and its remedy points the author at the section that names three.

### Is a Bases layer and the panel spec one idea or two

Two ideas on the read path. One idea the moment cells become editable.

A panel is ONE record across N typed controls. A base is N records across M columns. Neither can express the other. On the read path they do not fight.

They collide on editable cells, and that collision is unavoidable. Both matrix README files justify flat scalar cells specifically so that "a Bases table edits a cell inline and cannot edit a nested map". The design leans on inline editing.

The moment a ported base cell is editable, it IS a control. It needs exactly the type-to-widget mapping the panel renderer already owns:

```ts
switch (p.type) {
  case "rungs":  return renderRungs(p, v);
  case "int":    return renderInt(p, v);
  case "action": return renderAction(p);
  case "text":   return renderText(p, v);
  case "choice": return renderChoice(p, v);
  default:
    throw new Rejection({ /* an unknown type is a refusal, never a guess */ });
}
```

Our `applies` cell takes one of four values: `full`, `tailored`, `inherit` or `none`. That is the panel's `choice` type verbatim.

The clean resolution is subordination. A base column declares a parameter TYPE, and the cell editor calls the existing renderer. Building a separate cell-widget vocabulary would give this repo two answers to "what draws an enum".

### What the CSP constraint actually is here

The brief's strict-CSP premise is already dissolved for our own surfaces. The VS Code extension's webview is a thin shell whose CSP is:

```
default-src 'none'; frame-src http://localhost:7333; connect-src http://localhost:7333;
script-src 'unsafe-inline'; style-src 'unsafe-inline'
```

Its body is an iframe onto the engine's own HTTP server. Views run at localhost origin, not as CSP-restricted webview assets. The nonce wall binds only the markdown preview.

Offline third-party JavaScript is already solved by precedent. The engine serves a vendored element library at `/vendor/vscode-elements.js`, resolved from the engine's own `node_modules`. That costs one route and one script tag. There is no bundler and no content delivery network.

One thing that is NOT currently true: this CSP allows `frame-src` and `connect-src` to a local server. Strict offline is a CHANGE, not a preservation.

### The DSM data source is unknown

The first research pass and the verification disagree about what the design structure matrix is even over, and neither settled it.

Two candidate data sets exist:

- The 50 rigor matrix rows. Their `depends_on` frontmatter gives 50 nodes and 58 edges over 2,500 cells, which is 2.32 percent dense. Ninety-eight percent of that matrix is blank.
- The 14 machine states. These carry NO transition keys in frontmatter at all. Their edges live in JSON Canvas files, authored in Obsidian with the Advanced Canvas plugin, and read by `deliverable/engine/canvas.ts`.

Which one the owner means is UNKNOWN, and it changes the design. If it is the rigor rows, frontmatter is the source and one adapter suffices. If it is the state machine, the view layer needs a SECOND, non-markdown adapter on day one.

The version 3 working tree also contains no `.canvas` file that I or the verifiers could locate. Where the state machine's current edge data physically lives is UNKNOWN.

### What we do not have

`compileColumn` in `deliverable/engine/rigor-matrix.ts` contracts dependencies transitively through struck rows, memoized, with a cycle guard. The first research pass called this "DSM partitioning's hard half". That did not survive. On a cycle it returns an empty list, silently breaking the loop. Partitioning must IDENTIFY the strongly-connected block instead, and banding needs topological levels. Neither exists.

We do already have a central view layer, which is the thing that reframes this whole question. `deliverable/engine/render.ts` is 155,708 bytes and exports `renderMirror(...)` into the extension's webviews. `deliverable/engine/rigor-matrix.ts` already parses all 50 rows into typed columns. Adopting Foam or forking its engine would REPLACE working code under a weaker field model.

## 6. The recommendation

Build the seam inside `engine/`, over our own data, and reuse what already parses. Do not adopt Foam. Do not port Dataview. Do not chase Bases feature parity.

Order of work, each step useful alone:

1. **Answer one question first, before any code.** Is the design structure matrix over the 50 rigor rows or over the 14 machine states? This costs one sentence from the owner and it decides whether the view layer needs one adapter or two.
2. **Serve the rigor matrix on the mirror as a static table.** This is the smallest useful step and it stands alone. `readRigorMatrix` already returns typed rows and columns. It needs a route and a renderer, no query language at all. The matrix becomes visible outside Obsidian for the first time.
3. **Add the markdown fence, read-only.** A named view, `se-view rigor`, rendered by the same code. Roughly 15 lines of contribution plus a fence rule. Views appear in ordinary VS Code previews with no ceremony.
4. **Add the design structure matrix as a second named view.** Tarjan plus condensation plus topological sort is about 100 lines. Rendering is an HTML table with inline styles. No library exists and none is needed.
5. **Port `base.go` only if step 2 proves the demand.** Widen the pinned subset to accept version 3's top-level `properties:` block. Keep the determinism law that refuses `now()` and `today()`.
6. **Make cells editable last, and only through the panel renderer.** A base column declares a parameter type. The cell editor calls `renderChoice` and its siblings. This is the piece version 1 never had.

Ship NAMED VIEWS, not a query language. Three hardcoded renderers over known schemas is days of work. A `where:` clause that accepts arbitrary expressions is the fortnight that becomes a quarter, and Dataview's 2,952 lines are the receipt.

Two design rules to hold from the start:

- Keep the pivot-and-render layer free of any Obsidian type. If we ever want the same matrix inside Obsidian through `registerBasesView`, that one decision buys both targets from one codebase.
- Reject anything outside the pinned subset LOUDLY, naming the construct. Version 1 already learned this. Quiet divergence from Obsidian is worse than a refusal, because the owner previews in Obsidian and would not see it.

## 7. What this costs, and what it does not solve

### The costs

- **The expression language, if we build one.** Version 1 needed 943 lines with zero dependencies. Dataview needed 2,952. This is the classic underestimate and our own history is the evidence.
- **YAML is a real dependency.** The rigor rows use block scalars, nested sequences of mappings and quoted strings containing colons. The engine already depends on the `yaml` package version 2.9.0, so this costs nothing new here — but "zero dependencies" was wrong.
- **A dual-renderer contract, permanently.** If the owner keeps previewing in Obsidian, every extension must be invisible to Obsidian and still correct in our engine. Version 1 paid this twice, with `render: full` degrading to a plain table and `referenced` previewing a superset. Every future view feature must be designed twice.
- **Format drift.** Obsidian broke the `.base` format once already. Pinning a subset is the only defence, and it means refusing constructs the owner may write in Obsidian and expect to work.
- **Synchronous filesystem work on the extension host.** Reading and parsing 50 to 143 files inside a sync fence rule, on every debounced keystroke, blocks the host that also serves language features. Cache in the host and invalidate on a file watcher. This is not optional.
- **Inline cell editing is genuinely new.** Version 1 never had it. Obsidian gives it free. This is the hardest single piece and the one the matrix design leans on hardest.

### What it does not solve

- **A live connection from a markdown preview to our engine.** Blocked by design, twice closed as intended by Microsoft. No network, no port mapping, no command URIs. Everything a preview block shows must be baked in at render time.
- **Rendering inside the text editor itself.** Decorations give a plain string or an image with broken line height. The webview inset proposal has been open since 2019 with nothing shipped.
- **Bases feature parity.** Link resolution behind `hasLink`, `backlinks` and link equality is completely undocumented and requires reimplementing Obsidian's wikilink resolver plus a maintained backlink index. Date formatting is specified as taking Moment.js format strings. Neither is needed by our two files today. Both are the boundary where "reimplement Bases" stops being cheap.
- **The owner's own rule against inline fences.** Version 1's method says plainly: "An inline ```base block in a manifest is a smell — pool it and reference it." The request asks for embedded views. The engine supported the fence anyway. This is a live contradiction and the owner should resolve it, not us.
- **Any performance question.** Nothing was measured, in any strand, by anyone. There is no figure for indexing time, for a 50-by-50 table under the preview's DOM diffing, or for our own matrix read. Every performance statement in the underlying research is inference or someone else's marketing.

### Marked unknown

- Whether Obsidian itself accepts `5.isEmpty()`, which its own documentation asserts and an independent implementation rejects.
- Whether a plugin-registered custom view type renders inside an embedded fence or a transclusion. The evidence is strong that it does, since the custom-view config API explicitly specifies embedded behaviour, but nobody proved it.
- Whether the design structure matrix is over the rigor rows or the machine states.
- Where the version 3 state machine's edge data physically lives today.
- Whether the `nested-properties` Obsidian plugin extends the Bases TABLE cell editor, as opposed to only the properties side panel. This matters, because the flat-scalar constraint shaping both matrices rests on that exact limitation.
