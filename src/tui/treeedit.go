// An edit standing open on a cell. Enter writes the value, Escape puts the old
// one back, and Enter with shift writes it into every row the view holds. The
// completion offers what the field's schema names, and the values standing in
// the data where no schema names any.
// [[spec/design_output/tree-view#a-cell-takes-an-edit]]

package main

import (
	"sort"
	"strconv"
	"strings"

	"github.com/charmbracelet/bubbles/cursor"
	"github.com/charmbracelet/bubbles/textinput"
	tea "github.com/charmbracelet/bubbletea"
)

const leastEditWidth = 4

// [[spec/design_output/tree-view#the-completion-knows-the-field]]
type Schema interface {
	Takes(key string) []string
}

// [[spec/design_output/tree-view#a-cell-takes-an-edit]]
type Edit struct {
	key   string
	was   string
	at    string
	input textinput.Model
	offer []string
}

// The key an item carries naming the field its last write changed, so a writer past the tree reads which one. [[spec/design_output/tui#the-work-tab-takes-edits]]
const editedKey = "edited"

// [[spec/design_output/tree-view#a-cell-takes-an-edit]]
func (t *Tree) Open(col int) bool {
	held := t.twig()
	if held == nil || col < 0 || col >= len(t.Cols) {
		return false
	}
	key := t.Cols[col].Key
	was := valueOf(held.item, key)
	line := textinput.New()
	line.Prompt = ""
	line.Width = max(leastEditWidth, roomFor(t.Cols[col]))
	line.Cursor.SetMode(cursor.CursorStatic)
	line.SetValue(was)
	line.CursorEnd()
	line.Focus()
	t.edit = &Edit{key: key, was: was, at: held.at, input: line}
	t.edit.offer = t.offers(key, was)
	return true
}

// [[spec/design_output/tree-view#a-cell-takes-an-edit]]
func (t Tree) Editing() bool { return t.edit != nil }

// [[spec/design_output/tree-view#a-cell-takes-an-edit]]
func (t Tree) Typed() string {
	if t.edit == nil {
		return ""
	}
	return t.edit.input.Value()
}

// [[spec/design_output/tree-view#the-completion-knows-the-field]]
func (t Tree) Offer() []string {
	if t.edit == nil {
		return nil
	}
	return t.edit.offer
}

// [[spec/design_output/tree-view#a-cell-takes-an-edit]]
func (t *Tree) Typing(msg tea.KeyMsg) {
	if t.edit == nil {
		return
	}
	t.edit.input, _ = t.edit.input.Update(msg)
	t.edit.offer = t.offers(t.edit.key, t.edit.input.Value())
}

// [[spec/design_output/tree-view#a-cell-takes-an-edit]]
func (t *Tree) Drop() {
	t.edit = nil
}

// [[spec/design_output/tree-view#a-cell-takes-an-edit]]
func (t *Tree) Take() []string {
	if t.edit == nil {
		return nil
	}
	said, key := t.edit.input.Value(), t.edit.key
	left := t.write([]string{t.edit.at}, key, said)
	t.edit = nil
	t.rebuild()
	return left
}

// [[spec/design_output/tree-view#the-fill-reaches-the-view]]
func (t *Tree) Fill() []string {
	if t.edit == nil {
		return nil
	}
	said, key := t.edit.input.Value(), t.edit.key
	left := t.write(t.fillWhere(), key, said)
	t.edit = nil
	t.rebuild()
	return left
}

// [[spec/design_output/tree-view#a-schema-refuses-a-value]]
func (t *Tree) write(where []string, key, said string) []string {
	var left []string
	t.wrote = t.wrote[:0]
	for _, at := range where {
		one := t.itemAt(at)
		if one == nil {
			continue
		}
		if !t.takes(key, said) {
			left = append(left, one.Name)
			continue
		}
		setValue(one, key, said)
		setValue(one, editedKey, key)
		t.wrote = append(t.wrote, at)
	}
	return left
}

// The items the last take or fill wrote, so a writer past the tree reaches each one. [[spec/design_output/tui#the-work-tab-takes-edits]]
func (t Tree) Written() []Item {
	out := make([]Item, 0, len(t.wrote))
	for _, at := range t.wrote {
		if one := t.itemAt(at); one != nil {
			out = append(out, *one)
		}
	}
	return out
}

// [[spec/design_output/tree-view#the-completion-knows-the-field]]
func (t Tree) takes(key, said string) bool {
	if t.Schema == nil {
		return true
	}
	allowed := t.Schema.Takes(key)
	if len(allowed) == 0 {
		return true
	}
	for _, one := range allowed {
		if one == said {
			return true
		}
	}
	return false
}

// [[spec/design_output/tree-view#the-completion-knows-the-field]]
func (t Tree) offers(key, typed string) []string {
	held := []string{}
	if t.Schema != nil {
		held = t.Schema.Takes(key)
	}
	if len(held) == 0 {
		held = t.standing(key)
	}
	out := make([]string, 0, len(held))
	for _, one := range held {
		if strings.Contains(strings.ToLower(one), strings.ToLower(typed)) {
			out = append(out, one)
		}
	}
	return out
}

// [[spec/design_output/tree-view#the-completion-knows-the-field]]
func (t Tree) standing(key string) []string {
	seen := map[string]bool{}
	var walk func(items []Item)
	walk = func(items []Item) {
		for _, one := range items {
			if said := valueOf(one, key); said != "" {
				seen[said] = true
			}
			walk(one.Kids)
		}
	}
	walk(t.Items)
	out := make([]string, 0, len(seen))
	for said := range seen {
		out = append(out, said)
	}
	sort.Strings(out)
	return out
}

func (t *Tree) itemAt(at string) *Item {
	items := t.Items
	var one *Item
	for _, step := range strings.Split(at, "/") {
		n, err := strconv.Atoi(step)
		if err != nil || n < 0 || n >= len(items) {
			return nil
		}
		one = &items[n]
		items = one.Kids
	}
	return one
}

func roomFor(col Column) int {
	if col.Wide > 0 {
		return col.Wide
	}
	return columnWide
}

func valueOf(one Item, key string) string {
	if strings.EqualFold(key, "name") {
		return one.Name
	}
	return one.Keys[key]
}

func setValue(one *Item, key, said string) {
	if strings.EqualFold(key, "name") {
		one.Name = said
		return
	}
	if one.Keys == nil {
		one.Keys = map[string]string{}
	}
	one.Keys[key] = said
}
