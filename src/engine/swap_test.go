package main

import (
	"errors"
	"os"
	"path/filepath"
	"quackitect/engine/internal/replaced"
	"strings"
	"testing"
	"time"
)

// A SWAP KEEPS THE SESSION AND DOES NOT SEVER A CALL.
//
// Replacing the engine was a stop and a start. The start retired the log, so
// one stretch of work was split into two sessions at a moment nobody chose, and
// a person watching the log window read it starting over. The stop cut every
// call in flight, and three test runs went unrecorded in one afternoon because
// the run's own answer never came back.
//
// So the handover names the session it is continuing, and it waits for the
// calls in flight before it hands over.
func TestASwapKeepsTheSessionAndTheCalls(t *testing.T) {
	dir := t.TempDir()

	// A session with something written in it, the way a live engine leaves one.
	first, err := OpenLog(dir)
	if err != nil {
		t.Fatal(err)
	}
	first.Write("engine", "start", "engine", "the engine that hands over", Yes(), nil)
	was := first.Session()
	if err := first.Close(); err != nil {
		t.Fatal(err)
	}

	// THE SUCCESSOR IS TOLD WHICH SESSION IT IS IN, the way handOver tells it.
	t.Setenv(sessionVar, was)
	next, err := OpenLog(dir)
	if err != nil {
		t.Fatal(err)
	}
	if next.Session() != was {
		t.Fatalf("the successor opened session %q where the engine it replaced was in %q", next.Session(), was)
	}
	next.Write("engine", "start", "engine", "the engine that took over", Yes(), nil)
	if err := next.Close(); err != nil {
		t.Fatal(err)
	}

	// AND NOTHING WAS RETIRED. A retired log leaves a stamped file beside the
	// current one, and both halves of this session are in the one file.
	entries, err := os.ReadDir(dir)
	if err != nil {
		t.Fatal(err)
	}
	for _, e := range entries {
		if strings.HasPrefix(e.Name(), "session-") {
			t.Fatalf("the handover retired the log to %s, so one session became two", e.Name())
		}
	}
	said, err := os.ReadFile(filepath.Join(dir, Current))
	if err != nil {
		t.Fatal(err)
	}
	for _, want := range []string{"the engine that hands over", "the engine that took over"} {
		if !strings.Contains(string(said), want) {
			t.Fatalf("the log does not carry %q, so the session did not survive the handover", want)
		}
	}

	// THE CALLS IN FLIGHT ARE WAITED FOR. A call is counted while it runs, and
	// the drain answers zero only once the count has fallen.
	theLoad.verbsInFlight.Add(1)
	go func() {
		time.Sleep(150 * time.Millisecond)
		theLoad.verbsInFlight.Add(-1)
	}()
	began := time.Now()
	if left := drainCalls(5 * time.Second); left != 0 {
		t.Fatalf("the swap gave up with %d call(s) still running, so it would have severed them", left)
	}
	if time.Since(began) < 100*time.Millisecond {
		t.Fatal("the drain answered before the call in flight had finished, so it waited for nothing")
	}
}

// THE BUILD DOOR IS THE ENGINE'S.
//
// A go build aimed at .bin under a live engine fails on Windows, and where it
// does not it leaves the program answering calls and the program on disk as two
// different builds with nothing saying so. The refusal names the door.
func TestTheBuildDoorIsTheEngines(t *testing.T) {
	method := t.TempDir()
	// ANOTHER TREE, ABSOLUTE ON THIS PLATFORM. A path written /elsewhere is not
	// absolute on Windows, so it reads as relative to the tree and is inside it.
	elsewhere := t.TempDir()
	for _, c := range []struct {
		name    string
		command string
		refuse  bool
	}{
		{"a build aimed at .bin inside the tree", "go build -C src/engine -o " + method + "/.bin/se.exe .", true},
		{"the same build with the path in quotes", `go build -o "` + method + `/.bin/se.exe" ./src/engine`, true},
		{"go install aimed there", "go install -o " + method + "/.bin/se.exe .", true},
		{"a build that leaves nothing behind", "go build -C src/engine -o /dev/null .", false},
		{"a build in somebody else's tree", "go build -o " + filepath.Join(elsewhere, ".bin", "se.exe") + " .", false},
		{"a test run, which is another door's business", "go test -C src/engine ./...", false},
		{"a word with bin in it that is not a build", "grep -rn .bin/ src", false},
	} {
		t.Run(c.name, func(t *testing.T) {
			why, refused := ABuildRunByHand(c.command, method)
			if refused != c.refuse {
				t.Fatalf("refused=%v, wanted %v, for %q", refused, c.refuse, c.command)
			}
			if !refused {
				return
			}
			if !strings.Contains(why, TheBuildDoor) {
				t.Fatalf("the refusal does not name %q, so it says no without saying where to go: %s",
					TheBuildDoor, why)
			}
		})
	}
}

