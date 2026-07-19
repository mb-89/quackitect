---
id: model-module-architecture
type: model
kind: structural
statement: The module architecture separates workspace process, module ownership, and import/update mechanics.
---

```mermaid
flowchart TD
  workspace["workspace: one iteration, one ledger, one report"]
  module_registry["module registry: ids, titles, paths, parents, source kind"]
  module_selector["module selector: exact and subtree selection"]
  module_facets["module facets: first filter in derived views"]
  import_manager["module import manager: dry-run manifest from external source"]
  update_manager["module update manager: provenance-based refresh"]
  local_overlay["module overlay: local changes over imported payload"]
  workspace -->|owns| module_registry
  module_registry -->|defines| module_selector
  module_selector -->|filters| module_facets
  module_registry -->|declares imports for| import_manager
  import_manager -->|records provenance for| update_manager
  import_manager -->|is overridden by| local_overlay
```

Placement rationale: the workspace process stays above modules. The registry is the structural root for module metadata. Selection and facets are view behavior. Import, update, and overlay are the file-ownership boundary.
