package main

import (
	"context"
	"database/sql"
	"errors"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/fsnotify/fsnotify"
)

// THE INDEXER. The resident engine watches the tree and keeps the index in
// step with it, one file per event.
//
// A FULL SCAN RUNS TWICE: on start, and when the watcher says it lost
// events. Never on a timer, because at the size the tree is heading for a
// timer costs tenths of a second and says nothing the watcher did not.
//
// A DEAF WATCHER IS FOUND OUT AT THE START. Some mounts deliver no events,
// and a daemon over one of those would beat on while its index went stale.
// So the indexer plants a cookie file and waits for its own event, and marks
// the index unwatched when none comes. A reader that sees that mark reads the
// files, which is the cold path Level 0 holds without any daemon.

// cookieBudget is how long the watcher has to report the cookie.
const cookieBudget = 2 * time.Second

// A WATCHER IS WHAT TELLS THE INDEXER A PATH CHANGED. The real one is
// fsnotify, and it delivers on the operating system's clock. A test feeds
// one by hand, so the test decides what arrives and in what order, and no
// test waits on a clock for the tree to be noticed. The one timed thing,
// hearing the cookie, is behind the same door: the real watcher waits for
// it at every start and says whether it came, and a fed one says what the
// test told it to.
type watcher interface {
	Events() <-chan fsnotify.Event
	Errors() <-chan error
	Watch(path string) error
	// Hears says whether the watcher reports a file written at path. The
	// real watcher writes it and waits; that wait is the daemon's own
	// self-check at start, and the battery reads its result off the engine.
	Hears(cookie string) bool
	Close() error
}

// fsWatcher is the operating system's watcher.
type fsWatcher struct{ w *fsnotify.Watcher }

func openFSWatcher() (watcher, error) {
	w, err := fsnotify.NewBufferedWatcher(4096)
	if err != nil {
		return nil, err
	}
	return fsWatcher{w}, nil
}

func (f fsWatcher) Events() <-chan fsnotify.Event { return f.w.Events }
func (f fsWatcher) Errors() <-chan error          { return f.w.Errors }
func (f fsWatcher) Close() error                  { return f.w.Close() }
func (f fsWatcher) Watch(path string) error {
	return f.w.AddWith(path, fsnotify.WithBufferSize(watchBuffer))
}

// Hears writes the cookie and waits for the watcher to report it. The
// cookie is removed either way.
func (f fsWatcher) Hears(cookie string) bool {
	defer os.Remove(cookie)
	if err := os.WriteFile(cookie, []byte(time.Now().String()), 0o644); err != nil {
		return false
	}
	deadline := time.After(cookieBudget)
	for {
		select {
		case ev := <-f.w.Events:
			if filepath.Clean(ev.Name) == filepath.Clean(cookie) {
				return true
			}
		case <-f.w.Errors:
		case <-deadline:
			return false
		}
	}
}

// watchBuffer is the size of the buffer the watcher reads events into. On
// Windows a full buffer is an overflow and the answer is a full scan, so it
// is set well above the default and an overflow stays rare.
const watchBuffer = 1 << 20

// StartIndexer opens the index, listens for questions, builds the index and
// starts watching. It answers a function that stops all of it, and the
// address the model answers on, which is empty when there is none. Every
// failure is written to the record and the engine goes on without an index,
// because the index is a cache and the engine is not.
//
// THE SOCKET IS OPEN BEFORE THE SCAN. A client that connects during the
// first scan is answered from what is indexed so far, with the revision
// saying so, rather than refused for the length of the scan.
//
// THE CONTEXT IS THE OWNER. Its end begins the shutdown, once, and stop is
// how a caller waits for that shutdown to finish. A test that hands t.Context
// and never calls stop gets the shutdown begun at its end, and a test that
// wants it finished calls stop.
func StartIndexer(ctx context.Context, r Roots, log *Log, beat time.Duration) (stop func(), socket string, asked Asks) {
	stop, socket, asked, _ = startIndexer(ctx, r, log, beat, openFSWatcher)
	return stop, socket, asked
}

// Asks are what a client can set going over the socket that the engine's own
// loop has to finish. Both are things the answer to one call cannot do for
// itself: stopping ends the process that owes the answer, and swapping has to
// wait for the calls in flight, of which this is one.
type Asks struct {
	Stop <-chan struct{}
	Swap <-chan swapPlan
}

// startIndexer is StartIndexer with the watcher chosen by the caller. It also
// answers the index handles the shutdown closes, so a test can ask them.
func startIndexer(ctx context.Context, r Roots, log *Log, beat time.Duration, open func() (watcher, error)) (stop func(), socket string, asked Asks, handles []*sql.DB) {
	db, err := openIndex(r)
	if err != nil {
		log.Write("engine", "error", "engine", "the index could not be opened, so the engine reads the files", No(),
			map[string]any{"reason": err.Error()})
		return func() {}, "", Asks{}, nil
	}
	// THE MODEL ANSWERS ON A READ-ONLY CONNECTION, so a question that arrives
	// on the socket cannot write, whatever it says.
	ro, err := sql.Open("sqlite3", indexDSN(indexPath(r), true))
	if err != nil {
		db.Close()
		log.Write("engine", "error", "engine", "the index could not be opened read-only", No(),
			map[string]any{"reason": err.Error()})
		return func() {}, "", Asks{}, nil
	}
	toStop := make(chan struct{}, 1)
	toSwap := make(chan swapPlan, 1)
	m := &model{ctx: ctx, db: ro, roots: r, askedToStop: toStop, askedToSwap: toSwap}
	ln, addr, err := listenModel(r)
	if err != nil {
		log.Write("engine", "error", "engine", "the model cannot listen, so every reader reads the index file", No(),
			map[string]any{"reason": err.Error()})
		addr = ""
	} else {
		go serveModel(ctx, ln, m)
	}

	done := make(chan struct{})
	stopped := make(chan struct{})
	go func() {
		defer close(stopped)
		defer db.Close()
		defer ro.Close()
		runIndexer(r, log, beat, done, db, m, open)
	}()
	// ONE SHUTDOWN, FROM WHICHEVER COMES FIRST: the context ending or the
	// caller's stop. Closing the listener ends serveModel, so the socket
	// server has the same owner as the loop.
	var once sync.Once
	shutdown := func() {
		once.Do(func() {
			close(done)
			if ln != nil {
				ln.Close()
				_ = os.Remove(addr) // the socket file is the engine's, and it is gone with it
			}
		})
	}
	// The context runs the shutdown whenever it ends, and it does so even
	// after the loop has returned of its own accord, which it does on every
	// degraded run above. A goroutine that watched the loop as well would
	// have left with it, and the socket would then outlive its owner.
	context.AfterFunc(ctx, shutdown)
	return func() {
		shutdown()
		<-stopped
	}, addr, Asks{Stop: toStop, Swap: toSwap}, []*sql.DB{db, ro}
}

