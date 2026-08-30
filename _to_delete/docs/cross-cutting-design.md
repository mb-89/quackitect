# Cross-cutting concerns

**Status: first draft.** Not a level. The levels answer *how much control*. This answers
*whose tree, who can read it, and who can operate it*. Every level must be checkable
against this document.

| | |
|---|---|
| Date | 2026-08-29 |
| Applies to | Levels 0–3 |

Same admission test throughout: **name, ruling, why, and what breaks without it.**

**This document states intended behaviour, not solutions.** Where v3 is cited, it is cited
as evidence. Evidence means a measured failure, or a confirmed fact about what exists. It
is never cited as a mechanism to inherit. How any of this is built is decided when it is
built.

---

## 1. Two acceptance tests per level

These are orthogonal, and a level is not done until both pass.

| Test | Ruling | Why | Breaks without it |
|---|---|---|---|
| **Standalone** — the level runs with nothing above it | **ACCEPTED** | The layering is only real if it can be disabled from the top down. | Levels grow references upward and the stack can only ever be built or run whole. |
| **Hand-operable** — the level runs with **no LLM in the loop** | **ACCEPTED** | The same discipline pointed sideways. Stated generally: **every actor is substitutable by a human.** Level 1's assignee field already supports it — the human is an assignee. So this is a surface requirement, not a mode. The extension and its views are in scope and may be used. What is removed is the agent, not the tooling. | The human path lags the agent path, then rots. This is what happened in v3. |

## 2. Understandability

The intended user interface is **VS Code**. The CLI exists and must be real, but it is the
instrument of the acceptance test, not the destination.

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| Everything a human must **produce** is a text file | **ACCEPTED** | The floor of the surface stack: editable with no extension installed. Already ruled once for the ledger — hand-editable markdown as the fallback without AI and for fine corrections. Evidence follows the same rule. | Hand-operation waits on a forms UI, which pushes the test to the end, which is when it stops being done. |
| Rendered views are a **nicer path to the same file**, never the only path | **ACCEPTED** | Buttons do what could have been done by hand. | The view becomes load-bearing and the file stops being the truth. |
| The **acceptance test runs with no LLM** — a person drives, using the extension | **ACCEPTED** | The thing being removed is the agent. Tooling is the point of the intended UI, not something to prove independence from. | "Hand-operable" becomes a claim nobody re-checks. |
| Files stay sufficient as a **fallback**, independent of that test | **ACCEPTED** | Already ruled for the ledger — hand-editable markdown as the path without AI and for fine corrections. It is a floor under the UI, not a rival to it. | A corner the UI does not cover becomes unreachable rather than awkward. |
| **A verb without a human path cannot ship**, and that has to fail loudly | **ACCEPTED** | v3 held the principle by intention and it decayed. The reason: the agent path can always ship without the human path, and nothing fails when it does. Intention is not a mechanism. | A verb ships without a way to do it by hand, silently, and the gap is found only when someone needs it. |
| What the human reads and what the agent got are **the same thing**, not two things kept in agreement | **ACCEPTED** | Agreement between two representations is a maintenance task that eventually stops being done. | The human is confidently told the wrong thing about what the agent saw. |
| The engine↔agent exchange gets a **renderer as part of the level** | **ACCEPTED** | The log is JSONL, and a human reading JSONL is not understanding. v3's unified log in the Mirror is the shape that worked. | Instrumentation exists and is unreadable, which is indistinguishable from not existing. |
| PlantUML for machines is **load-bearing here**, not a preference | **ACCEPTED** | Obsidian Advanced Canvas needs Obsidian. Text with a preview works in VS Code with nothing installed. The format ruling and the UI ruling hold each other up. | The intended UI cannot author the most important artefact. |

## 3. Trees

