// The env module writes each SE_ variable at start, and nothing else.
// [[spec/design_output/model#io-modules-and-their-fakes]]
package env

import (
	"testing"

	"quackitect/src/q"
)

func TestEnvWritesEachVariableAtStart(t *testing.T) {
	c := q.New()
	hand := Registers(c)
	s := q.NewStore(c)
	err := Start(FakeEnv{"SE_ROLE": "cloud", "HOME": "/root"}, func(values map[string]any) error {
		_, err := s.Commit(s.Snapshot().Revision, hand, values)
		return err
	})
	if err != nil {
		t.Fatal(err)
	}
	if got := s.Snapshot().Read("vars/SE_ROLE"); got != "cloud" {
		t.Fatalf("vars/SE_ROLE reads %v", got)
	}
	if got := s.Snapshot().Read("vars/HOME"); got != "" {
		t.Fatalf("vars/HOME reads %v", got)
	}
}

func TestAnEnvWithNoVariableCommitsNothing(t *testing.T) {
	committed := false
	err := Start(FakeEnv{"HOME": "/root"}, func(map[string]any) error {
		committed = true
		return nil
	})
	if err != nil || committed {
		t.Fatalf("the env commits %v, and answers %v", committed, err)
	}
}

// Only the env's own writer commits a variable. [[spec/tickets/commits-name-their-writer]]
func TestAVariableRefusesAnotherWriter(t *testing.T) {
	c := q.New()
	Registers(c)
	other := q.OutIn(c, "t/other", 0)
	s := q.NewStore(c)
	if _, err := s.Commit(0, other, map[string]any{"vars/SE_ROLE": "cloud"}); err == nil {
		t.Fatal("a commit of vars/SE_ROLE as another writer lands")
	}
	if got := s.Snapshot().Read("vars/SE_ROLE"); got != "" {
		t.Fatalf("vars/SE_ROLE reads %v after the refusal", got)
	}
}
