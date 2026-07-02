# M8 — Package & hand over (i0008_trust_hardening)

Evidence for the M8 gate. Docs match the surface, the artifact is packaged, the configuration is baselined, the record is self-explaining.

## Docs complete & match the actual surface  → i8-m8-docs-complete  *(killer)*
- **AGENTS.md**: the command list now shows `bless [--by]` with the channel-default semantics, `lint [--ears-baseline]` with its three lint lanes, and `quack version` with the out-of-repo log location.
- **engage.md**: the adjudicator-tagging instruction rewritten from the retired `QUACK_ACTOR` env dance to the channel-default + `--by human` reality (the walk that shipped this feature already followed it).
- **compose-reference.md**: the five-shape EARS block with the forward-only + exemption instruction, i7 content intact (mechanized by `selftest:ears-method`).
- **review.md**: the retro's log-reading step names the log location and `quack version` as the finder (markus's M4-gate instruction).
- **usageText**: `--by`, `--ears-baseline`, `version` on the built-in surface (`selftest:surface` green).
- **README**: the report image reference resolves — `.quack/out/report.png` regenerated fresh from the live board this session (markus's M3-gate instruction: PNG under `.quack/out`). Note for the GitHub rendering: `.quack/out` is gitignored; publishing the image is a GitHub-side call and stays markus's (hands-off).

## Packaged & versioned  → i8-m8-packaged-versioned
Final `quack build`: engine compiled, golden re-baselined (`f40b28014507`). Full battery from the shipped binary: **44/44 ok, zero FAIL**. `quack lint`: **coverage clean (no holes), ears clean, monotonic clean, exit 0**. Stray `quack.exe~` deleted. The ship zip is `engage ship`'s output at the very end, per method.

## Configuration baselined  → i8-m8-config-baselined
- `.quack/config.toml`: version `i0008_trust_hardening`; the `logs_dir` override documented inline.
- `.quack/ears-baseline.json`: the 72-statement feature-land corpus, committed and diffable.
- `.gitattributes`: verified holding (`text: auto`, `eol: lf` on sampled files) — the post-i7 CRLF policy stands.
- Golden root current at `f40b28014507`.

## Handover accepted  → i8-m8-handover-accepted
The iteration record is self-explaining: eight evidence docs (M1–M8) with review rounds and verdicts, six ADRs carrying their losers and kill-criteria, and dated correction notes where the walk corrected itself (cli-help dissolution; the two grandfather calls; the BOM catch). `HANDOVER-i8.md` deleted per its own instruction — its content is fully absorbed into this record. Notes inbox at ZERO: the six scope notes archived with their realized outcomes, the backlog holds only genuinely-future items with ready-when lines. Field-loop hook: the next `engage start` retro asks how the strict engine behaves on the other machines (the thin-harness backlog family waits on exactly that evidence).

---

## Milestone review (increasing scrutiny)

**Round 1 — Verify.** Each doc claim was checked against the running surface, not memory: usage printed, selftests surface/contract/ears-method/bootstrap green (they mechanically pin AGENTS.md, contract.md, compose-reference.md, README), the PNG opened and inspected (M1–M7 green, M8 open, suspect frontier 0 — an honest mid-M8 board), lint exit 0.

**Round 2 — Validate.** Nothing in the frame is left un-handed-over: every M1 Ch1 criterion traces to a demonstrated behavior (M7) and a doc that tells the next session how to use it (M8). The record a future auditor needs — why each decision holds, who blessed what, as whom — is in the ledger, not in this conversation.

**Round 3 — Red-team.** (i) "The README image is gitignored — docs-complete with an unpublishable image?" The reference resolves in every checkout that runs `quack report` + screenshot, the criterion (reference resolves or dropped) is met as amended by markus, and publishing is deliberately his. (ii) "The board in the PNG shows M8 open" — correct and honest: it was rendered mid-M8; a green-M8 PNG can only exist after this gate, and re-rendering it post-bless is a one-liner if wanted. (iii) No undocumented surface remains: `resolve`/`guides`/`dump`/`root` predate i8 and are unchanged.

**Verdict: PASS.** Proceed to the human bless of `i8-m8-docs-complete` (killer) and `i8-m8-gate` — then `engage ship`.
