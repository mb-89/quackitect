---
form: identify-assumptions
by: agent
signed_off: 2026-08-26T11:47:46.686Z
authors: agent
files: null
---

# Evidence form / identify-assumptions

## current_situation

Six requirements and six functions stand. Nothing has been probed.

The sweep runs against the requirement register, not against memory. Each of the six named sources is asked once and answered once, and every one turned something up.

Two of the six were measured rather than reasoned. The platform answer comes from reading the existing widget guard's matching pattern. The people answer comes from counting what the exemption list actually holds.

## assumptions

- spec/trace/raid/raid-asm-every-export-in-this-tree-is-declared-statically.md
- spec/trace/raid/raid-asm-the-toolchain-here-enumerates-exports-with-no-new-dependency.md
- spec/trace/raid/raid-asm-every-write-that-adds-a-departure-passes-through-the-lane.md
- spec/trace/raid/raid-asm-an-exemption-key-reads-the-same-on-every-platform.md
- spec/trace/raid/raid-asm-each-neighbour-holds-one-conversation-with-this-system.md
- spec/trace/raid/raid-asm-an-author-refused-at-write-time-states-a-usable-reason.md

## sweep

- environment: One. The enumerating requirement leans on every export being declared statically — a computed export surface would let the guard report a clean sweep over a hole it never saw.
- toolchain: One. The guard needs something that reads TypeScript, and the assumption is that the installed tools already do it, so no parser joins the product's dependencies.
- host: One, and it is the sharpest of the six. A write-time refusal only sees writes that carry a path, and a shell command carries none. The counterexample already stands as raid-iss-the-shell-writes-method-with-no-path-to-judge.
- platform: One, measured. The widget guard writes the forward slash into its own matching pattern at widgets.ts line 136, so a departure key is platform-shaped. The tell if it breaks is that every declared exemption reads as a violation.
- neighbours: One, and it is the carving question. Seven neighbours were drawn, and Cockburn's paper favours two, three or four ports. Either several neighbours share one conversation or several hold two, and nobody has walked it.
- people: One, measured. The existing reason check demands one non-space character, so the single letter x is a legal reason today. The list holds one declared departure, which is too small a sample to settle how authors behave.

## follow_up

The neighbours probe and the primary-and-secondary split are the same walk, so they are done once and not twice. That walk is the first thing M4 needs.

The host assumption needs a call-log read rather than a code read. Ask how many writes to the exemption list arrived through a path-carrying verb and how many arrived through the shell.

The platform assumption cannot be probed on this machine. It is a Linux container, so the check waits for the first Windows run and the entry carries that as its trigger.

## anything_else

The people assumption and the toolchain assumption are the two weakest here, and for opposite reasons.

The people one is weak on sample. One declared departure cannot answer a question about how authors behave, so its honest probe result is scheduled rather than a verdict.

The toolchain one is weak on scope. It asks whether a parser is needed, and the widget guard already answers half of it by finding its emitters with a regular expression and no parser at all. If the same trick works for exports, the assumption never becomes load-bearing.

Nothing was recorded as an assumption that had already happened. The shell hole under the host source is an ISSUE and already stands as one, so the assumption written here is the narrower claim around it rather than a second copy of it.
