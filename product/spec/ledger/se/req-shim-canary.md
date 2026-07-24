---
id: se.req-shim-canary
kind: requirement
statement: When engine sources change, the shim shall swap to a new child only after a canary confirms the fingerprint loads; an unloadable state keeps the last good child serving and reports the load error.
provenance:
  iteration: i4-questions-and-hygiene
  ai_involvement: agent-drafted
breaks_if_removed: A broken edit intermediate hangs the whole lane until a human fixes a file by hand - the recorded import-batch incident.
req_kind: functional
verify_method: test
source_refs:
  - se.req-hot-reload
---


