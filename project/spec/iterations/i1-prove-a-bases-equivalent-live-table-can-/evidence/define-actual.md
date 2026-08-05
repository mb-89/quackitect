---
form: define-actual
by: agent
signed_off: 2026-08-04T19:17:38.146Z
authors: agent
files:
---

# Evidence form / define-actual

## current_situation

The founding as-is, written from the market check and the mined corpus. Every major claim cites a reference note under spec/references — the reference system was built this same day, harvesting v1's shape and set.

## as_is

THE WORLD AROUND THE PRODUCT, good and bad:

- Spec-driven development is mainstream: every major vendor ships a spec layer (@[[ref-spec-kit]], @[[ref-kiro]], @[[ref-tessl]], @[[ref-openspec]], @[[ref-bmad]]), and agent runtimes are supported products (@[[ref-agent-framework-ga]] as one example).
- All of them work the OUTPUT end — spec to code, runtime to fleet policy. None makes an agent take proper design input or forces an architecture step; nobody records who approved what on which evidence. The input-and-architecture middle stands open. Witness: the tool set above, read tool by tool.
- Skipping the input end has a measured cost: AI-heavy codebases show structural decay at ecosystem scale (@[[ref-gitclear-maintainability]]), and the cost of correcting an early architectural error grows by orders of magnitude with every phase it survives — engineering common knowledge since Boehm (@[[ref-boehm-cost-of-change]]).
- Forty years of systems engineering method exist for exactly this problem — requirements, architecture evaluation, traceability, gates — proven in industry, digested and reachable (@[[ref-sya-program]]). The method is not the gap; carrying it is.

THE AGENTS, good and bad:

- Agents are genuinely strong at the output end: incredible speed and real competence in design and code generation. Witness: reported patterns across the industry, replicated in this project's own record.
- Rigor taxes people: the competent-at-rigor set and the tolerant-of-rigor set barely overlap in humans, so rigor gets done badly or skipped. The agent is the overlap — competent and tireless — which is why the rigor can move onto it at all (@[[ref-founding-motivation]]).
- Left ungoverned, agents fail at BOTH ends of the strength scale. A weaker model ticks the checklist without doing the work. A stronger model philosophizes: asked to move a box forty pixels, it questions the intent for ten minutes instead of moving it. Witnesses: observed in this project's own walks; field reports of both patterns.
- Thin input makes every agent worse: the model fills gaps with plausible invention, and everything downstream inherits it (@[[ref-cognitive-debt-rct]], @[[ref-dora-genai]]).

## follow_up

- log-risks opens the register; the dropped self-critique lands there — young machinery, thin evidence base; the sebot blind A/B is the one direct benchmark and proves nothing alone
- the as-is guidance lands in the durable M1 row at the next unbound pass
- the reference lint follows with the engine bundle
