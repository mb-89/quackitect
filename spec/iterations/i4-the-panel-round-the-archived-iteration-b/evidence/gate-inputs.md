---
form: gate-inputs
bless: blessed by agent
by: agent
signed_off: 2026-08-23T16:20:52.092Z
authors: agent
files: null
---

# Evidence form / gate-inputs

## current_situation

The inputs phase stands complete. Vision, register, actual, scope, boundary, stakeholders, stories and use cases are all signed, most re-signed once as upstream pieces moved.

Frame-delta's gap claim is the round's whole reason: an archived record stops being true the moment it closes, and a bless needs a reload today.

Five stories generalize into five use cases, one to one, all inherited — this round authored no new value proposition and no new capability.

## picture_judged

THE JOURNEYS ARE RIGHT, with one soft spot named below.

The three musts — look-at-a-closed-record, the-call-that-comes-back-inside-a-second, the-control-that-says-why-it-declined — map directly onto the three founding pains: a grey wall with no way in, a slow read failing the same person the same way, and a grey state with no reason. Each has a concrete, scriptable deck.

watch-the-walk-live and work-the-register-as-a-table are correctly graded should, not must — inherited scope from i23, not this round's own opening pain.

ONE SOFT SPOT. "A bless repaints the surface without an engine reload, the whole wire" is one of the four pieces the record opened with, but no picked story concretely scripts a bless click causing a repaint. The requirement has real coverage: uc-act-on-a-control-and-know-what-it-did step 4 and extension 2a name exactly this failure mode, refined from the-control-that-says-why-it-declined, and sty-watch-the-walk-live's own deck already demonstrates the same live-render-without-reload mechanism, just via narration rather than a bless click. That is indirect but real coverage, not a hole. Worth a dedicated M6 demo pass rather than a new story now.

## unspecified_capability

METHOD. Compared this state's live lane tools — confirmed by its own SE-C-110 refusal body: se_file_read, se_file_write, se_file_patch, se_file_search, se_file_glob, se_file_list, se_log_query, se_answer, se_run, se_web_search, se_web_fetch — and the panel's actual control bar (deliverable/machines/panels/controls.md: autonomy, stop-at, go-on, the two walk actions, narration cadence, log filter, shutdown toggles) against the 57 standing use cases.

SCOPE NOTE. "Every lane tool" was narrowed from the engine's full roughly-40-tool surface to what is live at this gate, and "every offered door" to the panel's own controls rather than the whole state-routing graph. draw-context's own signed boundary excludes "the engine's routing" from this round; auditing routing doors would audit outside the round's own box. Naming this narrowing rather than hiding it — the fuller sweep is a separate pass if wanted.

COVERAGE FOUND. File tools (read/write/patch/search/glob/list) to uc-keep-the-corpus-sound-at-the-write and uc-query-the-corpus-by-structure. se_log_query to uc-trace-a-decision-to-its-origin. se_answer to uc-research-and-record-an-answer, confirmed by a direct search hit naming se_answer at that use case's line 31. se_web_search and se_web_fetch to the same use case. autonomy, stop-at and go-on to uc-set-the-autonomy. The two walk actions to uc-get-work-routed and uc-take-a-step. Narration cadence and log filter to uc-watch-the-walk-live. Shutdown toggles to uc-start-an-unattended-machine extension 5b — "the machine stops without closing... expected ending for an ephemeral host" — found only by reading that use case directly after a keyword search for idle/shutdown returned nothing; a lesson for the next reviewer not to trust a keyword miss alone.

ONE GENUINE GAP. se_run's role at this gate — spawning a cold, no-shared-context reviewer at least as strong as the guide, per meth-gate-review's three-hands rule — has no use case. uc-adjudicate-a-gate was read directly: its actor is the person who blesses, and it says nothing about the agent hand that fills the rounds first. A search across the use-case corpus for reviewer / cold context / spawned at the gate returned nothing.

DISPOSITION. Out of scope for this gate, not a fail. The reviewer-spawn mechanism is process and routing, which draw-context's boundary already places outside i4's box. i4 did not introduce it and does not own closing it. Filed as raid-the-reviewing-agent-has-no-use-case-of-its-own rather than left as a bare finding.

## passes_concrete

Checked two of the three musts directly. sty-look-at-a-closed-record's deck cites concrete standing evidence per beat: exp-trunk-read-cost, the tsp-archive suite, evidence/gate-implementation.md, req-archive-read-only. sty-the-control-that-says-why-it-declined's deck cites a real built case with a real battery count — 1403 tests across 134 suites — and separates what is BUILT from what is NOT YET DEMONSTRATED rather than blurring the two.

Both are concrete enough to script at M6: named actor, named trigger, numbered beats each with a witness. The should-priority pair was read but not pressed as hard, since M6 does not owe them a demonstration.

## round_0_verify

