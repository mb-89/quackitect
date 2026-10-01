// The placements: one process a list of instances the key names, and one a
// process for each instance in no list. The IO instances stay with the IO
// process.
// [[spec/design_output/model#the-placements]]
package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"slices"
	"strings"
	"time"

	"quackitect/src/index"
	"quackitect/src/modules/config"
	manager "quackitect/src/modules/index"
	"quackitect/src/q"
)

// The verb a module process runs under, the mark joining its instances into its part on the bus, and the wait before a restart. [[spec/design_output/model#one-binary-many-processes]]
const (
	moduleVerb    = "module"
	partJoin      = "-"
	moduleRestart = 5 * time.Second
)

// Each list's instances share one process, and every other instance a module topic names takes one of its own, in the wiring's order. An IO instance, a door and a settings section carry no topic, and stay where they run. [[spec/design_output/model#the-placements]]
func placementsOf(w q.Wiring, hands map[string]q.Writer, lists [][]string, self string) []index.Placed {
	topics := map[string]string{}
	for _, one := range w.Instances {
		if module, ok := modules[one.Module]; ok && module.starts == nil && module.topic != "" {
			topics[one.Name] = module.topic
		}
	}
	taken := map[string]bool{}
	var out []index.Placed
	for _, list := range lists {
		var kept []string
		for _, instance := range list {
			if topics[instance] != "" && !taken[instance] {
				taken[instance] = true
				kept = append(kept, instance)
			}
		}
		if len(kept) > 0 {
			out = append(out, placedOf(kept, topics, hands, self))
		}
	}
	for _, one := range w.Instances {
		if topics[one.Name] != "" && !taken[one.Name] {
			out = append(out, placedOf([]string{one.Name}, topics, hands, self))
		}
	}
	return out
}

// One module process: quack module over its instances, under the topics their modules stand in. [[spec/design_output/model#the-placements]]
func placedOf(instances []string, topics map[string]string, hands map[string]q.Writer, self string) index.Placed {
	held := make(map[string]q.Writer, len(instances))
	var under []string
	for _, instance := range instances {
		held[instance] = hands[instance]
		if !slices.Contains(under, topics[instance]) {
			under = append(under, topics[instance])
		}
	}
	return index.Placed{
		Name: strings.Join(instances, partJoin), Command: append([]string{self, moduleVerb}, instances...),
		Instances: held, Restart: moduleRestart, Topics: under,
	}
}

