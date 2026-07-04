# GitHub Copilot instructions — Quackitect

> **GENERATED FILE — do not edit by hand.** Rendered from `method/prompts/contract.md` +
> `method/entry/copilot.tmpl.md` by `quack render-entry`; `quack lint` flags drift.

> **THE CONTRACT BELOW IS BINDING — READ IT IN FULL, FIRST.** Before anything else:
> read it, **paraphrase its specifics back** to the adjudicator (name rule 3's
> `actor=agent` killer-bless exception), and **confirm you will obey**. Re-read it at
> the start of every `engage`. It governs every move on this repository.

{{CONTRACT}}

---

## Operating notes (Copilot)
- The project is driven through the **`quack` engine** — run `.\quack <cmd>` from the repo
  root. Do not act on the ledger by editing files directly; the loop's commands are:
  `status`, `next`, `bless <id> [--by human|agent]`, `note "<text>"`, `report`, `lint`,
  `selftest`, `progress [--pager <gate>]`.
- Ledger-advancing commands (`next`, `start`, `bless`, `ship`, `observe-red`) on an agent
  channel require `--key <session-key>`; the contract's attest section above explains how
  a key is earned. A BLOCKED reply is the gate working — follow the contract, not a workaround.
- Realized code is marked inline: `// design: <id>  implements: <req-id>` … `// enddesign`.
- Every output follows `product/brand/voice.md`: short sentences, lists, no personal data
  (use roles), no human-vs-agent framing in prose.
