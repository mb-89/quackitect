// A placed process: the index spawns it over the bus, lands what it commits,
// and marks its instances not provided while it runs nowhere.
// [[spec/design_output/model#a-process-ends]]
package index

import (
	"encoding/json"
	"fmt"
	"os"      // level0: OutsideInDoors - the index manager spawns the processes it places, per the model's process chapter
	"os/exec" // level0: OutsideInDoors - the index manager spawns the processes it places, per the model's process chapter
	"slices"
	"sync"
	"time"

	"quackitect/src/q"
)

// The process's name, the command that runs it, the writer each instance it runs commits as, and the wait before a restart. [[spec/design_output/model#a-process-ends]]
type Placed struct {
	Name      string
	Command   []string
	Instances map[string]q.Writer
	Restart   time.Duration
	// Where a shadow hands each commit, which then lands nothing and marks nothing down. [[spec/design_input/the-migration-runs-in-slices#how-a-slice-moves]]
	Heard func(instance string, values map[string]json.RawMessage)
	// The folders under src/modules registering its instances' module types, which a change there restarts. [[spec/design_output/model#a-module-rebuilds-alone]]
	Topics []string
	// The dog the process's lease stands with, and the term past a beat. A nil holds no lease. [[spec/tickets/watchdogs-span-the-processes]]
	Watch Leases
	Term  time.Duration
}

// What a placed process's lease reaches: the dog that holds and renews it, counts its faults, and calls each expiry. [[spec/design_output/model#a-lease]]
type Leases interface {
	Hold(part string, term time.Duration)
	Beat(part string)
	Fault(part string, err error) (time.Duration, bool)
	Expired(hand func(part string))
}

// Every placed process the index runs over one bus. [[spec/design_output/model#the-placements]]
type Placements struct {
	bus     *Bus
	store   *q.Store
	placed  []Placed
	mu      sync.Mutex
	stops   []func()
	stopped bool
	// The names each instance reads that a commit moved since its last answer. [[spec/design_output/model#the-placements]]
	moved map[string]map[string]bool
	// The names whose commit runs nothing, such as the log a shadow writes its rows to, since each row runs its readers again. [[spec/tickets/the-system-places-modules]]
	quiet map[string]bool
	// One answer saves at a time, so the first runs of every process read the inputs one after another. [[spec/tickets/the-system-places-modules]]
	saving sync.Mutex
}

// The gap between two spawns, so a start of every process leaves the index's door room to stand. [[spec/tickets/the-system-places-modules]]
const spawnGap = 250 * time.Millisecond

// Marks names whose commit runs no placed process. [[spec/tickets/the-system-places-modules]]
func (p *Placements) Quiet(names ...string) *Placements {
	p.mu.Lock()
	defer p.mu.Unlock()
	for _, name := range names {
		p.quiet[name] = true
	}
	return p
}

// [[spec/design_output/model#the-placements]]
func NewPlacements(bus *Bus, store *q.Store, placed []Placed) *Placements {
	return &Placements{bus: bus, store: store, placed: placed, moved: map[string]map[string]bool{}, quiet: map[string]bool{}}
}

// Starts every placed process, and answers the stop of them all. [[spec/design_output/model#the-placements]]
func (p *Placements) Start() (func(), error) {
	peer, err := Dial(p.bus.URL(), p.bus.Token())
	if err != nil {
		return nil, err
	}
	inputs := map[string][]string{}
	var answers []func()
	halt := func() {
		p.mu.Lock()
		p.stopped = true
		stops := p.stops
		p.stops = nil
		p.mu.Unlock()
		for _, stop := range stops {
			stop()
		}
		for _, done := range answers {
			done()
		}
		peer.Close()
	}
	for _, placed := range p.placed {
		for instance := range placed.Instances {
			names := p.store.Inputs(instance)
			inputs[instance] = names
			done, err := peer.AnswersMoved(instance, func(moved bool) ([]byte, error) {
				p.saving.Lock()
				defer p.saving.Unlock()
				return p.store.SaveNames(p.answer(instance, names, moved))
			})
			if err != nil {
				halt()
				return nil, err
			}
			answers = append(answers, done)
		}
	}
	p.store.OnCommit(func(values map[string]any) { p.runs(peer, inputs, values) })
	go p.spawns()
	var once sync.Once
	return func() { once.Do(halt) }, nil
}

// Starts each placed process a gap after the last, and none past the stop. A start that fails stands as a stop that does nothing, so the restart of its topic tries again. [[spec/tickets/the-system-places-modules]]
func (p *Placements) spawns() {
	for i, placed := range p.placed {
		if i > 0 {
			time.Sleep(spawnGap)
		}
		p.mu.Lock()
		if p.stopped {
			p.mu.Unlock()
			return
		}
		stop, err := placed.Start(p.bus, p.store)
		if err != nil {
			fmt.Fprintln(stderr, placed.Name, "starts not:", err)
			stop = func() {}
		}
		p.stops = append(p.stops, stop)
		p.mu.Unlock()
	}
}

