// The IO process: quack io dials the bus, runs the IO instances placed in it,
// and publishes each commit. Under shadow the index weighs each value it
// publishes against its own.
// [[spec/design_output/model#the-io-process]]
package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"sort"
	"sync"
	"time"

	"quackitect/src/index"
	"quackitect/src/modules/migration"
	"quackitect/src/q"
)

// The verb the IO process runs under, the slice's dotted key and its name in a row, the IO process's part on the bus, the span between two beats, the span a shadow value settles in, and the wait before a restart. [[spec/design_output/model#the-io-process]]
const (
	ioVerb         = "io"
	processesKey   = "migration." + migration.ProcessesKey
	processesSlice = migration.ProcessesKey
	ioPart         = "io"
	ioBeat         = 5 * time.Second
	shadowSettle   = 2 * time.Second
	ioRestart      = 5 * time.Second
)

// quack io: the IO process the index spawns, which runs the wiring's IO instances until the bus goes. [[spec/design_output/model#the-io-process]]
func ioMain() error {
	url, token := os.Getenv(index.BusEnv), os.Getenv(index.TokenEnv)
	if url == "" {
		return errors.New("quack io runs where the index spawns it, with the bus in its environment")
	}
	root, err := index.Root()
	if err != nil {
		return err
	}
	text, err := wiringOf(root, vehicleOf(os.Executable()))
	if err != nil {
		return err
	}
	w := q.Wiring{}
	if text != "" {
		if w, err = q.ReadWiring(text); err != nil {
			return err
		}
	}
	peer, err := index.Dial(url, token)
	if err != nil {
		return err
	}
	defer peer.Close()
	stop, err := ioOver(peer, root, ioStarts(w))
	if err != nil {
		return err
	}
	defer stop()
	<-peer.Done()
	return nil
}

// The start of each instance whose module carries one, keyed by the instance. [[spec/design_output/model#the-io-process]]
func ioStarts(w q.Wiring) map[string]index.Start {
	out := map[string]index.Start{}
	for _, one := range ioInstances(w) {
		out[one] = startOf(w, one, modules[moduleOf(w, one)], q.Writer{})
	}
	return out
}

// The start of one IO instance, committing its local names under the names the wiring binds, as hand. [[spec/design_output/model#the-wiring-file]]
func startOf(w q.Wiring, instance string, module ioModule, hand q.Writer) index.Start {
	return func(root string, commit index.Commit) (func(), error) {
		return module.starts(root, func(values map[string]any) error {
			bound := make(map[string]any, len(values))
			for local, value := range values {
				bound[w.Bound(instance, local)] = value
			}
			return commit(hand, bound)
		})
	}
}

// The instances the IO process runs: each whose module carries a start, in the wiring's order. [[spec/design_output/model#the-io-process]]
func ioInstances(w q.Wiring) []string {
	out := []string{}
	for _, one := range w.Instances {
		if module, ok := modules[one.Module]; ok && module.starts != nil {
			out = append(out, one.Name)
		}
	}
	return out
}

func moduleOf(w q.Wiring, instance string) string {
	for _, one := range w.Instances {
		if one.Name == instance {
			return one.Module
		}
	}
	return ""
}

// Runs each start over the bus, publishing what it commits on commit.<instance>, and answers the stop of them all. [[spec/design_output/model#the-io-process]]
func runsIO(url, token string, starts map[string]index.Start) (func(), error) {
	peer, err := index.Dial(url, token)
	if err != nil {
		return nil, err
	}
	stop, err := ioOver(peer, "", starts)
	if err != nil {
		peer.Close()
		return nil, err
	}
	return func() {
		stop()
		peer.Close()
	}, nil
}

// Watches the index's beat on lease.index, and writes a watchdog row where it falls silent past the term. [[spec/design_output/model#the-watcher-of-the-watchdog]]
func watchesIndex(peer *index.Peer, term time.Duration, say func(row map[string]any) error) (func(), error) {
	return func() {}, nil
}

