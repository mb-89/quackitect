# M5 — Prove the riskiest unknowns (i0008_trust_hardening)

Evidence for the M5 gate. Two timeboxed spikes in `.quack/spikes/` (gitignored, throwaway; findings captured here, backward).

## Riskiest assumptions validated by evidence  → i8-m5-riskiest-validated  *(killer)*

**Spike 1 — no-brick strict parse (R1, kill-criterion: zero false rejections).** `spikes/i8-strict-parse/spike.go` replays `adr-strict-load`'s exact rules (first-line-fence recognition, node-key allowlist, `iteration.md` as its own key class, both-direction ref resolution, duplicate-id detection) over the LIVE `spec/` tree. Result: **470 nodes recognized strict = 470 nodes the engine loads today, 0 false rejections, 0 dangling references.** Evidence docs (`M<n>-*.md`) are excluded naturally by the first-line rule despite their mid-document `---` hrules — the M3 hazard is real but the rule handles it. The allowlist that achieved this is final: node keys `id, type, statement, class, verify, killer, milestone, parent, depends_on, refines, implements, verifies, addresses, validates, ears, adjudicated_by`; iteration-breadcrumb keys `iteration, status, type, rigor, roles`. **Kill-criterion met.**

**Spike 1 catch (the machinery vindicating itself):** the sweep caught that my M1-pulled `req-cli-help`/`test-cli-help` **silently shadowed identical ids in i0003** — where the CLI-help fix already landed (shared help preamble `cli.go:61/84`, `selftest:help` green; the backlog note was stale). The duplicates are removed, the record corrected (dated corrections in M1–M4 evidence + the archive note), and the incident is exactly the silent-shadow failure the strict parser + lint hardening exists to catch — now with a live specimen for the kernel-test corpus. One legacy finding remains: `i0001_reporting/design/dashboard_draft.md` carries Obsidian keys (`excalidraw-plugin`, `tags`) — not loaded today (no statement), would reject under strictness; the build plan gets a cleanup step (strip its frontmatter; it is a sketch, not a node).

**Spike 2 — channel detection (R2).** `spikes/i8-channel-stat/channel.go` implements `adr-actor-channel-stat`'s stat rule. Harness-side result, live: `stdin chardev=true stdout chardev=false → agent` (this harness leaves stdin a console handle!) and fully piped `false/false → agent`. This validates the design detail that BOTH stdin AND stdout must be char-devices for `human` — stdin alone would have mis-stamped this very session as human. Console-side: **markus, run `.quack\spikes\i8-channel-stat\channel.exe` in your terminal at this gate** — expected `chardev=true/true → human`; that one line completes R2's evidence on a real console. Fallback if it ever misfires stays pre-agreed in the ADR (always-agent + `--by human`).

## Design is buildable  → i8-m5-design-buildable
No blocked path remains: the allowlist is final and live-verified; the recognition rule survived contact with the real tree; the channel rule is validated on the harness side with the console side down to a one-command check; baseline-corpus, log-dir, corpus-baking, and normWS designs need no new decisions. Spike learnings folded backward: (1) load-time duplicate-id rejection confirmed in the strict-parse scope (live specimen caught), (2) the AND-of-both-chardev rule is load-bearing, (3) one legacy cleanup step added to the build plan.

## Spike results recorded  → i8-m5-spike-recorded
Both spikes persisted under `.quack/spikes/i8-*` for the M6 build to crib from (the spike.go strict loop is a working draft of the production parser change); findings and design advances recorded above; spikes remain gitignored throwaways per method.

---

## Milestone review (increasing scrutiny)

**Round 1 — Verify.** Both spikes ran against reality, not fixtures: the live 470-node tree and the live harness channel. The kill-criterion number (0 false rejections) is reproducible by re-running the spike. The cli-help catch is verified three ways: the i0003 files exist, the preamble is at `cli.go:61/84`, and `selftest help ok` in today's battery.

**Round 2 — Validate.** M5's job was to prove R1 and R2 before building on them — both are proven or reduced to a one-command console check. The unplanned catch improved the record's honesty (a duplicate silently shadowing a blessed iteration's node is precisely the disease under treatment).

**Round 3 — Red-team.** Counter-case (i): "the spike parser and the future production parser could diverge — the spike proves nothing about the shipped code." True in principle; contained because the kernel-test battery (`selftest:parser-strict` etc.) re-asserts the same cases against the SHIPPED binary, and M7 demonstrates the killer UCs live. Counter-case (ii): "one console check by one human is thin evidence for R2." Accepted consciously: the failure direction is designed-harmless (mis-stamp toward agent under-claims human oversight), and the `--by` override plus pre-agreed fallback bound the damage. Counter-case (iii): "the dashboard_draft cleanup could delete design history." It is a gitignored-era sketch, git history preserves it, and the step only strips frontmatter keys, not content.

**Console result (markus, 2026-07-02, at the gate):** `channel.exe` in his real terminal printed `→ default actor=human` — R2's console half CONFIRMED live.

**Verdict: PASS** (contingency met at the gate). Proceed to the human bless of `i8-m5-riskiest-validated` (killer) and `i8-m5-gate`.
