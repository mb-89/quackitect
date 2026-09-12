// The resident process that owns the database. One writer keeps the tree and
// the rows in step, and every reader asks the same warm cache.
// [[spec/design_output/index#the-door-owns-the-database]]
package main

import (
	"database/sql"
	"encoding/json"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/fsnotify/fsnotify"
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
}

func standingPath(root string) string {
	return filepath.Join(root, ".se", "index.json")
}

func Serve(root, at string) (*http.Server, net.Listener, error) {
	db, err := Open(root, at)
	if err != nil {
		return nil, nil, err
	}
	if _, err := Reindex(db, root); err != nil {
		return nil, nil, err
	}

	one := &door{db: db, root: root, dirty: make(chan struct{}, 1)}
	listen, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		return nil, nil, err
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/", one.took)
	server := &http.Server{Handler: mux, ReadHeaderTimeout: 5 * time.Second}

	go one.sweeps()
	go server.Serve(listen)

	eyes, err := watches(root, one)
	if err == nil {
		one.eyes = eyes
	}
	return server, listen, one.stands(listen)
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
		time.Sleep(200 * time.Millisecond) // the rest of a burst lands in this
		one.guard.Lock()
		one.settles()
		one.guard.Unlock()
	}
}

func (one *door) settles() {
	if one.pending.Swap(false) {
		Reindex(one.db, one.root)
	}
}

func (one *door) took(w http.ResponseWriter, r *http.Request) {
	var said call
	if err := json.NewDecoder(r.Body).Decode(&said); err != nil {
		writes(w, answer{Error: "the call reads as no JSON", ID: said.ID})
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
		Words  string `json:"words"`
		Target string `json:"target"`
		Path   string `json:"path"`
		Limit  int    `json:"limit"`
	}
	if len(said.Params) > 0 {
		json.Unmarshal(said.Params, &asked)
	}

	switch strings.ToLower(said.Method) {
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
	return said.ModTime().UTC().Format(time.RFC3339Nano) + ":" + strconv.FormatInt(said.Size(), 10)
}

// [[spec/design_output/index#a-door-comes-back]]
func stopsSoon(root string) {
	time.Sleep(100 * time.Millisecond)
	os.Remove(standingPath(root))
	os.Exit(0)
}

type errorOf string

func (one errorOf) Error() string { return string(one) }

func writes(w http.ResponseWriter, said answer) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(said)
}
