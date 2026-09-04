package main

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
)

// THE ENGINE OWNS THE TESTS. An agent hands it a delta and a proposal; the
// engine reads which lines changed, asks the index which tests reach them,
// and runs those. These tests build a small module of their own with two
// functions and two tests, one per function, so a change to one function
// is a delta exactly one test reaches.

// padTests is how many tests the fixture carries beyond TestA and TestB,
// each reaching B, so the suite is big enough for the share rule to mean
// anything and a change to A still reaches exactly one test.
const padTests = 20

// aTreeWithTests is a git repository holding a Go module with lib.go and
// lib_test.go, committed, indexed, and with every test mapped. It costs a
// cover build and a run per test, so a test takes it once.
func aTreeWithTests(t *testing.T) (Roots, string) {
	t.Helper()
	dir := t.TempDir()
	r := Roots{Method: dir, Work: dir}
	lib := "package lib\n\n" +
		"func A() int {\n\treturn 1\n}\n\n" +
		"func B() int {\n\treturn 2\n}\n"
	test := "package lib\n\nimport \"testing\"\n\n" +
		"func TestA(t *testing.T) {\n\tif A() != 1 {\n\t\tt.Fatal(\"A\")\n\t}\n}\n\n" +
		"func TestB(t *testing.T) {\n\tif B() != 2 {\n\t\tt.Fatal(\"B\")\n\t}\n}\n"
	for i := 1; i <= padTests; i++ {
		test += fmt.Sprintf("\nfunc TestPad%d(t *testing.T) {\n\tif B() != 2 {\n\t\tt.Fatal(\"B\")\n\t}\n}\n", i)
	}
	for name, text := range map[string]string{"go.mod": "module example.com/lib\n\ngo 1.27\n", "lib.go": lib, "lib_test.go": test} {
		if err := os.WriteFile(filepath.Join(dir, name), []byte(text), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	git := func(args ...string) {
		t.Helper()
		cmd := exec.Command("git", args...)
		cmd.Dir = dir
		cmd.Env = append(os.Environ(), "GIT_AUTHOR_NAME=t", "GIT_AUTHOR_EMAIL=t@t", "GIT_COMMITTER_NAME=t", "GIT_COMMITTER_EMAIL=t@t")
		if out, err := cmd.CombinedOutput(); err != nil {
			t.Fatalf("git %v: %v\n%s", args, err, out)
		}
	}
	git("init", "-q")
	git("add", "-A")
	git("commit", "-q", "-m", "the tree as it was")
	db, err := openIndex(r)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { db.Close() })
	if _, err := Reindex(r, db); err != nil {
		t.Fatal(err)
	}
	mapped, failed, err := mapMissing(r, db, nil)
	if err != nil || failed != 0 || mapped != 2+padTests {
		t.Fatalf("mapping the tests: mapped %d, failed %d, %v", mapped, failed, err)
	}
	return r, dir
}

func changeA(t *testing.T, dir string) {
	t.Helper()
	b, _ := os.ReadFile(filepath.Join(dir, "lib.go"))
	changed := strings.Replace(string(b), "return 1", "return 1 + 0", 1)
	if err := os.WriteFile(filepath.Join(dir, "lib.go"), []byte(changed), 0o644); err != nil {
		t.Fatal(err)
	}
}

func openTheIndex(t *testing.T, r Roots) *sql.DB {
	t.Helper()
	db, err := openIndex(r)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { db.Close() })
	return db
}

// A NAME RUNS, EVEN UNDER A WHOLE RULING. The usage promises a proposed name
// runs, and the owner watched three proposals drown in the whole battery,
// which then stopped the engine mid-answer. The whole ruling stays in the
// answer as owed; what runs is what was named.
func TestANamedProposalOutrunsTheWholeBattery(t *testing.T) {
	t.Parallel()
	r, dir := aTreeWithTests(t)
	db := openTheIndex(t, r)

	// A whole trigger enters the delta: a check changes.
	if err := os.MkdirAll(filepath.Join(dir, "util", "checks"), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(dir, "util", "checks", "probe.mjs"), []byte("// a check\n"), 0o644); err != nil {
		t.Fatal(err)
	}

	// Unproposed, the whole battery is the ruling.
	got, err := TestTheDelta(r, db, "", nil, false, "worker-one")
	if err != nil {
		t.Fatal(err)
	}
	if !got.Whole {
		t.Fatalf("a changed check did not rule the whole battery: %+v", got)
	}

	// Named, the name runs and the ruling is owed rather than executed.
	got, err = TestTheDelta(r, db, "", []string{"TestA"}, false, "worker-one")
	if err != nil {
		t.Fatal(err)
	}
	if got.Whole {
		t.Fatalf("the named proposal was drowned by the whole ruling: %+v", got)
	}
	if len(got.Chosen) != 1 || !strings.HasSuffix(got.Chosen[0].ID, "TestA") {
		t.Fatalf("the name did not run alone: %+v", got.Chosen)
	}
	if !strings.Contains(got.WhyWhole, "owed") {
		t.Fatalf("the answer does not say the battery is owed: %q", got.WhyWhole)
	}

	// A proposal reaching nothing leaves the engine's selection standing.
	got, err = TestTheDelta(r, db, "", []string{"TestNothingHere"}, false, "worker-one")
	if err != nil {
		t.Fatal(err)
	}
	if !got.Whole {
		t.Fatalf("an empty proposal defeated the whole ruling: %+v", got)
	}
}

