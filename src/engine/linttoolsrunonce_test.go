package main

import (
	"bytes"
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// A GO TOOL RUNS ONCE IN ONE BATTERY PASS.
//
// The Go tools went behind se lint, and the battery's own copies stayed where
// they were. So go vet ran over four modules, and then se lint ran go vet over
// every module carrying a go.mod, and golangci-lint over them again with govet
// among its own default rules. Nothing is learned on the second pass, and the
// battery is a wall agents wait behind.
//
// THE BATTERY IS READ, BECAUSE THAT IS WHERE THE DUPLICATE WAS. A test that
// asked the engine what it runs would have answered correctly the whole time.
//
// gofmt IS NOT ONE OF THESE, AND THAT IS MEASURED RATHER THAN ASSUMED.
// LintGo runs go vet and golangci-lint, and neither formats. golangci-lint
// enables errcheck, govet, ineffassign, staticcheck and unused by default, and
// no formatter among them. So gofmt runs once in the battery and nowhere else,
// and taking its line out would lose the only formatting guard rather than
// stop a second pass.
func TestTheBatteryRunsNoGoToolTheLintAlreadyRuns(t *testing.T) {
	t.Parallel()
	b, err := os.ReadFile(filepath.Join("..", "..", "util", "checks", "battery.sh"))
	if err != nil {
		t.Fatal(err)
	}
	said := string(b)
	// THE LINT LINE HAS TO BE THERE, or this passes over a battery that
	// dropped the verb and runs none of these tools at all.
	if !strings.Contains(said, `start "se lint"`) {
		t.Fatal("the battery does not run se lint, so nothing here checks the Go at all")
	}
	for _, line := range strings.Split(said, "\n") {
		trimmed := strings.TrimSpace(line)
		if strings.HasPrefix(trimmed, "#") {
			continue
		}
		if !strings.HasPrefix(trimmed, "start ") || !strings.Contains(trimmed, "go vet") {
			continue
		}
		t.Errorf("the battery runs %q beside se lint, which runs go vet over every "+
			"module itself, so the tool runs twice and the second pass learns nothing", trimmed)
	}
}

// aTreeTheLintFindsNothingIn is a tree the lint has nothing to say about, so a
// clean of false in it is about one thing.
//
// THE PROCESSES ALONE ARE NOT ENOUGH. The lint also reads the icons, the
// parameter declaration and the guidance, and a tree missing any of the three
// carries a finding for it, which would answer this test's question for it.
func aTreeTheLintFindsNothingIn(t *testing.T) Roots {
	t.Helper()
	r := aTreeWithTheProcesses(t)
	if err := os.MkdirAll(filepath.Join(r.Method, "util"), 0o755); err != nil {
		t.Fatal(err)
	}
	for _, name := range []string{"icons.json", "parameters.json"} {
		b, err := os.ReadFile(filepath.Join("..", "..", "util", name))
		if err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(filepath.Join(r.Method, "util", name), b, 0o644); err != nil {
			t.Fatal(err)
		}
	}
	from := filepath.Join("..", "..", "doc", "guidance")
	if err := os.CopyFS(filepath.Join(r.Method, "doc", "guidance"), os.DirFS(from)); err != nil {
		t.Fatal(err)
	}
	return r
}

// AND THE LINT DOES NOT ANSWER CLEAN OVER WHAT IT COULD NOT READ.
//
// clean was len(findings) equals zero. A box where golangci-lint will not start
// finds nothing through it and reads clean, so the one field a caller looks at
// says the tree is fine when half the tools never ran. Only the refused list
// said otherwise, and a caller that reads clean does not read it.
func TestTheLintIsNotCleanWhenAProgramWasRefused(t *testing.T) {
	r := aTreeTheLintFindsNothingIn(t)
	// A MODULE WITH NOTHING WRONG IN IT, so the only reason to answer other
	// than clean is the refusal this is about.
	aGoModule(t, r.Method, "plain", "package main\n\nfunc main() {}\n")
	// THE PROGRAMS ARE HIDDEN, by handing the process a path with nothing on
	// it. This is what a box that never installed them looks like.
	t.Setenv("PATH", t.TempDir())

	var out, errs bytes.Buffer
	run["lint"](&call{ctx: t.Context(), roots: r,
		args: []string{}, in: strings.NewReader(""), out: &out, err: &errs})
	var said struct {
		Findings []Finding `json:"findings"`
		Clean    bool      `json:"clean"`
		Refused  []string  `json:"refused"`
	}
	if err := json.Unmarshal(out.Bytes(), &said); err != nil {
		t.Fatalf("the lint did not answer JSON: %v: %s", err, out.String()+errs.String())
	}
	if len(said.Refused) == 0 {
		t.Fatalf("nothing was refused with an empty path, so this fixture proves nothing: %+v", said)
	}
	// AND THE TREE ITSELF HAS TO BE CLEAN, or clean is false for a reason
	// that has nothing to do with the refusal and this decides nothing.
	if len(said.Findings) != 0 {
		t.Fatalf("the fixture tree has %d finding(s) of its own, so the clean field "+
			"below is not about the refusal: %+v", len(said.Findings), said.Findings)
	}
	if said.Clean {
		t.Errorf("the lint answered clean having been refused %d program(s): %v",
			len(said.Refused), said.Refused)
	}
}
