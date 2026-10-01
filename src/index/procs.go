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
}

// [[spec/design_output/model#the-placements]]
func NewPlacements(bus *Bus, store *q.Store, placed []Placed) *Placements {
	return &Placements{bus: bus, store: store, placed: placed}
}

// Starts every placed process, answers each instance's inputs, publishes a run once a commit moves one, and answers the stop of them all. [[spec/design_output/model#the-placements]]
func (p *Placements) Start() (func(), error) {
	peer, err := Dial(p.bus.URL(), p.bus.Token())
	if err != nil {
		return nil, err
	}
	reads, kicks, quit := map[string][]string{}, map[string]chan struct{}{}, make(chan struct{})
	for _, one := range p.placed {
		for instance := range one.Instances {
			inputs := p.store.Inputs(instance)
			reads[instance] = inputs
			if _, err := peer.AnswersInputs(instance, func() ([]byte, error) { return p.store.SaveNames(inputs) }); err != nil {
				peer.Close()
				return nil, err
			}
			kicks[instance] = make(chan struct{}, 1)
			go publishes(peer, instance, kicks[instance], quit)
		}
	}
	p.store.OnCommit(func(values map[string]any) { p.runs(kicks, reads, values) })
	p.stops = make([]func(), len(p.placed))
	for i, one := range p.placed {
		stop, err := one.Start(p.bus, p.store)
		if err != nil {
			p.stop()
			peer.Close()
			return nil, err
		}
		p.stops[i] = stop
	}
	var once sync.Once
	return func() {
		once.Do(func() {
			p.stop()
			close(quit)
			peer.Close()
		})
	}, nil
}

// Publishes run.<instance> once for each kick, and the kicks a publish meets fold into one. [[spec/design_output/model#the-placements]]
func publishes(peer *Peer, instance string, kicks <-chan struct{}, quit <-chan struct{}) {
	for {
		select {
		case <-quit:
			return
		case <-kicks:
			if err := peer.Run(instance); err != nil {
				fmt.Fprintln(stderr, instance, "runs nowhere:", err)
			}
		}
	}
}

// Kicks the run of each placed instance reading a name the commit moves, and waits on no bus. [[spec/design_output/model#the-placements]]
func (p *Placements) runs(kicks map[string]chan struct{}, reads map[string][]string, values map[string]any) {
	p.mu.Lock()
	stopped := p.stopped
	p.mu.Unlock()
	if stopped {
		return
	}
	for instance, inputs := range reads {
		for _, name := range inputs {
			if _, moved := values[name]; moved {
				select {
				case kicks[instance] <- struct{}{}:
				default:
				}
				break
			}
		}
	}
}

func (p *Placements) stop() {
	p.mu.Lock()
	defer p.mu.Unlock()
	p.stopped = true
	for _, stop := range p.stops {
		if stop != nil {
			stop()
		}
	}
}

// Restarts the processes holding an instance of the topic, and no other. [[spec/design_output/model#a-module-rebuilds-alone]]
func (p *Placements) Restart(topic string) error {
	p.mu.Lock()
	defer p.mu.Unlock()
	if p.stopped {
		return fmt.Errorf("the placements stand stopped, and restart no %s", topic)
	}
	for i, one := range p.placed {
		if !slices.Contains(one.Topics, topic) {
			continue
		}
		if p.stops[i] != nil {
			p.stops[i]()
		}
		stop, err := one.Start(p.bus, p.store)
		if err != nil {
			p.stops[i] = nil
			return err
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
	expired := make(chan struct{}, 1)
	if p.Watch != nil {
		if _, err := peer.Leases(func(part string) {
			if part == p.Name {
				p.Watch.Beat(part)
			}
		}); err != nil {
			peer.Close()
			return nil, err
		}
		p.Watch.Expired(func(part string) {
			if part != p.Name {
				return
			}
			select {
			case expired <- struct{}{}:
			default:
			}
		})
	}
	stopping, ended := make(chan struct{}), make(chan struct{})
	go func() {
		defer close(ended)
		p.runs(bus, store, stopping, expired)
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

// The process runs until the stop, and each exit marks its instances down until the next run commits. A lease past its term kills the process, and the dog's fault count decides the wait, or the alarm that ends the restarts. [[spec/design_output/model#a-process-ends]]
func (p Placed) runs(bus *Bus, store *q.Store, stopping, expired <-chan struct{}) {
	for {
		if p.Watch != nil {
			p.Watch.Hold(p.Name, p.Term)
		}
		cmd, exited := p.spawn(bus)
		var err error
		select {
		case <-stopping:
			if cmd != nil {
				_ = cmd.Process.Kill()
				<-exited
			}
			return
		case <-expired:
			if cmd != nil {
				_ = cmd.Process.Kill()
				<-exited
			}
			err = fmt.Errorf("its lease runs past %s", p.Term)
		case err = <-exited:
		}
		fmt.Fprintln(stderr, p.Name, "exits:", err)
		p.down(store)
		wait, again := p.Restart, true
		if p.Watch != nil {
			wait, again = p.Watch.Fault(p.Name, err)
		}
		if !again {
			fmt.Fprintln(stderr, p.Name, "raises the alarm, and restarts no more")
			<-stopping
			return
		}
		select {
		case <-stopping:
			return
		case <-time.After(wait):
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
