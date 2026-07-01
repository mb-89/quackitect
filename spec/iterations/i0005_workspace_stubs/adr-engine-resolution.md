---
id: adr-engine-resolution
type: adr
statement: A bare workspace reaches its engine through a committed root launcher (`quack.cmd`) that resolves a `quack.exe` in a fixed order — internal `.quack\engine\quack.exe`, then the gitignored pointer `.quack\engine.local`, then the `QUACK_ENGINE` env var — and forwards all arguments; if none resolve it exits with a clear message. PATH lookup (candidate C) and a committed relative link (candidate D) are rejected: C mutates global state and is ambiguous, D leaks the engine location into version control. The engine location therefore lives only in gitignored/machine-local places, never in a tracked file.
addresses: [req-inside-launcher]
adjudicated_by: human
killer: false
---
## Rationale (not load-bearing)
i0005 decision. Order internal→B→A chosen by the human. Internal-first preserves the dogfood case (quackitect drives itself via its own built engine, exactly as quack.cmd does today); B gives an explicit per-clone override discoverable in-repo; A serves CI/power users. Satisfies the High criteria (out of VC, drive-from-inside, no engine copy) and stays Windows-portable with a plain .cmd (no symlinks). Other-OS launcher deferred.
