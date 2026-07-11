package main

import (
	"fmt"
	"os"
	"path/filepath"
	"runtime"
	"strings"
)

// design: go-data-home  implements: req-state-layout.3, req-state-layout.6, req-state-layout.2
// One user-scoped data home per WORKSPACE (adr-no-quack-data-home): <base>/quackitect/<slug>/<kind>
// with kind subfolders (logs, notes, evidence, gather, overlay, out, golden, spikes) — one deletable
// dir per workspace, so the amnesia test is a single rm -rf. The slug hashes the CANONICAL workspace
// path — absolute, symlink-resolved where possible, separator-normalized, case-folded on Windows —
// so PowerShell (C:\...) and git-bash (c:/...) resolve the SAME home.
// Machine-local overrides live in ONE global user config (<base>/quackitect/config.toml), never
// per-repo — a per-repo override stored in the directory it overrides was the chicken-egg.
// Every regenerable artifact routes through dataDirFor (evidence, gather, overlay, out, golden,
// spikes, logs, notes): the repo carries NO cache state and .quack is gone (req-state-layout.2);
// selftest:clean-status holds the invariant.
func canonicalWorkspacePath(p string) string {
	if abs, err := filepath.Abs(p); err == nil {
		p = abs
	}
	if resolved, err := filepath.EvalSymlinks(p); err == nil {
		p = resolved
	}
	p = filepath.ToSlash(filepath.Clean(p))
	if runtime.GOOS == "windows" {
		p = strings.ToLower(p)
	}
	return p
}

func userDataBase() string {
	base := os.Getenv("LOCALAPPDATA")
	if runtime.GOOS != "windows" || base == "" {
		if x := os.Getenv("XDG_DATA_HOME"); x != "" {
			base = x
		} else {
			home, _ := os.UserHomeDir()
			base = filepath.Join(home, ".local", "share")
		}
	}
	return base
}

// globalBinPath is the ONE global binary's home (adr-global-ratchet); the ratchet
// machinery that swaps it lives in go-global-ratchet.
func globalBinPath() string {
	return filepath.Join(userDataBase(), "quackitect", "bin", brand()+".exe")
}

// engineSrcPointer is the file beside the global binary recording WHERE the engine home
// (the repo carrying the resource layer) lives. Resources resolve LIVE from there — never
// a copy, never drift: editing the repo's resources changes them
// for every stub workspace on the machine. Build and the ratchet re-record it.
func engineSrcPointer() string { return globalBinPath() + ".src" }

func recordEngineHome(root string) error {
	if !hasEngineLayer(root) {
		return fmt.Errorf("no resource layer at %s", root)
	}
	if err := os.MkdirAll(filepath.Dir(engineSrcPointer()), 0o755); err != nil {
		return err
	}
	return os.WriteFile(engineSrcPointer(), []byte(root+"\n"), 0o644)
}

func recordedEngineHome() string {
	raw, err := os.ReadFile(engineSrcPointer())
	if err != nil {
		return ""
	}
	return strings.TrimSpace(string(raw))
}

// enddesign

// design: go-home-marker  implements: req-selftest-home-sweep
// Every data home records its workspace (workspace.txt), so a sweep can map a home back to
// the directory it serves. Fixture homes leak by the hundreds otherwise - a home whose workspace no
// longer exists is an orphan the selftest battery removes (sweepOrphanHomes).
var homeStamped bool

func dataHome() string {
	slug := filepath.Base(ROOT) + "-" + h12(canonicalWorkspacePath(ROOT))[:6]
	home := filepath.Join(userDataBase(), "quackitect", slug)
	if !homeStamped {
		mp := filepath.Join(home, "workspace.txt")
		if _, err := os.Stat(mp); err == nil {
			homeStamped = true
		} else if os.MkdirAll(home, 0o755) == nil &&
			os.WriteFile(mp, []byte(canonicalWorkspacePath(ROOT)+"\n"), 0o644) == nil {
			homeStamped = true
		}
	}
	return home
}

// enddesign

func dataDirFor(kind string) string {
	return filepath.Join(dataHome(), kind)
}

func goldenRootPath() string {
	return filepath.Join(dataDirFor("golden"), "golden-root.txt")
}

func globalConfigPath() string {
	return filepath.Join(userDataBase(), "quackitect", "config.toml")
}

// enddesign
