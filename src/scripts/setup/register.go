package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"time"
)

// The register says which copies of the method exist on this machine. A copy
// registers where it is cloned. Nothing declares a path in advance, and an
// entry that no longer resolves is skipped rather than treated as an error.

type Entry struct {
	ID         string `json:"id"`
	Version    string `json:"version"`
	MethodRoot string `json:"method_root"`
	Registered string `json:"registered"`
}

// Where the register lives. The environment may name folders, which is how a
// cloud box says where things go. Otherwise it is one place under the home
// folder.
func registerPaths() []string {
	paths := splitPaths(os.Getenv("SE_REGISTRY"))
	if len(paths) == 0 {
		paths = []string{filepath.Join(homeDir(), ".se")}
	}
	return paths
}

func registerEngine(id, version, root string) error {
	var lastErr error
	wrote := false
	for _, dir := range registerPaths() {
		if err := writeRegister(filepath.Join(dir, "registry.json"), id, version, root); err != nil {
			lastErr = err
			continue
		}
		say("  register %s", filepath.Join(dir, "registry.json"))
		wrote = true
	}
	if wrote {
		return nil
	}
	return lastErr
}

func writeRegister(path, id, version, root string) error {
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return err
	}
	entries := ReadRegister(path)
	out := entries[:0:0]
	for _, e := range entries {
		if e.MethodRoot != root {
			out = append(out, e)
		}
	}
	out = append(out, Entry{ID: id, Version: version, MethodRoot: root,
		Registered: time.Now().UTC().Format(time.RFC3339)})
	b, err := json.MarshalIndent(out, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(path, append(b, '\n'), 0o644)
}

// ReadRegister never fails. A register that cannot be read is an empty
// register: one bad entry must not stop the machine from working.
func ReadRegister(path string) []Entry {
	b, err := os.ReadFile(path)
	if err != nil {
		return nil
	}
	var entries []Entry
	if json.Unmarshal(b, &entries) != nil {
		return nil
	}
	out := entries[:0:0]
	for _, e := range entries {
		if e.MethodRoot == "" {
			continue
		}
		if _, err := os.Stat(e.MethodRoot); err != nil {
			continue // an entry that does not resolve is skipped, not an error
		}
		out = append(out, e)
	}
	return out
}