- evidence vs claims: every inputs-phase form cites specific standing ids rather than asserting, checked by reading each and cross-checking against the 57/53 globs; generalize-use-cases.md itself records and corrects an earlier false claim (a hand reported no use-case nodes existed, 57 do), so the correction is on file rather than only verbal
- types: n/a — this phase touched no source files, only markdown evidence and one new RAID node
- lint: n/a — same reason, nothing here is lint-scoped source
- tests: n/a — no code exists yet at this phase; se_test is not legal at this gate so the battery's live status is not checkable from here

## round_1_validate

- exercised against the goal: yes — frame-delta's gap claim is what every picked story and use case serves, and the three musts map directly onto its three named pains
- missing: nothing that fails the gate; the one soft spot (no dedicated bless-repaint story) is covered structurally, see picture_judged
- wrong: nothing found wrong; the one correction on file (the false no-use-cases claim) was already caught and fixed at generalize-use-cases, before this gate
- out of scope: engine routing and the gate-reviewer mechanism, per draw-context's own boundary; the coverage dashboard, layout technology and archive-write mechanics, per scope-non-goals
- prior art: live-scanned via se_web_search and se_web_fetch. GitHub Actions and CircleCI are what people actually use for reading a finished pipeline run read-only, with full logs, after it closed. Temporal's Web UI is the closer comparison for live status without a manual refresh, plus its newer Update operation for a running workflow. What they do better: GitHub Actions' archived view is a first-class surface with years of polish this from-scratch panel cannot match on day one — search, re-run, artifact retention windows. What ours sheds: none of them render an archived run as a judged decision graph with per-state evidence and a gate's bless history; they show job pass-fail, not a judgment trail. The trade is right because our surface answers "how was this decided," not "did the build pass."

## goals_served

- the archived iteration browses like the live one, read from its branch, looking as it stood at the close: nothing yet on code — frame-delta's why_now already cites the mechanism as proven ("a shared render function was built this session"); draw-context's intended_use and boundary scope it; sty-look-at-a-closed-record and uc-browse-the-archive give it a concrete demo. Build owed to M7.
- a bless repaints the surface without an engine reload, the whole wire: nothing yet on code — served by frame-delta's gap_claim and the same proven-mechanism note; requirement-level coverage via uc-act-on-a-control-and-know-what-it-did (see picture_judged for the story-level soft spot). Build owed to M7.
- a grey state says why it is grey, with why-not-green riding the state's detail: partly built already — sty-the-control-that-says-why-it-declined cites a real green case, 1403 tests across 134 suites, plus draw-context's excluded_use rule against synthesising a reason. Full demonstration still owed to M6/M7.
- render.ts and mirror.ts collapse into one surface, which is the HTML mirror cut seen from this side: nothing yet — a pending architecture decision at M5 declare-winner, scoped by scope-non-goals' change_size note ("major... decides a structure") and draw-context's boundary.
- the shell, pane and trace-graph defects i23 had already ruled, built rather than re-argued: the arguing half is done — scope-non-goals and gate-kickoff's pulled_in list already inherit these eight items as already-ruled rather than re-arguing them. The building half is owed to M7.

## bound_breaches

- if-agent-harness-to-entrypoint: no breach — unchanged since gate-kickoff's own verdict on the same bound; the inputs phase touched no code crossing that interface

## round_2_red_team

- the whole inputs phase is inherited scaffolding, so this gate risks rubber-stamping continuity rather than judging anything new => argued against: two of the five forms (frame-delta, scope-non-goals) required drawing a genuinely new gap and a new scope cut this round, and generalize-use-cases caught and corrected a false claim mid-walk — that is judgment happening, not a rubber stamp
- if the bless-repaint goal turned out to have no coverage anywhere, this gate should fail => checked directly: coverage exists at the use-case level via extension 2a of a must-priority use case; the gate does not fail on this, but the gap is named rather than hidden
- if the reviewing-agent gap actually sat inside i4's own boundary, it should fail here rather than being filed as a RAID entry => checked against draw-context's excluded_use list, which explicitly places engine routing outside this round; the finding is filed, not swept

## raid_additions

- raid-the-reviewing-agent-has-no-use-case-of-its-own

## verdict

pass — evidence vs claims holds with citations checked against the corpus, both findings from the unspecified-capability walk resolve without blocking (one structurally covered, one out-of-scope-and-filed), and the live prior-art scan was actually run rather than cited from memory

## follow_up

Nothing pulled in as new work. The RAID entry opened this state carries its own trigger — the next use-case sweep — and needs no follow-up state of its own.

The bless-repaint soft spot named in picture_judged is worth a dedicated M6 demo pass rather than a new story now; noted here so M6 demo-planning does not have to re-derive it.

## anything_else

The full engine-wide sweep — all roughly 40 se_* tools and every routing door across every machine — was not run; see unspecified_capability's scope note. That fuller sweep is a separate pass if wanted.
