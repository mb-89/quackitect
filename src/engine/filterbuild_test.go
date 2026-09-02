package main

import (
	"os"
	"testing"
)

// A FILTER GOES BOTH WAYS.
//
// The builder wrote one flat statement and the reader reads a structure, so
// anything past a single condition was written correctly and read back wrong. A
// person who added a second group saw their table empty on the next touch of
// the popover, because the page handed the misread filter back to the engine.
func TestAFilterReadsBackAsWhatWasBuilt(t *testing.T) {
	for name, groups := range map[string][]FilterGroup{
		"one condition": {
			{Rows: []FilterRow{{Property: "status", Operator: "is", Value: "open"}}},
		},
		"two groups, anded": {
			{Rows: []FilterRow{{Property: "status", Operator: "is", Value: "open"}}},
			{Rows: []FilterRow{{Property: "assignee", Operator: "is", Value: "main"}}},
		},
		"one group of two, ored": {
			{Rows: []FilterRow{
				{Property: "status", Operator: "is", Value: "open"},
				{Property: "status", Operator: "is", Value: "in_work"},
			}},
		},
		"both at once": {
			{Rows: []FilterRow{
				{Property: "status", Operator: "is", Value: "open"},
				{Property: "status", Operator: "is", Value: "in_work"},
			}},
			{Rows: []FilterRow{{Property: "assignee", Operator: "is", Value: "main"}}},
		},
	} {
		t.Run(name, func(t *testing.T) {
			path := writeBase(t, t.TempDir(), "w.base",
				"views:\n  - type: table\n    name: left\n    order:\n      - title\n")
			if err := SetFilterGroups(path, "left", groups); err != nil {
				t.Fatal(err)
			}
			b, err := LoadBase(path)
			if err != nil {
				text, _ := os.ReadFile(path)
				t.Fatalf("the file no longer reads: %v\n%s", err, text)
			}
			back := FilterGroups(b.Views[0].RawFilter)
			if !sameGroups(back, groups) {
				text, _ := os.ReadFile(path)
				t.Fatalf("built %v and read back %v\n%s", groups, back, text)
			}
		})
	}
}

func sameGroups(a, b []FilterGroup) bool {
	if len(a) != len(b) {
		return false
	}
	for i := range a {
		if a[i].Raw != b[i].Raw || len(a[i].Rows) != len(b[i].Rows) {
			return false
		}
		for j := range a[i].Rows {
			if a[i].Rows[j] != b[i].Rows[j] {
				return false
			}
		}
	}
	return true
}

// A VALUE IS ONE LITERAL, AND A ROW THE READER CANNOT READ IS SAID TO BE RAW.
//
// reCompare's value was written as anything up to the end of the line, so
// `status == "open" && assignee == "main"` read back as ONE comparison whose
// value was `open" && assignee == "main`. The page then redrew its builder from
// that and one touch wrote the value back quoted and escaped:
//
//   - status == "open\" && assignee == \"main"
//
// and the pane answered zero rows. The builder no longer emits that shape, so
// the way in is a person editing the file by hand, which is the population the
// raw escape hatch exists for.
//
// ONE UNREADABLE ROW MAKES THE WHOLE GROUP RAW. That is already the rule here.
// What was missing is the reader saying it cannot read one.
func TestAValueThatIsNotOneLiteralIsNotReadAsAComparison(t *testing.T) {
	cannot := []string{
		`status == "open" && assignee == "main"`,
		`status == "open" || status == "in_work"`,
		`status == "open" && assignee == "main" && scope == "single-step"`,
		`status == "open with a quote in it " and more"`,
	}
	for _, src := range cannot {
		if row, ok := FromExpression(src); ok {
			t.Errorf("%s read back as one comparison whose value is %q", src, row.Value)
		}
	}
	// AND THE ONES THAT ARE ONE LITERAL STILL READ, so the reader is narrowed
	// rather than broken.
	can := []struct{ src, prop, value string }{
		{`status == "open"`, "status", "open"},
		{`assignee != "main"`, "assignee", "main"},
		{`seq >= 12`, "seq", "12"},
		{`title == "one with spaces in it"`, "title", "one with spaces in it"},
		{`status == "a value with an escaped \" in it"`, "status", `a value with an escaped " in it`},
	}
	for _, one := range can {
		row, ok := FromExpression(one.src)
		if !ok {
			t.Errorf("%s cannot be read, and it is one literal", one.src)
			continue
		}
		if row.Property != one.prop || row.Value != one.value {
			t.Errorf("%s read back as %s / %q", one.src, row.Property, row.Value)
		}
	}
}
