package main

import (
	"fmt"
	"os"
	"regexp"
	"strconv"
	"strings"
)

// WRITING A VIEW FILE BACK, WITHOUT LOSING WHAT SOMEBODY WROTE IN IT.
//
// A `.base` file is the owner's. It carries comments explaining why a view is
// the way it is, and a writer that re-renders the whole document from a parsed
// tree throws those away. So a change is a patch to the lines it names and
// nothing else moves.
//
// THE ENGINE WRITES IT, NOT THE EDITOR. Dragging a column edge is a person
// saying how wide it should be, and where that is stored is one place's
// business.

// SetWidth writes a column's width into a view's columnSize block.
func SetWidth(path, view, col string, px int) error {
	if px < 40 {
		px = 40
	}
	return patchView(path, view, "columnSize", func(block []string, indent string) []string {
		return upsertPair(block, indent, col, strconv.Itoa(px))
	})
}

// SetOrder writes the column order a person dragged into place.
func SetOrder(path, view string, cols []string) error {
	if len(cols) == 0 {
		return fmt.Errorf("an order with no columns would draw an empty table")
	}
	return patchView(path, view, "order", func(_ []string, indent string) []string {
		var out []string
		for _, c := range cols {
			out = append(out, indent+"- "+c)
		}
		return out
	})
}

// SetSort replaces every sort level with one. A heading that ADDED a level
// would make the header and the sort list disagree about what is in force.
func SetSort(path, view, col, direction string) error {
	if direction != "DESC" {
		direction = "ASC"
	}
	return patchView(path, view, "sort", func(_ []string, indent string) []string {
		return []string{indent + "- property: " + col, indent + "  direction: " + direction}
	})
}

// SetGroup replaces every group level with one, for the same reason a heading
// replaces every sort level: two controls that disagree about what is in force
// is worse than one that says less.
func SetGroup(path, view, col, direction string) error {
	if direction != "DESC" {
		direction = "ASC"
	}
	return patchView(path, view, "groupBy", func(was []string, indent string) []string {
		// WHAT A DROP INTO THE NEW GROUPING WRITES is carried over, because it
		// is a fact about the property and not about the direction.
		sets := ""
		for _, l := range was {
			if s := strings.TrimSpace(l); strings.HasPrefix(s, "sets:") {
				sets = strings.TrimSpace(strings.TrimPrefix(s, "sets:"))
			}
		}
		out := []string{indent + "- property: " + col}
		if sets != "" {
			out = append(out, indent+"  sets: "+sets)
		}
		return append(out, indent+"  direction: "+direction)
	})
}

// SetFilter writes one statement as the view's filter. What a person built
// compiles to one expression, and that expression is the only thing written.
func SetFilter(path, view, text string) error {
	return patchView(path, view, "filters", func(_ []string, indent string) []string {
		if strings.TrimSpace(text) == "" {
			// A FILTER NOBODY SET KEEPS EVERYTHING, which is what having none
			// means. An empty line would read as a filter that matches nothing.
			return nil
		}
		return []string{indent + "- " + quoteStatement(text)}
	})
}

// A statement goes in quoted when leaving it bare would change what it means.
func quoteStatement(s string) string {
	if strings.ContainsAny(s, ":#") || strings.HasPrefix(s, "-") {
		return strconv.Quote(s)
	}
	return s
}

var itemStart = regexp.MustCompile(`^(\s*)-\s`)
var nameLine = regexp.MustCompile(`^\s*-?\s*name:\s*(\S+)\s*$`)

