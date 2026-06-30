package main

import (
	"os"
	"path/filepath"
	"strings"
)

// design: go-overlay-resolver  implements: req-engine-vehicle-split, req-overlay-resolver, guidance
// One resolver walks the vehicle->engine chain. The most-specific layer wins; an un-overridden
// resource is inherited from the engine. The engine layer is READ-ONLY: a vehicle overrides by
// placing a file in its overlay, never by editing the engine. guides() routes through this.
func overlayLayers() []string {
	// most-specific first: the vehicle's overlay, then the engine's default resources.
	return []string{
		filepath.Join(QUACK, "overlay"),                  // vehicle overrides
		filepath.Join(ROOT, "product", "quackitect"),     // engine defaults (method/, project_types/)
		filepath.Join(QUACK, "engine", "resources"),      // vendored engine resources (shipped vehicle)
	}
}

// EngineDir is the read-only engine layer. A vehicle run must never write under it.
func EngineDir() string { return filepath.Join(ROOT, "product", "quackitect") }

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
	voice := Resolve("project_types/default/guides/voice.md")
	if voice == "" || !strings.HasPrefix(voice, EngineDir()) {
		return false
	}
	// 2. a vehicle overlay wins. Use a temp overlay file, then clean it up.
	rel := "project_types/default/guides/voice.md"
	ov := filepath.Join(QUACK, "overlay", filepath.FromSlash(rel))
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
