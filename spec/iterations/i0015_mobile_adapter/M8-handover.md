# M8 — Package & hand over (i0015_mobile_adapter, systematic)

## Docs complete & match the surface  → i15-m8-docs  (killer)

- [guide-mobile-pairing](../../guides/guide-mobile-pairing.md): setup (app-scan vs browser-scan, `--show` for second devices), the two safety instructions, answering (first-wins, the delete-before-tap edge and its re-send remedy, expiry), and the no-daemon listening model. Every sharp edge in it was HIT live this iteration before being written down.
- The agent guide's command block carries `pair`, `pair --show`, `ask`, `await` with honest one-liners; engage.md's ADJUDICATE step names the mobile default at killer/milestone hand-offs.
- The requirement set, the ADRs (including the accepted-risk trust model and the Slack deferral), and the milestone evidence M1–M8 read against the built surface without contradiction.

## Configuration baselined  → i15-m8-config

- Pairing state: `<userDataBase>/quackitect/pairing.json` (machine-local; the topic pair is the credential — never in the repo).
- Pending asks: `<workspace data home>/asks/asks.json` (runtime state, never truth; resolved gate answers live in the ledger as ordinary bless events with the channel noted).
- The channel base defaults to `https://ntfy.sh`; self-hosting swaps the base in the pairing config.

## Packaged & versioned  → i15-m8-packaged

`quack ship` runs immediately after the M8 gate bless (the standing rule): the zip carries the fresh book and report at its root; the committed book refreshes in the same move.

## Handover accepted  → i15-m8-handover

The adjudicator has driven the surface end-to-end personally:

- paired via QR
- answered two gate asks and one decision ask from the phone
- exercised both delivery lanes (await stream and drain-on-run)
- hit and confirmed the delete-before-tap edge

The M8 gate bless completes the handover.

## Milestone review

**Verify.** Each doc claim points at a shipped surface; the config homes exist and carry live state from today's run.
**Validate.** The iteration's motivation — decision one-pagers reach the phone, the answer comes back as an adjudication — was not merely built but USED to adjudicate this very iteration's gates.
**Red-team.** Opposing case: "docs written by the builder flatter the build." Held: the guide documents the failure modes the OWNER found (browser-vs-app and deleted message), not a happy path. Kill-criterion: a field reader failing to pair from the guide alone reopens the docs check.
**Verdict: PASS** — proceed to the gate bless.