**The system's purpose is to work on projects that are not itself.** Working on itself is a
capability. It is not the point. The design must not be shaped by the self-hosting case.

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| A copy **does not reach back** into the tree it came from, and is not stopped from doing so | **ACCEPTED** | The model is an installed package. You do not usually change it, your changes are yours, and nothing you do locally lands upstream on its own. | Local work lands in someone else's repository without anyone deciding that it should. |
| Writing back into the original **is allowed when the user asks for it** | **ACCEPTED** | It is a legitimate act, done deliberately. A rule against it would forbid the ordinary case of fixing the tool you are using. | A real need has no route, so it gets done by hand around the tool. |
| The two trees are **separate folders, never a live link** | **ACCEPTED** | This is the whole protection, and it is structural rather than enforced. A link would mirror a local change upstream, where it can break someone else. | A change made for one project quietly becomes everyone's change. |
| The **extension link is not this** | **ACCEPTED** | The install links the editor's extension folder at the rendered tree. That is one installation pointing at its own output. It is not two trees sharing a live edge. | The one deliberate link is read as a violation of the rule above, and gets removed. |
| A guard that **cannot tell** whether it is about to do that must refuse | **ACCEPTED** | v3 states the reason exactly: a guard going quiet looks identical to a guard passing. | The protection is absent precisely in the cases nobody anticipated. |
| A project knows **which copy drives it**, in a way that survives either tree being moved or renamed | **ACCEPTED** | Any answer phrased as a location goes stale the moment either end moves. | The link breaks on the first reorganisation and looks like corruption. |
| **Finding the driver from that knowledge must work** | **ACCEPTED** — see below | v3 records the driver and cannot resolve it, because no register of what a machine holds exists. That gap is what makes the purpose unreachable. | Working on other projects stays manual: the link is documentation, not mechanism. |
| The method tree and the work tree are **two separate roots** | **ACCEPTED** | The opened folder may be empty. Method and work were one tree in v3, so pointing the agent at an empty folder pointed it at an empty method. | The system can only ever work on itself. |
| Nothing needs to be **declared** to reach the work tree | **ACCEPTED** | A declared door out is only necessary because everything collapsed into one root. Two roots, no door. | A declaration mechanism nobody understands the need for. |
| The tool's **own development record does not travel** with the tool | **ACCEPTED** | A copy is a fresh start — its history is its own. | Someone else's records ship inside their tool. |
| A driven project holds **work, not machinery** | **ACCEPTED** | The method lives in the copy that drives it, so a project is a plain tree. | Every project becomes a fork of the tool, and updating means updating all of them. |
| A write lands in **the tree the current work is about** — never a neighbouring one | **ACCEPTED** | This is the one invariant everything else here rests on. v3's phrasing is worth keeping: a guarantee, not a switch somebody forgot. | A write lands somewhere nobody chose, and that is discovered later, by its effects. |
| **Reading is not restricted the way writing is** | **ACCEPTED** | Producing a copy means reading the tree it is copied from. Bounding reads the same way bounds production out of existence. | Either the guarantee blocks the system's own purpose, or it is loosened until it guarantees nothing. |

### Reaching a foreign tree

