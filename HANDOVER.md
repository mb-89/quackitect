---
kind: [[handover]]
status: done
urgency: soon
---

# One door per outside thing, and a fake for each

The doors stand, the tree pays the debt behind them, and the suite says what
it costs.

## What stands on this branch now

| thing | where |
|---|---|
| the four doors | `src/doors/proc.js`, `disk.js`, `git.js`, `clock.js` |
| a fake for each | `src/doors/fake/`, git among them |
| the contract tests | `test/contract/`, one per door and three more |
| the design record | `spec/design_output/doors.md` |
| the check no pattern holds | `./RUNME.sh doors`, which `check` runs |

## The numbers

| suite | tests | time |
|---|---|---|
| before, one folder | 74 | 1007ms, 17 of them spawning Vale |
| after, `src/level0/test` | 61 | 250ms, no spawn at all |
| after, `test/contract` | 40 | 840ms |
| after, both | 101 | 1030ms |

A person working reaches for the memory suite, and it costs a quarter of what
the old one costs while holding 27 more cases. The whole run costs what the old
one costs and drives four real doors on top.

## What each step lands

1. `.vale.ini` scopes both new rules. Prose carries neither. The doors, their
   fakes and the hooks module stand outside `DoorsOnly`, and `FakeDoorsInTest`
   reaches `src/level0/test` alone.
2. `DoorsOnly` passes five modules that reach nothing outside: `node:path`,
   `node:url`, `node:test`, `node:assert` and `node:assert/strict`. Every test
   needs the runner and the assertions, so refusing those refuses every test.
3. The Vale cases sit in `test/contract/vale.test.js` and `vale-fix.test.js`.
   Two files let node run them beside each other, which halves the wall clock.
4. `test/contract/tree.test.js` holds every case reading a tracked file: the
   guidance notes, the scripts, the judged rules and the editor settings.
5. `src/scripts/cli.js` takes its doors and imports no `node:` module that
   reaches outside. The process door takes `inherit`, so `fix` and `test` hand
   their output straight through.
6. `src/level0/test/work.test.js` drives `take`, `done`, `release`, `list`,
   `collect` and `close` through a fake git and a fake disk. Nineteen cases,
   and the verbs carry a test for the first time.

## The retro

**The brief describes a tree that stands ahead of the one it lands on.** It
names `.vale.ini` scoping and a `spec/guidance/testing.md` carrying the rules.
The guidance stands, and the scoping is missing, so `DoorsOnly` fires 45 times
over the doors themselves, the hooks module and every test. Read the lint first,
ahead of the brief, and save the hour that costs.

**Taking main in conflicts, and the conflict hides a defect.** `work.js` moves
to doors here, and `main` adds `urgency`, `depends_on`, `merge` and `close`.
Git resolves the `list` verb by taking both halves, which leaves a call to a
`root` this file no longer names. A conflict git resolves alone deserves
the same reading as one it hands over.

**`node:test` breaks the rule as written.** The first `DoorsOnly` refuses every
`node:` import, which reaches the test runner and the assertions:

- a rule refusing what every file needs is a rule somebody switches off
- five pure modules pass by name, and the rationale says which five

**A tracked file makes a poor case for a fake.** Nine cases assert over what the
tree ships: the guidance notes, the scripts, the editor settings. Seeding a fake
disk with what the case wants to find asserts nothing about the tree, so they
drive the real disk and stand in `test/contract`.

**The pointers name sections that stand nowhere.** `work.js` points at
`#a-merged-branch-goes` and `#a-merged-branch-closes`, and `src/doors/*.js`
points at `spec/design_output/doors`. Neither target exists. Both stand written
now, and nothing checks a pointer, which is worth a rule of its own.

## What holds, and what stands open

- `./RUNME.sh check` passes: 101 tests, the doors check, and the rules over the
  tree with no breach.
- Vale matches a section against a relative path alone. An absolute path
  matches no section at all. So the editor draws fewer rules over code than the
  command line draws, and that gap is worth a branch.
- `src/level0/hooks/level0.js` carries an unused `biomeBin` import. Biome warns,
  the linter passes it, and it stands as it stands.

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
