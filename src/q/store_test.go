// The store: snapshots at one revision, a run committing what it read, a fold
// over events, and a family answering each key.
// [[spec/design_output/model#snapshots-and-revisions]]
package q

import (
	"strings"
	"testing"
	"time"
)

func TestASnapshotReadsOneRevision(t *testing.T) {
	c := New()
	GivenIn(c, "t/n", 0)
	s := NewStore(c, nil)
	first, err := s.Commit(s.Snapshot().Revision, map[string]any{"t/n": 1})
	if err != nil {
		t.Fatal(err)
	}
	before := s.Snapshot()
	second, err := s.Commit(before.Revision, map[string]any{"t/n": 2})
	if err != nil {
		t.Fatal(err)
	}
	if before.Revision != first || before.Read("t/n") != 1 {
		t.Fatalf("the snapshot at %d reads %v", before.Revision, before.Read("t/n"))
	}
	after := s.Snapshot()
	if second <= first || after.Revision != second || after.Read("t/n") != 2 {
		t.Fatalf("the snapshot at %d reads %v, after %d", after.Revision, after.Read("t/n"), first)
	}
}

func TestANameNobodyWritesReadsItsDefault(t *testing.T) {
	c := New()
	GivenIn(c, "t/n", 7)
	if got := NewStore(c, nil).Snapshot().Read("t/n"); got != 7 {
		t.Fatalf("the default reads %v", got)
	}
}

func TestARunCommitsTheRevisionItRead(t *testing.T) {
	c := New()
	GivenIn(c, "t/n", 0)
	DerivedIn(c, "t/two", 0, func(in twoOf) int { return in.N * 2 })
	s := NewStore(c, nil)
	read, err := s.Commit(0, map[string]any{"t/n": 3})
	if err != nil {
		t.Fatal(err)
	}
	if err := s.Run("t/two"); err != nil {
		t.Fatal(err)
	}
	now := s.Snapshot()
	if now.Read("t/two") != 6 || now.From("t/two") != read || now.Revision <= read {
		t.Fatalf("the run reads %v from %d at %d, after %d", now.Read("t/two"), now.From("t/two"), now.Revision, read)
	}
}

func TestAFoldReducesEachEvent(t *testing.T) {
	c := New()
	FoldIn(c, "t/sum", 0, func(sum, event int) int { return sum + event })
	s := NewStore(c, nil)
	for _, event := range []int{1, 2, 3} {
		if err := s.Land("t/sum", event); err != nil {
			t.Fatal(err)
		}
	}
	if got := s.Snapshot().Read("t/sum"); got != 6 {
		t.Fatalf("the fold reads %v", got)
	}
}

func TestAFamilyAnswersEachKey(t *testing.T) {
	c := New()
	GivenIn(c, "ops/<id>", "none")
	s := NewStore(c, nil)
	if _, err := s.Commit(0, map[string]any{"ops/7": "running"}); err != nil {
		t.Fatal(err)
	}
	now := s.Snapshot()
	if now.Read("ops/7") != "running" || now.Read("ops/8") != "none" {
		t.Fatalf("the family reads %v and %v", now.Read("ops/7"), now.Read("ops/8"))
	}
	if _, err := s.Commit(0, map[string]any{"nobody/7": 1}); err == nil {
		t.Fatal("a commit to a name the catalog lacks lands")
	}
}

// [[spec/tickets/files-topic-reads-the-rows]]
func TestAKeyOfManySegmentsTakesTheRestOfTheName(t *testing.T) {
	c := New()
	GivenIn(c, "files/<path...>", "")
	s := NewStore(c, nil)
	if _, err := s.Commit(0, map[string]any{"files/spec/deep/One.md": "said"}); err != nil {
		t.Fatal(err)
	}
	now := s.Snapshot()
	if now.Read("files/spec/deep/One.md") != "said" || now.Read("files/two.md") != "" {
		t.Fatalf("the family reads %v and %v", now.Read("files/spec/deep/One.md"), now.Read("files/two.md"))
	}
	if _, err := s.Commit(0, map[string]any{"files": "bare"}); err == nil {
		t.Fatal("a name with no segment for the key lands")
	}
}

// [[spec/tickets/files-topic-reads-the-rows]]
func TestAKeyOfManySegmentsFollowsAKeyOfOne(t *testing.T) {
	c := New()
	GivenIn(c, "trees/<tree>/<path...>", 0)
	if faults := c.Check(nil); len(faults) > 0 {
		t.Fatalf("the check answers %+v", faults)
	}
	s := NewStore(c, nil)
	if _, err := s.Commit(0, map[string]any{"trees/a/spec/one.md": 1}); err != nil {
		t.Fatal(err)
	}
	if _, err := s.Commit(0, map[string]any{"trees/a": 1}); err == nil {
		t.Fatal("a name with no segment for the rest lands")
	}
	if _, err := s.Commit(0, map[string]any{"trees//one.md": 1}); err == nil {
		t.Fatal("a name with an empty segment for the key lands")
	}
}

func TestAnActionDeclaresItsHandleAndItsWrite(t *testing.T) {
	c := New()
	GivenIn(c, "t/pull", 0, Op(), Writes())
	GivenIn(c, "t/read", 0)
	s := NewStore(c, nil)
	if got, ok := s.Declared("t/pull"); !ok || !got.Op || !got.Writes {
		t.Fatalf("t/pull declares %+v", got)
	}
	if got, ok := s.Declared("t/read"); !ok || got.Op || got.Writes {
		t.Fatalf("t/read declares %+v", got)
	}
	if _, ok := s.Declared("t/none"); ok {
		t.Fatal("a name nobody provides declares a shape")
	}
}

func TestACommitOfThePartClearsItsStaleMark(t *testing.T) {
	c := New()
	GivenIn(c, "t/n", 0)
	GivenIn(c, "t/m", 0)
	s := NewStore(c, nil)
	since := time.Unix(1_700_000_000, 0)
	if err := s.Stale("t/n", since); err != nil {
		t.Fatal(err)
	}
	if at, stale := s.Snapshot().Stale("t/n"); !stale || !at.Equal(since) {
		t.Fatalf("t/n reads stale %v since %v", stale, at)
	}
	if _, stale := s.Snapshot().Stale("t/m"); stale {
		t.Fatal("t/m reads stale beside t/n")
	}
	if _, err := s.Commit(0, map[string]any{"t/n": 1}); err != nil {
		t.Fatal(err)
	}
	if _, stale := s.Snapshot().Stale("t/n"); stale {
		t.Fatal("t/n reads stale after its commit")
	}
}

func TestAStaleMarkOnANameNobodyProvidesRefuses(t *testing.T) {
	s := NewStore(New(), nil)
	if err := s.Stale("t/none", time.Unix(0, 0)); err == nil || !strings.Contains(err.Error(), "t/none") {
		t.Fatalf("the mark answers %v", err)
	}
}
