---
kind: research
statement: What the field knows about multi-agent orchestration, read against the four-walker session of 2026-08-23, and what this system should change.
---

# Multi-agent orchestration — prior art against a measured failure

Scanned 2026-08-23. Every external claim below carries a URL to the publisher.

## The verdict, in one paragraph

Delegate READING, walk the WRITING alone.

The field agrees on that split more than its headlines suggest. Anthropic ships
a multi-agent system for research and says plainly that coding is a poor fit.
Cognition says do not build multi-agents and is arguing about a coding agent.
LangChain reconciles them: read actions parallelise, write actions do not.

This project's process machine is a WRITING machine. It edits files, fills
forms and moves one shared position. Every one of those is a write. The owner's
verdict on 2026-08-23 — that the arrangement was not better than working alone
— is the predicted result, not a surprise.

Two things the roster bought are worth keeping, and both are read-shaped: the
cold reviewer at a gate, and a hand sent into a subsystem nobody has read.

## Part one — what happened here, as patterns

Read from the call log's recorded answers of 2026-08-23, and from
`deliverable/machines/methods/meth-spawn-hands.md`.

### The measured day

Four walkers and one reviewer, against one guide.

- Walker 1, 23 minutes: shared guidance card, checkbox catalog, spawn-role
  corrections across ten rows.
- Walker 2, 14 minutes: session-keyed spawn check and persisted predictions,
  then an honest stop at a read-only trap.
- Walker 3, 20 minutes: the milestone stamp, the dial on the call record, eight
  corrected statements.
- Walker 4: nothing. The guide moved the walk out from under it while it was
  starting.
- The reviewer, 13 minutes: two genuine gaps in a gate the guide had already
  blessed.

The guide in the same window produced both hook fixes, the estimate store, the
calibration, the ceiling, the roles, the link rule, the header, the plan-reset
bug fix, the `hands` dial, and every state of the walk.

### Pattern one — the hand pays to rebuild context the orchestrator holds

Three hands each spent about fifteen minutes reading before touching anything.
Each had been handed exact file names and line numbers.

`meth-spawn-hands.md` lines 64 to 67 record it as a rule now: the guide did
comparable work in a fraction of the time, and the token cost was probably
higher, not lower.

The dispatching was named as the guide's worst error of the day. Four separate
briefs went to one hand, so most of its first sixteen minutes went on reading
four engine files before a single line could change.

### Pattern two — one shared position, several hands

Walker 4 produced nothing because the guide advanced the walk while that hand
was starting. The position is a single mutable cursor and two hands were
holding it.

The `hands` dial now offers `solo` and `spawned`, which makes the arm a
setting rather than a law. That is a control, not a fix.

### Pattern three — a hand asserted a checkable falsehood

One hand reported that no use-case nodes existed. Fifty-seven did.

`meth-spawn-hands.md` line 61 records the measurement and the cost: the claim
was one glob away from being checked, and nothing checked it. The rule written
from it is that a hand's finding is evidence, never a verdict.

### Pattern four — two places holding one truth, three times over

The same shape appeared three times in one day, and a person caught all three.

- Two job registries. The harness's list, written by the host at spawn time,
  and the engine's table, written by `se_run {agent}`. Nothing reconciles them.
- Two surfaces. A header change landed in the mirror's breadcrumb, compiled,
  passed the whole boot battery, and was invisible, because the surface the
  owner reads is the editor panel.
- Two sources for the walker ceiling, session settings and the record's
  evidence, until the second was deleted.

None of the three was caught by a typecheck, the boot battery, or a review.

### Pattern five — the orchestrator cannot see a hand end

Exactly one thing closes a spawned-agent job: a call carrying
`se_run {agent_done}`, at `deliverable/engine/tools-run.ts` line 117. The job is
opened at line 95 of the same file.

The engine cannot observe a subagent finishing. The subagent runs inside the
harness, not as a child of the engine process, so there is no exit code to wait
on and no pipe to watch.

