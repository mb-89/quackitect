// The book of operations: the handle a longer action answers, its states,
// one writer per tree, the restart, the deadline and the retention.
// [[spec/design_output/model#operations]]
package index

import (
	"encoding/json"
	"fmt"
	"slices"
	"sort"
	"sync"
	"time"

	"quackitect/src/config"
	"quackitect/src/q"
)

type State string

const (
	Queued    State = "queued"
	Running   State = "running"
	Done      State = "done"
	Failed    State = "failed"
	Cancelled State = "cancelled"
)

type Progress struct {
	Done  int    `json:"done"`
	Known int    `json:"known"`
	Step  string `json:"step"`
}

// [[spec/design_output/model#the-handle-is-a-name]]
type Op struct {
	ID       string    `json:"id"`
	Action   string    `json:"action"`
	Input    any       `json:"input,omitempty"`
	Caller   string    `json:"caller"`
	State    State     `json:"state"`
	Progress Progress  `json:"progress"`
	Deadline time.Time `json:"deadline"`
	Result   any       `json:"result,omitempty"`
	Error    string    `json:"error,omitempty"`
	Undone   []string  `json:"undone,omitempty"`
	Writes   bool      `json:"writes"`
	Started  time.Time `json:"started"`
	Ended    time.Time `json:"ended"`
}

// The seam the index fills, so an operation outlives a restart. [[spec/design_output/model#an-operation-outlives-callers]]
type Keep interface {
	Save(one Op) error
	All() ([]Op, error)
	Drop(id string) error
}

// [[spec/design_output/model#what-stays-how-long]]
type BookSettings struct {
	Done   time.Duration
	Failed time.Duration
}

type Book struct {
	mu       sync.Mutex
	clock    q.Clock
	keep     Keep
	settings BookSettings
	ops      map[string]*Op
	count    int
	moved    func(Op)
	// Each save closes it and lays a new one, so a waiter wakes on every move. [[spec/design_output/model#the-agent-does-not-poll]]
	changed chan struct{}
	// The timer a wait arms its span through: the clock's, which a case swaps. [[spec/tickets/caller-wait-meets-no-sleep]]
	after func(time.Duration) <-chan time.Time
}

// [[spec/design_output/model#the-states]]
var moves = map[State][]State{
	Queued:  {Running, Failed, Cancelled},
	Running: {Done, Failed, Cancelled},
}

// [[spec/design_output/model#what-stays-how-long]]
func bookSettingsOf(root string) BookSettings {
	return BookSettings{
		Done:   time.Duration(config.Count(root, "ops.keepDone")) * time.Second,
		Failed: time.Duration(config.Count(root, "ops.keepFailed")) * time.Second,
	}
}

func NewBook(clock q.Clock, keep Keep, settings BookSettings) (*Book, error) {
	all, err := keep.All()
	if err != nil {
		return nil, err
	}
	b := &Book{clock: clock, keep: keep, settings: settings, ops: map[string]*Op{}, changed: make(chan struct{}), after: clock.After}
	for _, one := range all {
		held := one
		b.ops[one.ID] = &held
	}
	return b, nil
}

// The manager pushes each move under ops/<id>. [[spec/design_output/model#the-states]]
func (b *Book) OnMove(fn func(Op)) {
	b.mu.Lock()
	defer b.mu.Unlock()
	b.moved = fn
}

func Name(id string) string { return "ops/" + id }

// [[spec/design_output/model#the-handle-is-a-name]]
func (b *Book) Start(action string, input any, caller string, declared q.Declared) (string, error) {
	b.mu.Lock()
	defer b.mu.Unlock()
	now := b.clock.Now()
	b.count++
	one := &Op{
		ID:      fmt.Sprintf("%019d-%06d", now.UnixNano(), b.count),
		Action:  action,
		Input:   input,
		Caller:  caller,
		State:   Queued,
		Writes:  declared.Writes,
		Started: now,
	}
	if declared.Deadline > 0 {
		one.Deadline = now.Add(declared.Deadline)
	}
	b.ops[one.ID] = one
	if err := b.save(one); err != nil {
		return "", err
	}
	if !one.Writes {
		return one.ID, b.move(one, Running, "", nil)
	}
	return one.ID, nil
}

// The writer queue: one writer per tree, in the order they arrive. [[spec/design_output/model#one-writer-per-tree]]
func (b *Book) Next() []string {
	b.mu.Lock()
	defer b.mu.Unlock()
	var next *Op
	for _, one := range b.ops {
		if one.Writes && one.State == Running {
			return nil
		}
		if one.Writes && one.State == Queued && (next == nil || one.ID < next.ID) {
			next = one
		}
	}
	if next == nil || b.move(next, Running, "", nil) != nil {
		return nil
	}
	return []string{next.ID}
}

