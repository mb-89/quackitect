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
	GivenIn(c, "t/n", 0)
	GivenIn(c, "t/n", 0)
	found := faultsOf(t, c.Check(nil), Twice)
	if len(found) != 1 || found[0].Name != "t/n" {
		t.Fatalf("the check answers %+v", found)
	}
	wherePoints(t, found[0], 2)
}

func TestAMissingDefaultRefusesTheStart(t *testing.T) {
	c := New()
	GivenIn[map[string]int](c, "t/map", nil)
	GivenIn[[]int](c, "t/list", nil)
	GivenIn(c, "t/full", map[string]int{})
	found := faultsOf(t, c.Check(nil), NoDefault)
	if len(found) != 2 || found[0].Name != "t/map" || found[1].Name != "t/list" {
		t.Fatalf("the check answers %+v", found)
	}
	wherePoints(t, found[0], 1)
}

func TestTwoActiveProvidersRefuseTheStart(t *testing.T) {
	c := New()
	DerivedIn(c, "t/two", 0, func(in twoOf) int { return in.N }, Alt("t.local"))
	DerivedIn(c, "t/two", 0, func(in twoOf) int { return in.N * 2 }, Alt("t.remote"))
	GivenIn(c, "t/n", 0)
	found := faultsOf(t, c.Check(nil), TwoActive)
	if len(found) != 1 || found[0].Name != "t/two" || !strings.Contains(found[0].Says, "providers.t/two") {
		t.Fatalf("the check answers %+v", found)
	}
	wherePoints(t, found[0], 2)
}

func TestTheKeyPicksOneAlt(t *testing.T) {
	c := New()
	GivenIn(c, "t/n", 0)
	DerivedIn(c, "t/two", 0, func(in twoOf) int { return in.N }, Alt("t.local"))
	DerivedIn(c, "t/two", 0, func(in twoOf) int { return in.N * 2 }, Alt("t.remote"))
	if faults := c.Check(map[string]string{"providers.t/two": "t.remote"}); len(faults) != 0 {
		t.Fatalf("the key picks one, and the check answers %+v", faults)
	}
	found := faultsOf(t, c.Check(map[string]string{"providers.t/two": "t.nobody"}), NoAlt)
	if len(found) != 1 || found[0].Name != "t/two" {
		t.Fatalf("a key naming no alt answers %+v", found)
	}
}

func TestAPlainRegistrationStandsBesideAnAlt(t *testing.T) {
	c := New()
	GivenIn(c, "t/n", 0)
	DerivedIn(c, "t/two", 0, func(in twoOf) int { return in.N })
	DerivedIn(c, "t/two", 0, func(in twoOf) int { return in.N * 2 }, Alt("t.remote"))
	if faults := c.Check(nil); len(faults) != 0 {
		t.Fatalf("the plain one stands, and the check answers %+v", faults)
	}
}

func TestAnInputNamingNoNameRefuses(t *testing.T) {
	c := New()
	DerivedIn(c, "t/two", 0, func(in twoOf) int { return in.N })
	found := faultsOf(t, c.Check(nil), NoName)
	if len(found) != 1 || found[0].Name != "t/two" || !strings.Contains(found[0].Says, "t/n") {
		t.Fatalf("the check answers %+v", found)
	}
}

func TestAnInputOfAnotherTypeRefuses(t *testing.T) {
	c := New()
	GivenIn(c, "t/n", "a string")
	DerivedIn(c, "t/two", 0, func(in twoOf) int { return in.N })
	found := faultsOf(t, c.Check(nil), OtherType)
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
	found := faultsOf(t, c.Check(nil), Cycle)
	if len(found) != 1 || !strings.Contains(found[0].Says, "t/a") || !strings.Contains(found[0].Says, "t/b") {
		t.Fatalf("the check answers %+v", found)
	}
}

func TestANameOfOtherThanLowercaseSegmentsRefuses(t *testing.T) {
	c := New()
	GivenIn(c, "T/Big", 0)
	GivenIn(c, "t//gap", 0)
	GivenIn(c, "ops/<id>", 0)
	found := faultsOf(t, c.Check(nil), BadName)
	if len(found) != 2 || found[0].Name != "T/Big" || found[1].Name != "t//gap" {
		t.Fatalf("the check answers %+v", found)
	}
}

// [[spec/tickets/files-topic-reads-the-rows]]
func TestAKeyOfManySegmentsStandsLast(t *testing.T) {
	c := New()
	GivenIn(c, "files/<path...>", "")
	GivenIn(c, "t/<rest...>/tail", "")
	found := faultsOf(t, c.Check(nil), BadName)
	if len(found) != 1 || found[0].Name != "t/<rest...>/tail" {
		t.Fatalf("the check answers %+v", found)
	}
}

// [[spec/tickets/providers-keys-reach-check]]
func TestNamesListEveryGroupOnce(t *testing.T) {
	c := New()
	GivenIn(c, "t/n", 0, Alt("t.local"))
	GivenIn(c, "t/n", 0, Alt("t.remote"))
	GivenIn(c, "t/m", 0)
	if said := c.Names(); len(said) != 2 || said[0] != "t/m" || said[1] != "t/n" {
		t.Fatalf("the names read %v", said)
	}
}
