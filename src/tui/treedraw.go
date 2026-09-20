// What the tree draws: the line of column names that stands still, and the
// rows under it. Each column takes the room its declaration names, the last
// takes what is left, and the first carries the mark, the nesting and the
// name.
// [[spec/design_output/tree-view#the-columns-read-the-item]]

package main

import (
	"strings"

	"github.com/charmbracelet/lipgloss"
)

const (
	nestWide = 2
	markWide = 2
)

// [[spec/design_output/tree-view#the-columns-read-the-item]]
func (t Tree) widths(w int) []int {
	out := make([]int, len(t.Cols))
	left := w
	for at, one := range t.Cols {
		if at == len(t.Cols)-1 {
			break
		}
		out[at] = max(1, min(one.Wide, left-1))
		left -= out[at] + 1
	}
	out[len(out)-1] = max(1, left)
	return out
}

// [[spec/design_output/tree-view#a-tab-joins-the-two]]
func (t Tree) Header(w int) string {
	wide := t.widths(w)
	cells := make([]string, 0, len(t.Cols))
	for at, one := range t.Cols {
		cells = append(cells, pad(cut(one.Name, wide[at]), wide[at]))
	}
	return headStyle.Render(cut(strings.Join(cells, " "), w))
}

// [[spec/design_output/tree-view#the-view-draws-a-tree]]
func (t Tree) Rows(w, rows int) string {
	wide := t.widths(w)
	lines := make([]string, 0, rows)
	if len(t.flat) == 0 {
		lines = append(lines, dimStyle.Render(cut("no item stands here", w)))
	}
	for at := t.top; len(lines) < rows; at++ {
		if at >= len(t.flat) {
			lines = append(lines, "")
			continue
		}
		lines = append(lines, t.row(t.flat[at], at == t.sel, wide))
	}
	return lipgloss.NewStyle().Width(w).Render(strings.Join(lines, "\n"))
}

// [[spec/design_output/tree-view#the-name-column-nests]]
func (t Tree) row(one twig, selected bool, wide []int) string {
	cells := make([]string, 0, len(t.Cols))
	for at, col := range t.Cols {
		if t.edits(one, col) {
			cells = append(cells, pad(cut(t.edit.input.View(), wide[at]), wide[at]))
			continue
		}
		said := one.item.Keys[col.Key]
		switch {
		case at == 0:
			said = t.nameOf(one)
		// [[spec/design_output/tree-view#a-flag-draws-a-letter]]
		case col.Key == flagsKey:
			said = t.Letters(one.item)
		}
		cells = append(cells, pad(cut(said, wide[at]), wide[at]))
	}
	line := strings.Join(cells, " ")
	if selected {
		return barStyle.Render(line)
	}
	return line
}

// [[spec/design_output/tree-view#a-cell-takes-an-edit]]
func (t Tree) edits(one twig, col Column) bool {
	return t.edit != nil && t.edit.at == one.at && t.edit.key == col.Key
}

// [[spec/design_output/tree-view#the-name-column-nests]]
func (t Tree) nameOf(one twig) string {
	if !t.Nests {
		return markedName(t, one)
	}
	mark := strings.Repeat(" ", markWide)
	switch {
	case one.kids && t.shut[one.at]:
		mark = "▸ "
	case one.kids:
		mark = "▾ "
	}
	return strings.Repeat(" ", one.depth*nestWide) + mark + markedName(t, one)
}

// A marked row draws its mark, so a person reads what a fill reaches. [[spec/design_output/tree-view#a-fill-reaches-the-marks]]
func markedName(t Tree, one twig) string {
	if t.marks[one.at] {
		return "● " + one.item.Name
	}
	return one.item.Name
}

// [[spec/design_output/tree-view#the-view-draws-a-tree]]
func (t *Tree) Scroll(rows int) {
	if t.sel < t.top {
		t.top = t.sel
	}
	if t.sel >= t.top+rows {
		t.top = t.sel - rows + 1
	}
	t.top = max(0, min(t.top, max(0, len(t.flat)-rows)))
	if t.sel < t.top {
		t.top = t.sel
	}
}
