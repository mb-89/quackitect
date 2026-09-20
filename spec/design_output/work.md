---
kind: [[design_output]]
---

# Scope

`src/scripts/work.js` holds every verb over a work branch, and
`src/engine/group.js` holds what a group's ticket reads and writes. This note
covers the branch, the group on it, and the round trip.

# What a work branch is

One piece of work, held by one branch named `work/<name>`. The branch carries
its group ticket at `spec/tickets/<name>.md`, and that ticket names the branch.
The branch is the unit, and a session works it whole.

# A version branch stands

A branch named `v` and a number holds a whole earlier tree. Each one is an
orphan, so no other ref carries what it carries and a delete loses it whole.
One such delete costs this tree a branch, and the recovery reads the forge's
activity log for the hash the branch carries.

So both push doors refuse the command before git runs it:

| door | reads |
|---|---|
| the Bash door, which an agent meets | the command line, in `versionRefs` |
| the pre-push hook, which a terminal meets | the refs git pipes in, and the zero that means a delete |

| what a command does | what a door says |
|---|---|
| `--delete`, `-d`, `-D`, or a ref pair with an empty left side | refused, as a delete |
| `--force`, `-f`, `--force-with-lease`, or a ref pair opening with a plus | refused, as a rewrite |
| a push that moves the branch forward | nothing, and it stands |

`VERSION` in `.claude/skills/level0/lib/trunk.js` says what a version branch
is, and both doors read that one name. A branch merely opening with `v` stands
outside it, so `v4-recovered` pushes and deletes the way any branch does.

The doors run on this box alone. A branch rule on the forge is what holds for a
clone nobody here controls, and the owner sets that.

# A group is a ticket

A group is a ticket whose work is other tickets. It stands at
`spec/tickets/<name>.md` on the branch `work/<name>`, carries `process:
[[group]]`, and its children are the tickets naming `<name>` under `group`. So
one schema covers everything that moves, and `spec/schemas` names no group kind.
[[spec/schemas]]

| what | where |
|---|---|
| the group | `spec/tickets/<name>.md`, on `work/<name>` |
| its route | `spec/processes/group.yaml`, copied at the mint |
| its children | every ticket under `spec/tickets` naming it under `group` |
| the claim | the push that writes the record |

A group of one ticket is the ordinary case, and a group of five is the same
shape.

# The take writes the record

`take` claims a group by writing one entry into the group ticket's `record`:

    record:
      - step: children
        hand: box d462e994b4cef
        hash_before: a1b2c3

`step` is the leaf the group stands on, `hand` names the box out of
`.se/.runtime/identity.json`, and `hash_before` is the branch tip at the claim. The push decides:
two boxes reaching for one group means one of them meets a rejected push and
takes the next.

The take reads the group before it writes that entry, through the same line
`branch done` reads. A group whose open children hold no step a hand can take
stays at `todo`, and the take names the step each child waits at. So a cloud
box stops here, on the branch, and the record keeps the shape it holds.

The hand names the box and no person, because the ticket travels and
`spec/guidance/private` binds what a tracked file carries. [[spec/guidance]]

## The record quotes its value

A record's value comes off a hand, a hook or a reviewer, so it carries what
it carries. A colon and a space in it opens a mapping to every YAML reader,
and the frontmatter then reads as broken. Vale reads no line of such a file,
and the lint over the tree exits one. The ticket door refuses the hand that
repairs it, because the record is the engine's.

So `quoted` in `src/engine/group.js` wraps a value in double quotes where
it carries any of these, and escapes the backslash and the quote inside:

| what | why a reader trips |
|---|---|
| a colon and a space | it reads as a mapping |
| a leading quote, bracket, brace or YAML mark | it reads as a collection or an anchor |
| a hash | it opens a comment |
| a trailing space, or nothing at all | it reads as another value |

## Held derives from the record

A group holds where its newest record entry carries `hash_before` and no `hash_after`.
Nothing writes a status beside it, so a branch nobody holds takes no write at
all:

| the record says | the group stands at |
|---|---|
| nothing, or a newest entry with `hash_after` | `todo` |
| a newest entry with `hash_before` and no `hash_after` | `held` |
| `state: closed` on the ticket | `done` |

# One verb answers git

`branch answer` writes what git knows into one file, and a board, a terminal and
the pull all read that one answer:

