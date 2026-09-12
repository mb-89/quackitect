---
kind: [[design_output]]
---

# Scope

`src/scripts/work.js` holds every verb over a work branch. This note covers the
branch, its two handovers, the status it carries, and the round trip.

# What a work branch is

One piece of work, held by one branch named `work/<name>`, carrying its own
brief. The branch is the unit, and a session works it whole.

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
- run `work done`
- run `work release` on stopping early
- run `work merge` from trunk, which a cloud box leaves to a box off the cloud

A brief depends on nothing outside itself, so a cloud session aiming at one
branch reads it and knows how to finish.

# Trunk comes in first

`work sync` merges `origin/main` into the branch. `work take` runs it, so a
routine pays nothing to remember it. A conflict then stops the take, while the
work it costs still sits ahead.

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
dependent, because `done` waits on a person's merge. So a chain of work runs
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

`work merge <name>` runs on `main` and takes a branch standing at `done`. It
merges with `--no-ff`, so the branch keeps its shape in the history, and drops
`HANDOVER.md` inside the same commit: trunk carries no brief.

A conflict stops the merge and leaves it standing, because resolving it belongs
to the person merging.

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