The user story that decides this shape: someone opens an **empty** folder and presses a
button. The agent that comes back is fully governed — by a method that is not in that
folder. It helps create the folder's content.

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| The governing material arrives **with the tooling, not with the folder** | **ACCEPTED** | An empty folder has nothing to read. Whatever governs the agent has to be active independently of what is open. | The empty-folder story is impossible, which is the normal case for a tool meant to work on other projects. |
| What loads for every session is a **stub** — it then chooses an engine | **ACCEPTED** | The thing that loads unconditionally must be small. It also decouples engine updates from tooling updates, and removes the need for one installed tool per vehicle. | Every vehicle installs a full engine that runs whether or not it is wanted. |
| A vehicle **stays where it was cloned** and registers itself from there | **ACCEPTED** | A vehicle is a working tree that gets edited. Forcing it into a canonical location fights that. | Either vehicles cannot be edited in place, or their location is guessed. |
| The register is **one small entry per engine**, and listing them is the register | **ACCEPTED** | Nothing to keep in sync, and concurrent installs cannot collide because they touch different entries. | A single shared file that two installs race to write, and whose corruption removes every engine at once. |
| An **environment override**, for machines where no persistent location applies | **ACCEPTED** | A cloud box is provisioned, not installed into. But a process launched from a graphical tool does not reliably inherit a shell environment, so the override cannot be the only mechanism. | It works in the cloud and fails on the desktop, or the reverse. |
| Install is **self-registering and idempotent** | **ACCEPTED** | Clone, run install: it ensures the stub, then registers itself. Identical on a laptop and in a container. | A central install step that has to know about every vehicle in advance. |
| **Discovery skips on doubt — enforcement refuses on doubt** | **ACCEPTED** | A missing engine is a fact about the world, so a lookup returns fewer entries. A guard that cannot tell whether it is about to write into the wrong tree must refuse. Opposite defaults, both right. | Either a stale entry crashes the tool, or a guard that cannot tell passes silently. |
| **Ambiguity is reported, never skipped** | **ACCEPTED** | Two entries claiming one identity is a fact about a mistake. Choosing either is a guess. | The tool silently connects to the wrong vehicle. |
| **Zero engines is a valid state** | **ACCEPTED** | It says none are installed and how to install one. | The first-run experience is a crash. |

## 4. Confidentiality

**The model, stated plainly:** anything that could be confidential lives in `.se`. Anything
entering the ledger is **filtered at the crossing** — mechanically, and by judgement from
an LLM or a person. There is no tier system and none is needed. There is a private side, a
shareable side, and one filtered door between them.

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| `.se/` is the confidential side | **ACCEPTED** — exists | Machine-local, never committed. Anything that might be confidential goes here by default. | No place for anything that must not travel. |
| The ledger is the shareable side | **ACCEPTED** | Committed, distributed, readable by anyone who has the repo. | The distinction that makes the filter meaningful. |
| The crossing has **one door** | **ACCEPTED** — exists | Direct writes into the shared pool are refused. Everything goes through the mint. *"The mint is what checks that nothing private travels."* | A second write path makes every check advisory. |
| **Mechanical checks refuse** at the door | **ACCEPTED** — exists | A statement is refused if it carries a token that looks like an identifier — one containing a separator, or a long opaque run. It is also refused for a six-word run copied from the source. *"An address, a path or a secret is one word, and one word is enough to leak."* *"The rewrite IS the privacy boundary."* | The only guarantee that does not depend on somebody's judgement. |
| **Judgement may add refusals, never override them** | **ACCEPTED** | An LLM or a person may refuse what the mechanical checks let through. Neither may approve what the checks refused. A model approving a leak is a leak. A model refusing a safe line costs a rewrite. Same narrowing-only shape as the config chain. | The privacy boundary becomes probabilistic in the one direction where being wrong is unrecoverable. |
| Refs are **root-relative** | **ACCEPTED** — exists | An absolute path carries the account name of whoever ran it, and work items land in version control. | Machine and user identity leak into committed artefacts. |
| Privacy **tiers** (no-remote / private / shareable) | **NOT NEEDED** | Superseded by the two-sides-and-a-door model above. In v3 they were prose only — no classification, no redaction pass, no scanning — so nothing is lost by dropping them. | A classification scheme to maintain, on top of a boundary that already decides the question. |

## 4a. External sources

An external source is a **reference**: a document, a link, a standard, or vendored code,
each carried with a version. Parked with the knowledge-base discussion, but three things
already bind.

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| A reference records **redistribution rights** | **RULED, NEVER BUILT** | Without rights, a full vendored snapshot may not travel. An excerpt with notes and a hash may. v3's reference notes carry title, url, kind, version, accessed and tags — and no rights field on any of the 44. | Something not ours ships inside a copy handed to someone else, and nobody notices until it matters. |
| A reference may resolve **only on some machines** | **UNDESIGNED** | Two of v3's reference notes already point at local digest paths rather than URLs, so this is live today with no rule behind it. | A reference that resolves for the author and silently fails for everyone else. |
| An unresolvable reference **degrades, never crashes** | **ACCEPTED** | Discovery skips on doubt. Fall back to whatever open equivalent exists, and say which was used. | A machine without a private source cannot run at all. |

