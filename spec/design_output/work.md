---
kind: [[design_output]]
---

# Scope

`src/scripts/work.js` holds every verb over a work branch, and
`src/scripts/group.js` holds what a group's ticket reads and writes. This note
covers the branch, the group on it, the brief that drains, and the round trip.

# What a work branch is

One piece of work, held by one branch named `work/<name>`. The branch carries a
group ticket, or the brief the last of the old branches still carries. The
branch is the unit, and a session works it whole.

# A version branch stands

A branch named `v` and a number holds a whole earlier tree. Each one is an
orphan, so no other ref carries what it carries and a delete loses it whole.
One such delete already cost this tree a branch, and the recovery ran off the
forge's activity log.

So both push doors refuse the command before git runs it:

| door | reads |
|---|---|
| the Bash door, which an agent meets | the command line, in `versionRefs` |
| the pre-push hook, which a terminal meets | the refs git pipes in, and the zero that means a delete |

| what a command does | what a door says |
|---|---|
| `--delete`, `-d`, `-D`, or a refspec with an empty left side | refused, as a delete |
| `--force`, `-f`, `--force-with-lease`, or a refspec opening with a plus | refused, as a rewrite |
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

## A brief drains first

A branch carrying `HANDOVER.md` is a brief branch, whatever else stands on it.
A group ticket in place of that file turns it into a group. `take` hands
out every brief branch before it hands out a group, so the branches standing
before the ticket system finish under the verbs they carry.

# The take writes the record

`take` claims a group by writing one entry into the group ticket's `record`:

    record:
      - step: children
        hand: box d462e994b4cef
        hash_before: a1b2c3

`step` is the leaf the group stands on, `hand` names the box out of
`.se/copy.json`, and `hash_before` is the branch tip at the claim. The push decides:
two boxes reaching for one group means one of them meets a rejected push and
takes the next.

The hand names the box and no person, because the ticket travels and
`spec/guidance/private` binds what a tracked file carries. [[spec/guidance]]

## The record quotes its value

A record's value comes off a hand, a hook or a reviewer, so it carries what
it carries. A colon and a space in it opens a mapping to every YAML reader,
and the frontmatter then reads as broken. Vale reads no line of such a file,
and the lint over the tree exits one. The ticket door refuses the hand that
repairs it, because the record is the engine's.

So `quoted` in `src/scripts/group.js` wraps a value in double quotes where
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

# A row per group

`branch list` names one row per branch and one per loose ticket on trunk:

| column | says |
|---|---|
| the name | the branch, or the ticket's file name |
| the kind | `group`, `brief` or `ticket` |
| the status | `todo`, `held`, `done` or `merged` |
| the why | the urgency, or what it waits for |
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
| the kind | `ticket` |
| the status | `open` or `closed` |
| the why | the step it stands at, or its urgency where it names no step |

A brief carries no such row, because a brief names no tickets.

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

A step whose `by` reads `person` stops no cloud box. `branch unblock <ticket>
<successor>` takes the ticket standing at that step and hands its rest to a
ticket outside the group:

| what it reads | what it writes |
|---|---|
| the ticket stands open, in this group, at a step `by: person` | the ticket closes `state: closed`, `reason: became`, `successors: [<name>]` |
| the successor stands open and names no group | the question that step asks, under the successor's `Discussion`, beside the ticket it comes from |

So `branch done` meets no open child, the group closes, and one push carries the
successor with it. The person answers on a ticket of their own, and every step
behind them runs on.

The verb refuses three things:

- a ticket standing where a hand can take it
- a successor standing inside the group it frees
- a successor nobody holds yet

The box mints that last one with `./RUNME.sh mint ticket`, and writes what
stands open into its ask.

# Two handovers

| file | tracked | who reads it | where it can stand |
|---|---|---|---|
| `.se/HANDOVER.md` | no | the next session on this box | anywhere |
| `HANDOVER.md` | yes | whoever works the branch | a work branch alone |

Level zero reads both at `session.start`, hands each to the agent as a context
block, and deletes both. So each one stays fresh, and nobody keeps a rule about
clearing it.

# What the status says

The handover carries frontmatter, and its `status` is the one field that moves:

| status | means | who sets it |
|---|---|---|
| `todo` | waiting for somebody | `branch new` |
| `held` | a session has it | `branch take`, by pushing |
| `done` | the result is on the branch | `branch done` |

