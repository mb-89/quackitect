# onboard — boot the agent before work

Use this prompt after the contract recital and after `product/brand/voice.md`.
Its job is not to finish the project. Its job is to make the agent ready to
walk the ledger.

Run this prompt whenever an agent discovers `AGENTS.md` in this workspace.
The owner does not need to name boot mode. Normal requests like "familiarize
yourself", "get ready", "load the system", or "do the next work" all start
with this prompt.

## Target

Reach one of these states fast:

- **Green boot** — a fresh command surface can run `quack next`.
- **Yellow boot** — a fresh command surface can run `quack next`, but the
  board or the returned check shows work to do.
- **Blocked boot** — `quack next` cannot run. Name the single blocker. Stop.

A red root, a failing test, or a suspect cone is NOT a boot failure when
`quack next` can name the next check. Report it as yellow. Let the owner decide
whether to continue.

## Sequence

1. Read `AGENTS.md`.
2. Read `product/quackitect/method/prompts/contract.md`.
3. Recite the contract once, visibly.
4. Read `product/brand/voice.md`.
5. Read this file.
6. Read `product/quackitect/method/prompts/engage.md`.
7. Read the method map below.
8. Earn or apply an attested session key.
9. Call `quack next` through the preferred live surface.
10. If it succeeds, stop booting.
11. If it is refused for attestation, complete the contract's attest ritual.
12. If MCP is stale after a build swap, use the fresh CLI with `QUACK_KEY`.

If the terminal keeps returning a bare `^C` or continuation marker instead of
command output, treat that terminal as contaminated. Start a fresh command
surface or return to MCP. Do not keep interpreting the marker as a command
verdict.

Do not run `status`, `lint`, `selftest`, or `verify` during boot unless
`quack next` itself tells you to fill an executed check. Boot mode ends when
`quack next` succeeds or when one concrete blocker prevents it.

Do not run `quack build` during boot merely because files changed. Build is
for consumers that need fresh hashes: reports, milestone verification, and a
status read whose answer depends on root parity. Boot does not need those.

## Command Boundaries

`quack next` is the boot readiness check. It is the first live ledger command
after attestation. If it returns a check, boot is green or yellow. If it says
done, boot is green. If it refuses, boot is blocked by the refusal it names.

`quack status` is a diagnostic readout. Use it when the owner asks where the
project stands, when explaining one check with `quack status <id>`, or when a
handoff needs a board snapshot. Do not use it during boot. Do not use it
between normal `next` steps. A stale root can make status noisy. That noise is
not a boot blocker.

`quack start` does not require a fresh golden root. It writes the iteration
file, points config at the version, and seeds tasks. Fresh hashes matter later,
when a report, a status parity diagnosis, or milestone verification consumes
them.

## Method Map

The method prompts live in `product/quackitect/method/prompts/`. Load the one
named by the command before acting.

- `engage.md` — the main work loop. Read during boot.
- `compose-reference.md` — exact planning grammar. Read only during
  `/engage start` plan and bake.
- `review.md` — readout, retro, and report operations.
- `triage.md` — note inbox and backlog triage.
- `refine.md` — spike work after a build exists.
- `note.md` — deterministic note capture.
- `integrate.md` — stubs and workspace integration.
- `draft.md` — drafting lane.
- `dependencies.md` — toolchain and dependency rules.

After boot, the agent should know:

- The contract controls authority.
- The voice file controls wording.
- `engage.md` controls forward work.
- Command-specific method prompts are loaded on demand.
- `quack next` is the readiness test for work.
- `quack build` is not a boot readiness test.
- `quack status` is a diagnostic readout, not a boot readiness test.
- `quack start` can run with a stale root.

## Report

Use this short shape:

- `boot: green` — `quack next` is usable. Name the returned check, or say done.
- `boot: yellow` — `quack next` is usable. Name the returned check and the
  visible problem.
- `boot: blocked` — `quack next` is not usable. Name the blocker and the next
  needed action.

Do not list the whole board. Do not chase propagated suspects. Do not fix
anything during boot unless the user asked for work beyond onboarding.