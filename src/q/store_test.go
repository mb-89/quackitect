// The store: snapshots at one revision, a run committing what it read, a fold
// over events, and a family answering each key.
// [[spec/design_output/model#snapshots-and-revisions]]
package q

import "testing"

func TestASnapshotReadsOneRevision(t *testing.T) {
	c := New()
	GivenIn(c, "t/n", 0)
	s := NewStore(c)
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
	if got := NewStore(c).Snapshot().Read("t/n"); got != 7 {
		t.Fatalf("the default reads %v", got)
	}
}

func TestARunCommitsTheRevisionItRead(t *testing.T) {
	c := New()
	GivenIn(c, "t/n", 0)
	DerivedIn(c, "t/two", 0, func(in twoOf) int { return in.N * 2 })
	s := NewStore(c)
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
	s := NewStore(c)
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
	s := NewStore(c)
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
