// The live split: ioProcesses spawns quack io and a module process for each
// placement off the wiring, and a crash in one leaves the others answering.
// [[spec/tickets/kill-case-drives-live-split]]
package main

import (
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"testing"
	"time"

	"quackitect/src/modules/tickets"
	"quackitect/src/q"
)

// The folder a spawned process leaves its pid in, one file a command, and the longest a case waits on the processes. [[spec/tickets/kill-case-drives-live-split]]
const (
	pidsEnv   = "QUACK_TEST_PIDS"
	splitWait = 30 * time.Second
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
	os.Exit(m.Run())
}

// The pid the spawned command left, once it stands. [[spec/tickets/kill-case-drives-live-split]]
func spawnedPid(t *testing.T, dir string, command ...string) int {
	t.Helper()
	at := filepath.Join(dir, strings.Join(command, "-"))
	for end := time.Now().Add(splitWait); time.Now().Before(end); time.Sleep(20 * time.Millisecond) {
		if text, err := os.ReadFile(at); err == nil {
			if pid, err := strconv.Atoi(string(text)); err == nil {
				return pid
			}
		}
	}
	t.Fatalf("%s leaves no pid within the wait", strings.Join(command, " "))
	return 0
}

// Waits until the store holds what the case wants. [[spec/tickets/kill-case-drives-live-split]]
func splitHolds(t *testing.T, store *q.Store, what string, held func(q.Snapshot) bool) {
	t.Helper()
	for end := time.Now().Add(splitWait); time.Now().Before(end); time.Sleep(20 * time.Millisecond) {
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

func TestAKilledModuleProcessUnderTheSplitLeavesTheOthersAnswering(t *testing.T) {
	root, pids := t.TempDir(), t.TempDir()
	ticket := "---\nkind: [[ticket]]\nstate: open\n---\n\n# Ask\n\n"
	if said, err := exec.Command("git", "init", "-q", root).CombinedOutput(); err != nil {
		t.Fatalf("git init answers %v: %s", err, said)
	}
	seedFile(t, root, q.WiringFile, splitWiring)
	seedFile(t, root, "spec/tickets/first.md", ticket+"The first.\n")
	t.Setenv("QUACKITECT_ROOT", root)
	t.Setenv(pidsEnv, pids)
	w, err := q.ReadWiring(splitWiring)
	if err != nil {
		t.Fatal(err)
	}
	c := q.New()
	_, hands, err := loaded(w, c)
	if err != nil {
		t.Fatal(err)
	}
	store := q.NewStore(c)
	split, err := ioProcesses(root, store, doors{io: ioInstances(w), wiring: w, hands: hands}, nil)
	if err != nil {
		t.Fatal(err)
	}
	defer split.Stop()
	if strings.Join(split.Away, ", ") != "git, guidance, tickets, watch" {
		t.Fatalf("the split runs %v away, and wants git, guidance, tickets and watch", split.Away)
	}
	splitHolds(t, store, "tickets/all listing first, and guidance/steps provided", func(snap q.Snapshot) bool {
		return listsTickets(snap, "first") && !snap.NotProvided("guidance/steps")
	})
	ticketsPid := spawnedPid(t, pids, moduleVerb, "tickets")
	guidance, err := os.FindProcess(spawnedPid(t, pids, moduleVerb, "guidance"))
	if err != nil {
		t.Fatal(err)
	}
	if err := guidance.Kill(); err != nil {
		t.Fatal(err)
	}
	splitHolds(t, store, "guidance/steps not provided", func(snap q.Snapshot) bool { return snap.NotProvided("guidance/steps") })
	seedFile(t, root, "spec/tickets/second.md", ticket+"The second.\n")
	splitHolds(t, store, "tickets/all listing first and second", func(snap q.Snapshot) bool { return listsTickets(snap, "first", "second") })
	if again := spawnedPid(t, pids, moduleVerb, "tickets"); again != ticketsPid {
		t.Fatalf("the tickets process runs as %d after the kill of guidance, and wants %d, never restarted", again, ticketsPid)
	}
}
