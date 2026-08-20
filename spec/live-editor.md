---
statement: Can we build an Obsidian-style live editing view — edit in the rendered view, source revealed under the cursor — as a VS Code webview custom editor, offline and with no build step?
---

# The live editor: the answer

## 1. The answer

Yes, and the shape is fixed. Build it as a CUSTOM TEXT EDITOR — the VS Code extension point where our own web page replaces the whole editor tab while the file behind it stays an ordinary text document. Inside that page run CodeMirror 6, the browser text-editor library that Obsidian itself uses. Serve CodeMirror 6 from our own engine over localhost as plain npm files plus one browser import map — a small block of JSON that tells the browser where each package name lives. No bundler. No build step. No network.

This is verified running, not argued. Eleven CodeMirror packages loaded inside a real VS Code webview on this machine, behind the extension's exact security policy shell. The webview reported `Code/1.131.0 Chrome/148.0.7778.280 Electron/42.7.0`. Markdown highlighting rendered, the cursor revealed the source of a bold run and a code fence, and one write-back fired with the correct text. Last byte at 187 milliseconds.

The ask splits into a cheap half and an expensive half, and they must be priced apart. The cheap half is Obsidian's Live Preview proper. The document IS the markdown, markup characters are hidden by view-only decorations, and the source reappears where the cursor sits. Saving that is handing back the document text — no serializer, no data loss, lossless by construction.

The expensive half is editing INSIDE a rendered block. Click a table cell, type in it, have it write back. That needs a hand-built editor per construct plus a markdown serializer per construct, and every serializer rewrites the user's own formatting on first click. Ship the cheap half first. Build exactly one editable construct end to end before committing to the rest.

## 2. Why it cannot live in the text editor

The VS Code text editor is Monaco, and no extension ever gets a handle on it. Verified: the extension type definitions file `vscode.d.ts` is 742,072 bytes at both the project's main branch and at tag 1.131.0, and contains zero occurrences of "monaco" and zero of "codicon". Extensions reach the editor only through document, decoration and provider interfaces.

Four inline affordances exist. None of them can host arbitrary interactive content.

- Text decorations. Before-and-after attachments carry `contentText` (one string) or `contentIconPath` (one image URI), never both. These are literal CSS string interpolation — the source maps `contentText` to `content:'{0}';` and truncates it to the FIRST LINE. No document object model, no event handlers.
- CodeLens. A range plus a command, drawn on its own horizontal line between lines of source. Never inline.
- Inlay hints. Label parts carrying a tooltip, a location and a command. The parts with commands render as clickable links. Still text.
- Comment threads, created with `createCommentController`. This one IS stable and IS an interactive zone widget anchored to a range. But VS Code fixes its shape: a markdown body, a reply box, buttons. Author-controlled HTML is not on offer.

One escape hatch exists and it is a dead end. Decoration properties are interpolated into CSS with no sanitising, so setting `textDecoration` to `"none; display: none"` conceals a range. That buys the hide-the-markup half of Live Preview. Nothing can be drawn in its place except one line of generated content or one image, and that image does not affect line height. Microsoft closed the request to fix that (issue 247366) as not planned in February 2026.

The one true inline webview is `window.createWebviewTextEditorInset`. It is a PROPOSED API, opened on 27 November 2019 as issue 85682, still open, milestone "Backlog", no assignee, six years and eight months later. Mechanically it is a Monaco view zone: a full-width band AFTER a line, with height measured in whole lines. It cannot sit inside a line. It cannot replace a range. Its find widget is hard-disabled in source. It disposes itself whenever its editor leaves the visible set, so the extension must recreate every inset on every tab switch. It cannot be published to the marketplace.

So the Obsidian experience cannot be grafted onto the text editor. It can only be had by owning the surface.

## 3. The mechanism we would copy

Obsidian's editor is CodeMirror 6, and its Live Preview is one small recipe that has been independently reimplemented at least four times in public code.

