---
kind: guidance
---

# Testing

What a test is allowed to depend on, and what it costs to run.

## Motivation

A test that reads the record tests the record. The note it opens is edited by
ordinary work, so the test goes red for a reason that is nobody's defect. One
did: a check read a closed token for a list of ids, the tokens were rewritten
to a smaller shape, and the list went. The check had nothing left to guard and
it was retired.

A test earns its place by failing when the program is wrong. It loses that
place when it can fail for anything else. Documents change, ids are minted and
retired, and the record is where all of that happens. So a test builds what it
needs and reads nothing it did not write.

The suite is also paid for on every run, by everybody. Thirty-five tests each
compiled the engine into a directory of their own, which cost a minute of the
hundred seconds and produced thirty-five identical files. A fixture built once
is the ordinary answer.

## Actionables

- A test builds the tree it needs. It never reads a note or a document that
  lives in the record.
- A token id never appears in an assertion, in a path a test opens, or in a
  fixture a test loads.
- A test asserts behaviour. What a document says is the document's business.
- A fixture id is plainly invented, `wk-1111111111` rather than a real one, so
  no reader takes it for a record.
- A standing script names no token id. A script that needs one belongs in
  `.se/scratchpad/`.
- A test that drives a verb through the binary takes the shared engine
  fixture and does not build its own.
- Nothing in a suite compiles the same program twice.
- Every test calls `t.Parallel()`. A test that cannot names the reason in a
  comment beside the call it makes instead.
- A check is one process over its own inputs. It reads no other check's
  output and leaves nothing another check reads.

## Discussion

### The check that died with its data

`TestEveryBacklogItemWasRead` read `wk-61af3a054e` for a list of `- wk-` lines
and checked each id was answered in the same detail. On 2026-09-02 the tokens
were rewritten to the shape in `work-token.md`. The list became the one-line
`Related:` form and the section holding the answers, about 8 kB, did not fit
under `detail_bytes`. The check could no longer pass, and no change to the
program would have made it pass. It was retired rather than given a fixture,
because a fixture copied out of the token it was reading compares a constant
with a constant.

The owner's ruling is broader than that one check: a test depends on
behaviour, not on documentation. Tracing a token to its evidence is the
trace's work, and the trace is not the battery.

### Provenance does not belong in a test

The first version of the rule allowed a token id in a comment, on the argument
that a citation is not a dependency. The owner refused it: a test says what
the program must do, and where the case came from belongs in the record that
holds cases. A comment carrying an id is a second copy of the record that
nothing keeps in step, and it goes stale the moment the token is retired.

Thirteen comments were rewritten to drop the id and keep the case. Each one
still says what was measured and what went wrong. None of them says on which
token, because a reader who wants that asks the record.

Five Python scripts sat in `util/checks/` without ever having earned the
promotion behaviour.md describes. They were analysis run once, not standing
checks, and none was in the battery. They are in `.se/scratchpad/` now.

### The thirty-five builds

`buildEngine` and `retroExe` each ran `go build` into `t.TempDir()`, from
thirty-five call sites across eight files. Linking this engine costs about
1.7 seconds and stays that way with a warm cache, because the cache holds
compilation and the cost is the link. Measured: 110 seconds for the engine
suite, 49 after one `TestMain` built the binary once and the helpers returned
it. The binary is only ever executed, never written to and never asked where
it lives, so one copy serves every test that wants it.

### One core, then eight

The engine suite held 434 tests in one package and not one of them called
`t.Parallel()`, so Go ran them one after another while seven of eight cores
idled. Adding the call to every test that can take it brought the suite from
49 seconds to 17. Two tests stay serial because they call `t.Setenv`, which
sets a process-wide value and which Go refuses to combine with a parallel
test. Each says so where the call would have gone.

The suite was already close to ready for it. Nothing calls `os.Chdir`, every
tree a test needs comes from `t.TempDir()`, and the shared engine binary is
read-only. The work was mechanical, so it was done by a script in the
scratchpad rather than by hand, and the script refused the two shapes it
could not judge instead of guessing at them.

### The battery runs at once

Every check is its own process over its own inputs, and the only thing making
them wait was the loop that ran them one at a time. Measured on eight cores:
the nineteen node checks took 21.7 seconds one after another, and the two
slowest, the engine suite and `engine-args-lifecycle`, now overlap. The
battery reports in list order rather than finishing order, so two runs differ
by their checks and not by their scheduling.

This is what puts the last rule above in the list. A check that reads what
another check wrote passed while they were serial and fails at random now.
