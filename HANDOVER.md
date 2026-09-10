---
kind: [[handover]]
status: done
urgency: soon
---

# The reader goes before trunk

Both halves stand. `./RUNME.sh work review <name>` gathers what a reader needs
and answers the two mechanical questions, with no model in it. Level zero
registers `review_branch`, runs that verb through `$.process.run`, spawns a
reader with the material and the standing rules, and answers one short report.

Three reviews run end to end on this box, and the third reads this branch. It
names three rules here that fire on nothing under test, all three correctly,
and this branch now carries a test for each. That is the reader paying for
itself on its first day.

# Read this first

`$.fs` on client 2.1.267 offers `read`, `write` and `list`. Level zero on trunk
calls `readFile`, `writeFile` and `listDir`, which the client holds nowhere.

| what breaks | what the session sees |
|---|---|
| `readGuidance` | no standing layer, so no rules and no canary |
| `takeHandover` | no brief reaches the agent, and none goes |
| `pool` over `spec/config/stop` | no stop rule, so the tooth votes on nothing |
| `readSurvey`, `readConfig` | vale and the judge look missing |
| `logHere` | level zero writes no log line at all |

Every one of those call sites sits inside a `try {} catch {}` answering empty.
So level zero comes up silent and looks alive. `.se/level0.stamp` is the tell:
it stays absent on a box whose session loads level zero.

`work/the-config-holds-numbers` carries the rename already. Take it from there,
or give it a branch of its own. Add a contract test that drives one `$.fs` call
against the running client, so the next rename says so out loud.

This branch leaves that code alone, because it runs deeper than the brief.
`spec/guidance/working.md` rule nine says to write it down.

# What stands

| the thing | where |
|---|---|
| the gathering and the report | `src/scripts/review.js` |
| the shape both halves read | `.claude/skills/level0/lib/review.js` |
| the tool and the spawn | `.claude/skills/level0/hooks/level0.js` |
| the five questions | `spec/guidance/reviewing.md` |
| the argument | `spec/rationales/reviewing.md` |
| the design | `spec/design_output/review.md` |
| the cases over fake doors | `test/level0/review.test.js` |
| the cases over a fake engine | `test/level0/hooks.test.js` |

`./RUNME.sh check` passes: the tests, the doors, `claude plugin validate`, and
the rules over the tree.

# What the spawn takes

`$.agent.spawn` stands on client 2.1.267, and one call proves it live:

    const said = await $.agent.spawn({
      prompt,
      description: "read work/<name>",
      subagentType: "general-purpose",
    });

| field | what it does |
|---|---|
| `prompt` | the task the subagent runs with, and the one field it needs |
| `description` | the few words the task shows as |
| `subagentType` | `general-purpose`, `Explore`, `fork`, or a plugin's agent |
| `model` | an alias or an id; absent lets the agent's own model decide |
| `background` | true lets the call answer before the subagent does |

It resolves `{ model, text, isError? }` once the subagent runs, and `{ deny }`
where a hook refuses the spawn. `text` carries the subagent's final message.

## Where it refuses

The hook answers the mechanical half alone in three cases, each carrying a
`reader` row that says why:

- the call throws, on a build whose `$` carries no `agent`
- the answer carries `deny`
- the answer carries `isError`

The report carries an answer that parses as no JSON under `reader`, entire.

# What one review costs

Measured on this box, over `work/the-config-holds-numbers`, a branch of seven
commits and a diff of 1300 lines:

| the half | seconds | model calls |
|---|---|---|
| the verb alone | 4 to 5 | 0 |
| the whole tool | 199, 245 and 254, over three runs | 1 spawn, plus the caller's own turn |

The verb's seconds go almost entirely to the worktree check. The reader is one
`general-purpose` subagent. It spends its own context on the diff and hands
back three rows of its own.

# Which question reads badly

None of the five, once the diff carries the right base. The reader answers each
one against the diff, and a person checks any of them in a minute.

Question two reads badly under a two-dot diff, and the fault is mine. The verb
first reads `git diff main..<ref>`, which the brief names. That diffs against
trunk's tip. So a branch 19 commits behind trunk shows every commit trunk holds
since as a removal, and the reader answers honestly:

    beyond     Two entire subsystems, unrelated to config/schema, are deleted
               and never disclosed in HANDOVER's 'what this branch leaves alone'

The branch touches neither one. Under `main...<ref>` the same branch and the
same question come back as three rows a person acts on:

    beyond     Trivial, unrelated cleanup: src/scripts/lnav-reads.js ...
               Diversion, not trivial: lib/config.js (new, 201 lines) is a full
               three-layer resolver. The brief asked only that ...

That is the judgement the brief wants from a model, and it takes the merge base
to get there. `rev-list` keeps two dots, because it counts the branch's own
commits.

