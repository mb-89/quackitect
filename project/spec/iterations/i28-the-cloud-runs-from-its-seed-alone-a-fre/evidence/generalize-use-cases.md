---
form: generalize-use-cases
by: agent
signed_off: 2026-08-15T15:19:39.816Z
authors: agent
files:
---

# Evidence form / generalize-use-cases

## current_situation

M2's last work state. The stories are signed and one was added for a machine nobody configured. This state generalises it.

ONE USE CASE IS ADDED AND NONE IS REWRITTEN. Extending [[uc-install-quackitect]] was checked first, as the method asks, and rejected on its three header fields.

## use_cases

- [[uc-start-an-unattended-machine]]
- [[uc-install-quackitect]]
- [[uc-claim-an-iteration]]
- [[uc-open-an-iteration]]
- [[uc-close-a-record]]
- [[uc-land-work-on-trunk]]
- [[uc-adjudicate-a-gate]]
- [[uc-answer-a-question-with-tests]]
- [[uc-be-handed-the-method]]
- [[uc-begin-a-product]]
- [[uc-browse-the-archive]]
- [[uc-capture-a-stray]]
- [[uc-change-the-method-mid-walk]]
- [[uc-diverge-before-deciding]]
- [[uc-drain-the-inbox]]
- [[uc-find-the-right-lane-tool]]
- [[uc-get-work-routed]]
- [[uc-learn-the-machinery]]
- [[uc-let-the-system-catch-up]]
- [[uc-research-and-record-an-answer]]
- [[uc-resume-after-an-absence]]
- [[uc-set-the-autonomy]]
- [[uc-shape-the-view]]
- [[uc-take-a-step]]
- [[uc-trace-a-decision-to-its-origin]]
- [[uc-vendor-and-overlay]]
- [[uc-view-notes-as-a-table]]
- [[uc-watch-the-walk-live]]
- [[uc-quality-compatibility]]
- [[uc-quality-flexibility]]
- [[uc-quality-functional-suitability]]
- [[uc-quality-interaction-capability]]
- [[uc-quality-maintainability]]
- [[uc-quality-performance-efficiency]]
- [[uc-quality-reliability]]
- [[uc-quality-safety]]
- [[uc-quality-security]]

## follow_up

- gate-inputs is next and it closes M2, and by the owner's ruling of 2026-08-15 a gate is theirs rather than the agent's
- M3 derives requirements from the steps and extensions, and this use case has eight extensions that each want a row
- extension 4a is the offline constraint in its testable form, and it is the one most easily lost in implementation
- extension 6b points at [[raid-a-crashed-walk-leaves-a-folder-that-means-nothing]], whose probe has not run
- nothing is parked from this state

## anything_else

### Why a new use case rather than an extension

THE METHOD ASKS THE EXTEND-FIRST QUESTION and it was answered by reading [[uc-install-quackitect]] rather than by preference. Its three header fields each fail for the unattended case.

- ACTOR: a newcomer there, the engineer who owns the work here.
- PRECONDITION: "a computer with an editor and a shell" there, a bare networked machine with a shell and nothing else here.
- GUARANTEE: "the front desk is waiting for a sentence" there, a walk under way here.

AN UNATTENDED MACHINE THAT REACHES A WAITING FRONT DESK HAS FAILED. That single sentence is why these cannot be one use case with a branch.

### A near-contradiction, resolved rather than left standing

[[uc-install-quackitect]] extension 3a says that when the port is taken, the engine picks the next one. This iteration's scope says a starting instance must REFUSE a held port and name its holder.

THOSE READ AS OPPOSITES AND ARE NOT. They are two different situations, and the new use case now says so in its own extensions rather than leaving a reader to reconcile them.

- Our own engine already serving this root: refuse, because moving aside would silently split one session into two.
- Anything else holding the port: pick the next one, exactly as the install case already has it.

Without that distinction written down, whoever implements the port lifecycle would have had to choose between two standing artifacts with no way to tell which was wrong.
