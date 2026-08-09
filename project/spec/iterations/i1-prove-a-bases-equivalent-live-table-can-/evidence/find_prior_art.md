---
form: find_prior_art
by: agent
signed_off: 2026-08-09T11:27:21.520Z
authors: agent
files:
---

# Evidence form / find_prior_art

## current_situation

Five function clusters stand from partition-functions, and no candidate exists yet. This finder asks one question of each cluster: what has somebody outside this project already written about it, or already shipped.

Five searches ran live, one per cluster, so nothing was skipped and no dry well is a guess.

The search provider inside the lane is unconfigured, so the searches ran on the native web search the contract allows for exactly this reason. Every query is in the log.

## applies

yes

## options

- opt-phase-gate-state-machine
- opt-graph-with-cycles
- opt-two-layer-authorization
- opt-worktree-per-record
- opt-serialised-merge-queue
- opt-abandon-by-deleting-the-branch
- opt-decision-trace-schema
- opt-stable-ids-not-copies
- opt-triage-queue-in-front
- opt-idempotent-scaffold-with-drift-detection
- opt-one-command-install

## literature

WHAT WAS READ, and what each gave.

- A Deterministic Control Plane for LLM Coding Agents (https://arxiv.org/html/2606.26924v1). A phase cannot start until the one before it recorded an end. Adds a hard iteration cap on auto-fix loops, which this project has nowhere.
- Capability Gates Are Not Authorization (https://arxiv.org/html/2606.28679v1). Names the split this project conflates: which tools are exposed, versus whether this call with these arguments may proceed. Our legal_tools is the first layer only.
- Decision Trace Schema for Governance Evidence (https://arxiv.org/pdf/2604.09296). A fixed minimum evidence record per decision event, so reconstruction is possible by construction rather than by whoever wrote it.
- LLM Workflows: Patterns, Tools and Production Architecture (https://www.morphllm.com/llm-workflows). The graph-with-cycles shape, with LangGraph named the most used framework for it in 2026.
- Requirement traceability matrix (https://qajobfit.com/resources/requirement-traceability-matrix). Stable ids pointing at authoritative text, with mechanical orphan and stale-link checks.

WHAT THE READING DID NOT SETTLE. Every one of these describes a mechanism. None reports what it cost the people who ran it, which is the half benchmarking is supposed to supply.

## shipped

WHAT WAS LOOKED AT, as running artifacts rather than accounts.

- Git worktrees for parallel agents (https://www.augmentcode.com/guides/git-worktrees-parallel-ai-agent-execution). One working directory and HEAD per agent, one shared object database. This is what the system already does, so it confirms rather than adds.
- The Overstory fleet framework (https://www.augmentcode.com/guides/how-to-run-a-multi-agent-coding-workspace). A first-in-first-out merge queue with four-tier conflict resolution and a watchdog. Nothing here serialises landings.
- An agent inside a real repo (https://www.ramonchancay.me/blog/agent-in-a-real-repo). Abandonment is deleting a branch, which contradicts our close function head-on.
- Linear triage (https://www.issuelinker.com/blog/linear-triage). An inbox in front of the backlog, plus one markdown file per rejected concept. We have the inbox and not the rejection document.
- Microsoft spfx-cli (https://spknowledge.com/2026/05/12/getting-started-microsoft-spfx-cli-tutorial/). Three global installs and a wizard collapsed to one command.
- scaffold-project (https://lobehub.com/skills/opsmachine-om-agency-scaffold-project). Idempotent scaffolding with drift detection against the template.

A FEATURE LIST IS EVIDENCE A FEATURE IS CLAIMED. None of these was run here, and no comparison above rests on anybody measuring ours against theirs.

## dry_wells

- THE PREFLIGHT THAT ABORTS BEFORE A PARTIAL INSTALL found nothing. The scaffolding search returned tools that install and tools that detect drift, and no account of one that checks its prerequisites and stops before touching anything. req-setup-stops-before-partial rests on no prior art, and that is worth knowing rather than assuming somebody solved it.
- HOLDING SEVERAL OPTIONS OPEN found nothing. The holding-pen search returned inbox and triage practice, and nothing on keeping real alternatives alive until one is chosen and the losers readable afterwards. Half that cluster has no literature behind it.
- THE COST SIDE IS MISSING EVERYWHERE. Every source names a mechanism; not one reports what maintaining it cost. That is a gap across this whole sweep rather than in one cluster.
- THE BENCHMARKING WAS DONE BY READING. Nothing above was installed and driven. The tie-break in meth-benchmarking says looking is benchmarking and reading is prior art, so most of the shipped field is weaker evidence than its heading suggests. Recorded plainly rather than dressed up.

## follow_up

- THE COST SIDE IS OWED TO THE CHART. Every option below names a mechanism and none carries what it cost whoever ran it. The chart can hold that gap; a score cannot.
- THE PREDECESSOR WAS NOT SWEPT. meth-benchmarking calls our own previous version the richest of its three sources, and this pass read outside work only. v1 and v2 are both reachable at a committed ref, and neither was opened.
- THE ONE CONTRADICTION IS WORTH THE OTHER FINDERS' ATTENTION. opt-abandon-by-deleting-the-branch says throwing work away should cost nothing; our close function refuses over an unruled finding. Both cannot hold, and that is a real cell rather than a variant.

## anything_else