1. Walk the syntax tree over the visible range.
2. Test each node's range against every range in the current selection.
3. For nodes the selection does NOT touch, emit a replacing decoration — either a widget, or nothing at all to simply hide the markup characters.
4. Rebuild whenever the document changes, the viewport changes, or the selection changes.

It is TWO predicates, not one. Inline marks (bold, italic, inline code) use the node-range test. Block marks (heading hashes, list bullets, quote markers) use a LINE-membership test — reveal when the cursor is anywhere on that line. That is what matches how Obsidian actually feels, and it is what the public MIT reference does.

Two subtleties will bite anyone implementing this. Whether a cursor merely ADJACENT to a node counts as inside is a policy choice, not a given — one implementation exposes it as a user setting. And CodeMirror infers block-versus-inline from whether the replaced range contains newlines, not from a flag.

The vocabulary matters, because Obsidian's own model is not three modes. It is two VIEWS times two editing MODES. Reading view and Editing view are the views. Within Editing view, Live Preview mode and Source mode are the modes. Reading view is a genuinely separate renderer, not a CodeMirror configuration. The owner's "edit mode and view mode" maps onto Live Preview versus Source — the same editor over the same document with one extension set toggled.

### Two earlier claims that did not survive

The version pin. An earlier reading said the `obsidian` npm package pins CodeMirror view 6.43.5 and state 6.7.0. That did not survive. There is no `obsidian@1.13.2` on npm; the request returns 404. The published latest is 1.13.1, and it pins `@codemirror/view` 6.38.6 and `@codemirror/state` 6.5.0. The higher numbers come from an unpublished file on the project's master branch. This barely matters, because we vendor our own copy and are free to take the latest. But no plan should say "match Obsidian's pin".

Free write-back. An earlier reading said write-back is free — the document never stops being the markdown, so saving is just the document text, with no serializer and no round-trip loss. That is TRUE for view-only decorations and FALSE the moment a widget becomes editable. Verified in the MIT reference's own table widget: committing a cell edit clones the parsed table, mutates one cell, re-serializes the whole table, and dispatches it back over the source range. The serializer normalises — it escapes pipes, strips newlines, and emits canonical `| a | b |` rows. A user's compact `|a|b|` is rewritten on the first cell edit. Editable-in-place is exactly what the owner described, so this cost is real and must be on the plan.

Two more facts about editable widgets. CodeMirror does not manage events inside a widget — every interactive widget in both public reproductions declares `ignoreEvent()` returning true. So cursor-reveals-source, undo, selection and clipboard all have to be hand-rolled a second time inside each editable widget. And the MIT reference's table widget carries a real bug: it captures absolute document offsets at construction but its equality test ignores them, so CodeMirror reuses a widget with stale write targets after text above it changes. The correct idiom is to ask the view for the position of the widget's element at commit time. Do not copy that file unfixed.

Obsidian's own changelog shows its paid team still fixing this class of problem in 2026 — Ctrl+A inside embedded table cells, copy and cut inside cells, inline formatting failing to expand around embedded math. That is evidence of how hard the expensive half is, not a reason to avoid the cheap half.

## 4. CodeMirror offline without a build step

It works, and it does not need a vendored single file. It needs a directory of ordinary npm packages served from our own origin plus one import map.

Verified end to end on this machine by two independent agents. The second run put eleven modules inside a REAL VS Code webview, behind the extension's exact security policy shell, and got a working editor with markdown highlighting, cursor-reveals-source on bold and on a code fence, and one write-back with the correct text.

### The packages

Take twenty, not eleven. All MIT. The eleven-package core:

- `@codemirror/state` 6.7.1
- `@codemirror/view` 6.43.7
- `@codemirror/language` 6.12.4
- `@codemirror/commands` 6.10.4
- `@lezer/common` 1.5.2
- `@lezer/highlight` 1.2.3
- `@lezer/markdown` 1.7.2
- `style-mod` 4.1.3
- `w3c-keyname` 2.2.8
- `crelt` 1.0.7
- `@marijn/find-cluster-break` 1.0.3

The nine more that `@codemirror/lang-markdown` pulls in:

