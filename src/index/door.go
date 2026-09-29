// The resident process that owns the database. One writer keeps the tree and
// the rows in step, and every reader asks the same warm cache.
// [[spec/design_output/index#the-door-owns-the-database]]
package index

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"io/fs"
	"net"
	"net/http"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"strconv"
	"strings"
	"sync"

	"quackitect/src/q"
	"quackitect/src/watcher"
	"sync/atomic"
	"syscall"
	"time"
)

const (
	headerReadTimeout = 5 * time.Second
	burstSettleDelay  = 200 * time.Millisecond
	// The span between two sweeps on the clock. [[spec/design_output/index#a-change-moves-its-rows]]
	sweepEvery = 10 * time.Minute
	// Git's own index, which a watch on its folder names when the tracked list turns. [[spec/design_output/index#a-change-moves-its-rows]]
	gitIndex       = ".git/index"
	decimalBase    = 10
	stopGraceDelay = 100 * time.Millisecond
	// A changes call waits this long for a sweep, under the wait a caller gives a post. [[spec/design_output/index#the-index-fires-on-change]]
	changesWait = 25 * time.Second
)

type Standing struct {
	Port  int    `json:"port"`
	V1    int    `json:"v1,omitempty"`
	Pid   int    `json:"pid"`
	Root  string `json:"root"`
	Stamp string `json:"stamp"`
}

type call struct {
	Method string          `json:"method"`
	Params json.RawMessage `json:"params"`
	ID     int             `json:"id"`
}

type answer struct {
	Result any    `json:"result,omitempty"`
	Error  string `json:"error,omitempty"`
	ID     int    `json:"id"`
}

type door struct {
	db    *sql.DB
	v1    net.Listener
	root  string
	guard sync.Mutex
	dirty chan struct{}
	eyes  *watcher.Watcher

	pending atomic.Bool
	// The paths the watch names since the last settle, whether git's own index moved, and whether the plan moved. [[spec/design_output/index#a-change-moves-its-rows]]
	heard   sync.Mutex
	touched map[string]bool
	retrack bool
	replan  bool
	// Git's list as the last sweep or retrack read it, so a change reads it and spawns no git. [[spec/design_output/index#a-change-moves-its-rows]]
	tracked func(rel string) bool

	// The count of sweeps so far, and the channel a sweep closes to wake every waiting changes call. [[spec/design_output/index#the-index-fires-on-change]]
	tick     atomic.Int64
	wake     chan struct{}
	wakeLock sync.Mutex

	// The values modules read. [[spec/tickets/files-topic-reads-the-rows]]
	store *q.Store
	// Waits out every run the scheduler holds, so an answer off a derived name reads the commits before it. [[spec/tickets/tickets-becomes-a-module]]
	drains func()
	// The hands the manager gives the work loop, each run on every step. [[spec/design_output/model#a-lease]]
	steps []func()
}

// What a changes call answers: the tick the rows stand at. [[spec/design_output/index#the-index-fires-on-change]]
type Tick struct {
	Tick int64 `json:"tick"`
}

func standingPath(root string) string {
	return filepath.Join(root, Runtime, "index.json")
}

// The command line asks for a door, and this spawns the resident where none stands. [[spec/design_output/doors#a-door-reads-the-outside]]
func starts(root string) error {
	self, err := os.Executable()
	if err != nil {
		return err
	}

	one := exec.Command(self, "serve")
	one.Dir = root
	one.Env = append(os.Environ(), "QUACKITECT_ROOT="+root)
	one.Stdout, one.Stderr = nil, nil
	if err := one.Start(); err != nil {
		return err
	}
	go one.Wait()

	for waited := 0; waited < startPolls; waited++ {
		if _, err := standingOf(root); err == nil {
			return nil
		}
		time.Sleep(startPollPause)
	}
	return errorOf("the door took longer than thirty seconds to stand")
}

// The paths git tracks under the root. A root git holds nowhere tracks every file the walk reads, the way a reader of a bare folder reads it whole. [[spec/design_output/index#the-rows-the-walk-writes]]
func trackedIn(root string) func(rel string) bool {
	list := exec.Command("git", "ls-files", "-z")
	list.Dir = root
	said, err := list.Output()
	if err != nil {
		return func(string) bool { return true }
	}
	held := map[string]bool{}
	for _, path := range strings.Split(string(said), "\x00") {
		if path != "" {
			held[path] = true
		}
	}
	return func(rel string) bool { return held[rel] }
}

