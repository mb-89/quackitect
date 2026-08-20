---
form: find_prior_art
by: agent
signed_off: 2026-08-18T11:54:04.923Z
authors: agent
files: null
---

# Evidence form / find_prior_art

## current_situation

FINDER 1 OF 4 AT M4, and the outside scan it owes is four gates old.

THE QUESTION HAS BEEN NARROWED THREE TIMES, which is what took the gates.

- Does anything off the shelf resolve method artifacts by IDENTITY rather than by path?
- Does anything report what a copy CHANGED, as authorship, rather than how far it has DIVERGED from a snapshot?
- Does anything let a tool come up in a tree carrying none of its own configuration?

TWO CLUSTERS ARE IN THE CONE. the-bootstrap holds producing a copy and producing a driven tree. the-walk holds deciding which tree a path names.

THIS IS A PARTIAL SAVE. The predecessor half is complete and the literature half is still being searched.

## applies

yes

## options

- project/spec/trace/option/opt-layered-path-search.md
- project/spec/trace/option/opt-override-by-declared-identity.md
- project/spec/trace/option/opt-the-override-calls-through-to-what-it-replaced.md
- project/spec/trace/option/opt-the-override-merges-into-what-it-changes.md
- project/spec/trace/option/opt-the-executable-finds-its-own-home.md
- project/spec/trace/option/opt-the-tree-carries-its-own-layer.md
- project/spec/trace/option/opt-a-pointer-outside-both-trees.md
- project/spec/trace/option/opt-the-tree-is-named-each-run.md
- project/spec/trace/option/opt-a-mirror-beside-an-overlay.md
- project/spec/trace/option/opt-the-overlay-is-declared-by-key.md
- project/spec/trace/option/opt-a-fresh-single-commit-repository.md
- project/spec/trace/option/opt-the-copys-changes-are-a-declared-patch-series.md
- project/spec/trace/option/opt-the-copys-changes-are-derived-on-every-update.md
- project/spec/trace/option/opt-an-undeclared-change-refuses.md
- project/spec/trace/option/opt-an-override-pins-what-it-was-cut-against.md

## literature

TWO SWEEPS OF FOUR HAVE LANDED at the time of this save. Both read primary documentation rather than commentary, and both are reported with what could NOT be established.

### Question one: does anything resolve an override by IDENTITY rather than by path?

YES, AND ELEVEN SYSTEMS DO IT. Twenty were checked, with primary sources read for eighteen.

- Kustomize matches a patch on a Kubernetes group, version, kind and name tuple, and can even refer to a resource by a previous name.
- Nix overlays match on the attribute name in the package set.
- XSLT matches named templates on a qualified name.
- Android's runtime resource overlays match on resource type and name.
- Android's manifest merger matches on element type plus a match key.
- Cargo matches on source plus crate name; Go on the module path; Maven and Gradle on their coordinates.
- Rails model overrides match on the Ruby constant.

EIGHT KEY ON PATH INSTEAD: container image layers, Rails engine views, Jekyll layouts and includes, Hugo templates, Sphinx templates, the Emacs library search path, the Java class path, and LaTeX's kpathsea.

THE OBSERVATION THAT MATTERS MOST is not the count. Every identity-keyed system in the sweep has a name registry that exists for its own reasons, independent of the filesystem. Identity resolution is a CONSEQUENCE of already having a namespace rather than a feature somebody added. This corpus already gives every artifact a stable id and already resolves references by it, so the expensive half is already paid for.

AND ONE FINDING RESHAPED THE CHART. Only FOUR of the twenty let an override reach the thing it replaced: XSLT's apply-imports, Sphinx's exclamation-mark prefix, a Nix overlay's `prev` argument, and Rails reopening a class. Every path-keyed system except Sphinx forces a whole-file fork, and each one's own documentation carries some version of the same sentence — copy a file and you stop receiving updates to it.

SO THE SUPER-CALL, NOT THE OVERRIDE, IS WHAT MAKES AN OVERRIDE SURVIVE UPSTREAM CHANGE. It is rarer than the override mechanism itself, and it is the answer to a cost every replacement scheme here pays.

THREE NEGATIVES WORTH RECORDING. OSGi fragment bundles attach by identity but merge strictly additively and the host always wins, so a fragment cannot replace anything. VS Code's contribution points carry no cross-extension override at all, only a settings-defaults escape hatch. Maven's shade relocation renames to AVOID a collision rather than resolving one.

