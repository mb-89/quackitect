# Output discipline — voice and evidence

**Status: first draft.** Cross-cutting. Applies at every level.

| | |
|---|---|
| Date | 2026-08-30 |
| Scope | What may leave the agent, and on what basis |

**This document states intended behaviour, not solutions**. Where an earlier version is
cited it is as evidence, never as a mechanism to inherit.

Two halves of one concern. **Voice** is how something is said. **Evidence** is what it
rests on. They share an enforcement architecture, which is why they share a document.

---

## The shared architecture

| Where | Checks | On failure |
|---|---|---|
| The pre-write gate | Mechanical only — counts, patterns, graph properties, presence of required fields | Refuse. Nothing lands |
| The reviewer | Judgement — meaning, sufficiency, and what a linter cannot see | Return, with a typed reason |
| The retro sweep | Corpus-level — staleness, drift, orphans | Report |

**Mechanical is two tiers, not one.** This was measured, not assumed. A first pass over
these documents produced 726 findings. About 200 were real. The rest was noise from the
second tier.

| Tier | Examples | False positives | Cost to build |
|---|---|---|---|
| Pattern | word counts, sentences per paragraph, banned punctuation, contractions, Latin abbreviations | None | Small. Correct from the first day |
| Vocabulary and part of speech | approved words, verb forms, `-ing` outside a technical noun, passive voice | High without a word list and a tagger | Needs both first |
| Judgement | meaning, structure, whether a thing can be acted on | — | The reviewer |

**The first tier ships immediately. The second waits until it is accurate.** A check that
is wrong most of the time is the wrong lint. It becomes the next thing people route
around.

Two rules govern the split:

1. **Judgement may add refusals, never override them.** A model refusing a safe line costs
   a rewrite. A model approving a bad one is the failure the gate existed to prevent.

2. **Mechanical checks are transitive. Judgement checks are local.** The engine walks whole
   chains. The reviewer follows one link. Without this, every review re-verifies the entire
   history and reviewing becomes the most expensive act in the system.

---

# Part 1 — Voice

## Audience

Engineers in general, not software developers. Average competence. English as a second
language. The rules bind chat, documents, records, reports and code comments alike.

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| **Every document names one reader** | **ACCEPTED** | Before a line is written, say who reads this and what they hold a concern about. A README is read on arrival, so it carries what this is, how to start it, and where to look next. Key bindings belong to somebody already in the window. Cited: Diataxis (Procida) splits documentation into tutorial, how-to, reference and explanation, and its central claim is that blurring those boundaries causes most documentation problems. ISO/IEC/IEEE 42010 states the same rule for architecture: a view exists because named stakeholders hold named concerns, and it addresses those and nothing else. | A document that serves two readers serves neither. It grows until nobody reads any of it, and the reader who needed one exact thing cannot find it under the material meant for somebody else. |

| **Name the door, not what is behind it** | **ACCEPTED** | Two things may be relied on about a program this tree does not own: that it exists, and that it answers `--help`. A flag is a decision that program made for itself and can change without notice. So a README says how to install and how to start, and hands the reader to `--help`. Cited: Parnas (1972), every module is characterised by a design decision it hides from all others, and the hidden part is hidden because it is expected to change. The law of Demeter (Holland, Demeter project, 1987), also called the principle of least knowledge: talk to your immediate friends and not to strangers. The friend of a document is the command it names, and that command's flags are strangers. | Documentation reaches past the interface and binds itself to internals. It then goes wrong silently, because nothing behind an interface is obliged to warn it. The README described installer switches, and one of them, `--headless`, had never existed. |

| **Say what is, not what is not** | **ACCEPTED** | A sentence saying what a document leaves out is the thing it says it leaves out. Cut the sentence and keep the omission. Write a negative only where the reader would otherwise act on the opposite, which covers a refusal, a limit and a warning. Cited: Strunk and White, put statements in positive form, and use "not" as a means of denial or in antithesis, never as a means of evasion. This is also the self-reference quarantine seen from the other side: a document that stops to describe its own conduct has changed subject. | Documents grow a layer of throat-clearing about their own scope. It costs the reader attention, it dates faster than the content, and it is the space the missing material would have occupied. |

**Three questions, not one.** Authority asks whether this document may state a fact at all,
which is a question of ownership. Audience asks whether this reader needs it here, which is
a question of concern. Reach asks how far past its own boundary the document may look, which
is a question of interface. A fact must pass all three. Owning a fact is not a reason to
write it where nobody needs it, and needing a fact is not permission to reach behind an
interface to get it.

