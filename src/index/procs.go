// A placed process: the index spawns it over the bus, lands what it commits,
// and marks its instances not provided while it runs nowhere.
// [[spec/design_output/model#a-process-ends]]
package index

import (
	"encoding/json"
	"fmt"
	"os"      // level0: OutsideInDoors - the index manager spawns the processes it places, per the model's process chapter
	"os/exec" // level0: OutsideInDoors - the index manager spawns the processes it places, per the model's process chapter
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
	// The module types of its instances, which a change under src/modules restarts. [[spec/design_output/model#a-module-rebuilds-alone]]
	Topics []string
}

// Every placed process the index runs over one bus. [[spec/design_output/model#the-placements]]
type Placements struct {
	bus    *Bus
	store  *q.Store
	placed []Placed
}

// [[spec/design_output/model#the-placements]]
func NewPlacements(bus *Bus, store *q.Store, placed []Placed) *Placements {
	return &Placements{bus: bus, store: store, placed: placed}
}

// Starts every placed process, and answers the stop of them all. [[spec/design_output/model#the-placements]]
func (p *Placements) Start() (func(), error) { return func() {}, nil }

// Restarts the processes holding an instance of the topic, and no other. [[spec/design_output/model#a-module-rebuilds-alone]]
func (p *Placements) Restart(topic string) error { return nil }

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
