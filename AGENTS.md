# Working in this tree

Read `spec/guidance/voice.md` before writing prose. Level zero holds those rules at the
write door, so a write breaking one is refused with the reason.

## What holds you here

The voice rules are checked when you write a Markdown or text file. A refusal
names the line, the phrase and what to write instead. It then asks you to hold
that rule for the rest of the turn.

Do that. The refusal costs a round trip and it teaches the whole turn, so
meeting the same rule twice is waste.

The rules also reach you as a section of the system prompt. They are computed
by the module and written to no file, so there is nothing in the tree to keep
in step with them.

## The tools you have

- `voice_check` reads text and answers the breaches with what to write instead
- `voice_format` applies the fixes a program can make
- `voice_rules` answers the rules this project holds, each with its reason

Ask `voice_check` before writing a long document. One call is cheaper than a
refusal per paragraph.

## Changing a rule

Rules live in `src/level0/lib/rules.mjs`, declared once. Change one there and
the write door, the linter and the language server all follow.

Write a test in `src/level0/test/` for any rule you add. Run `./RUNME.sh check`
before you finish: it runs the tests and then the linter over the tree.

## Changing the module

`src/level0/hooks/level0.mjs` holds the doors and no rules.

A plugin loads once per process at session start, so the session that changes
the module is blind to the change. Run `claude plugin validate src/level0`
after editing it. It reads the source and reports what it hooks and calls, and
`claude --debug` names a module the engine refused to load.

`$` is always spelled `$.noun.method(...)` at the call site. The validator
refuses a computed or optional access on it.