// quack module: a module process the index spawns, which loads the whole wiring with no IO start and runs its instances until the bus goes. [[spec/design_output/model#one-binary-many-processes]]
func moduleMain(instances []string) error {
	url, token := os.Getenv(index.BusEnv), os.Getenv(index.TokenEnv)
	if url == "" {
		return errors.New("quack module runs where the index spawns it, with the bus in its environment")
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
	c := q.New()
	if _, _, err := loaded(w, c); err != nil {
		return err
	}
	config.Registers(c)
	peer, err := index.Dial(url, token)
	if err != nil {
		return err
	}
	defer peer.Close()
	stop, err := moduleOver(peer, q.NewStore(c), instances)
	if err != nil {
		return err
	}
	defer stop()
	<-peer.Done()
	return nil
}

// Runs the instances a module process holds over the bus, and answers its stop. [[spec/design_output/model#one-binary-many-processes]]
func runsModule(url, token string, store *q.Store, instances []string) (func(), error) {
	peer, err := index.Dial(url, token)
	if err != nil {
		return nil, err
	}
	stop, err := moduleOver(peer, store, instances)
	if err != nil {
		peer.Close()
		return nil, err
	}
	return func() {
		stop()
		peer.Close()
	}, nil
}

// On each run.<instance> the process asks the index for the instance's inputs, restores them, settles its scheduler, and commits the instance's out-ports. It beats its lease while it runs. [[spec/design_output/model#the-placements]]
func moduleOver(peer *index.Peer, store *q.Store, instances []string) (func(), error) {
	scheduler := q.NewScheduler(store, func(run func()) { go run() }, func(name string, err error) {
		fmt.Fprintln(os.Stderr, "the run of", name, "did not commit:", err)
	})
	var stops []func()
	quit := make(chan struct{})
	halt := func() {
		for _, one := range stops {
			one()
		}
		close(quit)
		scheduler.Stop()
	}
	for _, instance := range instances {
		kicks := make(chan struct{}, 1)
		go func() {
			for {
				select {
				case <-quit:
					return
				case <-kicks:
					runsOnce(peer, store, scheduler, instance)
				}
			}
		}()
		stop, err := peer.Runs(instance, func() {
			select {
			case kicks <- struct{}{}:
			default:
			}
		})
		if err != nil {
			halt()
			return nil, fmt.Errorf("%s hears no run: %w", instance, err)
		}
		stops = append(stops, stop)
	}
	part := strings.Join(instances, partJoin)
	beats := time.NewTicker(ioBeat)
	go func() {
		for {
			select {
			case <-quit:
				return
			case <-beats.C:
				_ = peer.Beat(part)
			}
		}
	}()
	return func() {
		beats.Stop()
		halt()
	}, nil
}

// One run of an instance off the inputs the index saves. [[spec/design_output/model#the-placements]]
func runsOnce(peer *index.Peer, store *q.Store, scheduler *q.Scheduler, instance string) {
	saved, err := peer.Inputs(instance)
	if err != nil {
		fmt.Fprintln(os.Stderr, instance, "reads no inputs:", err)
		return
	}
	refused, err := store.Restore(saved)
	for _, one := range refused {
		fmt.Fprintln(os.Stderr, instance, "restores not:", one)
	}
	if err != nil {
		fmt.Fprintln(os.Stderr, instance, "restores nothing:", err)
		return
	}
	scheduler.Settle()
	snap := store.Snapshot()
	values := map[string]any{}
	for _, name := range store.Outputs(instance) {
		if !strings.Contains(name, "<") {
			values[name] = snap.Read(name)
		}
	}
	if err := peer.Commit(instance, values); err != nil {
		fmt.Fprintln(os.Stderr, instance, "commits nothing:", err)
	}
}

// Under the processes slice's shadow, the index spawns a module process for each placement over the bus the IO process shares, and weighs each value it commits. Under any other mode it spawns nothing. [[spec/tickets/the-system-places-modules]]
func placesShadow(root string, store *q.Store, bus *index.Bus, open doors) (*index.Bus, func(), error) {
	if sliceMode(root, processesKey) != modeShadow {
		return bus, func() {}, nil
	}
	self, err := os.Executable()
	if err != nil {
		return nil, nil, err
	}
	placed := placementsOf(open.wiring, open.hands, listsAt(root), self)
	if len(placed) == 0 {
		return bus, func() {}, nil
	}
	owned := bus == nil
	if owned {
		if bus, err = index.StartBus(); err != nil {
			return nil, nil, err
		}
	}
	weighs := shadows{
		read:   func(name string) any { return store.Snapshot().Read(name) },
		settle: shadowSettle,
		wait:   time.Sleep,
		say:    appendsRow(root, time.Now),
		newest: &sends{at: map[string]int64{}},
	}
	feeds := feedsItsLog(store, placed)
	for i := range placed {
		placed[i].Heard = func(instance string, values map[string]json.RawMessage) {
			if !feeds[instance] {
				go weighs.weigh(values)
			}
		}
	}
	stop, err := index.NewPlacements(bus, store, placed).Start()
	if err != nil {
		if owned {
			bus.Close()
		}
		return nil, nil, err
	}
	return bus, func() {
		stop()
		if owned {
			bus.Close()
		}
	}, nil
}

// Each placed instance reading the log the shadow writes to, which moves on each row the shadow writes, so a weigh of it feeds itself. [[spec/tickets/the-system-places-modules]]
func feedsItsLog(store *q.Store, placed []index.Placed) map[string]bool {
	feeds := map[string]bool{}
	for _, one := range placed {
		for instance := range one.Instances {
			if slices.Contains(store.Inputs(instance), shadowsOwnLog) {
				feeds[instance] = true
			}
		}
	}
	return feeds
}

// The lists of processes/placements off the config files, which the index reads before its store settles. [[spec/design_output/model#the-placements]]
func listsAt(root string) [][]string {
	rows, err := configAt(root)
	if err != nil {
		return nil
	}
	var lists [][]string
	if json.Unmarshal(rows[manager.PlacementsDotted].Value, &lists) != nil {
		return nil
	}
	return lists
}
