---
id: se.raid-phone-real-ntfy-shape
kind: raid
statement: The NtfyTransport's exact request/response shape (X-Actions body format, since-poll message parsing) is realized against the v1-inherited probe, not re-verified against a live ntfy on v2 - a format drift could surface only at live pairing.
provenance:
  iteration: i8-phone-lane
  ai_involvement: agent-drafted
raid_kind: risk
raid_owner: driving agent
trigger: at live pairing, if a push renders wrong or a tap does not parse, re-probe the current ntfy API against the NtfyTransport and adjust; the injectable boundary makes this a one-file fix
---


