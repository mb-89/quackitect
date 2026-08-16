---
form: generalize-use-cases
by: agent
signed_off: 2026-08-16T15:49:52.911Z
authors: agent
files:
---

# Evidence form / generalize-use-cases

## current_situation

TWO NEW USE CASES, one per new story. Neither new story fitted an existing use case's extension, and that was checked rather than assumed.

uc-change-the-method-mid-walk was the strongest candidate for the second story and was read in full. It is about CORRECTING guidance a walk is standing on. Adding a rule that binds and enforces is a different goal, with a different trigger and a different guarantee, so it got its own node.

TWENTY-SEVEN RESIDENT USE CASES ARE LISTED BESIDE THEM, untouched. They are there because the coverage check demands a covering set over every story on disk. See anything_else.

## use_cases

- uc-keep-the-corpus-sound-at-the-write
- uc-bind-a-rule-to-what-it-governs
- uc-be-handed-the-method
- uc-set-the-autonomy
- uc-quality-maintainability
- uc-quality-performance-efficiency
- uc-close-a-record
- uc-vendor-and-overlay
- uc-trace-a-decision-to-its-origin
- uc-research-and-record-an-answer
- uc-find-the-right-lane-tool
- uc-answer-a-question-with-tests
- uc-capture-a-stray
- uc-take-a-step
- uc-drain-the-inbox
- uc-resume-after-an-absence
- uc-diverge-before-deciding
- uc-change-the-method-mid-walk
- uc-land-work-on-trunk
- uc-let-the-system-catch-up
- uc-browse-the-archive
- uc-get-work-routed
- uc-install-quackitect
- uc-adjudicate-a-gate
- uc-begin-a-product
- uc-learn-the-machinery
- uc-watch-the-walk-live
- uc-start-an-unattended-machine
- uc-shape-the-view

## follow_up

M3 OPENS NEXT, at write-requirements.

WHAT THE USE CASES HAND IT. M3 derives requirements from these steps and extensions, and a step no requirement covers is a hole.

THE EXTENSIONS ARE WHERE THE WORK IS, and four of them carry decisions already ruled on the register.

- uc-keep-the-corpus-sound-at-the-write 2a and 2b are the refuse-versus-report seam, written as two branches of one step rather than as two policies.
- Its 2c is the self-hosting case — the write that repairs the rule it breaks. That is the requirement the kickoff gate named as missing, and it now has a home.
- Its 3a is the write-budget assumption's fallback, written as an extension rather than left as a hope.
- uc-bind-a-rule-to-what-it-governs 4a is the unbound rule. A rule that cannot fire, passing silently, is the same defect as no rule.
- Its 5b routes corpus-wide subjects to the sweep, which is where raid-iss-se-lint-has-no-whole-repo-sweep lands.

ONE REQUIREMENT IS NOW OWED THAT WAS NOT IN THE FIFTEEN-ITEM SCOPE, and it comes from this state's own two refusals. See anything_else.

## anything_else

### The coverage check, measured on two states

BOTH SUBMITS ON THIS MILESTONE WERE REFUSED BY THE SAME CHECK SHAPE, and between them they show exactly where it leaks.

### What the check does

A field declares `covers: <type>`. The engine then refuses while any node of that type is not covered by something in the listed set.

THE COVERED SIDE IS READ FROM DISK. The refusal at write-stories named five propositions by id. The refusal here named twenty-two stories by id. Neither list came from me.

THE COVERING SIDE IS READ FROM MY MESSAGE. Whatever I type is the candidate set.

### What that costs, measured

AT write-stories: five names added, one grep, check green. Nothing examined.

HERE: twenty-two names added, one grep, check green. Nothing examined.

I HAVE NOT READ TWENTY-SEVEN OF THE TWENTY-NINE USE CASES I JUST LISTED. Each was found by grepping the folder for a story id and copying the filename. The check cannot tell that from a considered mapping, because the listing is where the judgment was supposed to live and typing a name is free.

### The sharper case

sty-what-a-quality-is is refined by NINE use cases, one per ISO quality. sty-next-iteration by two. sty-work-the-register-as-a-table by two.

I PICKED ONE OF EACH, arbitrarily, and the check is satisfied. A deliberate choice and a first grep hit are the same bytes.

### Why it is fixable rather than inherent

BOTH SETS ARE ON DISK. The stories are files. The use cases are files. Every `refines` edge is in frontmatter.

SO THE ENGINE CAN COMPUTE THE COVERING SET AS EASILY AS IT COMPUTES THE COVERED ONE. It already reads one side that way. Asking the agent for the other side turns a total comparison into a sample the agent chose.

THE FIELD THEN BECOMES WHAT IT WAS FOR: not "which use cases exist", which the corpus answers, but "which use cases did THIS delta touch", which only the author knows.

### Where it goes

TO write-requirements, as a requirement. This is note-4c9a8806b8da's class — a check whose two sets are both enumerable but which asks the agent to supply one.

IT WAS NOT IN THE FIFTEEN-ITEM SCOPE as a mechanism, only as the capability-coverage disagreement. The general form is bigger than the one instance the pool named, and this state found two more instances of it inside twenty minutes.

RECORDING IT AND WALKING PAST WOULD BE THE FAILURE CONTRACT RULE 5 NAMES. It is a hole in the thing under my hands, so it is the work.
