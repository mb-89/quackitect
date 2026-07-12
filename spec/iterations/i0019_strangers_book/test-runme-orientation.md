---
id: test-runme-orientation
type: test
statement: Both RUNME scripts check, install, and verify the toolchain; both print the orientation naming the next steps; neither contains a workspace-creating call - asserted over the script contents on both platforms.
class: executed
verify: selftest:runme-orientation
killer: false
---
## Rationale (not load-bearing)
Content assertions over tools/RUNME.ps1 and tools/RUNME.sh, the selftestStubs pattern - no
subprocess install on the battery machine. The no-workspace assertion is the negative that
guards req-runme-orientation.3 (the i18 scripts DID create one; this test pins the revision).
