// The module registry (pillar 4: modules by default; §8c: import/vendor
// duality). A module dir either IS the module (se) or DECLARES an import
// (kb -> ../benjamin). Imports that don't resolve are DEACTIVATED, never
// errors: absence must not look like nonexistence, and it must not break
// the session (honest degradation).
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { layout } from "./layout.ts";

export interface ModuleStatus {
  id: string;
  status: "active" | "deactivated";
  /** import | local — how the module is homed. */
  mode: "local" | "import";
  /** For imports: where the declaration points, and what happened. */
  detail: string;
}

export function loadModules(root: string): ModuleStatus[] {
  const modulesDir = join(layout.deliverable(root), "modules");
  if (!existsSync(modulesDir)) return [];
  const out: ModuleStatus[] = [];
  for (const entry of readdirSync(modulesDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const declPath = join(modulesDir, entry.name, "module.json");
    if (!existsSync(declPath)) continue;
    const decl = JSON.parse(readFileSync(declPath, "utf8")) as {
      id: string;
      mode?: string;
      import_path?: string;
    };
    if (decl.mode !== "import") {
      out.push({ id: decl.id, status: "active", mode: "local", detail: "local module" });
      continue;
    }
    // Import mode: the manifest renders from the local install.
    const importRoot = resolve(root, decl.import_path ?? "");
    const manifest = join(importRoot, "modules", decl.id, "module.json");
    if (existsSync(manifest)) {
      out.push({ id: decl.id, status: "active", mode: "import", detail: `import ${decl.import_path} (found)` });
    } else {
      out.push({
        id: decl.id,
        status: "deactivated",
        mode: "import",
        detail: `import ${decl.import_path} not found — module deactivated for this session`,
      });
    }
  }
  return out.sort((a, b) => a.id.localeCompare(b.id));
}