// patchView finds one key inside one view and replaces the lines under it. A
// key that is not there yet is added at the end of the view, indented to match
// its siblings.
func patchView(path, view, key string, rewrite func(block []string, indent string) []string) error {
	b, err := os.ReadFile(path)
	if err != nil {
		return err
	}
	lines := strings.Split(strings.ReplaceAll(string(b), "\r\n", "\n"), "\n")

	from, to, keyIndent := findView(lines, view)
	if from < 0 {
		return fmt.Errorf("%s declares no view called %q", path, view)
	}
	at, end := findKey(lines, from, to, keyIndent, key)
	inner := keyIndent + "  "
	var was []string
	if at >= 0 {
		was = lines[at+1 : end]
	}
	block := rewrite(was, inner)

	var out []string
	switch {
	case at >= 0 && len(block) == 0:
		// A KEY WITH NOTHING UNDER IT IS NOT A KEY. Leaving the bare line
		// behind gives the reader a name where a value was wanted, and it
		// refuses the whole file. Unpinning the last pin did exactly that.
		out = append(out, lines[:at]...)
		out = append(out, lines[end:]...)
	case at < 0 && len(block) == 0:
		// A key that is not there and has nothing to say stays not there.
		return nil
	case at < 0:
		// A KEY THAT IS NOT THERE YET GOES AFTER THE VIEW'S LAST LINE, and the
		// last line is the last one that belongs to the view rather than the
		// last one before the next. A blank line between two views belongs to
		// neither.
		last := to
		for last > from && strings.TrimSpace(lines[last-1]) == "" {
			last--
		}
		out = append(out, lines[:last]...)
		out = append(out, keyIndent+key+":")
		out = append(out, block...)
		out = append(out, lines[last:]...)
	default:
		out = append(out, lines[:at+1]...)
		out = append(out, block...)
		out = append(out, lines[end:]...)
	}
	// THE FILE KEEPS ITS LAST NEWLINE. Removing a key at the end of a file
	// took the empty line after it too, so a pin and an unpin left the file one
	// byte shorter than it started.
	text := strings.Join(out, "\n")
	if strings.HasSuffix(string(b), "\n") && !strings.HasSuffix(text, "\n") {
		text += "\n"
	}
	return os.WriteFile(path, []byte(text), 0o644)
}

// A VIEW STARTS AT ITS LIST ITEM, not at the line that names it. The name may
// come after the type, and anchoring on the name put a change into the view
// after the one it was meant for.
//
// findView answers the first line of one view, the first line of the next, and
// the indentation the view's own keys sit at.
func findView(lines []string, view string) (int, int, string) {
	type item struct {
		at     int
		indent string
	}
	var items []item
	depth := ""
	for i, l := range lines {
		m := itemStart.FindStringSubmatch(l)
		if m == nil {
			continue
		}
		// The views are the shallowest list in the file that holds a name.
		if depth == "" || len(m[1]) < len(depth) {
			if hasNameUnder(lines, i, m[1]) {
				depth = m[1]
				items = nil
			}
		}
		if m[1] == depth {
			items = append(items, item{at: i, indent: m[1] + "  "})
		}
	}
	for n, it := range items {
		to := len(lines)
		if n+1 < len(items) {
			to = items[n+1].at
		}
		if nameIn(lines, it.at, to) == view {
			return it.at, to, it.indent
		}
	}
	return -1, -1, ""
}

func hasNameUnder(lines []string, at int, indent string) bool {
	for i := at; i < len(lines); i++ {
		if i > at && itemStart.MatchString(lines[i]) && !strings.HasPrefix(lines[i], indent+" ") {
			break
		}
		if nameLine.MatchString(lines[i]) {
			return true
		}
	}
	return false
}

func nameIn(lines []string, from, to int) string {
	for i := from; i < to && i < len(lines); i++ {
		if m := nameLine.FindStringSubmatch(lines[i]); m != nil {
			return m[1]
		}
	}
	return ""
}

// findKey answers the line the key sits on and the line after its block.
func findKey(lines []string, from, to int, indent, key string) (int, int) {
	want := indent + key + ":"
	for i := from; i < to; i++ {
		if strings.TrimRight(lines[i], " ") != want {
			continue
		}
		end := i + 1
		for end < to && (strings.TrimSpace(lines[end]) == "" || strings.HasPrefix(lines[end], indent+" ")) {
			end++
		}
		return i, end
	}
	return -1, -1
}

