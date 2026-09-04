---
kind: [[guidance]]
scope: ["whoever runs a retro, once a cycle"]
out_of_scope: ["a review of one token, which is that token's own process"]
depends_on:
  - "[[voice]]"
  - "[[driving-the-engine]]"
  - "[[refactoring]]"
---

# Motivation

The retro turns a period's record into changes to the machinery.
Its outputs are changes to the guidance, the engine, the schemas and the tools.
Its best output is a mechanization: a check, a refusal or a gate that removes a whole pattern of waste.

It is blameless.
A bad output is evidence about what produced it, and what produced it is a rule, a schema, a refusal or a tool.
Repairing the artefact is not the finding.
The finding is what would have stopped it being made.

The retro is two halves: `se retro` collects and drains, and this file judges what it collected.

# Actionables

1. Run it when nobody else holds work. The engine refuses otherwise, and that refusal has no override. *
2. Run `se retro` first, then read the folder it made and nothing else. Hunting for an input is a defect in the verb. *
3. Ask the person what came back from the field since the last retro. Then stop and wait. *
4. Score the last retro's improvements against this period's numbers, handed to you under `earlier`. Promote what worked, drop what did not. *
5. Hunt waste in the log and the transcripts, a reader on every slice. Rank what repeats. *
6. Count every shell command and say what each was standing in for. One is a tool you do not have. *
7. Read what one turn costs, run `util/checks/benchmark.sh`, and rank the battery's lanes. Name what grew, then [[refactoring]]. *
8. For each pattern name its mechanization: a check, a refusal, a gate, a prefill, then a clearer sentence. *
9. Judge every script in the drained scratchpad. Promote it to `util/checks/`, or delete it, and repair what the move breaks. *
10. Merge what repeats into one class, then mint one note per improvement and nothing larger. *
11. Report themes with counts and never the list. Say what you could not do and why. *
12. Measure the session itself: errors and thinking length by fifths. A retro that reads only the work misses the worker. *
13. Distribute last, after the person has read the report. Their reading is what turns a theme into work. *
14. Agree to a keep rule on the drain only with the command that counted it, keyed off a fact the engine writes. *
15. Write the finished report to the path `se retro` answers under `report`. It is out of git, and no drain reaches it.

# Discussion

## 1. A boundary is nothing else running

A drain has no undo and it takes folders every actor keeps working files in.
One run while somebody was mid-task deleted what they were reading.
Refusing beats skipping: a skip list leaves the retro half done.

## 2. Everything in one folder, taken once

`se retro` rotates the log first, so the running session is collected with the rest.
The next one starts empty and nothing is counted twice.

Ownership decides drain against copy: what this machine owns moves and the transcripts are copied.
`util/checks/` is in version control and is never touched.

An input you had to go and find is one the next retro will also have to find.
That is a fault in the verb, and fixing it is worth more than the input.
Reading around the folder hides the gap, and a hidden gap is never fixed.

## 3. The one thing the machine cannot collect

The stop after asking the person is the retro's one sanctioned stop. v3 walked past it until the owner said so.

Everything else in the folder is the machine talking about itself.

## 4. An improvement nobody scored is a guess

A retro that only proposes never learns whether it was right.
Last period's improvements are this period's evidence.

Record why a dud was dropped.
Without the reason it comes back, reading as a reasonable idea for the second time.

The measure of a guidance change is the failure rate on both sides of the commit that made it.

## 5. Two records, and each says half

The log says what happened and the transcript says why, and where the log shows a retry the transcript names the misunderstanding.

One retro wrote its report off the counts, and counts are the shape of a day rather than its reasons.
So slice the transcripts and give a reader each slice whole.
The same failures then come back independently from different parts of the day, which no count can give.

Ask for friction, not achievement.
Rank by what repeats: one bad afternoon is an anecdote, and the same shape three times is a property of the machinery.

## 6. Every shell command is a tool that is missing

One session ran a thousand of them, and most found where a symbol appears, read a line range, or substituted a string.

That is not an agent misbehaving.
It is what the engine does not offer, written out one command at a time.

Group by the job, rank by count times how mechanical, and write the mechanical ones as verbs.

## 7. A number nobody watches is a number that grows

The index says what one turn costs.
No single number looks too big alone, which is how the whole gets too big with nothing saying so.
A number that grew for a reason is fine, and one that grew because nobody looked is the finding.

Nothing in the battery waits on a clock, so timings are read here, against the last retro's.
Reading them is the retro's.
What to do about one is [[refactoring]], which says to measure where the cost is paid before changing anything.

## 8. The order is by how little it asks of anybody

A check runs without being read.
A refusal arrives when it is needed.
A gate stops the thing happening.
A prefill makes the right answer easy.
A sentence is last: it works only on somebody who reads it and remembers it.

Prefer the earliest that would have removed the waste.
A rule where a check would do is one somebody breaks.

## 9. A script written twice is a capability asking for a name

A helper written and thrown away is fine.
The same helper rewritten next session is the machinery naming what it lacks.

Home it as a check, then a flag on a verb that exists, then a new verb.
Say which and why.
Nothing stays because it might be useful.

## 10. One class, one note, and the backlog is the place

A lesson minted per occurrence schedules the same fix ten times, each reading as a reasonable idea on its own.
So the duplicates become one class with one home: a check, then a checklist line, then a sentence.
What went stale is dropped with its reason.

An improvement written only into a report is one nobody scheduled.
One note per class, small enough that a stranger could act on it, and triage decides.

## 11. Themes with counts, not a list

A report that lists everything is one nobody finishes.
Three of one shape says what a list of forty does not.

Say what you could not do.
A retro silent about what it skipped reads like one that covered everything, and the next inherits the gap.

## 12. The worker thins, and says it is only cutting scope

Measured across one long session by fifths, the error rate tripled in the last fifth while the length of a thought halved from its peak.

The agent noticed.
Six times it worried about session length, and each time said it was cutting scope rather than rigour.
It cut both and saw one.

## 13. Reading is what makes it work

Routing before the person has read puts the machine's reading ahead of theirs.
They hold the half the folder does not.

So everything lands in the backlog, the report is discussed, and only then is anything routed.
That order buys the only review the retro itself gets.

## 14. Count before agreeing

A keep rule was once justified by how the tree is arranged, and nobody counted.
So the rule runs over the real tree first:

- what it keeps
- what it takes
- what share of today's actors and tokens

A protection keys off a fact the engine writes, such as who holds a token.
A convention drifts, and the sweep that trusted it takes what somebody still needed.