// Commits values into the served store as the writer a module holds. [[spec/design_output/model#io-modules-are-modules]]
type Commit func(as q.Writer, values map[string]any) error

// Starts an IO module over the root, committing what comes in, and answers its stop. [[spec/design_output/model#io-modules-are-modules]]
type Start func(root string, commit Commit) (stop func(), err error)

// The door with no manager, as a case of the door alone runs it. [[spec/design_output/model#the-index-manager]]
func Serve(root, at string, catalog *q.Catalog, starts ...Start) (func(), net.Listener, error) {
	return ServeManaged(root, at, catalog, nil, starts...)
}

// Answers the door beside its stop, so a case reads the steps the work loop runs. [[spec/design_output/model#a-lease]]
func opens(root, at string, catalog *q.Catalog, manage Manage, starts ...Start) (*door, func(), net.Listener, error) {
	return opensOn(net.Listen, root, at, catalog, manage, starts...)
}

// The door's start over the listen it takes, so a case fails a port. [[spec/design_output/index#the-door-owns-the-database]]
func opensOn(listens func(network, address string) (net.Listener, error), root, at string, catalog *q.Catalog, manage Manage, starts ...Start) (*door, func(), net.Listener, error) {
	beat := spanOf(root, "watchdog.beat", builtInBeat)
	// The catalog check runs before the database opens, so a fault refuses the start. [[spec/design_output/model#the-index-resolves-in-passes]]
	if faults := catalog.Check(); len(faults) > 0 {
		said := make([]string, 0, len(faults))
		for _, one := range faults {
			said = append(said, one.String())
		}
		return nil, nil, nil, fmt.Errorf("the catalog refuses the start:\n  %s", strings.Join(said, "\n  "))
	}
	db, err := Open(root, at)
	if err != nil {
		return nil, nil, nil, err
	}
	// A start that fails stops every part it reached, newest first. [[spec/design_output/index#the-door-owns-the-database]]
	undo := []func(){func() { db.Close() }}
	failed := func(err error) (*door, func(), net.Listener, error) {
		for i := len(undo) - 1; i >= 0; i-- {
			undo[i]()
		}
		return nil, nil, nil, err
	}
	// The door comes up on a sweep against the rows it finds, so a restart rewrites what moved while it stood down. [[spec/design_output/index#a-change-moves-its-rows]]
	tracked := trackedIn(root)
	if _, _, err := sweep(db, root, tracked); err != nil {
		return failed(err)
	}

	one := &door{db: db, root: root, dirty: make(chan struct{}, 1), wake: make(chan struct{}), touched: map[string]bool{}, tracked: tracked}
	one.tick.Store(1)
	one.store = q.NewStore(catalog)
	// The tickets move on the scheduler after the rows do, so their commit ticks the changes call too. [[spec/tickets/tickets-becomes-a-module]]
	one.store.OnCommit(func(values map[string]any) {
		if _, ok := values[TicketsName]; ok {
			one.moved()
		}
	})
	// The scheduler hears every commit from here on, the IO modules' first ones too. [[spec/design_output/model#the-provider-kinds]]
	scheduler := q.NewScheduler(one.store, func(run func()) { go run() }, func(name string, err error) {
		fmt.Fprintln(stderr, "the run of", name, "did not commit:", err)
	})
	one.drains = scheduler.Settle
	undo = append(undo, scheduler.Stop)
	managed, err := one.manages(manage)
	if err != nil {
		return failed(err)
	}
	undo = append(undo, managed)
	stops, err := one.starts(starts)
	if err != nil {
		return failed(err)
	}
	undo = append(undo, stops...)
	stops = append(stops, managed)
	listen, err := listens("tcp", "127.0.0.1:0")
	if err != nil {
		return failed(err)
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/", one.took)
	server := &http.Server{Handler: mux, ReadHeaderTimeout: headerReadTimeout}

	go one.sweeps()
	go one.guards()
	beats := one.beats(beat)
	go server.Serve(listen)
	undo = append(undo, func() { server.Close() }, beats)
	// The old API keeps its port, and /v1 stands on a port of its own. [[spec/design_output/model#surfaces]]
	v1, served, err := one.servesV1(listens)
	if err != nil {
		return failed(err)
	}
	one.v1 = v1

	eyes, err := watches(root, one)
	if err == nil {
		one.eyes = eyes
	}
	// The stop lets go of the database and the watch too, so a test's folder clears on Windows. [[spec/design_output/index#the-door-owns-the-database]]
	stop := func() {
		beats()
		for _, one := range stops {
			one()
		}
		scheduler.Stop()
		server.Close()
		served.Close()
		if one.eyes != nil {
			one.eyes.Close()
		}
		one.db.Close()
	}
	return one, stop, listen, one.stands(listen)
}

// Each IO module commits through the store at its own revision, and a start that fails stops the ones before it. [[spec/design_output/model#io-modules-are-modules]]
func (one *door) starts(starts []Start) ([]func(), error) {
	commit := func(as q.Writer, values map[string]any) error {
		_, err := one.store.Commit(one.store.Snapshot().Revision, as, values)
		return err
	}
	var stops []func()
	for _, start := range starts {
		stop, err := start(one.root, commit)
		if err != nil {
			for _, done := range stops {
				done()
			}
			return nil, err
		}
		stops = append(stops, stop)
	}
	return stops, nil
}

func (one *door) stands(listen net.Listener) error {
	if err := os.MkdirAll(filepath.Dir(standingPath(one.root)), 0o755); err != nil {
		return err
	}
	said, err := json.Marshal(Standing{
		Port:  listen.Addr().(*net.TCPAddr).Port,
		V1:    one.v1.Addr().(*net.TCPAddr).Port,
		Pid:   os.Getpid(),
		Root:  one.root,
		Stamp: stampHere(),
	})
	if err != nil {
		return err
	}
	return os.WriteFile(standingPath(one.root), append(said, '\n'), 0o644)
}

// A path the watch names. Git's own index turns the tracked flags, the plan counts a tick, and every other path the walk stands off moves no row. [[spec/design_output/index#a-change-moves-its-rows]]
func (one *door) Touched(rel string) {
	if rel != gitIndex && rel != Plan && outside(rel) {
		return
	}
	one.heard.Lock()
	switch rel {
	case gitIndex:
		one.retrack = true
	case Plan:
		one.replan = true
	default:
		one.touched[rel] = true
	}
	one.heard.Unlock()
	one.pending.Store(true)
	select {
	case one.dirty <- struct{}{}:
	default:
	}
}

func (one *door) sweeps() {
	for range one.dirty {
		time.Sleep(burstSettleDelay)
		one.guard.Lock()
		for _, hand := range one.steps {
			hand()
		}
		one.settles()
		one.guard.Unlock()
	}
}

// The rows of the paths heard since the last settle move, and the tick counts one where any did. [[spec/design_output/index#a-change-moves-its-rows]]
func (one *door) settles() {
	if !one.pending.Swap(false) {
		return
	}
	one.heard.Lock()
	paths, retrack, replan := named(one.touched), one.retrack, one.replan
	one.touched, one.retrack, one.replan = map[string]bool{}, false, false
	one.heard.Unlock()
	moved := 0
	// A plan write moves no row, and counts one so the work tab reads its todos again. [[spec/design_output/index#the-index-fires-on-change]]
	if replan {
		moved++
	}
	if retrack {
		one.tracked = trackedIn(one.root)
	}
	if len(paths) > 0 {
		if rows, err := touches(one.db, one.root, paths, one.tracked); err == nil {
			moved += rows
		} else {
			one.keeps(paths, false, err)
		}
	}
	if retrack {
		if rows, err := retracks(one.db, one.tracked); err == nil {
			moved += rows
		} else {
			one.keeps(nil, true, err)
		}
	}
	if moved > 0 {
		one.moved()
	}
}

// A settle that fails hands back what it heard, so the next question settles it again and the clock waits for nothing. [[spec/design_output/index#a-change-moves-its-rows]]
func (one *door) keeps(paths []string, retrack bool, err error) {
	fmt.Fprintln(stderr, "the index did not settle, and tries again on the next question:", err)
	one.heard.Lock()
	for _, path := range paths {
		one.touched[path] = true
	}
	one.retrack = one.retrack || retrack
	one.heard.Unlock()
	one.pending.Store(true)
}

// A sweep reads git's list again, and the door holds what it reads. [[spec/design_output/index#a-change-moves-its-rows]]
func (one *door) walks() (int, int, error) {
	one.tracked = trackedIn(one.root)
	return sweep(one.db, one.root, one.tracked)
}

// The sweep on a clock, which catches a change the watch misses. [[spec/design_output/index#a-change-moves-its-rows]]
func (one *door) guards() {
	for range time.Tick(sweepEvery) {
		one.guard.Lock()
		if _, moved, err := one.walks(); err == nil && moved > 0 {
			one.moved()
		}
		one.guard.Unlock()
	}
}

// A sweep that wrote counts one, and wakes every changes call waiting on it. [[spec/design_output/index#the-index-fires-on-change]]
func (one *door) moved() {
	one.wakeLock.Lock()
	defer one.wakeLock.Unlock()
	one.tick.Add(1)
	close(one.wake)
	one.wake = make(chan struct{})
}

// The tick now, and the channel the next sweep closes. [[spec/design_output/index#the-index-fires-on-change]]
func (one *door) standingAt() (int64, chan struct{}) {
	one.wakeLock.Lock()
	defer one.wakeLock.Unlock()
	return one.tick.Load(), one.wake
}

// A changes call holds until a sweep past the tick it names, or the wait runs out, and answers the tick then. [[spec/design_output/index#the-index-fires-on-change]]
func (one *door) awaits(w http.ResponseWriter, r *http.Request, said call) {
	var asked struct {
		Since int64 `json:"since"`
	}
	if len(said.Params) > 0 {
		json.Unmarshal(said.Params, &asked)
	}
	patience := time.After(changesWait)
	for {
		tick, wake := one.standingAt()
		if tick > asked.Since {
			writes(w, answer{Result: Tick{Tick: tick}, ID: said.ID})
			return
		}
		select {
		case <-wake:
		case <-patience:
			writes(w, answer{Result: Tick{Tick: tick}, ID: said.ID})
			return
		case <-r.Context().Done():
			return
		}
	}
}

func (one *door) took(w http.ResponseWriter, r *http.Request) {
	var said call
	if err := json.NewDecoder(r.Body).Decode(&said); err != nil {
		writes(w, answer{Error: "the call reads as no JSON", ID: said.ID})
		return
	}

	// The wait for a sweep holds no guard, so every other call answers past it. [[spec/design_output/index#the-index-fires-on-change]]
	if strings.ToLower(said.Method) == "changes" {
		one.awaits(w, r, said)
		return
	}

	one.guard.Lock()
	defer one.guard.Unlock()
	one.settles()

	result, err := one.answers(said)
	if err != nil {
		writes(w, answer{Error: err.Error(), ID: said.ID})
		return
	}
	writes(w, answer{Result: result, ID: said.ID})
}

// [[spec/design_output/index#a-door-comes-back]]
func stampHere() string {
	self, err := os.Executable()
	if err != nil {
		return ""
	}
	said, err := os.Stat(self)
	if err != nil {
		return ""
	}
	return said.ModTime().UTC().Format(time.RFC3339Nano) + ":" + strconv.FormatInt(said.Size(), decimalBase)
}

// [[spec/design_output/index#a-door-comes-back]]
func stopsSoon(root string) {
	time.Sleep(stopGraceDelay)
	os.Remove(standingPath(root))
	os.Exit(0)
}

type errorOf string

func (one errorOf) Error() string { return string(one) }

func writes(w http.ResponseWriter, said answer) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(said)
}

