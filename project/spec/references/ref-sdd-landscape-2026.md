---
id: ref-sdd-landscape-2026
kind: reference
statement: "Spec-driven development tooling as it stands in 2026 — the market this product sits closest to, scanned live at gate-inputs."
scanned: 2026-08-06
scanned_at: i1/gate-inputs
---

# Spec-driven development, 2026

WHAT THE FIELD IS. A written specification is treated as the primary artifact
and code as a regenerable output, produced by people, agents, or both. It
emerged in 2025 against "vibe coding": agents producing plausible code that
drifts from intent, hallucinates APIs, and decays as a project scales.

WHO IS IN IT. By 2026 every major AI coding tool ships a flavour — GitHub Spec
Kit, AWS Kiro, Claude Code, Cursor, OpenSpec, BMAD, Tessl, Google Antigravity.

- GITHUB SPEC KIT. The most adopted open-source option. A Python CLI, 93,000+
  stars, v0.8.7 on 2026-05-07, supporting 30+ agent harnesses. Its named
  differentiator is an agent HOOKS system: event-driven automations firing when
  files are saved or created, handling test updates, README refreshes and
  security scans without prompting.
- AWS KIRO. A ground-up IDE replacement built entirely around specs as the unit
  of work. Its default router combines several frontier models and picks one
  per task to balance quality against cost.

REPORTED EFFECT. Early adopters report 3-10x higher first-pass success from
agents on non-trivial tasks. Reported by vendors and adopters, not measured
independently — treat as a claim about direction rather than a number.

WHAT THEY DO BETTER THAN US, and it is not close: adoption. Ninety-three
thousand stars against zero. Thirty harnesses against two. A funded IDE from a
hyperscaler.

WHAT THEY SHED — and the axis is NOT automation.

Withdrawn 2026-08-06: this note previously framed it as "they automate, we
refuse". Wrong. We automate too; the unattended walk IS automation, and it is
the proposition.

The real difference is that ours is RULED WHILE IT RUNS. The agent goes at full
speed and does not produce slop, because the machine constrains what it can
reach and what it can skip. Their spec is an input the agent is ASKED to
follow; hooks fire on events and automate work, but nothing in that toolchain
refuses a skipped step or proves a document was read.

So the comparison is speed-with-rails against speed-without, not automation
against ceremony.

WHY IT MATTERS TO THIS PRODUCT. The empty cell is enforcement. It is empty NOW,
and every one of these tools will grow toward it as their users hit the same
wall. The mechanism is the easiest part to copy; the method's depth is not.

## Sources

- https://www.marktechpost.com/2026/05/08/9-best-ai-tools-for-spec-driven-development-in-2026-kiro-bmad-gsd-and-more-compare/
- https://www.marktechpost.com/2026/05/08/meet-github-spec-kit-an-open-source-toolkit-for-spec-driven-development-with-ai-coding-agents/
- https://dev.to/krlz/spec-driven-development-in-2026-what-it-is-the-tooling-and-how-teams-actually-use-it-2fk2
- https://www.augmentcode.com/tools/best-spec-driven-development-tools
