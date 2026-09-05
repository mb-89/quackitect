package main

import (
	"os"
	"path/filepath"
	"testing"
	"time"

	"github.com/fsnotify/fsnotify"
)

// THE BENCHMARKS. Everything that is about time lives here and runs from
// util/checks/benchmark.sh at the retro, never in the battery. The battery
// answers whether the program behaves, and a number that depends on the
// machine and its load is not an answer to that. A benchmark decides only
// as a comparison: two runs on one machine, with the machine written
// beside the number, which the script does.

// BenchmarkReindex is a full scan over a small tree: what the daemon pays
// at start and after an overflow.
func BenchmarkReindex(b *testing.B) {
	r := aTreeToIndexB(b)
	db, err := openIndex(r)
	if err != nil {
		b.Fatal(err)
	}
	defer db.Close()
	b.ResetTimer()
	for b.Loop() {
		if _, err := Reindex(r, db); err != nil {
			b.Fatal(err)
		}
	}
}

// BenchmarkPingOverTheSocket is one round trip to the model: what every
// client verb pays before its own work.
func BenchmarkPingOverTheSocket(b *testing.B) {
	r := aTreeToIndexB(b)
	log, err := OpenLog(filepath.Join(b.TempDir(), "log"))
	if err != nil {
		b.Fatal(err)
	}
	defer log.Close()
	stop, socket, _ := StartIndexer(b.Context(), r, log, time.Hour)
	if socket == "" {
		b.Fatal("the model did not listen")
	}
	defer stop()
	SayRunning(r, Running{PID: os.Getpid(), Socket: socket, Build: Build})
	defer StopSaying(r)
	b.ResetTimer()
	for b.Loop() {
		if _, _, ok := askModel(r, "ping", nil); !ok {
			b.Fatal("the model did not answer")
		}
	}
}

// BenchmarkWatcherDelivery is how long the operating system takes to report
// a written file: the one number the battery used to wait on.
func BenchmarkWatcherDelivery(b *testing.B) {
	dir := b.TempDir()
	w, err := openFSWatcher()
	if err != nil {
		b.Fatal(err)
	}
	defer w.Close()
	if err := w.Watch(dir); err != nil {
		b.Fatal(err)
	}
	if !w.Hears(filepath.Join(dir, "cookie.tmp")) {
		b.Skip("this mount delivers no events")
	}
	b.ResetTimer()
	for i := 0; b.Loop(); i++ {
		name := filepath.Join(dir, "written.md")
		if err := os.WriteFile(name, []byte{byte(i)}, 0o644); err != nil {
			b.Fatal(err)
		}
		for ev := range w.Events() {
			if filepath.Clean(ev.Name) == name && ev.Has(fsnotify.Write|fsnotify.Create) {
				break
			}
		}
	}
}

// aTreeToIndexB is aTreeToIndex for a benchmark.
func aTreeToIndexB(b *testing.B) Roots {
	b.Helper()
	root := b.TempDir()
	r := Roots{Method: root, Work: root}
	work := filepath.Join(root, ".se", "work")
	if err := os.MkdirAll(work, 0o755); err != nil {
		b.Fatal(err)
	}
	for _, name := range []string{"wk-one", "wk-two", "wk-three"} {
		text := "---\nkind: [[work-token]]\ntitle: " + name + "\n---\n\n## detail\n\nA note the benchmark wrote, long enough to be a passage of its own.\n"
		if err := os.WriteFile(filepath.Join(work, name+".md"), []byte(text), 0o644); err != nil {
			b.Fatal(err)
		}
	}
	return r
}
