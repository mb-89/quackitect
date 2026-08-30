# Level 1 — work tokens and the crew

**Status: first draft.** Built on Level 0 and nothing else.

| | |
|---|---|
| Date | 2026-08-29 |
| Scope | v4, the obligation and delegation layer |
| Depends on | Level 0 (identity, interception, record) |

Same admission test as Level 0: **name, ruling, why, and what breaks without it**. An entry
that cannot fill the fourth column is not admitted.


**This document states intended behaviour, not solutions**. Where an earlier version is
cited it is as evidence — a measured failure, or a confirmed fact about what exists.
Never as a mechanism to inherit. How any of this is built is decided when it is built.

---

## What Level 1 is

**Everything that has to do with work**. A work token is the only way work is described,
delegated, evidenced and closed. If something is being done, a token says so.

Level 1 supplies the token and the crew that tokens are assigned to. It also supplies the
rules for who may assign what to whom.

## What Level 1 knows about the levels above

**Exactly one thing: further scopes are supplied from above.**

Level 1 defines what a scope *does*. It is a barrier, and it cannot be left while tokens
in it are open. It owns two scopes natively: **the session**, and **a token with
sub-tokens**. It does not define what other scopes exist. With nothing above, those two are
all there are.

Words that must never appear in a Level 1 implementation: state, gate, machine, iteration,
milestone. A scope is an opaque identifier with a barrier rule.

## Level 1 standalone

With no level above, you have a working delegation and obligation system. Nested walkers,
each with its own scribes and reviewer. Work described, delegated, evidenced and closed.
Nothing stoppable while an obligation is open. Everything escalating to the human at the
top.

One scope — the session — so every token is either open or session-scoped. That is useful
on its own, and it is the whole of what Level 2 later subdivides.

## Governing rules

1. **Everything that has to do with work goes through a token.** Reading, writing, doing,
   reviewing, asking. No side channel.

2. **State lives in tokens, not in agents**. This is what makes every agent spawnable and
   disposable — the token carries whatever must survive.

3. **A token names its closer, and by default that is not whoever worked it**. The human's
   tokens close themselves, and that is the base case that terminates the chain.

4. **The minter decides whether a token is traced**. The agent has no access to the
   engine's minting path, so it cannot downgrade its own work.

5. **The human talks to one actor**. All communication between the system and the person
   passes through the walker at the top of the chain.

6. **Mechanical is an assignee, not a flag.** Work the engine does is work assigned to the
   engine.

7. **A token is created in the scope where its answer is needed**, not the scope where the
   question arose.

8. **Escape is not abandonment.** Escaping a scope leaves its open tokens open and visible.

---

## The token

| Field | Ruling | Why | Breaks without it |
|---|---|---|---|
| **Form** — what work is to be done | **ACCEPTED** | The token is the description. There is no work without one. | Work exists that nothing describes, and the record cannot say what was attempted. |
| **Guidance** — inline, or by reference | **ACCEPTED** | Method travels with the work. Inline for small, by reference for shared. | The agent supplies its own method, and two agents do the same job differently with nothing to compare. |
| **Evidence** — a filled template, or a script that runs | **ACCEPTED** | Completion must be demonstrable, not asserted. Two kinds cover both judgement and mechanism. | "Done" is an agent's opinion about itself. |
| **Assignee** | **ACCEPTED** | Every token is somebody's. Includes the engine (mechanical) and the human. | Nothing can be blocked on, delegated, or escalated. Obligation has no owner. |
| **Scope** | **ACCEPTED** | The barrier. A scope cannot be left while its tokens are open. Closing them all opens what is next. | Work can be walked away from silently, which is the failure the whole layer exists to prevent. |
| **Traced or ephemeral** | **ACCEPTED** — decided at minting, per token | Not inherited from the record: inside a recorded scope, ephemeral tokens are still legal and ordinary. Planning steps are not record material. Integrity is protected by the closer field, not by this one — an agent cannot escape review by minting ephemeral. | Either every planning step lands in the record, or a recorded scope has no way to hold scratch work. |
| A token that gates a scope **supplied from above** is traced regardless of the choice at minting | **PROPOSED** | A token placed in a scope it did not create changes the order of work, and that belongs in the record. Narrowed so it does not catch a token's own sub-tokens, which gate only their parent. | Work that blocked progress leaves no trace of having done so. |