func TestTheEngineSelectsByRegion(t *testing.T) {
	t.Parallel()
	r, dir := aTreeWithTests(t)
	db := openTheIndex(t, r)

	// THE TRACE IS IN THE INDEX: two tests, each reaching its own function.
	var regions int
	if err := db.QueryRow("SELECT count(*) FROM test_region").Scan(&regions); err != nil || regions == 0 {
		t.Fatalf("the trace holds %d regions: %v", regions, err)
	}

	// NOTHING CHANGED, NOTHING RUNS.
	got, err := TestTheDelta(r, db, "", nil, false, "worker-one")
	if err != nil || len(got.Chosen) != 0 || got.Whole {
		t.Fatalf("an empty delta chose %+v", got)
	}

	// A CHANGES, AND ONLY THE TEST THAT REACHES A IS CHOSEN, for that reason.
	changeA(t, dir)
	got, err = TestTheDelta(r, db, "", nil, false, "worker-one")
	if err != nil {
		t.Fatal(err)
	}
	if len(got.Chosen) != 1 || got.Chosen[0].ID != "./TestA" && got.Chosen[0].ID != "TestA" && !strings.HasSuffix(got.Chosen[0].ID, "/TestA") {
		t.Fatalf("the delta chose %+v", got.Chosen)
	}
	if !strings.Contains(got.Chosen[0].Why, "reaches lib.go:") {
		t.Fatalf("the reason does not name the line: %q", got.Chosen[0].Why)
	}
	if got.Whole {
		t.Fatalf("one function changed and the whole battery was chosen: %s", got.WhyWhole)
	}

	// AND IT RUNS, GREEN, WITH ITS TIME.
	got, err = TestTheDelta(r, db, "", nil, true, "worker-one")
	if err != nil || !got.OK || len(got.Ran) != 1 || !got.Ran[0].OK || got.Ran[0].Seconds <= 0 {
		t.Fatalf("running the selection answered %+v %v", got, err)
	}
}

func TestTheProposalNarrows(t *testing.T) {
	t.Parallel()
	r, dir := aTreeWithTests(t)
	db := openTheIndex(t, r)
	changeA(t, dir)
	ids := func(got Tested) []string {
		var out []string
		for _, c := range got.Chosen {
			out = append(out, c.ID[strings.LastIndex(c.ID, "/")+1:])
		}
		return out
	}

	// A TEST NAMED OUTRIGHT RUNS, whether or not the delta reaches it.
	got, err := TestTheDelta(r, db, "", []string{"TestB"}, false, "worker-one")
	if err != nil || strings.Join(ids(got), ",") != "TestB" {
		t.Fatalf("naming TestB chose %v %v", ids(got), err)
	}
	if !strings.Contains(got.Chosen[0].Why, "named") {
		t.Fatalf("the reason is %q", got.Chosen[0].Why)
	}

	// A PATTERN NARROWS THE ENGINE'S SELECTION, and never widens it.
	got, _ = TestTheDelta(r, db, "", []string{"TestA*"}, false, "worker-one")
	if strings.Join(ids(got), ",") != "TestA" {
		t.Fatalf("the pattern TestA* chose %v", ids(got))
	}
	got, _ = TestTheDelta(r, db, "", []string{"TestB*"}, false, "worker-one")
	if strings.Join(ids(got), ",") != "TestA" || len(got.Unreached) != 1 {
		t.Fatalf("a pattern the delta does not reach chose %v and left %v unreached", ids(got), got.Unreached)
	}

	// A NAME NOTHING HAS IS SAID, AND THE SELECTION STANDS.
	got, _ = TestTheDelta(r, db, "", []string{"TestNothing"}, false, "worker-one")
	if strings.Join(ids(got), ",") != "TestA" || len(got.Unreached) != 1 || got.Unreached[0] != "TestNothing" {
		t.Fatalf("a proposal nothing matches chose %v and left %v unreached", ids(got), got.Unreached)
	}
}

