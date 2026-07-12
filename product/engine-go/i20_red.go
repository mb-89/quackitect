package main

import (
	"os"
	"path/filepath"
	"strings"
)

// i20_red.go — this iteration's checks, in battery order (selftestRegistry in
// selftest.go concatenates the per-file slices EXPLICITLY; this file owns i20Tests).

var i20Tests = []namedTest{
	{"cold-run-fixes", selftestColdRunFixes},
}

// selftest:cold-run-fixes — proves the i0020 cold-run fix batch (test-cold-run-fixes;
// req-go-port, req-connections-lanes). Five sub-claims, all mechanizable:
//  1. the go-bin shim ships next to the engine source (product/tools/go.cmd in the
//     dogfood repo; tools/vendor/tools/go.cmd in a vendored vehicle) — adr-shim-product-tools
//  2. the scaffolded vehicle launcher wires the vendored shim dir onto PATH
//  3. `start init` scaffolds edges="connections" — adr-scaffold-edges-connections
//  4. the stub spec template carries no trace-entering example nodes and no example
//     edges (ex-need / ex-usecase flipped a live board red; strict refused after cleanup)
//  5. defer and retire are registered commands (the documented reaches exist), and the
//     config home resolves through the engine layer (vehicle-safe; vacuous in dogfood)
func selftestColdRunFixes() bool {
	// 1. the shim ships where launchers point.
	shim := filepath.Join(filepath.Dir(EngineSrc()), "tools", "go.cmd")
	if _, err := os.Stat(shim); err != nil {
		return false
	}
	// 2. the vehicle launcher template puts the vendored shim dir on PATH.
	if !strings.Contains(vehicleLauncherTmpl, `tools\vendor\tools`) {
		return false
	}
	// 3. init's root marker defaults the connections lane.
	if !strings.Contains(vehicleTomlTmpl, `edges = "connections"`) {
		return false
	}
	// 4. the stub template holds no trace-entering examples.
	tdoc := filepath.Join(EngineDir(), "method", "templates", "documents", "spec")
	for _, dead := range []string{
		filepath.Join(tdoc, "trace", "ex-need.md"),
		filepath.Join(tdoc, "usecases", "ex-usecase.md"),
		filepath.Join(tdoc, "connections", "conflicts-with", "con-conflicts-with--ex-stakeholder--ex-stakeholder-b.md"),
	} {
		if _, err := os.Stat(dead); err == nil {
			return false
		}
	}
	for _, jl := range []string{
		filepath.Join(tdoc, "connections", "refers", "edges.jsonl"),
		filepath.Join(tdoc, "connections", "refines", "edges.jsonl"),
	} {
		if raw, err := os.ReadFile(jl); err == nil && strings.Contains(string(raw), `"ex-`) {
			return false
		}
	}
	// 5. the documented reaches are registered; config resolves through the engine layer.
	if registeredCmds["defer"] == nil || registeredCmds["retire"] == nil {
		return false
	}
	return strings.HasPrefix(configDir(), EngineDir())
}
