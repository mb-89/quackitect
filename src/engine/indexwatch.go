package main

import (
	"database/sql"
	"errors"
	"os"
	"path/filepath"
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
func StartIndexer(r Roots, log *Log, beat time.Duration) (stop func(), socket string, askedToStop <-chan struct{}) {
	db, err := openIndex(r)
	if err != nil {
		log.Write("engine", "error", "engine", "the index could not be opened, so the engine reads the files", No(),
			map[string]any{"reason": err.Error()})
		return func() {}, "", nil
	}
	// THE MODEL ANSWERS ON A READ-ONLY CONNECTION, so a question that arrives
	// on the socket cannot write, whatever it says.
	ro, err := sql.Open("sqlite3", indexDSN(indexPath(r), true))
	if err != nil {
		db.Close()
		log.Write("engine", "error", "engine", "the index could not be opened read-only", No(),
			map[string]any{"reason": err.Error()})
		return func() {}, "", nil
	}
	asked := make(chan struct{}, 1)
	m := &model{db: ro, roots: r, askedToStop: asked}
	ln, addr, err := listenModel(r)
	if err != nil {
		log.Write("engine", "error", "engine", "the model cannot listen, so every reader reads the index file", No(),
			map[string]any{"reason": err.Error()})
		addr = ""
	} else {
		go serveModel(ln, m)
	}

	done := make(chan struct{})
	stopped := make(chan struct{})
	go func() {
		defer close(stopped)
		defer db.Close()
		defer ro.Close()
		runIndexer(r, log, beat, done, db, m)
	}()
	return func() {
		close(done)
		if ln != nil {
			ln.Close()
			_ = os.Remove(addr) // the socket file is the engine's, and it is gone with it
		}
		<-stopped
	}, addr, asked
}

func runIndexer(r Roots, log *Log, beat time.Duration, done <-chan struct{}, db *sql.DB, m *model) {
	w, err := fsnotify.NewBufferedWatcher(4096)
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
	watching := hearsTheCookie(w, r)
	_ = setMeta(db, "watching", yesNo(watching)) // the beat below says it again every tick
	_ = setMeta(db, "beat", beatAt(time.Now()))
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
		case ev, ok := <-w.Events:
			if !ok {
				return
			}
			if onEvent(w, r, db, ev) {
				m.moved()
			}
		case err, ok := <-w.Errors:
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
func watchTree(w *fsnotify.Watcher, r Roots) error {
	return filepath.WalkDir(r.Work, func(abs string, d os.DirEntry, err error) error {
		if err != nil || !d.IsDir() {
			return nil
		}
		if _, skip := indexRel(r, abs, true); skip {
			return filepath.SkipDir
		}
		return w.AddWith(abs, fsnotify.WithBufferSize(watchBuffer))
	})
}

// onEvent brings one path into step, and says whether a row moved. A rename
// arrives as a remove and a create, and an editor's atomic save as a
// rename, so what matters is the path and not the kind: the file is
// re-read, or dropped when it is gone.
func onEvent(w *fsnotify.Watcher, r Roots, db *sql.DB, ev fsnotify.Event) bool {
	info, err := os.Stat(ev.Name)
	if err == nil && info.IsDir() {
		if ev.Has(fsnotify.Create) {
			if _, skip := indexRel(r, ev.Name, true); !skip {
				_ = w.AddWith(ev.Name, fsnotify.WithBufferSize(watchBuffer)) // a folder it cannot watch is caught by the next scan
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

// hearsTheCookie writes a file under the private folder and waits for the
// watcher to report it. The cookie is removed either way.
func hearsTheCookie(w *fsnotify.Watcher, r Roots) bool {
	cookie := r.Private("index.cookie.tmp")
	defer os.Remove(cookie)
	if err := os.WriteFile(cookie, []byte(time.Now().String()), 0o644); err != nil {
		return false
	}
	deadline := time.After(cookieBudget)
	for {
		select {
		case ev := <-w.Events:
			if filepath.Clean(ev.Name) == filepath.Clean(cookie) {
				return true
			}
		case <-w.Errors:
		case <-deadline:
			return false
		}
	}
}

func yesNo(b bool) string {
	if b {
		return "yes"
	}
	return "no"
}