## 4b. Modules

The system is built from modules from the start. The method is one. The knowledge base is
another. A library for a programming language would be another.

**The mechanism for import, export and packaging is deliberately not decided.** What is
decided is the split. The split is cheap now and expensive later.

| Layer | Holds |
|---|---|
| **Engine** | The mechanisms. Interception, obligations, ordering |
| **Modules** | The method, the knowledge base, a language library. Content, plus code where a module extends the engine |
| **Content** | Records, evidence, the walk |

**The engine is not a module.** It is what modules run on. Without that line the definition
regresses. The method is a module. The thing that loads it is a module, and so on.

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| Separate concerns are separate modules **from the start** | **ACCEPTED** | Allowing the split at the top level costs nothing today. | A split attempted later, when everything already touches everything. |
| Every id carries its **module qualifier**, hidden while one module exists | **ACCEPTED** | With modules from strangers there is no namespace to coordinate. Two authors will write the same bare id. | Renaming every id and every reference later, under pressure. |
| Every node **names its module** | **ACCEPTED** | Ownership is a fact, not a folder convention. | A migration over the whole corpus. |
| Modules live in **separate trees** | **ACCEPTED** | Physical separation cannot erode quietly. A field can. | The split exists on paper and not on disk. |
| No module reaches into another's internals | **ACCEPTED** | Even a trivial declared surface is a surface. | Finding out at split time that everything is coupled. |
| Modules share **one ledger and one timeline** | **ACCEPTED** | They scope ownership and views, never process. This is v1's ruling and it is what stops a module becoming a project. | Nested gates, nested ledgers, nested iteration state. |
| Coupling between modules is **optional** | **ACCEPTED** | The method must run with no knowledge base. It merely profits from one. A module asks for a **capability**, never for another module by name — which is also what makes two language libraries substitutable. | Every module becomes a hard dependency of every other. |
| Import, export, packaging, versioning, capability negotiation | **DEFERRED** | None of them constrain what is built first. | — |

## 4c. Holding the corpus

Obsidian stays quick at tens of thousands of notes. v3 is slow at a few hundred. The
difference is not cleverness. **Each layer is invalidated only by what it read.**

| Layer | Holds | Invalidated by |
|---|---|---|
| Files | path, and its parsed content | That path |
| Nodes | id, type, statement, **typed** edges, per-field hashes | Its own file |
| Reverse index | target, and what points at it, per edge kind | Incrementally, by the changed file's edges |
| Derived answers | coverage, cones, views, verdicts | Their recorded read set |

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| **Nothing is invalidated by an event it did not depend on** | **ACCEPTED** | The rule the four layers exist to satisfy. | One write moves everything, which is v3's measured defect. |
| **A request is not a change** | **ACCEPTED** | The daemon is long-lived. Only a file change is a change. v3 invalidates everything derived on every request, which is the single most expensive line it has. | The warm model is built and then thrown away on every call. |
| Hash **content, normalised**, never metadata | **ACCEPTED** | A checkout must not invalidate the world, and a cosmetic edit must not either. | Timestamps and sizes decide what is recomputed. |
| **Two hashes per node** — its own, and one folding what it depends on | **ACCEPTED** | The own hash survives a neighbour's cosmetic edit. The deep hash drives propagation. | One hash does both jobs badly, which is how v1 got mass-suspect. |
| Hash **per field**, not per file | **ACCEPTED** | A design node goes suspect when a requirement's statement changes, not when somebody adds a tag. | The largest single source of false suspicion. |
| Propagation **stops early** | **ACCEPTED** | Walk the reverse index along propagating kinds only, and stop where a deep hash is unchanged. Most edits stop within two hops. | Every edit walks the whole graph. |
| **Typed edges survive loading** | **ACCEPTED** | Erasing the kind forces every consumer that needs one to re-open the files. v3 does exactly this, at three or more sites. | The graph cannot answer a question about a kind of relationship. |
| The reverse index is **updated, not rebuilt** | **ACCEPTED** | Removing one file's old edges and adding its new ones is proportional to that file. | An index rebuilt inside every query. |
| **One sweep at startup**, then events | **ACCEPTED** | A single stat over a few hundred files is milliseconds. Paying it repeatedly is not. | The startup cost is paid on every request instead. |