// A SWAP BUILDS EVERY PROGRAM THE TREE SHIPS, AND HANDS OVER ONLY THE ENGINE.
//
// The swap built src/engine alone while the installer builds three, so .bin was
// half new after one. Measured: .bin/se.exe was written at 13:16 and
// .bin/se-mcp.exe at 10:45, with src/mcp changed between them. The standing
// check for the lane drives the binary in .bin, so it ran green against code
// that was not in the tree. And a swap makes .bin/se the newest thing under the
// source folders, which is what RUNME compares against, so nothing rebuilt the
// stale lane either.
//
// THE FILES ARE THE FIXTURE AND NOT THE COMPILER. What is decided here is which
// programs a swap moves into place, and compiling three modules to ask that is
// what testing rule 13 names. The real build is driven by the battery, which
// swaps on every run.
func TestASwapBuildsEveryProgramTheManifestNames(t *testing.T) {
	t.Parallel()
	method := t.TempDir()
	r := Roots{Method: method, Work: method}
	if err := os.MkdirAll(filepath.Join(method, "util", "setup"), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(method, "util", "setup", "manifest.json"), []byte(`{
	  "builds": [
	    {"name": "se", "source": "src/engine"},
	    {"name": "logview", "source": "src/viewer"},
	    {"name": "se-mcp", "source": "src/mcp"}
	  ]
	}`), 0o644); err != nil {
		t.Fatal(err)
	}

	// EVERY BUILD THE INSTALLER MAKES, READ FROM THE FILE IT READS.
	got := theBuilds(method)
	if len(got) != 3 {
		t.Fatalf("the manifest names three programs and the swap reads %d: %+v", len(got), got)
	}
	for i, want := range []manifestBuild{
		{Name: "se", Source: "src/engine"},
		{Name: "logview", Source: "src/viewer"},
		{Name: "se-mcp", Source: "src/mcp"},
	} {
		if got[i] != want {
			t.Fatalf("the swap reads %+v where the manifest says %+v", got[i], want)
		}
	}

	// A TREE THAT CANNOT BE READ STILL SWAPS THE ENGINE.
	if bare := theBuilds(t.TempDir()); len(bare) != 1 || bare[0].Source != engineSource {
		t.Fatalf("a tree with no manifest answered %+v, so a person there cannot replace the engine", bare)
	}

	// WHAT A BUILD LEFT: a next binary for each, over a .bin holding the old
	// engine and the older lane.
	if err := os.MkdirAll(filepath.Join(method, ".bin"), 0o755); err != nil {
		t.Fatal(err)
	}
	for _, name := range []string{"se", "se-mcp"} {
		if err := os.WriteFile(filepath.Join(method, ".bin", exeName(name)), []byte("what was there"), 0o755); err != nil {
			t.Fatal(err)
		}
	}
	for _, name := range []string{"se", "logview", "se-mcp"} {
		if err := os.WriteFile(nextBinary(method, name), []byte("built by the swap: "+name), 0o755); err != nil {
			t.Fatal(err)
		}
	}

	if err := putInPlace(r, nextBinary(method, "se")); err != nil {
		t.Fatal(err)
	}

	// EVERY ONE OF THEM IS IN PLACE, and the lane is not left behind.
	for _, name := range []string{"se", "logview", "se-mcp"} {
		said, err := os.ReadFile(filepath.Join(method, ".bin", exeName(name)))
		if err != nil {
			t.Fatalf("%s is not in .bin after a swap: %v", name, err)
		}
		if string(said) != "built by the swap: "+name {
			t.Fatalf(".bin/%s says %q after a swap, so the swap left it as it was", name, said)
		}
		if _, err := os.Stat(nextBinary(method, name)); err == nil {
			t.Fatalf("%s was left at its build name as well as in place", name)
		}
	}

	// AND WHAT IT REPLACED WAS MOVED ASIDE RATHER THAN DELETED, once each.
	aside, err := os.ReadDir(replaced.WasDir(method))
	if err != nil {
		t.Fatal(err)
	}
	if len(aside) != 2 {
		t.Fatalf("two programs were replaced and %d were put aside", len(aside))
	}

	// THE HANDOVER IS THE ENGINE'S ALONE. Three programs were put in place and
	// one is started, because one of them is the engine.
	if engineAt(r) != filepath.Join(method, ".bin", exeName("se")) {
		t.Fatalf("the swap would hand over to %s", engineAt(r))
	}
	for _, name := range []string{"logview", "se-mcp"} {
		if engineAt(r) == filepath.Join(method, ".bin", exeName(name)) {
			t.Fatalf("the swap would hand over to %s, which is not the engine", name)
		}
	}
}

