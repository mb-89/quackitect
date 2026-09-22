// The footer, and its status marks. Each mark stands at a fixed place, so
// nothing shifts as one comes and goes, and a mark stands dark where its thing
// stands off.
// [[spec/design_output/tui#the-footer-carries-status]]

package frame

import (
	"strings"

	"github.com/charmbracelet/x/ansi"

	"quackitect/tui/draw"
)

// [[spec/design_output/tui#the-footer-carries-status]]
const (
	FloorWide = 4
	sortWide  = 7
)

// The filter's mark. A letter says filter where a triangle said arrow. [[spec/design_output/tui#the-footer-carries-status]]
const FilterMark = "F"

// [[spec/design_output/tui#the-footer-carries-status]]
func (m Model) RenderFooter() string {
	rule := draw.Rule.Render(strings.Repeat("─", max(1, m.W)))
	marks := m.RenderMarks()
	gap := m.W - ansi.StringWidth(marks)
	if gap < 0 {
		return rule + "\n" + draw.Cut(marks, m.W)
	}
	return rule + "\n" + strings.Repeat(" ", gap) + marks
}

// The order and the floor come off the first tab, which is the log, whatever tab stands open. [[spec/design_output/tui#the-footer-carries-status]]
func (m Model) RenderMarks() string {
	funnel := draw.Dim.Render(FilterMark)
	if m.Tab().Narrowed(&m) {
		funnel = draw.LevelStyle("error").Render(FilterMark)
	}
	said, floor := m.Tabs[0].Marks(&m)
	order := draw.Dim.Render(draw.Pad(said, sortWide))
	level := draw.LevelStyle(floor).Render(draw.Pad(strings.ToUpper(floor), FloorWide))
	return order + " " + funnel + " " + level
}
