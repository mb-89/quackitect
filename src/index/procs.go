// A placed process: the index spawns it over the bus, lands what it commits,
// and marks its instances not provided while it runs nowhere.
// [[spec/design_output/model#a-process-ends]]
package index

import (
	"encoding/json"
	"errors"
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
	// The folders under src/modules registering its instances' module types, which a change there restarts. [[spec/design_output/model#a-module-rebuilds-alone]]
	Topics []string
	// The dog the process's lease stands with, and the term past a beat. A nil holds no lease. [[spec/tickets/watchdogs-span-the-processes]]
	Watch Leases
	Term  time.Duration
	// Where the placements hear that an instance answers, up by a commit or down by an exit. A nil hears nothing. [[spec/tickets/the-split-deployment-takes-over]]
	answered func(instance string, up bool)
}

// What a placed process's lease reaches: the dog that holds and renews it, counts its faults, and calls each expiry. [[spec/design_output/model#a-lease]]
type Leases interface {
	Hold(part string, term time.Duration)
	Beat(part string)
	Fault(part string, err error) (time.Duration, bool)
	Expired(hand func(part string)) (stop func())
}

// The fault a process whose lease expires hands the dog. [[spec/tickets/watchdogs-span-the-processes]]
var errSilent = errors.New("the lease expires with no beat")

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
	// One answer saves at a time, so the first runs of every process read the inputs one after another. [[spec/tickets/the-system-places-modules]]
	saving sync.Mutex
	// The wait before the first spawn, and the stop that ends it. [[spec/tickets/the-system-places-modules]]
	after time.Duration
	// The wait between two spawns. [[spec/tickets/the-modules-start-together]]
	gap time.Duration
	// The timer the spawner waits the start window and each gap on, which a case swaps for one it answers. [[spec/tickets/each-door-meets-one-test]]
	timer func(time.Duration) <-chan time.Time
	// Closes as the spawner returns, which the stop waits on. [[spec/tickets/stop-join-test-stands-red]]
	spawned chan struct{}
	quit    chan struct{}
	// The instances a reader waits on: each until its first answer, and again from each run sent until the next. idle wakes the wait. [[spec/tickets/the-split-deployment-takes-over]]
	pending map[string]bool
	idle    *sync.Cond
	// The instances whose process exited and commits nothing since, so a run sent there holds no reader. [[spec/tickets/the-split-deployment-takes-over]]
	gone map[string]bool
	// The runs sent each instance, and how many of them its last inputs ask covered, so a commit answering an earlier run clears no wait a later run holds. [[spec/tickets/mid-run-commit-clears-early]]
	sent    map[string]int
	covered map[string]int
}

// Waits until every instance answers what it was sent, an exit counting as an answer, or the wait passes. So a read after a commit reads what the processes compute off it. [[spec/tickets/the-split-deployment-takes-over]]
// The timer marks the wait spent under the lock it wakes, so no clock read between the two leaves the reader waiting on a broadcast that already went. [[spec/tickets/settle-timer-races-deadline]]
func (p *Placements) Settle(wait time.Duration) {
	p.mu.Lock()
	defer p.mu.Unlock()
	spent := false
	timer := time.AfterFunc(wait, func() {
		p.mu.Lock()
		spent = true
		p.idle.Broadcast()
		p.mu.Unlock()
	})
	defer timer.Stop()
	for len(p.pending) > 0 && !p.stopped && !spent {
		p.idle.Wait()
	}
}

// Clears the instance's wait once its process exits, or commits off an ask covering every run sent, and marks it gone on an exit until it commits again. [[spec/tickets/the-split-deployment-takes-over]] [[spec/tickets/mid-run-commit-clears-early]]
func (p *Placements) answered(instance string, up bool) {
	p.mu.Lock()
	defer p.mu.Unlock()
	if up {
		delete(p.gone, instance)
	} else {
		p.gone[instance] = true
	}
	if up && p.covered[instance] < p.sent[instance] {
		return
	}
	delete(p.pending, instance)
	p.idle.Broadcast()
}

// Waits the span before the first spawn, so an index stopped inside it spawns nothing. [[spec/tickets/the-system-places-modules]]
func (p *Placements) After(span time.Duration) *Placements {
	p.after = span
	return p
}

// Names the timer the spawner waits on, so a case answers each wait it asks and sleeps none. [[spec/tickets/each-door-meets-one-test]]
func (p *Placements) Timer(timer func(time.Duration) <-chan time.Time) *Placements {
	p.timer = timer
	return p
}

// The gap between two spawns. The door stands while they run, and a read waits for every process's first answer, so the gap stays short. [[spec/tickets/the-modules-start-together]]
const spawnGap = 20 * time.Millisecond

