---
form: package
amended: 2026-08-14T19:52:25.474Z by agent — the archive was rebuilt over a version fix the release gate found; the cited path, the works verdict and the emit list are untouched, and the rebuilt banner reads…
by: agent
signed_off: 2026-08-14T19:46:01.764Z
authors: agent
files: null
---

# Evidence form / package

## current_situation

The package assembles by script, and installing from it reaches the desk.

WHAT WAS BUILT. `node engine/bin/package.ts --root .` produced dist/quackitect-4.1.0.zip. The version moved 4.0.0 to 4.1.0. Minor, because everything in i27 is additive: a retired refusal permits more than it forbade, and the transport flag is new. RELEASES.md carries the entry in plain language.

WHAT WAS OBSERVED, rather than assumed:

- The archive expands to project/, README.md, RELEASES.md, RUNME.ps1, .gitattributes and .gitignore. The editor extension travels inside, at project/deliverable/vscode.
- The README inside is the entry document. Plain language, no method jargon, and it names the one command a fresh machine runs.
- The packaged engine runs before any install: node engine/bin/se-mcp.ts --help returned exit 0 in 635 ms and printed the whole help, --mode included.
- npm install inside the expanded copy added 30 packages in 3 seconds, exit 0.
- The packaged engine then started on the expanded tree and served its mirror. Its own words: "se-mcp: satellites run process" and "mirror (the human's hand) at http://localhost:7399/".
- The desk answered. /api/alive reported the expanded folder as its root, status open, standing at `start` and aiming at `front_desk`, autonomy at the 0.4 default. A fresh product on a root it created for itself.

REBUILT ONCE, AFTER THE RELEASE GATE FOUND A DEFECT. The first build announced `se-mcp 3.0.0-bootstrap` from a 4.1.0 archive, because the version was hardcoded in four places and had not followed the 4.0.0 release. engine/version.ts now reads the manifest, and the archive was assembled again at the same path. Re-run from the expansion, its banner reads `se-mcp 4.1.0`. Every observation above holds for the rebuilt archive, and gate-release carries the finding.

WHAT THE CHECK DID NOT DO, named plainly rather than papered over. RUNME.ps1 itself was not run. It places the VS Code extension and opens the editor, which changes the machine outside this folder, and that is not an act to take unasked. Everything before that point was exercised from the package.

## package

- dist/quackitect-4.1.0.zip

## works

yes

## emit_back

- meth-consistency-sweep - the second surface class wraps onto a second line, and the catalogue reader takes only the first, so the item serves truncated with its parenthesis open
- M9_20_package - taught SE-C-134 as a live refusal that forbids a method write while bound; corrected in this record
- meth-emit-back - carried a section titled "The record cannot write the method" and sent the agent to the desk for a small edit; corrected in this record
- the rigor matrix - the must-check is not built, so every gate runs it by hand in prose, which raid-dec-a-must-outranks-a-score states against itself
- the panel spec - a `choice` control does not post on change, so a declared row would draw a control that does nothing

## follow_up

- Run RUNME.ps1 from the package on a machine that can spare the change. That is the half of the check no agent should take unasked, and it is the last unexercised install path.
- Fix meth-consistency-sweep's wrapped class item. It is emitted above, and the next record's promotions field is where it lands.
- The sweep evidence for this record recorded the truncated item text, because that is what the form served. It is honest as a record of what was checked.

## anything_else

ON FIXING THE CARD HERE RATHER THAN EMITTING IT.

The new meth-emit-back text written this iteration says the change may be made where you stand, and the emit is still owed either way. The wrapped class item was deliberately NOT fixed here.

Changing a catalogue item's text changes what the checklist expects. sweep-consistency's evidence was signed minutes earlier with the truncated text the form served. Editing the card now risks knocking that claim down, and gate-validation with it, for a line wrap.

So it is emitted rather than fixed, and the reason is recorded here rather than left as a silent choice.

ON THE VERSION.

Minor rather than major. Nothing authored for 4.0.0 stops working: the retirement of SE-C-134 removes a refusal, --mode is a new flag with a default that matches the previous behaviour's intent, and the packet gained a field rather than losing one.
