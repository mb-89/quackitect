# M6 — Build & verify (i0021_field_ux)

## Build planned → i21-m6-build-planned

Fifteen resumable steps seeded as children of i21-m6-build (b1-b15), dependency-ordered:
the schema data feeds tier/provenance/prefill; colors need tier+provenance; render needs
colors; the answer endpoint needs render. Seeder, apply ops, and the five ride-alongs hang
flat. Killer review, blessed by the driving agent under the standing overnight grant;
collected for the morning.

## Schema set → i21-b1-schema-set

Five new schemas authored (usecase, need, question, raid, model) and requirement extended
(ears exemption pattern; required statement):

- question: state enum (open/proposed/decided/suspect), core, default open - a question
  without a state cannot exist; decided_via stays the strict parser's field (the flat schema
  shape cuts keys at the first underscore - a REAL contract limit found by the schema tester,
  recorded here).
- raid: kind core (default risk); mitigation CORE WITH NO DEFAULT - a risk without a
  mitigation reads undecided in the register, by design; probability/impact as 0..1 patterns,
  deferrable, default 0.5; status deferrable default open.
- model: kind core from the registry enum - a kind-less model is broken.
- usecase/need: statement required; no extra fields to constrain yet.

Verified: the schema-set contract accepts the set (full battery green; `quack lint` reports
zero schema findings). Non-killer review; blessed by the driving agent.

## EARS grandfather sweep → i21-b10-ears-sweep

The red ritual held: selftest ears-baseline observed RED at 68e59343 (18 findings), then the
sweep landed over the sanctioned lane - a `quack apply` manifest (dry-run validated 18 files,
all-or-nothing write): every historical statement now carries
`ears: exempt - historical pre-EARS statement, retire-or-retrofit recorded
(adr-grandfathers-historical)`.

Results, verified live:

- `ears: clean (42 exemptions)` - the lint's chronic red (100% of calls two retros running) is
  dead; a NEW finding stands out again.
- The suspect cone stayed EMPTY after the 18 hash moves - no re-bless wave.
- The two i20 sky-fall findings are closed by ALLOCATION (M4), and the conformance checker
  earned its keep tonight: it rejected my first go-defer-retire placement (services) with two
  physics findings (external I/O, inward-only violation) - corrected to rim, recorded in the
  model prose. It also caught the sequence model's dialect (alias participants, dashed
  arrows) - rewritten to the extractor's grammar; models lint zero findings.
- selftest ears-baseline green; graph-suffix-rooted still green.

Non-killer review; blessed by the driving agent.

## Drivers table → i21-b12-drivers-derived

Red at c505647d, then green: driversUnion computes requirement -> deciding kind:architecture
ADRs (suffix-resolved, sorted) plus hand-tag entries; renderAsrList renders the union and each
expand names its deciding ADR(s) or "owner hand-tag". Ch 10.5 populates from the existing
addresses edges. Non-killer review; blessed by the driving agent.

## Lint scopes → i21-b13-lint-scopes

Both lanes live inside go-terms-order-lint (the M4 allocation held: extensions, not new
elements - the sky-fall lint REJECTED my first attempt at new markers, exactly as designed):

- README terms (define-before-use, README edition): a glossary term whose FIRST use is
  linked is legal thereafter; a bare first use flags. THE LINT FOUND 5 REAL FINDINGS in the
  shipped README (gate, ledger, milestone, trace, walk) - fixed by first-use links to the
  book's term anchors, one reword ("guide you through"), and one code-span in the keyword
  footer. The i19 authorship-only law demonstrably needed the determinizer.
- Jargon advisory: ALL-CAPS acronyms (2-8 chars) outside the glossary flag, advisory class;
  sentence capitals never match. Zero findings on the live book.

Walk slip recorded honestly: both selftests went green without a recorded red (implementation
landed in the same slot); tests_red exempt markers carry the true reason and the retro note
names the lead. Non-killer review; blessed by the driving agent.

## Battery tiers → i21-b14-battery-tiers

Red at 787d7ae4, then green: buildFastTier (deps, parser, determinism, ids, parity) rides
EVERY build path after the re-baseline - a failing invariant fails the build; `quack selftest`
keeps the full battery unchanged. Measured: the fast-path build round-trip is 1.16 s - inside
the responsiveness bound. Non-killer review; blessed by the driving agent.

## The kernel chain → i21-b2..b5

All red-ritual (reds at 36a9dded, 539afa8b, cc1dd954, c9eb4a62):

- **b2 field-tier**: nodeTierState rolls a node's schema fields to undecided /
  complete-with-deferrals / complete; TBD marker convention fixed as a value starting "TBD".
- **b3 provenance-block**: the block parses via the generic frontmatter maps, folds into
  fullHash (value and provenance travel under one identity), and the STRICT REFEREE
  allowlists it - a miss the battery caught via decided-in-mint before the gate.
