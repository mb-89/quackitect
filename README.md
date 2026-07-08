<p align="center"><img src="product/brand/logo-mark.svg" width="140" alt="quackitect"></p>

# quackitect

*The rubber duck that went to engineering school.*

Your AI agent just did a week of work in an afternoon. **How much of it can you honestly vouch for?**

quackitect makes that question answerable. It is a **user-driven gate ledger** for spec-driven, systematic engineering: the agent fills the checks, **you adjudicate the gates**, and a deterministic engine keeps the record honest. What comes out is an **auditable, change-aware record of your project's design** — a Merkle-DAG of decisions that goes **SUSPECT the moment an input changes**, so nothing silently drifts. And the record compiles into a book any stakeholder can read.

> 🚧 **Under construction.** Early and evolving — the commands, spec format, and structure may change without notice. Here to explore the idea, not (yet) for production. No stability promises.


## Who it's for
Engineers and teams driving work with AI agents who need an **auditable design / decision record with user gates** — regulated or systematic engineering, requirements traceability, architecture decision records (ADRs), V-model walks, or anyone who wants the agent to *propose* and a user to *adjudicate*.

> Spec-driven tools like Spec Kit, Kiro, and OpenSpec exist to turn a spec into code. quackitect aims a level up: It produces any engineering deliverable (code, CAD-files, plans, documents, concepts in general, ...) and the **oversight and traceability ledger** that records *why* each design decision holds. This pays off when project and teams get big or changes ripple through the whole architecture. Quackitect itself is built using quackitect.

## vs other spec-driven tools
|  | Spec Kit · Kiro · OpenSpec | **quackitect** |
|---|---|---|
| Job | spec → plan → **generate code** | spec → **gated ledger + deliverable** |
| Output | source code | auditable trace + deliverable |
| On input change | re-generate | the affected cone goes **SUSPECT** → re-bless |
| User role | review the diff | **adjudicate the gates** (never auto-passed) |
| Runtime | varies | one **dependency-free Go binary** |

## Start your project
The primary way to use quackitect is to **tell your AI agent what you need**. It runs the
onboarding for you.

> Say to your agent: **“let's start a new project.”**

Quackitect will walk you through all steps up to your first milestone.
Need more details, or a list of all functions? Ask it.

<p align="center"><img src=".github/report.png" width="860" alt="The quackitect report — gated milestones (left), the trace graph as a Merkle-DAG (center), and coverage metrics (right)."></p>

<!-- This image is a committed snapshot (.github/report.png). The LIVE board: run `quack report`. -->

You're looking at quackitect's own design, tracked and built by quackitect. It **dogfoods itself** — every claim above sits in its own ledger, behind its own gates.

---
<sub>spec-driven development · requirements traceability · decision records · design-as-code · systems engineering · V-model · AGENTS.md · AI coding agents · audit trail · gate ledger · Merkle DAG</sub>
