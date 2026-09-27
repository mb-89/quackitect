// A commit names its writer, and the store refuses a name that writer does not provide.
// [[spec/tickets/commits-name-their-writer]]
package q

import (
	"strings"
	"testing"
)

func TestCommitRefusesANameOfAnotherProvider(t *testing.T) {
	c := New()
	GivenIn(c, "t/n", 0)
	other := GivenIn(c, "t/m", 0)
	s := NewStore(c)
	if _, err := s.Commit(0, other, map[string]any{"t/n": 1}); err == nil || !strings.Contains(err.Error(), "t/n") {
		t.Fatalf("a commit of t/n as the provider of t/m answers %v", err)
	}
	if got := s.Snapshot().Read("t/n"); got != 0 {
		t.Fatalf("t/n reads %v after the refusal", got)
	}
}

func TestCommitTakesTheOwnersWriter(t *testing.T) {
	c := New()
	n := GivenIn(c, "t/n", 0)
	m := GivenIn(c, "t/m", 0)
	s := NewStore(c)
	if _, err := s.Commit(0, Join(n, m), map[string]any{"t/n": 1, "t/m": 2}); err != nil {
		t.Fatal(err)
	}
	if now := s.Snapshot(); now.Read("t/n") != 1 || now.Read("t/m") != 2 {
		t.Fatalf("the joined commit reads %v and %v", now.Read("t/n"), now.Read("t/m"))
	}
}