A claim is a push. Two sessions reaching for one branch means one of them meets
a rejected push and takes the next.

# The round trip

1. Write the brief to `HANDOVER.md` on `main`.
2. `./RUNME.sh branch new <name>` cuts the branch, stamps `status: todo`, commits
   and pushes. `main` loses the file in the same act.
3. A session works the branch and pushes to it. A cloud session stops there,
   because the harness holds `main` shut and a cloud box opens no pull request.
4. That session writes its result and its retro into `HANDOVER.md`, then runs
   `./RUNME.sh branch done`, which stamps `status: done` and pushes.
5. `./RUNME.sh branch list --done` names every branch standing at `done`.

# Every brief carries the contract

`branch new` appends `## How this branch ends` to a brief that carries none, so
every branch says how it closes. The append is idempotent, and a brief already
carrying the section stays as it stands.

The contract says what a branch does:

- run `branch sync` first, which takes `main` in
- push each time a thing lands
- write the result and the retro back into `HANDOVER.md`
- run `branch sync` again, so trunk comes in last too
- run `branch done`
- run `branch release` on stopping early
- run `branch merge` from trunk, which a cloud box leaves to a box off the cloud

A brief depends on nothing outside itself, so a cloud session aiming at one
branch reads it and knows how to finish.

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

A cloud session starting on `main` gets no brief, because trunk carries none.
Level zero notices that and hands over a block naming `./RUNME.sh branch take`.

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

# Urgency, and what waits

The frontmatter carries two more fields, and `branch take` reads both:

    urgency: now
    depends_on:
      - doors-and-fakes

A flow list on one line, `depends_on: [a, b]`, says the same as the block
list, with or without quotes around a name.

`take` drops every branch waiting on one still at `todo`, `held` or `done`,
then sorts the rest by urgency: `now`, `soon`, `whenever`. A branch naming no
urgency reads as `soon`.

## A dependency waits for trunk

A branch meets its dependency once trunk holds the branch it names, or once that
branch goes because somebody merges and closes it. `done` alone holds the
dependent, because `done` waits on the merge, which a box off the cloud runs.
So a chain of work runs
itself in order, and each link starts from the one before it.

`take` merges trunk in. A dependent taken before its dependency lands starts
from a trunk carrying none of that work. It then builds that work a second time.

`branch list` shows what each branch waits for, in place of its urgency.
`setStatus` writes `urgency: soon` onto a brief carrying none, so every brief it
mints holds to its schema. [[spec/schemas]]

# The battery answers first

`branch done` reads a stamp before it claims anything. `./RUNME.sh check` writes
`.se/check.json` on every run, naming the commit it stands on:

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

# A merged branch goes

`branch merge <name>` runs on `main` and takes a branch standing at `done`. A
group stands at `done` where its ticket reads `state: closed`. It merges with
`--no-ff`, so the branch keeps its shape in the history, and drops
`HANDOVER.md` inside the same commit: trunk carries no brief.

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
| `work/<name>` | `branch new` | trunk holds its commits |
| `claude/<name>` | the platform, for a routine run | trunk holds its commits |

Deleting a remote branch whose merge sits on this box alone loses the work. So
`close` counts what local trunk holds beyond origin, and refuses while that
number stands above zero. Push trunk first, and the merge outlives the branch.

`close <name> --force` deletes a branch standing outside trunk, which drops the
work on it.

# A box off a branch

A routine run starts on a branch the platform names, such as
`claude/gracious-hawking-zepc6h`, so asking whether the branch is `main` answers
no on every routine. What matters is standing outside a work branch, and that is
what level zero asks.

# Why a routine needs this

A routine starts on `main` and takes no branch argument, so a pointed cloud
agent gets its brief and a routine gets none.

Level zero reads its context at `session.start`, before any checkout. A hook
sees nothing of a branch the session switches to afterwards.

So `./RUNME.sh branch take` prints the brief to standard output. The agent reads
it from the command, and one routine prompt then serves every branch:

    ./RUNME.sh branch take

That verb fetches, picks a branch carrying a brief, checks it out, claims it by
pushing, and prints what to do. A session losing the race meets a rejected
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

`freeNow` answers that list from the briefs alone, and `take` picks the first of
it. So the verb and the box share one rule.
