---
form: package
by: agent
signed_off: 2026-08-16T10:26:47.047Z
authors: agent
files: null
---

# Evidence form / package

## current_situation

The artifact assembles by script and was checked by being used.

THE VERSION HAD NOT BEEN BUMPED, and that was found here rather than assumed. The manifest still read 4.1.0, which shipped on 2026-08-14 as i27's release. i34 would have shipped a second, different 4.2.0-worth of change under a version already on the record. It is now 4.2.0, with its own entry in RELEASES.md.

THE ENTRY NAMES WHAT THIS RELEASE TAKES AWAY, in its own section. Sharing work between two machines is switched off, and two jobs open at once now share files. A release note that listed only the additions would be the same failure the gates caught twice today.

## package

- dist/quackitect-4.2.0.zip

## works

yes — extracted clean, dependencies installed from its own manifest, and its preflight and smoketest both run green from the extracted copy

WHAT WAS ACTUALLY DONE, so the yes is checkable.

- The script built it twice: once at 4.1.0, then again after the bump. Assembling by hand would be the defect and did not happen.
- The archive holds 520 entries: README.md, RUNME.ps1, the VS Code extension under project/deliverable/vscode, the engine, the machines, the guidance — and an EMPTY project/spec, because a fresh product starts empty.
- Extracted to a throwaway folder. `npm install` from its own manifest: 30 packages, exit 0.
- `preflight.ts` from the extracted copy: preflight green, exit 0.
- `smoketest.ts` from the extracted copy: smoke green in 0.6s, exit 0 — cards load, rigor matrix reads, machines compile, engine modules load.
- The extracted package declares 4.2.0, read back from its own package.json, and the archive name agrees. That pair matters: the version is ONE fact read from the manifest, after a 2026-08-14 defect where a packaged engine announced 3.0.0-bootstrap out of a 4.1.0 archive.

WHAT WAS DELIBERATELY NOT DONE, and the yes is scoped to exclude it. RUNME.ps1 was NOT run. Its default path copies the extension into the user's own ~/.vscode/extensions, rewrites their extensions.json and opens VS Code — it would have overwritten the owner's installed extension with a temp copy, unasked. Its --classic path refuses while a session holds ports 7333 and 7334, which this session does.

SO THE INSTALLER'S GLOBAL STEPS ARE UNPROVEN BY THIS CHECK. What is proven is the part that decides whether the package is any good: the engine inside it installs from its own manifest and runs green on a machine that has only the archive.

A FIRST ATTEMPT FAILED AND IS RECORDED. Running preflight straight from the extraction, before npm install, died on a missing `yaml` package. That is correct behaviour rather than a defect — dependencies are what the installer provides — but it is exactly what a reader would want to know before concluding the package is broken.

## emit_back

- meth-consistency-sweep: the sweep's grain is the VOCABULARY and the card does not say so. Searching the deleted terms finds every document that NAMES the old thing, never one describing the old behaviour in different words. The card should make the class say what it can and cannot establish.
- M7_50_verification row: it says filled_by engine and "THE ONE PLACE the full battery runs", and an agent still ran five batteries on its own judgment. The lane should refuse an agent-initiated full battery outside verification, so the row is enforced rather than merely written.
- se_test: it hands off a job id and must be polled to read a verdict. About thirty calls this turn asked only "are you done yet". It should block or push.
- M9_20_package row: nothing in it checks that the version actually moved. i34 reached this state with the manifest still at the previous release's number, and only a hand-read of RELEASES.md caught it. A mechanical check — the manifest version must not already appear in RELEASES.md — would have refused.
- meth-emit-back and M8_20A_sweep-consistency: a deletion ripples up through every claim that read the corpus, and nothing names the ROOT in one answer. Six se_why calls, one per level, to find a register three levels up. Sighted three times now.
- The router: there is no route BACKWARD to a state that owes work. Every recovery this session was an escape and a re-entry, and the only forward route ran through shipped.
- A deletion warns nobody about what it orphans. Deleting a function orphaned two requirements; deleting a test-spec orphaned a must story; deleting requirements broke a register three states up. Each was caught by a coverage law, states later. The delete should name what points at the node before it goes.

## follow_up

THE VERSION BUMP RAISES A QUESTION THIS STATE DOES NOT DECIDE, and it is the owner's.

i34 is a MINOR by change size, so this state's guidance says minor bump, and 4.2.0 follows it. But i34 REMOVES a capability 4.0.0 shipped and advertised — "any machine there can take it and run it", and "two machines can never hold the same one". By ordinary semantic versioning, removing a shipped capability argues for 5.0.0.

THE INSTRUCTION WAS FOLLOWED AND THE TENSION IS RECORDED. Change size and version significance are two different judgments, and the matrix currently binds them together. Whether that is right is a method question for the retro.

THE RELEASE ENTRY IS HONEST EITHER WAY. It carries a "What this release takes away" section naming the loss, so a reader learns it from the notes rather than from a broken workflow.

EMIT-BACK IS SEVEN ITEMS AND NONE OF THEM IS BUILT HERE. They are what this record learned about the SHARED method, which is a different repository's business.

## anything_else

