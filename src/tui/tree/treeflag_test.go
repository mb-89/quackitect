// The flags column, read as letters. Every case holds memory and no file.
// [[spec/design_output/tree-view#a-flag-draws-a-letter]]

package tree

import (
	"fmt"
	"strings"
	"testing"

	"quackitect/tui/draw"
)

func flagCols() []Column {
	return []Column{
		{Name: "name", Key: "name", Wide: 10},
		{Name: "flags", Key: flagsKey, Wide: 6},
		{Name: "says", Key: "says", Wide: 0},
	}
}

func flagItems() []Item {
	return []Item{
		{Name: "lit", Keys: map[string]string{"urgent": "true", "person": "false", "held": "true"}},
		{Name: "dim", Keys: map[string]string{"urgent": "false", "person": "false", "held": "false"}},
	}
}

func flagTree() *Tree {
	tree := NewTree(flagCols(), flagItems(), false)
	tree.Flagged([]Flag{
		{Letter: "U", Key: "urgent"},
		{Letter: "Y", Key: "person"},
		{Letter: "W", Key: "held"},
		{Letter: "B", Key: "waits"},
	})
	return tree
}

// Every letter stands upper in its place, and the states say which stand lit. [[spec/design_output/tree-view#a-flag-draws-a-letter]]
func TestARowDrawsEveryLetterUpperInAFixedPlaceAndTheStatesSayWhichAreLit(t *testing.T) {
	t.Parallel()
	tree := flagTree()
	for _, one := range flagItems() {
		if said := tree.Letters(one); said != "UYWB" {
			t.Fatalf("every row reads UYWB, and %s reads %q", one.Name, said)
		}
	}
	lit := []bool{}
	for _, held := range tree.States(flagItems()[0]) {
		lit = append(lit, held.On)
	}
	if fmt.Sprint(lit) != "[true false true false]" {
		t.Fatalf("the lit row lights U and W, and the states read %v", lit)
	}
	if said := tree.Rows(60, 2); !strings.Contains(said, "U") || !strings.Contains(said, "lit") {
		t.Fatalf("the column draws the letters, and the rows read %q", said)
	}
}

// A flag no row carries stands off on every row. [[spec/design_output/tree-view#a-flag-draws-a-letter]]
func TestAFlagNoRowCarriesStandsOffOnEveryRow(t *testing.T) {
	t.Parallel()
	tree := flagTree()
	for _, one := range flagItems() {
		states := tree.States(one)
		if last := states[len(states)-1]; last.On || last.Letter != "B" {
			t.Fatalf("the unknown flag stands off and upper, and it reads %v", last)
		}
	}
}

// A lit letter wears its tone, and one off wears the grey, the way the footer's funnel does. [[spec/design_output/tui#colours]]
func TestALetterWearsItsToneWhileLitAndGreyWhileOff(t *testing.T) {
	t.Parallel()
	good := FlagStyle(FlagState{Letter: "W", On: true, Tone: ToneGood})
	bad := FlagStyle(FlagState{Letter: "U", On: true, Tone: ToneBad})
	off := FlagStyle(FlagState{Letter: "U", On: false, Tone: ToneBad})
	if !good.GetBold() || !bad.GetBold() || off.GetBold() {
		t.Fatal("a lit letter stands bold, and one off stands plain")
	}
	if fmt.Sprint(good.GetForeground()) == fmt.Sprint(off.GetForeground()) && draw.FlagColour(ToneGood) != "" {
		t.Fatal("a lit letter and one off wear two colours")
	}
	if len(flagTree().Flags()) == 0 || flagTree().Flags()[0].Tone != "" {
		t.Fatal("a flag naming no tone carries none, and lights in the plain colour")
	}
}

// A value flag names a tone a value, so an open ticket and a closed one wear two colours. [[spec/design_output/tree-view#a-flag-draws-a-letter]]
func TestAValueFlagWearsATonePerValue(t *testing.T) {
	t.Parallel()
	tree := NewTree(sortCols(), []Item{
		{Name: "open-one", Keys: map[string]string{"state": "open"}},
		{Name: "shut-one", Keys: map[string]string{"state": "closed"}},
	}, false)
	tree.Flagged([]Flag{{Key: "state", Value: true, Tones: map[string]string{"open": ToneGood}}})
	if said := tree.States(tree.Items[0])[0]; said.Tone != ToneGood || said.Letter != "O" {
		t.Fatalf("an open state wears the good tone, and reads %v", said)
	}
	if said := tree.States(tree.Items[1])[0]; said.Tone != "" || said.Letter != "C" {
		t.Fatalf("a closed state wears the plain tone, and reads %v", said)
	}
	// A route names its own tone, so a note and a trivial ticket wear two colours. [[spec/design_output/tree-view#a-flag-draws-a-letter]]
	routes := NewTree(sortCols(), []Item{{Name: "parked", Keys: map[string]string{"route": "note"}}}, false)
	routes.Flagged([]Flag{{Key: "route", Value: true, Tones: map[string]string{"note": "note"}}})
	if said := routes.States(routes.Items[0])[0]; said.Tone != "note" || said.Letter != "N" {
		t.Fatalf("a note reads N in its own tone, and reads %v", said)
	}
}

// The keys stay ordinary keys, so the filter needs no new word. [[spec/design_output/tree-view#a-flag-draws-a-letter]]
func TestAFilterOverAFlagReadsItAsAnOrdinaryKey(t *testing.T) {
	t.Parallel()
	tree := flagTree()

	lit, err := draw.ParseFilter("urgent: true")
	if err != nil {
		t.Fatal(err)
	}
	tree.Narrow(lit)
	sameNames(t, namesOf(tree), []string{"lit"})

	rest, err := draw.ParseFilter("not urgent: true")
	if err != nil {
		t.Fatal(err)
	}
	tree.Narrow(rest)
	sameNames(t, namesOf(tree), []string{"dim"})
}

// A flag over a value draws the value's first letter, upper, and a dash where the value stands empty. [[spec/design_output/tree-view#a-flag-draws-a-letter]]
func TestAValueFlagDrawsTheValuesFirstLetter(t *testing.T) {
	t.Parallel()
	tree := NewTree(sortCols(), []Item{
		{Name: "open-one", Keys: map[string]string{"state": "open", "urgent": "true"}},
		{Name: "bare", Keys: map[string]string{"state": "", "urgent": "false"}},
	}, false)
	tree.Flagged([]Flag{{Key: "state", Value: true}, {Letter: "U", Key: "urgent"}})
	if said := tree.Letters(tree.Items[0]); said != "OU" {
		t.Fatalf("an open urgent row reads OU, and it reads %q", said)
	}
	if said := tree.Letters(tree.Items[1]); said != "-U" {
		t.Fatalf("a bare row reads a dash and an unlit mark, and it reads %q", said)
	}
	states := tree.States(tree.Items[0])
	if len(states) != 2 || !states[0].On || states[0].Value != "open" || states[1].Place != 1 {
		t.Fatalf("the states carry the value and the place, and they read %v", states)
	}
}
