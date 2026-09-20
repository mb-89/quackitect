// A row carries one boolean key a flag, and one column draws them as letters.
// Every letter stands upper in its fixed place, so nothing shifts. A letter
// wears a colour where its key reads true, and grey where it reads false. A
// flag over a value draws the value's first letter, so a state reads as one
// letter beside the marks.
// [[spec/design_output/tree-view#a-flag-draws-a-letter]]

package tree

import (
	"strings"

	"github.com/charmbracelet/lipgloss"

	"quackitect/tui/draw"
)

// The column whose letters the flags draw in. [[spec/design_output/tree-view#a-flag-draws-a-letter]]
const flagsKey = "flags"

// The letter a value flag draws where its value stands empty. [[spec/design_output/tree-view#a-flag-draws-a-letter]]
const noValue = "-"

// The tones a flag wears while lit, and the colour names the config holds for them. [[spec/design_output/tree-view#a-flag-draws-a-letter]]
const (
	ToneGood = "good"
	ToneBad  = "bad"
	toneOn   = "on"
	ToneOff  = "off"
)

// [[spec/design_output/tree-view#a-flag-draws-a-letter]]
func (t *Tree) Flagged(said []Flag) {
	t.flags = append([]Flag(nil), said...)
}

// [[spec/design_output/tree-view#a-flag-draws-a-letter]]
func (t Tree) Flags() []Flag { return append([]Flag(nil), t.flags...) }

// One flag as a row reads it: its letter, its key, the value behind it, whether it stands lit, and its tone. [[spec/design_output/tree-view#a-flag-draws-a-letter]]
type FlagState struct {
	Letter string
	Key    string
	Value  string
	On     bool
	Place  int
	Tone   string
}

// Every letter stands upper, lit or not, so a row reads the same shape as its neighbour. [[spec/design_output/tree-view#a-flag-draws-a-letter]]
func (t Tree) Letters(one Item) string {
	said := make([]string, 0, len(t.flags))
	for _, held := range t.States(one) {
		said = append(said, held.Letter)
	}
	return strings.Join(said, "")
}

// The flags of one row in the column's order, which the details draw one a line. [[spec/design_output/tree-view#a-flag-draws-a-letter]]
func (t Tree) States(one Item) []FlagState {
	out := make([]FlagState, 0, len(t.flags))
	for at, held := range t.flags {
		value, _ := one.Field(held.Key)
		value = strings.TrimSpace(value)
		if held.Value {
			letter := noValue
			if value != "" {
				letter = strings.ToUpper(value[:1])
			}
			// The value picks its tone off the map, and the flag's own tone stands where the map names none. [[spec/design_output/tree-view#a-flag-draws-a-letter]]
			tone := held.Tone
			if said, named := held.Tones[value]; named {
				tone = said
			}
			out = append(out, FlagState{Letter: letter, Key: held.Key, Value: value, On: value != "", Place: at, Tone: tone})
			continue
		}
		on := strings.EqualFold(value, "true")
		out = append(out, FlagState{Letter: strings.ToUpper(held.Letter), Key: held.Key, Value: value, On: on, Place: at, Tone: held.Tone})
	}
	return out
}

// A lit letter wears the colour of its tone, green for good and red for bad, and a letter off wears grey, the way the footer's funnel does. [[spec/design_output/tui#colours]]
func FlagStyle(held FlagState) lipgloss.Style {
	if !held.On {
		return colourOr(draw.FlagColour(ToneOff), draw.Dim)
	}
	// A tone names a colour of the flags map, good or bad or a route's own, and one the map lacks wears the plain colour. [[spec/design_output/tree-view#a-flag-draws-a-letter]]
	tone := held.Tone
	if draw.FlagColour(tone) == "" {
		tone = toneOn
	}
	return colourOr(draw.FlagColour(tone), draw.Open).Bold(true)
}

// A style off one colour, and the fallback where the config names none. [[spec/design_output/tui#colours]]
func colourOr(colour string, or lipgloss.Style) lipgloss.Style {
	if colour == "" {
		return or
	}
	return lipgloss.NewStyle().Foreground(lipgloss.Color(colour))
}
