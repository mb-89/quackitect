---
form: cage-inventory-check
by: agent
signed_off: 2026-08-19T16:41:14.979Z
authors: agent
files: null
---

# Evidence form / cage-inventory-check

## current_situation

The cage was checked as a FILE, never as an inventory. Five cases in cage.test.ts read the shipped cage and asked whether hooks were wired and whether web_search was absent from the exclude list. None asked what the host ends up holding.

AND THE BLACKLIST IS EXPLICIT, which is the whole risk. The cage file says so itself: a tool Copilot adds later is not blocked automatically. It was verified against CLI 1.0.76 on 2026-07-30, and the CLI has moved since.

FIVE DOCUMENTED BUILT-INS WERE OUTSIDE IT, diffed on 2026-08-18 against GitHub's own hooks reference: bash, rg, web_search, update_todo and ask_user. web_search is the permitted exception. update_todo and ask_user do not touch the project. bash and rg do, and they are a shell and a search.

ONE CASE WAS ALSO RED. cage.test.ts expected `nativeExceptions = new Set(["web_search", "WebSearch"])` in the extension, and that identifier existed in the test and nowhere else. The exception was preserved only by NOT being listed, which is preservation by accident.

## built

Four files.

project/deliverable/cage/copilot-cage.json. `bash` and `rg` added to exclude_args. These were two of the five documented built-ins that break 3 found outside the cage, and they are the two that reach the project: an uncaged shell and an uncaged search. The file's own readme records the date and the reason.

project/deliverable/engine/cage-inventory.ts, new. `NATIVE_PROJECT_TOOLS` names every native tool that can read, change, search or execute against the project. `NATIVE_EXCEPTIONS` names the one that must survive. `excludedTools(args)` reads the names out of the argument list exactly as the host does, stopping at the next flag. `inventoryProblems(excluded)` checks BOTH directions and returns the offending tool with a sentence saying why.

project/deliverable/vscode/src/extension.ts and extension.js. `parseExcludedToolsFromCage` now holds a `nativeExceptions` set and skips those names. A cage that names an exception is corrected rather than obeyed, because the exception is a standing rule and a file edit must not overturn it.

TESTS. project/deliverable/tests/cage-inventory.test.ts, six cases, all green. Three read the SHIPPED cage rather than a fixture, so a future hole fails here. Three drive the checker directly, including one that asserts excluding web_search is its own failure pulling the opposite way.

Run on 2026-08-19 over cage-inventory.test.ts and cage.test.ts: 11 passed, 0 failed. The cage.test.ts case that was failing before this chunk — the one expecting `nativeExceptions` in the extension source — now passes.

## follow_up

THE LIST IS STILL A LIST, and that is the residual risk this chunk narrows rather than removes. NATIVE_PROJECT_TOOLS is authored, so a built-in the host adds tomorrow is still not caged until somebody adds it. What changed is that there is now one place to add it and a test that reads the shipped cage.

A LIVE PROBE WOULD CLOSE IT PROPERLY. The 2026-07-30 verification worked by asking a real caged session to list the tools it could see. Nothing automates that, so the diff against the host's documentation is still done by hand.

TWO BUILT-INS WERE LEFT UNCAGED ON PURPOSE. update_todo and ask_user are documented and outside the list. Neither reads, writes, searches or executes against the project, so excluding them would cost the agent affordances for no containment gain. Said explicitly because silence would read as an oversight.

extension.js IS EDITED ALONGSIDE extension.ts. They carry the same function and the test reads the .js. Whether the .js is generated was not established in this chunk, so both were changed identically.

## anything_else

