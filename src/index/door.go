// The resident process that owns the database. One writer keeps the tree and
// the rows in step, and every reader asks the same warm cache.
// [[spec/design_output/index#the-door-owns-the-database]]
package main

import (
	"database/sql"
	"encoding/json"
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
	"sync/atomic"
	"syscall"
	"time"

	"github.com/fsnotify/fsnotify"
)

const (
	headerReadTimeout = 5 * time.Second
	burstSettleDelay  = 200 * time.Millisecond
	decimalBase       = 10
	stopGraceDelay    = 100 * time.Millisecond
	// A changes call waits this long for a sweep, under the wait a caller gives a post. [[spec/design_output/index#the-index-fires-on-change]]
	changesWait = 25 * time.Second
)

type Standing struct {
	Port  int    `json:"port"`
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
	root  string
	guard sync.Mutex
	dirty chan struct{}
	eyes  *fsnotify.Watcher

	pending atomic.Bool

	// The count of sweeps so far, and the channel a sweep closes to wake every waiting changes call. [[spec/design_output/index#the-index-fires-on-change]]
	tick     atomic.Int64
	wake     chan struct{}
	wakeLock sync.Mutex
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

func Serve(root, at string) (func(), net.Listener, error) {
	db, err := Open(root, at)
	if err != nil {
		return nil, nil, err
	}
	if _, err := Reindex(db, root); err != nil {
		return nil, nil, err
	}

	one := &door{db: db, root: root, dirty: make(chan struct{}, 1), wake: make(chan struct{})}
	one.tick.Store(1)
	listen, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		return nil, nil, err
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/", one.took)
	server := &http.Server{Handler: mux, ReadHeaderTimeout: headerReadTimeout}

	go one.sweeps()
	go server.Serve(listen)

	eyes, err := watches(root, one)
	if err == nil {
		one.eyes = eyes
	}
	// The stop lets go of the database and the watch too, so a test's folder clears on Windows. [[spec/design_output/index#the-door-owns-the-database]]
	stop := func() {
		server.Close()
		if one.eyes != nil {
			one.eyes.Close()
		}
		one.db.Close()
	}
	return stop, listen, one.stands(listen)
}

func (one *door) stands(listen net.Listener) error {
	if err := os.MkdirAll(filepath.Dir(standingPath(one.root)), 0o755); err != nil {
		return err
	}
	said, err := json.Marshal(Standing{
		Port:  listen.Addr().(*net.TCPAddr).Port,
		Pid:   os.Getpid(),
		Root:  one.root,
		Stamp: stampHere(),
	})
	if err != nil {
		return err
	}
	return os.WriteFile(standingPath(one.root), append(said, '\n'), 0o644)
}

func (one *door) Touched() {
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
		one.settles()
		one.guard.Unlock()
	}
}

func (one *door) settles() {
	if one.pending.Swap(false) {
		Reindex(one.db, one.root)
		one.moved()
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

func (one *door) answers(said call) (any, error) {
	var asked struct {
		Words  string   `json:"words"`
		Target string   `json:"target"`
		Path   string   `json:"path"`
		Paths  []string `json:"paths"`
		Limit  int      `json:"limit"`
	}
	if len(said.Params) > 0 {
		json.Unmarshal(said.Params, &asked)
	}

	switch strings.ToLower(said.Method) {
	case "files":
		return Files(one.db)
	case "texts":
		return Texts(one.db, asked.Paths)
	case "grep":
		var ask GrepAsk
		if err := json.Unmarshal(said.Params, &ask); err != nil {
			return nil, err
		}
		return Grep(one.db, ask)
	case "glob":
		var ask GlobAsk
		if err := json.Unmarshal(said.Params, &ask); err != nil {
			return nil, err
		}
		return Glob(one.db, ask)
	case "find":
		return Find(one.db, asked.Words, asked.Limit)
	case "notes":
		return Notes(one.db, asked.Words, asked.Limit)
	case "links":
		return Links(one.db, asked.Target)
	case "dangling":
		return Dangling(one.db)
	case "tickets":
		return Tickets(one.db)
	case "same":
		return Same(one.db, asked.Path)
	case "reindex":
		count, err := Reindex(one.db, one.root)
		return map[string]int{"files": count}, err
	case "stop":
		go stopsSoon(one.root)
		return map[string]string{"stopping": one.root}, nil
	case "standing":
		var files int
		one.db.QueryRow(`SELECT count(*) FROM file`).Scan(&files)
		return map[string]any{"root": one.root, "files": files}, nil
	}
	return nil, errorOf("no method called " + said.Method)
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
