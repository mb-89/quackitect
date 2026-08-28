---
form: find_prior_art
judgment: passed at 2026-08-21T12:54:27.476Z
by: agent
signed_off: 2026-08-21T09:25:04.763Z
authors: agent
files: null
---

# Evidence form / find_prior_art

## current_situation

The function partition is settled and the candidate space opens. This finder sweeps what somebody WROTE DOWN about long work reporting itself.

The predecessor was read first, as the card's step zero demands. It carried a real finding.

One standard governs this problem directly and was read to its own page rather than to an article about it.

## applies

yes

## options

- [[opt-one-operation-object-serves-every-kind-of-long-work]]
- [[opt-a-state-word-marks-what-is-listed-but-not-yet-usable]]
- [[opt-acknowledge-inside-a-second-then-report-every-minute]]

## literature

THE PROBLEM HAS A NAME IN THE FIELD, and finding it was half the search: LONG-RUNNING OPERATIONS.

GOOGLE AIP-151 GOVERNS IT, state Approved, read at https://google.aip.dev/151 on 2026-08-21. PRIMARY SEEN, the page itself rather than a summary of it.

WHAT IT GIVES THAT WE DID NOT HAVE.

- ONE SHAPE FOR ALL LONG WORK, as a rule with its reason. Its words: individual APIs must not define their own interfaces for long-running operations, to avoid non-uniformity. Our two-table split is exactly what that forbids.
- PROGRESS BELONGS IN A METADATA PART, separate from the result. The standard says the metadata type is used to provide information such as progress, partial failures and similar information on each fetch.
- A THING WITH WORK RUNNING ON IT STAYS LISTED AND CARRIES A STATE WORD. That is a direct answer to `flow-step-standing`'s third value, which the packet had left open as the design's first question.
- A NUMBER WE DO NOT TAKE. Its rule of thumb for "a significant amount of time" is ten seconds. Ours is one, from `req-call-answers-in-one-second`. The mechanism transfers and the threshold does not.
- AN EXPIRY RULE WE DO NOT NEED. Thirty days for an operation resource, sized for a service. Ours dies with the container.

WHAT IT FAILS AT, and it is the aspirational failure the card warns about. The standard is written for generated clients over a network. Most of its rules are about protobuf machinery we do not generate, and its costs were paid by people with a wire format.

WHAT WAS NOT READ. The Operations service definition itself, and AIP-152 on Jobs. Named rather than implied.

THE STANDARDS ANGLE BEYOND THIS ONE WAS NOT SWEPT. No HTTP specification for the 202-and-poll shape was read, and no post-mortem literature was searched. Stated as an incomplete sweep rather than a finished one.

## shipped

THE PREDECESSOR IS THE FINDING, and it is the one the card says people skip.

v1 AT REF `main` ALREADY WROTE THIS DESIGN DOWN. `product/quackitect/project_types/default/guides/responsiveness.md`, a guide with `scope: always`.

ITS STATEMENT, verbatim from line 4: fast tooling, every interaction gives feedback within 1 second, long tasks report progress every minute, the more interactive the more it should overachieve.

ITS ACKNOWLEDGEMENT RULE, from line 11: where the work takes longer than a second, emit an acknowledgement first, within that second. Its own example is "started computing…".

THAT IS THIS ITERATION'S LOAD-BEARING GOAL, written by the predecessor and not carried into v3.

AND IT CARRIES A BOUND THIS ITERATION DOES NOT HAVE. Line 12: a long-running task reports progress at least once per minute. Nothing in this register says how often a running piece of work must have something new to say.

WHAT IT COST THEM is not recorded, and I did not find it. The guide says apply this only where it needs no major architecture rework, which is a cost admission without a number.

THE SEARCH THAT FOUND IT. `background|job handle|long.running` at ref `main` under the product folder, seven matches, five of them noise in a vendored library and one a design-language table. One real hit.

WHAT THE PREDECESSOR DOES NOT HAVE. A search at ref `v2` for estimated, remaining and eta returned 480 matches, every one of them inside a vendored Obsidian plugin bundle and none in the product's own code. v2 had no background-work reporting to read.

## dry_wells

- The 202-and-poll shape as an HTTP specification. Not searched, so this is an unswept angle rather than an empty one.
- Post-mortem literature about misleading progress estimates. Not searched here; one secondary account of a 2010 abandonment study is already recorded on a resident story, with its primary explicitly not seen.
- Any written account of estimating time remaining for a job with no history. This is the question the packet asked three times and no source was found for it, which is a real dry well.
- v2's own handling of long work. Searched and genuinely empty: nothing in the product's own code, only a vendored library.
- AIP-152 on Jobs, and the Operations service definition itself. Not read, and both are the obvious next stop if the design needs more than the shape.

## follow_up

The other finders run next, then the chart is built.

Two findings are bigger than options and are named here so the chart does not swallow them.

- The state-word rule answers the design's crippling open question, and it came from a standard rather than from us.
- The predecessor already wrote this iteration's load-bearing goal, and it carries a progress-frequency bound this register does not have.

## anything_else

THE CARD'S STEP ZERO PAID FOR ITSELF ON THE FIRST SEARCH.

"Read the predecessor first" found a fifteen-line guide holding this iteration's central design, acknowledgement rule and all, at ref `main`.

THE CARD PREDICTED THIS EXACTLY. It records that a sweep of roughly a hundred external products once missed six working implementations sitting one ref away.

WHAT IS UNCOMFORTABLE ABOUT IT. Nobody carried the guide forward, and nothing noticed. A rule with `scope: always` in one version and no home in the next is a loss no check can see.

MINE IT FOR FEATURES, NEVER FOR AUTHORITY, says the card. So this is evidence v1 tried it, and nothing more. What makes it worth more than that is the measured failure in v3 that the guide would have prevented.