- `@codemirror/lang-markdown` 6.5.1
- `@codemirror/lang-html` 6.4.11
- `@codemirror/lang-css` 6.3.1
- `@codemirror/lang-javascript` 6.2.5
- `@codemirror/autocomplete` 6.20.3
- `@lezer/html` 1.3.13
- `@lezer/css` 1.3.4
- `@lezer/javascript` 1.5.4
- `@lezer/lr` 1.4.10

Bytes: the eleven-package core is 1,037,279 raw and 250,492 gzipped. The twenty-package markdown closure is 1,404,502 raw. For scale, the engine already serves `@vscode-elements/elements/dist/bundled.js` at 233,123 bytes and `@xterm/xterm/lib/xterm.js` at 289,441 bytes.

An earlier claim that dropping `@codemirror/lang-markdown` saves 12 packages and 457,222 bytes did not survive — it compared a full editor against a bare one. The real saving is 9 packages and 367,223 bytes. And it is not free. Dropping that package drops `markdownKeymap`, which is exactly two keys: Enter and Backspace. That is list continuation and markup deletion. Those are table stakes for the Obsidian experience, so pay the 367 kilobytes.

### Why no bundler is needed

Every published file is plain ES module JavaScript with BARE import names, which a browser cannot resolve on its own. An import map resolves them. Verified: across all 23 installed packages there are exactly 21 distinct bare names, zero subpath imports, and zero dynamic imports. A flat name-to-URL map therefore cannot be escaped at runtime — nothing can request a file the map does not name.

No CSS ships. Verified: zero `.css` files across all packages. Styling is injected at runtime, so there is nothing to link and the theme can be set from JavaScript.

The page has no policy to fight. The engine's mirror sets only content-type headers. The single content-security-policy in the deliverable is a meta tag in the extension's shell page, and that shell's body is one iframe pointing at our own localhost origin. The iframe document is a separate browsing context served with no policy header.

### Three traps, each verified, each a day if unknown

1. The repo's existing vendor idiom cannot be copied. `createRequire(...).resolve("@codemirror/state/dist/index.js")` throws, because every CodeMirror package's `exports` map blocks deep paths. The bare form returns the CommonJS build, which a browser cannot run. Use `import.meta.resolve`, and convert its file URL to a path before reading. The existing route works only because the two packages it serves have no `exports` map at all.
2. Block-level replacing decorations must come from a `StateField`. Both a `ViewPlugin` and a function-of-view in the `EditorView.decorations` facet throw "Block decorations may not be specified via plugins". A state field cannot see the viewport, so block decorations are necessarily computed over the whole document.
3. Decoration ranges must be sorted by from, then start side, then to. An earlier plan said from-then-to; that did not survive. Verified: an inline replace has start side 499999999 and a block replace has -300000001, so at a shared offset the block must come first. Sorting by from-then-to throws at construction the first time a heading widget and an inline mark begin at the same offset.

### One correctness defect to remember

CodeMirror parses lazily, and a naive whole-document decoration build silently under-decorates. Measured on a 117,455-character markdown file: at construction the syntax tree covered 3,070 characters, so the build emitted 220 of the 7,554 marks it should have — about three percent. After three seconds idle the tree reached 86% and the parser had STOPPED. Forcing completion with `ensureSyntaxTree` took 4 milliseconds. An earlier reading called this a performance concern wanting viewport narrowing; that did not survive, and the fix is the opposite — force the parse. There is no error and no console output when it happens.

Also verified false: the one-line hand-rolled language. Writing `new Language(defineLanguageFacet({}), parser, [], "markdown")` produces byte-identical syntax trees but silently discards language data — `languageDataAt` returns an empty array where the real `markdown()` returns the value. Either attach the facet properly to the parser's top node, or use `markdown()`.

### The rejected alternative, and why

A genuinely vendorable single file exists for the `codemirror` package alone: 377,547 bytes from a public build service, zero imports, verified working offline from our own origin in one request. Do not take this route. It does not compose, and it fails SILENTLY. Adding markdown as a second such bundle produces an editor that renders with zero syntax highlighting and throws no error, because each bundle carries its own private copy of the state package and the two identities do not match.

