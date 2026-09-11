---
kind: [[handover]]
status: todo
urgency: now
---

# Where it stands

The owner rules that private data lives under `.se`, which git ignores, and
that nothing reaching git may be private. Private means a person's name, a
username, a path on a disk, and unstructured input such as a note somebody
stores for later and cleans up never. A date stays public, because the design
outputs carry them.

v3 holds the guard this branch brings over, on `origin/v3` under
`deliverable/engine/pool.ts` and `deliverable/tests/pool-mint.test.ts`, with
the wording under `guidance/refusals.md` as clause `SE-C-140`. Read those
three first. The shape is one door: a raw note stays home, the mint writes the
tracked statement, and three checks hold the door.

| check | what v3 refuses |
|---|---|
| the run | a statement sharing a run of six or more words with its note, after case, whitespace and punctuation flatten |
| the token | a single opaque token carried over, a path, an address or a secret, because one word leaks |
| the second door | a direct write into the tracked folder, past the mint |

v3 writes one limit down, in a test named for it: a bare name passes, because
nothing tells a name from any other word, and the author stands alone against
that. Keep the test and its name.

# What waits

| the piece | where | proves it |
|---|---|---|
| the shapes rule | `spec/config/styles/VoiceVale/Private.yml` | an email address, a phone number and a home path refuse in any tracked text |
| the box's own names | `lib/tree.js`, as `NothingPrivateTravels` | the user name, the home path, and the git name and email of the box refuse in a tracked file |
| the run and the token, at the door | `hooks/level0.js`, in the write door | a tracked write sharing six words with a file under `.se/notes` refuses, and one carrying a path from it refuses alone |
| the second door | `lib/bash.js` | `git add` naming a path under `.se` refuses, with `-f` or without |
| the limit, written down | a test under `test/level0` | a bare name passes, and the test says so in its name |
| the judged half | `spec/config/styles/VoiceJudged/Role.yml` | the judge refuses `person`, and passes `role` |
| the guidance line | `spec/guidance/voice.md` | the note stays under its cap |

# The shapes

`Private.yml` holds the mechanical shapes in one existence rule: an email
address, a phone number, and an absolute path under a home folder on any of
the three platforms. A cloud box writes paths under `/home/user`, and the
design outputs carry them, so the rule reads `user` and `root` as nobody.

`NothingPrivateTravels` reads the box at lint time, the way `SurveyFindsNode`
reads it: the user name, the home folder, and `git config user.name` and
`user.email`. It walks every tracked text file for them. So the same tree lints
clean on a cloud box and names the owner on the owner's desk, which is where
the leak starts.

# The door

The private half is `.se/notes`, one file per note, which a later level fills.
Today the folder stands empty or absent, and the door reads nothing. The
check runs at every tracked Write and Edit:

1. Flatten both texts: lower the case, drop the punctuation, fold the
   whitespace, the way v3's `longestSharedRun` does.
2. Refuse a shared run of six words or more, and quote the run in the
   refusal.
3. Refuse a shared opaque token, a word carrying a separator inside it, a
   slash, an at sign, a backslash or a dot between letters.

The refusal names the run or the token and says the road: say what the thing
is, in words written for a reader who never sees the note. Keep v3's wording
where it reads well.

`.se/HANDOVER.md` stays outside the check. A session writes it for the next
session on the same box, and the brief on a branch is the authored half.

# The judged half

A name passes every pattern. So `Role.yml` asks the judge one question per
span, on the tracked notes alone: does this text name a person, or a role?
The labels are `role` and `person`, and the rule refuses `person`. The roles
this tree uses are the owner, the agent, the reader, the reviewer and the
maintainer, and the guidance line says so.

# How to build it

Port v3's two functions, the run and the tokens, test for test, over strings
alone. Test the door with a fake disk holding one note and one write that
shares a run, and one that shares a path. Test the tree rule with a fake box
naming a user, and a fixture file carrying that name. Test the Bash door with
`git add -f .se/notes/one.md`. Run `./RUNME.sh check` over the tree, because
the tree may carry a shape today, and say in the handback what it names.

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
