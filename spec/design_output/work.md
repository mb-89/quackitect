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

A branch carrying `HANDOVER.md` is a brief branch, whatever else stands on it,
and `work adopt` dropping that file is what turns it into a group. `take` hands
out every brief branch before it hands out a group, so the branches standing
before the ticket system finish under the verbs they carry.

# The take writes the record

`take` claims a group by writing one entry into the group ticket's `record`:

    record:
      - step: children
        hand: box d462e994b4cef
        took: a1b2c3

`step` is the leaf the group stands on, `hand` names the box out of
`.se/copy.json`, and `took` is the branch tip at the claim. The push arbitrates:
two boxes reaching for one group means one of them meets a rejected push and
takes the next.

The hand names the box and no person, because the ticket travels and
`spec/guidance/private` binds what a tracked file carries. [[spec/guidance]]

## Held derives from the record

A group holds where its newest record entry carries `took` and no `gave`.
Nothing writes a status beside it, so a branch nobody holds takes no write at
all:

| the record says | the group stands at |
|---|---|
| nothing, or a newest entry with `gave` | `todo` |
| a newest entry with `took` and no `gave` | `held` |
| `state: closed` on the ticket | `done` |

# A row per group

`work list` names one row per branch and one per loose ticket on trunk:

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

## A stale group is yours

There is no lease. A branch somebody holds stays held until a person looks, and
the age of the tip is the signal:

| the tip's age | means |
|---|---|
| under `work.staleAfter` | a box holds the group, and nothing asks |
| past it | the group is a person's, and `list` puts it under yours |

Under yours it carries three answers: release it, take it over, or close it.
`work.staleAfter` reads `12h` by default, and the rule derives from the tip, so
nothing writes to a branch nobody holds.

# A box leaves

`work done` on a group branch writes `gave` into the newest record entry, which
is the box saying it leaves. Then it reads the children:

| what stands | what the group becomes |
|---|---|
| no ticket in it stands open | `state: closed`, `reason: done` |
| one of them stands open | `state: open`, and `done` names each open one |

So an open group nobody holds comes back to the queue, and a person answers on
its branch.

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
| `todo` | waiting for somebody | `work new` |
| `held` | a session has it | `work take`, by pushing |
| `done` | the result is on the branch | `work done` |

A claim is a push. Two sessions reaching for one branch means one of them meets
a rejected push and takes the next.

# The round trip

1. Write the brief to `HANDOVER.md` on `main`.
2. `./RUNME.sh work new <name>` cuts the branch, stamps `status: todo`, commits
   and pushes. `main` loses the file in the same act.
3. A session works the branch and pushes to it. A cloud session stops there,
   because the harness holds `main` shut and a cloud box opens no pull request.
4. That session writes its result and its retro into `HANDOVER.md`, then runs
   `./RUNME.sh work done`, which stamps `status: done` and pushes.
5. `./RUNME.sh work collect` names every branch standing at `done`.

# Every brief carries the contract

`work new` appends `## How this branch ends` to a brief that carries none, so
every branch says how it closes. The append is idempotent, and a brief already
carrying the section stays as it stands.

The contract names six things:

- run `work sync` first, which takes `main` in
- push each time a thing lands
- write the result and the retro back into `HANDOVER.md`
- run `work sync` again, so trunk comes in last too
- run `work done`
- run `work release` on stopping early
- run `work merge` from trunk, which a cloud box leaves to a box off the cloud

A brief depends on nothing outside itself, so a cloud session aiming at one
branch reads it and knows how to finish.

# Trunk comes in first

`work sync` merges `origin/main` into the branch. `work take` runs it, so a
routine pays nothing to remember it. A conflict then stops the take, while the
work it costs still sits ahead.

## Trunk comes in last too

A branch greens its own tip, and the merge result reads green nowhere. So a
branch older than a rule passes `work done` and reddens trunk at the merge.
This tree hits that twice in one day.

`work done` fetches trunk and refuses a branch trunk stands ahead of:

| what it finds | what it does |
|---|---|
| the branch carries every commit on trunk | it reads the battery next |
| trunk holds a commit the branch lacks | it refuses, and names `work sync` |

So the battery a branch claims stands over the tree the merge produces. The
contract carries the same step, because a reader acts on it before the verb
ever runs.

# A box landing on trunk

A cloud session starting on `main` gets no brief, because trunk carries none.
Level zero notices that and hands over a block naming `./RUNME.sh work take`.

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

Level zero refuses, on a cloud box:

- a `git commit` made while standing on `main`
- a `git push` naming `main`, from any branch

The refusal names `./RUNME.sh work take` as the way out. A desk box meets none
of it, because a box off the cloud merges by choice. The harness is the whole
of the reason a cloud box stops: it opens no pull request, so trunk reaches it
one way.

`work take` and `work done` reach git inside the command line, so the door sees
the verb and leaves the plumbing alone.

# Urgency, and what waits

The frontmatter carries two more fields, and `work take` reads both:

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

`work list` shows what each branch waits for, in place of its urgency.
`setStatus` writes `urgency: soon` onto a brief carrying none, so every brief it
mints holds to its schema. [[spec/schemas]]

# The battery answers first

`work done` reads a stamp before it claims anything. `./RUNME.sh check` writes
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

# A merged branch goes

`work merge <name>` runs on `main` and takes a branch standing at `done`. A
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
a ticket waiting on a person stands loose on trunk, where `work list` names it
and a person sorts it. A closed ticket keeps its `group`, because the pair is
the history of one group and what it holds.

# A brief becomes a group

`work adopt` runs on a brief branch and writes two tickets in place of
`HANDOVER.md`:

| what it writes | from |
|---|---|
| `spec/tickets/<branch>.md`, the group | the `group` route, with the brief's ask |
| `spec/tickets/<child>.md`, one ticket | the `standard` route, with the brief's body |

The child takes its name from the brief's first heading, and `work adopt <name>
<child>` names it instead. A name matching the group's, or one past
`names.words`, stops the verb and asks for one.

# A merged branch closes

`work close [name]` deletes a branch git says is inside `main`, here and on
origin. Naming no branch closes every one of them. It reaches two kinds:

| branch | cut by | throwaway once |
|---|---|---|
| `work/<name>` | `work new` | trunk holds its commits |
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

So `./RUNME.sh work take` prints the brief to standard output. The agent reads
it from the command, and one routine prompt then serves every branch:

    ./RUNME.sh work take

That verb fetches, picks a branch carrying a brief, checks it out, claims it by
pushing, and prints what to do. A session losing the race meets a rejected
push and takes the next one.

# The routine a verb names

One routine already works this queue. `do_work` holds the id
`trig_01KCYQ2oxi7rnCuBZYJsnLnQ` and carries one prompt: `./RUNME.sh work take`.

Firing it belongs to the session, because `RemoteTrigger` is a tool the client
holds and the token stays inside that process. A shell verb reaches neither, so
`work trigger` names what a session then fires:

    ./RUNME.sh work trigger

It prints the routine, the id, and every branch standing free. A branch on that
list is one a box takes, so the length of the list says how many boxes to fire.

`freeNow` answers that list from the briefs alone, and `take` picks the first of
it. So the verb and the box share one rule.
