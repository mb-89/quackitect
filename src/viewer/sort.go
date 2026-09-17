// The log's columns, and the order a press on one puts the rows in. One table
// names each column once: the names row draws from it, a press measures against
// it, and the sort reads the key out of it. A press on the column already
// sorting flips the direction, and a fourth press puts the log back in the order
// it arrived.
// [[spec/design_output/viewer#the-columns-stand-still]]

package main

import (
	"fmt"
	"sort"
	"strings"
)

// The gutter each row opens with, and the room the footer's sort mark takes. [[spec/design_output/viewer#the-columns-stand-still]]
const (
	gutterWide = 2
	sortWide   = 7
	sortNone   = -1
)

// A column of the log: what it is called, how wide it stands, and what it sorts on. [[spec/design_output/viewer#the-columns-stand-still]]
type column struct {
	name string
	wide int
	key  func(m *model, r Record) string
}

// The last column takes what room is left, so its width reads 0. [[spec/design_output/viewer#the-columns-stand-still]]
var logColumns = []column{
	{"time", stampWide, func(m *model, r Record) string { return r.At.UTC().Format("20060102150405.000000000") }},
	{"level", levelWide, func(_ *model, r Record) string { return fmt.Sprintf("%02d", Rank(r.Level)) }},
	{"kind", kindWide, func(_ *model, r Record) string { return r.Label() }},
	{"said", 0, func(_ *model, r Record) string { return strings.ToLower(oneLine(r.Said)) }},
}

// The column the screen column x stands on, and sortNone where it stands past the last name. [[spec/design_output/viewer#the-columns-stand-still]]
func columnAt(x, w int) int {
	at := gutterWide
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
	return sortNone
}

// A press on a column sorts by it, presses again to flip, and a third puts the arrival order back. [[spec/design_output/viewer#the-columns-stand-still]]
func (m *model) sortOn(at int) {
	switch {
	case at == sortNone:
		return
	case m.sortAt != at:
		m.sortAt, m.sortDown = at, false
	case !m.sortDown:
		m.sortDown = true
	default:
		m.sortAt, m.sortDown = sortNone, false
	}
	m.rebuild()
	m.loadPane()
}

// The view in the order the sorted column names, and in arrival order where none sorts. [[spec/design_output/viewer#the-columns-stand-still]]
func (m *model) applySort() {
	if m.sortAt < 0 || m.sortAt >= len(logColumns) {
		return
	}
	key := logColumns[m.sortAt].key
	sort.SliceStable(m.view, func(a, b int) bool {
		one, two := key(m, m.all[m.view[a]]), key(m, m.all[m.view[b]])
		if m.sortDown {
			return one > two
		}
		return one < two
	})
}

// What the footer says about the order, which stands empty where none sorts. [[spec/design_output/viewer#the-footer-carries-status]]
func (m model) sortSays() string {
	if m.sortAt < 0 || m.sortAt >= len(logColumns) {
		return ""
	}
	arrow := "▲"
	if m.sortDown {
		arrow = "▼"
	}
	return arrow + " " + logColumns[m.sortAt].name
}
