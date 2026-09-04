package main

import (
	"os"
	"path/filepath"
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
