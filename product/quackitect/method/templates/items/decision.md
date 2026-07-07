---
template: item-decision
artifact: node
applies_rigor: [lean, systematic]
applies_type: [default]
---
# decision — one recorded call, of one kind

Lives in `spec/decisions/` (all kinds). ONE type, three kinds; the prefix follows
the kind: `adr-` architecture, `dec-` project, `wvr-` waiver. Each kind renders in
its owning chapter view — architecture in design output, waivers in verification
and validation, project in the project chapter (the tailoring record is its first
row). Bass sorts the kinds: system-wide or quality impact = architecture.

## Fields
- `type` (adr): fixed — the historical type name carries all kinds.
- `kind` (architecture | project | waiver): empty means architecture (blessed history).
- `addresses` (list of req- ids): what this decision answers. A waiver addresses
  the requirement whose failure it accepts, and links the evidence.
- `chosen` (list of cand- ids, architecture kind): the picked candidate(s).
- `rejected` (list of cand- ids): the turned-down candidates — reasons in the body.
- `adjudicated_by` (the literal in the skeleton below): decisions are adjudicated
  by the user. A WAIVER is ALWAYS a user-adjudicated gate — the agent never
  blesses a failure acceptance.
- `supersedes` (list of decision ids): the record this one replaces.
- `tags` (list of slugs, optional): query hooks — the ch4 strategy view filters
  decisions tagged `strategy` via `file.hasTag`.
- `statement` (one sentence): the call, stated as a claim.

## Body
MADR shape: context and problem / considered options (pros and cons — or the
candidate links) / decision / consequences. Anti-bias discipline: weights fixed
BEFORE options are scored; "?" is a legal verdict meaning information gap;
plausibility and sensitivity checked before the call. Project kind adds the
trigger and the revisit condition. Waiver kind adds the accepted consequence
and the evidence link.

```
---
id: {{adr|dec|wvr}}-{{slug}}
type: adr
kind: architecture
addresses: [req-{{slug}}]
chosen: [cand-{{slug}}]
rejected: [cand-{{slug}}]
adjudicated_by: user
statement: {{the-call}}
class: review
killer: false
---
## Rationale (not load-bearing)
{{context, options, decision, consequences}}
```
