---
form: log-risks
by: agent
signed_off: 2026-08-17T11:34:11.897Z
authors: agent
files: null
---

# Evidence form / log-risks

## current_situation

The RAID register opens for i35 with three entries, all minted at the kickoff gate and all standing open.

Two are assumptions this iteration is treating as true without having established them. One is an issue the iteration created and did not close.

Nothing here is inherited. i35 opened no risk it did not itself introduce or measure.

## raid_opened

- raid-asm-a-running-agent-session-cannot-attach-its-own-mcp-server
- raid-iss-two-entrypoints-place-the-cage-and-nothing-compares-them
- raid-asm-the-declared-node-floor-matches-what-the-engine-needs

## follow_up

- Probe the MCP-attach assumption against a second harness. This box can only ever observe the one it runs on.
- Close the two-entrypoints issue by folding refs, runtime, install and cage into one shared module, then add the test that both entrypoints place the same cage bytes.
- Owner: rule the node floor. The assumption is already measured false at the edge.

## anything_else

THE SHARPEST ONE IS THE ISSUE, NOT EITHER ASSUMPTION.

raid-iss-two-entrypoints-place-the-cage-and-nothing-compares-them is rated crippling and likely, and it is the only entry here that i35 CREATED rather than found. The iteration added a second program that places the cage, and nothing anywhere asserts the two agree.

WHY IT IS RATED CRIPPLING. A cage that denies too much fails loudly: the agent hits a refusal and says so. A cage that denies too little fails silently: the agent simply holds a native tool, uses it, and nothing calls that wrong. The bad direction is the quiet one, and the deny list is explicit by owner ruling, so a tool missing from it is not blocked by any default.

IT IS FILED RATHER THAN FIXED, DELIBERATELY. Folding se-start into a shared module changes the unattended start path, and that path deserves its own verification rather than riding along at the end of an iteration about something else.
