// The scheduler: runs a derived provider when a name it reads moves, one run
// at a time, with one pending run kept while one runs.
// [[spec/design_output/model#the-provider-kinds]]
// [[spec/tickets/the-scheduler-runs-providers]]
package q

import (
	"strings"
	"sync"
)

type Scheduler struct {
	store   *Store
	spawn   func(run func())
	failed  func(name string, err error)
	readers map[string][]string
	mu      sync.Mutex
	idle    *sync.Cond
	running map[string]bool
	pending map[string]bool
	busy    int
	stopped bool
}

// A run starts through spawn, so a case controls it. A run that errs reaches failed. [[spec/design_output/model#the-provider-kinds]]
// A derived provider reading itself, or a cycle, reruns without end here, so the catalog check refuses it before the index starts. [[spec/design_output/model#the-index-resolves-in-passes]]
func NewScheduler(s *Store, spawn func(run func()), failed func(name string, err error)) *Scheduler {
	one := &Scheduler{store: s, spawn: spawn, failed: failed, readers: readersOf(s), running: map[string]bool{}, pending: map[string]bool{}}
	one.idle = sync.NewCond(&one.mu)
	s.OnCommit(one.moved)
	return one
}

// Names every derived provider an owner's move runs. A family keyed by <key> stays out, since Store.Run takes a concrete name, and the wave owns it. [[spec/tickets/one-wave-settles-a-change]]
func readersOf(s *Store) map[string][]string {
	readers := map[string][]string{}
	for _, group := range s.groups {
		one := s.active[group.name]
		if one.kind != derived || keyed(group.name) {
			continue
		}
		for _, in := range one.inputs {
			if owner := resolve(s.groups, in.name); owner != nil {
				readers[owner.name] = append(readers[owner.name], group.name)
			}
		}
	}
	return readers
}

func keyed(name string) bool {
	for _, segment := range strings.Split(name, "/") {
		if isKey(segment) {
			return true
		}
	}
	return false
}

func (one *Scheduler) moved(values map[string]any) {
	for name := range values {
		if owner := resolve(one.store.groups, name); owner != nil {
			for _, reader := range one.readers[owner.name] {
				one.kick(reader)
			}
		}
	}
}

// Counts the run from the kick, before spawn starts it, so Settle waits on a run no thread has begun yet. [[spec/design_output/model#the-provider-kinds]]
func (one *Scheduler) kick(name string) {
	one.mu.Lock()
	if one.stopped || one.running[name] {
		one.pending[name] = !one.stopped
		one.mu.Unlock()
		return
	}
	one.running[name] = true
	one.busy++
	one.mu.Unlock()
	one.spawn(func() { one.runs(name) })
}

// Runs once, then once more while a move during the run marks it pending, so a burst leaves one run and none overlap. [[spec/design_output/model#the-provider-kinds]]
func (one *Scheduler) runs(name string) {
	for {
		if err := one.store.Run(name); err != nil {
			one.failed(name, err)
		}
		one.mu.Lock()
		if one.pending[name] && !one.stopped {
			delete(one.pending, name)
			one.mu.Unlock()
			continue
		}
		delete(one.pending, name)
		delete(one.running, name)
		one.busy--
		one.idle.Broadcast()
		one.mu.Unlock()
		return
	}
}

// Blocks until no provider runs or waits. [[spec/design_output/model#the-provider-kinds]]
func (one *Scheduler) Settle() {
	one.mu.Lock()
	defer one.mu.Unlock()
	for one.busy > 0 {
		one.idle.Wait()
	}
}

// Starts no run past this call, drops the pending ones, and waits out the runs in flight, so no run outlives its index. [[spec/design_output/model#the-provider-kinds]]
func (one *Scheduler) Stop() {
	one.mu.Lock()
	one.stopped = true
	one.mu.Unlock()
	one.Settle()
}
