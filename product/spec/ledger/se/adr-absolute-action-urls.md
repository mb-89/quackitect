---
id: se.adr-absolute-action-urls
kind: decision
statement: "An answer action's URL is ABSOLUTIZED against the configured base at send time: the pairing stores a bare topic, and the card carries https://<base>/<topic>. Ported from v1, whose own comment names the trap - 'the topic stays BARE here; SendAsk absolutizes it against the adapter's base'. v2 copied the bare topic and never absolutized, shipping url \"answer:<topic>\", which is not a URL scheme; the owner found it by tapping and read back 'Expected URL scheme http or https but was answer'. Rejected: storing absolute URLs in the pairing config, which duplicates the base so the two can disagree."
provenance:
  iteration: i8d-phone-brief
  ai_involvement: agent-drafted
  adjudicated_by: agent
  channel: chat-grant
breaks_if_removed: "The one-tap answer cannot be tapped at all: the phone refuses the action and the owner has no way to adjudicate from away, which is the entire point of the lane."
---


