// The order the tree's rows stand in. A sort holds a list of keys, each with
// its own direction, and a later key breaks the ties an earlier one leaves. It
// stands between the data and the view, beside the filter, so the items stay
// as they stand and the nesting survives.
// [[spec/design_output/tree-view#a-sort-holds-several-keys]]

package main

import (
	"sort"
	"strconv"
	"strings"
)

// [[spec/design_output/tree-view#a-sort-holds-several-keys]]
type Sort struct {
	Key  string
	Down bool
}

// A press puts a key at the end of the list, a second turns it around, and a third drops it. [[spec/design_output/tree-view#a-sort-holds-several-keys]]
func (t *Tree) SortOn(key string) {
	if key == "" {
		return
	}
	for at, one := range t.sorts {
		if one.Key != key {
			continue
		}
		if one.Down {
			t.sorts = append(t.sorts[:at], t.sorts[at+1:]...)
		} else {
			t.sorts[at].Down = true
		}
		t.rebuild()
		return
	}
	t.sorts = append(t.sorts, Sort{Key: key})
	t.rebuild()
}

// A preset puts a whole list in at once. [[spec/design_output/tree-view#a-sort-holds-several-keys]]
func (t *Tree) Sorted(said []Sort) {
	t.sorts = append([]Sort(nil), said...)
	t.rebuild()
}

// [[spec/design_output/tree-view#a-sort-holds-several-keys]]
func (t Tree) Sorts() []Sort { return append([]Sort(nil), t.sorts...) }

// The places of one level's items, in the order the keys put them. [[spec/design_output/tree-view#a-sort-holds-several-keys]]
func (t Tree) order(items []Item) []int {
	out := make([]int, len(items))
	for at := range items {
		out[at] = at
	}
	if len(t.sorts) == 0 {
		return out
	}
	sort.SliceStable(out, func(a, b int) bool {
		return t.before(items[out[a]], items[out[b]])
	})
	return out
}

// [[spec/design_output/tree-view#a-sort-holds-several-keys]]
func (t Tree) before(one, two Item) bool {
	for _, held := range t.sorts {
		left, _ := one.Field(held.Key)
		right, _ := two.Field(held.Key)
		if left == right {
			continue
		}
		// A row carrying no value for the key stands after the rows that carry one. [[spec/design_output/tree-view#a-sort-holds-several-keys]]
		if left == "" || right == "" {
			return right == ""
		}
		if held.Down {
			return under(right, left)
		}
		return under(left, right)
	}
	return false
}

// Two numbers read as numbers, so a place past nine stands under a place under it. [[spec/design_output/tree-view#a-sort-holds-several-keys]]
func under(left, right string) bool {
	one, first := strconv.Atoi(strings.TrimSpace(left))
	two, second := strconv.Atoi(strings.TrimSpace(right))
	if first == nil && second == nil {
		return one < two
	}
	return left < right
}

// The column the screen column x stands on, and the empty name past the last. [[spec/design_output/tree-view#a-sort-holds-several-keys]]
func (t Tree) ColumnAt(x, w int) string {
	wide := t.widths(w)
	at := 0
	for i, one := range t.Cols {
		if x >= at && x < at+wide[i] {
			return one.Key
		}
		at += wide[i] + 1
	}
	return ""
}

// The row the screen row stands on, counted from the top the view holds. [[spec/design_output/tree-view#the-view-draws-a-tree]]
func (t *Tree) MoveToRow(row int) {
	t.MoveTo(t.top + row)
}

// What the footer says about the order, which stands empty where none sorts. [[spec/design_output/tree-view#a-sort-holds-several-keys]]
func (t Tree) SortSays() string {
	if len(t.sorts) == 0 {
		return ""
	}
	said := make([]string, 0, len(t.sorts))
	for _, one := range t.sorts {
		arrow := "▲"
		if one.Down {
			arrow = "▼"
		}
		said = append(said, arrow+" "+one.Key)
	}
	return strings.Join(said, " ")
}