### Sub-tokens

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| A token may have **sub-tokens**, and cannot close while any is open | **ACCEPTED** | The same barrier one level down — a token with children *is* a scope. No new mechanism. | An agent holding a large token has no way to break it down, so planning happens in its head and nowhere in the record. |
| Sub-tokens are **ephemeral and not traced** | **ACCEPTED** | Planning is not work product. Tracing it floods the record with the shape of someone's thinking. | The trace fills with planning noise and the handoffs get lost in it. |
| Sub-tokens usually carry `closed_by: self` | **ACCEPTED** | Not an exception to the closure rule — a different value of the field that states it. Four eyes belong at the boundary of delegated work, not on an agent's own breakdown. | An agent cannot close the steps it invented for itself, and planning deadlocks. |
| Sub-tokens are **assignable like any token** | **ACCEPTED** | This is the real payoff: splitting work and delegating a piece of it become one act, at the natural grain. | Delegation only works at whole-task granularity, which is rarely the useful unit. |
| A depth cap | **NOT ADMITTED** | No observed failure — agents have not been seen over-producing sub-tokens. Add it if and when they do. | Nothing yet, which is the whole reason it is not admitted. |
| The agent is **given** every token in scope, not told to go looking | **ACCEPTED** — a delivery, not an incentive | Prose rules do not change agent behaviour. Refusals do. An instruction to read everything available is a prose rule. Putting the whole picture in front of the agent leaves nothing to instruct. | The agent plans against the one token it was handed and re-discovers the rest later. |

---

## The crew

| Role | Lifetime | Ruling | Why | Breaks without it |
|---|---|---|---|---|
| **Walker** | one per scope, nested | **ACCEPTED** | The only role that advances a scope, and there is exactly one per scope. Fresh context per scope. | One context carries every phase, and whoever gathered the requirements ends up judging whether they were met. |
| **Scribe** | fresh per task, parallel where independent | **ACCEPTED** | Exists to burn context so the walker does not. A persistent scribe accumulates context and becomes a second walker. | The walker reads everything itself and the context problem returns whole. |
| **Reviewer** | one per walker, dies with it | **ACCEPTED** | Continuous check on each submission, bounded to one walker's phase — so its entanglement is bounded too. | Nothing checks work as it is made. Every error waits for a batch check that sees the whole and can no longer say which piece caused it. |

**Spawning the crew is this level's act.** Level 0 establishes an identity for whatever is
started and guards it. It does not know that a reviewer or a scribe exists, and it must not
learn. *Breaks without it:* the role vocabulary reaches the layer that is meant to work with
no roles at all.

**The unit of nesting is a crew, not an agent**. A walker plus its scribes and its
reviewer are spawned and despawned together. Nesting is scope nesting.

**There is no separate role above the walker**. v3 had one: an actor that entered a
record and stayed across it without ever advancing. It did not work. A walker that
spawns sub-walkers stands aside while they run. That is the whole of what it was for.

**The scribe transcribes — it does not compose.** It may write content the walker fully
specified, never content it authors. *Breaks without it:* the walker delegates authorship
and the reviewer reviews work the walker did not write and cannot defend.

**The reviewer never receives the walker's context** — only the artifact and its rules.
*Breaks without it:* the reviewer inherits the walker's framing and its approval is worth
nothing.

**The reviewer also carries the output-discipline checks** — whether a claim's support
actually supports it. Whether a register entry is really outside our control. And whether
anything is asserted with no marker at all. The last is its irreducible job: a linter sees
markers that exist and cannot see a claim nobody made visible.

**Consistency belongs to the rules, not to the reviewer**. If two reviewers with the same
rules and the same artifact disagree, the rules are underspecified. That is a finding, not
a problem to hide behind one long-lived reviewer.

---

## The assignment graph

| Edge | Ruling | Why |
|---|---|---|
| engine → engine | **YES** | Mechanical work: the engine executes it. |
| engine → walker | **YES** | Scope-minted obligations. |
| walker → sub-walker | **YES** | A walker spawns a walker for a nested scope, then stands aside. |
| walker → scribe | **YES** | Reading and writing tasks. |
| walker → reviewer | **YES** | Submission. |
| walker → human | **YES** | Only via the top of the chain (rule 5). |
| scribe → walker | **YES** | Submits back. The walker accepts or returns it as a new open token. |
| reviewer → walker | **YES** | Returns with a typed reason. Becomes a new open token. |
| reviewer → scribe | **NO** | Not necessary. |
| scribe → scribe | **NO** | Not necessary. Nesting helpers has no bound. |
| reviewer → human | **NO** | Rule 5. |

