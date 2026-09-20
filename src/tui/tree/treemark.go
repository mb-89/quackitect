// The marks a person puts on rows, and what a fill does with them. A fill with
// marks standing reaches the marked rows alone, and a filter change takes every
// mark off, because a mark a person cannot see is a row a fill writes blind.
// [[spec/design_output/tree-view#a-fill-reaches-the-marks]]

package tree

// A press marks a row, and the same press takes the mark off. [[spec/design_output/tree-view#a-fill-reaches-the-marks]]
func (t *Tree) Mark() {
	held := t.twig()
	if held == nil {
		return
	}
	if t.marks == nil {
		t.marks = map[string]bool{}
	}
	if t.marks[held.at] {
		delete(t.marks, held.at)
		t.last = ""
		return
	}
	t.marks[held.at] = true
	t.last = held.at
}

// Shift and a row marks the run from the last mark to this one. [[spec/design_output/tree-view#a-fill-reaches-the-marks]]
func (t *Tree) MarkRun() {
	held := t.twig()
	if held == nil {
		return
	}
	from := t.rowOf(t.last)
	if from < 0 {
		t.Mark()
		return
	}
	to := t.sel
	if from > to {
		from, to = to, from
	}
	if t.marks == nil {
		t.marks = map[string]bool{}
	}
	for at := from; at <= to; at++ {
		t.marks[t.flat[at].at] = true
	}
	t.last = held.at
}

// [[spec/design_output/tree-view#a-fill-reaches-the-marks]]
func (t Tree) rowOf(at string) int {
	if at == "" {
		return -1
	}
	for row, one := range t.flat {
		if one.at == at {
			return row
		}
	}
	return -1
}

// [[spec/design_output/tree-view#a-fill-reaches-the-marks]]
func (t Tree) Marks() int { return len(t.marks) }

// [[spec/design_output/tree-view#a-fill-reaches-the-marks]]
func (t Tree) Marked(at string) bool { return t.marks[at] }

// A narrowing drops the marks, so a fill reaches no row a person cannot see. [[spec/design_output/tree-view#a-fill-reaches-the-marks]]
func (t *Tree) DropMarks() {
	t.marks = nil
	t.last = ""
}

// The rows a fill reaches: the marked ones where any stand, the view otherwise. [[spec/design_output/tree-view#a-fill-reaches-the-marks]]
func (t Tree) fillWhere() []string {
	out := make([]string, 0, len(t.flat))
	for _, one := range t.flat {
		if len(t.marks) == 0 || t.marks[one.at] {
			out = append(out, one.at)
		}
	}
	return out
}

// The marked items themselves, so a key over marks reaches each one. [[spec/design_output/tree-view#a-fill-reaches-the-marks]]
func (t Tree) MarkedItems() []*Item {
	out := []*Item{}
	for _, one := range t.flat {
		if t.marks[one.at] {
			if held := t.itemAt(one.at); held != nil {
				out = append(out, held)
			}
		}
	}
	return out
}
