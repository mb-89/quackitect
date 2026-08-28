---
form: probe-assumptions
by: agent
signed_off: 2026-08-28T10:52:53.216Z
authors: agent
files:
---

# Evidence form / probe-assumptions

## current_situation

The register holds 92 assumption nodes, 84 of them open. Probing all of them is not this iteration's scope, and the state is tailored to the delta plus any standing entry whose trigger has fired.

The triggers were swept mechanically rather than from memory. A script read every open assumption's trigger and matched it against what this session actually did.

Eleven triggers named something this session touched. Five had real evidence in hand, and each verdict was written back onto its own node.

## probes

- raid-asm-a-break-made-outside-the-lane-is-caught-by-the-sweep
- raid-lane-works-on-posix
- raid-asm-a-cloud-clone-can-reach-the-remote-it-came-from
- raid-asm-a-host-keeps-a-backgrounded-lane-alive
- raid-asm-the-conformance-checks-stay-affordable-as-the-corpus-grows
- raid-asm-the-corpus-stays-small-enough-for-the-sweeps-to-fit-in-boot
- raid-asm-line-endings-do-not-change-what-counts-as-the-same-heading

## follow_up

Two probes are owed at verification, and each names on its node the measurement or the fixture it needs.

ONE FINDING OUTGREW THIS STATE. The arrival's readiness probe reported the lane dead while the lane was serving. That belongs to the arrival's own work and is recorded as a note.

Six of the eleven candidate entries did not actually fire, and none was stamped with a verdict it had not earned.

## anything_else

HOW THE SWEEP WAS BOUNDED, said plainly so nobody reads it as complete. All 84 open assumptions were listed and their triggers matched against a keyword set naming what this session did: boot, sweep, arrival, unattended, cloud, hand edits, the lane, the container, the prompt layer and guidance.

73 were set aside because their triggers name nothing this session touched. They are not probed, and nothing here claims they are.

THAT IS A FILTER AND NOT A PROOF. A trigger worded without any of those words could still have fired. The filter is written down so the next reader can widen it rather than trust it.

ONE PROBE PRODUCED A FINDING BIGGER THAN ITSELF. Proving that a hand break is caught by the sweep also showed that the guard which should catch it EARLIER runs on one write verb only. That is recorded as raid-iss-the-patch-verb-writes-past-the-corpus-guard.
