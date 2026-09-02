package main

import (
	"os"
	"strings"
	"testing"
)

// A VIEW FILE IS THE OWNER'S. It carries comments explaining why a view is the
// way it is, and a change must not take them with it.
func TestWritingAViewKeepsWhatSomebodyWroteInIt(t *testing.T) {
	t.Parallel()
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
	t.Parallel()
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
	t.Parallel()
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

// CLICKING A HEADING WRITES THE FIRST SORT LEVEL AND LEAVES THE REST.
//
// It used to replace every level, so a heading and the list could not disagree
// about what is in force. With more than one level that is the wrong trade: a
// heading press would throw away an arrangement the person built, and the
// heading is honest about naming the first level rather than the whole list.
func TestClickingAHeadingWritesTheFirstSortLevel(t *testing.T) {
	t.Parallel()
	p := writeBase(t, t.TempDir(), "s.base",
		"views:\n  - name: left\n    order:\n      - title\n    sort:\n      - property: seq\n        direction: ASC\n      - property: title\n        direction: DESC\n")
	if err := SetSort(p, "left", "status", "DESC"); err != nil {
		t.Fatal(err)
	}
	b, err := LoadBase(p)
	if err != nil {
		t.Fatal(err)
	}
	if len(b.Views[0].Sort) != 2 {
		t.Fatalf("a heading press left %d sort levels", len(b.Views[0].Sort))
	}
	if b.Views[0].Sort[0].Property != "status" || !b.Views[0].Sort[0].Descending {
		t.Fatalf("the first level is %+v", b.Views[0].Sort[0])
	}
	if b.Views[0].Sort[1].Property != "title" {
		t.Fatalf("the second level was disturbed: %+v", b.Views[0].Sort[1])
	}
}

// A view nobody declared is named rather than written to by accident.
func TestWritingAViewThatIsNotThereRefuses(t *testing.T) {
	t.Parallel()
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
	t.Parallel()
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
	t.Parallel()
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

// A WRITER ADDRESSES THE SAME DECLARATION THE READER DOES.
//
// The declaration moved to the top of the file and only the reader was taught
// its new address. Every writer went on looking inside the view, so the pin
// control was dead on the shipped file: pinning a declared group was refused
// as undeclared, unpinning changed nothing, and pinning an invented one wrote
// a pinned block into the view that hid the file's own pins.
//
// So this is driven over the shipped shape, and it reads the file back through
// the loader after every write.
func TestAPinIsWrittenWhereTheReaderLooks(t *testing.T) {
	t.Parallel()
	shipped := func(t *testing.T) string {
		return writeBase(t, t.TempDir(), "work.base", `
groups:
  - name: yours
    filter: assignee == "human"
  - name: here
    filter: status == "open"
  - name: backlogged
    filter: status == "backlogged"
pinned:
  - yours
  - here

views:
  - type: table
    name: left
    order:
      - title
`)
	}
	pins := func(t *testing.T, path string) []string {
		t.Helper()
		b, err := LoadBase(path)
		if err != nil {
			t.Fatalf("the file no longer reads: %v", err)
		}
		var out []string
		for _, p := range b.Views[0].Pinned {
			out = append(out, p.Name)
		}
		return out
	}

	// A GROUP THE FILE DECLARES IS PINNED BY NAME, and the file's own pins stay.
	path := shipped(t)
	if err := AddPin(path, "left", "backlogged", ""); err != nil {
		t.Fatalf("pinning a declared group: %v", err)
	}
	if got := pins(t, path); strings.Join(got, ",") != "yours,here,backlogged" {
		t.Fatalf("after pinning backlogged the pins are %v", got)
	}

	// AND UNPINNING TAKES ONE AWAY. It answered ok and left the file byte for
	// byte as it was.
	if err := DropPinNamed(path, "left", "yours"); err != nil {
		t.Fatal(err)
	}
	if got := pins(t, path); strings.Join(got, ",") != "here,backlogged" {
		t.Fatalf("after unpinning yours the pins are %v", got)
	}

	// A GROUP THE DATA MADE CARRIES ITS FILTER, and pinning it does not throw
	// away the pins that were already there.
	path = shipped(t)
	if err := AddPin(path, "left", "later", `bucket == "later"`); err != nil {
		t.Fatal(err)
	}
	if got := pins(t, path); strings.Join(got, ",") != "yours,here,later" {
		t.Fatalf("after pinning an invented group the pins are %v", got)
	}
	if text, _ := os.ReadFile(path); strings.Count(string(text), "- name: later") != 1 {
		t.Fatalf("the invented group is not named exactly once:\n%s", text)
	}
}

// A VIEW THAT DECLARES ITS OWN IS STILL WRITTEN IN ITS OWN. The file is a
// default rather than a rule, so a pane that keeps its own arrangement goes on
// keeping it, and pinning there does not reach the other pane.
func TestAViewWithItsOwnPinsKeepsThemToItself(t *testing.T) {
	t.Parallel()
	path := writeBase(t, t.TempDir(), "work.base", `
groups:
  - name: yours
    filter: assignee == "human"
  - name: here
    filter: status == "open"
pinned:
  - yours

views:
  - type: table
    name: left
    order:
      - title
    pinned:
      - here
  - type: table
    name: right
    order:
      - title
`)
	if err := AddPin(path, "left", "yours", ""); err != nil {
		t.Fatal(err)
	}
	b, err := LoadBase(path)
	if err != nil {
		t.Fatal(err)
	}
	var left, right []string
	for _, p := range b.Views[0].Pinned {
		left = append(left, p.Name)
	}
	for _, p := range b.Views[1].Pinned {
		right = append(right, p.Name)
	}
	if strings.Join(left, ",") != "here,yours" {
		t.Fatalf("the view's own pins are %v", left)
	}
	if strings.Join(right, ",") != "yours" {
		t.Fatalf("the other pane changed: %v", right)
	}
}

// SORT AND GROUP TAKE MORE THAN ONE LEVEL.
//
// The engine replaced every level with one, on purpose, so a column heading and
// the level list could not disagree about what is in force. That was right for
// one level and wrong for many.
func TestALevelIsAddedRewrittenAndDropped(t *testing.T) {
	t.Parallel()
	path := writeBase(t, t.TempDir(), "w.base", `
views:
  - type: table
    name: left
    order:
      - title
    sort:
      - property: assignee
        direction: DESC
`)
	levels := func() []Sort {
		t.Helper()
		b, err := LoadBase(path)
		if err != nil {
			t.Fatalf("the file no longer reads: %v", err)
		}
		return b.Views[0].Sort
	}
	says := func() string {
		t.Helper()
		var out []string
		for _, s := range levels() {
			out = append(out, s.Property+" "+dirOf(s.Descending))
		}
		return strings.Join(out, ", ")
	}

	// A SECOND LEVEL IS ADDED AND THE FIRST STAYS.
	if err := SetLevel(path, "left", "sort", 1, "title", "ASC"); err != nil {
		t.Fatal(err)
	}
	if got := says(); got != "assignee DESC, title ASC" {
		t.Fatalf("after adding a second level: %s", got)
	}

	// A LEVEL IS REWRITTEN BY POSITION AND ITS NEIGHBOURS DO NOT MOVE.
	if err := SetLevel(path, "left", "sort", 0, "status", "ASC"); err != nil {
		t.Fatal(err)
	}
	if got := says(); got != "status ASC, title ASC" {
		t.Fatalf("after rewriting the first level: %s", got)
	}

	// AND ONE IS DROPPED BY POSITION.
	if err := DropLevel(path, "left", "sort", 0); err != nil {
		t.Fatal(err)
	}
	if got := says(); got != "title ASC" {
		t.Fatalf("after dropping the first level: %s", got)
	}

	// DROPPING THE LAST ONE LEAVES A FILE THAT READS.
	if err := DropLevel(path, "left", "sort", 0); err != nil {
		t.Fatal(err)
	}
	if got := says(); got != "" {
		t.Fatalf("after dropping the last level: %s", got)
	}
}

// A GROUPING KEEPS WHAT A DROP INTO IT WROTE. sets says which field a row
// dropped into a heading is filed under, and it is a fact about the property
// rather than about the direction or the position.
func TestAGroupingKeepsWhatADropWrote(t *testing.T) {
	t.Parallel()
	path := writeBase(t, t.TempDir(), "w.base", `
views:
  - type: table
    name: left
    order:
      - title
    groupBy:
      - property: if(bucket, bucket, status)
        sets: bucket
        direction: ASC
`)
	if err := SetLevel(path, "left", "groupBy", 1, "assignee", "DESC"); err != nil {
		t.Fatal(err)
	}
	b, err := LoadBase(path)
	if err != nil {
		t.Fatal(err)
	}
	if n := len(b.Views[0].Group); n != 2 {
		t.Fatalf("the view has %d groupings", n)
	}
	text, _ := os.ReadFile(path)
	if !strings.Contains(string(text), "sets: bucket") {
		t.Fatalf("adding a second grouping lost what a drop writes:\n%s", text)
	}
}

// SETS DIES WITH THE PROPERTY IT WAS ABOUT.
//
// sets says which field a row dropped onto a heading is filed under. It is a
// fact about the property, so it does not survive the property changing. It
// did: one press of Group by assignee left sets: bucket under it, and a drop
// onto a heading named after a person made a bucket named after that person
// while the row stayed where it was, because its assignee never changed.
//
// THIS USES THE IN-PLACE BRANCH, which is where the defect is. A check that
// appends never reaches it.
func TestSetsDiesWithItsProperty(t *testing.T) {
	t.Parallel()
	write := func() string {
		return writeBase(t, t.TempDir(), "w.base", `
views:
  - type: table
    name: left
    order:
      - title
    groupBy:
      - property: if(bucket, bucket, status)
        sets: bucket
        direction: ASC
`)
	}

	// A DIFFERENT PROPERTY TAKES ITS OWN FACTS, and there are none yet.
	path := write()
	if err := SetLevel(path, "left", "groupBy", 0, "assignee", "ASC"); err != nil {
		t.Fatal(err)
	}
	if text, _ := os.ReadFile(path); strings.Contains(string(text), "sets:") {
		t.Fatalf("grouping by a different property kept the old one's sets:\n%s", text)
	}

	// AND WHERE A PERSON WOULD SEE IT: the headings say nothing can be dropped
	// on them, which is the honest state for a grouping nobody has said how to
	// file into.
	b, err := LoadBase(path)
	if err != nil {
		t.Fatal(err)
	}
	tab, err := Render(b, b.Views[0], []Row{row("id", "1", "assignee", "main", "title", "a")})
	if err != nil {
		t.Fatal(err)
	}
	if len(tab.Groups) == 0 {
		t.Fatal("nothing was grouped, so this guards nothing")
	}
	for _, g := range tab.Groups {
		if g.Sets != "" {
			t.Fatalf("a heading grouped by assignee still files into %q", g.Sets)
		}
	}

	// THE SAME PROPERTY KEEPS ITS OWN FACT. Turning a heading round is not
	// changing what it groups by.
	path = write()
	if err := SetLevel(path, "left", "groupBy", 0, "if(bucket, bucket, status)", "DESC"); err != nil {
		t.Fatal(err)
	}
	text, _ := os.ReadFile(path)
	if !strings.Contains(string(text), "sets: bucket") {
		t.Fatalf("turning a heading round lost what a drop writes:\n%s", text)
	}
	if !strings.Contains(string(text), "direction: DESC") {
		t.Fatalf("the direction was not written:\n%s", text)
	}
}
