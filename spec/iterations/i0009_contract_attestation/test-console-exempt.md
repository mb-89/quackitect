---
id: test-console-exempt
type: test
verifies: [req-console-exempt]
statement: A console-channel command runs with no attestation state present and never prompts for a key.
class: executed
verify: selftest:attest-console
killer: false
---
