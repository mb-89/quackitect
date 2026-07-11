package main

// i17_red3.go — the apply-manifest red probe. Test first, it FAILS until the build.
// test-apply-manifest -> selftest:apply-manifest

import (
	"os"
	"path/filepath"
	"strings"
)

var i17cTests = []namedTest{
	{"apply-manifest", selftestApplyManifest},
}

func selftestApplyManifest() bool {
	if _, ok := registeredCmds["apply"]; !ok {
		return false // the verb is wired
	}
	dir, err := os.MkdirTemp("", "q17a")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	f := filepath.Join(dir, "a.txt")
	esc := strings.ReplaceAll(f, "\\", "\\\\")
	man := filepath.Join(dir, "m.json")

	os.WriteFile(f, []byte("alpha beta gamma\n"), 0o644)
	os.WriteFile(man, []byte(`[{"file":"`+esc+`","old":"beta","new":"BETA"}]`), 0o644)
	if err := applyManifest(man, true); err != nil {
		return false // dry-run accepts a valid manifest...
	}
	if raw, _ := os.ReadFile(f); string(raw) != "alpha beta gamma\n" {
		return false // ...and changes nothing
	}
	if err := applyManifest(man, false); err != nil {
		return false
	}
	if raw, _ := os.ReadFile(f); string(raw) != "alpha BETA gamma\n" {
		return false // the edit landed byte-exactly
	}

	os.WriteFile(f, []byte("dup dup\n"), 0o644)
	os.WriteFile(man, []byte(`[{"file":"`+esc+`","old":"dup","new":"one"}]`), 0o644)
	if applyManifest(man, false) == nil {
		return false // two matches -> refused
	}
	if raw, _ := os.ReadFile(f); string(raw) != "dup dup\n" {
		return false // refusal applies NOTHING
	}

	os.WriteFile(man, []byte(`[{"file":"`+esc+`","old":"absent","new":"x"},{"file":"`+esc+`","old":"dup dup","new":"solo"}]`), 0o644)
	if applyManifest(man, false) == nil {
		return false // one bad edit refuses the WHOLE manifest
	}
	if raw, _ := os.ReadFile(f); string(raw) != "dup dup\n" {
		return false // no partial application
	}
	return true
}
