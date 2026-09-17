// The footer, and its status marks. Each mark stands at a fixed place, so
// nothing shifts as one comes and goes, and a mark stands dark where its thing
// stands off.
// [[spec/design_output/viewer#the-footer-carries-status]]

package main

import (
	"strings"

	"github.com/charmbracelet/x/ansi"
)

// [[spec/design_output/viewer#the-footer-carries-status]]
const floorWide = 4

// [[spec/design_output/viewer#the-footer-carries-status]]
func (m model) renderFooter() string {
	rule := ruleStyle.Render(strings.Repeat("─", max(1, m.w)))
	marks := m.renderMarks()
	gap := m.w - ansi.StringWidth(marks)
	if gap < 0 {
		return rule + "\n" + cut(marks, m.w)
	}
	return rule + "\n" + strings.Repeat(" ", gap) + marks
}

// [[spec/design_output/viewer#the-footer-carries-status]]
func (m model) renderMarks() string {
	funnel := dimStyle.Render("▼")
	if m.tabs[m.open].Narrowed(&m) {
		funnel = levelStyle("error").Render("▼")
	}
	floor := levelStyle(m.floor).Render(pad(strings.ToUpper(m.floor), floorWide))
	return funnel + " " + floor
}
