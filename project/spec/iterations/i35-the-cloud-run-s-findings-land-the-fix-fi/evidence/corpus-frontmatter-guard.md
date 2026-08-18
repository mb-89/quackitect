---
form: corpus-frontmatter-guard
by: agent
signed_off: 2026-08-17T12:09:33.715Z
authors: agent
files:
---

# Evidence form / corpus-frontmatter-guard

## current_situation

SE-C-135 checks that a write ARRIVED VERBATIM, never that it was WELL-FORMED, and se_file_write is the one lane verb that replaces a whole file with no structural guard.

Nothing looked at the corpus the queries and coverage checks are built on.

## built

project/deliverable/engine/bin/preflight.ts gains a sweep over project/spec/trace/**/*.md. Three failures, each named on the file: a note that opens no frontmatter block, one that opens a block and never terminates it, and one whose block does not parse.

THE UNTERMINATED CASE IS THE ONE THAT HID. splitNote reports fenced: false for it, which is indistinguishable from a note carrying no frontmatter at all — so readKeys answers {} and never throws. The fence is therefore counted BEFORE the parse, because the parse cannot see it.

REPRODUCED FIRST: a trace note with an unterminated block was written into the corpus and preflight printed 'preflight green' over it. After the change the same file failed by name, and the clean corpus passed.

MEASURED: 820 notes, all with a well-formed block, 0 parse failures.

Pinned by three cases in project/deliverable/tests/preflight.test.ts.

## follow_up

- The sweep covers spec/trace only. The rest of the corpus — machines, guidance, the iteration records — has the same exposure and no guard.
- A structural check at the WRITE would beat one at boot, but se_file_write is generic and the corpus rules are not.

## anything_else

ONE REGRESSION CAME OUT OF THIS CHUNK AND THE SUITE CAUGHT IT. A literal "---" written beside a !== read as a parsed command-line switch to the help conformance check, which then demanded that --help document a flag named ---. The fence is now built rather than written, and that check earned its keep.
