<p align="center"><img src="product/brand/logo-mark.svg" width="140" alt="quackitect"></p>

# quackitect

*The rubber duck that went to engineering school.*

**A human-driven gate ledger for spec-driven, systematic engineering.** An AI agent fills the checks; a human adjudicates the gates. The result is an **auditable, change-aware record of a project's design** — a Merkle-DAG of decisions that goes **SUSPECT the moment an input changes**, so nothing silently drifts.

> 🚧 **Under construction.** Early and evolving — the commands, spec format, and structure may change without notice. Here to explore the idea, not (yet) for production. No stability promises.


## Who it's for
Engineers and teams driving work with AI agents who need an **auditable design / decision record with human gates** — regulated or systematic engineering, requirements traceability, architecture decision records (ADRs), V-model walks, or anyone who wants the agent to *propose* and a human to *adjudicate*.

> **Code isn't the focus — but it does fall out of it.** Spec-driven tools like Spec Kit, Kiro, and OpenSpec exist to turn a spec into code. quackitect aims a level up: the **oversight and traceability ledger** that records *why* each design decision holds, gates the load-bearing ones behind a human, and reopens them when their inputs change. Generating code is just one step the agent takes while walking the checks — quackitect's own Go engine is built exactly that way.

## vs other spec-driven tools
|  | Spec Kit · Kiro · OpenSpec | **quackitect** |
|---|---|---|
| Job | spec → plan → **generate code** | spec → **gated ledger + deliverable** |
| Output | source code | an auditable Merkle-DAG of blessed decisions |
| On input change | re-generate | the affected cone goes **SUSPECT** → re-bless |
| Human role | review the diff | **adjudicate the gates** (never auto-passed) |
| Runtime | varies | one **dependency-free Go binary** |

## 60-second ramp-up — clone to first report
```sh
git clone https://github.com/mb-89/quackitect
cd quackitect/product/engine-go
go build -o ../../.quack/engine/quack.exe .   # needs Go 1.26+, nothing else
cd ../..
.\quack status      # the design board, in your terminal
.\quack report      # render + open the live HTML board (the Merkle-DAG)
```
*(Windows shown — it matches the `quack` launcher. On macOS/Linux, build to `.quack/engine/quack` and call it directly.)*

<p align="center"><img src="docs/report.png" width="860" alt="The quackitect report — gated milestones (left), the trace graph as a Merkle-DAG (center), and coverage metrics (right)."></p>

You're now looking at quackitect's own design, tracked in quackitect. It **dogfoods itself.**

## Drive it (the surface)
An agent drives it through `AGENTS.md` + a few slash-commands; a deterministic CLI runs alongside.
```
/engage  start | next | refine | ship    plan → walk the checks → output an iteration
/note                                    capture an idea, frictionless
/review  readout | retro                 assess & look back
```
## How it works
**Design input first, then design output** — needs and requirements before the thing you ship. The walk is **gated through milestones** that bake in engineering best practice (frame → requirements → architecture → build → validate → ship; nothing skips ahead). And because every node **traces** to its inputs, a change ripples downstream and reopens exactly what it touches — **free impact analysis, by construction.** The agent fills the checks; the human blesses the gates.

## Reuse it as an engine
quackitect can be vendored. `quack start init <path>` scaffolds another project that runs on the same engine through an overlay chain — its own `product/` + `spec/`, its own brand (`product/brand/`), the generic engine underneath.

---
<sub>spec-driven development · requirements traceability · decision records · design-as-code · systems engineering · V-model · AGENTS.md · AI coding agents · audit trail · gate ledger · Merkle DAG</sub>
