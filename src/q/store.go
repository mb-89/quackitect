// The store: values in memory at one revision. A snapshot reads one revision,
// and a commit lands a run's output with the revision it read.
// [[spec/design_output/model#snapshots-and-revisions]]
package q

import (
	"fmt"
	"reflect"
	"sync"
	"time"
)

type cell struct {
	value any
	from  int64
}

type Store struct {
	mu       sync.Mutex
	folding  sync.Mutex
	groups   []named
	active   map[string]*registration
	revision int64
	values   map[string]cell
	stale    map[*registration]time.Time
}

type Snapshot struct {
	Revision int64
	values   map[string]cell
	stale    map[*registration]time.Time
	store    *Store
}

func NewStore(c *Catalog, keys map[string]string) *Store {
	groups := byName(c.all())
	active := map[string]*registration{}
	for _, group := range groups {
		if chosen, fault := pick(group, keys); fault == nil {
			active[group.name] = chosen
		}
	}
	return &Store{groups: groups, active: active, values: map[string]cell{}}
}

func (s *Store) owner(name string) *registration {
	if group := resolve(s.groups, name); group != nil {
		return s.active[group.name]
	}
	return nil
}

func (s *Store) Snapshot() Snapshot {
	s.mu.Lock()
	defer s.mu.Unlock()
	return Snapshot{Revision: s.revision, values: s.values, stale: s.stale, store: s}
}

// [[spec/design_output/model#snapshots-and-revisions]]
func (s *Store) Commit(read int64, values map[string]any) (int64, error) {
	for name, value := range values {
		one := s.owner(name)
		if one == nil {
			return 0, fmt.Errorf("the catalog holds no active provider of %s", name)
		}
		if got := reflect.TypeOf(value); got == nil || !got.AssignableTo(one.typ) {
			return 0, fmt.Errorf("%s holds a %s, not a %T", name, one.typ, value)
		}
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	next := make(map[string]cell, len(s.values)+len(values))
	for name, held := range s.values {
		next[name] = held
	}
	for name, value := range values {
		next[name] = cell{value: value, from: read}
	}
	if len(s.stale) > 0 {
		current := make(map[*registration]time.Time, len(s.stale))
		for held, at := range s.stale {
			current[held] = at
		}
		for name := range values {
			delete(current, s.owner(name))
		}
		s.stale = current
	}
	s.revision++
	s.values = next
	return s.revision, nil
}

func (s *Store) Run(name string) error {
	one := s.owner(name)
	if one == nil || one.kind != derived {
		return fmt.Errorf("%s names no derived provider", name)
	}
	snap := s.Snapshot()
	_, err := s.Commit(snap.Revision, map[string]any{name: one.run(snap)})
	return err
}

func (s *Store) Land(name string, event any) error {
	one := s.owner(name)
	if one == nil || one.kind != fold {
		return fmt.Errorf("%s names no fold", name)
	}
	s.folding.Lock()
	defer s.folding.Unlock()
	snap := s.Snapshot()
	next, err := one.step(snap.Read(name), event)
	if err != nil {
		return err
	}
	_, err = s.Commit(snap.Revision, map[string]any{name: next})
	return err
}

// [[spec/design_output/model#a-caller-sets-its-wait]]
type Declared struct {
	Op       bool
	Writes   bool
	Deadline time.Duration
}

func (s *Store) Declared(name string) (Declared, bool) {
	one := s.owner(name)
	if one == nil {
		return Declared{}, false
	}
	return Declared{Op: one.op, Writes: one.writes, Deadline: one.deadline}, true
}

// A stale mark keys by provider, so a sibling under the same topic stays current. [[spec/design_output/model#a-stale-mark]]
func (s *Store) Stale(provider string, since time.Time) error {
	one := s.owner(provider)
	if one == nil {
		return fmt.Errorf("the catalog holds no active provider of %s", provider)
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	next := make(map[*registration]time.Time, len(s.stale)+1)
	for held, at := range s.stale {
		next[held] = at
	}
	next[one] = since
	s.stale = next
	return nil
}

func (one Snapshot) Stale(name string) (time.Time, bool) {
	owner := one.store.owner(name)
	if owner == nil {
		return time.Time{}, false
	}
	since, ok := one.stale[owner]
	return since, ok
}

func (one Snapshot) Read(name string) any {
	if held, ok := one.values[name]; ok {
		return held.value
	}
	if owner := one.store.owner(name); owner != nil {
		return owner.def
	}
	return nil
}

func (one Snapshot) From(name string) int64 { return one.values[name].from }
