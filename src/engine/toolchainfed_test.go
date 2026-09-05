package main

import (
	"fmt"
	"os"
	"strings"
	"sync"
	"testing"
)

// A FED TOOLCHAIN, SO A TEST OF WHICH TESTS THE ENGINE PICKS IS NOT A TEST OF
// THE GO COMPILER.
//
// THE OWNER'S RULING: an expensive external interface is tested once and mocked
// everywhere else, and what is built is built once and reused.
//
// MEASURED. The four slowest tests in this suite were the selection tests, at
// fifteen, fifteen, ten and ten seconds, and every one of them was compiling a
// module and running each of its tests under coverage. What they are about is
// which tests the engine CHOOSES from a delta, which is a decision of ours. The
// compiler answers the same thing every time and takes forty-nine seconds to
// say it.
//
// So this feeds one: it writes the coverage profile the mapper reads, and says
// which lines each test reached, which is the only thing the real toolchain was
// being asked for.
type fedToolchain struct {
	sync.Mutex
	// reaches says which lines of which file a test covered.
	reaches map[string][]string
	builds  int
	runs    int
}

// aFedToolchain feeds the engine a toolchain that compiles nothing. reaches
// maps a test name to the profile lines it should answer with.
func aFedToolchain(t *testing.T, module string, reaches map[string][]string) *fedToolchain {
	t.Helper()
	fed := &fedToolchain{reaches: reaches}
	was := theToolchain
	theToolchain = toolchain{
		buildCover: func(dir, bin string) ([]byte, error) {
			fed.Lock()
			fed.builds++
			fed.Unlock()
			// THE BINARY HAS TO BE THERE, because the caller stats it and
			// reuses it. What is in it is never run: runOne is fed too.
			if err := os.WriteFile(bin, []byte("a binary nothing runs"), 0o755); err != nil {
				return nil, err
			}
			return nil, nil
		},
		buildEngine: func(dir, bin string) ([]byte, error) {
			// THE ENGINE HAS TO BE THERE TOO, because the next run reads its
			// age. Nothing runs it: the test it is handed to is fed as well.
			return nil, os.WriteFile(bin, []byte("an engine nothing runs"), 0o755)
		},
		runOne: func(bin, dir, test, profile string, env []string) ([]byte, error) {
			fed.Lock()
			fed.runs++
			lines := fed.reaches[test]
			fed.Unlock()
			// The profile the mapper reads: mode, then one region per line.
			out := "mode: set\n"
			for _, l := range lines {
				out += module + "/" + l + "\n"
			}
			if err := os.WriteFile(profile, []byte(out), 0o644); err != nil {
				return nil, err
			}
			if strings.HasPrefix(test, "TestFails") {
				return []byte("--- FAIL: " + test), fmt.Errorf("it failed")
			}
			return []byte("ok"), nil
		},
	}
	t.Cleanup(func() { theToolchain = was })
	return fed
}

// THE ONE TEST THAT DRIVES THE REAL GO TOOLCHAIN.
//
// Everything above feeds one, so this is the only place the contract between
// this engine and the compiler is checked: that a cover binary really builds,
// that running one test under it really produces a profile, that the regions
// come back naming the lines that test reached, and that the engine measures
// how long it took.
//
// IT IS ONE TEST BECAUSE THE COMPILER ANSWERS THE SAME THING EVERY TIME. Four
// tests were driving it and cost forty-nine seconds between them to check a
// decision that is ours, not the compiler's.
func TestTheMapIsBuiltByTheRealGo(t *testing.T) {
	if testing.Short() {
		t.Skip("this one drives the compiler, which is what the rest are fed to avoid")
	}
	r, _ := aTreeWithTests(t)
	// THE REAL ONE, put back over the fed one the fixture installs. The
	// fixture's own Cleanup restores whatever was there before it.
	theToolchain = realToolchain()
	db := openTheIndex(t, r)

	var regions int
	if err := db.QueryRow("SELECT count(*) FROM test_region").Scan(&regions); err != nil {
		t.Fatal(err)
	}
	if regions == 0 {
		t.Fatal("the real toolchain mapped no regions, so nothing here maps a test to the lines it reached")
	}

	// A TEST THE DELTA REACHES RUNS, AND THE ENGINE SAYS HOW LONG IT TOOK.
	got, err := TestTheDelta(r, db, "", []string{"TestA"}, true, "worker-one")
	if err != nil {
		t.Fatal(err)
	}
	if len(got.Ran) == 0 || !got.Ran[0].OK {
		t.Fatalf("a real run answered %+v", got.Ran)
	}
	if got.Ran[0].Seconds <= 0 {
		t.Fatal("a real run reported no time, so nothing here measures what a test costs")
	}
}