COULD NOT BE ESTABLISHED: Eclipse artifact overriding, systemd drop-in precedence detail, npm `overrides` detail, Odoo view inheritance detail. All four looked relevant and none had a primary source read.

ONE MECHANISM WAS FOUND AND IS RULED OUT HERE. Android lets the target fence what is overridable with an `overlayable` declaration, and an overlay may only touch what the target listed. The owner has ruled that nothing in a copy is sealed, so a fencing mechanism is out on that ruling rather than on its merits.

### Question two: does anything report what a copy CHANGED, rather than how far it has DIVERGED?

YES, AND IT COMES FROM ONE FAMILY ONLY: patch series, where the change has no representation except as a named, described, separately stored patch. The set of patches IS the inventory, so nobody computes it.

DEBIAN'S SOURCE FORMAT IS THE STRONGEST, and it is the only one found that mechanically refuses an undeclared edit. On build, dpkg-source re-extracts the pristine upstream, applies the declared patches and diffs against the tree; a non-empty diff fails the build. Its `--abort-on-upstream-changes` exists to ensure every change was properly recorded.

DEP-3 IS THE SPECIFICATION OF AUTHORSHIP, accepted in 2012. Each patch carries `Origin` — with `vendor` as an explicit category meaning a distributor made this — plus `Author`, `Forwarded: not-needed` for what is permanently ours, and `Applied-Upstream` for what the next update can drop.

YOCTO IS THE ONLY SYSTEM WHERE THE REASON IS MACHINE-CHECKED. Its layer-compatibility script refuses a layer containing a patch file with no upstream-status tag, and passing that check is required for the compatibility badge.

QUILT ALONE GIVES LINE GRANULARITY. `quilt annotate` prints a file showing which patch owns which line.

GOOGLE COPYBARA IS THE ONLY SYSTEM THAT DERIVES THE INVENTORY. Its merge mode three-way merges to perpetuate destination-only changes, and its autopatch configuration writes that destination-only delta out as patch files on every import. The inventory is an OUTPUT rather than a list somebody maintains.

AND HERE IS THE GAP, WHICH IS THE FINDING THIS ITERATION MOST NEEDED. Nobody combines the two. Copybara computes the delta and attaches no meaning to it. DEP-3 attaches rich meaning and needs a person to keep the list truthful. A system that derives the hunks automatically AND demands a reason per hunk appears in no primary documentation the sweep read.

THE VENDORING FAMILY REPORTS AUTHORSHIP NOWHERE, and two members are worse than silent.

- Go's reference states plainly that the go command does not check whether vendored packages have been modified, and `go mod vendor` deletes and rebuilds the directory. A local edit is destroyed with no record.
- `cargo vendor` treats vendored sources as read-only and deletes the directory by default.
- Dependabot maintains vendored Go dependencies automatically, so that destruction happens on a schedule inside a pull request.

GIT SUBTREE IS THE HONOURABLE EXCEPTION in that family. It never drops an edit, and its own manual gives the command that lists your commits against the vendored subtree. But that is a commit list rather than a statement of what you own, and it degrades the moment one commit spans both the vendored tree and your own code.

CHROMIUM WRITES THE CONCEPT IN PROSE. Every vendored dependency carries a `Local Modifications` field asking the maintainer to enumerate local changes, with `None` as the explicit empty answer, and a carve-out for tooling files that differ without being authored. A presubmit checks its FORMAT only, so the field can lie without failing anything.

COULD NOT BE ESTABLISHED: how Renovate handles a vendored dependency that was modified. Its frequently-asked-questions and known-limitations pages were both read in full and neither mentions vendored trees, modified dependencies or patch reapplication. Recorded as a documentation gap, not as a claim about its behaviour.

### Still owed

TWO SWEEPS ARE STILL RUNNING. One is on how a tool locates its own home when running in a tree carrying none of its configuration. One is on competitors — what comparable agent harnesses, scaffolding tools and process engines ship for spawning a configured copy and for driving a foreign repository.

## shipped

THE PREDECESSOR IS THE WHOLE OF THIS SECTION, and it earned the card's claim that it is the rich source. v1 solved both of this iteration's questions and shipped both answers. It is read at ref `main` in this repository.

### The predecessor, on where a copy's own method lives

THREE LAYERS, MOST SPECIFIC FIRST (`product/engine-go/resolver.go`, `overlayLayers`).

- A machine-local overlay in a per-user data area.
- The copy's OWN committed overlay, at whatever folder a key in its committed configuration names. Its comment states the fallback: "no key, no layer."
- The vendored defaults.

