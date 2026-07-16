---
id: adr-defer-vehicle-scaffold
decided_in: i0009_contract_attestation
type: adr
adjudicated_by: human
ready_when: the first real vehicle needs re-scaffolding after i0009 (start init, integrate.md, stubs still scaffold the legacy .quack layout; the global-ratchet world needs tools/engine vendoring + spec/project.toml + global-bin launcher)
statement: Vehicle scaffolding modernization is parked. start init, integrate.md, and the drive-from-inside stubs still emit the legacy .quack vehicle layout. This keeps working through the engine's legacy fallbacks: root marker, overlay, vendor resolution. Reworking them to the no-.quack world is deferred, not dead.
class: review
killer: false
---
## Rationale (not load-bearing)
Parked at i9 M6 (bs-cleanup). The legacy fallbacks that carry old vehicles meanwhile: findRoot's .quack marker, EngineDir's .quack/vendor resolution, the legacy overlay layer, the attest/ears legacy paths, and readProjectConfig's config.toml fallback. The modernization, when its ready-when fires: vendored source to a non-.quack home (tools/engine), spec/project.toml as marker+config, global-bin launcher with bootstrap, RENDERED entry files, data-home caches, spec/ledger truth.
