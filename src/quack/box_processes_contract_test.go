//go:build contract

// The live split and the built root, meeting real processes: moved here off
// split_test.go and manager_test.go. [[spec/tickets/test-walks-move-onto-fakes]]
package main // level0: InPackageTest - a main package admits no outside test package, and the contract reaches the unexported ioProcesses, ioInstances, ioVerb and moduleVerb

import (
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strconv"
	"strings"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	"quackitect/src/index"
	manager "quackitect/src/modules/index"
	"quackitect/src/modules/tickets"
	"quackitect/src/q"
)

// The folder a spawned process leaves its pid in, one file a command, the longest a case waits on the processes, and the front of a ticket the case seeds. [[spec/tickets/kill-case-drives-live-split]]
const (
	pidsEnv     = "QUACK_TEST_PIDS"
	splitWait   = 30 * time.Second
	splitTicket = "---\nkind: [[ticket]]\nstate: open\n---\n\n# Ask\n\n"
)

// The wiring the live split runs: the watch and git in quack io, and tickets and guidance each in a module process of its own. [[spec/tickets/kill-case-drives-live-split]]
const splitWiring = `instances:
  watch:
    module: watch
  git:
    module: git
  tickets:
    module: tickets
  guidance:
    module: guidance
wires:
  watch.files/<path...>: files/<path...>
  tickets.files/<path...>: files/<path...>
  guidance.files/<path...>: files/<path...>
  git.tips: git/tips
  git.trunk: git/trunk
  git.stood: git/stood
  git.tracked: git/tracked
  tickets.tips: git/tips
  tickets.trunk: git/trunk
  tickets.all: tickets/all
  tickets.cloud: tickets/cloud
  tickets.branched: tickets/branched
  tickets.branches: tickets/branches
  guidance.steps: guidance/steps
`

// The test binary stands in for quack where ioProcesses spawns it: the io and module verbs run main, and each spawn leaves its pid under pidsEnv. [[spec/tickets/kill-case-drives-live-split]]
func TestMain(m *testing.M) {
	if len(os.Args) > 1 && (os.Args[1] == ioVerb || os.Args[1] == moduleVerb) {
		if dir := os.Getenv(pidsEnv); dir != "" {
			_ = os.WriteFile(filepath.Join(dir, strings.Join(os.Args[1:], "-")), []byte(strconv.Itoa(os.Getpid())), 0o644)
		}
		main()
		os.Exit(0)
	}
	code := m.Run()
	for _, dir := range buildDirs.dirs {
		os.RemoveAll(dir)
	}
	os.Exit(code)
}

// The pid the spawned command left past the one named, once it stands, so a case reads a restart by naming the pid before it. [[spec/tickets/kill-case-drives-live-split]]
func spawnedPid(t *testing.T, dir string, past int, command ...string) int {
	t.Helper()
	at := filepath.Join(dir, strings.Join(command, "-"))
	for end := wall.Now().Add(splitWait); wall.Now().Before(end); <-wall.After(20 * time.Millisecond) {
		if text, err := os.ReadFile(at); err == nil {
			if pid, err := strconv.Atoi(string(text)); err == nil && pid != past {
				return pid
			}
		}
	}
	t.Fatalf("%s leaves no pid past %d within the wait", strings.Join(command, " "), past)
	return 0
}

func killsPid(t *testing.T, pid int) {
	t.Helper()
	one, err := os.FindProcess(pid)
	if err != nil {
		t.Fatal(err)
	}
	if err := one.Kill(); err != nil {
		t.Fatal(err)
	}
}

// The live split over a tree of its own, under the dog the settings make where the case names some: its root, the pid folder, and the store the index lands each commit in. [[spec/tickets/live-split-raises-the-alarm]]
func splitRuns(t *testing.T, settings *manager.DogSettings) (string, string, *q.Store) {
	t.Helper()
	root, pids := t.TempDir(), t.TempDir()
	if said, err := exec.Command("git", "init", "-q", root).CombinedOutput(); err != nil {
		t.Fatalf("git init answers %v: %s", err, said)
	}
	seedFile(t, root, q.WiringFile, splitWiring)
	seedFile(t, root, "spec/tickets/first.md", splitTicket+"The first.\n")
	t.Setenv("QUACKITECT_ROOT", root)
	t.Setenv(pidsEnv, pids)
	w, err := q.ReadWiring(splitWiring)
	if err != nil {
		t.Fatal(err)
	}
	c := q.New()
	as := manager.Registers(c)
	_, hands, err := loaded(w, c)
	if err != nil {
		t.Fatal(err)
	}
	store := q.NewStore(c)
	var dog *manager.Dog
	if settings != nil {
		dog = manager.NewDog(wall.Now, store, as, *settings)
	}
	split, err := ioProcesses(root, store, doors{io: ioInstances(w), wiring: w, hands: hands}, dog)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(split.Stop)
	if strings.Join(split.Away, ", ") != "git, guidance, tickets, watch" {
		t.Fatalf("the split runs %v away, and wants git, guidance, tickets and watch", split.Away)
	}
	splitHolds(t, store, "tickets/all listing first, and guidance/steps provided", func(snap q.Snapshot) bool {
		return listsTickets(snap, "first") && !snap.NotProvided("guidance/steps")
	})
	return root, pids, store
}

