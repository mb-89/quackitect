---
id: i63-prior-art
type: research
statement: What the field does about each element of the work-token sketch, organised by the element it applies to.
---

# Prior art, arranged by the part of the sketch it judges

Every claim below marked PRIMARY was read from the page itself. Anything marked
SUMMARY rests on a search index's rendering and was never opened.

Twenty pages were read in full. Five research passes produced the leads.

## THE UNIT — every piece of work is a token

**The sketch says:** every piece of work the agent does is a work token, a
markdown file a person can open and edit.

### Supporting, and it is shipped

GITLAB, PRIMARY. Work items are "the core elements for planning and tracking
work", giving "a unified way to represent units of work at any level, from
strategic initiatives to individual tasks". Issues, epics, tasks, objectives and
test cases are all TYPES of one thing.

In 18.10 they replaced the separate issue list and epic list with one work-item
list. Pinned links to either now point at the unified view, and old URLs
redirect.

That is the sketch's central idea, in production, at scale.

BACKLOG.MD, PRIMARY. "Markdown-native tasks — every task is a plain `.md` file
in your repo." Built for agents, and dogfooded: "nearly all of Backlog.md's own
code is written by AI agents working through Backlog.md itself."

### Contradicting, and it is the closest analogue that moved away

BEADS, PRIMARY, and this CORRECTS an earlier reading. Beads is now a
"distributed graph issue tracker for AI agents, powered by Dolt" — a
version-controlled SQL database. Its own README says `.beads/issues.jsonl` is
"an export for viewers and interchange, not the source of truth or a backup".

It tells agents directly: "Do not use markdown TODO lists for task tracking."
And it describes its own purpose as replacing "messy markdown plans with a
dependency-aware graph".

An earlier pass reported beads as one append-only JSONL file. That is out of
date. It is a database now.

### The count

Three systems built on files moved off them. Taskwarrior went to SQLite after
fifteen years. Beads went to Dolt. Fossil never used files and published why.

## GUIDANCE ON THE TOKEN

**The sketch says:** a token carries its own guidance to read.

### Supporting

CREWAI, PRIMARY. A Task carries `description` and `expected_output`, and both
are REQUIRED: "Each task must include description and expected_output." Role and
backstory live on the AGENT; what to do and what good looks like live on the
TASK. That is exactly the split the sketch proposes.

### The cost, and three systems all built the same escape hatch

Per-token guidance duplicates. Every system that shipped it then had to ship a
defaults layer.

ARGO, PRIMARY. `templateDefaults` sets values "in workflow spec level that will
apply to all the templates in the workflow. If the template has a value that
also has a default value in templateDefault, the Template's value will take
precedence." It exists at two levels — the workflow and the controller.

HUGO, PRIMARY. `cascade` applies front-matter values "from a branch page or the
project configuration to descendant pages", and "Hugo does not cascade a value
if the descendant already defines the field". A `target` matcher limits the
reach by path.

BACKLOG.MD, PRIMARY. Definition-of-Done defaults are set once in project config:
"These items are added to every new task by default. You can add more on create
with `--dod`, or disable defaults per task with `--no-dod-defaults`."

**One rule, three witnesses.** An ancestor sets a default. The specific one
wins. Build the defaults layer at the same time as the field, not after.

## EVIDENCE ON THE TOKEN

**The sketch says:** a token carries its own evidence to produce.

### The mechanism that gives it teeth

CREWAI, PRIMARY. Guardrails "validate and transform task outputs before they are
passed to the next task". A guardrail is either a function, or a PLAIN STRING
criterion checked by the agent's own model.

On failure: "The error is sent back to the agent, the agent attempts to fix the
issue, the process repeats until the guardrail returns True or maximum retries
are reached." Bounded by `guardrail_max_retries`, default 3.

**This is the difference between a field and a check.** The sketch has evidence
as a field. CrewAI has the expected output as a required field PLUS a guardrail
that actually tests it and sends failures back.

BACKLOG.MD, PRIMARY. "Acceptance criteria & Definition of Done — verifiable
scope per task, plus a reusable DoD checklist for every new task."

### Make it required, because two systems learned this the hard way

DAGSTER, PRIMARY. Declarative Automation does nothing until you "enable the
default automation condition sensor in the UI".

