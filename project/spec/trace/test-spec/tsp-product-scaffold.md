---
id: tsp-product-scaffold
type: "[[test-spec]]"
statement: A product begins from the template without touching anything existing, owns its folder whole, and installs from one script that stops before partial, verified by test over the scaffold and setup paths.
method: "test"
verifies:
  - "req-begin-touches-nothing-existing"
  - "req-fresh-product-starts-empty"
  - "req-scaffold-from-template"
  - "req-method-reuse-is-vendoring"
  - "req-product-is-a-folder"
  - "req-engine-folder-is-sealed"
  - "req-setup-floor-editor-shell"
  - "req-setup-stops-before-partial"
  - "req-extension-replaced-reported"
files:
  - "tests/help.test.ts"
  - "tests/scaffold.test.ts"
  - "tests/setup.test.ts"
---

## Scope

The product's birth and boundary: the scaffold from the template, the
zero-touch law toward everything existing, the one-folder ownership, the
sealed engine folder, and the setup script's stop-before-partial rule.

## Approach

System level against temp roots that simulate a fresh machine. EIGHT of
the nine claims are DEFINED ahead of their cases — the scaffold and
setup builds have not run under test yet. tests/scaffold.test.ts and
tests/setup.test.ts are the planned homes and land with the begin
build. What runs today: the help surface's completeness over every
setup switch (help.test.ts), which pins the script's contract.

## Steps

Every case in the referenced files is one step; the case name states its
claim. The load-bearing step today: every switch RUNME.ps1 parses
appears in the ONE help. The planned steps assert: a scaffold changing
zero files outside its new folder; a schema-valid scaffold with zero
declared fields missing; the missing-tool stop naming each tool and its
source; the replaced extension reported with its version.
