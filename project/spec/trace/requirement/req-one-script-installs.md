---
id: req-one-script-installs
type: "[[requirement]]"
statement: When the one setup script at the product root runs, the script shall perform the whole install per the Detail table with zero further commands from the person.
kind: functional
verify_method: demonstration
breaks_if_removed: Install becomes a manual multi-step ritual and the newcomer never reaches the desk.
breaks_how_badly: crippling
refines:
  - uc-install-quackitect
source_refs:
  - uc-install-quackitect step 2
  - uc-install-quackitect step 3
  - ".se/req-mine-v1.md: lifecycle and distribution (one-click install-and-demo)"
  - ".se/req-mine-v2.md: distribution (v2-098)"
priority: must
---

## Detail

## Detail

The whole install is these three acts, in order:

| act | done when |
| --- | --- |
| install the editor extension | the extension stands at the version the script shipped |
| start the engine | the engine answers on its port |
| open the workspace | the editor holds the product folder |
