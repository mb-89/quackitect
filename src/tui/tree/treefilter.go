// The filter of the log, read over an item of the tree. An item answers the
// three questions the language asks of a row, so a person types one language
// in every tab. A node stands while it matches, or while a child of it does.
// [[spec/design_output/tree-view#the-filter-reads-an-item]]

package tree

import (
	"sort"
	"strings"

	"quackitect/tui/draw"
)

// [[spec/design_output/tree-view#the-filter-reads-an-item]]
func (i Item) Haystack() string {
	said := make([]string, 0, len(i.Keys)+1)
	said = append(said, i.Name)
	for _, key := range i.keys() {
		said = append(said, i.Keys[key])
	}
	return strings.Join(said, " ")
}

// [[spec/design_output/tree-view#the-filter-reads-an-item]]
func (i Item) Detail() string {
	lines := make([]string, 0, len(i.Keys)+1)
	lines = append(lines, "name: "+i.Name)
	for _, key := range i.keys() {
		lines = append(lines, key+": "+i.Keys[key])
	}
	return strings.Join(lines, "\n")
}

// [[spec/design_output/tree-view#the-filter-reads-an-item]]
func (i Item) Field(name string) (string, bool) {
	if strings.EqualFold(name, "name") {
		return i.Name, true
	}
	for key, value := range i.Keys {
		if strings.EqualFold(key, name) {
			return value, true
		}
	}
	return "", false
}

func (i Item) keys() []string {
	out := make([]string, 0, len(i.Keys))
	for key := range i.Keys {
		out = append(out, key)
	}
	sort.Strings(out)
	return out
}

// [[spec/design_output/tree-view#a-parent-stands-for-it]]
func (t *Tree) Narrow(f draw.Filter) {
	// A mark a person cannot see is a row a fill writes blind. [[spec/design_output/tree-view#a-fill-reaches-the-marks]]
	if t.filter.Source != f.Source {
		t.DropMarks()
	}
	t.filter = f
	t.rebuild()
}

// [[spec/design_output/tree-view#a-parent-stands-for-it]]
func (t Tree) Narrowed() bool { return !t.filter.Empty() }

// [[spec/design_output/tree-view#a-parent-stands-for-it]]
func (t Tree) keeps(one Item) bool {
	if t.filter.Match(one) {
		return true
	}
	for _, kid := range one.Kids {
		if t.keeps(kid) {
			return true
		}
	}
	return false
}
