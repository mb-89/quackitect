// A row carries one boolean key a flag, and one column draws them as letters.
// A letter stands lit where its key reads true, and dim where it reads false.
// A flag over a value draws the value's first letter, so a state reads as one
// letter beside the marks. The letters hold fixed places, so nothing shifts.
// [[spec/design_output/tree-view#a-flag-draws-a-letter]]

package main

import (
	"strings"

	"github.com/charmbracelet/lipgloss"
)

// The column whose letters the flags draw in. [[spec/design_output/tree-view#a-flag-draws-a-letter]]
const flagsKey = "flags"

// The letter a value flag draws where its value stands empty. [[spec/design_output/tree-view#a-flag-draws-a-letter]]
const noValue = "-"

// [[spec/design_output/tree-view#a-flag-draws-a-letter]]
func (t *Tree) Flagged(said []Flag) {
	t.flags = append([]Flag(nil), said...)
}

// [[spec/design_output/tree-view#a-flag-draws-a-letter]]
func (t Tree) Flags() []Flag { return append([]Flag(nil), t.flags...) }

// One flag as a row reads it: its letter, its key, the value behind it, and whether it stands lit. [[spec/design_output/tree-view#a-flag-draws-a-letter]]
type flagState struct {
	Letter string
	Key    string
	Value  string
	On     bool
	Place  int
}

// A lit letter stands upper, and a dim one lower, so every place stays filled. [[spec/design_output/tree-view#a-flag-draws-a-letter]]
func (t Tree) Letters(one Item) string {
	said := make([]string, 0, len(t.flags))
	for _, held := range t.States(one) {
		if held.On {
			said = append(said, strings.ToUpper(held.Letter))
			continue
		}
		said = append(said, strings.ToLower(held.Letter))
	}
	return strings.Join(said, "")
}

// The flags of one row in the column's order, which the details draw one a line. [[spec/design_output/tree-view#a-flag-draws-a-letter]]
func (t Tree) States(one Item) []flagState {
	out := make([]flagState, 0, len(t.flags))
	for at, held := range t.flags {
		value, _ := one.Field(held.Key)
		value = strings.TrimSpace(value)
		if held.Value {
			letter := noValue
			if value != "" {
				letter = value[:1]
			}
			out = append(out, flagState{Letter: letter, Key: held.Key, Value: value, On: value != "", Place: at})
			continue
		}
		on := strings.EqualFold(value, "true")
		out = append(out, flagState{Letter: held.Letter, Key: held.Key, Value: value, On: on, Place: at})
	}
	return out
}

// Each flag wears a colour of its own while lit, off the spare colours in the flag's place, and dim while off. [[spec/design_output/tui#colours]]
func flagStyle(held flagState) lipgloss.Style {
	if !held.On || len(palette.spare) == 0 {
		return dimStyle
	}
	return lipgloss.NewStyle().Foreground(lipgloss.Color(palette.spare[held.Place%len(palette.spare)])).Bold(true)
}
