// Each config layer parses off its file, keyed by its path.
// [[spec/design_output/model#everything-on-disk-mirrors]]
package config

import (
	"strings"
	"testing"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
)

func TestEachLayerParsesOffItsFile(t *testing.T) {
	index := qtest.New(t, func(c *q.Catalog) { Registers(c) })
	for _, path := range []string{Tracked, Local, Schema} {
		index.Seed(map[string]any{"files/" + path: q.Content{Hash: "h", Text: "{\n  \"a\": 1\n}\n"}})
		got, _ := index.Run("config/" + path).(q.Ordered)
		if len(got.Keys) != 1 || got.Keys[0] != "a" || got.Fields[0].Literal != "1" {
			t.Fatalf("config/%s reads %+v", path, got)
		}
	}
	if err := index.Store().Run("config/spec/other.json"); err == nil {
		t.Fatal("config/spec/other.json runs, though it stands past both layers")
	}
}

// A module declaring weight and a nested key, and reading weight as the input of its score. [[spec/design_output/model#config-comes-off-the-registrations]]
type weightIn struct {
	Weight int `q:"config/weight"`
}

func weighed(c *q.Catalog) {
	q.CfgIn(c, "weight", 1, q.Doc("how much a ticket weighs"))
	q.CfgIn(c, "stop/after", 1, q.Doc("the seconds before a stop"))
	q.DerivedIn(c, "score", 0, func(in weightIn) int { return in.Weight }, q.Doc("the weight a ticket scores"))
}

// A module declaring a key the whole project shares. [[spec/design_output/model#a-keys-layers]]
func switched(c *q.Catalog) {
	q.CfgIn(c, "switch", 0, q.Shared(), q.Doc("the phase the project stands in"))
}

// The wiring loads the one module type as its instance, and the config module registers over it beside the inputs the case seeds. [[spec/design_output/model#the-config-module]]
func layered(t *testing.T, instance string, register func(*q.Catalog)) *qtest.Index {
	t.Helper()
	w := q.Wiring{Instances: []q.Instance{{Name: instance, Module: instance}}}
	c, faults := q.Load(w, map[string]func(*q.Catalog){instance: register})
	if len(faults) > 0 {
		t.Fatalf("the load refuses: %v", faults)
	}
	inputs := q.Join(
		q.OutIn(c, "files/<path...>", q.Content{}, q.Doc("a file, as the case seeds it")),
		q.OutIn(c, "env/<name>", "", q.Doc("an SE_ variable, as the case seeds it")),
		q.OutIn(c, "index/leases", []string{}, q.Doc("the parts whose lease holds, as the case seeds them")),
	)
	Registers(c)
	return qtest.Over(t, c, inputs)
}

// Each layer file, keyed by instance and then key. [[spec/design_output/model#config-comes-off-the-registrations]]
func files(tracked, local string) map[string]any {
	return map[string]any{
		"files/" + Tracked: q.Content{Hash: "t", Text: tracked},
		"files/" + Local:   q.Content{Hash: "l", Text: local},
	}
}

// Runs both projections, the resolved values and the names in order, and answers the last one. [[spec/design_output/model#a-keys-layers]]
func settles(t *testing.T, ix *qtest.Index, names ...string) any {
	t.Helper()
	for _, name := range append([]string{"config/" + Tracked, "config/" + Local, ValuesName}, names...) {
		if err := ix.Store().Run(name); err != nil {
			t.Fatalf("the run of %s answers %v", name, err)
		}
	}
	return ix.Read(names[len(names)-1])
}

func lands(t *testing.T, ix *qtest.Index, change Change) {
	t.Helper()
	if err := ix.Store().Land(HeldName, change); err != nil {
		t.Fatalf("%s refuses the %s of %s: %v", HeldName, change.Kind, change.Handle, err)
	}
}

// [[spec/design_output/model#the-config-module]]
func TestADeclaredKeyReadsItsInstanceConfigAsInput(t *testing.T) {
	ix := layered(t, "queue", weighed)
	ix.Seed(files(`{"queue": {"weight": 3, "stop": {"after": 4}}}`, `{}`))
	if got := settles(t, ix, "queue/config/weight", "queue/score"); got != 3 {
		t.Fatalf("queue/score reads %v off queue/config/weight", got)
	}
	// A key of two segments reads its nested member. [[spec/design_output/model#config-comes-off-the-registrations]]
	if got := settles(t, ix, "queue/config/stop/after"); got != 4 {
		t.Fatalf("queue/config/stop/after reads %v off the nested file", got)
	}
}

