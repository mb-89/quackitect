---
id: model-kind-onion
question: how do the parts layer around the kernel - who may call whom, where does I/O live?
format: mermaid-flowchart
choose-when: software parts rank by dependency depth - inward-only calls, rim-only I/O
smells: sky-fall
---
# onion

Concentric LAYERS over declared elements: one subgraph per layer, listed
innermost first. Calls point inward only. Only the rim touches the world.
The committed layout spec (req-onion-io-rendering) rules the render: inputs on
the top bus, outputs on the bottom bus, node sides by core direction, coupling
clusters as enterable coreless boxes. Any project whose software ranks by depth
reuses this kind; the engine's own model-engine-layers is the first instance.

```mermaid
flowchart TD
  subgraph kernel
    el-core["the kernel"]
  end
  subgraph shell
    el-shell-io["the io shell"]
  end
  el-shell-io -->|feeds| el-core
```