RESOLUTION IS A PATH SEARCH. `Resolve(rel)` joins the artifact's relative path onto each layer and returns the first that exists. Eight lines, no index, no identity.

AND THE COPY'S LAYER REACHES THE DRIVEN PROJECT. The same comment says a copy's method extensions merge over the vendored layer "for itself AND for every stub it drives". One declaration serves both.

### The predecessor, on running in a tree that is not its own

FIVE MECHANISMS, TRIED IN ORDER (`product/engine-go/engine.go`, `resolveEngineRoot`). Every one of the four candidate pointer locations this iteration is weighing turns out to be shipped code rather than a proposal.

1. A marker directory found by walking up from the EXECUTABLE's own location, four levels. Its design note calls this resolving "independent of the workspace".
2. The working tree itself, when it already carries the method layer.
3. The working tree's OWN recorded pointer, written when that tree was produced.
4. A machine-global recorded home.
5. Otherwise the working tree, as a fallback that names the real gap rather than hiding it.

SEPARATELY, WHICH TREE THE WORK BELONGS TO is answered by an explicit `--base` or `-C` argument, modelled on `git -C`, or by walking up from the current directory to a committed marker file.

### What reverse engineering reads off the artifact

THE POINTER'S KEY IS THE TREE'S PATH. `dataHomeFor` builds the record's location from the directory's own name plus six characters of a hash of its canonical absolute path, under a per-user data base.

SO THREE MOVES BREAK IT, and this is established by reading the derivation rather than argued.

- MOVE the tree: the hash changes and the record is orphaned.
- COPY to another machine: the per-user base is machine-local and holds nothing.
- CLONE by a colleague: the same.

v1 BUILT A REPAIR RATHER THAN A FIX. Any run whose working tree is a real source repository re-records the pointer, so one command restores every tree on that machine. The repair is guarded by a two-part identity check requiring BOTH the method layer AND the program's own source, so a copy carrying only the method cannot claim the pointer.

THE REPAIR IS THE EVIDENCE AGAINST THE MECHANISM. A design shipping a standing fix for its own loss has already told you what it does under the three moves that matter.

### The mirror-beside-overlay split, which answers the harder question

`product/engine-go/module.go` states it directly: the planner mirrors a source tree into an import folder, records provenance in a manifest, reports deletes for files no longer present upstream, and "never touches" the overlay folder beside it.

WHAT THAT BUYS IS AUTHORSHIP WITHOUT A DIFF. The copy's own changes are not computed or detected. They ARE the contents of the overlay folder, so the question "what did this copy make its own" is a directory listing.

DIVERGENCE NEVER ARISES, because the mirror is never hand-edited. A drift report answers "how far has this wandered", which reads as damage. This answers "what did you author", which reads as an inventory.

WHAT IT COSTS, AND BOTH COSTS ARE REAL. A person who edits a mirrored file directly gets no warning from the layout, and the next update discards the edit silently. And overriding one line means carrying a whole file, so a later upstream change to an untouched part of that file never reaches the copy and nothing says so.

### Competitors

OWED AND NOT YET IN HAND at the time of this save. Three parallel searches are running on the outside literature and on shipped tooling.

## dry_wells

- NEITHER CLUSTER IN THE CONE IS DRY. the-bootstrap and the-walk both turned up abundant prior art, so this finder reports no empty cell.
- DERIVED AND DECLARED AUTHORSHIP IN ONE SYSTEM: nothing found. Twenty vendoring and patch systems were checked against primary documentation, and every one does one or the other.
- AN OVERRIDE THAT MATCHES NOTHING AFTER AN UPSTREAM RENAME: no system reports it. XSLT is the nearest, and it errors on the opposite case, two overrides matching one target.
- AN OVERRIDE REACHING INSIDE A PROSE ARTIFACT: nothing found. Every partial-override mechanism in the sweep works on structured data or on template blocks the upstream author named in advance.
- THE SIX CLUSTERS OUTSIDE THE CONE were not searched, because this iteration's change does not reach them.
- TWO OF FOUR SWEEPS WERE STILL RUNNING AT SIGNING, on rootward discovery and on competitors. Their findings amend this rather than change any answer above.

## follow_up

IMMEDIATELY: the other three finders, which run beside this one. find_by_contradiction, find_by_analogy and find_without.

