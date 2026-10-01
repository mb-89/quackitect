// The store: values in memory at one revision. A snapshot reads one revision,
// and a commit lands a run's output with the revision it read.
// [[spec/design_output/model#snapshots-and-revisions]]
package q

import (
	"bytes"
	"encoding/json"
	"fmt"
	"reflect"
	"sort"
	"strings"
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
	down     map[*registration]bool
	heard    []func(values map[string]any)
	moves    []func(names []string)
	pending  func(name string) (int64, bool)
}

type Snapshot struct {
	Revision int64
	values   map[string]cell
	stale    map[*registration]time.Time
	down     map[*registration]bool
	store    *Store
}

func NewStore(c *Catalog) *Store {
	groups := byName(c.all())
	return &Store{groups: groups, active: activeOf(groups), values: map[string]cell{}}
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
	return Snapshot{Revision: s.revision, values: s.values, stale: s.stale, down: s.down, store: s}
}

// [[spec/design_output/model#snapshots-and-revisions]]
func (s *Store) Commit(read int64, as Writer, values map[string]any) (int64, error) {
	before := s.Snapshot()
	revision, heard, err := s.commit(read, as, values)
	for _, hand := range heard {
		hand(values)
	}
	// A name whose JSON form stays starts no wave, so an equal commit runs nothing below it. [[spec/design_output/model#one-wave-settles-a-change]]
	if err == nil {
		if moved := movedIn(before, values); len(moved) > 0 {
			for _, hand := range s.moving() {
				hand(moved)
			}
		}
	}
	return revision, err
}

// The names of values whose JSON form differs from what the snapshot reads. [[spec/design_output/model#one-wave-settles-a-change]]
func movedIn(before Snapshot, values map[string]any) []string {
	var moved []string
	for name, value := range values {
		if !same(before.Read(name), value) {
			moved = append(moved, name)
		}
	}
	return moved
}

func same(a, b any) bool {
	left, err := json.Marshal(a)
	if err != nil {
		return reflect.DeepEqual(a, b)
	}
	right, err := json.Marshal(b)
	if err != nil {
		return reflect.DeepEqual(a, b)
	}
	return bytes.Equal(left, right)
}

func (s *Store) moving() []func(names []string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.moves
}

// The scheduler hears the names a commit from outside moves. [[spec/design_output/model#one-wave-settles-a-change]]
func (s *Store) onMove(fn func(names []string)) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.moves = append(s.moves, fn)
}

// Runs a derived provider over the wave's view, and commits where its value moves, with no hand heard. [[spec/design_output/model#one-wave-settles-a-change]]
func (s *Store) settle(name string, view Snapshot) (any, bool, error) {
	one := s.owner(name)
	if one == nil || one.kind != derived || (one.run == nil && one.keyed == nil) {
		return nil, false, fmt.Errorf("%s names no derived provider", name)
	}
	// A loaded projection parses one file per concrete name, as Run does. [[spec/tickets/index-reads-loaded-projections]]
	var value any
	if one.keyed != nil {
		parsed, err := one.keyed(view, name)
		if err != nil {
			return nil, false, err
		}
		value = parsed
	} else {
		value = one.run(view)
	}
	if same(view.Read(name), value) {
		return value, false, nil
	}
	_, _, err := s.commit(view.Revision, Writer{[]*registration{one}}, map[string]any{name: value})
	return value, err == nil, err
}

// Hands a wave's values to every hand that listens, once. [[spec/design_output/model#one-wave-settles-a-change]]
func (s *Store) push(values map[string]any) {
	s.mu.Lock()
	heard := s.heard
	s.mu.Unlock()
	for _, hand := range heard {
		hand(values)
	}
}

// The view a wave reads: this snapshot, with one value the wave settled over it. [[spec/design_output/model#one-wave-settles-a-change]]
func (one Snapshot) with(name string, value any) Snapshot {
	next := make(map[string]cell, len(one.values)+1)
	for held, at := range one.values {
		next[held] = at
	}
	next[name] = cell{value: value, from: one.Revision}
	one.values = next
	return one
}

