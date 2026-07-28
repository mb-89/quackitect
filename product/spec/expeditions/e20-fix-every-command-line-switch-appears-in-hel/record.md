---
id: e20-fix-every-command-line-switch-appears-in-hel
kind: fix
status: open
opened: 2026-07-28T17:27:52.716Z
goal: "Every command-line switch appears in help, and the one-screen launch survives its window closing. Two defects in the launcher, one vehicle. FIRST: --one-screen is RUNME's own flag, and RUNME's help just forwards to the server's help, which has never heard of it. The flag is undiscoverable. The general rule the owner set: EVERY switch shows up in help. It gets a mechanical guard, not a comment — a test that reads the flags each entry point parses and fails when one is missing from that entry point's help text. se-pty.ts has no --help at all and parses --pty-port, so it is in scope too. SECOND: with --one-screen the terminal lives in the browser, but se-pty runs in the foreground of the launching window. Closing that window kills the pseudo-terminal host and the agent inside it. This killed a session for real on 2026-07-28. Wanted: the one-screen launch detaches, so the window that started it can be closed without taking the session down. The fail-safe stays — no pseudo-terminal binding still means the agent runs on the inherited terminal."
---

# e20-fix-every-command-line-switch-appears-in-hel

Free prose — the human head of the record. Machine-facing fields stay in the frontmatter.
