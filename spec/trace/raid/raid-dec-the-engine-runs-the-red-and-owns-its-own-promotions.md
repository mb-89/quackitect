---
minted_in: i11-the-engine-fix-bundle-about-twenty-named
id: raid-dec-the-engine-runs-the-red-and-owns-its-own-promotions
type: "[[raid]]"
kind: decision
statement: The engine fires the new checks at observe-red's submit, a promotion is scoped to the record that made it, and a truncating pipe is stopped before it cuts.
owner: the owner
trigger: any of the three landing without the others, or a later state asking an agent to run a check by hand
status: decided
impact: without these the agent runs checks the engine should run, reads promotions belonging to shipped records, and shapes output the log can never recover.
breaks_how_badly: crippling
how_likely: conceivable
weighs_with: none
weighs_against: none
source_refs:
  - req-the-full-battery-runs-where-the-method-says
  - req-test-result-is-structured
  - "M7_50_verification: filled_by engine, its verdict records itself"
  - raid-dec-blocking-and-the-battery-refusal-ship-together
---

## Three rulings, one shape

THE OWNER RULED ALL THREE ON 2026-08-16, at i11's observe-red, after the state
demonstrated each of them live. They share one shape: THE ENGINE SHOULD DO IT,
NOT THE AGENT.

### One — the engine fires the red

OBSERVE-RED DOES NOT GRANT se_test. Its legal tools are the file verbs and
se_run, so the state whose whole job is watching new checks fail cannot use the
test verb. The agent reached for the shell instead.

THE OWNER'S ANSWER IS BETTER THAN GRANTING THE VERB: "How about the engine
fires the tests and observes red? When you submit observe-red, the engine runs
the test."

THAT IS THE SHAPE verification ALREADY HAS. M7_50 reads `filled_by: engine`
and says the battery "runs mechanically and its verdict records itself".
observe-red is the same act one milestone earlier, and it was left to the
agent.

### Two — a promotion belongs to its own record

specify-build REFUSED TWICE on promotions naming chunks of drawings that
shipped with i27. The agent withdrew both, which was work nobody needed.

THE OWNER'S RULING: "A promotion does not need to survive its iteration. A
promotion doesn't even have to be accessible as far as I'm concerned. We should
only look at promotions from within our own iteration."

SO THE CHECK IS SCOPED TO THE RECORD. An experiment minted elsewhere is not
this record's business, and asking about it produces exactly the noise it
produced here.

### Three — a truncating pipe is stopped, not warned about

THE LANE ALREADY WARNS AFTER THE FACT. `output_shaped` says what a pipe
dropped exists nowhere — not on the result, not in the log. The agent hit it
at this very state: a run piped through Select-String returned exit 1 with
empty output, and the red had to be re-run to be read.

THE OWNER: "This truncation pipe hazard thing, maybe you can fix this. I wonder
why this happens so often."

WHY IT HAPPENS SO OFTEN is the part worth answering. The pipe is reached for
when the lane has no verb for the job and the raw output is expected to be
long. So the fix is two-sided: refuse the shaping pattern at the boundary
rather than annotating it afterwards, and note which verb was missing when
somebody reached for the shell.

## Rejected options

- GRANT se_test TO observe-red. The obvious fix and the owner rejected it in
  the same breath as proposing the better one. It keeps the agent deciding when
  a check runs, which is the habit the whole bundle is removing.
- KEEP WARNING ABOUT THE PIPE. It already warns and the agent shaped output
  anyway, in this iteration, while building the fix for it. A warning that has
  not worked twice is evidence about warnings.
- MAKE PROMOTIONS SURVIVE PROPERLY, by keeping old drawings addressable. More
  machinery to keep a thing nobody wants: the owner's words are that nobody is
  concerned with a shipped record's promotions.

## Consequences

- observe-red's evidence becomes engine-filled, like verification's.
- The promotions check reads only experiments minted in the current record.
- se_run refuses a truncating shape rather than annotating it, and says which
  lane verb was wanted.
- THE TWO WITHDRAWALS ALREADY MADE STAND. They are accurate — both promotions
  really are dead — and reverting them would cost more than it saves. What
  changes is that no future record is asked about them.
