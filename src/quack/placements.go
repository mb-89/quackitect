// The placements: one process a list of instances the key names, and one a
// process for each instance in no list. The IO instances stay with the IO
// process.
// [[spec/design_output/model#the-placements]]
package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"slices"
	"strings"
	"time"

	"quackitect/src/index"
	"quackitect/src/modules/config"
	manager "quackitect/src/modules/index"
	"quackitect/src/q"
)

// The verb a module process runs under, the mark joining its instances into its part on the bus, the span between two beats, and the wait before a restart. [[spec/design_output/model#one-binary-many-processes]]
const (
	moduleVerb    = "module"
	partJoin      = "+"
	moduleBeat    = 5 * time.Second
	moduleRestart = 5 * time.Second
)

// The module types whose listener the index opens, which a placement leaves to it: the hooks door, the mcp server, the lsp listener and the /v1 door. [[spec/tickets/placements-leave-http]]
var doorModules = []string{hooksModule, mcpModule, lspModule, "http"}

// One process a list the key names, then one a process for each instance in no list, in the wiring's order. [[spec/design_output/model#the-placements]]
func placementsOf(w q.Wiring, hands map[string]q.Writer, lists [][]string, self string) []index.Placed {
	placeable := map[string]string{}
	for _, one := range w.Instances {
		if module, ok := modules[one.Module]; ok && module.starts == nil && module.folder != "" && !slices.Contains(doorModules, one.Module) {
			placeable[one.Name] = module.folder
		}
	}
	var out []index.Placed
	taken := map[string]bool{}
	place := func(instances []string) {
		var kept []string
		for _, one := range instances {
			if _, ok := placeable[one]; ok && !taken[one] {
				kept, taken[one] = append(kept, one), true
			}
		}
		if len(kept) > 0 {
			out = append(out, placedOf(kept, placeable, hands, self))
		}
	}
	for _, list := range lists {
		place(list)
	}
	for _, one := range w.Instances {
		place([]string{one.Name})
	}
	return out
}

func placedOf(instances []string, folders map[string]string, hands map[string]q.Writer, self string) index.Placed {
	held := make(map[string]q.Writer, len(instances))
	var topics []string
	for _, one := range instances {
		held[one] = hands[one]
		if !slices.Contains(topics, folders[one]) {
			topics = append(topics, folders[one])
		}
	}
	return index.Placed{
		Name: strings.Join(instances, partJoin), Command: append([]string{self, moduleVerb}, instances...),
		Instances: held, Restart: moduleRestart, Topics: topics,
	}
}

// quack module <instance>...: the process a placement spawns, which runs its instances until the bus goes. [[spec/design_output/model#one-binary-many-processes]]
func moduleMain(box boxDoors, instances []string) error {
	url, token := box.env(index.BusEnv), box.env(index.TokenEnv)
	if url == "" {
		return errors.New("quack module runs where the index spawns it, with the bus in its environment")
	}
	root, err := index.Root()
	if err != nil {
		return err
	}
	w, err := spawnedWiring(root)
	if err != nil {
		return err
	}
	catalog := q.New()
	manager.Registers(catalog)
	if _, _, err := loaded(w, catalog); err != nil {
		return err
	}
	config.Registers(catalog)
	peer, err := index.Dial(url, token)
	if err != nil {
		return err
	}
	defer peer.Close()
	stop, err := moduleOver(peer, q.NewStore(catalog), instances, box.errs)
	if err != nil {
		return err
	}
	defer stop()
	<-peer.Done()
	return nil
}

// Runs the instances a module process holds over the bus, and answers its stop. [[spec/design_output/model#one-binary-many-processes]]
func runsModule(url, token string, store *q.Store, instances []string, errs io.Writer) (func(), error) {
	peer, err := index.Dial(url, token)
	if err != nil {
		return nil, err
	}
	stop, err := moduleOver(peer, store, instances, errs)
	if err != nil {
		peer.Close()
		return nil, err
	}
	return func() {
		stop()
		peer.Close()
	}, nil
}

