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
		cell := pad(cut(one.Name, wide[at]), wide[at])
		// The column under the cursor stands lit, so a person reads where an edit opens. [[spec/design_output/tui#the-work-tab-takes-edits]]
		if at == t.cur && t.Schema != nil {
			cell = openStyle.Render(cell)
		}
		cells = append(cells, cell)
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

// Each cell wears its own style, so the letters keep their colours and the name its link on a selected row. [[spec/design_output/tree-view#the-name-column-nests]]
func (t Tree) row(one twig, selected bool, wide []int) string {
	cells := make([]string, 0, len(t.Cols))
	for at, col := range t.Cols {
		switch {
		case t.edits(one, col):
			cells = append(cells, pad(cut(t.edit.input.View(), wide[at]), wide[at]))
		case at == 0:
			cells = append(cells, t.nameCell(one, wide[at], selected))
		// [[spec/design_output/tree-view#a-flag-draws-a-letter]]
		case col.Key == flagsKey:
			cells = append(cells, t.lettersCell(one.item, wide[at], selected))
		default:
			cells = append(cells, styled(pad(cut(one.item.Keys[col.Key], wide[at]), wide[at]), selected))
		}
	}
	return strings.Join(cells, styled(" ", selected))
}

// A selected cell wears the bar, and any other stands plain. [[spec/design_output/tree-view#the-view-draws-a-tree]]
func styled(said string, selected bool) string {
	if selected {
		return barStyle.Render(said)
	}
	return said
}

// The name cell: the nesting and the mark, then the name as a link where the tree resolves one. [[spec/design_output/tree-view#a-value-carries-a-link]]
func (t Tree) nameCell(one twig, wide int, selected bool) string {
	head := t.nameHead(one)
	name := cut(one.item.Name, max(0, wide-len([]rune(head))))
	if t.LinkOf != nil {
		name = linked(name, t.LinkOf(one.item))
	}
	return styled(pad(head+name, wide), selected)
}

// Every letter in its own colour, and the room after them in the row's. [[spec/design_output/tree-view#a-flag-draws-a-letter]]
func (t Tree) lettersCell(one Item, wide int, selected bool) string {
	said := make([]string, 0, len(t.flags))
	for at, held := range t.States(one) {
		if at >= wide {
			break
		}
		said = append(said, flagStyle(held).Render(held.Letter))
	}
	return strings.Join(said, "") + styled(strings.Repeat(" ", max(0, wide-len(said))), selected)
}

// [[spec/design_output/tree-view#a-cell-takes-an-edit]]
func (t Tree) edits(one twig, col Column) bool {
	return t.edit != nil && t.edit.at == one.at && t.edit.key == col.Key
}

// [[spec/design_output/tree-view#the-name-column-nests]]
func (t Tree) nameOf(one twig) string {
	return t.nameHead(one) + one.item.Name
}

// What stands before the name: the nesting, the mark of a parent, and the dot of a marked row. [[spec/design_output/tree-view#the-name-column-nests]]
func (t Tree) nameHead(one twig) string {
	head := ""
	if t.Nests {
		mark := strings.Repeat(" ", markWide)
		switch {
		case one.kids && t.shut[one.at]:
			mark = "▸ "
		case one.kids:
			mark = "▾ "
		}
		head = strings.Repeat(" ", one.depth*nestWide) + mark
	}
	// A marked row draws its dot, so a person reads what a fill reaches. [[spec/design_output/tree-view#a-fill-reaches-the-marks]]
	if t.marks[one.at] {
		head += "● "
	}
	return head
}

// Whether the column x stands on the mark before the selected row's name, where a press opens the parent. [[spec/design_output/tree-view#a-parent-expands-and-collapses]]
func (t Tree) OnMark(x int) bool {
	held := t.twig()
	if held == nil || !held.kids || !t.Nests {
		return false
	}
	from := held.depth * nestWide
	return x >= from && x < from+markWide
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
