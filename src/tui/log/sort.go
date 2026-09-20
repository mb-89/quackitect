// The log's columns, and the order a press on one puts the rows in. One table
// names each column once: the names row draws from it, a press measures against
// it, and the sort reads the key out of it. A press on the column already
// sorting flips the direction, and a fourth press puts the log back in the order
// it arrived.
// [[spec/design_output/tui#the-columns-stand-still]]

package log

import (
	"quackitect/tui/draw"
	"quackitect/tui/frame"

	"fmt"
	"sort"
	"strings"
)

const SortNone = -1

// A column of the log: what it is called, how wide it stands, and what it sorts on. [[spec/design_output/tui#the-columns-stand-still]]
type column struct {
	name string
	wide int
	key  func(m *Tab, r Record) string
}

// The last column takes what room is left, so its width reads 0. [[spec/design_output/tui#the-columns-stand-still]]
var logColumns = []column{
	{"time", StampWide, func(m *Tab, r Record) string { return r.At.UTC().Format("20060102150405.000000000") }},
	{"level", LevelWide, func(_ *Tab, r Record) string { return fmt.Sprintf("%02d", Rank(r.Level)) }},
	{"kind", KindWide, func(_ *Tab, r Record) string { return r.Label() }},
	{"said", 0, func(_ *Tab, r Record) string { return strings.ToLower(draw.OneLine(r.Said)) }},
}

// The column the screen column x stands on, and SortNone where it stands past the last name. [[spec/design_output/tui#the-columns-stand-still]]
func ColumnAt(x, w int) int {
	at := draw.GutterWide
	for i, one := range logColumns {
		wide := one.wide
		if wide == 0 {
			wide = max(1, w-at)
		}
		if x >= at && x < at+wide {
			return i
		}
		at += wide + 1
	}
	return SortNone
}

// A press on a column sorts by it, presses again to flip, and a third puts the arrival order back. [[spec/design_output/tui#the-columns-stand-still]]
func (m *Tab) SortOn(f *frame.Model, at int) {
	switch {
	case at == SortNone:
		return
	case m.SortAt != at:
		m.SortAt, m.SortDown = at, false
	case !m.SortDown:
		m.SortDown = true
	default:
		m.SortAt, m.SortDown = SortNone, false
	}
	m.Rebuild(f.Rows())
	f.LoadPane()
}

// The view in the order the sorted column names, and in arrival order where none sorts. [[spec/design_output/tui#the-columns-stand-still]]
func (m *Tab) applySort() {
	if m.SortAt < 0 || m.SortAt >= len(logColumns) {
		return
	}
	key := logColumns[m.SortAt].key
	sort.SliceStable(m.View, func(a, b int) bool {
		one, two := key(m, m.All[m.View[a]]), key(m, m.All[m.View[b]])
		if m.SortDown {
			return one > two
		}
		return one < two
	})
}

// What the footer says about the order, which stands empty where none sorts. [[spec/design_output/tui#the-footer-carries-status]]
func (m Tab) SortSays() string {
	if m.SortAt < 0 || m.SortAt >= len(logColumns) {
		return ""
	}
	arrow := "▲"
	if m.SortDown {
		arrow = "▼"
	}
	return arrow + " " + logColumns[m.SortAt].name
}