## The quarantine

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| **Self-reference has exactly one chapter** | **ACCEPTED** | v1 had this and it worked: one chapter is the only place the document may speak about itself, and the quarantine is checked mechanically. Everything else stays pure. | Internals leak into instructions, and the reader cannot tell what is an order from what is an explanation. |
| Rationales are **keyed to the thing they explain** | **ACCEPTED** | Navigate from the thing to its why, in referent order. A free-floating essay is not a rationale. | Rationale accumulates as prose nobody can route from, and it rots where it lies. |
| An empty rationale slot **fails**, and an explicit not-applicable mark passes | **ACCEPTED** | v1's own reason: an empty slot reads as neglect. The mark distinguishes judged silence from forgotten homework. | Silence is ambiguous, so nobody can tell an answered question from an abandoned one. |
| **Provenance never appears in prose** | **ACCEPTED** | Dates, who decided what, how something came to be. History belongs in commit messages. The head shows only what is true now. | Every document accumulates a narrative that ages faster than its content, and readers stop trusting the parts that are still true. |
| **Audience presets** decide which chapters a reader gets | **ACCEPTED** | v1 built these — newcomer, architect, auditor, one-pager, agent. Stakeholder-specific communication as a mechanism rather than a habit. | One document tries to serve every reader and serves none. |

## Simplified Technical English

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| STE governs **instructions and person-facing output** | **ACCEPTED** | It was built for procedures read by non-native speakers, which is the audience. | Prose drifts back to whatever the writer finds natural, which is never what the reader finds easy. |
| **The rationale chapter is exempt** | **ACCEPTED** | STE forbids the semicolon, caps sentences, and allows one topic per sentence. Applied to reasoning it flattens the reasoning. | Either argument becomes unreadable, or the standard is quietly abandoned everywhere. |
| **One hard limit, one soft target** | **ACCEPTED** | Hard: 20 words procedural, 25 descriptive, 6 sentences per paragraph, 3 words per compound noun. Soft: 15 words, unenforced. | A limit that fires on every third sentence is a limit people learn to route around. Your own finding: a wrong lint becomes the new workaround pressure. |
| **The prompt carries only what a linter cannot check** | **ACCEPTED** | Roughly 25 lines. A rule the linter catches teaches itself through the refusal, which changes behaviour where prose does not. | The prompt becomes a style guide nobody reads and every turn pays for it. |
| The dictionary **never enters context** | **ACCEPTED** | Hundreds of entries. The refusal names the word and the approved alternative, teaching one word at a time, at the moment it matters. | The standing prefix problem, rebuilt out of vocabulary. |
| **Arm the lint at zero debt** | **ACCEPTED** | Correct every existing finding first. Exemptions freeze debt and teach nothing. | The first thing the lint teaches is that its output can be ignored. |
| **No statement outside your authority** | **ACCEPTED** | Every fact has one owner, which is the thing that decides it. A document that repeats a fact it does not own has made a decision nobody asked it to make, and nothing tells it when the owner changes. A limit, a budget, and a measurement a ruling rests on are not exceptions: prose owns those, so prose states them. Cited: DRY as Hunt and Thomas actually wrote it, "every piece of knowledge must have a single, unambiguous, **authoritative** representation within a system" — knowledge, not copied code. Information Expert (Larman, *Applying UML and Patterns*, 1997) states the same rule as responsibility: assign it to whoever has the information. Connascence of value (Page-Jones) names the damage: two places that must now change together, with nothing to enforce it, and a document sits far from the code. The last responsible moment says why to leave it open at all. | Prose fills with borrowed facts that read as precision and carry no obligation. The README said the self-test had eleven steps when it had fourteen. Nothing broke, which proves nothing depended on it, which is why it should never have been written. |

**Scope.** Full apparatus on documents, records and reports. Chat obeys the composition
rules but is not gated, because no reliable interception point exists for it. Where a
person-facing line must be checked, produce it as an artifact rather than as chat.

---

# Part 2 — Evidence

## What needs a source

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| **We are the source of our own instructions** | **ACCEPTED** | We mint them. Nobody outside authorises them, so nothing is cited. | Every instruction grows a footnote pointing at itself. |
| **Anything resting on an external truth says so** | **ACCEPTED** | That is the only place a claim can be wrong for reasons outside our control. | The dangerous claims are indistinguishable from the safe ones. |
| Every claim carries an **evidential status** | **ACCEPTED** | Measured, read at a locator, or inferred. One word. | Inferred silently becomes measured, which is how a confident answer turns out to rest on nothing. |
| A claim something **depends on** gets a file | **ACCEPTED** | Source, what would invalidate it, what breaks if it is wrong. Depending on a claim is what creates the entry, not asserting it. | Either every passing remark becomes a register entry, or the load-bearing ones never do. |
| The entry is minted **mechanically** when a claim is cited | **ACCEPTED** | Citing an unregistered claim creates the stub and mints a token to fill it, blocking whatever cited it. | Left to choice, this under-files for the same reason everything else does. |