func TestWhenTheWholeBatteryRuns(t *testing.T) {
	t.Parallel()
	r, dir := aTreeWithTests(t)
	db := openTheIndex(t, r)

	// A CHANGE TO THE CHECKS THEMSELVES.
	if err := os.MkdirAll(filepath.Join(dir, "util", "checks"), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(dir, "util", "checks", "one.mjs"), []byte("// reads: lib.go\nprocess.exit(0)\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	got, err := TestTheDelta(r, db, "", nil, false, "worker-one")
	if err != nil || !got.Whole || !strings.Contains(got.WhyWhole, "util/checks/") {
		t.Fatalf("a new check did not call for the whole battery: %+v %v", got, err)
	}
	os.Remove(filepath.Join(dir, "util", "checks", "one.mjs"))

	// A PACKAGE WITH NO MAP YET.
	if _, err := db.Exec("UPDATE test SET mapped = ''"); err != nil {
		t.Fatal(err)
	}
	if _, err := db.Exec("DELETE FROM test_region"); err != nil {
		t.Fatal(err)
	}
	changeA(t, dir)
	got, _ = TestTheDelta(r, db, "", nil, false, "worker-one")
	if !got.Whole || !strings.Contains(got.WhyWhole, "no map yet") {
		t.Fatalf("an unmapped package did not call for the whole battery: %+v", got)
	}

	// A SELECTION WIDER THAN THE BATTERY IS WORTH: both tests of two.
	mapped, _, err := mapMissing(r, db, nil)
	if err != nil || mapped != 2+padTests {
		t.Fatalf("remapping: %d %v", mapped, err)
	}
	b, _ := os.ReadFile(filepath.Join(dir, "lib.go"))
	both := strings.Replace(string(b), "return 2", "return 2 + 0", 1)
	if err := os.WriteFile(filepath.Join(dir, "lib.go"), []byte(both), 0o644); err != nil {
		t.Fatal(err)
	}
	got, _ = TestTheDelta(r, db, "", nil, false, "worker-one")
	if !got.Whole || !strings.Contains(got.WhyWhole, "cheaper") {
		t.Fatalf("a selection of everything did not call for the whole battery: %+v", got)
	}

	// AND NOBODY PROPOSES THE BATTERY: a proposal does not widen a
	// selection into it. With one function changed and one test named,
	// the answer is that test.
	if err := os.WriteFile(filepath.Join(dir, "lib.go"), []byte(strings.Replace(string(b), "return 1", "return 1 + 0", 1)), 0o644); err != nil {
		t.Fatal(err)
	}
	got, _ = TestTheDelta(r, db, "", []string{"battery"}, false, "worker-one")
	if got.Whole || len(got.Unreached) != 1 {
		t.Fatalf("a proposal named the battery and got %+v", got)
	}
}

// A TEST RUN BY HAND INSIDE THE TREE IS REFUSED AND TOLD THE ENGINE.
func TestTheTestsAreTheEngines(t *testing.T) {
	t.Parallel()
	r := guidanceTree(t)
	log, err := OpenLog(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	defer log.Close()
	elsewhere := filepath.Join(t.TempDir(), "another-tree")
	decide := func(command string) string {
		t.Helper()
		body, _ := json.Marshal(map[string]any{"hook_event_name": "PreToolUse", "cwd": r.Work,
			"tool_name": "Bash", "tool_input": map[string]any{"command": command}, "agent_id": "helper-1"})
		var out bytes.Buffer
		answerHook(body, []string{"--method", r.Method}, &out, log)
		return out.String()
	}
	cases := []struct {
		command string
		refused bool
	}{
		{"go test ./...", true},
		{"go test -C src/engine -run TestX .", true},
		{"node util/checks/liveness.mjs .", true},
		{"sh util/checks/battery.sh", true},
		{".bin/se.test.exe -test.run TestX", true},
		{"go test -C " + elsewhere + " ./...", false},
		{"go build ./...", false},
		{"go vet ./...", false},
	}
	for _, c := range cases {
		said := decide(c.command)
		if got := strings.Contains(said, "se_test"); got != c.refused {
			t.Errorf("%q: refused=%v, want %v. The guard said: %s", c.command, got, c.refused, said)
		}
	}
}