// [[spec/design_output/model#a-context-holds-a-lease]]
func TestAContextPastItsLeaseReadsTheLayerBelow(t *testing.T) {
	ix := layered(t, "queue", weighed)
	ix.Seed(files(`{"queue": {"weight": 3}}`, `{}`))
	ix.Seed(map[string]any{"index/leases": []string{"s1"}})
	lands(t, ix, Change{Kind: Opens, Handle: "a", Holder: "s1", Values: map[string]string{"queue/config/weight": "9"}, Leases: []string{"s1"}})
	if got := settles(t, ix, "queue/config/weight"); got != 9 {
		t.Fatalf("queue/config/weight reads %v under a live context", got)
	}
	ix.Seed(map[string]any{"index/leases": []string{"s2"}})
	if got := settles(t, ix, "queue/config/weight"); got != 3 {
		t.Fatalf("queue/config/weight reads %v past the lease of s1", got)
	}
}

// [[spec/design_output/model#a-context-holds-a-lease]]
func TestAnInnerContextWinsAndHandsBackOnExit(t *testing.T) {
	ix := layered(t, "queue", weighed)
	ix.Seed(files(`{}`, `{}`))
	lands(t, ix, Change{Kind: Opens, Handle: "a", Holder: "s1", Values: map[string]string{"queue/config/weight": "5"}})
	lands(t, ix, Change{Kind: Opens, Handle: "b", Holder: "s1", Parent: "a", Values: map[string]string{"queue/config/weight": "7"}})
	if got := settles(t, ix, "queue/config/weight"); got != 7 {
		t.Fatalf("queue/config/weight reads %v under the inner context", got)
	}
	lands(t, ix, Change{Kind: Closes, Handle: "b"})
	if got := settles(t, ix, "queue/config/weight"); got != 5 {
		t.Fatalf("queue/config/weight reads %v after the inner context closes", got)
	}
	// An override wins over a context. [[spec/design_output/model#a-keys-layers]]
	lands(t, ix, Change{Kind: Overrides, Values: map[string]string{"queue/config/weight": "11"}})
	if got := settles(t, ix, "queue/config/weight"); got != 11 {
		t.Fatalf("queue/config/weight reads %v under an override over a context", got)
	}
}

// [[spec/design_output/model#a-context-holds-a-lease]]
func TestTwoUnrelatedContextsOnOneKeyRefuseNamingTheHolder(t *testing.T) {
	ix := layered(t, "queue", weighed)
	lands(t, ix, Change{Kind: Opens, Handle: "a", Holder: "s1", Values: map[string]string{"queue/config/weight": "5"}, Leases: []string{"s1", "s2"}})
	err := ix.Store().Land(HeldName, Change{Kind: Opens, Handle: "b", Holder: "s2", Values: map[string]string{"queue/config/weight": "7"}, Leases: []string{"s1", "s2"}})
	if err == nil || !strings.Contains(err.Error(), "s1") {
		t.Fatalf("the second context answers %v, and names no holder s1", err)
	}
}

// [[spec/design_output/model#a-keys-layers]]
func TestASharedKeyReadsTheDefaultFileAlone(t *testing.T) {
	ix := layered(t, "migration", switched)
	ix.Seed(files(`{"migration": {"switch": 1}}`, `{"migration": {"switch": 2}}`))
	ix.Seed(map[string]any{"env/SE_MIGRATION_SWITCH": "4"})
	// The tracked file reaches a shared key through the waves alone, with no run a case names. [[spec/tickets/index-reads-loaded-projections]]
	if got := ix.Read("migration/config/switch"); got != 1 {
		t.Fatalf("migration/config/switch reads %v before any run, where the tracked file says 1", got)
	}
	lands(t, ix, Change{Kind: Opens, Handle: "a", Holder: "s1", Values: map[string]string{"migration/config/switch": "5"}})
	lands(t, ix, Change{Kind: Overrides, Values: map[string]string{"migration/config/switch": "6"}})
	if got := settles(t, ix, "migration/config/switch"); got != 1 {
		t.Fatalf("migration/config/switch reads %v, not the default file's value", got)
	}
}