## 4d. Note schemas

Every kind of note has a schema, and everything else about that note kind derives from it.

| Derived | From |
|---|---|
| The template a new note starts from | The schema |
| The comment explaining each field | The field's description |
| Validation | The field's type and constraints |
| The dropdown | The field's enumeration |
| What a value means | The note the value came from |

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| Templates are **generated**, never hand-written | **ACCEPTED** | A hand-written template drifts from the schema it is supposed to match. | Two statements of one shape, agreeing once. |
| Every field carries a **description the author sees** | **ACCEPTED** | Guidance belongs where the field is, not in a manual. | The author guesses, and the manual is not read. |
| Enumerated fields are **constrained**, and a wrong value is shown as wrong | **ACCEPTED** | Enforcement is the part no editor gives us. | Free text where a vocabulary was intended. |
| The allowed values are **notes in a folder** | **ACCEPTED** | Adding a value means writing what it means. The engine reads the folder. | A vocabulary nobody documented, and a schema that drifts from the corpus. |
| **Suggestion and enforcement read the same list** | **ACCEPTED** | Suggesting from usage propagates a typo forever. Suggesting from the vocabulary cannot. | Two mechanisms that disagree, and a wrong value that spreads because it was offered. |
| The note defining a value **is** that value's guidance | **ACCEPTED** | One artefact serves the dropdown entry and the thing the engine serves when working there. | The same explanation written twice. |
| Links behave like a wiki | **ACCEPTED** | A value in a field is a link to what it means, and navigation follows it. | A vocabulary you cannot walk. |

**The editing surface.** The intended surface is the editor's own hybrid Markdown mode. It
renders content for in-place editing, and carries comments an agent can act on. It is
experimental. Three things about it are unknown, and need testing before any editor work
begins.

| Spike | Decides |
|---|---|
| Is it a custom editor or an enhanced text editor? | Whether a completion provider fires inside it |
| Does it show, hide or render frontmatter? | Whether a dropdown has anywhere to appear |
| Does it handle wiki links? | Whether an existing link extension composes with it |

Comments anchored to a place in a document are worth noting for their own sake. They give
the person a way to say *here*, which nothing else in this design provides.

## 4e. One graph

There is **one graph over the whole system**. Notes are nodes. Connections are edges.
Every subgraph is a **filter over it by connection type**. The trace and the claim chain are
two such filters. There is no second store and no second index.

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| One graph. Subgraphs are **filters by connection type** | **ACCEPTED** | Every view is the same walk with a different filter, so one index answers all of them. | A store per view, each with its own loader, index and invalidation. |
| **The connection type carries the meaning** | **ACCEPTED** | It is the only thing that distinguishes one subgraph from another. That makes it load-bearing rather than decoration. | Untyped edges collapse every view into every other. That is how mass suspicion happens. |
| A connection type is a **vocabulary note** | **ACCEPTED** | Adding a kind means writing what it means. Same mechanism as every other enumerated value. | A vocabulary that grows by accident and that nobody can explain. |
| Each type declares three facts: **authored or derived**, **hashed or not**, **propagates or not** | **ACCEPTED** | These are the three questions every traversal asks. The authored-versus-derived split, the identity fold and the reopen cone each read one of them. | The same three questions answered ad hoc at every call site. |
| Node types are vocabulary notes too | **ACCEPTED** | Same reason, same mechanism. | Two ways to declare what a thing is. |

