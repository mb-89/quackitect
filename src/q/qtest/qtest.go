// The fake index: one module in memory, built off its Register, seeded with
// the inputs a case names, run, and read back. It opens no disk and no port.
// [[spec/design_output/model#the-fake-index]]
package qtest

import (
	"sync"
	"testing"

	"quackitect/src/q"
)

type Index struct {
	t       testing.TB
	store   *q.Store
	inputs  q.Writer
	settle  func()
	mu      sync.Mutex
	commits []map[string]any
}

// The input families the index provides itself. [[spec/design_output/model#the-fake-index]]
func New(t testing.TB, register func(*q.Catalog)) *Index {
	t.Helper()
	c := q.New()
	inputs := q.Join(
		q.OutIn(c, "files/<path...>", q.Content{}, q.Doc("a file's hash and text, as the case seeds it")),
		q.OutIn(c, "buffers/<path...>", "", q.Doc("a buffer's text, as the case seeds it")),
		q.OutIn(c, "cfg/<key...>", "", q.Doc("a config value, as the case seeds it")),
		q.OutIn(c, "clock/minute", int64(0), q.Doc("the minute, as the case seeds it")),
	)
	register(c)
	return Over(t, c, inputs)
}

// Drives a catalog another hand filled, the real index's among them, through the same steps as the fake. [[spec/design_output/model#the-fake-keeps-a-contract]]
func Over(t testing.TB, c *q.Catalog, inputs q.Writer) *Index {
	t.Helper()
	if faults := c.Check(); len(faults) > 0 {
		t.Fatalf("the catalog refuses: %v", faults)
	}
	one := Beside(t, q.NewStore(c), inputs, func() {})
	// A spawn that runs in place settles a seed's wave before the seed answers. [[spec/design_output/model#one-wave-settles-a-change]]
	q.NewScheduler(one.store, func(run func()) { run() }, func(name string, err error) {
		t.Errorf("the run of %s answers %v", name, err)
	})
	return one
}

// Drives a store another hand builds and schedules, the door's among them, and waits out its waves through settle after each write. [[spec/design_output/model#the-fake-keeps-a-contract]]
func Beside(t testing.TB, store *q.Store, inputs q.Writer, settle func()) *Index {
	one := &Index{t: t, store: store, inputs: inputs, settle: settle}
	store.OnCommit(func(values map[string]any) {
		one.mu.Lock()
		defer one.mu.Unlock()
		one.commits = append(one.commits, values)
	})
	return one
}

func (one *Index) Seed(values map[string]any) {
	one.t.Helper()
	if _, err := one.store.Commit(one.store.Snapshot().Revision, one.inputs, values); err != nil {
		one.t.Fatal(err)
	}
	one.settle()
}

// Commits as the writer a case's own registration hands back, since the store refuses a name past its writer. [[spec/tickets/commits-name-their-writer]]
func (one *Index) SeedAs(as q.Writer, values map[string]any) {
	one.t.Helper()
	if _, err := one.store.Commit(one.store.Snapshot().Revision, as, values); err != nil {
		one.t.Fatal(err)
	}
	one.settle()
}

func (one *Index) Read(name string) any { return one.store.Snapshot().Read(name) }

// The store an IO module starts over, so its case runs over the fake like every module. [[spec/tickets/the-manager-becomes-a-module]]
func (one *Index) Store() *q.Store { return one.store }

func (one *Index) Run(name string) any {
	one.t.Helper()
	if err := one.store.Run(name); err != nil {
		one.t.Fatal(err)
	}
	one.settle()
	return one.Read(name)
}

func (one *Index) Land(name string, events ...any) any {
	one.t.Helper()
	for _, event := range events {
		if err := one.store.Land(name, event); err != nil {
			one.t.Fatal(err)
		}
	}
	one.settle()
	return one.Read(name)
}

// Every request the action answers, in order: each list's last Then reads the answers the case hands it, one slice a list. [[spec/design_output/model#an-action-lists-requests]]
func (one *Index) Act(name string, input any, answers ...[]any) []q.Request {
	one.t.Helper()
	asked, err := one.store.Act(name, input)
	if err != nil {
		one.t.Fatal(err)
	}
	var ran []q.Request
	for len(asked) > 0 {
		ran = append(ran, asked...)
		last := asked[len(asked)-1]
		if last.Then == nil {
			break
		}
		var said []any
		if len(answers) > 0 {
			said, answers = answers[0], answers[1:]
		}
		asked = last.Then(said)
	}
	return ran
}

// [[spec/design_output/model#the-fake-index]]
func (one *Index) Commits() []map[string]any {
	one.settle()
	one.mu.Lock()
	defer one.mu.Unlock()
	return append([]map[string]any(nil), one.commits...)
}
