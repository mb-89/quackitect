package keyword

import "testing"

func TestTheWordIsTheControlsOwnName(t *testing.T) {
	t.Parallel()
	if got := For("search_via_index"); got != "search via index" {
		t.Fatalf("the word reads %q", got)
	}
	if got := For("hold"); got != "hold" {
		t.Fatalf("a one-word name was changed: %q", got)
	}
}

func TestTheWholeMessageHasToBeTheWord(t *testing.T) {
	t.Parallel()
	have := []Of{{Word: "search via index", Key: "guards.search_via_index"}}

	if got, ok := Match("  Search Via Index \n", have); !ok || got.Key != "guards.search_via_index" {
		t.Fatalf("a message that is only the word matched %v %v", got, ok)
	}
	for _, said := range []string{
		"please turn search via index off",
		"search via index is the guard I mean",
		"",
		"   ",
		"search",
	} {
		if _, ok := Match(said, have); ok {
			t.Fatalf("%q was taken as a keyword", said)
		}
	}
}

func TestNothingMatchesWhenNoControlIsReachable(t *testing.T) {
	t.Parallel()
	if _, ok := Match("hold", nil); ok {
		t.Fatal("a word matched with no control declared reachable")
	}
}
