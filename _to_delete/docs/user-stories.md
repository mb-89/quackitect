# User stories — v4

**Stories come first. Cases are derived from them.** A story says what a person wants and
why. A case is the walk that proves the story. A story with no case is a wish. A case with
no story is machinery looking for a reason.

| | |
|---|---|
| Date | 2026-08-30 |
| Scope | v4, all levels |
| Cases | `use-cases.md` |

**Shape.** Three lines: **As** a role, **I want** a capability, **So that** an outcome.
Then **done when**, which must be observable. Then the cases that prove it.

**The reference machine.** Every time budget in this design is measured on a 2026 midrange
laptop. Budgets hold **warm**, which means the editor is already installed and the
dependencies are in place. A cold first install has its own budget, and it is not this one.

**Budgets add up, they do not overlap.** Each level states its own. A walk that crosses two
levels costs the sum. No level may spend another level's budget.

**A budget is a target, and it is not raised quietly.** Parts of a budget are outside our
control. That is a reason to measure the parts, not a reason to drop the number.
A budget is raised only after a measurement shows where the time goes. The argument for
raising it must say why that time cannot be recovered.

---

## US-1 — Install with one script

**As** a user.
**I want** to install the whole system by running one script.
**So that** I do not have to find out anything before I start.

**Done when**

- One script does everything. There is no second step and no page to read first.
- Missing dependencies are installed. Present ones are left alone.
- A clone works. A folder handed over with no version control also works.
- Windows and cloud Linux both work.
- The desktop run ends with the editor open and the welcome page shown.
- A second run changes nothing.

**Cases.** UC-0.

**Surface.** Everything about setup lives in one folder. The root shows one entry for
installation, never two scripts side by side.

---

## US-2 — Start the caged agent from idle

**As** a user in idle.
**I want** to press one button and get a caged agent.
**So that** I can ask for help without setting anything up.

**Idle** is the resting state. The extension is loaded. The welcome page is shown. Nothing
runs. Every session starts here.

**Done when**

- One button starts the agent in the folder that is open.
- The cage is set before the agent can act.
- The engine is ready. The tool server is connected.
- The agent gets one kickoff text that says what to do first.
- The agent is **ready**. It has loaded what the cage requires of it.
- The agent says so, in one short message.
- The whole walk takes **15 seconds or less** on the reference machine.

**Ready is not a place.** It means the preparation is done. Where the agent then stands is a
question for the level that owns places. Level 0 has none.

**Two harnesses.** The Claude extension is preferred. The Copilot integration is supported.
Some features are absent on the fallback. That is accepted, and the absence is named at
launch rather than found later.

**Cases.** UC-29, UC-30.

---

## US-3 — Arrive somewhere, once machines exist

**As** a user.
**I want** the ready agent to take up a position in the work.
**So that** it tells me where things stand, not only that it is awake.

**This story is not for the first build.** It needs the state machine. It is recorded here
so that US-2 is not over-built to reach it.

**Done when**

- A ready agent takes up a position.
- With no machine running, the position is a resting place, and the agent says what it can
  do from there.
- The time this adds is budgeted separately, on top of the 15 seconds of US-2.

**Not this.** A boot state inside a machine. The user never boots. Preparation is not work,
so it does not belong in a model of the work.

**Cases.** To be written with Level 2.

---

## US-4 — The agent speaks the way the engine prescribes

**As** a user.
**I want** the agent to speak the way the engine prescribes.
**So that** I read one voice, and never have to correct its manner.

**Done when**

- The rules bind every turn, including turns with no work.
- A written artefact that breaks a mechanical rule does not reach disk.
- A refusal names the rule and the place.
- Adherence in conversation is measured against the same rules, and the number can be
  compared with the last measurement.
- The standing layer stays inside its size budget.

**Voice is Level 0. Guidance is not.** Guidance applies to a piece of work, and it rides the
work token. Voice and general behaviour have no task to attach to, so they stand.

**Cases.** UC-32, UC-33.

---

## US-5 — Watch the cage hold

**As** a user.
**I want** to watch the agent work and see the cage hold.
**So that** I can trust it without reading its code.

**Done when**

- The agent never stops without a stated reason, and the reason is in the log.
- Every call is in the log, with the identity that made it.
- A write that breaks a ruling is refused, and the refusal names the rule.
- All three hold with nothing above Level 0 present.

**Where the rulings come from.** Most come from above. Level 0 asks and enforces. A short
list is its own, because files, trees and identities state it fully. That list is in Level 0
under **What Level 0 guards on its own**.

**The log is Level 0.** Reasons, refusals and calls land in one place. A person can read it
with no tool.

**Cases.** UC-34, UC-35.

---

## US-6 — Read the log without a mouse

**As** a user.
**I want** to read, filter and inspect the log with the keyboard only.
**So that** I can find one call among thousands while the log keeps growing.

**Done when**

- Arrows scroll the log and move the selection.
- Typing filters, with no key needed to start.
- Bare text filters everything. `name:value` filters one column. Regular expressions work.
- One key opens the details for the selected line, and the same key closes them.
- Every call has details.
- Both sides scroll independently, and a new entry never moves the side I am reading.
- A half-typed filter never blanks the view.
- On start I see this session only, and reaching further back is something I ask for.

**No mouse at all.** Mouse tracking takes copy away from the terminal. A log I cannot copy
from is worth less than the clicking is worth.

**Cases.** UC-36, UC-37.

---

## Standing rules these stories set

| Rule | Where it lands |
|---|---|
| One entry on the root surface for setup | Level 0, Installation |
| Nothing is copied into place by hand | Level 0, Projection |
| Idle is a named resting state, and ready is a named condition | Level 0, Launch |
| Level 0 knows no places, so it knows no front desk | Level 0, Launch |
| Preparation is never a state in a machine | Level 2 |
| Two harnesses, one preferred, feature loss named | Level 0, Launch |
| Time budgets are measured on the reference machine | Cross-cutting |
| Voice and general behaviour stand. Guidance rides work | Level 0, Voice |
| The standing layer is enforceable, or it is not admitted | Level 0, Voice |
| Level 0 guards shape. The authority guards meaning | Level 0, Own guards |
| One design system on every surface | Cross-cutting 4f |
| The keyboard is the only input the log needs | Level 0, The log window |
| A missed budget is measured and argued, never quietly raised | Cross-cutting |