## 5. Write-back safety

There are two write paths and they are governed by different things. Say which one a design is using before arguing about safety.

- The DOCUMENT path. With a custom text editor, VS Code's text document is the model. Save, dirty state, hot exit and undo are VS Code's. The engine's compare-and-swap hash guard is not the arbiter of these writes.
- The ENGINE path. The mirror writes a note through the engine's own file lane, which enforces a whole-file hash guard and refuses on mismatch.

For the document path the safe design is simple: keep every decoration VIEW-ONLY. Then the document never stops being the markdown, there is nothing to serialize, and write-back is lossless by construction. That is the whole of Obsidian's Live Preview and it is why CodeMirror beats a ProseMirror-based editor for this specific ask — ProseMirror parses markdown into its own document and re-serializes on save, so a round trip is not byte-identical.

### The named data-loss risks

Every one of these is verified by running it.

- Parse-then-reserialize destroys YAML. Running the `yaml` package's parse then stringify over a note fixture removed every comment, converted quoted strings to bare, converted flow sequences to block sequences, refolded block scalars onto one line, renamed anchors, turned an empty value into `null`, and turned `007` into `7`.
- The document-level API is not byte-identical either, with ZERO edits. It collapses alignment whitespace, reformats flow collections, refolds block scalars, moves a trailing comment onto the previous key's line, and loses leading zeros.
- Only the concrete-syntax-tree API round-trips byte-identically, including Windows line endings and three-space alignment.
- Its `setScalarValue` is a loaded gun. With a multi-line value and no context option it emits YAML that silently reassigns the NEXT key. Verified: `trailing: keepme` became a bogus key `"line two trailing"`. Always pass the after-key option, and pass the block-literal type when the value contains a newline.
- Type laundering. The view sends a string and YAML reads it back as something else. Verified for `true`, `123`, the empty string, `null`, `~`, `0x10` becoming 16, and `007` becoming 7.
- Obsidian has this bug itself. It uses the SAME YAML library, through the object API, and its forum thread on frontmatter destruction has run since August 2023. An Obsidian developer stated the rationale in writing: converting YAML to a plain object makes plugin work easy and loses all YAML-specific formatting and comments. Matching Obsidian here means matching a known defect.
- Our own note reader truncates. `engine/notes.ts` finds the closing frontmatter fence with `l.trim() === "---"`. An indented `---` inside a block scalar ends the frontmatter early and every later key is silently dropped. Verified: a `title` key vanished.

### The safe frontmatter write

A single-scalar byte splice through the concrete-syntax-tree API, guarded by reparse-and-compare, spliced onto an untouched body. It was implemented literally and run over all 129 real frontmatter notes in this repo: 1,219 attempted key edits, 1,069 accepted, 150 refused, ZERO corruptions.

Three earlier framings did not survive that run.

- "The note grammar is flat keys, so this costs almost nothing." All 150 refusals are structured values. `depends_on` was refused 50 times out of 50. `evidence` 49 out of 49. `legal_tools` 48 out of 59. Those are the fields a property editor most wants.
- "Round-trip preservation is the point." Across 129 notes there are zero comments, zero anchors, zero zero-padded numbers, zero Windows line endings, zero byte-order marks and zero indented fences. What does occur is 50 block scalars and 49 nested structures. The preservation machinery protects formatting this repo does not have.
- "One-line reader fix." Changing the fence test to `l === "---"` fixes truncation and BREAKS fences that carry trailing whitespace. Zero notes hit either case today, so it is safe to land, but it is a trade rather than a free win. It must land BEFORE any writer, because the writer can itself emit an indented fence inside a block literal.

Two defects in the splice specification, to fix before implementing. The compare guard runs on the line-feed intermediate rather than the bytes actually written, because the newline-restoration step mutates the string after the guard. And the tree walk finds the first matching key at ANY depth, so a nested map carrying the same key name edits the wrong token — the guard catches it, but by refusing a legitimate edit.

