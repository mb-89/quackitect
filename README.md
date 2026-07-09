<p align="center"><img src="product/brand/logo-mark.svg" width="140" alt="quackitect"></p>

# quackitect


## Has this ever happened to you?

- You had a bright idea. You pushed the project for two months, drowned in tech debt, and now it collects dust.
- You're two years into a product. There is this one thing. The thing the customer said he didnt need it. The thing you warned him would blow up the budget and the timeline if he ever changed his mind. Well. He changed his mind. There goes your architecture.
- New colleagues join the team. The old zombie discussions claw their way out of the grave. *"Why is this done this way?"*. Its been like that for twenty years. Nobody wrote it down.
- Your agent vibe-coded a thing. It looked great. Now it doesn't work, nobody can fix it, nothing's documented. And the bot just runs in circles.

Been there. Done that. Can't recommend.

But brother, do I have a bridge to sell you.

**quackitect**  
*The rubber duck that went to engineering school.*

quackitect is an LLM Harness. It knows how to properly architect. It's trained on forty years of engineering method: requirements engineering, architecture decision records, the V-model, verification and validation, the whole canon. You want to shoot a rocket to the moon? quackitect knows how they did it.

It asks the right questions, at the right time. It pushes back where you need it. It sharpens your ideas, writes down your decisions, understands your requirements and traces them into your design. It designs the deliverable, tests it, documents it. Once you plan changes, it tells you the impact.

All you bring is the big ideas — and your judgement.

> 🚧 **Under construction.** Early and evolving — the commands, spec format, and structure may change without notice. Here to explore the idea, not (yet) for production. No stability promises.


## Who it's for
Engineers and teams driving work with AI agents who need an **auditable design / decision record with user gates** — regulated or systematic engineering, requirements traceability, architecture decision records (ADRs), V-model walks, or anyone who wants the agent to *propose* and a user to *adjudicate*.

> Spec-driven tools like Spec Kit, Kiro, and OpenSpec exist to turn a spec into code. quackitect aims a level up: It produces engineering deliverables (code, CAD-files, plans, documents, concepts in general, ...) and the **oversight and traceability ledger** that records *why* each design decision holds. This pays off when project and teams get big or changes ripple through the whole architecture. Quackitect itself is built using quackitect.

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

> Say to your agent: **“clone https://github.com/mb-89/quackitect, and lets start an new project”**

Quackitect will walk you through all steps up to your first milestone.
Need more details, or a list of all functions? Ask it.

<p align="center"><img src=".github/report.png" width="860" alt="The quackitect report — gated milestones (left), the trace graph as a Merkle-DAG (center), and coverage metrics (right)."></p>

<!-- This image is a committed snapshot (.github/report.png). The LIVE board: run `quack report`. -->

You're looking at quackitect's own design, tracked and built by quackitect. It **dogfoods itself** — every claim above sits in its own ledger, behind its own gates.

---
<sub>spec-driven development · requirements traceability · decision records · design-as-code · systems engineering · V-model · AGENTS.md · AI coding agents · audit trail · gate ledger · Merkle DAG</sub>