PREFECT, SUMMARY. Its transaction primitive needs result persistence, which is
off by default.

Both ship their best correctness feature switched off. Most users therefore
never get it. If a token's evidence is optional, most tokens will carry none.

## SIZING A TOKEN

**The sketch says:** nothing. This is a gap, and the field answers it three
ways that agree.

BACKLOG.MD, PRIMARY, and it is the sharpest: **"one task = one context window =
one PR."** Their reasoning: "You can't meaningfully review 15,000 generated
lines in one sitting, but you can read a screenful of task specs with acceptance
criteria before any code exists."

JEFFRIES, PRIMARY, giving the alternative to the field he regrets: "slice
stories down until they just need **a single acceptance test**. With a little
practice that gets things right down to a good size." He credits Neil Killick.

AIRFLOW, SUMMARY: treat a task like a database transaction and never produce
incomplete results.

DAGSTER, PRIMARY: the unit is named by what it PRODUCES — an asset key — not by
the work that produces it.

**All four say the same thing.** A token is one deliverable. The sketch already
carries an evidence field, so making that field the sizing rule costs nothing.

## COMPLEXITY ON THE TOKEN

**The sketch says:** every token carries a complexity.

JEFFRIES, PRIMARY, on the field he named: "I may have made the name-changing
suggestion. If I did, I'm sorry now." And: "I'd drop the notion of story points,
and even the notion of estimating stories at all, where possible."

His four stated objections: predicting completion from them is weak; comparing
estimates to actuals is wasteful; comparing teams on them is harmful; and their
existence invites pressure for more.

GITLAB, PRIMARY, ships `Weight` anyway, and its own naming guidance says to put
the unit in the name — "Effort Points instead of Points".

**The honest position:** it is shipped widely and its inventor regrets it. If it
only routes a token to a stronger or weaker hand, two or three named values do
that. A scale invites the comparison Jeffries warns about.

## PRIORITY ON THE TOKEN

**The sketch says:** every token carries a priority.

LWN COMMENT THREAD, PRIMARY, 2008: "Priority fields don't belong to the bug.
This isn't a P1 bug, or a low-priority bug, it's just a bug, and individuals
would have their own perspective on its priority."

EMSE 2015, SUMMARY: about 51% of duplicate bug reports carry inconsistent
human-assigned severity. Duplicates describe the same defect, so the
disagreement is pure labelling noise.

GITLAB, PRIMARY, offers single-select fields for "Priority indicators (like
High, Medium, Low)" as a custom field, not a built-in.

**The alternative:** order within a bucket. A position is unique and cannot
disagree with itself. A label can.

## OPEN FRONTMATTER

**The sketch says:** a token is a markdown file with open frontmatter.

### The production alternative, and it is disciplined

GITLAB CUSTOM FIELDS, PRIMARY. Four types only: single-select, multi-select,
number, text. And the limits are the finding:

- "A top-level group can have at most 50 active custom fields."
- **"A work item type can have at most 10 custom fields assigned to it."**
- "The field type cannot be changed after you create the field."
- Archive rather than delete: archiving "removes the field from any work items
  that had them" but preserves history, and unarchiving restores every value.

Ten fields per type, typed, immutable in type, archivable. That is not open
frontmatter; it is a small closed schema with an escape hatch.

### The structural answer, if open keys are kept

FOSSIL, PRIMARY, and this was missed by every summary. "If a name/value pair is
seen which has no corresponding column in the TICKET table, then that name/value
pair is ignored. Columns can be added or removed from the TICKET table at any
time. Whenever the TICKET table is modified, the replay algorithm automatically
reruns to repopulate the table using the new column names."

**Open keys are safe when the schema is DERIVED and rebuildable.** Add a field
later and it back-fills from history. That is the answer to the problem Obsidian
users cannot solve, where a type mismatch has no bulk fix.

HUGO, PRIMARY: "The field names below are reserved. For example, you cannot
create a custom field named `type`. Create custom fields under the `params`
key." Fifteen years of open top-level front matter, then a namespace.

## MERGING

**The sketch says:** either hand can move a token.

### The seam, stated by the person who tested it

