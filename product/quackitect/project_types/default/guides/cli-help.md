---
id: cli-help
scope: always
statement: Every command-line surface answers -h, --help, and -? with usage and exits cleanly, with no side effects and no destructive default.
---
## Guide (load on demand)
Applies to anything the product exposes on a command line — the engine, a vehicle's CLI, any tool the build ships. If the product has no command-line surface, this guide is a no-op.

- **Help on demand.** `-h`, `--help`, and `-?` (anywhere in the args) print usage — the command list and a one-line purpose — and exit `0` without doing anything else.
- **No side effects from help or a bare invocation.** Asking for help, or running with no/unknown arguments, must never write, delete, network, or mutate state. The safe path is the default.
- **Reject, don't reinterpret.** An unknown command or a `-`-prefixed token where an id is expected is an error with a pointer to `--help`, not silently treated as data (e.g. `start --help` must not parse `--help` as the id to start).
- **Usage is discoverable from the binary**, not only the docs — a fresh user with just the executable can find their way.

Rationale: this was a real failure mode — a help flag parsed as input ran a side-effecting command. Cheap to honor, expensive to miss.