## Chains

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| Every chain **terminates in ground truth** | **ACCEPTED** | A measurement, a locator, or an entry explicitly marked as the floor. | Chains dead-end in other assertions. This is the failure that actually happens — not bad reasoning, but reasoning that stops. |
| An **unargued claim is legal when it says so** | **ACCEPTED** | Borrowed from assurance-case practice: the undeveloped goal. The same rule as an empty rationale slot. | Either every claim must be fully argued before anything ships, or unargued claims hide. |
| **Who is entitled to declare a floor is judgement** | **ACCEPTED** | Somebody asserts the ground. Somebody else should be able to challenge it. Make the mark explicit and rare. | Anything becomes ground truth by being asserted twice. |
| Invalidation **propagates** | **ACCEPTED** | A claim whose ground moved marks what cited it — the same cone, respecting edge kinds. | Stale evidence stands, and the record says something is proven that is not. |

**Mechanically checkable:** marker and entry parity, and every entry has a type.
References resolve and chains terminate, with no cycles. Locators still exist and are
unchanged. Cited findings are fresh, and a register entry names its external dependency.

**Judgement:** does the evidence support the claim, and is the inference valid? Is a floor
entitled, and is a register entry really outside our control? Is an inferred claim being
used as measured? **And is anything asserted with no marker at all**? The last is the only
one that can never be automated, because a linter sees markers that exist.

## The register

**One question decides admission: what outside our control does this depend on? No answer,
no entry.**

| Kind | Belongs when | Otherwise |
|---|---|---|
| Risk | It names something outside our control that might happen | Work — go find out |
| Assumption | It names an external truth we cannot verify ourselves | Work — probe it |
| Issue | It is already true, blocks us, and we cannot fix it | Work — fix it |
| Decision | Its consequences reach beyond its own scope | A local choice, no entry |

A decision with global impact is a register entry, not a separate register with its own
lifecycle. One register, one propagation rule.

**The failure this prevents** is the one that already happened: agents filed every unknown
as a risk. An unknown is not a risk. It is work.

## Findings

Three stores, each with one job. The **register** holds what we cannot resolve by working.
**Work tokens** hold what is being done. **Findings** hold what we established ourselves.

A finding carries the question, the method, the answer, the time, and a **staleness
handle**:

| Established from | Staleness | Refresh |
|---|---|---|
| Files in our own trees | Computed — hash the cited regions | Automatic |
| Running something | The stored command | Re-run |
| The outside world | Not computable — needs an explicit expiry | By hand |

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| Findings are **corpus-level**, not per-record | **ACCEPTED** | A finding is citable from anywhere and is what a chain terminates in. | Record-scoped evidence dies with its record, and every record re-establishes the same facts. |
| A verified-once external fact is a **finding, not an assumption** | **ACCEPTED** | An assumption is unverified. A finding is verified and decaying. | The register fills with things that were checked years ago and reads as if they still hold. |

**The loop.** A claim rests on an external assumption → can we test it ourselves? Yes:
mint a probe token, which produces a finding, and the chain terminates there. No: a
register assumption, and the chain terminates in something marked unverified.

## Scope

| Artifact | Apparatus |
|---|---|
| Findings, reports, review verdicts, evidence | Markers, support entries, chains |
| The rationale chapter | Full — argument is what it is for |
| Chat | The status word only |
| Instructions and procedures | None. An instruction is not a claim |

---

## The word list

The standard's dictionary is the linter's data, and it is not ours to hand on.

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| The word list is a **swappable input** | **ACCEPTED** | It removes the licence question from the architecture. The same rules engine reads whichever list it is given. | The licence decides the design, and a change of licence means a change of code. |
| An **openly licensed list is the default**, shipped | **ACCEPTED** | A vehicle handed to someone else must work on its own. | Either nothing works out of the box, or something not ours travels inside the copy. |
| A **licensed copy found on the machine wins** | **ACCEPTED** | The full dictionary is better, and where it is present it should be used. Nothing is redistributed by using what is already there. | Machines that hold the real thing are held to the weaker default. |
| An absent list is **not an error** | **ACCEPTED** | Discovery skips on doubt. | First run on a fresh machine fails. |

**On the licence itself**. The standard's own notice grants irrevocable permission to use,
reproduce or publish it. That permission is *in whole or in part, free of charge*, to
eight named categories. The categories are aerospace and defence association members,
their customers, defence ministries, airworthiness authorities, and universities for
educational purposes. Outside those
categories, distribution needs written permission from the standard's maintenance group,
which the notice names. The default-plus-override design above holds either way, which is
the point of building it that way.

## Spikes

1. **Can the harness block a message before a person reads it?** Undocumented. Decides
   whether chat can be gated at all, or whether person-facing output must be routed
   through artifacts.

2. **Which linter.** Three arms: a mature general prose linter with a generated style. A
   purpose-built one, which is unaffiliated with the standard's authors and small. Or
   roughly 300 lines of our own. Maturity is not the deciding constraint — the word list
   is (see below).

3. **Where the claim graph lives.** A finding is a node beside the register entry, not a
   new store. Confirm nothing existing already covers it before adding a type.
