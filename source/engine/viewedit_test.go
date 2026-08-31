package main

import (
	"os"
	"strings"
	"testing"
)

// A VIEW FILE IS THE OWNER'S. It carries comments explaining why a view is the
// way it is, and a change must not take them with it.
func TestWritingAViewKeepsWhatSomebodyWroteInIt(t *testing.T) {
	p := writeBase(t, t.TempDir(), "w.base", `# WHY THIS VIEW EXISTS, in the owner's own words.
properties:
  title:
    opensNote: true
views:
  - type: table
    name: left
    order:
      - title
      - status
    columnSize:
      title: 300
      status: 110

  - type: table
    name: right
    order:
      - title
`)
	if err := SetWidth(p, "left", "title", 420); err != nil {
		t.Fatal(err)
	}
	after, _ := os.ReadFile(p)
	text := string(after)

	if !strings.Contains(text, "# WHY THIS VIEW EXISTS, in the owner's own words.") {
		t.Fatal("the comment went with the change")
	}
	if !strings.Contains(text, "title: 420") {
		t.Fatalf("the width was not written:\n%s", text)
	}
	if !strings.Contains(text, "status: 110") {
		t.Fatal("writing one width took another with it")
	}
	// And the file still reads.
	b, err := LoadBase(p)
	if err != nil {
		t.Fatalf("the file no longer reads: %v", err)
	}
	if b.Views[0].Widths["title"] != 420 || b.Views[0].Widths["status"] != 110 {
		t.Fatalf("the widths read back as %v", b.Views[0].Widths)
	}
	if len(b.Views) != 2 || b.Views[1].Name != "right" {
		t.Fatalf("the second view is %v", b.Views)
	}
}

// A width nobody set yet is added rather than refused.
func TestAWidthIsAddedWhereThereWasNone(t *testing.T) {
	p := writeBase(t, t.TempDir(), "w.base",
		"views:\n  - name: left\n    order:\n      - title\n")
	if err := SetWidth(p, "left", "title", 200); err != nil {
		t.Fatal(err)
	}
	b, err := LoadBase(p)
	if err != nil {
		t.Fatal(err)
	}
	if b.Views[0].Widths["title"] != 200 {
		text, _ := os.ReadFile(p)
		t.Fatalf("it read back as %v:\n%s", b.Views[0].Widths, text)
	}
}

// A dragged heading writes the order, and the columns it names are the columns
// that draw.
func TestDraggingAHeadingWritesTheOrder(t *testing.T) {
	p := writeBase(t, t.TempDir(), "o.base",
		"views:\n  - name: left\n    order:\n      - title\n      - status\n")
	if err := SetOrder(p, "left", []string{"status", "title"}); err != nil {
		t.Fatal(err)
	}
	b, err := LoadBase(p)
	if err != nil {
		t.Fatal(err)
	}
	if len(b.Views[0].Order) != 2 || b.Views[0].Order[0] != "status" {
		t.Fatalf("the order read back as %v", b.Views[0].Order)
	}
	// An order with nothing in it would draw an empty table.
	if err := SetOrder(p, "left", nil); err == nil {
		t.Fatal("an empty order was accepted")
	}
}

// CLICKING A HEADING REPLACES EVERY SORT LEVEL. A heading that added one would
// make the header and the sort list disagree about what is in force.
func TestClickingAHeadingReplacesTheSort(t *testing.T) {
	p := writeBase(t, t.TempDir(), "s.base",
		"views:\n  - name: left\n    order:\n      - title\n    sort:\n      - property: seq\n        direction: ASC\n      - property: title\n        direction: DESC\n")
	if err := SetSort(p, "left", "status", "DESC"); err != nil {
		t.Fatal(err)
	}
	b, err := LoadBase(p)
	if err != nil {
		t.Fatal(err)
	}
	if len(b.Views[0].Sort) != 1 {
		t.Fatalf("%d sort levels, and a heading names one", len(b.Views[0].Sort))
	}
	if b.Views[0].Sort[0].Property != "status" || !b.Views[0].Sort[0].Descending {
		t.Fatalf("it sorts by %+v", b.Views[0].Sort[0])
	}
}

// A view nobody declared is named rather than written to by accident.
func TestWritingAViewThatIsNotThereRefuses(t *testing.T) {
	p := writeBase(t, t.TempDir(), "n.base", "views:\n  - name: left\n    order:\n      - title\n")
	if err := SetWidth(p, "middle", "title", 100); err == nil {
		t.Fatal("a view that does not exist was written to")
	} else if !strings.Contains(err.Error(), "middle") {
		t.Fatalf("the refusal does not name it: %v", err)
	}
}
