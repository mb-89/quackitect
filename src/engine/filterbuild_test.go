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