LWN, PRIMARY, on Bugs Everywhere — which IS the sketch, one directory per item,
one file per field, in the tree. The editor: "changing the severity of a bug in
two branches and merging the result creates a conflict which can only be
resolved by hand-editing the bug tracker's files."

And in the comments, the same editor draws the line precisely: "the merging of
comments works just fine... Each comment is its own file, so there's no
conflicts... The problem is the 'incompatible' changes — global stuff like
severity, assigned-to, title, resolution status."

**Accreting content merges. Mutable scalar fields do not.** That is the whole
seam, and it says a token file can keep one-file-per-token if its body appends
and its scalars are derived.

Bugs Everywhere's verdict, same page: "all of this can make distributed bug
tracking look like a source of more work for developers, which is not the path
to world domination." Last update roughly five years ago.

### The finer-grained answer

BEADS, PRIMARY. Dolt gives "cell-level merge". Two branches changing two
DIFFERENT fields of the same item merge cleanly; only the same field conflicts.
That is finer than git's per-hunk merge, which conflicts on adjacent lines.

Also: "Hash-based IDs (`bd-a1b2`) prevent merge collisions in
multi-agent/multi-branch workflows."

### Whether we have this problem at all

One engine walks one record. Tokens attach to positions. If two clones never
edit the same token, none of the above applies.

## THE EXIT RULE

**The sketch says:** a position cannot be left until its tokens are done.

### Nothing gates, except one thing, and it has the right shape

GITHUB, PRIMARY. The close page describes permissions and a reason picker.
Nothing about sub-issues, dependencies or blocking. Sub-issues cap at "100
sub-issues per parent issue and up to eight levels of nested sub-issues", and
completion is rendered, never enforced.

JIRA, PRIMARY. The Sub-Task Blocking Condition is added to a transition, and you
"select the sub-task statuses required to allow parent issue (or work item)
transitions".

**The gate is parameterised by ACCEPTABLE END STATES, not by completion.**

### GitLab makes the same idea first-class

GITLAB STATUS, PRIMARY. Status is separate from open/closed, and every status
belongs to one of five CATEGORIES: Triage, To do, In progress, Done, Canceled.

"Statuses in the Done and Canceled categories automatically set work items to
closed state. All other categories maintain work items in open state."

**Settled means Done OR Canceled.** A token that will never be finished reaches
Canceled and stops blocking. Default statuses include "Won't do".

A `lifecycle` groups statuses for a work-item type and names a default open
status, a default closed status and a default duplicated status.

### The flow objection, and why it may not apply here

The lean argument is that holding a stage until everything in it finishes sets
the transfer batch to the whole stage. That argument assumes a stage RECURS. A
milestone is walked once and no second batch ever queues behind a
position, so there is no next
batch to delay.

## A STALL NEEDS A CLOCK

**The sketch says:** nothing about how long a wait may last.

TEMPORAL, PRIMARY, has four separate timeouts and the reasoning for each:

- Schedule-To-Start bounds how long work sits queued. Non-retryable by design.
- Start-To-Close bounds one attempt. "The Temporal Server doesn't detect
  failures when a Worker loses communication with the Server or crashes.
  Therefore, the Temporal Server relies on the Start-To-Close Timeout to force
  Activity retries."
- Schedule-To-Close bounds the whole thing including retries.
- Heartbeat Timeout is "the maximum time between Activity Heartbeats".

And the framing worth stealing: "Heartbeating is best thought about not in terms
of time, but in terms of **'How do you know you are making progress?'**"

AIRFLOW, PRIMARY. The deferral call takes a `timeout`, "a timedelta that
specifies a timeout after which this deferral will fail, and fail the task
instance". A deferred task "no longer occupies a worker slot".

**We have no clock anywhere.** An earlier in-repo sweep already recorded this
gap without building it.

## HANDOVER WHEN A WORKER DIES

TEMPORAL, PRIMARY. "A Heartbeat can include an application layer payload that
can be used to save Activity Execution progress. If an Activity Task Execution
times out due to a missed Heartbeat, the next Activity Task can access and
continue with that payload."

AIRFLOW, PRIMARY, states the constraint bluntly: "your operator will stop
executing at that point and be removed from its current worker. No state will
persist... The only way you can pass state from the old instance of the operator
to the new one is with `method_name` and `kwargs`."

