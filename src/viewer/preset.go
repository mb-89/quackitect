// A preset is a filter somebody wrote down, and it carries a sort beside it. A
// press puts both in, and a press again takes the filter off. The person then
// changes either one, and the preset holds nothing after the press. A slice is
// the same thing over the values one column carries, so it costs no line.
// [[spec/design_output/tree-view#a-preset-carries-its-sort]]

package main

import (
	"sort"
	"strings"
)

// [[spec/design_output/tree-view#a-preset-carries-its-sort]]
type Preset struct {
	Name    string
	Filters string
	Sorts   []Sort
	Pressed bool
}

// [[spec/design_output/tree-view#a-preset-carries-its-sort]]
func (t *Tree) Presets(said []Preset) {
	t.presets = append([]Preset(nil), said...)
	for _, one := range t.presets {
		if one.Pressed && len(one.Sorts) > 0 {
			t.sorts = append([]Sort(nil), one.Sorts...)
		}
	}
	t.applyPresets()
}

// [[spec/design_output/tree-view#a-preset-carries-its-sort]]
func (t Tree) PresetList() []Preset { return append([]Preset(nil), t.presets...) }

// A press adds a preset to what already stands, and a press again takes it off. [[spec/design_output/tree-view#a-preset-carries-its-sort]]
func (t *Tree) Press(name string) {
	for at, one := range t.presets {
		if one.Name != name {
			continue
		}
		t.presets[at].Pressed = !one.Pressed
		if t.presets[at].Pressed && len(one.Sorts) > 0 {
			t.sorts = append([]Sort(nil), one.Sorts...)
		}
		t.applyPresets()
		return
	}
}

// What a person types stands beside the presses, and narrows with them. [[spec/design_output/tree-view#a-preset-carries-its-sort]]
func (t *Tree) Filtering(said string) {
	t.typed = said
	t.applyPresets()
}

// The filter the presses and the typed line add up to. [[spec/design_output/tree-view#a-preset-carries-its-sort]]
func (t *Tree) applyPresets() {
	said := make([]string, 0, len(t.presets)+1)
	for _, one := range t.presets {
		if one.Pressed && strings.TrimSpace(one.Filters) != "" {
			said = append(said, "("+one.Filters+")")
		}
	}
	if strings.TrimSpace(t.typed) != "" {
		said = append(said, "("+t.typed+")")
	}
	if len(said) == 0 {
		t.Narrow(Filter{})
		return
	}
	held, err := ParseFilter(strings.Join(said, " and "))
	if err != nil {
		t.rebuild()
		return
	}
	t.Narrow(held)
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