// On each run.<instance> the process restores the inputs the index answers, settles its scheduler, and commits the instance's names, and it beats its lease while it runs. The runs heard while one runs fold into one, so a burst of commits costs one read of the inputs. [[spec/design_output/model#the-placements]]
func moduleOver(peer *index.Peer, store *q.Store, instances []string, errs io.Writer) (func(), error) {
	scheduler := q.NewScheduler(store, func(run func()) { go run() }, func(name string, err error) {
		fmt.Fprintln(errs, name, "runs not:", err)
	})
	// The catalog holds the whole wiring, and the index answers every name another instance provides. [[spec/tickets/process-shadow-reads-clean]]
	scheduler.Only(instances...)
	var dones []func()
	quit := make(chan struct{})
	halt := func() {
		for _, done := range dones {
			done()
		}
		scheduler.Stop()
	}
	for _, instance := range instances {
		waiting, run := make(chan struct{}, 1), &moduleRun{instance: instance, sent: map[string]string{}, errs: errs}
		go func() {
			for {
				select {
				case <-quit:
					return
				case <-waiting:
					run.once(peer, store, scheduler)
				}
			}
		}()
		done, err := peer.Runs(instance, func() {
			select {
			case waiting <- struct{}{}:
			default:
			}
		})
		if err != nil {
			close(quit)
			halt()
			return nil, err
		}
		dones = append(dones, done)
		// The first run follows the subscription and needs no run.<instance>, so a process spawned after the commits it reads computes off them. [[spec/tickets/the-split-deployment-takes-over]]
		waiting <- struct{}{}
	}
	part := strings.Join(instances, partJoin)
	beats := wall.Every(moduleBeat, func(time.Time) { _ = peer.Beat(part) })
	return func() {
		beats()
		close(quit)
		halt()
	}, nil
}

// One instance's runs: whether it read its inputs whole yet, the JSON of each name it last committed, and the stream its faults go to. [[spec/design_output/model#the-placements]]
type moduleRun struct {
	instance string
	read     bool
	sent     map[string]string
	errs     io.Writer
}

// The first run reads the inputs whole, and each later one the moved ones alone, and a run commits the names that moved since the last. Every run commits, an empty commit where nothing moved, so the index hears each run answered. [[spec/design_output/model#the-placements]] [[spec/tickets/the-split-deployment-takes-over]]
func (r *moduleRun) once(peer *index.Peer, store *q.Store, scheduler *q.Scheduler) {
	instance := r.instance
	if err := peer.Commit(instance, r.computes(peer, store, scheduler)); err != nil {
		fmt.Fprintln(r.errs, instance, "commits nothing:", err)
	}
}

// The names of the instance that moved since the last run, and none where the inputs read nowhere. [[spec/design_output/model#the-placements]]
func (r *moduleRun) computes(peer *index.Peer, store *q.Store, scheduler *q.Scheduler) map[string]any {
	instance := r.instance
	moved := map[string]any{}
	asks := peer.Moved
	if !r.read {
		asks = peer.Inputs
	}
	saved, err := asks(instance)
	if err != nil {
		fmt.Fprintln(r.errs, instance, "reads no inputs:", err)
		return moved
	}
	refused, err := store.Restore(saved)
	for _, line := range refused {
		fmt.Fprintln(r.errs, instance, "restores", line)
	}
	if err != nil {
		fmt.Fprintln(r.errs, instance, "restores nothing:", err)
		return moved
	}
	r.read = true
	scheduler.Settle()
	for name, value := range store.Values(store.Outputs(instance)) {
		body, err := json.Marshal(value)
		if err != nil || r.sent[name] == string(body) {
			continue
		}
		moved[name], r.sent[name] = value, string(body)
	}
	return moved
}