**Handover is a resumption point plus explicit arguments.** Nothing implicit
survives.

## READINESS — the condition on a token

**The sketch already ships this**, and the pool is the evidence.

139 tokens stand in the pool today. It held 38 five days ago. Every one carries
a `ready_when` written as prose.

Measured over 128 of them: 25 wait for an event nothing observes, 13 embed a
date, and one states a trigger and then reports that the trigger already fired.

### Not one surveyed system uses prose

DAGSTER, PRIMARY, is the strongest. An `AutomationCondition` describes "the
conditions under which work should be executed", built from composable operands.
Named built-ins: `on_cron` fires "after all upstream dependencies have updated";
`eager` fires when any dependency updates; `on_missing` fires "when all upstream
partitions of the asset are available".

And it is TESTABLE: `evaluate_automation_conditions` runs a condition in
isolation without the daemon. A prose condition never can be.

ARGO, SUMMARY: `depends` keys on a predecessor's OUTCOME rather than its
completion. `suspend` takes a duration.

AIRFLOW, PRIMARY: a deferrable operator suspends and a trigger watches for it,
occupying no worker slot.

BEADS, PRIMARY: `bd ready` lists "tasks with no open blockers" — computed from
the dependency graph, never authored.

**Nobody writes the condition in prose. Everybody computes it.**

## RETENTION — what happens to a finished token

**The sketch says:** nothing, and a token in our own pool already asks for a
ruling.

BEADS, PRIMARY, has shipped an answer: "Compaction: Semantic 'memory decay'
summarizes old closed tasks to save context window."

GITLAB, PRIMARY, archives rather than deletes, and unarchiving restores every
value a work item held.

## THE LADDER COLLAPSE

**The sketch says:** four ladders become two.

Two different questions must not be run together.

PRIORITISATION is which work to do first, and many systems carry several axes
here. GitLab ships Weight, Status, Health, Milestone and Iteration side by side.
That is fine and the evidence does not argue against it.

RIGOR is how carefully to do work once chosen, and every mature ladder folds
many inputs into exactly ONE level. ISO 26262 takes severity, exposure and
controllability and produces one ASIL. DO-178C takes one input and produces one
DAL. IEC 61508 takes four risk-graph parameters and produces one SIL. None
carries two levels forward.

**Our four ladders are rigor ladders.** Reading, judgement, the five-name rung
and autonomy all say how carefully to work, not what to work on first.

### Collapse means derive, not delete

DO-178C does not say "level A means be careful". It names the objectives each
level demands — reported as 71 at level A against 26 at level D, SUMMARY,
Annex A not seen.

So if complexity is to carry reading, write down what each complexity value
demands. If reading simply stops being scaled, say that instead.

### The surviving axis may be misnamed

Every input to every mature rigor ladder is about HARM: severity of injury,
exposure to the hazard, controllability, consequence, avoidability. Not one
takes task difficulty as an input.

A hard step with no consequences needs no rigor. An easy step that can destroy
something irrecoverable needs all of it.

### Autonomy is genuinely separate

Three field studies say autonomy's effect is conditional on task uncertainty,
SUMMARY: Wall et al. 1990, Wall, Cordery and Clegg 2002, Cordery et al. 2010.
That is a real interaction, so two dials are justified where four were not.

The direction cuts against instinct: the literature says grant MORE autonomy
where uncertainty is HIGHER, because that is where local judgment beats a
pre-written rule.

## WHAT WAS NOT REACHED

- Obsidian Tasks' own "Known Limitations" page.
- The EMSE severity paper's body. The 51% figure rests on a summary.
- DO-178C Annex A, ISO 26262 Part 3 and IEC 61508-5. All paywalled.
- Any retrospective of an organisation collapsing a rigor ladder. Searched, none
  found, in any domain.
- Any controlled comparison of one difficulty axis against several.

## THE SESSION'S OWN CONSTRAINT

The five research passes ran while the outward verbs were refused by the
position gate. Thirty-four fetch attempts were rejected. No researcher opened a
page body, so every report they returned rests on search summaries.

The verbs are legal in every position now. The twenty pages above were read
afterwards, and reading them changed four conclusions and added two mechanisms
nobody had.