// Waits until the store holds what the case wants. [[spec/tickets/kill-case-drives-live-split]]
func splitHolds(t *testing.T, store *q.Store, what string, held func(q.Snapshot) bool) {
	t.Helper()
	for end := wall.Now().Add(splitWait); wall.Now().Before(end); <-wall.After(20 * time.Millisecond) {
		if held(store.Snapshot()) {
			return
		}
	}
	t.Fatalf("%s holds nowhere within the wait", what)
}

// Whether tickets/all lists every name. [[spec/tickets/kill-case-drives-live-split]]
func listsTickets(snap q.Snapshot, names ...string) bool {
	all, _ := snap.Read("tickets/all").([]tickets.Ticket)
	found := map[string]bool{}
	for _, one := range all {
		found[one.Name] = true
	}
	for _, name := range names {
		if !found[name] {
			return false
		}
	}
	return !snap.NotProvided("tickets/all")
}

// level0: FixtureOutsideHome - the contract spawns the real module processes over a git tree of its own and kills one, which no fake process proves
func TestAKilledModuleProcessUnderTheSplitLeavesTheOthersAnswering(t *testing.T) {
	root, pids, store := splitRuns(t, nil)
	ticketsPid := spawnedPid(t, pids, 0, moduleVerb, "tickets")
	killsPid(t, spawnedPid(t, pids, 0, moduleVerb, "guidance"))
	splitHolds(t, store, "guidance/steps not provided", func(snap q.Snapshot) bool { return snap.NotProvided("guidance/steps") })
	seedFile(t, root, "spec/tickets/second.md", splitTicket+"The second.\n")
	splitHolds(t, store, "tickets/all listing first and second", func(snap q.Snapshot) bool { return listsTickets(snap, "first", "second") })
	if again := spawnedPid(t, pids, 0, moduleVerb, "tickets"); again != ticketsPid {
		t.Fatalf("the tickets process runs as %d after the kill of guidance, and wants %d, never restarted", again, ticketsPid)
	}
}

