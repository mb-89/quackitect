// A preset is a filter somebody wrote down, and it carries a sort beside it. A
// press writes the filter into the line every tab types into, so it reads and
// clears like one a person types, and the sort takes hold with it. A slice is
// the same thing over the values one column carries, so it costs no line.
// [[spec/design_output/tree-view#a-preset-carries-its-sort]]

package tree

import (
	"sort"
	"strings"

	"quackitect/tui/draw"
)

// [[spec/design_output/tree-view#a-preset-carries-its-sort]]
type Preset struct {
	Name    string
	Filters string
	Sorts   []Sort
	Pressed bool
}

// The presets the file names, and the sort of the one pressed there takes hold at the start. [[spec/design_output/tree-view#a-preset-carries-its-sort]]
func (t *Tree) Presets(said []Preset) {
	t.presets = append([]Preset(nil), said...)
	for _, one := range t.presets {
		if one.Pressed && len(one.Sorts) > 0 {
			t.sorts = append([]Sort(nil), one.Sorts...)
		}
	}
	t.rebuild()
}

// [[spec/design_output/tree-view#a-preset-carries-its-sort]]
func (t Tree) PresetList() []Preset { return append([]Preset(nil), t.presets...) }

// The filter the file presses at the start, which the line opens with. [[spec/design_output/tree-view#a-preset-carries-its-sort]]
func (t Tree) Opening() string {
	said := make([]string, 0, len(t.presets))
	for _, one := range t.presets {
		if one.Pressed && strings.TrimSpace(one.Filters) != "" {
			said = append(said, one.Filters)
		}
	}
	return strings.Join(said, " and ")
}

// The line a person types is the whole filter, and a preset is what wrote it. [[spec/design_output/tree-view#a-preset-carries-its-sort]]
func (t *Tree) Filtering(said string) error {
	t.typed = said
	if strings.TrimSpace(said) == "" {
		t.Narrow(draw.Filter{})
		return nil
	}
	held, err := draw.ParseFilter(said)
	if err != nil {
		return err
	}
	t.Narrow(held)
	return nil
}

// The values one column carries, each a preset of its own, so a slice costs no line. [[spec/design_output/tree-view#a-preset-carries-its-sort]]
func (t Tree) Slices(key string) []Preset {
	held := map[string]bool{}
	t.values(t.Items, key, held)
	names := make([]string, 0, len(held))
	for one := range held {
		names = append(names, one)
	}
	sort.Strings(names)
	out := make([]Preset, 0, len(names))
	for _, one := range names {
		out = append(out, Preset{Name: one, Filters: key + ": " + one})
	}
	return out
}

// [[spec/design_output/tree-view#a-preset-carries-its-sort]]
func (t Tree) values(items []Item, key string, held map[string]bool) {
	for _, one := range items {
		if said, _ := one.Field(key); strings.TrimSpace(said) != "" {
			held[said] = true
		}
		t.values(one.Kids, key, held)
	}
}
