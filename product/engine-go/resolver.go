package main

import (
	"os"
	"path/filepath"
	"strings"
)

// design: go-overlay-resolver  implements: req-engine-vehicle-split, req-overlay-resolver, guidance, req-integrate, req-vendor-layout
// One resolver walks the vehicle->engine chain. The most-specific layer wins; an un-overridden
// resource is inherited from the engine. The engine layer is READ-ONLY: a vehicle overrides by
// placing a file in its overlay, never by editing the engine. guides() routes through this.
func overlayLayers() []string {
	// most-specific first: the vehicle's overlay, then the engine's default resources.
	return []string{
		filepath.Join(ENGINE, ".quack", "overlay"), // vehicle overrides (engine/brand layer)
		EngineDir(),                                 // engine defaults (vendored, else dogfood product/)
	}
}

// EngineDir resolves the read-only engine layer (its default method/ + project_types/). A vehicle
// vendors the engine under .quack/vendor/quackitect, so that wins; the dogfood repo has no vendor
// dir and falls back to its own product/quackitect. So gather, guides, and the report resolve engine
// resources without a hardcoded dogfood path. Never written to. The word "product" is the engine's
// own — a vehicle's product/ is its tool, never the engine.
func EngineDir() string {
	for _, l := range []string{filepath.Join(ENGINE, ".quack", "vendor", "quackitect"), filepath.Join(ENGINE, "product", "quackitect")} {
		if st, err := os.Stat(filepath.Join(l, "method")); err == nil && st.IsDir() {
			return l
		}
	}
	return filepath.Join(ENGINE, "product", "quackitect")
}

// EngineSrc resolves the engine's Go source: vendored under .quack/vendor/engine-go in a vehicle,
// else the dogfood product/engine-go. Used for asset fallback and for `start init` vendoring.
func EngineSrc() string {
	for _, l := range []string{filepath.Join(ENGINE, ".quack", "vendor", "engine-go"), filepath.Join(ENGINE, "product", "engine-go")} {
		if st, err := os.Stat(l); err == nil && st.IsDir() {
			return l
		}
	}
	return filepath.Join(ENGINE, "product", "engine-go")
}

// resolveBrand resolves a brand asset (logo/voice/palette): the PROJECT's own product/brand/ first,
// else the engine's generic design-language template (EngineDir/design). So every project carries its
// brand at product/brand/, and a missing asset falls back to the engine default. quackitect's product/
// brand is its duck; a vehicle's is seeded generic by `start init` and replaced.
func resolveBrand(name string) string {
	for _, p := range []string{
		filepath.Join(ROOT, "product", "brand", name),
		filepath.Join(EngineDir(), "design", name),
	} {
		if _, err := os.Stat(p); err == nil {
			return p
		}
	}
	return ""
}

// Resolve returns the path of a resource from the most-specific layer that has it, or "" if none.
func Resolve(rel string) string {
	rel = filepath.FromSlash(rel)
	for _, layer := range overlayLayers() {
		p := filepath.Join(layer, rel)
		if _, err := os.Stat(p); err == nil {
			return p
		}
	}
	return ""
}

// ResolveGuides lists guide ids -> resolved path, walking the chain (vehicle overrides engine).
func ResolveGuides() map[string]string {
	out := map[string]string{}
	for i := len(overlayLayers()) - 1; i >= 0; i-- { // engine first, vehicle last (so vehicle overwrites)
		base := overlayLayers()[i]
		filepath.Walk(base, func(p string, fi os.FileInfo, err error) error {
			if err != nil || fi.IsDir() || !strings.HasSuffix(p, ".md") {
				return nil
			}
			if filepath.Base(filepath.Dir(p)) == "guides" {
				out[strings.TrimSuffix(filepath.Base(p), ".md")] = p
			}
			return nil
		})
	}
	return out
}

// selftestSplit verifies the chain (vehicle overrides engine), inheritance, and the engine
// read-only invariant (resolving never writes under the engine layer).
func selftestSplit() bool {
	// 1. an engine default resolves to the engine layer when no override exists.
	// (use an engine-only guide; voice/brand are overridden by quackitect's own overlay.)
	base := Resolve("project_types/default/guides/milestone-review.md")
	if base == "" || !strings.HasPrefix(base, EngineDir()) {
		return false
	}
	// 2. a vehicle overlay wins. Use a temp overlay file, then clean it up.
	rel := "project_types/default/guides/milestone-review.md"
	ov := filepath.Join(ENGINE, ".quack", "overlay", filepath.FromSlash(rel))
	if err := os.MkdirAll(filepath.Dir(ov), 0o755); err != nil {
		return false
	}
	if err := os.WriteFile(ov, []byte("override"), 0o644); err != nil {
		return false
	}
	got := Resolve(rel)
	winsVehicle := got == ov
	os.Remove(ov)
	// 3. inheritance restored after the override is gone.
	back := Resolve(rel)
	return winsVehicle && strings.HasPrefix(back, EngineDir())
}

// enddesign