// Each start commits over the peer under its instance, and the IO process beats its lease while it runs. [[spec/design_output/model#a-lease]]
func ioOver(peer *index.Peer, root string, starts map[string]index.Start) (func(), error) {
	var stops []func()
	halt := func() {
		for _, one := range stops {
			one()
		}
	}
	for instance, start := range starts {
		stop, err := start(root, func(_ q.Writer, values map[string]any) error { return peer.Commit(instance, values) })
		if err != nil {
			halt()
			return nil, fmt.Errorf("%s starts not: %w", instance, err)
		}
		stops = append(stops, stop)
	}
	beats, quit := time.NewTicker(ioBeat), make(chan struct{})
	go func() {
		for {
			select {
			case <-quit:
				return
			case <-beats.C:
				_ = peer.Beat(ioPart)
			}
		}
	}()
	return func() {
		beats.Stop()
		close(quit)
		halt()
	}, nil
}

// Under the processes slice's shadow, the index spawns quack io beside its own IO starts, and weighs each value it commits. Under any other mode it spawns nothing. [[spec/tickets/the-doors-process-stands]]
func ioShadow(root string, store *q.Store, instances []string) (*index.Bus, func(), error) {
	if sliceMode(root, processesKey) != modeShadow || len(instances) == 0 {
		return nil, func() {}, nil
	}
	self, err := os.Executable()
	if err != nil {
		return nil, nil, err
	}
	bus, err := index.StartBus()
	if err != nil {
		return nil, nil, err
	}
	weighs := shadows{
		read:   func(name string) any { return store.Snapshot().Read(name) },
		settle: shadowSettle,
		wait:   time.Sleep,
		say:    appendsRow(root, time.Now),
		newest: &sends{at: map[string]int64{}},
	}
	held := make(map[string]q.Writer, len(instances))
	for _, one := range instances {
		held[one] = q.Writer{}
	}
	placed := index.Placed{
		Name: ioPart, Command: []string{self, ioVerb}, Instances: held, Restart: ioRestart,
		Heard: func(_ string, values map[string]json.RawMessage) { go weighs.weigh(values) },
	}
	stop, err := placed.Start(bus, store)
	if err != nil {
		bus.Close()
		return nil, nil, err
	}
	return bus, func() {
		stop()
		bus.Close()
	}, nil
}

// The index's side of the shadow: what the store holds for a name, the span a value settles in, and where a row goes. [[spec/design_input/the-migration-runs-in-slices#how-a-slice-moves]]
type shadows struct {
	read   func(name string) any
	settle time.Duration
	wait   func(time.Duration)
	say    func(row map[string]any) error
	// The count each name's newest value carries, so a value a newer one follows weighs nothing. A nil weighs every value. [[spec/tickets/the-doors-process-stands]]
	newest *sends
}

// The name the shadow's own rows move, which the weigh skips, since each row it writes moves it again. [[spec/tickets/the-doors-process-stands]]
const shadowsOwnLog = "files/" + sessionLog

// [[spec/tickets/the-doors-process-stands]]
type sends struct {
	mu   sync.Mutex
	at   map[string]int64
	next int64
}

// Marks each name as sent now, and answers the count each takes. [[spec/tickets/the-doors-process-stands]]
func (s *sends) mark(names []string) map[string]int64 {
	out := make(map[string]int64, len(names))
	if s == nil {
		return out
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	for _, name := range names {
		s.next++
		s.at[name], out[name] = s.next, s.next
	}
	return out
}

// Whether the value marked at stands the newest of its name. [[spec/tickets/the-doors-process-stands]]
func (s *sends) still(name string, at int64) bool {
	if s == nil {
		return true
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.at[name] == at
}

// Weighs each value the IO process commits against the store's, once the span passes, and writes a shadow row for each value apart. [[spec/design_input/the-migration-runs-in-slices#how-a-slice-moves]]
func (s shadows) weigh(values map[string]json.RawMessage) {
	names := make([]string, 0, len(values))
	for name := range values {
		if name != shadowsOwnLog {
			names = append(names, name)
		}
	}
	sort.Strings(names)
	marks := s.newest.mark(names)
	s.wait(s.settle)
	for _, name := range names {
		if !s.newest.still(name, marks[name]) {
			continue
		}
		old, err := json.Marshal(s.read(name))
		if err != nil {
			continue
		}
		var now bytes.Buffer
		if json.Compact(&now, values[name]) != nil || bytes.Equal(old, now.Bytes()) {
			continue
		}
		row := map[string]any{
			"level": "info", "kind": shadowKind, "slice": processesSlice, "name": name,
			"said": fmt.Sprintf("%s in shadow: %s reads apart in the IO process", processesSlice, name),
			"old":  capped(string(old)), "new": capped(now.String()),
		}
		if err := s.say(row); err != nil {
			fmt.Fprintln(os.Stderr, err)
		}
	}
}
