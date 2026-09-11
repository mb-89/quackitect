---
kind: [[handover]]
status: todo
urgency: now
depends_on: [the-private-half-stays-home]
---

# Where it stands

The owner rules that nothing private reaches git, and names the commit as the
door that holds it: a check reads the delta a commit carries, and a delta
carrying something private refuses the commit. The branch
`the-private-half-stays-home` brings the checks themselves over from v3, the
six-word run, the opaque token and the shapes, and puts them at the write door
and on the sweep. It also cleans the tree of what stands there today, the
dates in prose, the handle in the plugin manifest and two fixtures naming a
person's user. This branch puts the checks at the commit.

The Bash door in `lib/bash.js` reads every `git commit` today, to lint the
message. So the door already stands where the delta passes, and it reads the
box through the process door.

# What waits

| the piece | where | proves it |
|---|---|---|
| the delta check | `lib/private.js`, over the text of `git diff --cached` | a staged file carrying a shape, a name of the box or a run from `.se/notes` refuses |
| the commit in the Bash door | `lib/bash.js` | `git commit` with a private delta refuses, naming the file, the line and what leaks |
| the git hook | `.githooks/pre-commit` | a commit a person makes by hand refuses the same way |
| the hook wired | `RUNME.sh`, `install.sh`, `RUNME.ps1` | `./RUNME.sh` sets `core.hooksPath`, and `doctor` says so |
| the allow list | `lib/private.js` | the nobody users pass, and nothing else does |
| the added lines alone | `lib/private.js` | a line the delta removes never refuses, so a leak can leave the tree |
| the escape | `lib/bash.js` | `git commit --no-verify` refuses on a cloud box, and the desk box logs it |

# The delta

The check reads what a commit adds, and nothing else. `git diff --cached
--unified=0` names each file and each added line with its number, so a
refusal points at the line the person or the session sees. A removed line
passes, because taking a leak out of the tree is the one commit that must
always land.

The three checks are the ones the privacy branch builds, and this branch
calls them over the added lines:

| check | reads |
|---|---|
| the shapes | an email address, a phone number, a date in prose, a home path with a user outside the allow list |
| the box's names | the user name, the home folder, the git name and email of the box |
| the run and the token | every file under `.se/notes`, against the added lines |

The allow list holds the nobody users, `user`, `root`, `one` and `somebody`,
and nothing else. The handle owning the origin stands in git's own metadata
and in no tracked file, once the privacy branch names the project in the
manifest. A binary file and a file under `.se` stay out, and `.se` stays out
of git already.

# Two doors, one check

| the commit comes from | the door |
|---|---|
| a session, through the Bash tool | `lib/bash.js`, before the command runs |
| a person, in a terminal | `.githooks/pre-commit`, which git runs |

Both call the same function over the same delta, so the two refuse the same
thing in the same words. The pre-commit hook runs `node` on
`.claude/skills/level0/lib/private.js` with the delta on stdin, and answers
the exit code git reads. `./RUNME.sh` sets `core.hooksPath` to `.githooks`
once, the way it links the editor, and `doctor` names the path it finds.

`--no-verify` skips a git hook by design. On a cloud box the Bash door refuses
it, because a cloud box has no person behind it. On a desk box the door lets
it pass and writes a `warn` line, because a person owns their own escape.

# How to build it

Test the delta reader as a pure function over a fixture diff, with one added
line that leaks and one removed line that carries the same text. Test the
Bash door with a fake process answering a staged diff. Test the hook script
against a fixture on stdin, and its exit code. Say in the handback how long
the check takes on a commit of a hundred files, because every commit pays
it.

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
