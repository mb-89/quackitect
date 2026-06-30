---
iteration: i0003_engine_vehicle_go
status: active
type: default
rigor: systematic
---

Re-establish the engine as a standalone, dependency-free Go binary, cleanly separated from quackitect-the-vehicle: the port IS the separation. Folds in the cli-help convention fix and a dependency-check prompt. Go chosen for distribution (static binary, no web-downloaded executables -> no Windows SmartScreen/AV friction) and startup speed; explicitly NOT for any training-data reason.
