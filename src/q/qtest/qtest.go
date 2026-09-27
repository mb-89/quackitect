// The fake index: one module in memory, built off its Register, seeded with
// the inputs a case names, run, and read back. It opens no disk and no port.
// [[spec/design_output/model#the-fake-index]]
package qtest

import (
	"testing"

	"quackitect/src/q"
)

type Index struct {
	t       testing.TB
	store   *q.Store
	inputs  q.Writer
	commits []map[string]any
}

// The input families the index provides itself, per proposal (k) of [[spec/funnel/the-owner-rules-the-specs]].
func New(t testing.TB, register func(*q.Catalog)) *Index {
	t.Helper()
	c := q.New()
	inputs := q.Join(
		q.GivenIn(c, "files/<path...>", "", q.Doc("a file's text, as the case seeds it")),
		q.GivenIn(c, "buffers/<path...>", "", q.Doc("a buffer's text, as the case seeds it")),
		q.GivenIn(c, "cfg/<key...>", "", q.Doc("a config value, as the case seeds it")),
		q.GivenIn(c, "clock/minute", int64(0), q.Doc("the minute, as the case seeds it")),
	)
	register(c)
	return Over(t, c, inputs)
}

// Drives a catalog another hand filled, the real index's among them, through the same steps as the fake. [[spec/design_output/model#the-fake-keeps-a-contract]]
func Over(t testing.TB, c *q.Catalog, inputs q.Writer) *Index {
	t.Helper()
	if faults := c.Check(nil); len(faults) > 0 {
		t.Fatalf("the catalog refuses: %v", faults)
	}
	one := &Index{t: t, store: q.NewStore(c, nil), inputs: inputs}
	one.store.OnCommit(func(values map[string]any) { one.commits = append(one.commits, values) })
	return one
}

func (one *Index) Seed(values map[string]any) {
	one.t.Helper()
	if _, err := one.store.Commit(one.store.Snapshot().Revision, one.inputs, values); err != nil {
		one.t.Fatal(err)
	}
}

func (one *Index) Read(name string) any { return one.store.Snapshot().Read(name) }

func (one *Index) Run(name string) any {
	one.t.Helper()
	if err := one.store.Run(name); err != nil {
		one.t.Fatal(err)
	}
	return one.Read(name)
}

func (one *Index) Land(name string, events ...any) any {
	one.t.Helper()
	for _, event := range events {
		if err := one.store.Land(name, event); err != nil {
			one.t.Fatal(err)
		}
	}
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
func (one *Index) Commits() []map[string]any { return one.commits }