The consequence is a panel that claims work is live when nothing is, and an
estimate that grows forever because its step count never advances.

### Pattern six — a read-only state that only an edit can repair

A spawn state cannot be edited, and its own exit check can fail for a reason
only an edit fixes. The trap fired five times on 2026-08-23. Twice it took an
escape to the front desk to recover.

Both root causes were correct changes in themselves. The mechanism is that an
exit script is re-read on every attempt while the engine beside it is not, so a
change touching both halves is live on one side and stale on the other until a
reload.

Six engine reloads happened that day, each one re-walking the record from boot.

### Pattern seven — a rule and a check written an hour apart contradicted

The ceiling rule says spawning none at a state is a legitimate answer needing no
excuse. The spawn state's checkbox evidence refuses an unticked hand.

Both were written the same day by the same hand, and neither knew about the
other. The only way past the form was to spawn a hand the phase did not need,
which is exactly the waste the ceiling exists to stop.

## Part two — the prior art

### Anthropic — the case FOR, and its own caveat

Primary: [How we built our multi-agent research
system](https://www.anthropic.com/engineering/multi-agent-research-system),
published 2025-06-13.

WHAT THEY MEASURED. A multi-agent system with Claude Opus 4 as lead agent and
Claude Sonnet 4 subagents outperformed single-agent Claude Opus 4 by 90.2% on
their internal research eval. That is their own eval, on their own system, and
they say so.

WHY IT WORKS, IN THEIR READING. "Multi-agent systems work mainly because they
help spend enough tokens to solve the problem." Token usage alone explains 80%
of performance variance on BrowseComp; tool calls and model choice make up the
rest of 95%.

WHAT IT COSTS. Agents use about 4x the tokens of a chat interaction. Multi-agent
systems use about 15x.

THE CAVEAT IS THE IMPORTANT HALF, and it names our situation. Quoting the same
page: "some domains that require all agents to share the same context or involve
many dependencies between agents are not a good fit for multi-agent systems
today. For instance, most coding tasks involve fewer truly parallelizable tasks
than research, and LLM agents are not yet great at coordinating and delegating
to other agents in real time."

WHAT THEY DO ABOUT DELEGATION. "Each subagent needs an objective, an output
format, guidance on the tools and sources to use, and clear task boundaries."
Without that, they observed subagents duplicating each other's searches — one
explored the 2021 automotive chip crisis while two others both investigated 2025
supply chains.

WHAT THEY DO ABOUT EFFORT. Scaling rules are written into the prompt. Simple
fact-finding gets 1 agent and 3 to 10 tool calls. A direct comparison gets 2 to
4 subagents with 10 to 15 calls each. Complex research gets more than 10. Early
versions spawned 50 subagents for simple queries.

WHAT THEY DO ABOUT LIVENESS. They block. "Currently, our lead agents execute
subagents synchronously, waiting for each set of subagents to complete before
proceeding. This simplifies coordination, but creates bottlenecks."

WHAT THEY DO ABOUT DEPLOYING MID-RUN. Rainbow deployments, shifting traffic
gradually from old to new while both run. Their stated reason is that agents
"might be anywhere in their process" when an update lands.

WHAT THEY DO ABOUT VERIFICATION. An LLM judge against a rubric: factual
accuracy, citation accuracy, completeness, source quality, tool efficiency. They
tried multiple judges per component and found one call with one prompt, scoring
0.0 to 1.0 plus a pass-fail grade, most consistent with human judgement.

Their sibling page, [Building effective
agents](https://www.anthropic.com/engineering/building-effective-agents), opens
the same argument from the other end: "we recommend finding the simplest
solution possible, and only increasing complexity when needed. This might mean
not building agentic systems at all."

### Cognition — the case AGAINST

Primary: [Don't Build Multi-Agents](https://cognition.ai/blog/dont-build-multi-agents),
by Walden Yan, 2025-06-12.

TWO PRINCIPLES, IN THE AUTHOR'S OWN WORDS.

- "Share context, and share full agent traces, not just individual messages."
- "Actions carry implicit decisions, and conflicting decisions carry bad
  results."

HOW HARD HE PUTS IT: "I would argue that Principles 1 & 2 are so critical, and
so rarely worth violating, that you should by default rule out any agent
architectures that don't abide by them."

THE FAILURE HE DESCRIBES IS OURS. Copying the original task down to each
subagent is not enough, because "the agent probably had to make some tool calls
to decide how to break down the task, and any number of details could have
consequences on the interpretation of the task."

That is exactly what our three walkers hit. The guide's fifteen minutes of
locating a file were not in the brief, so each hand redid them.

HIS PRESCRIPTION: a single-threaded linear agent, and where context overflows,
a dedicated compression model rather than a second decision-maker.

HIS READING OF CLAUDE CODE'S SUBAGENTS, which is directly on point: they never
run in parallel with the main agent, and the subagent is usually only asked to
answer a question rather than write code. "The benefit of having a subagent in
this case is that all the subagent's investigative work does not need to remain
in the history of the main agent."

NAMED FRAMEWORKS AS WRONG. He names OpenAI's Swarm and Microsoft's AutoGen as
"actively push[ing] concepts which I believe to be the wrong way of building
agents."

WHERE HE HAS SINCE SOFTENED. The author has publicly said the position has
moved: "A year ago, I'd tell people to not build multi-agents ... Today, many
sexy ideas are still impractical, but we've found some setups that actually
work" ([post on X, 2026](https://x.com/walden_yan/status/2047054554433462360)).
Primary essay for the newer position not seen; treat the softening as reported,
not as evidence of a specific new architecture.

### LangChain — the reconciliation, and the sentence that matters most

Primary: [How and when to build multi-agent
systems](https://blog.langchain.com/how-and-when-to-build-multi-agent-systems/),
by Harrison Chase, 2025-06-16.

THE CENTRAL CLAIM: "Multi-agent systems that primarily 'read' are easier than
those that 'write'."

THE ARGUMENT: "read actions are inherently more parallelizable than write
actions. When you attempt to parallelize writing, you face the dual challenge of
effectively communicating context between agents and then merging their outputs
coherently."

THE OBSERVATION ABOUT ANTHROPIC'S OWN SYSTEM: the multi-agent part is the
research, and "the actual writing — synthesizing findings into a coherent report
— is deliberately handled by a single main agent in one unified call."

That single sentence explains why both blog posts are correct and why our day
went the way it did.

LangChain's [multi-agent
docs](https://docs.langchain.com/oss/python/langchain/multi-agent) name three
reasons people reach for multi-agent — context management, distributed
development, parallelization — and open with the caution that "not every complex
task requires this approach."

### The academic taxonomy

Primary: [Why Do Multi-Agent LLM Systems
Fail?](https://arxiv.org/abs/2503.13657), Cemri, Pan, Yang and ten others, UC
Berkeley and collaborators, v3 revised 2025-10-26. Full text:
[arxiv.org/html/2503.13657v3](https://arxiv.org/html/2503.13657v3).

WHAT IT IS. 1600+ annotated traces across 7 multi-agent frameworks, and a
14-mode failure taxonomy built from 150 traces by expert annotators, validated
at Cohen's kappa 0.88.

ITS OPENING SENTENCE IS THE FINDING: "Despite enthusiasm for Multi-Agent LLM
Systems (MAS), their performance gains on popular benchmarks are often minimal."

THE 14 MODES, WITH THE PAPER'S OWN SHARES OF ANNOTATED FAILURES.

Category 1, system design and specification.

- FM-1.1 disobey task specification, 11.8%
- FM-1.2 disobey role specification, 1.5%
- FM-1.3 step repetition, 15.7%
- FM-1.4 loss of conversation history, 2.80%
- FM-1.5 unaware of termination conditions, 12.4%

Category 2, inter-agent misalignment.

- FM-2.1 conversation reset, 2.20%
- FM-2.2 fail to ask for clarification, 6.80%
- FM-2.3 task derailment, 7.40%
- FM-2.4 information withholding, 0.85%
- FM-2.5 ignored other agent's input, 1.90%
- FM-2.6 reasoning-action mismatch, 13.2%

Category 3, task verification.

- FM-3.1 premature termination, 6.20%
- FM-3.2 no or incomplete verification, 8.20%
- FM-3.3 incorrect verification, 9.10%

Summing the paper's per-mode figures gives roughly 44% design, 32%
misalignment, 24% verification. That arithmetic is mine, not the paper's.

TWO INTERVENTION RESULTS, AND BOTH ARE DIRECTLY BUILDABLE HERE.

- Improving agent ROLE specifications alone raised ChatDev's task success by
  +9.4%, with the same user prompt and the same model.
- Adding a HIGH-LEVEL TASK OBJECTIVE verification step raised ChatDev's success
  on ProgramDev by +15.6%.

ITS WARNING ABOUT VERIFIERS IS THE ONE WE NEED. "Many existing verifiers perform
only superficial checks, despite being prompted to perform thorough
verification, such as checking if the code compiles or if there are leftover
TODO comments." Their example is a generated chess program that compiled and had
runtime bugs because nothing validated it against the rules of chess.

That is precisely our two-surfaces incident: the change compiled, passed the
boot battery, and did nothing.

ITS CAUTION ABOUT COMMUNICATION PROTOCOLS. The paper observes that failures in
category 2 happen even when agents inside one framework talk in natural
language, so standardising message formats does not fix them. Their words: this
signals "the collapse of 'theory of mind', where agents fail to accurately model
other agents' informational needs."

### The frameworks, and what each actually proves

A framework's documentation proves a feature is CLAIMED. It is not evidence the
feature works. Each entry below says which it is.

LANGGRAPH AND DEEP AGENTS. Opinion: give the builder full control of what
reaches the model, with "no hidden prompts, no enforced cognitive
architectures". Stated in the blog post cited above. The patterns it names —
subagents, skills, handoffs, router — are documented; no controlled comparison
against a single agent was found on their own pages.

AUTOGEN. Primary: [AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent
Conversation](https://arxiv.org/abs/2308.08155), Wu and 13 others, 2023. Opinion:
agents are conversable and customisable, and conversation patterns are the
programming model. The abstract claims "empirical studies demonstrate the
effectiveness of the framework in many example applications" across many
domains. It does not claim a controlled win over a single agent on the same
task, and I did not find one. Magentic-One, built on AutoGen, is one of the
seven systems in the MAST dataset.

METAGPT. Primary: [MetaGPT: Meta Programming for A Multi-Agent Collaborative
Framework](https://arxiv.org/abs/2308.00352), Hong and 14 others, v7 2024-11-01.
This is the closest published relative of what we built. It "encodes Standardized
Operating Procedures (SOPs) into prompt sequences", assigns roles on an assembly
line, and has agents "verify intermediate results". Its claimed result is "more
coherent solutions than previous chat-based multi-agent systems".

THAT COMPARISON IS THE UNCOMFORTABLE ONE, AND IT SHOULD BE SAID PLAINLY. MetaGPT
is a process machine with roles and SOPs, the same bet this project makes, and
MetaGPT is one of the seven frameworks whose traces MAST annotated as failing.
The paper's own ChatDev and MetaGPT case studies are where FM-1.1 and FM-3.2
were characterised.

CREWAI. Its [hierarchical process
doc](https://docs.crewai.com/en/learn/hierarchical-process) describes a manager
agent delegating to workers, "simulating traditional organizational hierarchies".
That is a claim about design, and the page offers no measurement. Counted as a
claimed feature only.

OPENAI SWARM AND ITS SUCCESSOR. [Swarm](https://github.com/openai/swarm)
describes itself as an educational framework built on two primitives, agents and
handoffs. It has been superseded by the OpenAI Agents SDK. That succession is
reported by search results; the repository README and the SDK docs were not
fetched, so treat the successor's primitives as reported, not verified. Swarm is
one of the two libraries Cognition names as pushing the wrong pattern.

### What I looked for and did not find

- NO CONTROLLED COMPARISON of a single strong agent against an orchestrated
  fleet on a process-machine-driven software engineering workflow. Nobody has
  published our benchmark.
- NO PRIMARY MEASUREMENT of AutoGen or CrewAI beating a single agent on a
  matched task. Their papers and docs claim capability, not a controlled win.
- NO TRACES FROM A HARNESS-SPAWNED SUBAGENT SETUP in the MAST dataset. Its seven
  systems are ChatDev, MetaGPT, HyperAgent, AppWorld, AG2, Magentic-One and
  OpenManus. Our arrangement is closest to the Claude Code shape, which is not
  in the set.
- NO PUBLISHED ANSWER to the liveness question in our exact form. Anthropic
  solves it by blocking, which is a design choice rather than a mechanism we can
  copy while the harness owns the spawn.

## Part three — what we should change

Nine recommendations. Each says what to build, why, and what it costs.

### R1 — Delegate reads, keep writes with the guide

WHAT. Change the default job of a spawned walker from authoring a state's
evidence to answering a question. A hand returns findings with the lane calls
that produced them; the guide performs the edits and fills the forms.

WHY. LangChain's read/write asymmetry, stated at the blog post above, and
Anthropic's own design, where the synthesis is one agent in one call. Measured
here: three writing hands each paid about fifteen minutes of re-read while the
guide, holding the context already, produced more in the same window.

COST. No parallel writing throughput, ever. The `hands` dial's `spawned` arm
becomes a research arm rather than a work arm.

WHAT IT CONTRADICTS, SAID OUT LOUD. `meth-spawn-hands.md` line 37 carries an
owner ruling of 2026-08-23 that the walker does the work of the states it walks.
This recommendation asks to revisit that ruling in light of the same day's
measurement. It is the owner's call, not the researcher's.

### R2 — Never share the position; hand it over or keep it

WHAT. Make the walk single-writer. While a hand holds the walk, the guide may
not aim, choose or pull. Enforce it: `se_aim` and `se_pull` refuse from a hand
that is not the current holder, naming who holds it.

WHY. Walker 4 produced nothing because the guide advanced the walk under it.
Cognition's principle 2 is the general statement of the same failure.

COST. The guide idles while a hand walks, which removes the only overlap the
current arrangement had. That overlap is the thing that produced the null hand,
so it is a cost worth paying.

### R3 — A brief carries four fields, and the guide's located context

WHAT. Make every spawn brief carry Anthropic's four fields — objective, output
format, tool and source guidance, task boundaries — plus a fifth this project
needs: WHAT THE GUIDE ALREADY KNOWS. File paths, line numbers, and the rulings
that landed this phase.

Enforce one brief per hand. Four briefs to one hand is what happened, and the
hand spent sixteen minutes reading four engine files.

WHY. Anthropic names the four fields and the duplicate-search failure they
prevent. Cognition's principle 1 says the trace matters, not just the message.
MAST's FM-1.2, role specification, is only 1.5% of failures by itself, but
fixing role specification alone bought ChatDev +9.4%.

COST. The guide writes a real brief every time, which is minutes. It is cheaper
than the re-read it replaces.

### R4 — A checkable claim must carry the call that checked it

WHAT. Where a hand states a fact about the repository — a count, an existence, a
path, an absence — the form field must carry the lane call reference that
produced it. No reference means the field reads `not checked`, not the claim.

The engine can enforce this the way `covers` is already enforced: a refs field
that computes both directions rather than trusting a paragraph.

WHY. One hand asserted no use-case nodes existed when 57 did, one glob from
being checked. MAST puts no-or-incomplete verification at 8.20% and incorrect
verification at 9.10% of annotated failures, and adding a high-level objective
check bought ChatDev +15.6%.

COST. More lane calls per hand, and some findings become an honest gap instead
of a confident sentence. The gap is the cheaper failure.

### R5 — Keep the cold reviewer, and keep it cold

WHAT. Change nothing about the reviewer at a gate. Keep it spawned at the gate,
with no shared context, never weaker than the author, and never blessing what it
wrote.

Add one thing: apply the same rubric shape Anthropic settled on. One call, one
prompt, explicit criteria, a verdict. `meth-gate-review.md` already carries the
rounds; the criteria could be named as fields the way factual accuracy and
citation accuracy are.

WHY. The reviewer was the single clearest return of the day: 13 minutes, two
genuine gaps in a gate the guide had already blessed. MAST's Insight 3 is that
multi-level verification is needed and final-stage low-level checks are
inadequate.

COST. A full cold read at every gate, paid in tokens and time on purpose. Worth
it, and already recorded as such at `meth-spawn-hands.md` lines 73 to 75.

### R6 — Close the liveness gap at the hook, then at the registry

WHAT. Two steps, in order.

- SHORT TERM. Fire the harness's subagent-stop hook into a settle call, the same
  shape as `deliverable/engine/bin/se-hook-stop.ts`. The payload carries no job
  id, so it settles the oldest running agent job. With several hands running
  that can pair the wrong close with the wrong job, and it is still better than
  a job that never closes.
- PROPER FIX. One registry. The engine's table has to be the one place, because
  it is the only one this project can write. The hard half is a host
  integration, since nothing in this repository can put a row into the harness
  panel.

WHY. Nothing but a manual `se_run {agent_done}` closes an agent job today
(`deliverable/engine/tools-run.ts` line 117). Panels claim work is live when
nothing is. Anthropic buys liveness by running subagents synchronously and
naming that as a deliberate bottleneck.

COST. The hook fix can mis-pair under concurrency. R2 removes that risk, because
under single-writer there is at most one walking hand.

### R7 — Never let a state be unrepairable from inside itself

WHAT. Three changes, any of which alone breaks the trap.

- AN EXIT SCRIPT REFUSES TO JUDGE A TREE NEWER THAN THE ENGINE RUNNING IT, and
  says so. Today it reports a stale-engine artefact as a missing hand, which
  sends the reader to spawn a hand that cannot help.
- A STATE THAT REFUSES ON ITS OWN GUARD ALLOWS THE TOOLS THAT REPAIR THAT GUARD.
  Boot already does this: its guidance says the repair tools are legal there
  while a check stands red.
- THE `hands` DIAL GETS A CONTROL A PERSON CAN REACH, since `solo` passes the
  spawn check outright.

WHY. The trap fired five times on 2026-08-23 and twice needed an escape to the
front desk. Anthropic's rainbow deployments exist for the same class of problem:
"agents might be anywhere in their process" when an update lands, and six
reloads happened here in one day.

COST. Every exit script gains a version check. States get slightly more
permissive, which weakens the read-only guarantee in exactly the case where the
guarantee is doing harm.

### R8 — A weaker hand may read; it may never judge or write evidence

WHAT. Write the rule as a two-column test rather than a preference.

- ACCEPTABLE WEAKER: searching, globbing, mapping a subsystem, gathering
  candidates, mechanical repetition of a shape the guide specified. The output
  is findings the guide will check under R4.
- NEVER WEAKER: any gate bless, any verdict, any state whose evidence is
  authored judgment, and any edit to the engine.

WHY. Anthropic's 90.2% result is Opus lead with Sonnet subagents — a strong
verifier over cheap readers, on a reading task. `meth-spawn-hands.md` line 83
already says a reviewer is never weaker than the guide; this extends the same
logic to authoring.

COST. Most states in a record author judgment, so under this rule most walking
needs a strong hand. That removes the cost saving people expect from a fleet,
and it should be stated rather than hoped away.

### R9 — Make `solo` the default and require an argument to spawn

WHAT. Flip the `hands` dial's default from `spawned` to `solo` for records whose
work is writing. Spawning then needs a named reason at the spawn state, from a
short list: unscoped breadth, mechanical repetition across many files, a cold
review at a gate, or research.

Fix the contradiction R7's third bullet exposes: the checkbox evidence must
accept an unticked hand as a real answer meaning "this phase started no such
hand", with the reason beside it.

WHY. The measured day, the owner's verdict, and Anthropic's own caveat that
coding has fewer truly parallelizable tasks than research. Anthropic's guard
against the same failure is effort-scaling rules written into the prompt, after
early versions spawned 50 subagents for a simple query.

COST. The comparison the `hands` dial was built for gets harder, because the
`spawned` arm will be run less often. Keep the estimate store recording both
arms so the flip stays measurable.

## The strongest counter-argument, engaged

THE HONEST READING OF THE FIELD IS THAT A SINGLE STRONG AGENT WITH GOOD TOOLS
BEATS AN ORCHESTRATED FLEET FOR THIS WORK. Cognition says it outright. Anthropic
says it about coding specifically. MAST says the benchmark gains are often
minimal. LangChain says a single agent with the right tools often achieves
similar results.

Our own day says it too, and the owner said it before the record did.

SO THE DEFENCE OF THE ROSTER HAS TO BE NARROW, AND IT IS.

- THE COLD REVIEWER IS NOT PARALLELISM. It is independence, and no single agent
  can buy it at any price, because a hand cannot forget what it wrote. It paid
  the day it was tried.
- UNSCOPED READING IS GENUINELY CHEAPER DELEGATED, because the reading is work
  somebody had to do, and the guide gets the compression instead of the raw
  files. This report is that case: a hand read seven external sources and the
  guide receives the findings.
- A HAND THAT REFUSED TO GUESS ROUTED WORK CORRECTLY. Walker 2 discovered that
  nothing inside `se_run`'s handler can see the walk's position and stopped
  rather than inventing a mechanism. That finding was worth more than the code
  it did not write.

WHAT THE COUNTER-ARGUMENT DOES NOT SAY. It does not say the roster is worthless.
It says the roster was pointed at the wrong work. Every case above is a read.
Every failure of the day was a write.

THE LIMITS OF THIS READING, STATED. One session, one day, one kind of work. It
is a reading, not a verdict. Anthropic's 90.2% is one company's internal eval on
its own system. MAST's traces come from frameworks that are not ours. The `hands`
dial exists so the other arm can be run, and until it is, R9 rests on one day's
measurement plus other people's caveats.

## Sources

- Anthropic, How we built our multi-agent research system —
  https://www.anthropic.com/engineering/multi-agent-research-system
- Anthropic, Building effective agents —
  https://www.anthropic.com/engineering/building-effective-agents
- Cognition (Walden Yan), Don't Build Multi-Agents —
  https://cognition.ai/blog/dont-build-multi-agents
- Walden Yan, softened position, post on X —
  https://x.com/walden_yan/status/2047054554433462360
- LangChain (Harrison Chase), How and when to build multi-agent systems —
  https://blog.langchain.com/how-and-when-to-build-multi-agent-systems/
- LangChain, Multi-agent documentation —
  https://docs.langchain.com/oss/python/langchain/multi-agent
- Cemri et al., Why Do Multi-Agent LLM Systems Fail? —
  https://arxiv.org/abs/2503.13657 and https://arxiv.org/html/2503.13657v3
- Hong et al., MetaGPT — https://arxiv.org/abs/2308.00352
- Wu et al., AutoGen — https://arxiv.org/abs/2308.08155
- CrewAI, Hierarchical Process —
  https://docs.crewai.com/en/learn/hierarchical-process
- OpenAI, Swarm — https://github.com/openai/swarm

Internal evidence: the recorded answers of 2026-08-23 in the call log,
`deliverable/machines/methods/meth-spawn-hands.md`,
`deliverable/machines/methods/meth-gate-review.md`, and
`deliverable/engine/tools-run.ts` lines 95 and 117.
