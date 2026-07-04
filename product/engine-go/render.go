package main

import (
	"bytes"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// design: go-entry-render  implements: req-contract-render, req-render-drift
// Harness entry files are OUTPUTS (adr-entry-render): each is rendered from a per-harness template
// (method/entry/<harness>.tmpl.md) with the verbatim contract body transcluded at {{CONTRACT}} —
// one authored source, zero hand-duplication, so a pointer-blind harness still auto-loads the full
// binding rules. The maintainer renders via `quack render-entry` (and every `quack build`); lint
// re-renders in memory and byte-compares each target, so a hand-edit or a stale render is a loud
// finding, never a silent fork. Renders are trivially deterministic: same template + same contract
// -> identical bytes.
var entryHarnesses = map[string]struct{ tmpl, target string }{
	"agents":  {"AGENTS.tmpl.md", "AGENTS.md"},
	"copilot": {"copilot.tmpl.md", filepath.Join(".github", "copilot-instructions.md")},
}

func renderEntry(harness string) ([]byte, error) {
	h, ok := entryHarnesses[harness]
	if !ok {
		return nil, fmt.Errorf("render-entry: unknown harness %q", harness)
	}
	tmpl, err := os.ReadFile(filepath.Join(EngineDir(), "method", "entry", h.tmpl))
	if err != nil {
		return nil, err
	}
	contract, err := os.ReadFile(attestContractPath())
	if err != nil {
		return nil, err
	}
	t := strings.ReplaceAll(string(tmpl), "\r\n", "\n")
	c := strings.ReplaceAll(string(contract), "\r\n", "\n")
	if !strings.Contains(t, "{{CONTRACT}}") {
		return nil, fmt.Errorf("render-entry: template %s has no {{CONTRACT}} slot", h.tmpl)
	}
	return []byte(strings.ReplaceAll(t, "{{CONTRACT}}", strings.TrimRight(c, "\n"))), nil
}

func entryUpToDate(disk, fresh []byte) bool {
	norm := func(b []byte) []byte { return bytes.ReplaceAll(b, []byte("\r\n"), []byte("\n")) }
	return bytes.Equal(norm(disk), norm(fresh))
}

// entryDrift re-renders every harness and byte-compares the target on disk.
func entryDrift() ([]string, error) {
	var drift []string
	for harness, h := range entryHarnesses {
		fresh, err := renderEntry(harness)
		if err != nil {
			return nil, err
		}
		disk, err := os.ReadFile(filepath.Join(ROOT, h.target))
		if err != nil || !entryUpToDate(disk, fresh) {
			drift = append(drift, h.target)
		}
	}
	return drift, nil
}

func writeEntryFiles() error {
	for harness, h := range entryHarnesses {
		fresh, err := renderEntry(harness)
		if err != nil {
			return err
		}
		target := filepath.Join(ROOT, h.target)
		if err := os.MkdirAll(filepath.Dir(target), 0o755); err != nil {
			return err
		}
		if err := os.WriteFile(target, fresh, 0o644); err != nil {
			return err
		}
		fmt.Println("rendered ->", h.target)
	}
	return nil
}

// enddesign