// Publishes run.<instance> for each placed instance reading a name the commit lands. [[spec/design_output/model#the-placements]]
func (p *Placements) runs(peer *Peer, inputs map[string][]string, values map[string]any) {
	p.mu.Lock()
	if p.stopped {
		p.mu.Unlock()
		return
	}
	var run []string
	for instance, names := range inputs {
		read := reads(names, values, p.quiet)
		if len(read) == 0 {
			continue
		}
		if p.moved[instance] == nil {
			p.moved[instance] = map[string]bool{}
		}
		for _, name := range read {
			p.moved[instance][name] = true
		}
		run = append(run, instance)
	}
	p.mu.Unlock()
	for _, instance := range run {
		if err := peer.Run(instance); err != nil {
			fmt.Fprintln(stderr, "the run of", instance, "reaches nobody:", err)
		}
	}
}

// The names an answer saves: the moved ones the ask wants, or every input, and either way the moved set starts again. [[spec/design_output/model#the-placements]]
func (p *Placements) answer(instance string, inputs []string, moved bool) []string {
	p.mu.Lock()
	defer p.mu.Unlock()
	held := p.moved[instance]
	delete(p.moved, instance)
	if !moved {
		return inputs
	}
	out := make([]string, 0, len(held))
	for name := range held {
		out = append(out, name)
	}
	return out
}

// The names of the commit an instance reads. [[spec/design_output/model#the-placements]]
func reads(inputs []string, values map[string]any, quiet map[string]bool) []string {
	var out []string
	for name := range values {
		if quiet[name] {
			continue
		}
		for _, input := range inputs {
			if q.Matches(input, name) {
				out = append(out, name)
				break
			}
		}
	}
	return out
}

// Restarts the processes holding an instance of the topic, and no other. [[spec/design_output/model#a-module-rebuilds-alone]]
func (p *Placements) Restart(topic string) error {
	p.mu.Lock()
	defer p.mu.Unlock()
	if p.stopped {
		return nil
	}
	for i, placed := range p.placed {
		if i >= len(p.stops) || !slices.Contains(placed.Topics, topic) {
			continue
		}
		p.stops[i]()
		stop, err := placed.Start(p.bus, p.store)
		if err != nil {
			p.stops[i] = func() {}
			return fmt.Errorf("%s starts again nowhere: %w", placed.Name, err)
		}
		p.stops[i] = stop
	}
	return nil
}

// Spawns the process, lands what it commits, and spawns it again after its wait once it exits. [[spec/design_output/model#a-process-ends]]
func (p Placed) Start(bus *Bus, store *q.Store) (func(), error) {
	peer, err := Dial(bus.URL(), bus.Token())
	if err != nil {
		return nil, err
	}
	for instance, hand := range p.Instances {
		if _, err := peer.Commits(instance, func(values map[string]json.RawMessage) { p.heard(store, instance, hand, values) }); err != nil {
			peer.Close()
			return nil, err
		}
	}
	stopping, ended := make(chan struct{}), make(chan struct{})
	go func() {
		defer close(ended)
		p.runs(bus, store, stopping)
	}()
	var once sync.Once
	return func() {
		once.Do(func() {
			close(stopping)
			<-ended
			peer.Close()
		})
	}, nil
}

// A commit lands typed as the instance's writer, and clears its down mark. [[spec/design_output/model#a-process-ends]]
func (p Placed) heard(store *q.Store, instance string, hand q.Writer, values map[string]json.RawMessage) {
	if p.Heard != nil {
		p.Heard(instance, values)
		return
	}
	typed := make(map[string]any, len(values))
	for name, raw := range values {
		value, err := store.Value(name, raw)
		if err != nil {
			fmt.Fprintln(stderr, p.Name, "commits", name, "as no value:", err)
			continue
		}
		typed[name] = value
	}
	if _, err := store.Commit(store.Snapshot().Revision, hand, typed); err != nil {
		fmt.Fprintln(stderr, p.Name, "commits nothing:", err)
		return
	}
	if err := store.Up(instance); err != nil {
		fmt.Fprintln(stderr, p.Name, "stands", instance, "up nowhere:", err)
	}
}

// The process runs until the stop, and each exit marks its instances down until the next run commits. [[spec/design_output/model#a-process-ends]]
func (p Placed) runs(bus *Bus, store *q.Store, stopping <-chan struct{}) {
	for {
		cmd, exited := p.spawn(bus)
		select {
		case <-stopping:
			if cmd != nil {
				_ = cmd.Process.Kill()
				<-exited
			}
			return
		case err := <-exited:
			fmt.Fprintln(stderr, p.Name, "exits:", err)
			p.down(store)
		}
		select {
		case <-stopping:
			return
		case <-time.After(p.Restart):
		}
	}
}

// A spawn that fails answers its fault as an exit, so the restart takes it. [[spec/design_output/model#a-process-ends]]
func (p Placed) spawn(bus *Bus) (*exec.Cmd, <-chan error) {
	exited := make(chan error, 1)
	cmd := exec.Command(p.Command[0], p.Command[1:]...)
	cmd.Env = append(os.Environ(), BusEnv+"="+bus.URL(), TokenEnv+"="+bus.Token())
	cmd.Stderr = stderr
	if err := cmd.Start(); err != nil {
		exited <- err
		return nil, exited
	}
	go func() { exited <- cmd.Wait() }()
	return cmd, exited
}

func (p Placed) down(store *q.Store) {
	if p.Heard != nil {
		return
	}
	for instance := range p.Instances {
		if err := store.Down(instance); err != nil {
			fmt.Fprintln(stderr, p.Name, "stands", instance, "down nowhere:", err)
		}
	}
}
