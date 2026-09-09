---
kind: [[handover]]
status: todo
urgency: now
---

# Level zero reaches further

Two rules over how a session behaves, where every rule so far reads what it
types. Both want hook events level zero has yet to touch, so measure before you
build.

# What a helper knows today

Nothing. `claude plugin validate` lists what the hooks module holds:
`session.start`, three `tool.call` matchers, `turn.complete`, `prompt.context`.
No `agent` event at all.

So a subagent this tree spawns carries no guidance, no voice rules, no canary
and no stop table. It writes into this tree in whatever voice it likes, and its
work comes back through a session that meets every rule.

# Measure this first

Two questions, and the answers decide the shape:

1. Does a subagent fire `session.start` and `prompt.context` of its own? Where
   it does, the standing layer already reaches it and half this branch goes
   away.
2. Does `agent.spawn` let a hook rewrite the prompt? Its declaration says
   `next(e)` resolves to `{ model }`, and that a hook may call
   `next({ ...e, model })`. Whether a changed `e.prompt` survives that call is
   the thing to find out.

Write both answers into `spec/design_output/level0.md` under the harness
surface, beside the facts already standing there. That section exists because
this surface moves and a measurement outlives an assumption.

# The helper takes the guidance

Where a subagent reads no standing layer of its own, `agent.spawn` hands it
one:

    on("agent.spawn", async ($, e, next) => {
      const said = standingLayer(await readGuidance($));
      return next({ ...e, prompt: `${said}\n\n${e.prompt}` });
    });

The same text the session gets. One guidance file then binds every agent in
the tree, and no helper reads a second copy.

Where the prompt refuses to change, say so and take the other road.
`agent.offer` answers `{ offered: false }`, and a type nothing cages is a type
nothing offers.

## What a helper keeps

A helper writing into this tree meets the write door already, because the door
hooks `tool.call` and a helper's calls pass through the same chain. Prove that,
because it decides how much this branch has to carry.

Where it holds, the guidance is the gap and the doors already stand.

# The owner's prompt comes first

`spec/guidance/working.md` opens with two rules:

1. Answer the owner's prompt before the next tool call.
2. Open that answer by saying back what you understood and what you do next.

Both hold exactly as well as a session remembers them, which is a thing this
session proved by forgetting them twice in one afternoon.

## What the door does

Refuse the first `tool.call` of a turn the owner opens, where nothing has
reached them yet.

| what the hook holds | when |
|---|---|
| a turn stands open, and nothing answers it | `prompt.submit`, from a person |
| the turn carries an answer | the first text the session sends |
| the mark clears | `turn.complete` |

A prompt the plugin submits marks nothing. The tooth submits prompts, and a
session owes no readback to itself. `e.origin` says which, carrying
`{ kind: 'plugin', name }` for the plugin's own.

## What the refusal says

    The owner asked something and nothing has answered it. Say back what you
    understood and what you do next, then work.

That is the rule in its own words, and a refusal quoting the rule teaches it
better than a refusal naming it.

## Where it must not bite

- A turn nobody opens. A routine's first prompt belongs to a person, and a
  session reading before it answers fails the one who asks.
- A turn the session has already answered, however briefly.
- A tool call that is itself the answer, where such a thing exists. Say in your
  handback whether it does.

Turn it off through the config, `answerFirst`, the way the judge and the tooth
turn off.

A rule nobody can turn off stops the tree on the day it reads something
wrongly.

# What to prove first

1. `./RUNME.sh check` passes, and it runs `claude plugin validate` for you.
2. Both measurements stand written in the design record, with the date.
3. A helper carries the guidance, proved by what it answers and by no other
   evidence.
4. The first tool call of an unanswered turn refuses, and the second passes
   once the session speaks.
5. A prompt the plugin submits refuses nothing.
6. `answerFirst` turns the door off.

# What your handback says

- What a subagent fires, exactly, and what it reads.
- Whether `agent.spawn` carries a changed prompt.
- Whether the write door reaches a helper's writes.
- Any turn where answering first read as the wrong thing to do.

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
