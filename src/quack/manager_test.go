// The manager folds src/ops and src/watchdog into its module, and the root
// loads it where the wiring loads nothing else.
// [[spec/design_output/model#the-index-manager]]
package main

import (
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"testing"
	"time"

	"quackitect/src/index"
	"quackitect/src/modules/config"
	manager "quackitect/src/modules/index"
	"quackitect/src/q"
	"quackitect/src/q/qtest"
)

// An override on watchdog/beat re-arms the manager's tick at its span, and one on watchdog/lease holds the index's lease at its term, through the config module's layers. [[spec/design_output/model#a-lease]]
func TestAnOverrideSetsTheSpanTheManagerTicksAt(t *testing.T) {
	var as q.Writer
	ix := qtest.New(t, func(c *q.Catalog) {
		q.OutIn(c, "env/<name>", "", q.Doc("an SE_ variable, as the case seeds it"))
		as = manager.Registers(c)
		config.Registers(c)
	})
	var spans []time.Duration
	var steps []func()
	stop, err := manager.Start(manager.Outside{
		Root: t.TempDir(), Store: ix.Store(), As: as, Rows: opRows{heldTable{}},
		Steps: func(hand func()) { steps = append(steps, hand) },
		Now:   time.Now,
		Every: func(span time.Duration, _ func(time.Time)) func() {
			spans = append(spans, span)
			return func() {}
		},
	})
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(stop)
	ix.Land(config.HeldName, config.Change{Kind: config.Overrides, Values: map[string]string{manager.BeatKey: "2", manager.LeaseKey: "7"}})
	if len(spans) == 0 || spans[len(spans)-1] != 2*time.Second {
		t.Fatalf("an override of 2 on %s ticks at %v", manager.BeatKey, spans)
	}
	for _, step := range steps {
		step()
	}
	if lease, _ := ix.Read(manager.HealthName).(manager.Lease); lease.Term != 7*time.Second {
		t.Fatalf("an override of 7 on %s holds the term %v", manager.LeaseKey, lease.Term)
	}
}

// An op table in memory, as the index hands one. [[spec/design_output/model#an-operation-outlives-callers]]
type heldTable map[string][]byte

func (one heldTable) Save(id string, body []byte) error { one[id] = body; return nil }
func (one heldTable) Drop(id string) error              { delete(one, id); return nil }

func (one heldTable) All() ([]index.OpRow, error) {
	out := []index.OpRow{}
	for id, body := range one {
		out = append(out, index.OpRow{ID: id, Body: body})
	}
	return out, nil
}

func TestTheManagerReadsTheIndexOpTable(t *testing.T) {
	table := heldTable{}
	rows := opRows{table}
	if err := rows.Save("1", []byte(`{"state":"running"}`)); err != nil {
		t.Fatal(err)
	}
	all, err := rows.All()
	if err != nil || len(all) != 1 || all[0].ID != "1" || string(all[0].Body) != `{"state":"running"}` {
		t.Fatalf("the rows read %v, %v", all, err)
	}
	if err := rows.Drop("1"); err != nil || len(table) != 0 {
		t.Fatalf("the drop leaves %v, %v", table, err)
	}
}

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

// The built root, run over a root, as the door spawns it. [[spec/design_output/model#the-index-manager]]
func quack(t *testing.T, bin, root string, args ...string) (string, error) {
	t.Helper()
	cmd := exec.Command(bin, args...)
	cmd.Dir = root
	cmd.Env = append(cmd.Environ(), "QUACKITECT_ROOT="+root)
	said, err := cmd.CombinedOutput()
	return string(said), err
}

// The binary a build writes, named with .exe on Windows, where exec finds no other. [[spec/tickets/windows-builds-quack-exe]]
func binaryIn(folder, name string) string {
	if runtime.GOOS == "windows" {
		name += ".exe"
	}
	return filepath.Join(folder, name)
}

// The root built into a folder, as the install builds it. [[spec/design_output/model#the-wiring-file]]
func built(t *testing.T, folder string) string {
	t.Helper()
	bin := binaryIn(folder, "quack")
	build := exec.Command("go", "build", "-o", bin, "./src/quack")
	build.Dir = filepath.Join("..", "..")
	if said, err := build.CombinedOutput(); err != nil {
		t.Fatalf("the root does not build: %v\n%s", err, said)
	}
	return bin
}

// A binary standing outside any vehicle, over a tree with no wiring file, reaches no wiring at all. [[spec/design_output/model#the-index-manager]]
func TestAnIndexReachingNoWiringLoadsTheManagerAlone(t *testing.T) {
	bin := built(t, t.TempDir())
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

// A driven tree carries no wiring file, so the index loads the wiring of the vehicle whose runtime folder holds the binary. [[spec/design_output/model#the-wiring-file]]
func TestATreeWithNoWiringLoadsTheVehicleWiring(t *testing.T) {
	vehicle := t.TempDir()
	text, err := os.ReadFile(filepath.Join("..", "..", filepath.FromSlash(q.WiringFile)))
	if err != nil {
		t.Fatal(err)
	}
	at := filepath.Join(vehicle, filepath.FromSlash(q.WiringFile))
	if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(at, text, 0o644); err != nil {
		t.Fatal(err)
	}
	bin := built(t, filepath.Join(vehicle, filepath.FromSlash(index.Runtime), "bin"))
	root := t.TempDir()
	said, err := quack(t, bin, root, "why", "tickets/all")
	t.Cleanup(func() { quack(t, bin, root, "call", "stop") })
	if err != nil {
		t.Fatalf("quack why tickets/all answers %v: %s", err, said)
	}
	if !strings.Contains(filepath.ToSlash(said), "src/modules/tickets") {
		t.Fatalf("the index reads no tickets module loaded: %s", said)
	}
}