func (b *Book) Finish(id string, result any) error { return b.end(id, Done, "", result) }
func (b *Book) Fail(id, reason string) error       { return b.end(id, Failed, reason, nil) }

// ops/cancel: a running one stops before its next door call. [[spec/design_output/model#the-states]]
func (b *Book) Cancel(id, reason string) error { return b.end(id, Cancelled, reason, nil) }

func (b *Book) Get(id string) (Op, bool) {
	b.mu.Lock()
	defer b.mu.Unlock()
	one, ok := b.ops[id]
	if !ok {
		return Op{}, false
	}
	return *one, true
}

// An operation in flight at a crash ends loud. [[spec/design_output/model#an-operation-outlives-callers]]
func (b *Book) Restart() error {
	b.mu.Lock()
	defer b.mu.Unlock()
	for _, one := range b.inFlight() {
		if err := b.move(one, Failed, "the index restarts", nil); err != nil {
			return err
		}
	}
	return nil
}

// [[spec/design_output/model#deadlines]]
func (b *Book) Expire() []string {
	b.mu.Lock()
	defer b.mu.Unlock()
	now, ended := b.clock.Now(), []string{}
	for _, one := range b.inFlight() {
		if !one.Deadline.IsZero() && now.After(one.Deadline) && b.move(one, Failed, "the deadline passes", nil) == nil {
			ended = append(ended, one.ID)
		}
	}
	return ended
}

// A window of zero keeps the operation. [[spec/design_output/model#what-stays-how-long]]
func (b *Book) Sweep() []string {
	b.mu.Lock()
	defer b.mu.Unlock()
	now, gone := b.clock.Now(), []string{}
	for id, one := range b.ops {
		window := b.settings.Done
		if one.State == Failed {
			window = b.settings.Failed
		}
		if one.Ended.IsZero() || window <= 0 || now.Sub(one.Ended) <= window {
			continue
		}
		if b.keep.Drop(id) == nil {
			delete(b.ops, id)
			gone = append(gone, id)
		}
	}
	sort.Strings(gone)
	return gone
}

// Every operation the session starts, in or out of flight, by id. [[spec/tickets/the-hooks-door-lands]]
func (b *Book) Of(caller string) []Op {
	b.mu.Lock()
	defer b.mu.Unlock()
	out := []Op{}
	for _, one := range b.ops {
		if one.Caller == caller {
			out = append(out, *one)
		}
	}
	sort.Slice(out, func(i, j int) bool { return out[i].ID < out[j].ID })
	return out
}

func (b *Book) inFlight() []*Op {
	out := []*Op{}
	for _, one := range b.ops {
		if one.State == Queued || one.State == Running {
			out = append(out, one)
		}
	}
	sort.Slice(out, func(i, j int) bool { return out[i].ID < out[j].ID })
	return out
}

func (b *Book) end(id string, to State, reason string, result any) error {
	b.mu.Lock()
	defer b.mu.Unlock()
	one, ok := b.ops[id]
	if !ok {
		return fmt.Errorf("%s names no operation", Name(id))
	}
	return b.move(one, to, reason, result)
}

func (b *Book) move(one *Op, to State, reason string, result any) error {
	if !slices.Contains(moves[one.State], to) {
		return fmt.Errorf("%s stands %s, and the states table holds no move to %s", Name(one.ID), one.State, to)
	}
	one.State = to
	if to != Running {
		one.Ended, one.Error, one.Result = b.clock.Now(), reason, result
	}
	return b.save(one)
}

func (b *Book) save(one *Op) error {
	if err := b.keep.Save(*one); err != nil {
		return err
	}
	if b.moved != nil {
		b.moved(*one)
	}
	close(b.changed)
	b.changed = make(chan struct{})
	return nil
}

// The op table's rows read as the Keep the book holds, so the table keeps bytes and names no Op. [[spec/design_output/model#an-operation-outlives-callers]]
type rowsKeep struct{ rows Rows }

func (k rowsKeep) Save(one Op) error {
	body, err := json.Marshal(one)
	if err != nil {
		return err
	}
	return k.rows.Save(one.ID, body)
}

func (k rowsKeep) All() ([]Op, error) {
	rows, err := k.rows.All()
	if err != nil {
		return nil, err
	}
	out := make([]Op, 0, len(rows))
	for _, row := range rows {
		var one Op
		if err := json.Unmarshal(row.Body, &one); err != nil {
			return nil, err
		}
		one.ID = row.ID
		out = append(out, one)
	}
	return out, nil
}

func (k rowsKeep) Drop(id string) error { return k.rows.Drop(id) }
