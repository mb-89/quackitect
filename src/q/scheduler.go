// The scheduler: settles each change as one wave, lowest height first, so a
// provider fed twice by one change runs once, off one settled state.
// [[spec/design_output/model#one-wave-settles-a-change]]
// [[spec/tickets/the-scheduler-runs-providers]]
package q

import (
	"sort"
	"strings"
	"sync"
)

type Scheduler struct {
	store     *Store
	spawn     func(run func())
	failed    func(name string, err error)
	readers   map[string][]string
	heights   map[string]int
	mu        sync.Mutex
	idle      *sync.Cond
	lists     map[string][]string
	queued    []string
	unwatched map[string]bool
	pending   map[string]int64
	waving    bool
	busy      int
	stopped   bool
	runs      sync.Mutex
}

// A wave starts through spawn, so a case controls it. A run that errs reaches failed. [[spec/design_output/model#one-wave-settles-a-change]]
// A derived provider reading itself, or a cycle, stands at no height, so the catalog check refuses it before the index starts. [[spec/design_output/model#the-index-resolves-in-passes]]
func NewScheduler(s *Store, spawn func(run func()), failed func(name string, err error)) *Scheduler {
	one := &Scheduler{
		store: s, spawn: spawn, failed: failed, readers: readersOf(s), heights: heightsOf(s),
		lists: map[string][]string{}, unwatched: map[string]bool{}, pending: map[string]int64{},
	}
	one.idle = sync.NewCond(&one.mu)
	s.onMove(one.moved)
	s.mu.Lock()
	s.pending = one.pendingAt
	s.mu.Unlock()
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

// Each derived provider stands one past the highest height among the owners of its inputs, and every other owner at 0. [[spec/design_output/model#one-wave-settles-a-change]]
func heightsOf(s *Store) map[string]int {
	heights := map[string]int{}
	visiting := map[string]bool{}
	var height func(name string) int
	height = func(name string) int {
		if at, ok := heights[name]; ok {
			return at
		}
		one := s.active[name]
		if one == nil || one.kind != derived || visiting[name] {
			return 0
		}
		visiting[name] = true
		at := 0
		for _, in := range one.inputs {
			if owner := resolve(s.groups, in.name); owner != nil {
				at = max(at, height(owner.name)+1)
			}
		}
		delete(visiting, name)
		heights[name] = at
		return at
	}
	for _, group := range s.groups {
		height(group.name)
	}
	return heights
}

func keyed(name string) bool {
	for _, segment := range strings.Split(name, "/") {
		if isKey(segment) {
			return true
		}
	}
	return false
}

// Every provider downstream of an owner, lowest height first, built the first time the owner moves and kept after. [[spec/design_output/model#one-wave-settles-a-change]]
func (one *Scheduler) listOf(owner string) []string {
	if list, ok := one.lists[owner]; ok {
		return list
	}
	seen := map[string]bool{}
	var list []string
	next := []string{owner}
	for len(next) > 0 {
		name := next[0]
		next = next[1:]
		for _, reader := range one.readers[name] {
			if !seen[reader] {
				seen[reader] = true
				list = append(list, reader)
				next = append(next, reader)
			}
		}
	}
	one.byHeight(list)
	one.lists[owner] = list
	return list
}

func (one *Scheduler) byHeight(names []string) {
	sort.SliceStable(names, func(i, j int) bool {
		if one.heights[names[i]] != one.heights[names[j]] {
			return one.heights[names[i]] < one.heights[names[j]]
		}
		return names[i] < names[j]
	})
}

// A commit from outside a wave starts one, and a commit during a wave joins the next. [[spec/design_output/model#one-wave-settles-a-change]]
func (one *Scheduler) moved(names []string) {
	one.mu.Lock()
	if one.stopped {
		one.mu.Unlock()
		return
	}
	one.queued = append(one.queued, names...)
	if one.waving {
		one.mu.Unlock()
		return
	}
	one.waving = true
	one.busy++
	one.mu.Unlock()
	one.spawn(one.waves)
}

// Runs a wave for the names queued, then one more while a commit during it queued more. [[spec/design_output/model#one-wave-settles-a-change]]
func (one *Scheduler) waves() {
	for {
		one.mu.Lock()
		names := one.queued
		one.queued = nil
		if len(names) == 0 || one.stopped {
			one.waving = false
			one.busy--
			one.idle.Broadcast()
			one.mu.Unlock()
			return
		}
		moved := map[string]bool{}
		seen := map[string]bool{}
		var order []string
		for _, name := range names {
			owner := resolve(one.store.groups, name)
			if owner == nil {
				continue
			}
			moved[owner.name] = true
			for _, reader := range one.listOf(owner.name) {
				if !seen[reader] {
					seen[reader] = true
					order = append(order, reader)
				}
			}
		}
		one.byHeight(order)
		one.mu.Unlock()
		one.wave(order, moved)
	}
}

// Each provider reads the snapshot the wave started from, with the values the wave settled below it, so no run reads a half-settled mix. [[spec/design_output/model#one-wave-settles-a-change]]
func (one *Scheduler) wave(order []string, moved map[string]bool) {
	one.runs.Lock()
	defer one.runs.Unlock()
	view := one.store.Snapshot()
	pushed := map[string]any{}
	for _, name := range order {
		if one.isStopped() {
			break
		}
		// Early cutoff: a provider whose inputs all stand still clears. [[spec/design_output/model#one-wave-settles-a-change]]
		if !one.reads(name, moved) {
			continue
		}
		if !one.watched(name, map[string]bool{}) {
			one.hold(name, view.Revision)
			moved[name] = true
			continue
		}
		view = one.settle(name, view, pushed)
		if _, ok := pushed[name]; ok {
			moved[name] = true
		}
	}
	if len(pushed) > 0 {
		one.store.push(pushed)
	}
}

func (one *Scheduler) settle(name string, view Snapshot, pushed map[string]any) Snapshot {
	value, changed, err := one.store.settle(name, view)
	one.mu.Lock()
	delete(one.pending, name)
	one.mu.Unlock()
	if err != nil {
		one.failed(name, err)
		return view
	}
	if changed {
		pushed[name] = value
		return view.with(name, value)
	}
	return view
}

func (one *Scheduler) reads(name string, moved map[string]bool) bool {
	for _, in := range one.store.owner(name).inputs {
		if owner := resolve(one.store.groups, in.name); owner != nil && moved[owner.name] {
			return true
		}
	}
	return false
}

// A provider stays watched while it, or a provider below it, stands watched. [[spec/design_output/model#one-wave-settles-a-change]]
func (one *Scheduler) watched(name string, seen map[string]bool) bool {
	one.mu.Lock()
	dropped := one.unwatched[name]
	one.mu.Unlock()
	if !dropped {
		return true
	}
	seen[name] = true
	for _, reader := range one.readers[name] {
		if !seen[reader] && one.watched(reader, seen) {
			return true
		}
	}
	return false
}

func (one *Scheduler) hold(name string, revision int64) {
	one.mu.Lock()
	defer one.mu.Unlock()
	if _, ok := one.pending[name]; !ok {
		one.pending[name] = revision
	}
}

func (one *Scheduler) pendingAt(name string) (int64, bool) {
	one.mu.Lock()
	defer one.mu.Unlock()
	at, ok := one.pending[name]
	return at, ok
}

func (one *Scheduler) isStopped() bool {
	one.mu.Lock()
	defer one.mu.Unlock()
	return one.stopped
}

// Blocks until no wave runs or waits. [[spec/design_output/model#one-wave-settles-a-change]]
func (one *Scheduler) Settle() {
	one.mu.Lock()
	defer one.mu.Unlock()
	for one.busy > 0 {
		one.idle.Wait()
	}
}

// Starts no wave past this call, drops the queued names, and waits out the wave in flight, so no run outlives its index. [[spec/design_output/model#one-wave-settles-a-change]]
func (one *Scheduler) Stop() {
	one.mu.Lock()
	one.stopped = true
	one.mu.Unlock()
	one.Settle()
}

// Drops a name from the watched ones, so a wave keeps it pending until a reader asks. [[spec/design_output/model#one-wave-settles-a-change]]
func (one *Scheduler) Unwatch(name string) {
	one.mu.Lock()
	defer one.mu.Unlock()
	one.unwatched[name] = true
}

// Reads a name, running its pending upstream and then it first, and waiting for no write. [[spec/design_output/model#one-wave-settles-a-change]]
func (one *Scheduler) Read(name string) any {
	if _, ok := one.pendingAt(name); !ok {
		return one.store.Snapshot().Read(name)
	}
	one.runs.Lock()
	chain := one.upstream(name, map[string]bool{})
	one.byHeight(chain)
	view := one.store.Snapshot()
	pushed := map[string]any{}
	for _, held := range chain {
		view = one.settle(held, view, pushed)
	}
	one.runs.Unlock()
	if len(pushed) > 0 {
		one.store.push(pushed)
	}
	return one.store.Snapshot().Read(name)
}

// The pending providers a name reads through, itself among them. [[spec/design_output/model#one-wave-settles-a-change]]
func (one *Scheduler) upstream(name string, seen map[string]bool) []string {
	if seen[name] {
		return nil
	}
	seen[name] = true
	if _, ok := one.pendingAt(name); !ok {
		return nil
	}
	chain := []string{name}
	for _, in := range one.store.owner(name).inputs {
		if owner := resolve(one.store.groups, in.name); owner != nil {
			chain = append(chain, one.upstream(owner.name, seen)...)
		}
	}
	return chain
}

// How many run lists the scheduler keeps. [[spec/design_output/model#one-wave-settles-a-change]]
func (one *Scheduler) Lists() int {
	one.mu.Lock()
	defer one.mu.Unlock()
	return len(one.lists)
}
