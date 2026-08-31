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

// PINNING IS THE OWNER'S, AND IT IS A FILTER. A pin written as a value of
// whatever the grouping is today would go wrong the moment the grouping moved.
func TestAGroupIsPinnedAndUnpinned(t *testing.T) {
	path := writeBase(t, t.TempDir(), "work.base", `# the owner's comment stays
views:
  - type: table
    name: left
    order:
      - title
    groups:
      - name: yours
        filter: assignee == "human"
    pinned:
      - yours
`)
	if err := AddPin(path, "left", "open", `status == "open"`); err != nil {
		t.Fatal(err)
	}

	b, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	got := string(b)
	if !strings.Contains(got, "the owner's comment stays") {
		t.Fatal("it lost the comment")
	}
	for _, want := range []string{"- name: yours", "- name: open", `filter: status == "open"`} {
		if !strings.Contains(got, want) {
			t.Fatalf("it does not carry %q:\n%s", want, got)
		}
	}
	// The engine reads back what it wrote, which is the check that matters.
	base, err := LoadBase(path)
	if err != nil {
		t.Fatal(err)
	}
	if n := len(base.Views[0].Pinned); n != 2 {
		t.Fatalf("it reads back %d pins", n)
	}

	// PINNING THE SAME NAME TWICE REPLACES IT rather than making two groups
	// that both claim the same rows.
	if err := AddPin(path, "left", "open", `status == "in_work"`); err != nil {
		t.Fatal(err)
	}
	if base, _ = LoadBase(path); len(base.Views[0].Pinned) != 2 {
		t.Fatalf("pinning open twice left %d pins", len(base.Views[0].Pinned))
	}

	if err := DropPinNamed(path, "left", "yours"); err != nil {
		t.Fatal(err)
	}
	base, err = LoadBase(path)
	if err != nil {
		t.Fatal(err)
	}
	if len(base.Views[0].Pinned) != 1 || base.Views[0].Pinned[0].Name != "open" {
		t.Fatalf("unpinning yours left %v", base.Views[0].Pinned)
	}
	// UNPINNING A FUNCTIONAL GROUP LEAVES IT DECLARED. A pin is an ordering and
	// not an existence, so the group goes on being a group and the rows it held
	// have somewhere to go.
	if len(base.Views[0].Groups) != 1 || base.Views[0].Groups[0].Name != "yours" {
		t.Fatalf("unpinning dropped the declaration: %v", base.Views[0].Groups)
	}
	after, _ := os.ReadFile(path)
	if !strings.Contains(string(after), "name: yours") {
		t.Fatalf("the declaration went with the pin:\n%s", after)
	}
	// AND THE INVENTED ONE WAS NEVER DECLARED. open came from the data, so its
	// filter lives in the pin and this file says nothing else about it.
	if strings.Count(string(after), "- name: open") != 1 {
		t.Fatalf("open is named more than once:\n%s", after)
	}
}

// UNPINNING THE LAST PIN MUST NOT LEAVE A BARE KEY. A key with nothing under
// it gives the reader a name where a value was wanted, and it refuses the
// whole file, so a person who pinned one group and changed their mind lost the
// pane.
func TestUnpinningTheLastPinLeavesAReadableFile(t *testing.T) {
	// A view that ships with pins, emptied one at a time.
	path := writeBase(t, t.TempDir(), "w.base", `views:
  - type: table
    name: left
    columnSize:
      title: 300
    groups:
      - name: yours
        filter: assignee == "human"
      - name: here
        filter: status == "open"
    pinned:
      - yours
      - here
    groupBy:
      - property: status
`)
	for _, name := range []string{"yours", "here"} {
		if err := DropPinNamed(path, "left", name); err != nil {
			t.Fatal(err)
		}
	}
	base, err := LoadBase(path)
	if err != nil {
		t.Fatalf("the file will not read after the last pin went: %v", err)
	}
	if n := len(base.Views[0].Pinned); n != 0 {
		t.Fatalf("it reads back %d pins", n)
	}
	b, _ := os.ReadFile(path)
	if strings.Contains(string(b), "pinned:") {
		t.Fatalf("a bare key was left behind:\n%s", b)
	}
	// What was around it is untouched.
	for _, want := range []string{"title: 300", "property: status"} {
		if !strings.Contains(string(b), want) {
			t.Fatalf("it took %q with it:\n%s", want, b)
		}
	}

	// A VIEW THAT NEVER HAD A PINNED KEY. One pin and one unpin is the whole
	// journey, and it has to end where it started.
	plain := writeBase(t, t.TempDir(), "p.base", `views:
  - type: table
    name: right
    order:
      - title
`)
	was, _ := os.ReadFile(plain)
	if err := AddPin(plain, "right", "open", `status == "open"`); err != nil {
		t.Fatal(err)
	}
	if err := DropPinNamed(plain, "right", "open"); err != nil {
		t.Fatal(err)
	}
	after, err := LoadBase(plain)
	if err != nil {
		t.Fatalf("a view that never had pins will not read: %v", err)
	}
	if n := len(after.Views[0].Pinned); n != 0 {
		t.Fatalf("unpinning left %d pins", n)
	}
	// AN INVENTED GROUP LEAVES WITH ITS PIN. The pin was the only thing in the
	// file that named it, and declaring it would have made it permanent.
	if len(after.Views[0].Groups) != 0 {
		t.Fatalf("pinning an invented group declared it: %v", after.Views[0].Groups)
	}
	now, _ := os.ReadFile(plain)
	if strings.Contains(string(now), "pinned:") {
		t.Fatalf("a bare pinned key was left behind:\n%s", now)
	}
	if !strings.HasPrefix(string(now), strings.TrimRight(string(was), "\n")) {
		t.Fatalf("what was already there did not survive:\n%s", now)
	}
}