| the key | what it carries |
|---|---|
| `branches` | every work branch, its tip, the time on it, its status and its kind |
| `branches[].tickets` | the tickets on that branch, each with its state and its step |
| `loose` | the tickets on trunk naming no group |
| `queue` on a ticket | the place the pull hands it out, which `--queue` writes |

The file stands beside the work a reader reads, so the index walks it and a
write wakes a reader. The engine's own state stays in the runtime half, which
the index skips. A reader meeting no file says so, and the board draws what the
notes hold.

# The listing reads git once

`branch list` reads git in four asks, whatever stands on the remote:

| the read | the process | what it answers |
|---|---|---|
| the refs | `for-each-ref` | every work branch, its tip, the time on that tip, and whether trunk holds it |
| the paths | `cat-file --batch` | the ticket names each tip carries |
| the contents | `cat-file --batch` | every ticket the paths name |
| the base | `merge-base`, once a branch | what trunk and that branch share |

The fetch stands off that path. `branch list --fetch` asks for it, and `take`
and the routine's trigger fetch on their own, because each acts on the remote.

A tree object carries a name as bytes, so the paths read raw. For details, see
[[spec/design_output/doors#a-raw-run-keeps-bytes]].

git answers the base red where trunk and a branch share none, which is what a
rewrite of trunk leaves behind:

| what git answers | the standing | what follows |
|---|---|---|
| a commit | the words below | the branch keeps the standing its note says |
| red | `orphan` | the listing marks it, and `take` passes over it and says so |

A branch at `orphan` reaches no sync, so a box takes it and stalls. The merge
reads the same base, so one read answers both.

# A row per group

`branch list` names one row per branch and one per loose ticket on trunk:

| column | says |
|---|---|
| the name | the branch, or the ticket's file name |
| the status | `todo`, `held`, `done`, `merged` or `orphan` |
| the why | the mark, or what it waits for |
| the age | the age of the tip, on a held branch |

A loose ticket is one on trunk naming no group, which is backlog a person has
yet to sort. A ticket in a group shows nowhere on trunk, because its branch is
responsible for it.

## A ticket under its group

A group row carries a row per ticket naming it, indented under it, read off the
branch tip `list` already fetches. So a reader on trunk sees the loose tickets
and the held ones together, and runs no `git show` by hand:

| column | says |
|---|---|
| the name | the ticket's file name |
| the status | `open` or `closed` |
| the why | the step it stands at, or its mark where it names no step |

## A stale group is yours

There is no lease. A branch somebody holds stays held until a person looks, and
the age of the tip is the signal:

| the tip's age | means |
|---|---|
| under `work.staleAfter` | a box holds the group, and nothing asks |
| past it | the group is a person's, and `list` puts it under yours |

Under yours it carries three answers, and each is a verb:

| the answer | the verb | what it does |
|---|---|---|
| release it | `branch release <name>` | writes `hash_after`, so the group stands at `todo` |
| take it over | `branch take` | claims it again, with a record entry of its own |
| close it | `branch close <name> --force` | drops the branch, and the work on it |

`work.staleAfter` stands in `spec/config/level0.json`, and the rule derives from
the tip, so nothing writes to a branch nobody holds.

# A box leaves

`branch done` on a group branch writes `hash_after` into the newest record entry, which
is the box saying it leaves. Then it reads the children:

| what stands | what the group becomes |
|---|---|
| no ticket in it stands open | `state: closed`, `reason: done` |
| one of them stands open | `state: open`, and `done` names each open one |

So an open group nobody holds comes back to the queue, and a person answers on
its branch.

# A person step leaves

A step whose `by` reads `person` stops no cloud box, which answers it and moves
on. A desk hands one out instead: `branch unblock <ticket> <successor>` takes
the ticket standing at that step and hands its rest to a ticket outside the
group:

| what it reads | what it writes |
|---|---|
| the ticket stands open, in this group, at a step `by: person` | the ticket closes `state: closed`, `reason: became`, `successors: [<name>]` |
| the successor stands open and names no group | the question that step asks, under the successor's `Discussion`, beside the ticket it comes from |

A question rides the frontmatter on one line, so it carries its own lines as
`\n`. The unblock writes them back under `Discussion`:

| the question | how it lands |
|---|---|
| one line | a list item under the bullet |
| several lines | its own block, so a table stays a table |

A semicolon whitespace follows cuts one question from the next. So a word
carrying a semicolon stays whole.

So `branch done` meets no open child, the group closes, and one push carries the
successor with it. The person answers on a ticket of their own, and every step
behind them runs on.

The verb refuses four things:

- a hand standing on a cloud box, which answers the step itself
- a ticket standing where a hand can take it
- a successor standing inside the group it frees
- a successor nobody holds yet

A desk mints that last one with `./RUNME.sh mint ticket`, and writes what stands
open into its ask. [[spec/guidance/cloud]] says why the cloud road differs.

## A successor stands on question

A successor stands on [[spec/processes/question]], and the verb takes it because
that route opens at a step waiting for a person:

| the step it opens at | what it buys |
|---|---|
| `answer`, under `by: person` | the person answers on their own time |
| `do`, under `by: anyone` | the hand behind the answer carries it out |

A route opening where an agent can work hands the question back to an agent, and
the verb refuses it. So a desk mints the successor off this route:

    ./RUNME.sh mint ticket spec/tickets/<name>.md --process=question

`test/contract/process.test.js` reads that route off disk and holds it open, and
`test/level0/unblock.test.js` mints off it and runs the verb.

# One handover stands

`.se/HANDOVER.md` is untracked, stands on one box, and carries what the next
session on that box reads. Level zero reads it at `session.start`, hands it to
the agent as a context block, and deletes it. So it stays fresh, and nobody
keeps a rule about clearing it.

# What the standing says

A branch's standing comes off its group ticket, and the record is what moves:

| standing | means | who sets it |
|---|---|---|
| `todo` | waiting for somebody | `branch open`, and `branch release` |
| `held` | a session has it | `branch take`, by pushing an open record entry |
| `done` | a hand answered every leaf it takes | `branch done` |

A claim is a push. Two sessions reaching for one branch means one of them meets
a rejected push and takes the next. For details, see
[[spec/design_output/work#held-derives-from-the-record]].

# The round trip

1. `./RUNME.sh mint ticket spec/tickets/<name>.md --process=group` writes the
   group ticket on `main`, and a desk fills its ask.
2. `./RUNME.sh branch open <name>` pushes `work/<name>` off trunk, standing at
   `todo`.
3. A session works the branch and pushes to it. A cloud session stops there,
   because the harness holds `main` shut and a cloud box opens no pull request.
4. That session answers the group's leaves, writes its retro under the ticket's
   retro chapter, then runs `./RUNME.sh branch done`.
5. `./RUNME.sh branch list --done` names every branch standing at `done`.

The pull's hand-out says what a branch does next, so no branch carries a copy
of it. For details, see [[spec/design_output/pull#the-hand-out]].

# A branch moves clean

`branch take` and `branch release` both switch onto a branch and reset it hard
onto origin. That reset makes the checkout match what the queue holds, and it
drops whatever the box holds past it.

So `dirty` guards every branch move, and work stands two ways:

| what stands | what reads it | the way out |
|---|---|---|
| a change nobody commits | `git status --porcelain` | commit it, or put it aside |
| a commit origin lacks | `rev-list origin/<branch>..<branch>` | push it |

Either reading refuses the move and names its way out. A hand wanting the work
gone resets by hand, which says so out loud.

One reading alone leaves a hole. A commit stands outside the working tree. So a
box committing its work moves it into the reset's path.

The guard reads a `work/` branch alone. Trunk takes a merge a desk pushes later,
and `onBranch` resets no trunk.

| the verb | what it hands the guard |
|---|---|
| `branch release` | the branch it names |
| `branch take` | the branch it picks, once the sort names one |

So each verb reads the branch the reset lands on, beside the branch the box
stands on. The take reads twice, because it learns which branch it lands on
after the first reading.

# Trunk comes in first

`branch sync` merges `origin/main` into the branch. `branch take` runs it, so a
routine pays nothing to remember it. A conflict then stops the take, while the
work it costs still sits ahead.

## Trunk comes in last too

A branch greens its own tip, and the merge result reads green nowhere. So a
branch older than a rule passes `branch done` and turns trunk red at the merge.
This tree hits that twice in one day.

`branch done` fetches trunk and refuses a branch trunk stands ahead of:

| what it finds | what it does |
|---|---|
| the branch carries every commit on trunk | it reads the battery next |
| trunk holds a commit the branch lacks | it refuses, and names `branch sync` |

So the battery a branch claims stands over the tree the merge produces. The
contract carries the same step, because a reader acts on it before the verb
ever runs.

# A box landing on trunk

A cloud session starting on `main` holds no work, because trunk carries no work
branch. Level zero notices that and hands over a block naming
`./RUNME.sh branch take`.

So a box needs no prompt about work at all. Starting it on trunk is enough, and
saying "take work" only agrees with what it already reads.

Three things hold together for that block to appear:

- a cloud variable carries a value
- the branch is `main`
- no handover reaches the session

A desk session sees none of it.

# A box writes its branch

A box starts on trunk and leaves it in its first command. The window for a
commit landing wrongly is the minute before that.

Level zero refuses, on a cloud box holding a work branch:

- a `git commit` made while standing on `main`
- a `git push` naming `main`, from any branch

The refusal names `./RUNME.sh branch take` as the way out. A desk box meets none
of it, because a box off the cloud merges by choice.

The branch in hand is the whole of the reason. A cloud box takes a work branch
out of the queue and hands it back the same road. So trunk reaches that work
through the hand-back alone. A cloud session outside that flow answers to the
owner, and the green battery is the door it meets. The branch it stands on says
which session it is.

`branch take` and `branch done` reach git inside the command line, so the door sees
the verb and leaves the plumbing alone.

# The mark, and what waits

The frontmatter carries two more fields, and `branch take` reads both:

    urgent: true
    depends_on:
      - doors-and-fakes

A flow list on one line, `depends_on: [a, b]`, says the same as the block
list, with or without quotes around a name.

`take` drops every branch waiting on one still at `todo`, `held` or `done`,
then puts the marked branches first. A branch carrying no mark stands under
them, in the order the score sets. [[spec/tickets/the-queue-is-a-score]]

## A dependency waits for trunk

A branch meets its dependency once trunk holds the branch it names, or once that
branch goes because somebody merges and closes it. `done` alone holds the
dependent, because `done` waits on the merge, which a box off the cloud runs.
So a chain of work runs
itself in order, and each link starts from the one before it.

`take` merges trunk in. A dependent taken before its dependency lands starts
from a trunk carrying none of that work. It then builds that work a second time.

`branch list` shows what each branch waits for, in place of its mark.

# The battery answers first

`branch done` reads a stamp before it claims anything. `./RUNME.sh check` writes
`.se/.runtime/check.json` on every run, naming the commit it stands on:

    { "sha": "...", "ok": true, "clean": true, "at": "..." }

`done` refuses on four counts, and each names itself:

| the stamp says | done answers |
|---|---|
| nothing at all | no check runs here |
| another commit | the check names that one instead |
| an unclean tree | the check reads what the commit lacks |
| red | the check says red, with the time |

So `done` stops meaning "the session believes this passes". It comes to mean
"a program runs on this commit, and it passes".

The stamp lives under `.se`, which git ignores, so it travels nowhere. A
different box reads its own answer, and `.github/workflows/check.yml` answers
for a machine with no stake in it.

A push to trunk reads the same stamp at two doors, and each stands without the
other. The Bash door refuses a session's push on a red, stale, unclean or
absent stamp. `.githooks/pre-push` refuses the same push from a terminal, or
from a session that runs no plugin, and `install.sh` points git at it beside
the commit hook. A push to a work branch meets neither, because mid-work
carries red.

## One verb feeds that stamp

`./RUNME.sh commit "<message>"` lands a commit and leaves the stamp that `done`
reads, in four steps:

| the step | what it runs | what it answers on red |
|---|---|---|
| the message | `messageFaults`, exported from `src/bridge/bash.js` | every finding at once, and no commit |
| the commit | `git add -A` and `git commit`, in the verb | what git says, with the staging back |
| the check | `./RUNME.sh check`, which writes the stamp | what the check says, and no push |
| the push | `git push origin`, which the pre-push door reads | what that door says |

Each step prints what its run answers, on both streams. The check writes its
faults to the error stream, so a read of one stream alone names a line standing
clean.

What the run leaves behind:

- nothing stages before the message reads clean, so a refused message leaves the tree standing
- the push door reads the stamp this run writes, so no stale stamp stops a clean commit
- `--no-push` leaves the branch where it stands

The message read stands with the bash door, which reads the same rules over a
`git commit` a hand types. For details, see
[[spec/design_output/bash#a-commit-message-meets-voice]].

# A merged branch goes

`branch merge <name>` runs on `main` and takes a branch standing at `done`. A
group stands at `done` where its ticket reads `state: closed`. It merges with
`--no-ff`, so the branch keeps its shape in the history.

A conflict stops the merge and leaves it standing, because resolving it belongs
to the person merging.

## The merge lands the truth

While a branch stands, its copy of the group and of its tickets is the record.
So `merge` reads trunk against the branch point before it merges anything:

| what it finds under `spec/tickets` | what it does |
|---|---|
| trunk's copy matches the branch point | it merges |
| trunk moves a ticket the branch touches | it refuses, and names the lines |

Then it runs `./RUNME.sh check` on the merge commit itself, which is the one
tree nobody tests before this point. A red check resets trunk to its own tip
again, so `main` takes a branch only where the merged tree passes.

## The merge frees the tickets

An open ticket of the group loses its `group` field inside the merge commit. So
a ticket waiting on a person stands loose on trunk, where `branch list` names it
and a person sorts it. A closed ticket keeps its `group`, because the pair is
the history of one group and what it holds.

# A merged branch closes

`branch close [name]` deletes a branch git says is inside `main`, here and on
origin. Naming no branch closes every one of them. It reaches two kinds:

| branch | cut by | throwaway once |
|---|---|---|
| `work/<name>` | `branch open` | trunk holds its commits |
| `claude/<name>` | the platform, for a routine run | trunk holds its commits |

Deleting a remote branch whose merge sits on this box alone loses the work. So
`close` counts what local trunk holds beyond origin, and refuses while that
number stands above zero. Push trunk first, and the merge outlives the branch.

`close <name> --force` deletes a branch standing outside trunk, which drops the
work on it.

# An experiment decides

A trial stands under a folder of its own while its question is open, and it
carries a ticket of `spec/processes/experiment` from its first day. That route
runs `run`, then `decide`, which a person takes:

| the decision | what follows |
|---|---|
| keep | the code moves into the tree, and the folder under `.claude/skills` goes |
| drop | the code leaves, and the ticket closes on the reason |
| grow | a ticket of its own carries it, and the experiment closes `became` |

`retro audit` answers the trials standing open, and the retro's `audit` step
runs it as a command its evidence names. A need names a verb a box holds, and
reads the tree nowhere. So the hold stands in the evidence, and the need stands
beside it.

The audit's checklist carries the same rule for a hand to read, and points at
the verb. The verb owns the rule, because a hand reading a list misses what a
walk of the tickets answers.

A trial minted before this process ends under the ticket closing it, which
records the decision and the reason. Every trial after this one carries a
ticket of the process from its first day, as the route above says.

# A box off a branch

A routine run starts on a branch the platform names, such as
`claude/gracious-hawking-zepc6h`, so asking whether the branch is `main` answers
no on every routine. What matters is standing outside a work branch, and that is
what level zero asks.

# Why a routine needs this

A routine starts on `main` and takes no branch argument. A person names the
branch to a pointed cloud agent, and names none to a routine.

Level zero reads its context at `session.start`, before any checkout. A hook
sees nothing of a branch the session switches to afterwards.

So `./RUNME.sh branch take` prints the group's ask to standard output. The agent
reads it from the command, and one routine prompt then serves every branch:

    ./RUNME.sh branch take

That verb fetches, picks a branch carrying a group ticket, checks it out, claims
it by pushing, and prints what to do. A session losing the race meets a rejected
push and takes the next one.

# The routine a verb names

One routine already works this queue. `do_work` holds the id
`trig_01EenLoDAB3NdmANnRM9mSh6` and carries one prompt: `./RUNME.sh branch take`.

Firing it belongs to the session, because `RemoteTrigger` is a tool the client
holds and the token stays inside that process. A shell verb reaches neither, so
`cloud trigger` names what a session then fires:

    ./RUNME.sh cloud trigger

It prints the routine, the id, and every branch standing free. A branch on that
list is one a box takes, so the length of the list says how many boxes to fire.

`freeNow` answers that list from the group tickets alone, and `take` picks the
first of it. So the verb and the box share one rule.
