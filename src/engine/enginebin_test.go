package main

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"testing"
)

// ONE BUILD FOR THE WHOLE PACKAGE, BECAUSE THIRTY-FIVE OF THEM IS THE SUITE.
//
// Tests that drive a verb through the binary are right to: a Go test passes
// against a package that registers no verb at all. But each helper built its
// own copy into its own t.TempDir(), and the suite paid for it thirty-five
// times. Linking this engine costs about 1.7 seconds and the build cache
// cannot take that away, because what is cached is compilation and what is
// slow is the link. Sixty of the suite's hundred and ten seconds went on
// producing thirty-five identical files.
//
// The binary is READ-ONLY to every test that uses it: it is executed, never
// written to and never asked where it lives. So one copy serves them all.
//
// A TEST THAT NEEDS ITS OWN BUILD STILL BUILDS ITS OWN. This is a fixture for
// the ordinary case, not a rule that there is only one engine. A test that
// varies build flags, or that wants the binary somewhere specific, calls
// exec.Command("go", "build", ...) itself and says in a comment why.
var sharedEngine string

// TestMain builds the engine once, runs the suite, and takes the build away.
func TestMain(m *testing.M) {
	dir, err := os.MkdirTemp("", "se-engine")
	if err != nil {
		fmt.Fprintf(os.Stderr, "the engine fixture has nowhere to build: %v\n", err)
		os.Exit(1)
	}
	sharedEngine = filepath.Join(dir, exeName("se"))
	if out, err := exec.Command("go", "build", "-o", sharedEngine, ".").CombinedOutput(); err != nil {
		// THE SUITE STOPS RATHER THAN RUNNING WITHOUT IT. Every test that
		// wanted the binary would fail one by one and the reason would be
		// read thirty-five times.
		fmt.Fprintf(os.Stderr, "the engine will not build, so no test can drive it: %v\n%s", err, out)
		os.RemoveAll(dir)
		os.Exit(1)
	}
	code := m.Run()
	os.RemoveAll(dir)
	os.Exit(code)
}

// theEngine answers the path to the built engine every test shares.
func theEngine(t *testing.T) string {
	t.Helper()
	if sharedEngine == "" {
		t.Fatal("the engine fixture was not built, so this test cannot drive it")
	}
	return sharedEngine
}