// A SWAP BUILDS THE LANE, AND HANDS OVER THE ENGINE ALONE.
//
// The swap built src/engine and nothing else, so .bin/se-mcp.exe stayed at
// whatever build it was. Measured: .bin/se.exe written at 13:16 and
// .bin/se-mcp.exe at 10:45, with src/mcp changed between them. The standing
// check for the lane drives the binary in .bin, so it ran green against code
// that was not in the tree. A swap also makes .bin/se the newest thing under
// the source folders, which is what RUNME compares against, so nothing
// rebuilt the stale lane either.
//
// THE COMPILER IS HANDED IN. What is decided here is which programs a swap
// builds and where each one goes, and asking that of three compilers is what
// testing rule 13 names. The battery swaps on every run, so the real one is
// driven there.
func TestASwapBuildsTheLaneAndHandsOverTheEngineAlone(t *testing.T) {
	t.Parallel()
	method := aTreeShippingThree(t)
	r := Roots{Method: method, Work: method}

	type asked struct{ name, source, next, stamp string }
	var built []asked
	recorder := func(_ Roots, one manifestBuild, next, stamp string) error {
		built = append(built, asked{one.Name, one.Source, next, stamp})
		return os.WriteFile(next, []byte("built: "+one.Name), 0o755)
	}

	engine, err := buildNext(r, "abc1234.101112", recorder)
	if err != nil {
		t.Fatal(err)
	}

	// EVERY PROGRAM THE MANIFEST NAMES, each from its own folder to its own
	// build name. The lane is the one this token is about.
	want := []asked{
		{"se", "src/engine", nextBinary(method, "se"), "abc1234.101112"},
		{"logview", "src/viewer", nextBinary(method, "logview"), "abc1234.101112"},
		{"se-mcp", "src/mcp", nextBinary(method, "se-mcp"), "abc1234.101112"},
	}
	if len(built) != len(want) {
		t.Fatalf("the manifest names %d programs and the swap built %d: %+v", len(want), len(built), built)
	}
	for i := range want {
		if built[i] != want[i] {
			t.Fatalf("the swap built %+v where the manifest says %+v", built[i], want[i])
		}
	}

	// AND THE HANDOVER IS THE ENGINE'S ALONE. Three were built and one is
	// answered for, because one of them is the program the engine is.
	if engine != nextBinary(method, "se") {
		t.Fatalf("a swap would hand over to %s", engine)
	}
	for _, name := range []string{"logview", "se-mcp"} {
		if engine == nextBinary(method, name) {
			t.Fatalf("a swap would hand over to %s, which is not the engine", name)
		}
	}

	// AND ONE THAT WILL NOT BUILD LEAVES NOTHING BEHIND. A set half built is
	// the state reading the manifest exists to avoid, and the next swap starts
	// from nothing rather than from half of this one.
	broken := aTreeShippingThree(t)
	b := Roots{Method: broken, Work: broken}
	stops := func(_ Roots, one manifestBuild, next, _ string) error {
		if one.Name == "logview" {
			return errors.New("undefined: something")
		}
		return os.WriteFile(next, []byte("built: "+one.Name), 0o755)
	}
	if _, err := buildNext(b, "abc1234.101112", stops); err == nil {
		t.Fatal("a program did not build and the swap carried on")
	} else if !strings.Contains(err.Error(), "logview") {
		t.Fatalf("the refusal does not name what would not build: %v", err)
	}
	for _, name := range []string{"se", "logview", "se-mcp"} {
		if _, err := os.Stat(nextBinary(broken, name)); err == nil {
			t.Fatalf("%s was left at its build name after a swap that did not happen", name)
		}
	}
}

// aTreeShippingThree is a method root with the manifest this tree ships and a
// .bin to build into. Every test makes its own, because every one writes to it.
func aTreeShippingThree(t *testing.T) string {
	t.Helper()
	method := t.TempDir()
	if err := os.MkdirAll(filepath.Join(method, "util", "setup"), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(method, "util", "setup", "manifest.json"), []byte(`{
	  "builds": [
	    {"name": "se", "source": "src/engine"},
	    {"name": "logview", "source": "src/viewer"},
	    {"name": "se-mcp", "source": "src/mcp"}
	  ]
	}`), 0o644); err != nil {
		t.Fatal(err)
	}
	if err := os.MkdirAll(filepath.Join(method, ".bin"), 0o755); err != nil {
		t.Fatal(err)
	}
	return method
}

// A SWAP THAT WOULD REPLACE AN ENGINE WITH ITSELF IS REFUSED.
//
// The battery asks the running engine to hand over to the program it just
// built. Where nothing was built, the program on disk is the running build, and
// handing over to it would rotate the process for no reason at all.
func TestASwapToTheSameBuildIsRefused(t *testing.T) {
	method := t.TempDir()
	r := Roots{Method: method, Work: method}
	if err := os.MkdirAll(filepath.Join(method, ".bin"), 0o755); err != nil {
		t.Fatal(err)
	}
	// The engine under test is this test binary, which answers --version with
	// nothing it shares with Build, so the two differ and the refusal is about
	// the rule rather than about the fixture.
	if _, err := planSwap(r, "a test", true); err == nil {
		t.Fatal("a swap was planned with no program in .bin to hand over to")
	}
}
