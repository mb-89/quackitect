---
id: i24-judgment-the-phone-loop-gate-briefs-reac
status: seeded
opened: 2026-08-12T19:47:43.862Z
goal: "JUDGMENT — the phone loop: gate briefs reach the phone and are blessable from it, which is also what makes a cloud iteration supervisable."
vision: |-
  NEEDS THE OWNER, and it sits FAR DOWN the list — after the webview work. He liked how it worked and wants it back, at some point.

  IT GAINED A SECOND JOB. The owner wants one mechanical iteration designated the cloud iteration and run in the cloud. His stated problem: on the first run he has NO GOOD WAY OF SEEING HOW FAR IT HAS GOT AND NO GOOD WAY OF BLESSING IT, so the first cloud run has to be completely independent. Once the phone loop exists, a cloud iteration is blessable from the phone. That raises this iteration's standing from convenience to enabler.

  IT CARRIES A SPIKE, NOT A VERDICT. Prove the tunnel IN THIS ENVIRONMENT before building on it. The claim that cloudflared fails VM-side is SECOND-HAND — one line of project/V2-INVENTORY.md, flagged as failed by the inventory's own key, citing a v2 paper nobody here has read. The owner remembers it working well. A v2-era finding about a tunnel on a VM is weak evidence about this machine now. Settle it with a current fact.

  IT CARRIES A NAMED KILL-CRITERION THAT DOES NOT DECAY. v2 shipped a defect where the hosted page said "Blessed" while the engine IGNORED THE ANSWER. A FALSE SUCCESS ON AN ADJUDICATION SURFACE IS WORSE THAN NO SURFACE, because the owner believes a gate passed when it did not. Whatever the tunnel turns out to do, that stays the round's kill criterion.

  WHAT WAS VERIFIED END TO END in v2: Workers KV plus a fragment-key self-decrypting page.

  V1 BUILT ONE TOO, and its shape is worth taking. adr-handoff-html at ref main: ONE browsable HTML page per BLESS MOMENT, rendering the gate's cone as collapsed colour-coded rows that expand to full field and provenance detail, with the yes-or-no bless ON the page riding the existing ask path and recording actor and channel. THE SAME PAGE TRAVELS TO THE PHONE as the ask's link. There is NO standing register, because ADJUDICATION IS A MOMENT, NOT A DASHBOARD.

  Its security answer, with the residual risk accepted deliberately after a red-team round: authenticity equals possession of the paired channel credential. Recorded mitigations: high-entropy minted topics, asks carrying check ids and never secrets, late and duplicate answers idempotently ignored, gate asks rendering distinct. Upgrade paths in order: self-hosted ntfy with tokens and ACLs, then Slack socket-mode with workspace-authenticated callbacks.

  Its recorded risks: lockscreen actions, dangling notifications, relay retention. Read them before designing the channel.

  ONE REQUIREMENT IT MEETS HEAD ON. req-mirror-stays-on-the-machine is a must, security, fatal: while the mirror serves, connections come from this machine only. A phone loop exists to get the brief OFF the machine. v2's answer respects the intent rather than the letter — the payload is encrypted at the host and the key lives only in the URL fragment, so what leaves is unreadable. The requirement governs what the MIRROR SERVES; a push channel is the engine SENDING. Those can coexist, but the seam must be argued rather than assumed.

  FULL CONTEXT: project/spec/version-planning.md, section J6.
inputs:
  - project/spec/version-planning.md
  - i23-judgment-the-ui-sitting-cut-the-html-mir
  - spec/decisions/adr-handoff-html.md at ref main
  - spec/trace/requirement/req-mirror-stays-on-the-machine.md
---

# i24-judgment-the-phone-loop-gate-briefs-reac

## Goal

JUDGMENT — the phone loop: gate briefs reach the phone and are blessable from it, which is also what makes a cloud iteration supervisable.

## Rough vision

NEEDS THE OWNER, and it sits FAR DOWN the list — after the webview work. He liked how it worked and wants it back, at some point.

IT GAINED A SECOND JOB. The owner wants one mechanical iteration designated the cloud iteration and run in the cloud. His stated problem: on the first run he has NO GOOD WAY OF SEEING HOW FAR IT HAS GOT AND NO GOOD WAY OF BLESSING IT, so the first cloud run has to be completely independent. Once the phone loop exists, a cloud iteration is blessable from the phone. That raises this iteration's standing from convenience to enabler.

IT CARRIES A SPIKE, NOT A VERDICT. Prove the tunnel IN THIS ENVIRONMENT before building on it. The claim that cloudflared fails VM-side is SECOND-HAND — one line of project/V2-INVENTORY.md, flagged as failed by the inventory's own key, citing a v2 paper nobody here has read. The owner remembers it working well. A v2-era finding about a tunnel on a VM is weak evidence about this machine now. Settle it with a current fact.

IT CARRIES A NAMED KILL-CRITERION THAT DOES NOT DECAY. v2 shipped a defect where the hosted page said "Blessed" while the engine IGNORED THE ANSWER. A FALSE SUCCESS ON AN ADJUDICATION SURFACE IS WORSE THAN NO SURFACE, because the owner believes a gate passed when it did not. Whatever the tunnel turns out to do, that stays the round's kill criterion.

WHAT WAS VERIFIED END TO END in v2: Workers KV plus a fragment-key self-decrypting page.

V1 BUILT ONE TOO, and its shape is worth taking. adr-handoff-html at ref main: ONE browsable HTML page per BLESS MOMENT, rendering the gate's cone as collapsed colour-coded rows that expand to full field and provenance detail, with the yes-or-no bless ON the page riding the existing ask path and recording actor and channel. THE SAME PAGE TRAVELS TO THE PHONE as the ask's link. There is NO standing register, because ADJUDICATION IS A MOMENT, NOT A DASHBOARD.

Its security answer, with the residual risk accepted deliberately after a red-team round: authenticity equals possession of the paired channel credential. Recorded mitigations: high-entropy minted topics, asks carrying check ids and never secrets, late and duplicate answers idempotently ignored, gate asks rendering distinct. Upgrade paths in order: self-hosted ntfy with tokens and ACLs, then Slack socket-mode with workspace-authenticated callbacks.

Its recorded risks: lockscreen actions, dangling notifications, relay retention. Read them before designing the channel.

ONE REQUIREMENT IT MEETS HEAD ON. req-mirror-stays-on-the-machine is a must, security, fatal: while the mirror serves, connections come from this machine only. A phone loop exists to get the brief OFF the machine. v2's answer respects the intent rather than the letter — the payload is encrypted at the host and the key lives only in the URL fragment, so what leaves is unreadable. The requirement governs what the MIRROR SERVES; a push channel is the engine SENDING. Those can coexist, but the seam must be argued rather than assumed.

FULL CONTEXT: project/spec/version-planning.md, section J6.

## Inputs

- project/spec/version-planning.md
- i23-judgment-the-ui-sitting-cut-the-html-mir
- spec/decisions/adr-handoff-html.md at ref main
- spec/trace/requirement/req-mirror-stays-on-the-machine.md
