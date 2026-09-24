// The view drawing a tree and a table at once. An item carries the values its
// columns read, and the first column carries the name and the nesting. The
// last column takes the room the ones before it leave, and cuts its text
// there. The column names stand still while the rows scroll under them.
// [[spec/design_output/tree-view#the-view-draws-a-tree]]

package tree

import (
	"strconv"
	"strings"

	"quackitect/tui/draw"
)

// [[spec/design_output/tree-view#an-item-carries-its-keys]]
type Item struct {
	Name string
	Keys map[string]string
	Kids []Item
}

// [[spec/design_output/tree-view#the-columns-read-the-item]]
type Column struct {
	Name string
	Key  string
	Wide int
}

// [[spec/design_output/tree-view#the-view-draws-a-tree]]
type Tree struct {
	Cols   []Column
	Items  []Item
	Nests  bool
	Schema Schema
	// The address a row's name links to, and nil where the names link nowhere. [[spec/design_output/tree-view#a-value-carries-a-link]]
	LinkOf  func(Item) string
	filter  draw.Filter
	sorts   []Sort
	presets []Preset
	flags   []Flag
	typed   string
	marks   map[string]bool
	last    string
	edit    *Edit
	shut    map[string]bool
	flat    []twig
	sel     int
	top     int
	cur     int
	wrote   []string
	refused string
}

type twig struct {
	item  Item
	depth int
	at    string
	key   string
	kids  bool
}

// This byte stands outside every name, so it joins the names down to a row. [[spec/design_output/tree-view#a-parent-expands-and-collapses]]
const keyStep = "\x1f"

// A row's key is the path of names down to it, so a shut parent stays shut where rows arrive or leave around it. [[spec/design_output/tree-view#a-parent-expands-and-collapses]]
func keyOf(above, name string) string {
	if above == "" {
		return name
	}
	return above + keyStep + name
}

// [[spec/design_output/tree-view#the-view-draws-a-tree]]
func NewTree(cols []Column, items []Item, nests bool) *Tree {
	t := &Tree{Cols: cols, Items: items, Nests: nests, shut: map[string]bool{}}
	t.rebuild()
	return t
}

// The items standing beside one at its own level: the roots, or its parent's kids, and nothing for a name the tree holds nowhere. [[spec/design_output/tree-view#a-parent-expands-and-collapses]]
func (t Tree) Siblings(name string) []Item {
	return siblingsIn(t.Items, name)
}

func siblingsIn(items []Item, name string) []Item {
	for _, one := range items {
		if one.Name == name {
			return items
		}
	}
	for _, one := range items {
		if held := siblingsIn(one.Kids, name); held != nil {
			return held
		}
	}
	return nil
}

// A change laid over every item, at every depth, after which the rows read again. [[spec/design_output/tree-view#an-item-carries-its-keys]]
func (t *Tree) Amend(change func(*Item)) {
	amend(t.Items, change)
	t.rebuild()
}

func amend(items []Item, change func(*Item)) {
	for at := range items {
		change(&items[at])
		amend(items[at].Kids, change)
	}
}

// [[spec/design_output/tree-view#a-parent-expands-and-collapses]]
func (t *Tree) rebuild() {
	t.flat = t.flat[:0]
	t.walk(t.Items, 0, "", "")
	t.sel = max(0, min(t.sel, len(t.flat)-1))
}

// The sort orders one level, and the place a row keeps is its own. [[spec/design_output/tree-view#a-sort-holds-several-keys]]
func (t *Tree) walk(items []Item, depth int, above, up string) {
	for _, at := range t.order(items) {
		one := items[at]
		here := strconv.Itoa(at)
		if above != "" {
			here = above + "/" + here
		}
		if !t.keeps(one) {
			continue
		}
		key := keyOf(up, one.Name)
		kids := t.Nests && t.kept(one.Kids)
		t.flat = append(t.flat, twig{item: one, depth: depth, at: here, key: key, kids: kids})
		switch {
		case kids && !t.shut[key]:
			t.walk(one.Kids, depth+1, here, key)
		case !t.Nests && t.kept(one.Kids):
			t.walk(one.Kids, depth, here, key)
		}
	}
}