func runIndexer(r Roots, log *Log, beat time.Duration, done <-chan struct{}, db *sql.DB, m *model, open func() (watcher, error)) {
	w, err := open()
	if err != nil {
		log.Write("engine", "error", "engine", "the tree cannot be watched, so the index is not kept", No(),
			map[string]any{"reason": err.Error()})
		return
	}
	defer w.Close()

	got, err := Reindex(r, db)
	if err != nil {
		log.Write("engine", "error", "engine", "the index could not be built", No(),
			map[string]any{"reason": err.Error()})
		return
	}
	m.moved()
	if err := watchTree(w, r); err != nil {
		log.Write("engine", "error", "engine", "the tree cannot be watched, so the index is not kept", No(),
			map[string]any{"reason": err.Error()})
		return
	}
	watching := w.Hears(r.Private("index.cookie.tmp"))
	_ = setMeta(db, "watching", yesNo(watching)) // the beat below says it again every tick
	_ = setMeta(db, "beat", beatAt(time.Now()))
	m.watching.Store(watching)
	m.ready.Store(true)
	// THE MAP FROM TESTS TO SOURCE IS FILLED IN THE BACKGROUND, one test at
	// a time, and again whenever a run or a changed test file asks.
	go mapTests(r, log, done, remap)
	askToMap()
	log.Write("engine", "index", "engine", "the index is built and the tree is watched", &watching,
		map[string]any{"seen": got.Seen, "written": got.Written, "dropped": got.Dropped, "watching": watching})
	if !watching {
		log.Write("engine", "error", "engine",
			"the watcher reported nothing for a file the engine wrote, so the index is not trusted", No(),
			map[string]any{"fix": "a tree on a mount that delivers no events is read cold"})
	}

	ticker := time.NewTicker(beat)
	defer ticker.Stop()
	for {
		select {
		case <-done:
			return
		case <-ticker.C:
			_ = setMeta(db, "beat", beatAt(time.Now()))
			_ = setMeta(db, "watching", yesNo(watching))
		case ev, ok := <-w.Events():
			if !ok {
				return
			}
			if onEvent(w, r, db, ev) {
				m.moved()
				if strings.HasSuffix(ev.Name, "_test.go") || strings.Contains(filepath.ToSlash(ev.Name), "/"+checksDir+"/") {
					askToMap()
				}
			}
		case err, ok := <-w.Errors():
			if !ok {
				return
			}
			// AN OVERFLOW IS A SIGNAL, and the answer to it is one full scan.
			if errors.Is(err, fsnotify.ErrEventOverflow) {
				if _, err := Reindex(r, db); err != nil {
					log.Write("engine", "error", "engine", "the index could not be rebuilt after an overflow", No(),
						map[string]any{"reason": err.Error()})
				}
				m.moved()
				continue
			}
			log.Write("engine", "error", "engine", "the watcher reported an error", No(),
				map[string]any{"reason": err.Error()})
		}
	}
}

// watchTree adds every folder the index covers. The watcher is not
// recursive, so each folder is added, and a folder made later is added when
// its creation arrives as an event.
func watchTree(w watcher, r Roots) error {
	return filepath.WalkDir(r.Work, func(abs string, d os.DirEntry, err error) error {
		if err != nil || !d.IsDir() {
			return nil
		}
		if _, skip := indexRel(r, abs, true); skip {
			return filepath.SkipDir
		}
		return w.Watch(abs)
	})
}

// onEvent brings one path into step, and says whether a row moved. A rename
// arrives as a remove and a create, and an editor's atomic save as a
// rename, so what matters is the path and not the kind: the file is
// re-read, or dropped when it is gone.
func onEvent(w watcher, r Roots, db *sql.DB, ev fsnotify.Event) bool {
	info, err := os.Stat(ev.Name)
	if err == nil && info.IsDir() {
		if ev.Has(fsnotify.Create) {
			if _, skip := indexRel(r, ev.Name, true); !skip {
				_ = w.Watch(ev.Name) // a folder it cannot watch is caught by the next scan
			}
		}
		return false
	}
	rel, skip := indexRel(r, ev.Name, false)
	if skip || rel == "" {
		return false
	}
	if err != nil {
		_ = dropOne(db, rel) // a row it cannot drop is dropped by the next scan
		return true
	}
	_ = indexOne(db, r, ev.Name, rel, info) // a row it cannot write is written by the next scan
	_ = resolveLinks(db)
	return true
}

func yesNo(b bool) string {
	if b {
		return "yes"
	}
	return "no"
}