**One traversal, three uses.** A reopen walks propagating kinds. A claim walks support
kinds. A coverage query walks trace kinds. Same code, different filter — which is also why
the reverse index is worth building once and keeping.

**Open.** Whether machine transitions belong in this graph. Their source differs. A
machine's edges are drawn, not declared in a note's frontmatter. They arrive through a
different loader. Whether they land in the same index carrying a kind, or stay separate, is
undecided.

## 4f. One design system

**Every surface looks like the same product.** In v3 the buttons in the sidebar did not match
the buttons elsewhere. That is the failure this section exists to prevent.

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| **One design system across every surface** | **ACCEPTED** | The panel, any other view, and the log window are one product. A user reads difference as meaning, and there is none here. | Each surface is styled by whoever built it, and the seams show. |
| **One source of tokens** — colour, spacing, type | **ACCEPTED** | Shared appearance needs shared values, not shared intentions. | Two shades of the same colour, and no way to say which is right. |
| A surface **may not define its own palette** | **ACCEPTED** | A local colour is how a design system dies. | The system is a suggestion, and the first deadline overrides it. |
| A surface that **cannot share a stylesheet still shares the tokens** | **ACCEPTED** | The terminal cannot read CSS. It can read the same values. | The one surface that cannot share is left to invent, which is where the drift starts. |
| **The rule binds the graphical surfaces. The terminal takes only the colours** | **ACCEPTED** | A terminal has no components to keep consistent. Kind, source and time are the whole palette there. | Effort goes into unifying a surface that has almost nothing to unify. |
| The **editor's own theme values are the base** | **ACCEPTED** | The panel sits inside the editor. Following the user's theme is both correct and free. | The panel is the one thing on screen that ignores the user's theme. |
| **No component toolkit is assumed** | **ACCEPTED** | The toolkit these extensions used was archived in January 2025, and its own dependency was deprecated first. Theme values and one stylesheet of our own have no such dependency. | A dependency that is already gone is designed in. |
| Colour and detail choices **may be taken from v3** | **ACCEPTED** | They were made once and they work. This is reuse of a decision, not of a solution. | The same choices are made again, differently. |

---

## 5. More than one machine

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| **One person's work at a time on one copy** | **ACCEPTED** | v3 tried per-machine claims and deleted them: a clone that has the trunk has every record. There is no distributed-locking problem here unless one is introduced. | A coordination mechanism built for a situation that does not arise. |
| What must survive a machine has to be **deliberately carried** — what stays local dies with it | **ACCEPTED** | True in v3 and stated there. The design cannot prevent it — only make it visible. | Work captured on a cloud box is lost silently, which is the worst way to lose it. |
| That boundary must be **visible, not procedural** | **ACCEPTED** | v3 leaves it to a habit, and habits are not enforcement. | Somebody learns the rule by losing an evening's work. |
| A fresh clone can **start working without manual setup** | **ACCEPTED** | The cloud case is normal, not exceptional. v3's own note: get this wrong and the cage lands while the lane does not. | Every new machine needs a person who already knows the system. |

