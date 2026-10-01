// The outsides of the search and waits modules: the rows the index reads hand
// the find, and the clock, the config, the session's reports and a process's
// life the wait reads.
// [[spec/tickets/find-and-wait-in-go]]
package main

import (
	"os"
	"runtime"
	"strings"
	"sync"
	"syscall"
	"time"

	settingsreader "quackitect/src/config"
	"quackitect/src/index"
	"quackitect/src/modules/search"
	"quackitect/src/modules/session"
	"quackitect/src/modules/waits"
	"quackitect/src/q"
)

// The config keys a wait reads, in seconds, and the store read naming every session's reports. [[spec/design_output/level0#the-wait-returns-on-signals]]
const (
	waitMostKey  = "wait.most"
	waitQuietKey = "wait.quiet"
	reportsRead  = "session/" + session.ReportsPort
	reportsFrom  = "session/"
	reportsAt    = "/reports"
)

// The find reads the index's rows at the limit the door's own find takes. [[spec/tickets/find-and-wait-in-go]]
func searchOutside(root string, reads index.Reads) search.Outside {
	return search.Outside{Root: root, Find: func(words string) ([]search.Row, error) {
		hits, err := readsOf(reads).Find(words, 0)
		if err != nil {
			return nil, err
		}
		rows := make([]search.Row, 0, len(hits))
		for _, one := range hits {
			rows = append(rows, search.Row{Path: one.Path, Line: one.Line, Text: one.Text})
		}
		return rows, nil
	}}
}

// [[spec/tickets/find-and-wait-in-go]]
func waitsOutside(root string, store *q.Store) waits.Outside {
	return waits.Outside{
		Root: root, Now: time.Now, Pause: time.Sleep,
		Most:     time.Duration(settingsreader.Count(root, waitMostKey)) * time.Second,
		Quiet:    time.Duration(settingsreader.Count(root, waitQuietKey)) * time.Second,
		Reported: reportsHeard(store),
		Alive:    alive,
	}
}

// The helpers that report, off the derived over every session at the start and off each session's reports fold as it commits, since a derived settles in the index's wave alone. [[spec/tickets/find-and-wait-in-go]]
func reportsHeard(store *q.Store) func(agent string) bool {
	if store == nil {
		return func(string) bool { return false }
	}
	var mu sync.Mutex
	heard := map[string]bool{}
	hear := func(agents []string) {
		mu.Lock()
		defer mu.Unlock()
		for _, one := range agents {
			heard[one] = true
		}
	}
	started, _ := store.Snapshot().Read(reportsRead).([]string)
	hear(started)
	store.OnCommit(func(values map[string]any) {
		for name, value := range values {
			if agents, ok := value.([]string); ok && strings.HasPrefix(name, reportsFrom) && strings.HasSuffix(name, reportsAt) {
				hear(agents)
			}
		}
	})
	return func(agent string) bool {
		mu.Lock()
		defer mu.Unlock()
		return heard[agent]
	}
}

// A process stands alive where it takes signal zero. Windows takes no signal, so there a process stands alive while it opens. [[spec/tickets/find-and-wait-in-go]]
func alive(pid int) bool {
	one, err := os.FindProcess(pid)
	if err != nil {
		return false
	}
	if runtime.GOOS == "windows" {
		one.Release()
		return true
	}
	return one.Signal(syscall.Signal(0)) == nil
}

// Reads with no index behind them find nothing. [[spec/tickets/find-and-wait-in-go]]
func readsOf(reads index.Reads) index.Reads {
	if reads == nil {
		return noReads{}
	}
	return reads
}

type noReads struct{}

func (noReads) Find(string, int) ([]index.Hit, error) { return nil, nil }
