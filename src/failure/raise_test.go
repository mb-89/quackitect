// The door answers the lines a refusal prints and the row the log takes,
// off the registry a case hands in.
// [[spec/design_output/failures#one-door-raises-a-failure]]
package failure

import (
	"reflect"
	"testing"
)

const stamp = "2026-10-06T17:00:00.000Z"

var held = Node{ID: "leaf-held", Level: "warn", Remedies: []string{"Pull again.", "Hand the leaf back first."}}

func TestRaiseAnswersTheMessageTheIdAtItsLevelAndEachRemedy(t *testing.T) {
	t.Parallel()
	got := Raise(Fake(held), "leaf-held", "a leaf stands in your hand").Lines()
	want := []string{"a leaf stands in your hand", "failure leaf-held at warn", "remedy: Pull again.", "remedy: Hand the leaf back first."}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("Raise prints %q, want %q", got, want)
	}
}

func TestRaiseNamesAnUnregisteredId(t *testing.T) {
	t.Parallel()
	got := Raise(Fake(), "nobody", "it fails").Lines()
	want := []string{"it fails", "failure nobody stands unregistered, so spec/failures names no remedy"}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("Raise prints %q, want %q", got, want)
	}
}

func TestTheRowCarriesTheFailureId(t *testing.T) {
	t.Parallel()
	got := Raise(Fake(held), "leaf-held", "a leaf stands", "in your hand").Row(stamp)
	want := map[string]any{"at": stamp, "level": "warn", "kind": "failure", "said": "a leaf stands in your hand", "failure": "leaf-held"}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("Row answers %#v, want %#v", got, want)
	}
}

func TestAnUnregisteredIdWritesARowAtError(t *testing.T) {
	t.Parallel()
	got := Raise(Fake(), "nobody", "it fails").Row(stamp)
	want := map[string]any{"at": stamp, "level": "error", "kind": "failure", "said": "it fails", "failure": "nobody"}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("Row answers %#v, want %#v", got, want)
	}
}
