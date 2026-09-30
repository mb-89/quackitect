// The book of operations: a handle, its states, one writer per tree, the
// restart, the deadline and the retention.
// [[spec/design_output/model#operations]]
package index

import (
	"sort"
	"strings"
	"testing"
	"time"

	"quackitect/src/q"
)

type clock struct{ now time.Time }

func (c *clock) Now() time.Time          { return c.now }
func (c *clock) pass(span time.Duration) { c.now = c.now.Add(span) }

type memory struct{ rows map[string]Op }

func (m *memory) Save(one Op) error    { m.rows[one.ID] = one; return nil }
func (m *memory) Drop(id string) error { delete(m.rows, id); return nil }
func (m *memory) All() ([]Op, error) {
	out := []Op{}
	for _, one := range m.rows {
		out = append(out, one)
	}
	return out, nil
}

var (
	writer = q.Declared{Writes: true, Deadline: time.Minute}
	reader = q.Declared{Deadline: time.Minute}
)

func bookOf(t *testing.T, rows ...Op) (*Book, *clock, *memory) {
	t.Helper()
	c := &clock{now: time.Unix(1_700_000_000, 0)}
	m := &memory{rows: map[string]Op{}}
	for _, one := range rows {
		m.rows[one.ID] = one
	}
	b, err := NewBook(c.Now, m, BookSettings{Done: time.Hour, Failed: 24 * time.Hour})
	if err != nil {
		t.Fatal(err)
	}
	return b, c, m
}

func stateOf(t *testing.T, b *Book, id string) State {
	t.Helper()
	one, ok := b.Get(id)
	if !ok {
		t.Fatalf("%s stands nowhere in the book", id)
	}
	return one.State
}

func TestAStartAnswersAQueuedHandle(t *testing.T) {
	b, _, m := bookOf(t)
	id, err := b.Start("t/pull", "in", "s1", writer)
	if err != nil {
		t.Fatal(err)
	}
	if !strings.HasPrefix(Name(id), "ops/") || strings.Count(Name(id), "/") != 1 {
		t.Fatalf("the handle reads %q", Name(id))
	}
	if got := stateOf(t, b, id); got != Queued {
		t.Fatalf("the start stands %s", got)
	}
	if m.rows[id].Action != "t/pull" || m.rows[id].Caller != "s1" {
		t.Fatalf("the keep holds %+v", m.rows[id])
	}
}

func TestTheIdsSortByStartTime(t *testing.T) {
	b, c, _ := bookOf(t)
	var ids []string
	for _, span := range []time.Duration{0, 0, time.Millisecond, time.Hour} {
		c.pass(span)
		id, err := b.Start("t/pull", nil, "s1", reader)
		if err != nil {
			t.Fatal(err)
		}
		ids = append(ids, id)
	}
	if !sort.StringsAreSorted(ids) || ids[0] == ids[1] {
		t.Fatalf("the ids read %v", ids)
	}
}

func TestAWriterWaitsBehindTheWriterAhead(t *testing.T) {
	b, _, _ := bookOf(t)
	first, _ := b.Start("t/pull", nil, "s1", writer)
	second, _ := b.Start("t/place", nil, "s1", writer)
	b.Next()
	if stateOf(t, b, first) != Running || stateOf(t, b, second) != Queued {
		t.Fatalf("the writers stand %s and %s", stateOf(t, b, first), stateOf(t, b, second))
	}
	if err := b.Finish(first, "ok"); err != nil {
		t.Fatal(err)
	}
	b.Next()
	if stateOf(t, b, second) != Running {
		t.Fatalf("the second writer stands %s after the first ends", stateOf(t, b, second))
	}
}

func TestAReaderRunsBesideAWriter(t *testing.T) {
	b, _, _ := bookOf(t)
	first, _ := b.Start("t/pull", nil, "s1", writer)
	b.Next()
	read, _ := b.Start("t/read", nil, "s1", reader)
	if stateOf(t, b, first) != Running || stateOf(t, b, read) != Running {
		t.Fatalf("the writer stands %s and the reader %s", stateOf(t, b, first), stateOf(t, b, read))
	}
}

func TestAMoveOffTheTableRefuses(t *testing.T) {
	b, _, _ := bookOf(t)
	id, _ := b.Start("t/pull", nil, "s1", writer)
	err := b.Finish(id, "ok")
	if err == nil || !strings.Contains(err.Error(), "queued") || !strings.Contains(err.Error(), "done") {
		t.Fatalf("a queued op moving to done answers %v", err)
	}
	if got := stateOf(t, b, id); got != Queued {
		t.Fatalf("the refused op stands %s", got)
	}
}