## 6. Guidance binding

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| **Method** guidance is engine-served — **craft** guidance may be model-selected | **ACCEPTED** | Two different things. Method says what to do in this position and must be deterministic, bound and token-closing. Craft — how to write software, how to draw a diagram — is general capability with no position to bind to. Choosing it is a reasonable thing to leave to the model. | Either craft is force-fed at every position, or method becomes a suggestion the model may decline. |
| The engine can **compel** any guidance, including craft | **ACCEPTED** | Guidance is a file whichever way it is delivered. The engine can serve it and mint a token for it, regardless of who would otherwise have chosen it. | Model-selected guidance becomes optional guidance, and the method loses its floor. |
| A state gets the guidance that **applies to it**, and the list is computed | **ACCEPTED** | No table to author, so none to drift. | A mapping written twice and correct once. |
| **Both directions declare**: a state names what it looks for, a document names where it applies | **ACCEPTED** | A state must be able to ask for guidance not yet written. A new document must be able to reach existing states without editing each one. Neither direction alone gives both. | Either every state is edited when guidance is added, or a need cannot be expressed before its document exists. |
| The **engine resolves it, never the model** | **ACCEPTED** | Reading guidance is evidence. Evidence that differs between runs is evidence of nothing. | The walk stops being reproducible, and the record cannot say what the agent was working from. |
| A mismatch is **loud, never silent** | **ACCEPTED** | Guidance that should have appeared and did not is invisible: the agent works without the method and nothing says so. This is the worst failure available to this design. | A typo becomes a silent absence of method. |
| A state asking for something not yet written is **legal** — a document nothing can reach is a **defect** | **ACCEPTED** | The first is forward-looking. The second looks like coverage and is not. | Either forward-looking states are illegal, or unreachable documents accumulate unnoticed. |
| The computed set is **bounded**, and exceeding it fails loudly | **ACCEPTED** | Documents claiming broad application is the unbounded direction — one over-broad claim inflates every state in the system. Breadth is not forbidden. It announces itself. | Guidance quietly becomes the standing prefix tax under another name. |
| **Nothing carries a catalogue.** Only what applies is present | **ACCEPTED** | Hundreds of documents at one line each is thousands of tokens everywhere. Selection is the engine's job, so the index a model would need does not exist. | The prefix problem returns wearing a different hat. |
| **No routing hierarchy** | **ACCEPTED** | Measured elsewhere: a second routing level collapses accuracy outright. One flat level is the recommendation. | A taxonomy that performs worse than none, built at some cost. |
| The resolution is **inspectable** — what this state gets, and why | **ACCEPTED** | Nothing is written down, so without an explanation the first missing document is debugged by guessing. | A black box that is cheap now and expensive later. |
| The resolved set is **part of the record** | **ACCEPTED** | The walk can then say which parts of the method were actually in front of the agent, not merely what the method was. | Policy-in-force covers everything except the guidance, which is most of it. |
| There is a **fallback** when nothing bound applies | **ACCEPTED** | Searching must remain possible, and deterministic enough to be recorded. | The agent is stuck with whatever the binding produced, or it improvises. |
| A document that cannot say **what it applies to** is not admitted | **ACCEPTED** | Nothing will compute it into place and search finds it by luck. | Unreachable guidance, which is worse than none because it counts as coverage. |

## 7. Trace coverage

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| Trace checking is done by the **engine and scripts**, not by judgement | **ACCEPTED** | Mechanical, repeatable, and cheap enough to run every time. | Coverage becomes an opinion. |
| The **whole trace** is checked, always | **ACCEPTED** | Nothing is left open because it was made in another phase. | Omissions hide in the seams between phases, which is exactly where they collect. |
| **Delta applies to content review only** | **ACCEPTED** | Content review over an ever-growing whole eventually means reading shallowly. Coverage runs over an index, not content, so it stays cheap while content review does not. | Either batch review stops scaling, or the check that finds omissions is scoped away. |

## 8. Stale prose in v3 — a standing warning

Repeated over this session: v3's own documents describe mechanisms that are not in the
code. Confirmed cases: the satellite and `levelRecordTree` do not exist — `product.md`
says they do. The multi-root model collapsed to one. Privacy tiers were prose only.

A `--mode` flag is documented in help text that nothing parses.
`MachineDecl.reentry: "resume"` is declared with no consumer. `MachineInstance.claims` is
declared and never written. Two performance measurements are quoted in comments that had
already been fixed.

**Rule for v4: a claim about behaviour lives next to the behaviour. Otherwise it is a dated
field report.** Anything else becomes confidently wrong within weeks.
