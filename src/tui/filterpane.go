// The filter pane, which every tab shares: the line to type into, the presets
// the open tab offers as rows under it, and the language under those. A
// preset's key or a press on its row writes its filter into the line, and
// the open tab narrows at once.
// [[spec/design_output/tui#the-filter-pane-takes-letters]]

package main

import (
	"errors"
	"strings"
)

// The key a preset names presses it, in any tab, under any pane. [[spec/design_output/tui#one-key-filters-the-line]]
func (m *model) pressKey(name string) bool {
	for _, one := range m.tabs[m.open].Presets(m) {
		if one.Key == name {
			m.pressPreset(one)
			return true
		}
	}
	return false
}

// A press writes the preset's filter into the line, and the same press again clears it. The sort it carries takes hold. [[spec/design_output/tree-view#a-preset-carries-its-sort]]
func (m *model) pressPreset(one preset) {
	said := one.Filter
	if m.input.Value() == said {
		said = ""
	}
	m.input.SetValue(said)
	if len(one.Sorts) > 0 && m.onWork() {
		m.work.Sorted(one.Sorts)
	}
	m.narrow(said)
	m.loadPane()
}

// The pane's first lines: the line to type into, and the reason under it where the line parses not. [[spec/design_output/tui#the-filter-pane-takes-letters]]
func (m model) filterHead() []part {
	parts := []part{{text: m.input.View(), drawn: true}}
	if m.filterBad != "" {
		parts = append(parts, part{style: levelStyle("error"), text: m.filterBad})
	}
	return parts
}

// One row a preset: its key and its name, lit where the line holds its filter. The filter itself stays off the row, because it runs long. [[spec/design_output/tui#the-filter-pane-takes-letters]]
func (m model) presetParts() []part {
	said := m.tabs[m.open].Presets(&m)
	if len(said) == 0 {
		return nil
	}
	wide := 0
	for _, one := range said {
		wide = max(wide, len([]rune(keyShown(one.Key))))
	}
	out := []part{{}}
	for _, one := range said {
		row := pad(keyShown(one.Key), wide) + "  " + one.Name
		if m.input.Value() == one.Filter {
			out = append(out, part{text: openStyle.Render(row), drawn: true})
			continue
		}
		out = append(out, part{text: dimStyle.Render(row), drawn: true})
	}
	return out
}

// The preset standing on a row of the pane, counted from the pane's top, so a press on it presses the preset. [[spec/design_output/tui#the-filter-pane-takes-letters]]
func (m model) presetAt(row int) *preset {
	said := m.tabs[m.open].Presets(&m)
	if len(said) == 0 {
		return nil
	}
	// The head's lines come first, then the blank line the presets open with. [[spec/design_output/tui#the-filter-pane-takes-letters]]
	first := strings.Count(renderParts(m.filterHead(), m.box.Width), "\n") + 2
	at := row + m.box.YOffset - first
	if at < 0 || at >= len(said) {
		return nil
	}
	return &said[at]
}

// The line narrows the open tab and no other, and each tab keeps its own. [[spec/design_output/tui#the-filter-pane-takes-letters]]
func (m *model) narrow(said string) {
	if m.open >= 0 && m.open < len(m.sources) {
		m.sources[m.open] = said
	}
	if m.onWork() {
		err := m.work.Filtering(said)
		m.filterBad = filterWhy(err)
		return
	}
	f, err := ParseFilter(said)
	m.filterBad = filterWhy(err)
	if err == nil {
		m.filter = f
		m.rebuild()
	}
}

// What a line that parses not says under itself. [[spec/design_output/tui#the-filter-language]]
func filterWhy(err error) string {
	switch {
	case err == nil:
		return ""
	case errors.Is(err, ErrIncomplete):
		return "still typing"
	default:
		return err.Error()
	}
}
