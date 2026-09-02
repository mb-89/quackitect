---
kind: guidance
---

# Retro

How a period's record becomes improvements to the machinery.

## Motivation

The retro improves the machinery and learns from waste. Its outputs are
changes to the guidance, the engine and the prompts. Its best output is a
mechanization: a check, a refusal, a gate or a prefill that would have
removed a pattern of waste.

It is blameless. A bad output is evidence about its generator, and the
generator is the guidance, a schema, a refusal, the engine or a prompt.
Repairing the artefact is not the finding. The finding is what would have
stopped it being produced.

The retro is two halves. `se retro` collects, and this file judges what it
collected.

## Actionables

- Run the retro when nobody holds work. The engine refuses it while an actor
  holds a token, and that refusal has no override.
- Run `se retro` first. It puts every input in one folder: the period's log,
  the drained scratchpad, transcript copies, the numbers and the manifest.
- Read the folder and nothing else. An input you had to go looking for is a
  defect in the collect verb. Fix the verb.
- Ask the person what came back from the field since the last retro, then
  stop and wait.
- Hunt waste in the log, which shows what happened, and in the transcripts,
  which show why. Rank what repeats.
- For each waste pattern name the mechanization that removes it: check,
  refusal, gate, prefill, or clearer sentence, in that order of preference.
- Judge every check in the drained scratchpad: promote it to `util/checks/`
  or delete it, and fix every reference the move breaks.
- Digest every learned token in the backlog in one pass. Home each class as
  an engine check, then a checklist item, then discussion prose.
- Keep the checklist near seven. An item that joins usually means an item
  leaves, and an item a program can check becomes a gate.
- Score every improvement the previous retro made from the period numbers.
  Promote the wins and dismiss the duds with the reason recorded.
- Report themes with counts, never the list. Add the numbers, what the retro
  changed, open decisions as questions, and what it could not do.
- Distribute last. Everything lands in the backlog, the person discusses the
  report, and only then do you route items.

## Discussion

### The folder

`se retro` rotates the log first, so the running session becomes an old
file, then drains every old file. The retro sees everything up to the moment
it ran, the next retro starts empty, and nothing is counted twice. Ownership
decides drain against copy. The log and the scratchpad are this machine's
and are drained. The transcripts belong to another program and are copied.
`util/checks/` is in version control and the verb never touches it.
`manifest.jsonl` is the receipt, one line per thing taken, saying what came
from where. Two machines can each hold a retro folder, which is why token
ids are random. The numbers are fixed before the drain takes them: tokens
minted, ended and aborted, rounds per token, refusals by clause. Each retro
publishes one small period file, and the burndown reads only those. The
timeline weave is still owed. Until the collect joins the log and the
transcripts by timestamp, the retro joins them by hand.

### Field feedback

The stop after asking the person is the retro's one sanctioned stop. v3
walked past it until the owner said so in as many words. No amount of
draining stands in for the one report that comes from outside the machine.

### Waste

Where the log shows a retry, the transcript names the misunderstanding, and
the misunderstanding is the thing to fix. A program an agent wrote over the
tree is not waste, and a session that wrote none is the finding. A script
rewritten every session is a capability naming itself. Home it as an engine
check, then a flag on a verb that exists, then a new verb, and say why.
Every other scratchpad file is incorporated, promoted or deleted.

### Digest

Learned tokens are never scheduled as individual work. Merge duplicates into
one class with one home. Drop what went stale with the reason recorded. Sort
the period's `doc/work` so a decision stays and a round-by-round account
goes. A guidance sentence nobody heeds becomes a check or a refusal, or is
deleted. The measure of an improvement is the failure rate at every commit
that touched `doc/guidance`, read on both sides.