Question five reads best of the three. It names each rule the branch adds, says
which a test drives with bad input, and says why the others fire on nothing.

On this branch it reads:

    tests      13 refusal/detector rules added. 10 carry a test that feeds bad
               input and asserts the refusal ... 3 fire on nothing under test:
               checkOn's 'no worktree opens on <ref>' branch ... and two of
               readerRuns' three spawn-refusal branches

Every one of those three is real, and each carries a test now.

# Is the report short enough

A clean branch fits on one line, which is the whole point:

    work/the-branch-gets-read   nothing to fix, and the merge is a person's.

A branch carrying eight things to fix runs about 25 lines. That reads whole,
and every row of it names a file or a rule. The prompt asks for one short line
an answer, and a model under-obeys that where it finds a lot. A cap on each row
holds the length, and it loses the detail that makes a row worth reading. Leave
that call to whoever reads this note.

# The retro

Every surprise this branch walks into, and what each one costs.

## A cloud box wants trust

`claude plugin list` on this box answers that it skips the skills directory,
because the workspace carries no trust. So level zero holds no ordinary cloud
session, and `spec/design_output/level0.md` says as much already.

Proving part two therefore takes one of the two ways that note names. This box
carries `hasTrustDialogAccepted: true` for this folder in `~/.claude.json` now,
which is box-local and travels nowhere. `/root/.claude.json.bak` holds the copy
from before.

## A long timeout throws

`$.process.run` takes `timeoutMs` up to ten minutes. The hook first asks for
fifteen, the call rejects, and the engine answers the session:

    level0 registered the tool review_branch but no tool.call hook answered
    this call

So a hook that throws reads exactly like a hook nobody writes. The gathering
asks for five minutes now.

## The spawn wants a tool

A `tool.call` hook waits 45 seconds on `$.process.run` and answers fine. A
`prompt.submit` hook awaiting `$.agent.spawn` loses its dispatch, and nothing
after the await runs. So a spawn belongs behind a tool, which is where this one
sits.

## RUNME writes to both streams

The hook first runs `sh RUNME.sh work review <name> --json`. The install script
writes to standard output and standard error both. So a failing gather carries
those lines back, and the caller reads them as an injection attempt. The hook
runs `node src/scripts/cli.js` now, and reads the verb alone.

## Two halves both say brief

`report` first takes one object. The verb's `brief` is the brief's whole text,
and the reader's `brief` is its judgement. So a report with no reader behind it
prints the brief entire. `report(material, read)` takes two arguments now.

## A worktree costs no download

`RUNME.sh` inside a fresh worktree downloads Vale, Biome and lnav into that
worktree's own `.se/bin`, which is 190MB a review. Copying `.se/tools.json` in
and running the command line directly skips the install altogether. Every
surveyed path is absolute, and names a binary this box already holds.

## The retro wants past tense

`PastTense` refuses every sentence this chapter reaches for first, because a
retro says what happens. Writing it in the present costs a rewrite of the whole
note. The rule holds, and the note comes out saying what stands today. That is
the better note.

# Dead ends

- `claude --plugin-dir <probe>` loads a probe plugin beside level zero, until
  the workspace turns trusted. After that the probe's tools register nowhere,
  and its calls answer `Tool not found`. Probe before you accept the trust, or
  probe by hanging a hook on level zero itself.
- `grep` over `cli.js` finds no engine surface, because the strings sit split.
  `/plugin-types <dir>` is the one way to read what this build offers. It costs
  one `-p` turn, writes `claude-code.d.ts`, and that file is where the rename
  above shows without running anything.

# What remains

1. The `$.fs` rename above, which holds every other rule in this tree.
2. A cap on how long one report row runs, where a report ever reads too long.
3. `work review` reads one branch. `work collect` names every branch at `done`,
   and reviewing all of them takes a loop nobody writes yet.

## How this branch runs

Level zero deletes this file when it reads it, so the copy in your context
is the only one left. These steps write it back.

1. Run `./RUNME.sh work sync` FIRST. It takes main into this branch, so
   an old branch works against what the tree holds now. Resolve any conflict
   before you start, because a conflict found later costs the work already
   done.
2. Commit and push each time you finish a thing. A cloud box dies and takes
   its working tree with it.
3. Write your result and your retro into `HANDOVER.md`, at the root, replacing
   this brief. Say what surprises you and every dead end you walk into.
4. Run `./RUNME.sh work done`, which sets the status and pushes.
5. Run `./RUNME.sh work release` instead where you stop early, so the branch
   goes back to `todo` for somebody else.
6. Leave the merge into main to a person. A cloud box opens no pull
   request, and trunk only ever comes towards you.
