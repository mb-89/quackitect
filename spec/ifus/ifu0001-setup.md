---
id: ifu0001-setup
type: manifest
mode: deck
kind: ifu
statement: from a fresh machine to quackitect idle.
review-82079:
  completeness: every install beat has a slide, and the result slide defines the idle state every other IFU starts from
  correctness: the commands match the launcher and the contract; the attest flow is the contract's own wording
  conciseness: one action per step slide; background detail stays in the fundamentals chapter
  comprehensibility: the arc runs from bare machine to a named end state that later decks reuse by reference
  minimalism: nothing here repeats another IFU; the idle state is defined once, here, and only referenced elsewhere
  accessibility: rides the book shell's slide roles and labels; the one figure carries its aria label
  target-group-fit: written for a person setting up their first workspace, no Go or engine knowledge assumed
---
<!-- ai:3 -->
# From zero to a running ledger
<!-- ai:3 -->
A design ledger only helps if starting it is trivial. This IFU takes a fresh machine to a running quackitect in a few minutes.
---
<!-- ai:3 -->
# Starting state
<!-- ai:3 -->
Truly nothing: a machine without the repo, without the engine, without a session. This is the one IFU that starts from scratch. Every other IFU starts where this one ends.
---
<!-- ai:3 -->
# Get the repo, run the launcher
<!-- ai:3 -->
Clone or copy the project, then run `.\quack version` at its root. The launcher bootstraps the ONE global engine binary from the vendored source. No Go on the machine? The bundled shim builds anyway.
---
<!-- ai:3 -->
# Attest the session
<!-- ai:3 -->
An agent channel earns its session key through the contract's attest ritual: the owner mints a grant at the console, the agent redeems it after the visible recital. The interactive console itself is never gated.
---
<!-- ai:3 -->
# Pair a phone, if you want one
<!-- ai:3 -->
`quack pair` mints the topic credential and renders a QR code. From then on a gate question can ride to the lockscreen, and one tap answers it. Optional, and worth it.
---
<!-- ai:3 -->
# The idle state
<!-- ai:3 -->
This is the state every IFU calls idle:
<!-- ai:3 -->
- The global engine binary is built and current.
- The workspace loads: `quack boot` reports green or yellow.
- `quack next` names the next ready check, or says done.
- The command surface of your choice is up, CLI or MCP.
|||
```mermaid
flowchart TD
  subgraph workspace
    spec["spec/ - the graph"]
  end
  subgraph engine
    quack["the global quack binary"]
  end
  subgraph surfaces
    cli["CLI"]
    mcp["MCP tools"]
  end
  cli -->|commands| quack
  mcp -->|commands| quack
  quack -->|reads and checks| spec
```
---
<!-- ai:3 -->
# Covered use cases
<!-- ai:3 -->
Setting up exercises these journeys:
[uc-onboard-newcomer](uc-onboard-newcomer), [uc-run-dep-free](uc-run-dep-free).
Note: The coverage slide is the machine-readable reference home. Story slides stay clean.
