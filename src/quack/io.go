// The IO process: quack io dials the bus, runs the IO instances placed in it,
// and publishes each commit, which the index lands.
// [[spec/design_output/model#the-io-process]]
package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"sort"
	"sync"
	"time"

	"quackitect/src/index"
	manager "quackitect/src/modules/index"
	"quackitect/src/q"
)

// The verb the IO process runs under, the placements key, the IO process's part on the bus, the index's part, the ticks a lease term holds, the span between two beats, the wait before a restart, and the longest a reader waits on the processes' answers. [[spec/design_output/model#the-io-process]]
const (
	ioVerb        = "io"
	placementsKey = "processes.placements"
	ioPart        = "io"
	indexPart     = "index"
	watchSteps    = 4
	ioBeat        = 5 * time.Second
	ioRestart     = 5 * time.Second
	answerWait    = 30 * time.Second
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
	w, err := spawnedWiring(root)
	if err != nil {
		return err
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

// The wiring a process the index spawns reads: the work root's, then its vehicle's, and none where neither stands. [[spec/design_output/model#the-wiring-file]]
func spawnedWiring(root string) (q.Wiring, error) {
	text, err := wiringOf(root, vehicleOf(os.Executable()))
	if err != nil || text == "" {
		return q.Wiring{}, err
	}
	return q.ReadWiring(text)
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
	var mu sync.Mutex
	last, said := time.Now(), false
	stop, err := peer.Leases(func(part string) {
		if part != indexPart {
			return
		}
		mu.Lock()
		last, said = time.Now(), false
		mu.Unlock()
	})
	if err != nil {
		return nil, err
	}
	ticks, quit := time.NewTicker(term/watchSteps), make(chan struct{})
	go func() {
		for {
			select {
			case <-quit:
				return
			case <-ticks.C:
				mu.Lock()
				silent, since := !said && time.Since(last) > term, last
				if silent {
					said = true
				}
				mu.Unlock()
				if silent {
					_ = say(map[string]any{"kind": "watchdog", "part": indexPart, "since": since.UTC().Format(time.RFC3339Nano)})
				}
			}
		}
	}()
	return func() {
		ticks.Stop()
		close(quit)
		stop()
	}, nil
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
		// An empty commit says the start stands, after what it seeds, so a reader waits on the seed and on no later event. [[spec/tickets/the-split-deployment-takes-over]]
		if err := peer.Commit(instance, map[string]any{}); err != nil {
			halt()
			return nil, fmt.Errorf("%s answers not: %w", instance, err)
		}
	}
	watching, err := watchesIndex(peer, manager.LeaseTerm(root), appendsRow(root, time.Now))
	if err != nil {
		halt()
		return nil, err
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
		watching()
		halt()
	}, nil
}

// The index spawns quack io for its IO starts, and a module process for each placement, and lands each commit they make. A crash in one leaves the others running, and the dog counts its faults toward an alarm. The instances they run stand in Away, so the index computes none of their names. [[spec/tickets/the-split-deployment-takes-over]] [[spec/design_output/model#a-process-ends]]
func ioProcesses(root string, store *q.Store, open doors, dog *manager.Dog) (index.Managed, error) {
	self, err := os.Executable()
	if err != nil {
		return index.Managed{}, err
	}
	instances, placed := open.io, placementsOf(open.wiring, open.hands, placementLists(root), self)
	if len(instances) == 0 && len(placed) == 0 {
		return index.Managed{Stop: func() {}}, nil
	}
	bus, err := index.StartBus()
	if err != nil {
		return index.Managed{}, err
	}
	if len(instances) > 0 {
		held := make(map[string]q.Writer, len(instances))
		for _, one := range instances {
			held[one] = open.hands[one]
		}
		placed = append([]index.Placed{{Name: ioPart, Command: []string{self, ioVerb}, Instances: held, Restart: ioRestart}}, placed...)
	}
	term := manager.LeaseTerm(root)
	var away []string
	for i := range placed {
		if dog != nil {
			placed[i].Watch, placed[i].Term = dog, term
		}
		for instance := range placed[i].Instances {
			away = append(away, instance)
		}
	}
	sort.Strings(away)
	beating, err := beatsIndex(bus, store)
	if err != nil {
		bus.Close()
		return index.Managed{}, err
	}
	placements := index.NewPlacements(bus, store, placed)
	stop, err := placements.Start()
	if err != nil {
		beating.Close()
		bus.Close()
		return index.Managed{}, err
	}
	return index.Managed{Bus: bus, Away: away, Settle: func() { placements.Settle(answerWait) }, Stop: func() {
		stop()
		beating.Close()
		bus.Close()
	}}, nil
}

// Each commit of index/health beats lease.index, and only the work loop's renew commits it, so a hung loop beats nothing. [[spec/tickets/watchdogs-span-the-processes]]
func beatsIndex(bus *index.Bus, store *q.Store) (*index.Peer, error) {
	peer, err := index.Dial(bus.URL(), bus.Token())
	if err != nil {
		return nil, err
	}
	store.OnCommit(func(values map[string]any) {
		if _, renewed := values[manager.HealthName]; renewed {
			_ = peer.Beat(indexPart)
		}
	})
	return peer, nil
}

// The lists of instances the processes/placements key holds, each list one process. [[spec/design_output/model#the-placements]]
func placementLists(root string) [][]string {
	rows, err := configAt(root)
	if err != nil {
		return nil
	}
	var lists [][]string
	if json.Unmarshal(rows[placementsKey].Value, &lists) != nil {
		return nil
	}
	return lists
}
