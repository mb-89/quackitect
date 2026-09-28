// The fake index keeps the contract, and reads a file the case seeds.
// [[spec/design_output/model#the-fake-index]]
package qtest

import (
	"strings"
	"testing"

	"quackitect/src/q"
)

func TestTheFakeKeepsTheContract(t *testing.T) {
	Suite(t, func(t testing.TB, register func(*q.Catalog)) Harness { return New(t, register) })
}

// A store whose scheduler spawns each run keeps the contract through Beside, which waits out each wave. [[spec/design_output/model#the-fake-keeps-a-contract]]
func TestASpawningStoreKeepsTheContractBeside(t *testing.T) {
	Suite(t, func(t testing.TB, register func(*q.Catalog)) Harness {
		c := q.New()
		inputs := q.Join(
			q.OutIn(c, "files/<path...>", q.Content{}, q.Doc("a file's hash and text, as the case seeds it")),
			q.OutIn(c, "cfg/<key...>", "", q.Doc("a config value, as the case seeds it")),
		)
		register(c)
		store := q.NewStore(c)
		scheduler := q.NewScheduler(store, func(run func()) { go run() }, func(name string, err error) {
			t.Errorf("the run of %s answers %v", name, err)
		})
		t.Cleanup(scheduler.Stop)
		return Beside(t, store, inputs, scheduler.Settle)
	})
}

func TestTheFakeHandsAnIOModuleItsStore(t *testing.T) {
	ix := New(t, func(c *q.Catalog) { q.OutIn(c, "t/n", 0, q.Doc("a count")) })
	if ix.Store() == nil {
		t.Fatal("the fake hands an IO module no store")
	}
	ix.Seed(map[string]any{"clock/minute": int64(3)})
	if got := ix.Store().Snapshot().Read("clock/minute"); got != int64(3) {
		t.Fatalf("the store the fake hands reads clock/minute %v", got)
	}
}

type linesOf struct {
	File q.Content `q:"files/a.md"`
}

func TestADerivedProviderReadsASeededFile(t *testing.T) {
	fake := New(t, func(c *q.Catalog) {
		q.DerivedIn(c, "t/lines", 0, func(in linesOf) int { return strings.Count(in.File.Text, "\n") })
	})
	fake.Seed(map[string]any{"files/a.md": q.Content{Hash: "h", Text: "one\ntwo\n"}})
	if got := fake.Run("t/lines"); got != 2 {
		t.Fatalf("t/lines reads %v", got)
	}
}

// The fake settles a seed's wave in place, so a provider below reads the seed with no run by hand, and one push carries it. [[spec/design_output/model#one-wave-settles-a-change]]
func TestASeedSettlesItsWaveBeforeItAnswers(t *testing.T) {
	fake := New(t, func(c *q.Catalog) {
		q.DerivedIn(c, "t/lines", 0, func(in linesOf) int { return strings.Count(in.File.Text, "\n") })
	})
	fake.Seed(map[string]any{"files/a.md": q.Content{Hash: "h", Text: "one\ntwo\n"}})
	if got := fake.Read("t/lines"); got != 2 {
		t.Fatalf("t/lines reads %v once the seed answers", got)
	}
	if said := fake.Commits(); len(said) != 2 || said[1]["t/lines"] != 2 {
		t.Fatalf("the commits read %v", said)
	}
}

// Over drives a catalog another hand fills, and asks for no provider key, since the wiring file picks a module in place of a key. [[spec/tickets/the-wiring-file-binds-ports]]
func TestOverDrivesACatalogWithNoProviderKeys(t *testing.T) {
	c := q.New()
	inputs := q.OutIn(c, "files/<path...>", q.Content{}, q.Doc("a file, as the case seeds it"))
	q.DerivedIn(c, "t/lines", 0, func(in linesOf) int { return strings.Count(in.File.Text, "\n") })
	fake := Over(t, c, inputs)
	fake.Seed(map[string]any{"files/a.md": q.Content{Hash: "h", Text: "one\n"}})
	if got := fake.Run("t/lines"); got != 1 {
		t.Fatalf("t/lines reads %v", got)
	}
}

// The seeds differ in length, and the sum counts the last event, so a case reading the wrong input or dropping an event fails. [[spec/design_output/model#the-fake-keeps-a-contract]]
func TestTheSuiteSeedsTellApart(t *testing.T) {
	if len(seededWidth) == len(seededText) {
		t.Fatalf("the width and the text seed the same length, %d", len(seededText))
	}
	if eventSum-lastEvent == eventSum {
		t.Fatal("the sum counts no last event")
	}
}