### Two rate limits

Rapid workspace edits sent from a webview message handler are SILENTLY DROPPED. The log shows "IGNORING workspace edit" and Microsoft closed the issue (149016) as designed. The suggested mitigation is to serialise the edits yourself. The reporter replied that awaiting each edit did not help, and was never answered before the issue was locked. Treat single-flight queueing as unvalidated risk, not a solved problem.

You cannot send a message to a HIDDEN webview, even with the retain-context option enabled — the API documentation says so in as many words. Any live sync must fully resync when the tab becomes visible, not only stream changes. A design that streams document changes down and nothing else desyncs on every tab switch.

## 6. What we give up by owning the surface

Owning the surface deletes Monaco inside that tab. None of the following can be given back through any API.

- The cursor and the selection.
- The gutter, including git change marks and the dirty-diff strip.
- The minimap.
- Folding and sticky scroll.
- Editor find and replace.
- Snippets and IntelliSense.
- Every other extension's decorations.
- The Outline. Verified at source: the outline pane shows "The active editor cannot provide outline information." Microsoft's own maintainer wrote that custom editors do not provide symbols.

Partly recovered: find. A custom editor can enable the webview find widget. It is find only, with no replace, and it searches rendered page text rather than the document.

Kept whether we want it or not: breadcrumbs. They cannot be hidden per editor — only the global settings exist. The per-editor request was declined on layout-stability grounds.

### Two earlier blockers that did not survive

The diff view. An earlier reading said a custom editor takes over diffs for its file type and shows two of our webviews with no diff information. On VS Code 1.131 that is false. The `contributes.customEditors` priority field now takes `default`, `option` or `never`, or an OBJECT naming the text, diff and merge editors separately. Its own schema states that diff and merge default to `never`, so a custom editor is not used for them unless it opts in. The two-webviews behaviour was the PROBLEM statement of the issue that fixed it, shipped in 1.120. A separate diff-association setting also overrides diffs independently, per file glob.

The consequence changes the recommendation. Register at `default` priority, not `option`. With `option`, the rendered view never opens when you click a note and every open needs an explicit reopen — which is not the Obsidian experience. With `default` it opens by default and diffs stay text diffs. Our extension manifest declares a VS Code floor of 1.90; bump it past 1.120 if we rely on this.

Keybindings inside webviews. The blocker cited for this (issue 61762) was fixed and closed on 5 December 2018 as an Electron bug. Keybindings inside webviews work. Whether OUR specific shortcuts fire inside a custom editor is a separate, open question — see section 7.

### One real regression risk, in code we already ship

Issue 227849 is open, on Backlog. Merely HAVING a custom editor open breaks undo and redo inside OTHER webview views. Our extension registers three of those in the sidebar. That is a regression to already-shipped behaviour, not a limitation of a new surface, and it is cheap to test.

### Two stable surfaces worth reading before committing

- Notebook serializer. A markdown-backed notebook gives per-block rendered-or-source duality for free, with a REAL Monaco editor inside each source cell — so IntelliSense, find, cursor, decorations and folding survive inside cells. The costs are two. The model is a notebook document rather than a text document, so save and dirty run through our own serialize and deserialize, which reintroduces the round-trip risk and loses the cleanest win. And a markdown cell is rendered OR source, never edit-in-the-rendered-view. It answers the duality half of the ask and fails the live half.
- Comment controller. Stable, interactive, anchored to a range. VS Code owns its shape.

## 7. The smallest useful first step

Ship the Live Preview surface with view-only decorations and nothing editable inside a block. It is useful on its own — it IS Obsidian's Live Preview mode — and it proves every load-bearing assumption at once: the vendoring, the import map, the webview, the keyboard, the duality, the write-back.

Order of work:

