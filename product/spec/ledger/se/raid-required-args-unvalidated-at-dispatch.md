---
id: se.raid-required-args-unvalidated-at-dispatch
kind: raid
statement: "The MCP dispatch layer does not enforce declared required args. Calling a tool with a wrong arg name coerces undefined instead of refusing - se_file_search searched the product for the literal word 'undefined' and returned a page of real, correctly-formatted hits that answered nothing. The failure mode is the expensive kind: not an error, a CONFIDENT WRONG ANSWER. It cost a wrong conclusion and a wrong note during this iteration. This is se.law-whitelist-guards applied to arguments - accept exactly the declared shape, refuse everything else."
provenance:
  iteration: i8d-phone-brief
  ai_involvement: agent-drafted
raid_kind: issue
raid_owner: agent
trigger: "Open now; found in i8d, routed to i9 (tool surface cleanup). Fallback: validate required args at dispatch and reject with the clause plus the correct shape; sweep handlers for String(args.x) on optional inputs, since String(undefined) is a silent-wrong-answer generator wherever it sits on an input path. See note-65857e4bd6e6."
---


