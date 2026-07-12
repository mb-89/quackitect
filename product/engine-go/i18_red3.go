package main

// i18_red3.go — the vehicle-drives-stub chain (req-vehicle-drives-stub), end to end.
// One hermetic walk of the owner's field case: a vehicle with COMMITTED method
// extensions creates a stub, the stub resolves the vehicle's merged methods, and
// the machine-global engine pointer survives untouched.

import (
	"context"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"
)

var i18cTests = []namedTest{
	{"vehicle-chain", selftestVehicleChain},
}

// test-vehicle-chain -> selftest:vehicle-chain
// The chain, in the order the owner drives it (hermetic home, subprocessed binary):
//  1. scaffold a vehicle; commit a NEW method file and an OVERRIDE of an engine file
//     into its declared overlay (statement 1), plus the hijack shape — a bare
//     product/quackitect/method dir — that stole the pointer live (statement 3);
//  2. the vehicle creates a stub — ungated scaffolding — and the stub's data home
//     records the vehicle as its engine home (statement 2);
//  3. the stub resolves BOTH committed files from the vehicle, engine copy loses;
//  4. the stub drives a full-graph command clean;
//  5. the hermetic home's machine-global pointer was never captured (statement 3).
func selftestVehicleChain() bool {
	tmp, err := os.MkdirTemp("", "qvch")
	if err != nil {
		return false
	}
	defer os.RemoveAll(tmp)
	vehicle := filepath.Join(tmp, "vech")
	if initVehicleFiles(vehicle) != nil {
		return false
	}
	// the committed overlay: a file the engine layer does NOT have, and an override
	// of one it does (precedence must flip to the vehicle's copy).
	ovPrompts := filepath.Join(vehicle, "product", "vech", "method", "prompts")
	if os.MkdirAll(ovPrompts, 0o755) != nil {
		return false
	}
	os.WriteFile(filepath.Join(ovPrompts, "probe-vehicle.md"), []byte("# probe-vehicle\nTHE VEHICLE'S OWN COMMITTED METHOD\n"), 0o644)
	os.WriteFile(filepath.Join(ovPrompts, "note.md"), []byte("# note (vehicle override)\n"), 0o644)
	// the live hijack's shape: a committed override under the ENGINE's own method path.
	// The tightened self-heal (isEngineRepo) must NOT let this capture the pointer.
	os.MkdirAll(filepath.Join(vehicle, "product", "quackitect", "method"), 0o755)

	exe, err := os.Executable()
	if err != nil {
		return false
	}
	home := filepath.Join(tmp, "home")
	env := append(os.Environ(), "QUACK_RATCHETED=1", "LOCALAPPDATA="+home, "XDG_DATA_HOME="+home)
	ctx, cancel := context.WithTimeout(context.Background(), 50*time.Second)
	defer cancel()
	run := func(dir string, args ...string) (string, bool) {
		cmd := exec.CommandContext(ctx, exe, args...)
		cmd.Dir = dir
		cmd.Env = env
		out, err := cmd.CombinedOutput()
		return string(out), err == nil
	}

	// the vehicle creates a stub: ungated (a fresh workspace has no attest session).
	stub := filepath.Join(tmp, "stub")
	if _, ok := run(vehicle, "--base", vehicle, "start", "stubs", stub); !ok {
		return false
	}
	// the stub's data home (under the HERMETIC base) records the vehicle as its engine home.
	stubHome := filepath.Join(home, "quackitect", filepath.Base(stub)+"-"+h12(canonicalWorkspacePath(stub))[:6])
	rec, err := os.ReadFile(filepath.Join(stubHome, "engine-home.txt"))
	if err != nil || canonicalWorkspacePath(strings.TrimSpace(string(rec))) != canonicalWorkspacePath(vehicle) {
		return false
	}
	// the stub resolves the vehicle's committed method — the new file exists only there…
	out, ok := run(stub, "--base", stub, "resolve", "method/prompts/probe-vehicle.md")
	if !ok || canonicalWorkspacePath(strings.TrimSpace(out)) !=
		canonicalWorkspacePath(filepath.Join(ovPrompts, "probe-vehicle.md")) {
		return false
	}
	// …and the override BEATS the vendored engine copy (precedence, not mere existence).
	out, ok = run(stub, "--base", stub, "resolve", "method/prompts/note.md")
	if !ok || canonicalWorkspacePath(strings.TrimSpace(out)) !=
		canonicalWorkspacePath(filepath.Join(ovPrompts, "note.md")) {
		return false
	}
	// the stub drives a full-graph command clean through the vehicle's engine.
	out, ok = run(stub, "--base", stub, "status")
	if !ok || strings.Contains(out, "STRICT") || !strings.Contains(out, "gates |") {
		return false
	}
	// the vehicle never captured the machine-global pointer: no .src record was minted.
	srcs, _ := filepath.Glob(filepath.Join(home, "quackitect", "bin", "*.src"))
	return len(srcs) == 0
}