1. Install the twenty CodeMirror packages into `deliverable`. All MIT, no build tooling.
2. Add a vendor allowlist and a `/vendor/<package>` route to `engine/mirror.ts`, beside the existing single-file route. Resolve each name with `import.meta.resolve` against the allowlist. Never join request path segments into `node_modules` — that is a directory-traversal hole.
3. Emit the import map from that same allowlist, before any module script on the page.
4. Register a custom text editor in `deliverable/vscode/package.json` and in `extension.js` beside the three existing view registrations. Reuse the existing surface class and shell-page builder unchanged, so neither constraint is touched.
5. Build the live preview as a `StateField` over the whole document. Force the parse first. Sort ranges by from, start side, then to. Use the node-range predicate for inline marks and the line-membership predicate for block marks.
6. Write the changed range back as a minimal workspace edit, and fully resync on visibility change.

Test these three things BEFORE writing step 4. Each is cheap and each can kill the plan.

- Does opening a custom editor break undo inside our three sidebar webviews?
- Do our existing keyboard shortcuts fire with focus inside a custom-editor webview?
- Does the plain text editor stay live beside the rendered view on the same file?

The third is very likely fine. The extension host hard-codes multiple-editors-per-document for text custom editors — verified in source, a literal `true` passed at registration. It has still never been run.

Budget honestly. The plumbing above is roughly a day. Rendering headings, lists, links, images, tables, blockquotes and code fences is the part that actually looks like Obsidian, and nobody has measured it. Every public reproduction ships one plugin and one widget per construct — one has ten plugin files and six widget files for that set.

## 8. What this does not solve

- Editing inside a rendered block. This is the owner's literal ask and it is the expensive half. Each editable widget needs its own nested editable element, its own copy of the source text, its own reveal-and-re-render cycle, its own commit policy and its own markdown serializer. Every serializer rewrites the user's formatting. Do one construct end to end before committing to the rest.
- Nested frontmatter. The verified splice reaches 88% of key edits and 0% of `depends_on`, `evidence`, `legal_tools` and the exit conditions. `evidence` is a list of maps — a nested table editor, not a tag-chip list. Obsidian cannot edit nested properties either, so this is parity with the target rather than a shortfall. Say it that way.
- The engine's write door. `session.humanTool` is a FIXED five-tool switch and the file-write tool is not in it. Adding one is an architectural decision, not a free extension. It runs behind the same state gate, so a state that does not grant the tool would refuse the OWNER's own edit. That is an owner ruling, not a research finding.
- Two writers, no reconciliation. The engine writes to disk directly. VS Code holds its own copy in memory. An agent write while an unsaved buffer is open is lost at save with no refusal, because the hash guard reads disk and cannot see the buffer.
- Input methods, screen readers and right-to-left text. CodeMirror handles these and it is much of its bulk. Nobody exercised them.
- Large documents. A full decoration rebuild over 4,890 lines costs 1.7 milliseconds. A ten-times-larger file was not tested, and block decorations cannot be narrowed to the viewport.
- Reading view. Obsidian's third surface is a separate renderer. A read-only configuration of the same editor gives a locked Live Preview, not Reading view.

### Unknown — could not be established

- Whether Obsidian's own frontmatter fence scan is trim-based or column-zero. Our writer can emit an indented fence inside a block literal, and fixing our reader does not fix Obsidian's. Testing needs an actual Obsidian install. Until then, refuse any value whose lines would render as a bare `---`.
- How Obsidian's Live Preview is actually implemented. Its application code is closed and minified. Every claim about its internal choices is inference from four independent reimplementations.
- Whether core Obsidian writes a property edit per keystroke, on blur, or on a debounce. The only measured timing is third-party: commit on Enter and on blur for cells, 400 milliseconds for note bodies.
- Whether serialising workspace edits actually fixes the dropped-edit problem. Microsoft suggested it, the reporter said it did not work, and the issue was locked without resolution.
- Whether the proposed-API command-line flag unlocks editor insets on stable VS Code. The source gate was read in full and contains no quality check on that path. Nothing was run.
- Whether the engine's own renderer preserves source spans — rendered node back to a line or character range. Everything about minimal edits, undo granularity and round-trip fidelity turns on this, and nobody read the render path.
- The real markdown round-trip cost for an editable widget on our own notes. Only synthetic and third-party measurements exist.