// The outside every other file of this package reads through. [[spec/design_output/doors#a-door-reads-the-outside]]
var stderr io.Writer = os.Stderr

func argsOf() []string                     { return os.Args }
func exits(code int)                       { os.Exit(code) }
func envOf(key string) string              { return os.Getenv(key) }
func environOf() []string                  { return os.Environ() }
func pidOf() int                           { return os.Getpid() }
func workDirOf() (string, error)           { return os.Getwd() }
func executableOf() (string, error)        { return os.Executable() }
func readFile(path string) ([]byte, error) { return os.ReadFile(path) }
func writeFile(path string, data []byte, mode fs.FileMode) error {
	return os.WriteFile(path, data, mode)
}
func statOf(path string) (fs.FileInfo, error)     { return os.Stat(path) }
func lstatOf(path string) (fs.FileInfo, error)    { return os.Lstat(path) }
func makeDir(path string, mode fs.FileMode) error { return os.MkdirAll(path, mode) }
func removeFile(path string) error                { return os.Remove(path) }

// The stop a person or a swapped binary sends, so main waits on one channel and names no signal. [[spec/design_output/doors#a-door-reads-the-outside]]
func stops(swapped func(gone func())) <-chan struct{} {
	said := make(chan os.Signal, 1)
	signal.Notify(said, os.Interrupt, syscall.SIGTERM)
	swapped(func() { said <- os.Interrupt })
	out := make(chan struct{})
	go func() {
		<-said
		close(out)
	}()
	return out
}