// The hands hear a commit after the lock lets go, so a hand reading a snapshot waits on nothing. [[spec/design_output/model#the-fake-index]]
func (s *Store) commit(read int64, as Writer, values map[string]any) (int64, []func(values map[string]any), error) {
	for name, value := range values {
		one := s.owner(name)
		if one == nil {
			return 0, nil, fmt.Errorf("the catalog holds no active provider of %s", name)
		}
		// Only the writer holding the name's active owner writes it. [[spec/tickets/commits-name-their-writer]]
		if !as.holds(one) {
			return 0, nil, fmt.Errorf("%s belongs to %s, and the commit names another writer", name, one.portName())
		}
		if got := reflect.TypeOf(value); got == nil || !got.AssignableTo(one.typ) {
			return 0, nil, fmt.Errorf("%s holds a %s, not a %T", name, one.typ, value)
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
	return s.revision, s.heard, nil
}

// Takes the names out of the store in one revision, so a value past its window leaves. [[spec/design_output/model#what-stays-how-long]]
func (s *Store) Drop(read int64, as Writer, names ...string) (int64, error) {
	for _, name := range names {
		one := s.owner(name)
		if one == nil {
			return 0, fmt.Errorf("the catalog holds no active provider of %s", name)
		}
		if !as.holds(one) {
			return 0, fmt.Errorf("%s belongs to %s, and the drop names another writer", name, one.name)
		}
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	next := make(map[string]cell, len(s.values))
	for name, held := range s.values {
		next[name] = held
	}
	for _, name := range names {
		delete(next, name)
	}
	s.revision++
	s.values = next
	return s.revision, nil
}

// Each commit reaches every hand that listens, which the fake index reads. [[spec/design_output/model#the-fake-index]]
func (s *Store) OnCommit(fn func(values map[string]any)) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.heard = append(s.heard, fn)
}

func (s *Store) Run(name string) error {
	one := s.owner(name)
	if one == nil || one.kind != derived {
		return fmt.Errorf("%s names no derived provider", name)
	}
	snap := s.Snapshot()
	value := any(nil)
	// A loaded projection runs per key, so a run reaches one file. [[spec/design_output/model#everything-on-disk-mirrors]]
	if one.keyed != nil {
		parsed, err := one.keyed(snap, name)
		if err != nil {
			return err
		}
		value = parsed
	} else {
		value = one.run(snap)
	}
	_, err := s.Commit(snap.Revision, Writer{[]*registration{one}}, map[string]any{name: value})
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
	_, err = s.Commit(snap.Revision, Writer{[]*registration{one}}, map[string]any{name: next})
	return err
}

// The folds whose name opens on the prefix, such as session/<id>/, sorted, so the hooks IO module lands each event on every fold over its session. [[spec/tickets/the-hooks-door-lands]]
func (s *Store) Folds(prefix string) []string {
	s.mu.Lock()
	defer s.mu.Unlock()
	out := []string{}
	for _, one := range s.active {
		if one.kind == fold && strings.HasPrefix(one.name, prefix) {
			out = append(out, one.name)
		}
	}
	sort.Strings(out)
	return out
}

// [[spec/design_output/model#a-caller-sets-its-wait]]
type Declared struct {
	Writes   bool
	Deadline time.Duration
}

func (s *Store) Declared(name string) (Declared, bool) {
	one := s.owner(name)
	if one == nil {
		return Declared{}, false
	}
	return Declared{Writes: one.writes, Deadline: one.deadline}, true
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
	if owner := one.store.owner(name); owner != nil && one.down[owner] {
		return owner.def
	}
	if held, ok := one.values[name]; ok {
		return held.value
	}
	if owner := one.store.owner(name); owner != nil {
		return owner.def
	}
	return nil
}

// Every value the family pattern holds, keyed by the path past its fixed segments. [[spec/tickets/tickets-becomes-a-module]]
func (one Snapshot) family(pattern string, into reflect.Type) reflect.Value {
	out := reflect.MakeMap(into)
	prefix := pattern[:strings.Index(pattern, "<")]
	for name, held := range one.values {
		value := reflect.ValueOf(held.value)
		if matches(pattern, name) && value.IsValid() && value.Type().AssignableTo(into.Elem()) {
			out.SetMapIndex(reflect.ValueOf(strings.TrimPrefix(name, prefix)), value)
		}
	}
	return out
}

func (one Snapshot) From(name string) int64 { return one.values[name].from }

// Marks an instance that runs nowhere, so a read of its out-ports answers the built-in value. [[spec/design_output/model#the-index-resolves-in-passes]]
func (s *Store) Down(instance string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	next := make(map[*registration]bool, len(s.down)+1)
	for held := range s.down {
		next[held] = true
	}
	found := false
	for _, group := range s.groups {
		for _, one := range group.regs {
			if one.instance == instance {
				next[one], found = true, true
			}
		}
	}
	if !found {
		return fmt.Errorf("the wiring loads no instance %s", instance)
	}
	s.down = next
	return nil
}

// The names an instance's providers read, off other instances. [[spec/design_output/model#the-placements]]
func (s *Store) Inputs(instance string) []string {
	return s.namesOf(instance, func(one *registration) []string {
		var read []string
		for _, in := range one.inputs {
			if !strings.HasPrefix(in.name, instance+"/") {
				read = append(read, in.name)
			}
		}
		return read
	})
}

// The names an instance provides. [[spec/design_output/model#the-placements]]
func (s *Store) Outputs(instance string) []string {
	return s.namesOf(instance, func(one *registration) []string { return []string{one.name} })
}

// The names of picks over each active registration of an instance, sorted once each. [[spec/design_output/model#the-placements]]
func (s *Store) namesOf(instance string, picks func(*registration) []string) []string {
	seen := map[string]bool{}
	out := []string{}
	for _, group := range s.groups {
		one := s.active[group.name]
		if one == nil || one.instance != instance {
			continue
		}
		for _, name := range picks(one) {
			if !seen[name] {
				seen[name] = true
				out = append(out, name)
			}
		}
	}
	sort.Strings(out)
	return out
}

// Clears the down mark of an instance whose process commits again. [[spec/design_output/model#a-process-ends]]
func (s *Store) Up(instance string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	next := make(map[*registration]bool, len(s.down))
	for held := range s.down {
		if held.instance != instance {
			next[held] = true
		}
	}
	s.down = next
	return nil
}

// Decodes a JSON body into the type the owner of name registers, so a commit off the bus lands typed. [[spec/design_output/model#a-message-carries-types]]
func (s *Store) Value(name string, body []byte) (any, error) {
	owner := s.owner(name)
	if owner == nil {
		return nil, fmt.Errorf("the catalog registers no %s", name)
	}
	value := reflect.New(owner.typ)
	if err := json.Unmarshal(body, value.Interface()); err != nil {
		return nil, fmt.Errorf("%s decodes as no %s: %w", name, owner.typ, err)
	}
	return value.Elem().Interface(), nil
}

// [[spec/design_output/model#the-index-resolves-in-passes]]
func (one Snapshot) NotProvided(name string) bool {
	owner := one.store.owner(name)
	return owner != nil && one.down[owner]
}