func TestACancelEndsAQueuedOrRunningOp(t *testing.T) {
	b, _, _ := bookOf(t)
	queued, _ := b.Start("t/pull", nil, "s1", writer)
	running, _ := b.Start("t/read", nil, "s1", reader)
	for _, id := range []string{queued, running} {
		if err := b.Cancel(id, "the caller cancels"); err != nil {
			t.Fatal(err)
		}
		if got := stateOf(t, b, id); got != Cancelled {
			t.Fatalf("%s stands %s after the cancel", id, got)
		}
	}
}

func TestARestartFailsEveryOpInFlight(t *testing.T) {
	b, _, m := bookOf(t,
		Op{ID: "1-a", State: Queued},
		Op{ID: "2-b", State: Running},
		Op{ID: "3-c", State: Done},
	)
	if err := b.Restart(); err != nil {
		t.Fatal(err)
	}
	for _, id := range []string{"1-a", "2-b"} {
		if m.rows[id].State != Failed || !strings.Contains(m.rows[id].Error, "restart") {
			t.Fatalf("%s keeps %+v", id, m.rows[id])
		}
	}
	if m.rows["3-c"].State != Done {
		t.Fatalf("the ended op keeps %+v", m.rows["3-c"])
	}
}

func TestAnOpPastItsDeadlineFails(t *testing.T) {
	b, c, _ := bookOf(t)
	id, _ := b.Start("t/read", nil, "s1", reader)
	c.pass(30 * time.Second)
	if ended := b.Expire(); len(ended) != 0 {
		t.Fatalf("the deadline ends %v early", ended)
	}
	c.pass(time.Minute)
	if ended := b.Expire(); len(ended) != 1 || ended[0] != id {
		t.Fatalf("the deadline ends %v", ended)
	}
	if got := stateOf(t, b, id); got != Failed {
		t.Fatalf("the op past its deadline stands %s", got)
	}
}

func TestAnEndedOpLeavesAfterItsWindow(t *testing.T) {
	b, c, m := bookOf(t)
	done, _ := b.Start("t/read", nil, "s1", reader)
	failed, _ := b.Start("t/read", nil, "s1", reader)
	b.Finish(done, "ok")
	b.Fail(failed, "a door call fails")
	c.pass(30 * time.Minute)
	b.Sweep()
	if _, ok := b.Get(done); !ok {
		t.Fatal("the done op leaves inside its window")
	}
	c.pass(time.Hour)
	b.Sweep()
	if _, ok := b.Get(done); ok {
		t.Fatal("the done op stands past its window")
	}
	if _, ok := m.rows[done]; ok {
		t.Fatal("the keep holds the done op past its window")
	}
	if _, ok := b.Get(failed); !ok {
		t.Fatal("the failed op leaves inside its longer window")
	}
}

func TestEveryMoveReachesTheIndex(t *testing.T) {
	b, _, _ := bookOf(t)
	var heard []State
	b.OnMove(func(one Op) { heard = append(heard, one.State) })
	id, _ := b.Start("t/read", nil, "s1", reader)
	b.Finish(id, "ok")
	if len(heard) != 3 || heard[0] != Queued || heard[1] != Running || heard[2] != Done {
		t.Fatalf("the index hears %v", heard)
	}
}

// [[spec/tickets/commits-name-their-writer]]
func TestRegistersHandsTheWriterOfItsFamily(t *testing.T) {
	c := q.New()
	as := Registers(c)
	store := q.NewStore(c)
	if _, err := store.Commit(0, as, map[string]any{Name("7"): Op{ID: "7"}}); err != nil {
		t.Fatal(err)
	}
	if held, _ := store.Snapshot().Read(Name("7")).(Op); held.ID != "7" {
		t.Fatalf("%s reads %#v", Name("7"), held)
	}
}

// [[spec/tickets/the-hooks-door-lands]]
func TestOfAnswersEveryOperationOfTheCaller(t *testing.T) {
	b, _, _ := bookOf(t)
	first, _ := b.Start("work/pull", nil, "s1", q.Declared{})
	if _, err := b.Start("work/pull", nil, "s2", q.Declared{}); err != nil {
		t.Fatal(err)
	}
	second, _ := b.Start("ticket/yours", nil, "s1", q.Declared{})
	if err := b.Finish(first, "pulled"); err != nil {
		t.Fatal(err)
	}
	got := b.Of("s1")
	if len(got) != 2 || got[0].ID != first || got[0].State != Done || got[1].ID != second {
		t.Fatalf("the book answers %+v, and wants both operations of s1 by id, the ended one among them", got)
	}
}
