package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"quackitect/engine/internal/version"
	"testing"
	"time"

	"github.com/fsnotify/fsnotify"
)

// A FED WATCHER DELIVERS WHAT THE TEST SENDS, AND NOTHING ELSE. The
// operating system's watcher delivers on its own clock, and a test that
// waited for it failed once under the battery's load for no defect of the
// program's. So the daemon under test is given this one, and the test
// decides what arrives and in what order. Nothing here sleeps or polls.
type fedWatcher struct {
	events chan fsnotify.Event
	errors chan error
	hears  bool
	r      Roots
}

func feedWatcher(r Roots, hears bool) *fedWatcher {
	return &fedWatcher{events: make(chan fsnotify.Event), errors: make(chan error), hears: hears, r: r}
}

func (f *fedWatcher) open() (watcher, error)        { return f, nil }
func (f *fedWatcher) Events() <-chan fsnotify.Event { return f.events }
func (f *fedWatcher) Errors() <-chan error          { return f.errors }
func (f *fedWatcher) Watch(string) error            { return nil }
func (f *fedWatcher) Hears(string) bool             { return f.hears }
func (f *fedWatcher) Close() error                  { return nil }

// settle returns once the indexer is back at its loop. The channel is
// unbuffered, so the send completes only when the loop takes it, and the
// loop takes it only after the first scan, the cookie, and everything sent
// before it. The event names a .tmp path, which the indexer ignores.
func (f *fedWatcher) settle() {
	f.events <- fsnotify.Event{Name: filepath.Join(f.r.Work, "settle.tmp"), Op: fsnotify.Chmod}
}

// feed delivers one event and returns once the indexer has handled it.
func (f *fedWatcher) feed(name string, op fsnotify.Op) {
	f.events <- fsnotify.Event{Name: name, Op: op}
	f.settle()
}

// aFedDaemon starts the indexer over r with a fed watcher, published the way
// the engine publishes it, and returns once its first scan is done. The beat
// is an hour so no tick lands during a test; the beat written at start is
// what a reader checks.
func aFedDaemon(t *testing.T, r Roots, hears bool) (*fedWatcher, func()) {
	t.Helper()
	if err := os.MkdirAll(r.Private("log"), 0o755); err != nil {
		t.Fatal(err)
	}
	log, err := OpenLog(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	fed := feedWatcher(r, hears)
	stop, socket, _, _ := startIndexer(t.Context(), r, log, time.Hour, fed.open)
	if socket == "" {
		t.Fatal("the model did not listen")
	}
	SayRunning(r, Running{PID: os.Getpid(), Socket: socket, Build: version.Build})
	stopped := false
	stopAll := func() {
		if !stopped {
			stopped = true
			stop()
			StopSaying(r)
			log.Close()
		}
	}
	t.Cleanup(stopAll)
	fed.settle()
	return fed, stopAll
}

// A DEAF WATCHER IS FOUND OUT AT THE START, and the index is not trusted.
// The daemon says so on a ping, which is what the battery reads.
func TestAnUnheardCookieLeavesTheIndexUntrusted(t *testing.T) {
	t.Parallel()
	r := aTreeToIndex(t)
	aFedDaemon(t, r, false)

	if _, _, trusted := privateCopyInIndex(r, "anything"); trusted {
		t.Fatal("an index whose watcher heard nothing was trusted")
	}
	raw, _, ok := askModel(r, "ping", nil)
	if !ok {
		t.Fatal("the model did not answer a ping")
	}
	var pong struct {
		Ready    bool `json:"ready"`
		Watching bool `json:"watching"`
	}
	if json.Unmarshal(raw, &pong) != nil || !pong.Ready || pong.Watching {
		t.Fatalf("the ping said %s, want ready and not watching", raw)
	}
}