// upsertPair writes one name and value into a block of them, keeping the rest.
func upsertPair(block []string, indent, name, value string) []string {
	want := indent + name + ":"
	var out []string
	found := false
	for _, l := range block {
		if strings.HasPrefix(strings.TrimRight(l, " "), want) {
			out = append(out, indent+name+": "+value)
			found = true
			continue
		}
		if strings.TrimSpace(l) != "" {
			out = append(out, l)
		}
	}
	if !found {
		out = append(out, indent+name+": "+value)
	}
	return out
}

// PINNING IS THE OWNER'S, AND IT IS A FILTER.
//
// A pinned group is drawn like every other group. What pinning changes is
// where it sits and that it survives a change of grouping, which is why the
// pin carries a filter rather than a value of whatever the grouping is today.
//
// Pin adds one. Unpin removes the one with that name. Both write the view
// file, because that is where the owner's arrangement lives.
// AddPin puts a group on top.
//
// A GROUP THE FILE DECLARES IS PINNED BY NAME. The filter is already in the
// file, so nothing is written twice and nothing can drift.
//
// A GROUP THE DATA MADE IS PINNED WITH ITS FILTER, inline, and the file goes on
// declaring nothing about it. Declaring it would make it permanent, and a group
// somebody invented has to go on disappearing when it empties.
func AddPin(path, view, name, filter string) error {
	if strings.TrimSpace(name) == "" {
		return fmt.Errorf("a pin needs a name")
	}
	declared := declaresGroup(path, view, name)
	if !declared && strings.TrimSpace(filter) == "" {
		return fmt.Errorf("%q is not a declared group, so pinning it needs a filter", name)
	}
	return patchView(path, view, "pinned", func(was []string, indent string) []string {
		out := dropPinned(was, name)
		if declared {
			return append(out, indent+"- "+name)
		}
		return append(out, indent+"- name: "+name,
			indent+"  filter: "+quoteStatement(filter))
	})
}

// DropPinNamed takes a group off the top.
//
// A DECLARED GROUP STAYS DECLARED, so it draws where the grouping puts it. An
// invented one leaves with its pin, because the pin was the only thing in the
// file that named it.
func DropPinNamed(path, view, name string) error {
	return patchView(path, view, "pinned", func(was []string, indent string) []string {
		return dropPinned(was, name)
	})
}

// dropPinned removes one entry from the pin list, whichever shape it is: a bare
// name, or a name with its filter under it.
func dropPinned(block []string, name string) []string {
	return dropName(dropPin(block, name), name)
}

// declaresGroup answers whether the view already declares a group by this name.
func declaresGroup(path, view, name string) bool {
	b, err := os.ReadFile(path)
	if err != nil {
		return false
	}
	lines := strings.Split(strings.ReplaceAll(string(b), "\r\n", "\n"), "\n")
	from, to, indent := findView(lines, view)
	if from < 0 {
		return false
	}
	at, end := findKey(lines, from, to, indent, "groups")
	if at < 0 {
		return false
	}
	for _, l := range lines[at+1 : end] {
		if m := pinName.FindStringSubmatch(l); m != nil && strings.Trim(m[1], `"'`) == name {
			return true
		}
	}
	return false
}

var bareName = regexp.MustCompile(`^\s*-\s*(.+?)\s*$`)

// dropName removes one name from a list of them.
func dropName(block []string, name string) []string {
	var out []string
	for _, l := range block {
		if m := bareName.FindStringSubmatch(l); m != nil && strings.Trim(m[1], `"'`) == name {
			continue
		}
		if strings.TrimSpace(l) != "" {
			out = append(out, l)
		}
	}
	return out
}

var pinName = regexp.MustCompile(`^\s*-\s*name:\s*(.+?)\s*$`)

// dropPin removes one pin's item from a pinned block, and its lines with it. A
// pin is a list item, so it ends where the next list item begins.
func dropPin(block []string, name string) []string {
	var out []string
	skipping := false
	for _, l := range block {
		if m := pinName.FindStringSubmatch(l); m != nil {
			skipping = strings.Trim(m[1], `"'`) == name
			if skipping {
				continue
			}
		} else if skipping {
			if !itemStart.MatchString(l) {
				continue
			}
			skipping = false
		}
		if strings.TrimSpace(l) != "" {
			out = append(out, l)
		}
	}
	return out
}