ONE CONTRADICTION IS ALREADY NAMED AND READY FOR TRIZ. The copy owns everything and may change anything, AND the copy wants upstream's later changes to what it did not touch. Every replacement scheme in the sweep pays that as a whole-file fork. A separation IN LEVEL — the copy owns the artifact, upstream owns the parts the copy did not name — is what the four super-call systems actually do, so the contradiction has a shipped resolution rather than a theoretical one.

THE TRIMMING FINDER HAS A REAL TARGET. Ask whether a copy needs an overlay AT ALL, given the owner's ruling that nothing is sealed and the copy may edit its vendored files directly. Three systems in the sweep say what that costs, in their own documentation, and Homebrew's `inreplace` is the shipped version of exactly that choice.

AT record-adrs, THREE DECISIONS ARE NOW WELL EVIDENCED RATHER THAN OPEN.

- Where the overlay lives, and whether resolution keys on path or identity.
- Where the pointer lives, with five shipped mechanisms to choose among rather than four guesses.
- Whether a copy's changes are declared, derived, or both — where the field has a documented gap.

ONE PARKED NOTE BITES AT cut-criteria AND MUST NOT BE BUILT AROUND. note-a817202a5f9e records that the standing criteria order still puts the response-time row first, the exact defect ruled fixed on 2026-08-09, and its re-entry condition is the next time that order is touched. It was touched at derive-criteria this iteration. The owner's ruling that an agent may produce the order directly rather than walking pairs is what makes fixing it cheap, so the two meet in the same pass.

ONE STANDING NOTE IS DELIBERATELY LEFT UNDRAINED. note-b966f8fd311e records that v1 already ran the whole spawn-and-drive chain end to end. Its finding is now consumed here and in the option nodes, but the action it implies — porting that chain as this iteration's demonstration — is owed at author-tests, so draining it would lose the reminder.

AND ONE ASSUMPTION IS NOW SETTLED BY READING RATHER THAN BY PROBE. raid-asm-the-pointer-survives-what-the-builder-does-to-the-tree listed four candidate pointer locations with one disproved. The predecessor's code disproves the machine-local one properly: its key is a hash of the tree's canonical path, so a move orphans it, and its store is per-user, so a copy or a clone finds nothing. The predecessor shipped a self-repair for exactly that loss, which is the strongest evidence against the mechanism.

## anything_else

### What this finder changed about the iteration's own beliefs

TWO THINGS I HELD ARE NOW BETTER EVIDENCED, and one is corrected outright.

THE SUPER-CALL IS THE LOAD-BEARING FEATURE, and I did not know that going in. I had written into [[opt-a-mirror-beside-an-overlay]] that overriding one line means owning a whole file, and that a later upstream change to an untouched part never arrives. That is true of that mechanism, and I recorded it as an unavoidable price. It is not. Four systems in twenty pay it differently, and a fifth family avoids the question by merging rather than replacing.

AND THE SINGLE-COMMIT EXPORT IS DELIBERATE. Reading this product's own export script rather than reasoning about it turns up an owner requirement dated 2026-07-30 behind the missing history.

THE TWO HALVES OF THAT REQUIREMENT COME APART UNDER READING, which is worth carrying to record-adrs. "Must run on another machine WITHOUT this repository's history" is a statement about what the copy DEPENDS ON. Dropping the history satisfies it. So does carrying a history the copy never has to consult. The requirement as written does not choose between them, and only the second leaves a channel open for a later update.

### The count, so the chart's shape is visible

FIFTEEN OPTIONS, ACROSS TWO CLUSTERS.

- the-walk holds five: a layered path search, identity-keyed replacement, a call-through override, a merging override, and four rival answers to where the system's home is recorded.
- the-bootstrap holds the rest: a mirror beside an overlay, a declared overlay location, a fresh single-commit repository, a declared patch series, a derived delta, a refusal on undeclared change, and a stamp recording what an override was cut against.

SEVEN CAME FROM THE PREDECESSOR AND ONE FROM THIS PRODUCT'S OWN SCRIPT. The benchmarking card claims the predecessor is the rich source that people skip, and on this iteration that claim held: v1 had already shipped answers to both of the questions this iteration opened.

### One mechanism found and ruled out, recorded so nobody finds it again

ANDROID LETS THE TARGET FENCE WHAT IS OVERRIDABLE. A target declares which resources an overlay may touch, and an overlay may touch nothing else.

IT IS OUT ON THE OWNER'S RULING, not on its merits. Nothing in a copy is sealed, so a mechanism whose whole purpose is sealing has no cell to fill here. It is written down because it is the obvious thing to reach for, and reaching for it would contradict a standing ruling.
