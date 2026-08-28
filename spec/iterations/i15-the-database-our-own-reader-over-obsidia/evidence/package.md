---
form: package
by: agent
signed_off: 2026-08-19T21:03:18.107Z
authors: agent
files: null
---

# Evidence form / package

## current_situation

gate-validation is blessed. Version bumped 5.0.0 to 6.0.0, MAJOR — matching gate-kickoff's own pricing of this iteration's build weight. The archive assembled by script (`node engine/bin/package.ts --root .`), exit 0, expanded to dist/check-6.0.0, and the entrypoint was RUN from inside it, not only opened.

## package

- dist/quackitect-6.0.0.zip

## works

yes — expanded, and the entrypoint run from inside the extracted copy: `se-mcp.ts --help` answered at exit 0 in 105 ms, printing this build's own help text; `se-mcp.ts --version` answered `6.0.0` at exit 0 in 107 ms, matching the manifest. i16's own package.md named the missing `--version` flag as its sharpest emit_back finding — that flag now exists and was exercised here, closing that gap.

WHAT WAS NOT DONE, and it is the row's own bar: nobody installed from the package with RUNME.ps1 and nobody reached the desk. Doing that unasked while nobody is here would be a side effect rather than a check, same reasoning i16 gave.

## emit_back

- M6_author-tests / meth-test-design.md: no check catches a newly-minted MUST story that never gets a demonstration-method test-spec (a `demonstrates:` link) before the state signs. sty-a-smaller-model-walks-a-record was minted this iteration at write-requirements, its own write-stories.md evidence NAMED the obligation in words ("AUTHOR-TESTS OWES IT A DEMONSTRATION-METHOD SPEC... i34 shipped with exactly that link broken for another must story, caught two gates late"), and the same failure recurred anyway — caught two gates later, at gate-validation, exactly as the i34 precedent warned. The words are on record; nothing mechanical enforces them at the state that could catch it for free.
- --version on se-mcp.ts, closing i16's own emit_back finding: the flag i16's package.md said did not exist now does, and this walk is the first to exercise it as the package's own proof.

## follow_up

Onward to gate-release, then shipped. The next record should pick up: a mechanical check at author-tests (or its gate) that refuses signing while a must story minted this iteration carries no demonstrates: edge, rather than leaving it to gate-validation's route check to catch two states late.

## anything_else

