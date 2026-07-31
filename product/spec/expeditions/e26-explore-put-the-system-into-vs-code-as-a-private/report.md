---
form: expedition-leave
status: done
---

# Expedition leave — put the system into VS Code

The owner authorised agent confirmation of this page in session, and asked to
read it afterwards. The sections below are the agent's, confirmed on that
word rather than clicked one by one.

## What was the goal

Put the system into VS Code as a private extension, so it can be handed to a
colleague carrying neither the repository history nor the owner's branding.

The goal drifted during the day. The expedition became the bucket for VS Code
work at large, and the goal was amended at the end to say so outright.

## What was done

The plugin itself: the mirror runs as a webview, the server lives and dies
with VS Code, and the export refuses to run without a name and an
abbreviation.

Carried in the same bundle, past the goal as written:

- A survey rebuild.
- A voice matrix.
- A rigor matrix migration across roughly 250 files.
- A mermaid renderer, tried and rejected.
- The MCP output limit raised from the 25000 default to 100000, in the cage
  source rather than the generated copy.
- The Claude side bar launch taught to carry its own kickoff.
- The goal amended, because the bundle had outgrown it.

## What settled it

THE KICKOFF. The Claude extension's own bundle calls editor.open with
(sessionId, prompt, viewColumn) to serve its new_conversation_tab request,
and the registered handler carries that signature. A published feature
request documents the same parameters. The previous claim that no Claude
command takes a prompt reasoned from the extension manifest, and a manifest
never declares command arguments, so it could not have shown this either way.

THE OUTPUT LIMIT. MAX_MCP_OUTPUT_TOKENS stands in the Claude bundle's own
environment table. The se server declares no result size cap anywhere, so
nothing competes with the variable.

THE CAGE REACHES A SIDE BAR SESSION. Proven live, not argued: the session
that did this work had Read, Write, Bash and Grep denied, and the lane was
its only door. That closes half of the open question in note-7b6631cc965c.

THE SUITE. Preflight green. 274 tests pass, none fail.

## What was not done

NEITHER FIX HAS BEEN SEEN WORKING. The kickoff needs a window reload and a
press of the button. The environment change needs a fresh session, because
the session that made it cannot load it. Both are carried in
note-424aa024a797.

WHETHER THE SESSION MIGRATES is untested. The launch starts Claude through
the editor door and then calls the side bar command. If the session stays an
editor tab instead of moving left, the owner chooses: the kickoff, or the
placement already decided. The two are one line apart.

WHICH LIMIT ACTUALLY SPILLED is unconfirmed. The harness reported a byte
count, and 57KB is roughly 17k tokens, under the 25000 default. A separate
harness persistence threshold may be the real cause, in which case the
variable moves nothing and the fix lives elsewhere.

STILL DEFERRED, unchanged: the .vsix, and retiring the classic server with
its browser mirror.