// [[spec/design_output/model#the-placements]]
func NewPlacements(bus *Bus, store *q.Store, placed []Placed) *Placements {
	p := &Placements{bus: bus, store: store, gap: spawnGap, timer: time.After, spawned: make(chan struct{}), moved: map[string]map[string]bool{}, quit: make(chan struct{}), pending: map[string]bool{}, gone: map[string]bool{}, sent: map[string]int{}, covered: map[string]int{}}
	p.idle = sync.NewCond(&p.mu)
	p.placed = make([]Placed, len(placed))
	for i, one := range placed {
		one.answered = p.answered
		for instance := range one.Instances {
			p.pending[instance] = true
		}
		p.placed[i] = one
	}
	return p
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
		close(p.quit)
		p.mu.Lock()
		p.stopped = true
		p.idle.Broadcast()
		p.mu.Unlock()
		// A spawn in flight lands its stop before the stop reads them. [[spec/tickets/stop-join-test-stands-red]]
		<-p.spawned
		p.mu.Lock()
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
				close(p.spawned)
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
	defer close(p.spawned)
	for i, placed := range p.placed {
		wait := p.gap
		if i == 0 {
			wait = p.after
		}
		select {
		case <-p.quit:
			return
		case <-p.timer(wait):
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
		read := reads(names, values)
		if len(read) == 0 {
			continue
		}
		if p.moved[instance] == nil {
			p.moved[instance] = map[string]bool{}
		}
		for _, name := range read {
			p.moved[instance][name] = true
		}
		p.sent[instance]++
		if !p.gone[instance] {
			p.pending[instance] = true
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
	p.covered[instance] = p.sent[instance]
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
func reads(inputs []string, values map[string]any) []string {
	var out []string
	for name := range values {
		for _, input := range inputs {
			if q.Matches(input, name) {
				out = append(out, name)
				break
			}
		}
	}
	return out
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
	expired, drop := make(chan struct{}, 1), func() {}
	if p.Watch != nil {
		if _, err := peer.Leases(func(part string) {
			if part == p.Name {
				p.Watch.Beat(part)
			}
		}); err != nil {
			peer.Close()
			return nil, err
		}
		drop = p.Watch.Expired(func(part string) {
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
			drop()
			peer.Close()
		})
	}, nil
}

// A commit lands typed as the instance's writer, and clears its down mark. [[spec/design_output/model#a-process-ends]]
func (p Placed) heard(store *q.Store, instance string, hand q.Writer, values map[string]json.RawMessage) {
	if p.answered != nil {
		defer p.answered(instance, true)
	}
	// An empty commit answers a run that moved nothing. [[spec/tickets/the-split-deployment-takes-over]]
	if len(values) == 0 {
		if err := store.Up(instance); err != nil {
			fmt.Fprintln(stderr, p.Name, "stands", instance, "up nowhere:", err)
		}
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

// The process runs until the stop, and each exit marks its instances down until the next run commits. A silence past the lease kills it, and the dog's fault decides the wait, or stops the restarts. [[spec/design_output/model#a-process-ends]] [[spec/tickets/watchdogs-span-the-processes]]
func (p Placed) runs(bus *Bus, store *q.Store, stopping, expired <-chan struct{}) {
	for {
		p.holds(expired)
		cmd, exited := p.spawn(bus)
		var err error
		select {
		case <-stopping:
			if cmd != nil {
				_ = cmd.Process.Kill()
				<-exited
			}
			return
		case err = <-exited:
			fmt.Fprintln(stderr, p.Name, "exits:", err)
		case <-expired:
			fmt.Fprintln(stderr, p.Name, "exits:", errSilent)
			if cmd != nil {
				_ = cmd.Process.Kill()
			}
			<-exited
			err = errSilent
		}
		p.down(store)
		wait, again := p.Restart, true
		if p.Watch != nil {
			wait, again = p.Watch.Fault(p.Name, err)
		}
		if !again {
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

// Each spawn takes its lease afresh, and drops an expiry the last run left. [[spec/tickets/watchdogs-span-the-processes]]
func (p Placed) holds(expired <-chan struct{}) {
	if p.Watch == nil || p.Term <= 0 {
		return
	}
	select {
	case <-expired:
	default:
	}
	p.Watch.Hold(p.Name, p.Term)
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
	for instance := range p.Instances {
		if err := store.Down(instance); err != nil {
			fmt.Fprintln(stderr, p.Name, "stands", instance, "down nowhere:", err)
		}
		if p.answered != nil {
			p.answered(instance, false)
		}
	}
}
