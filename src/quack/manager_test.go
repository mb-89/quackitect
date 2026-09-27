// The manager folds src/ops and src/watchdog into its module, and the root
// loads it where the wiring loads nothing else.
// [[spec/design_output/model#the-index-manager]]
package main

import (
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
)

// The module the manager stands in, and the packages it folds. [[spec/design_output/model#the-index-manager]]
const managerPackage = "quackitect/src/modules/index"

var folded = []string{"quackitect/src/ops", "quackitect/src/watchdog"}

func listed(t *testing.T, args ...string) []string {
	t.Helper()
	cmd := exec.Command("go", append([]string{"list"}, args...)...)
	cmd.Dir = filepath.Join("..", "..")
	said, err := cmd.Output()
	if err != nil {
		t.Fatalf("go list %s answers %v", strings.Join(args, " "), err)
	}
	return strings.Fields(string(said))
}

func TestTheManagerFoldsOpsAndTheWatchdog(t *testing.T) {
	found := false
	for _, one := range listed(t, "./src/modules/index/...") {
		found = found || one == managerPackage
	}
	if !found {
		t.Fatalf("go list ./src/modules/index/... answers no %s", managerPackage)
	}
	for _, one := range listed(t, "-deps", "./src/quack") {
		for _, gone := range folded {
			if one == gone {
				t.Fatalf("the root still reaches %s", gone)
			}
		}
	}
}

// The built root, run over a root with no wiring file, so the index it spawns loads no module past the manager. [[spec/design_output/model#the-index-manager]]
func quack(t *testing.T, bin, root string, args ...string) (string, error) {
	t.Helper()
	cmd := exec.Command(bin, args...)
	cmd.Dir = root
	cmd.Env = append(cmd.Environ(), "QUACKITECT_ROOT="+root)
	said, err := cmd.CombinedOutput()
	return string(said), err
}

func TestTheIndexLoadsTheManagerWithNoOtherModule(t *testing.T) {
	bin := filepath.Join(t.TempDir(), "quack")
	build := exec.Command("go", "build", "-o", bin, "./src/quack")
	build.Dir = filepath.Join("..", "..")
	if said, err := build.CombinedOutput(); err != nil {
		t.Fatalf("the root does not build: %v\n%s", err, said)
	}
	root := t.TempDir()
	said, err := quack(t, bin, root, "why", "session/alarms")
	t.Cleanup(func() { quack(t, bin, root, "call", "stop") })
	if err != nil {
		t.Fatalf("quack why session/alarms answers %v: %s", err, said)
	}
	if !strings.Contains(filepath.ToSlash(said), "src/modules/index/manager.go") {
		t.Fatalf("the index reads no manager loaded: %s", said)
	}
	if said, err := quack(t, bin, root, "why", "clock/minute"); err == nil {
		t.Fatalf("the index loads a module past the manager: %s", said)
	}
}
