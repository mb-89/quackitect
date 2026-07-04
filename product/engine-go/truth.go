package main

import (
	"errors"
	"os"
	"path/filepath"
)

// design: go-truth-in-spec  implements: req-truth-in-spec, req-root-marker, req-clean-status
// Recorded truth lives in the repository, under spec/ (adr-no-quack-data-home): the attest ledger
// and the EARS baseline in spec/ledger/, the iteration settings in spec/project.toml — which is
// also the workspace ROOT MARKER (committed, present in every quackitect repo by construction; the
// legacy .quack marker stays a fallback for not-yet-migrated vehicles). Engine writes into the repo
// are exactly the deliberate truth mutations (bless, red-observed, baseline re-record, version
// pointer); every regenerable artifact targets the user data home instead, so git status stays
// clean on any other command. Machine-local overrides come from the ONE global user config.
func ledgerDir() string { return filepath.Join(SPEC, "ledger") }

func projectTomlPath() string { return filepath.Join(SPEC, "project.toml") }

// findWorkspaceRoot walks up from start to the nearest dir holding spec/project.toml.
// No marker is a loud error, never a silent cwd fallback.
func findWorkspaceRoot(start string) (string, error) {
	d, err := filepath.Abs(start)
	if err != nil {
		return "", err
	}
	for {
		if _, err := os.Stat(filepath.Join(d, "spec", "project.toml")); err == nil {
			return d, nil
		}
		p := filepath.Dir(d)
		if p == d {
			return "", errors.New("no spec/project.toml above " + start)
		}
		d = p
	}
}

// readProjectConfig: iteration settings from spec/project.toml (legacy .quack/config.toml until a
// workspace migrates), overlaid with machine-local overrides from the global user config.
func readProjectConfig() Config {
	var cfg Config
	if _, err := os.Stat(projectTomlPath()); err == nil {
		cfg = ReadConfig(projectTomlPath())
	} else {
		cfg = ReadConfig(filepath.Join(QUACK, "config.toml"))
	}
	if g := ReadConfig(globalConfigPath()); g.LogsDir != "" {
		cfg.LogsDir = g.LogsDir
	}
	return cfg
}

// enddesign
