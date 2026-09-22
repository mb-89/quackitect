// The filter pane, which every tab shares: the line to type into, the presets
// the open tab offers as rows under it, and the language under those. A
// preset's key or a press on its row writes its filter into the line, and
// the open tab narrows at once.
// [[spec/design_output/tui#the-filter-pane-takes-letters]]

package frame

import (
	"errors"
	"strings"

	"quackitect/tui/draw"
)

// The key a preset names presses it, in any tab, under any pane. [[spec/design_output/tui#one-key-filters-the-line]]
func (m *Model) PressKey(name string) bool {
	for _, one := range m.Tab().Presets(m) {
		if one.Key == name {
			m.PressPreset(one)
			return true
		}
	}
	return false
}

// A press writes the preset's filter into the line, and the same press again clears it. The sort it carries takes hold. [[spec/design_output/tree-view#a-preset-carries-its-sort]]
func (m *Model) PressPreset(one Preset) {
	said := one.Filter
	if m.Input.Value() == said {
		said = ""
	}
	m.Input.SetValue(said)
	if len(one.Sorts) > 0 {
		m.Tab().Sorted(m, one)
	}
	m.Narrow(said)
	m.LoadPane()
}

// The pane's first lines: the line to type into, and the reason under it where the line parses not. [[spec/design_output/tui#the-filter-pane-takes-letters]]
func (m Model) FilterHead() []Part {
	parts := []Part{{Text: m.Input.View(), Drawn: true}}
	if m.FilterBad != "" {
		parts = append(parts, Part{Style: draw.LevelStyle("error"), Text: m.FilterBad})
	}
	return parts
}

// One row a preset: its key and its name, lit where the line holds its filter. The filter itself stays off the row, because it runs long. [[spec/design_output/tui#the-filter-pane-takes-letters]]
func (m Model) PresetParts() []Part {
	said := m.Tab().Presets(&m)
	if len(said) == 0 {
		return nil
	}
	wide := 0
	for _, one := range said {
		wide = max(wide, len([]rune(KeyShown(one.Key))))
	}
	out := []Part{{}}
	for _, one := range said {
		row := draw.Pad(KeyShown(one.Key), wide) + "  " + one.Name
		if m.Presses(one) {
			out = append(out, Part{Text: draw.Open.Render(row), Drawn: true})
			continue
		}
		out = append(out, Part{Text: draw.Dim.Render(row), Drawn: true})
	}
	return out
}

// Whether a preset stands pressed: the line holds its filter, and a preset filtering nothing holds through its sort. [[spec/design_output/tree-view#a-preset-carries-its-sort]]
func (m Model) Presses(one Preset) bool {
	if m.Input.Value() != one.Filter {
		return false
	}
	if one.Filter != "" {
		return true
	}
	return len(one.Sorts) > 0 && m.Tab().Pressed(&m, one)
}

// The preset the open tab holds pressed, and nil where the line is a person's own. [[spec/design_output/tree-view#a-preset-carries-its-sort]]
func (m Model) Pressed() *Preset {
	for _, one := range m.Tab().Presets(&m) {
		if m.Presses(one) {
			return &one
		}
	}
	return nil
}

// The preset standing on a row of the pane, counted from the pane's top, so a press on it presses the preset. [[spec/design_output/tui#the-filter-pane-takes-letters]]
func (m Model) PresetAt(row int) *Preset {
	said := m.Tab().Presets(&m)
	if len(said) == 0 {
		return nil
	}
	// The head's lines come first, then the blank line the presets open with. [[spec/design_output/tui#the-filter-pane-takes-letters]]
	first := strings.Count(RenderParts(m.FilterHead(), m.Box.Width), "\n") + 2
	at := row + m.Box.YOffset - first
	if at < 0 || at >= len(said) {
		return nil
	}
	return &said[at]
}

// The line narrows the open tab and no other, and each tab keeps its own. [[spec/design_output/tui#the-filter-pane-takes-letters]]
func (m *Model) Narrow(said string) {
	if m.Open >= 0 && m.Open < len(m.Sources) {
		m.Sources[m.Open] = said
	}
	m.FilterBad = filterWhy(m.Tab().Narrow(m, said))
}

// What a line that parses not says under itself. [[spec/design_output/tui#the-filter-language]]
func filterWhy(err error) string {
	switch {
	case err == nil:
		return ""
	case errors.Is(err, draw.ErrIncomplete):
		return "still typing"
	default:
		return err.Error()
	}
}