- **b4 mint-prefill**: applySchemaPrefill post-processes every mint - schema defaults, first
  enum option as a marked agent proposal (a TBD text would break the enum's own rule), TBD
  markers for strings, provenance lines for everything; skeleton TODOs on schema fields
  rewrite to the TBD convention.
- **b5 register-colors**: fieldColor/nodeRegisterColor derive the four marks from provenance
  only; two design refinements landed under test pressure - a deferrable field RIDING its
  default is yellow, and an unstamped value EQUAL to (or absent and riding) its default is
  mechanically explainable, so pre-register history renders readable instead of all-red.

## The register surface → i21-b6, i21-b7

Reds at 3320d51e, 0e08e514, 9c3db500. The register renders as a report section: statement +
color chip collapsed, core fields on the first expand, everything + provenance on the second;
the adjudicated green is a filled dot, the agent-confident green an outlined one. The answer
lane: POST /register-answer on the watch server dispatches the same validated application a
console edit makes (schema-validated, refused on rule breaks), rewrites value + provenance
under one hash, and records a resolved decision ask carrying the channel. Killer rows carry
the pager pointer and no affordance - the guard held byte-identical files in the selftest.
FIRST VISUAL CUT - the owner's drafting rounds are expected input.

## Seeder → i21-b8

Red at 0113c19b. quack start parses the rigor source at activation (UTF-8 bytes; the em-dash
rides the regex as \x{2014}) and emits the full gate/subtask skeleton - namespaced ids,
milestone-monotonic wiring, killer and derived marks honored, template wording as pre-fill;
never clobbers a composed set. A PowerShell mojibake incident struck the seed file mid-build
(the banned round-trip lane) - caught in diff review, rewritten via the editor lane, noted for
the retro, and the editing-lane method text now names the corrupter.

## Apply ops → i21-b9

Red at f1445ffe. The manifest gains op:create (file must not exist) and op:write (whole-file),
validate-first and all-or-nothing across every op kind; touched files and the outcome ride the
dispatch's call-log line (callLogSetExtra). The extension lives inside go-apply-manifest - the
build found no seam that earned the separately allocated element, and the model was corrected
accordingly.

## Method docs → i21-b15

compose-reference and engage now teach engine seeding (tailor, don't author), the prefill/
provenance/register flow, and the implementation fragment's editing-lane list names the
PowerShell round-trip as the corrupter. The editing-lane DEFAULT still awaits the owner's
q-io-lane-scope ruling - the one open question, by design.

## Rigor-fit (the plan hole) → unplanned slice

Closing M6 honestly surfaced that req-rigor-fit never got a build step - the coverage hole
said so. Built under the red at b979514d: fit bands live in the rigor definitions
(fit_min/fit_max), rigorFitAdvisory hints below/above band, advisory by law (rule 5 keeps the
human confirming rigor). The plan gap itself is a retro fact: the build-planned statement
named the ride-alongs and omitted this one.

## Evidence correction

The b13 section claimed "zero jargon findings on the live book" - WRONG once the lane was
wired: 22 findings, dominated by emphasis-caps noise (IS, NEVER). The heuristic gained the
vocab filter (a caps token whose lowercase form lives in the book's own prose is emphasis,
not an acronym); 12 real leads remain as advisories for the book's owner rounds.

## Deck-goto → i21-b11-deck-goto

Reproduce-first paid off: the delegation ALREADY SHIPPED - `git log -S "__deckJump(t)"` shows
it landed with i0019's bugfix batch, hours after the note was filed. No fix needed; the gap was
the class guard. test-deck-goto carries `tests_red: exempt` citing adr-red-unobservable (the
behavior predates the test), and selftest deck-goto statically asserts on the REAL rendered
book: every emitted bookGoto copy delegates to __deckJump BEFORE any scroll, and __deckJump
enters present mode via bookSlideTo. Green. Non-killer review; blessed by the driving agent.

## The build rolls up → i21-m6-build

All fifteen planned steps blessed, plus the unplanned rigor-fit slice. Full battery green at
close; every requirement carries a realized design (coverage: clean).

## Models adhered → i21-m6-models

The conformance lint reports zero model findings: the build filled exactly the M4-allocated
elements, and the two deviations went through the model EXPLICITLY - go-defer-retire moved to
rim when the checker refuted the services placement, and go-apply-general folded into
go-apply-manifest with the allocation prose corrected. No element entered silently.

## Internal quality → i21-m6-quality

The build gate enforced gofmt+vet on every compile (three refusals caught real issues: a
missing import twice, a redeclared helper). House idiom held: design markers on every new
region, kernel purity (the provenance fold is a pure field fold), zero new dependencies.
Honest debits, recorded: two ritual slips (tests green before their red was recorded - exempt
markers carry the truth) and one mojibake incident (the banned lane; caught, noted, method
text updated).

## Implementation risks → i21-m6-impl-risks

Acceptable, with two watch items: the B1 wedge tripwire stays armed (a binary swap during a
watch answer - fallback recorded in the ADR), and the register's first visual cut awaits the
owner's drafting rounds (raid habituation guards are structural, not visual). No risk blocks
validation.

## Milestone review → i21-m6-gate

1. **Verify.** Sixteen slices (15 planned + the rigor-fit hole), every engine slice under a
   recorded red (two honest exemptions carry their reasons); the derived checks compute
   green: tests authored, reds observed, designs realized, verification green across ALL
   iterations. The full battery closed the milestone at exit 0.
2. **Validate.** Every M1 criterion has its machinery: zero blanks (mint prefill), the veto
   session (register + answer lane), start seeds the skeleton, computed colors, lint exit 0
   on the clean tree (ears clean). The M7 demonstrations remain - machinery is not yet a
   demonstrated session.
3. **Red-team.** The build's own checkers drew blood four times (sky-fall on my markers, the
   services placement, the strict referee on prefilled enums, the battery on decided-in-mint)
   - each caught pre-gate, each fixed structurally. Residual dissent: the register's
   questionnaire is a prompt(), not the seed's inline form - deliberately thin until the
   owner's visual rounds; recorded, not hidden. OPEN QUESTION in the cone: q-io-lane-scope
   (the owner rules; blocks only the method-default text).

**Verdict: PASS - the gate awaits the owner's bless.** The walk stops here by design.

## The owner's design round: the hand-off page (gate still open)

The first register cut was REJECTED in the owner's round ("in this form this is not useful")
and redirected: adjudication is a MOMENT, not a dashboard. The reshape, same walk:

- **adr-handoff-html** (supersedes adr-register-in-report): every bless moment renders ONE
  phone-first HTML - the gate's cone as color-coded prefilled rows, two disclosure levels,
  the y/n bless ON the page riding the recorded ask lane (actor=user, channel=handoff); a
  red field rules in place over the same answer endpoint. NO standing register anywhere -
  provenance stays node data; the report section, its CSS, and its JS were deleted.
- `quack progress --pager <gate>` now renders the page, opens it, prints the pointer - the
  prose-plus-ASCII-card hand-off is retired (the card text survives only as the phone ask's
  body). Stale pages have dead buttons by ruling: no listener, no action, no fallback prose.
- The phone lane: ntfy cannot render HTML inline - the notification keeps its one-tap y/n
  ACTION buttons (the i15 lane) and gains the page as a view link where the watch server
  runs.
- req-register-render re-stated to the hand-off shape (red re-observed at 1d9bbe19 for the
  new behavior; a post-green EARS wording fix carries its honest exempt marker).

## The owner's second round: lifecycle and speed (gate still open)

Two more owner rulings landed live, both red-ritual (reds at 41fca2ba, 7a8b538d), battery green:

- **Lazy verdicts (req-lazy-verdicts)** - the owner's measured complaint: walk commands paid
  15-25 s verdict storms. Now ONLY the verification surfaces (report, selftest, verify,
  progress, build) re-run tests on a cache miss; every other command answers from the cache
  and reads a moved hash as not-verified, silently and instantly. The no-over-checking rule,
  finally baked at the engine rung.
- **The hand-off's life follows the page (req-handoff-lifecycle)** - the owner's watchdog
  sketch, built: `progress --pager` starts a ONE-SHOT server on an ephemeral port, opens the
  browser, and the page heartbeats while open (plus a close beacon). The first of answer /
  silence / never-opened / hard-cap ends the server and the command reports how it ended -
  closing the page without answering is EXPECTED and degrades to "gate stays open, server
  gone". A found-later HTML has dead buttons, by ruling. The phone lane is PARKED by the
  owner (view-link exists; the LAN-IP picker grabbed a link-local address once - fix rides
  the phone round).

## Post-verdict additions (owner-invited, gate still open)

While the gate waited, the owner opened a slot for backlog work that fits; three things landed:

- **Unknown-type refusal** (the i19 spike's engine-hygiene priority): a node whose type is
  outside the known set is now REFUSED by the strict referee - isGate can no longer default a
  stray `type:note` into a blessable gate. Red at b37161d8 (test-unknown-type verifies the
  existing req-structural-strictness), green after; the live tree and the vehicle scaffold
  both load clean under the rule.
- **The vale-pull hang, found live**: chasing a white-label battery failure exposed that a
  FRESH data home downloads the prose linter with an UNBOUNDED http.Get (~45 s) - inside a
  fixture, a network reach the battery's own zero-dep law forbids. ensureVale now honors
  QUACK_NO_PULL (the fixture sets it) and bounds the pull at 20 s. Battery green.
- **Two obsolete backlog notes archived with reasons**: the gofmt sweep (the build's analysis
  gate made it structural) and the coverageDelta standalone-skip (already fixed in place,
  comment names the complaint).
