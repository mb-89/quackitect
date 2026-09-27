// quack why: the provider and its file and line, the inputs down to the given
// names, every reader, and the state of the value.
// [[spec/design_output/model#quack-why]]
package q

import (
	"fmt"
	"runtime"
	"strings"
	"testing"
	"time"
)

type nOf struct {
	N int `q:"t/n"`
}

type twoIn struct {
	Two int `q:"t/two"`
}

// [[spec/design_output/model#quack-why]]
func whyCatalog() (*Catalog, int) {
	c := New()
	GivenIn(c, "t/n", 0)
	_, _, line, _ := runtime.Caller(0)
	DerivedIn(c, "t/two", 0, func(in nOf) int { return in.N * 2 })
	DerivedIn(c, "t/four", 0, func(in twoIn) int { return in.Two * 2 })
	GivenIn(c, "f/<id>", "")
	return c, line + 1
}

func whyOf(t *testing.T, s *Store, name string) Why {
	t.Helper()
	said, err := s.Why(name)
	if err != nil {
		t.Fatal(err)
	}
	return said
}

func TestWhyNamesTheProvidersFileAndLine(t *testing.T) {
	c, line := whyCatalog()
	said := whyOf(t, NewStore(c, nil), "t/two")
	where := fmt.Sprintf("why_test.go:%d", line)
	if said.Provider.Name != "t/two" || said.Provider.Kind != "derived" || !strings.HasSuffix(said.Provider.Where, where) {
		t.Fatalf("the provider reads %+v, not %s", said.Provider, where)
	}
	if !strings.Contains(said.Text, "t/two") || !strings.Contains(said.Text, where) || !strings.Contains(said.Text, "t/n") {
		t.Fatalf("the text reads %q", said.Text)
	}
}

func TestWhyWalksTheInputsDownToTheGivenNames(t *testing.T) {
	c, _ := whyCatalog()
	said := whyOf(t, NewStore(c, nil), "t/four")
	if len(said.Inputs) != 1 || said.Inputs[0].Field != "Two" || said.Inputs[0].Why.Name != "t/two" {
		t.Fatalf("t/four reads %+v", said.Inputs)
	}
	down := said.Inputs[0].Why.Inputs
	if len(down) != 1 || down[0].Why.Name != "t/n" || down[0].Why.Provider.Kind != "given" || len(down[0].Why.Inputs) != 0 {
		t.Fatalf("t/two reads %+v", down)
	}
}

func TestWhyNamesEveryReader(t *testing.T) {
	c, _ := whyCatalog()
	s := NewStore(c, nil)
	if said := whyOf(t, s, "t/n").Readers; len(said) != 1 || said[0] != "t/two" {
		t.Fatalf("t/n reads readers %v", said)
	}
	if said := whyOf(t, s, "t/four").Readers; len(said) != 0 {
		t.Fatalf("t/four reads readers %v", said)
	}
}

func TestWhyReadsWhetherTheValueStandsAtItsDefault(t *testing.T) {
	c, _ := whyCatalog()
	s := NewStore(c, nil)
	if said := whyOf(t, s, "t/n"); said.State != "default" || said.Value != 0 {
		t.Fatalf("t/n reads %v at %s", said.Value, said.State)
	}
	if _, err := s.Commit(0, map[string]any{"t/n": 3}); err != nil {
		t.Fatal(err)
	}
	if said := whyOf(t, s, "t/n"); said.State != "answered" || said.Value != 3 {
		t.Fatalf("t/n reads %v at %s", said.Value, said.State)
	}
	since := time.Unix(1_700_000_000, 0)
	if err := s.Stale("t/n", since); err != nil {
		t.Fatal(err)
	}
	if said := whyOf(t, s, "t/n"); said.State != "stale" || said.Since == nil || !said.Since.Equal(since) {
		t.Fatalf("t/n reads %s since %v", said.State, said.Since)
	}
}

func TestWhyAnswersEachKeyOfAFamily(t *testing.T) {
	c, _ := whyCatalog()
	if said := whyOf(t, NewStore(c, nil), "f/a"); said.Name != "f/a" || said.Provider.Name != "f/<id>" {
		t.Fatalf("f/a reads %+v", said)
	}
}

func TestWhyOfANameTheCatalogLacksRefuses(t *testing.T) {
	c, _ := whyCatalog()
	if _, err := NewStore(c, nil).Why("t/none"); err == nil || !strings.Contains(err.Error(), "t/none") {
		t.Fatalf("why t/none answers %v", err)
	}
}