// Each crash of a placed process hands the dog a fault, and a run of them raises the process's alarm. [[spec/tickets/live-split-raises-the-alarm]]
// level0: FixtureOutsideHome - the contract spawns the real module processes over a git tree of its own and crashes them, so the dog hears real exits
func TestACrashingModuleProcessUnderTheSplitRaisesItsAlarm(t *testing.T) {
	_, pids, store := splitRuns(t, &manager.DogSettings{First: 10 * time.Millisecond, Cap: 20 * time.Millisecond, Faults: 2, Window: time.Minute})
	first := spawnedPid(t, pids, 0, moduleVerb, "guidance")
	killsPid(t, first)
	killsPid(t, spawnedPid(t, pids, first, moduleVerb, "guidance"))
	splitHolds(t, store, "session/alarms naming guidance alone", func(snap q.Snapshot) bool {
		alarms, _ := snap.Read(manager.AlarmsName).([]manager.Alarm)
		return len(alarms) == 1 && alarms[0].Part == "guidance"
	})
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

// The index asked to stop, then the binary and the root removed once it lets go of them, since Windows locks a running binary and TempDir's cleanup tries once. [[spec/tickets/manager-tests-wait-for-the-binary]]
func stopped(t *testing.T, bin, root string) {
	t.Helper()
	quack(t, bin, root, "call", "stop")
	deadline := wall.Now().Add(30 * time.Second)
	for {
		binErr := os.Remove(bin)
		if errors.Is(binErr, os.ErrNotExist) {
			binErr = nil
		}
		rootErr := os.RemoveAll(root)
		if binErr == nil && rootErr == nil {
			return
		}
		if wall.Now().After(deadline) {
			t.Errorf("the stopped index still holds %s (%v) or %s (%v)", bin, binErr, root, rootErr)
			return
		}
		<-wall.After(200 * time.Millisecond)
	}
}

// The root built into a folder, as the install builds it, off the one build this run takes. A link opens no handle, where a copy's write handle rides into a fork a parallel case makes, and exec of the copy answers text file busy. [[spec/tickets/quack-build-links-each-case]]
// Windows takes a copy: a running image there denies delete on every name of its file, so a link leaves each case's folder locked by any other case's index. Its exec inherits no handle the copy holds. [[spec/tickets/quack-build-copies-on-windows]]
func built(t *testing.T, folder string) string {
	t.Helper()
	built, err := quackBinary()
	if err != nil {
		t.Fatalf("the root does not build: %v", err)
	}
	bin := binaryIn(folder, "quack")
	if err := os.MkdirAll(folder, 0o755); err != nil {
		t.Fatal(err)
	}
	if runtime.GOOS == "windows" {
		if err := copied(built, bin); err != nil {
			t.Fatalf("the build does not copy into %s: %v", folder, err)
		}
		return bin
	}
	if err := os.Link(built, bin); err != nil {
		t.Fatalf("the build does not link into %s: %v", folder, err)
	}
	return bin
}

// The file at from written to to, closed before it returns, so no handle outlives the copy. [[spec/tickets/quack-build-copies-on-windows]]
func copied(from, to string) error {
	text, err := os.ReadFile(from)
	if err != nil {
		return err
	}
	return os.WriteFile(to, text, 0o755)
}

// The one go build of the root this run takes, into a folder of its own that the run removes. [[spec/tickets/each-door-meets-one-test]]
var quackBinary = sync.OnceValues(func() (string, error) {
	dir, err := os.MkdirTemp("", "quack-built-")
	if err != nil {
		return "", err
	}
	buildDirs.Lock()
	buildDirs.dirs = append(buildDirs.dirs, dir)
	buildDirs.Unlock()
	bin := binaryIn(dir, "quack")
	quackBuilds.Add(1)
	build := exec.Command("go", "build", "-o", bin, "./src/quack")
	build.Dir = filepath.Join("..", "..")
	if said, err := build.CombinedOutput(); err != nil {
		return "", fmt.Errorf("%w\n%s", err, said)
	}
	return bin, nil
})

// The go builds the quack binary takes this run, which one build serves. [[spec/tickets/each-door-meets-one-test]]
var quackBuilds atomic.Int32

// Two cases asking for the binary in two folders meet one build. [[spec/tickets/each-door-meets-one-test]]
// level0: FixtureOutsideHome - the contract asks for the real quack binary in two folders of its own, to prove one go build serves both
func TestTheQuackBinaryBuildsOnce(t *testing.T) {
	t.Parallel()
	built(t, t.TempDir())
	built(t, t.TempDir())
	if got := quackBuilds.Load(); got != 1 {
		t.Fatalf("the quack binary builds %d times, where one build serves every case", got)
	}
}

// A case's binary leaves its folder while another case's index runs from a binary of its own, as TempDir's cleanup removes it. [[spec/tickets/quack-build-copies-on-windows]]
// level0: FixtureOutsideHome - the contract runs the real quack binary as an index in one folder, and removes the binary of another
func TestACaseRemovesItsBinaryWhileAnotherRunsItsOwn(t *testing.T) {
	t.Parallel()
	idle := t.TempDir()
	built(t, idle)
	bin := built(t, t.TempDir())
	root := t.TempDir()
	said, err := quack(t, bin, root, "help")
	t.Cleanup(func() { stopped(t, bin, root) })
	if err != nil {
		t.Fatalf("quack help over a root with no door answers %v: %s", err, said)
	}
	if err := os.RemoveAll(idle); err != nil {
		t.Fatalf("the idle case's folder stays while another case's index runs: %v", err)
	}
}

// A binary standing outside any vehicle, over a tree with no wiring file, reaches no wiring at all. [[spec/design_output/model#the-index-manager]]
// level0: FixtureOutsideHome - the contract runs the real quack binary as an index over a tree of its own with no wiring file
func TestAnIndexReachingNoWiringLoadsTheManagerAlone(t *testing.T) {
	t.Parallel()
	bin := built(t, t.TempDir())
	root := t.TempDir()
	said, err := quack(t, bin, root, "why", "session/alarms")
	t.Cleanup(func() { stopped(t, bin, root) })
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

// A tree verb reaches /v1 before the index's own command line runs, and starts this binary where no door stands. [[spec/design_output/index#a-door-comes-back]]
// level0: FixtureOutsideHome - the contract runs the real quack binary over a tree of its own where no door stands, so the verb starts a real index
func TestATreeVerbStartsThisIndexWhereNoneStands(t *testing.T) {
	t.Parallel()
	bin := built(t, t.TempDir())
	root := t.TempDir()
	said, err := quack(t, bin, root, "help")
	t.Cleanup(func() { stopped(t, bin, root) })
	if err != nil {
		t.Fatalf("quack help over a root with no door answers %v: %s", err, said)
	}
}

// A driven tree carries no wiring file, so the index loads the wiring of the vehicle whose runtime folder holds the binary. [[spec/design_output/model#the-wiring-file]]
// level0: FixtureOutsideHome - the contract runs the real quack binary from a vehicle runtime folder of its own over a tree with no wiring file
func TestATreeWithNoWiringLoadsTheVehicleWiring(t *testing.T) {
	t.Parallel()
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
	t.Cleanup(func() { stopped(t, bin, root) })
	if err != nil {
		t.Fatalf("quack why tickets/all answers %v: %s", err, said)
	}
	if !strings.Contains(filepath.ToSlash(said), "src/modules/tickets") {
		t.Fatalf("the index reads no tickets module loaded: %s", said)
	}
}
