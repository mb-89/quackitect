// The footer, and its status marks. Each mark stands at a fixed place, so
// nothing shifts as one comes and goes, and a mark stands dark where its thing
// stands off.
// [[spec/design_output/tui#the-footer-carries-status]]

package main

import (
	"strings"

	"github.com/charmbracelet/x/ansi"
)

// [[spec/design_output/tui#the-footer-carries-status]]
const floorWide = 4

// The filter's mark. A letter says filter where a triangle said arrow. [[spec/design_output/tui#the-footer-carries-status]]
const filterMark = "F"

// [[spec/design_output/tui#the-footer-carries-status]]
func (m model) renderFooter() string {
	rule := ruleStyle.Render(strings.Repeat("─", max(1, m.w)))
	marks := m.renderMarks()
	gap := m.w - ansi.StringWidth(marks)
	if gap < 0 {
		return rule + "\n" + cut(marks, m.w)
	}
	return rule + "\n" + strings.Repeat(" ", gap) + marks
}

// [[spec/design_output/tui#the-footer-carries-status]]
func (m model) renderMarks() string {
	funnel := dimStyle.Render(filterMark)
	if m.tabs[m.open].Narrowed(&m) {
		funnel = levelStyle("error").Render(filterMark)
	}
	order := dimStyle.Render(pad(m.sortSays(), sortWide))
	floor := levelStyle(m.floor).Render(pad(strings.ToUpper(m.floor), floorWide))
	return order + " " + funnel + " " + floor
}
