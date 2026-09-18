// The view drawing a tree and a table at once. An item carries the values its
// columns read, and the first column carries the name and the nesting. The
// last column takes the room the ones before it leave, and cuts its text
// there. The column names stand still while the rows scroll under them.
// [[spec/design_output/tree-view#the-view-draws-a-tree]]

package main

import (
	"strconv"
	"strings"
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
	Cols    []Column
	Items   []Item
	Nests   bool
	Schema  Schema
	filter  Filter
	sorts   []Sort
	presets []Preset
	typed   string
	edit    *Edit
	shut    map[string]bool
	flat    []twig
	sel     int
	top     int
}

type twig struct {
	item  Item
	depth int
	at    string
	kids  bool
}

// [[spec/design_output/tree-view#the-view-draws-a-tree]]
func NewTree(cols []Column, items []Item, nests bool) *Tree {
	t := &Tree{Cols: cols, Items: items, Nests: nests, shut: map[string]bool{}}
	t.rebuild()
	return t
}

// [[spec/design_output/tree-view#a-parent-expands-and-collapses]]
func (t *Tree) rebuild() {
	t.flat = t.flat[:0]
	t.walk(t.Items, 0, "")
	t.sel = max(0, min(t.sel, len(t.flat)-1))
}

// The sort orders one level, and the place a row keeps is its own. [[spec/design_output/tree-view#a-sort-holds-several-keys]]
func (t *Tree) walk(items []Item, depth int, above string) {
	for _, at := range t.order(items) {
		one := items[at]
		here := strconv.Itoa(at)
		if above != "" {
			here = above + "/" + here
		}
		if !t.keeps(one) {
			continue
		}
		kids := t.Nests && t.kept(one.Kids)
		t.flat = append(t.flat, twig{item: one, depth: depth, at: here, kids: kids})
		switch {
		case kids && !t.shut[here]:
			t.walk(one.Kids, depth+1, here)
		case !t.Nests && t.kept(one.Kids):
			t.walk(one.Kids, depth, here)
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
		t.shut[held.at] = !t.shut[held.at]
		t.rebuild()
	}
}

// [[spec/design_output/tree-view#a-parent-expands-and-collapses]]
func (t *Tree) Expand(every bool) {
	if !every {
		if held := t.twig(); held != nil && held.kids {
			delete(t.shut, held.at)
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
		if held != nil && held.kids && !t.shut[held.at] {
			t.shut[held.at] = true
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
			t.shut[one.at] = true
			return
		}
	}
}

func (t *Tree) shutAll(items []Item, above string) {
	for at, one := range items {
		here := strconv.Itoa(at)
		if above != "" {
			here = above + "/" + here
		}
		if len(one.Kids) > 0 {
			t.shut[here] = true
			t.shutAll(one.Kids, here)
		}
	}
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