// [[spec/design_output/tree-view#a-parent-expands-and-collapses]]
// [[spec/design_output/tree-view#a-parent-stands-for-it]]
func (t Tree) kept(kids []Item) bool {
	for _, one := range kids {
		if t.keeps(one) {
			return true
		}
	}
	return false
}

// [[spec/design_output/tree-view#a-parent-expands-and-collapses]]
func (t *Tree) Toggle() {
	if held := t.twig(); held != nil && held.kids {
		t.shut[held.key] = !t.shut[held.key]
		t.rebuild()
	}
}

// [[spec/design_output/tree-view#a-parent-expands-and-collapses]]
func (t *Tree) Expand(every bool) {
	if !every {
		if held := t.twig(); held != nil && held.kids {
			delete(t.shut, held.key)
		}
	} else {
		t.shut = map[string]bool{}
	}
	t.rebuild()
}

// [[spec/design_output/tree-view#a-parent-expands-and-collapses]]
func (t *Tree) Collapse(every bool) {
	held := t.twig()
	if !every {
		if held != nil && held.kids && !t.shut[held.key] {
			t.shut[held.key] = true
		} else if held != nil {
			t.toParent(held)
		}
		t.rebuild()
		return
	}
	t.shutAll(t.Items, "")
	t.rebuild()
	t.sel = 0
}

func (t *Tree) toParent(held *twig) {
	up := strings.LastIndex(held.at, "/")
	if up < 0 {
		return
	}
	for at, one := range t.flat {
		if one.at == held.at[:up] {
			t.sel = at
			t.shut[one.key] = true
			return
		}
	}
}

func (t *Tree) shutAll(items []Item, above string) {
	for _, one := range items {
		here := keyOf(above, one.Name)
		if len(one.Kids) > 0 {
			t.shut[here] = true
			t.shutAll(one.Kids, here)
		}
	}
}

// The column the cursor stands on, which an edit opens. [[spec/design_output/tui#the-work-tab-takes-edits]]
func (t Tree) Cursor() int { return t.cur }

// [[spec/design_output/tui#the-work-tab-takes-edits]]
func (t *Tree) MoveCursor(step int) {
	t.cur = max(0, min(t.cur+step, len(t.Cols)-1))
}

// A tree handed over again keeps the place a person stands at, so a redraw moves nothing under them. [[spec/design_output/tui#the-work-tab]]
func (t *Tree) Carry(from *Tree) {
	if from == nil {
		return
	}
	t.cur = min(from.cur, len(t.Cols)-1)
	t.Schema = from.Schema
	for key, shut := range from.shut {
		if shut {
			t.shut[key] = true
		}
	}
	t.rebuild()
	t.sel = max(0, min(from.sel, len(t.flat)-1))
	// The row a person stands on keeps the cursor, where rows arrive above it. [[spec/design_output/tree-view#a-parent-expands-and-collapses]]
	if held := from.twig(); held != nil {
		for at, one := range t.flat {
			if one.key == held.key {
				t.sel = at
				break
			}
		}
	}
	t.top = from.top
}

// [[spec/design_output/tree-view#the-view-draws-a-tree]]
func (t *Tree) Move(step int) {
	t.sel = max(0, min(t.sel+step, len(t.flat)-1))
}

// [[spec/design_output/tree-view#the-view-draws-a-tree]]
func (t *Tree) MoveTo(at int) { t.sel = max(0, min(at, len(t.flat)-1)) }

// [[spec/design_output/tree-view#the-view-draws-a-tree]]
func (t Tree) At() int { return t.sel }

// [[spec/design_output/tree-view#the-view-draws-a-tree]]
func (t Tree) Len() int { return len(t.flat) }

// [[spec/design_output/tree-view#the-view-draws-a-tree]]
func (t Tree) Selected() *Item {
	if held := t.twig(); held != nil {
		return &held.item
	}
	return nil
}

func (t Tree) twig() *twig {
	if t.sel < 0 || t.sel >= len(t.flat) {
		return nil
	}
	return &t.flat[t.sel]
}

// Rows a caller adds beside the ones the tree read, which take the next places in the flat list. [[spec/design_output/stop#the-plan]]
func (t *Tree) Append(items ...Item) {
	t.Items = append(t.Items, items...)
	t.rebuild()
}