**Escalation** runs up the walker chain. A walker asks its parent, which answers if it can
and passes upward if it cannot. The human sits above all walkers. The chain is finite by
construction, so it terminates.

**Questions requiring authority the agents do not have should skip the chain**. A
preference, a business decision, or anything only the owner can settle is addressed to the
human directly. *Breaks without it:* an answer only the human can give is relayed through
N walkers. Each spending tokens to conclude it cannot answer.

**Nesting depth costs N live crews** — the parent must stay alive while children run. Cap
it in config (Level 0 owns the config mechanism).

---

## Closing

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| Every token names its **closer** in a field, defaulting to the creator's reviewer | **ACCEPTED** | One field, three cases: a named role, `self` for work steps, and the default for everything else. Four eyes by construction rather than by policy, without a law that needs exceptions carved out of it. | An actor declares its own work done — the one judgement it is least able to make — or the rule needs a special case per situation. |
| The human's tokens self-close | **ACCEPTED** | There is no higher authority to close them. This is what terminates the closure chain. | Infinite regress: every closer needs a closer. |
| The walker may not reject the human's answer | **ACCEPTED** | The reviewer holds *delegated* authority over quality. The human holds *original* authority. An agent rejecting the owner would be overruling the source of its own mandate. | The authority gradient inverts and an agent can veto the owner. |
| The walker may open a **new** token asking for clarification | **ACCEPTED** | Same practical effect, correct semantics — the record shows a question, not a repudiation. | Either the walker is stuck with a nonsensical answer, or it gets a rejection power it must not have. |
| An answer that makes no sense is grounds to **stop** | **ACCEPTED** | The only move available below the authority that gave it. | The agent proceeds on an answer it does not understand. |
| Rejections are typed — clause, what is wrong, what would satisfy it | **ACCEPTED** | The walker acts mechanically instead of re-interpreting prose. Same discipline as every other refusal. | Ping-pong: each round the walker guesses what was meant. |
| Findings accumulate on the token across rounds | **ACCEPTED** | A fresh reviewer reads the token's history, not a colleague's memory. Rule 2. | Each round can reject for a new reason and the loop never converges. |
| Bounded rounds, then escalation | **ACCEPTED** | Two agents can disagree politely for a long time. | Unbounded review loops burn a walk with nothing to show. |
| WIP limit on the human queue | **ACCEPTED** — moved down from Level 0 | Back-pressure, not throttling: when the queue is full the agent works on something else. | Work is dispatched faster than the human clears it, the queue grows unboundedly, and the human stops looking. That is how every notify-me system dies. |

---

## Dispositions

A token that closes without saying what became of it is how work disappears. v3 lost 25
tokens that way. They were found by accident.

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| A token cannot close without a **disposition** | **ACCEPTED** | Three values and no fourth: **done**, **became**, **dropped**. Vanishing becomes impossible, because there is no unstated exit | Work leaves the backlog, reaches no state, and nothing records that it happened |
| **Became** names its successors | **ACCEPTED** | The named successors must exist and point back | A succession that dangles, which is the same vanishing with a word in front of it |
| **Dropped** carries a reason | **ACCEPTED** | Abandoning is a decision, and decisions are recorded | Silent abandonment, which everything-started-gets-resolved exists to prevent |
| A chain whose successors were all dropped is **reported** | **ACCEPTED** | The work died. Somebody should know | A pipeline that quietly produced nothing |

## Processes

A **process** is a pipeline a token travels through. The token is not created and closed.
It is modified and passed on to a consumer.

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| A token created, worked and closed needs **no process** | **ACCEPTED** | Most work is this. The apparatus appears only when something is passed along | Every trivial task carries pipeline machinery |
| A token modified and passed on **is** a process, and is modelled | **ACCEPTED** | This is where work is handed between actors, and where it went missing before | Handoffs happen and nothing describes them |
| The traveller is **derived** from dispositions | **ACCEPTED** | Where a token came from and what it became is a walk over successions. Nothing is authored | A second record of the same thing, kept by hand |
| The obligation on the author is **one word** | **ACCEPTED** | For *became*, one word plus the successor ids, which the system can usually propose | An apparatus heavy enough that people avoid it |

## Deferred to Level 2

Scopes other than the session. Anything that subdivides a walk. Approvers and the batch
review that spawns them. Whatever mints scope-bound obligations. Level 1 must run with
none of it.
