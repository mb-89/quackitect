---
kind: matrix-row
name: identify-assumptions
statement: Sweep the requirements for what they lean on, and record each one as a RAID assumption.
state_kind: work
filled_by: agent
depends_on:
  - write-requirements
entry_read:
  - project/deliverable/machines/methods/meth-assumption-hunting.md
legal_tools:
  - se_file_read
  - se_file_write
  - se_file_patch
  - se_file_search
  - se_file_glob
  - se_file_list
  - se_log_query
  - se_answer
evidence:
  - name: assumptions
    template: refs
    of: raid
    description: "every assumption opened here, as a raid node reference, one per line"
  - name: sweep
    template: per-item
    items:
      - environment
      - toolchain
      - host
      - platform
      - neighbours
      - people
    description: "each source swept, and what it turned up — none is a legal answer, with its reason"
major: full
minor: tailored
patch: tailored
product: full
specification: tailored
major_note: |
  Applies in full: every source swept, every assumption the change's
  requirements lean on recorded before any of them is probed.
minor_note: |
  Applies to the delta: sweep the sources the change touches. Standing
  assumptions are not re-identified, only added to.
patch_note: |
  One narrow duty: when the patch exists BECAUSE something turned out not
  to hold, record that as an assumption which has become an issue.
  Otherwise nothing here.
product_note: |
  STANDING ARTIFACT: the assumption side of the RAID register. At rest
  every condition a requirement leans on is written down and owned, and
  the sources have each been asked at least once.
specification_note: |
  DOCUMENT FORM: the assumptions render as a filtered view of the RAID
  register. The book links to the nodes, never restates them.
---

## Guidance

THE RULE: if an item is only true under some condition you have not established and do not control, that condition is an assumption and it gets written down. Not established means you have not checked it; believing it firmly is not checking it. Not controlled separates it from a decision, which you own, and from a dependency, which somebody else owns.

THE SWEEP IS PER SOURCE, and that is what makes the step bite. A nil answer is cheap when it is given once and expensive when it must be given for each source with a reason. The sources are the environment, the toolchain, the host, the platform, the neighbours and the people. Every one gets an answer, including none.

WALK THE REQUIREMENTS, NOT YOUR MEMORY. The register written at write-requirements is the input to this sweep. A requirement carrying a number usually rests on something; a requirement about a boundary almost always does.

EACH ASSUMPTION IS A NODE, shaped by [[raid]], with `kind: assumption`. This field carries REFERENCES, never prose. The node carries the statement, the owner, the trigger, and a `## Probe` section saying how it would be checked. AN ASSUMPTION WHOSE PROBE CANNOT BE WRITTEN IS NOT ONE — it is a worry, and it belongs in the body of a risk.

The method is [[meth-assumption-hunting]], which the entry read demands before this state opens. The register is [[meth-raid]]. Probing is the next state's work, and it probes ALL standing assumptions rather than only these.
