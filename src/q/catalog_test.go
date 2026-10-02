// The catalog check, one case a fault. Each case builds its own catalog, so
// every case runs beside every other.
// [[spec/design_output/model#the-index-resolves-in-passes]]
package q

import (
	"strings"
	"testing"
)

func faultsOf(t *testing.T, faults []Fault, kind Kind) []Fault {
	t.Helper()
	var found []Fault
	for _, one := range faults {
		if one.Kind == kind {
			found = append(found, one)
		}
	}
	return found
}

func wherePoints(t *testing.T, one Fault, places int) {
	t.Helper()
	if len(one.Where) != places {
		t.Fatalf("the fault names %d places, not %d: %+v", len(one.Where), places, one)
	}
	for _, at := range one.Where {
		if !strings.Contains(at, "catalog_test.go:") {
			t.Fatalf("the fault names %q, not a file and line here", at)
		}
	}
}

type twoOf struct {
	N int `q:"t/n"`
}

func TestANameTwiceRefusesTheStart(t *testing.T) {
	c := New()
	OutIn(c, "t/n", 0)
	OutIn(c, "t/n", 0)
	found := faultsOf(t, c.Check(), Twice)
	if len(found) != 1 || found[0].Name != "t/n" {
		t.Fatalf("the check answers %+v", found)
	}
	wherePoints(t, found[0], 2)
}

func TestAMissingDefaultRefusesTheStart(t *testing.T) {
	c := New()
	OutIn[map[string]int](c, "t/map", nil)
	OutIn[[]int](c, "t/list", nil)
	OutIn(c, "t/full", map[string]int{})
	found := faultsOf(t, c.Check(), NoDefault)
	if len(found) != 2 || found[0].Name != "t/map" || found[1].Name != "t/list" {
		t.Fatalf("the check answers %+v", found)
	}
	wherePoints(t, found[0], 1)
}

func TestAnInputNamingNoNameRefuses(t *testing.T) {
	c := New()
	DerivedIn(c, "t/two", 0, func(in twoOf) int { return in.N })
	found := faultsOf(t, c.Check(), NoName)
	if len(found) != 1 || found[0].Name != "t/two" || !strings.Contains(found[0].Says, "t/n") {
		t.Fatalf("the check answers %+v", found)
	}
}

func TestAnInputOfAnotherTypeRefuses(t *testing.T) {
	c := New()
	OutIn(c, "t/n", "a string")
	DerivedIn(c, "t/two", 0, func(in twoOf) int { return in.N })
	found := faultsOf(t, c.Check(), OtherType)
	if len(found) != 1 || !strings.Contains(found[0].Says, "int") || !strings.Contains(found[0].Says, "string") {
		t.Fatalf("the check answers %+v", found)
	}
}

type readsB struct {
	B int `q:"t/b"`
}

type readsA struct {
	A int `q:"t/a"`
}

func TestADerivedCycleRefuses(t *testing.T) {
	c := New()
	DerivedIn(c, "t/a", 0, func(in readsB) int { return in.B })
	DerivedIn(c, "t/b", 0, func(in readsA) int { return in.A })
	found := faultsOf(t, c.Check(), Cycle)
	if len(found) != 1 || !strings.Contains(found[0].Says, "t/a") || !strings.Contains(found[0].Says, "t/b") {
		t.Fatalf("the check answers %+v", found)
	}
}

func TestANameOfOtherThanLowercaseSegmentsRefuses(t *testing.T) {
	c := New()
	OutIn(c, "T/Big", 0)
	OutIn(c, "t//gap", 0)
	OutIn(c, "ops/<id>", 0)
	found := faultsOf(t, c.Check(), BadName)
	if len(found) != 2 || found[0].Name != "T/Big" || found[1].Name != "t//gap" {
		t.Fatalf("the check answers %+v", found)
	}
}

// [[spec/tickets/files-topic-reads-the-rows]]
func TestAKeyOfManySegmentsStandsLast(t *testing.T) {
	c := New()
	OutIn(c, "files/<path...>", "")
	OutIn(c, "t/<rest...>/tail", "")
	found := faultsOf(t, c.Check(), BadName)
	if len(found) != 1 || found[0].Name != "t/<rest...>/tail" {
		t.Fatalf("the check answers %+v", found)
	}
}

type optionalOf struct {
	N int `q:"t/absent,optional"`
}

// An input tagged optional passes the check with no writer, and reads its zero value. [[spec/tickets/the-config-module-resolves-layers]]
func TestAnOptionalInputWithNoWriterPassesTheCheck(t *testing.T) {
	c := New()
	DerivedIn(c, "t/m", 0, func(in optionalOf) int { return in.N + 1 }, Doc("one past the absent name"))
	if faults := c.Check(); len(faults) > 0 {
		t.Fatalf("the check refuses an optional input with no writer: %v", faults)
	}
	if got := run(t, NewStore(c), "t/m"); got != 1 {
		t.Fatalf("t/m reads %v off the zero value of t/absent", got)
	}
}

type countsOf struct {
	Counts map[string]int `q:"files/<path...>"`
}

// A map over a family takes the family's own type, so a map of another fails the check, and the family map reads no key of another family. [[spec/tickets/tickets-becomes-a-module]]
func TestAFamilyMapOfAnotherTypeFailsTheCheck(t *testing.T) {
	c := New()
	OutIn(c, "files/<path...>", Content{}, Doc("a file"))
	DerivedIn(c, "t/counts", 0, func(in countsOf) int { return len(in.Counts) }, Doc("the count"))
	if found := faultsOf(t, c.Check(), OtherType); len(found) != 1 {
		t.Fatalf("a map of int over a family of Content reads %v", found)
	}
	one := New()
	hand := OutIn(one, "files/<path...>", Content{}, Doc("a file"))
	other := OutIn(one, "buffers/<path...>", Content{}, Doc("a buffer"))
	DerivedIn(one, "t/texts", 0, func(in filesOf) int { return len(in.Files) }, Doc("the count of files"))
	s := NewStore(one)
	seed(t, s, hand, "files/a.md", Content{Hash: "a"})
	seed(t, s, other, "buffers/b.md", Content{Hash: "b"})
	if got := run(t, s, "t/texts"); got != 1 {
		t.Fatalf("the family map reads %v keys", got)
	}
}
