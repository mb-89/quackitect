---
form: identify-assumptions
by: agent
signed_off: 2026-08-16T11:22:45.994Z
authors: agent
files: null
---

# Evidence form / identify-assumptions

## current_situation

THREE ASSUMPTIONS, and one of them is already FALSE IN PART. That is the point of the state: the sweep found something before the build leaned on it rather than after.

THE SOURCES SWEPT are the four new requirements and nothing else. Standing assumptions are not re-identified.

THE ONE THAT MATTERS: req-a-deletion-names-what-points-at-the-node leans on the trace graph holding every reference. It does not. i34's own numbers say the graph sees roughly a fifth of what a deletion breaks.

## assumptions

- raid-asm-the-trace-graph-holds-every-reference
- raid-asm-the-engine-can-tell-who-asked-for-a-run
- raid-asm-an-entry-status-says-whether-it-is-open

## sweep

- environment: ONE MACHINE, ONE TREE, ONE WALK AT A TIME. i34 traded filesystem isolation away, so nothing stops two open records sharing files. The delta leans on that not happening, and raid-asm-only-one-agent-works-a-clone-at-a-time already carries it. No new entry: this is inherited, not introduced.
- toolchain: NOTHING NEW IS ASSUMED. Node with native type stripping, git, ripgrep — all already hard dependencies the installer provides. The delta adds no library and no binary. The one toolchain fact it leans on is that a scoped test run can return its verdict in-process, which it already does.
- host: THE LOAD-BEARING ONE, and this iteration walks straight into it. An MCP client learns the tool list ONCE at handshake, so a changed verb is unreachable in the session that changed it. i11 changes se_test's behaviour and may change its arguments; note-11dff6e4d1de records that a reload cannot deliver a new tool ARGUMENT at all. i11's own seed already flags this: settle it BEFORE shipping a verb change. The tests pass regardless, because they build their own server in-process — which is exactly how this hides.
- platform: WINDOWS AND POSIX BOTH, unchanged. Nothing in the delta touches path handling, process spawning or the shell. The one place it comes close is the blocking test call, and blocking is not platform-specific.
- neighbours: VS CODE AND THE MCP TRANSPORT, unchanged in kind. The two mirror buttons are new UI on a surface that already exists, and they send a signal the engine already has a shape for — the autonomy dial and the bless are both already person-to-engine controls.
- people: ONE PERSON, WHO IS ALSO THE ONLY USER. Every pass line in this iteration was measured from that person's own session, and the field report that motivated it is theirs. THE ASSUMPTION WORTH NAMING: what is slow for this agent in this harness is slow generally. It may not be — 428 polls is a fact about a tool that hands back a job id, but 7% building is a fact about how one agent spent one day.

## follow_up

PROBE-ASSUMPTIONS TAKES ALL THREE, and one arrives with its answer already half-written.

THE TRACE-GRAPH ONE NEEDS NO NEW MEASUREMENT. i34 produced the count; what probe-assumptions owes is the ruling that follows — the deletion warning reads BOTH the frontmatter edges and a text sweep for the id, because the second is what actually found the twenty.

THE OTHER TWO ARE ONE READING EACH. Whether the walk's position and the missing `files` argument are available at the call, and which of the register's eight status values count as open for this guard.

DECOMPOSE-STRUCTURE IS WHERE ALL THREE BIND, because each names a source of truth the design has to pick.

## anything_else

### The requirement-by-requirement sweep, which the six rows above do not carry

- req-a-deletion-names-what-points-at-the-node LEANS ON the trace graph holding every reference. FALSE IN PART, and the count already exists. i34's deletions orphaned two requirements and one must story through frontmatter edges, which the graph sees — and seventeen prose citations plus three engine comments, which it cannot. A warning built on the graph alone would report a clean list and be believed, which is worse than no warning.
- req-the-full-battery-runs-where-the-method-says LEANS ON the engine telling an agent-initiated run from the walk's own. Unprobed, and cheap: the walk's position plus the absence of a `files` argument are probably the whole discriminator, and both already exist.
- req-a-harmless-finding-names-an-open-entry LEANS ON a register entry's status meaning one thing to two readers. Unprobed. The template allows eight values and only two are obviously not-open; `accepted` and `deferred` are exactly where a carried finding drifts. THE SAME ASSUMPTION FAILED IN i34 one level up, where six sites decided whether a record was open and every one asked the filesystem instead of the status field.

### One thing deliberately NOT recorded as an assumption

req-a-harmless-finding-is-carried-not-stopped-on leans on the author judging whether a defect blocks downstream. That is not a condition that could turn out false. It is a judgment the row deliberately leaves to a person and writes down so it can be argued with, and filing it as an assumption would dress a design choice as an uncertainty.
