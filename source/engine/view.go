package main

import (
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
)

// THE VIEW, AND THE ROWS IT ANSWERS.
//
// A view is a `.base` file. The format is the owner's and we render it, because
// the owner already writes table specs in it and a second grammar creates the
// duplication it was meant to prevent.
//
// THE EDITOR IS GENERIC AND THE WORK EDITOR IS ONE INSTANCE OF IT. Nothing
// here knows what a token is. Rows arrive as flat maps and where they came
// from is the caller's business, so a second source — a state machine, drawn
// in the same window — is a second caller and not a change to any of this.
//
// PINNED GROUPS ARE OURS, AND THEY ARE NOT A VALUE OF THE GROUPING PROPERTY.
// A pinned group carries its own filter, so it stays at the top when the
// grouping changes underneath it. A row goes to the first pinned group that
// matches and is not repeated below, so the top is a partition rather than a
// second copy of the same rows.

type Pin struct {
	Name   string
	Filter *Expr
}

type Level struct {
	By         *Expr
	Text       string
	Descending bool

	// WHAT A DROP INTO THIS GROUP WRITES.
	//
	// A group level may be computed, and a computed one cannot say what to set
	// from the expression alone: if(bucket, bucket, place) groups by two
	// properties and a drop has to choose. So the level says which, and a
	// level that says nothing is a group nothing can be dropped into.
	//
	// Nothing here performs the write. It is carried so that a renderer can
	// offer the target and one verb can apply it later.
	Sets string
}

type Sort struct {
	Property   string
	Descending bool
}

type View struct {
	Name      string
	Type      string
	Order     []string // the columns, in order
	Widths    map[string]int
	Group     []Level
	Pinned    []Pin
	Collapsed []string
	Sort      []Sort
	Filter    *Expr
	Limit     int
}

type Base struct {
	Path    string
	Display map[string]string // property to column heading
	Opens   map[string]bool   // a click on this column opens the note
	Filter  *Expr
	Views   []View
}

// LoadBase reads a view file. Anything the renderer does not know refuses by
// name, because a query language that ignores a clause it cannot read answers
// with a table that looks complete and is wrong.
func LoadBase(path string) (Base, error) {
	b := Base{Path: path, Display: map[string]string{}, Opens: map[string]bool{}}
	text, err := os.ReadFile(path)
	if err != nil {
		return b, err
	}
	tree, err := ParseYAML(string(text))
	if err != nil {
		return b, fmt.Errorf("%s: %w", filepath.Base(path), err)
	}
	top := ymap(tree)
	for key := range top {
		switch key {
		case "properties", "views", "filters":
		default:
			return b, fmt.Errorf("%s: this program does not read %q at the top level. It reads properties, views and filters",
				filepath.Base(path), key)
		}
	}
	for name, cfg := range ymap(top["properties"]) {
		m := ymap(cfg)
		if d := ystr(m["displayName"]); d != "" {
			b.Display[name] = d
		}
		b.Opens[name] = ystr(m["opensNote"]) == "true"
	}
	if b.Filter, err = filterOf(top["filters"]); err != nil {
		return b, fmt.Errorf("%s: %w", filepath.Base(path), err)
	}
	for _, raw := range ylist(top["views"]) {
		v, err := readView(ymap(raw))
		if err != nil {
			return b, fmt.Errorf("%s: %w", filepath.Base(path), err)
		}
		b.Views = append(b.Views, v)
	}
	if len(b.Views) == 0 {
		return b, fmt.Errorf("%s: it declares no views", filepath.Base(path))
	}
	return b, nil
}

func readView(m map[string]any) (View, error) {
	v := View{Name: ystr(m["name"]), Type: ystr(m["type"]), Widths: map[string]int{}}
	if v.Type == "" {
		v.Type = "table"
	}
	if v.Type != "table" {
		return v, fmt.Errorf("view %q is a %s. This program draws a table", v.Name, v.Type)
	}
	v.Order = ystrs(m["order"])
	v.Collapsed = ystrs(m["collapsed"])
	if s := ystr(m["limit"]); s != "" {
		v.Limit, _ = strconv.Atoi(s)
	}
	for name, w := range ymap(m["columnSize"]) {
		n, _ := strconv.Atoi(ystr(w))
		v.Widths[name] = n
	}
	var err error
	if v.Filter, err = filterOf(m["filters"]); err != nil {
		return v, err
	}
	// groupBy takes a list, and each level subdivides the one above it. A
	// single object parses too, because that is what Obsidian writes.
	for _, raw := range ylist(m["groupBy"]) {
		g := ymap(raw)
		text := ystr(g["property"])
		e, err := Parse(text)
		if err != nil {
			return v, fmt.Errorf("groupBy: %w", err)
		}
		v.Group = append(v.Group, Level{By: e, Text: text, Sets: ystr(g["sets"]),
			Descending: strings.EqualFold(ystr(g["direction"]), "DESC")})
	}
	for _, raw := range ylist(m["sort"]) {
		s := ymap(raw)
		v.Sort = append(v.Sort, Sort{Property: ystr(s["property"]),
			Descending: strings.EqualFold(ystr(s["direction"]), "DESC")})
	}
	for _, raw := range ylist(m["pinned"]) {
		p := ymap(raw)
		e, err := Parse(ystr(p["filter"]))
		if err != nil {
			return v, fmt.Errorf("pinned %q: %w", ystr(p["name"]), err)
		}
		v.Pinned = append(v.Pinned, Pin{Name: ystr(p["name"]), Filter: e})
	}
	for key := range m {
		switch key {
		case "name", "type", "order", "collapsed", "limit", "columnSize",
			"filters", "groupBy", "sort", "pinned":
		default:
			return v, fmt.Errorf("view %q: this program does not read %q", v.Name, key)
		}
	}
	return v, nil
}

// A filter is a statement, or an object carrying and, or, not. Both shapes
// come back as one expression, so nothing downstream knows which was written.
func filterOf(raw any) (*Expr, error) {
	switch t := raw.(type) {
	case nil:
		return nil, nil
	case string:
		if strings.TrimSpace(t) == "" {
			return nil, nil
		}
		return Parse(t)
	case []any:
		return joined("&&", t)
	case map[string]any:
		var parts []*Expr
		for key, v := range t {
			var e *Expr
			var err error
			switch key {
			case "and":
				e, err = joined("&&", ylist(v))
			case "or":
				e, err = joined("||", ylist(v))
			case "not":
				inner, ierr := joined("&&", ylist(v))
				e, err = &Expr{op: "!", args: []*Expr{inner}}, ierr
			default:
				return nil, fmt.Errorf("a filter group is and, or, or not. It is not %q", key)
			}
			if err != nil {
				return nil, err
			}
			parts = append(parts, e)
		}
		return fold("&&", parts), nil
	}
	return nil, fmt.Errorf("a filter is a statement or a group")
}

func joined(op string, list []any) (*Expr, error) {
	var parts []*Expr
	for _, raw := range list {
		e, err := filterOf(raw)
		if err != nil {
			return nil, err
		}
		if e != nil {
			parts = append(parts, e)
		}
	}
	return fold(op, parts), nil
}

func fold(op string, parts []*Expr) *Expr {
	if len(parts) == 0 {
		return nil
	}
	// A stable order, so a filter reads the same way twice. A map's is not one.
	out := parts[0]
	for _, e := range parts[1:] {
		out = &Expr{op: op, args: []*Expr{out, e}}
	}
	return out
}

// ---------------------------------------------------------------------------
// What the renderer is handed
// ---------------------------------------------------------------------------

type Cell struct {
	Value string `json:"value"`
	List  bool   `json:"list,omitempty"`
}

type Line struct {
	ID    string          `json:"id"`
	Cells map[string]Cell `json:"cells"`
}

type Group struct {
	Name string `json:"name"`
	By   string `json:"by,omitempty"`

	// The property a drop into this group would write, and what it would write.
	// Empty means nothing may be dropped here.
	Sets string `json:"sets,omitempty"`

	Pinned bool    `json:"pinned,omitempty"`
	Shut   bool    `json:"shut,omitempty"`
	Depth  int     `json:"depth"`
	Count  int     `json:"count"`
	Lines  []Line  `json:"lines,omitempty"`
	Groups []Group `json:"groups,omitempty"`
}

type Table struct {
	View    string            `json:"view"`
	Columns []string          `json:"columns"`
	Heads   map[string]string `json:"heads"`
	Widths  map[string]int    `json:"widths,omitempty"`
	Opens   map[string]bool   `json:"opens,omitempty"`
	Pinned  []Group           `json:"pinned,omitempty"`
	Groups  []Group           `json:"groups"`
	Total   int               `json:"total"`
}

// Render selects, pins, groups and sorts. Rows arrive as flat maps and nothing
// here knows where they came from.
func Render(b Base, v View, rows []Row) (Table, error) {
	kept, err := keep(rows, b.Filter, v.Filter)
	if err != nil {
		return Table{}, err
	}
	sortRows(kept, v.Sort)

	t := Table{View: v.Name, Columns: v.Order, Heads: map[string]string{},
		Widths: v.Widths, Opens: b.Opens, Total: len(kept)}
	if len(t.Columns) == 0 {
		t.Columns = columnsOf(kept)
	}
	for _, c := range t.Columns {
		if d, ok := b.Display[c]; ok {
			t.Heads[c] = d
		} else {
			t.Heads[c] = c
		}
	}

	// The pinned groups take their rows out of what is left, in the order they
	// were declared, so the top is a partition and no row appears twice.
	rest := kept
	for _, p := range v.Pinned {
		var mine []Row
		var others []Row
		for _, r := range rest {
			ok, err := truthy(p.Filter, r)
			if err != nil {
				return t, err
			}
			if ok {
				mine = append(mine, r)
			} else {
				others = append(others, r)
			}
		}
		rest = others
		t.Pinned = append(t.Pinned, Group{Name: p.Name, Pinned: true,
			Count: len(mine), Lines: lines(mine, t.Columns)})
	}

	t.Groups, err = group(rest, v, t.Columns, 0)
	return t, err
}

func keep(rows []Row, global, own *Expr) ([]Row, error) {
	var out []Row
	for _, r := range rows {
		ok, err := truthy(global, r)
		if err != nil {
			return nil, err
		}
		if !ok {
			continue
		}
		if ok, err = truthy(own, r); err != nil {
			return nil, err
		}
		if ok {
			out = append(out, r)
		}
	}
	return out, nil
}

// A filter that was not written keeps everything, which is what having no
// filter means.
func truthy(e *Expr, r Row) (bool, error) {
	if e == nil {
		return true, nil
	}
	v, err := e.Eval(r)
	if err != nil {
		return false, err
	}
	return v.Truthy(), nil
}

func group(rows []Row, v View, cols []string, depth int) ([]Group, error) {
	if depth >= len(v.Group) {
		if len(rows) == 0 {
			return nil, nil
		}
		return []Group{{Depth: depth, Count: len(rows), Lines: lines(rows, cols)}}, nil
	}
	level := v.Group[depth]
	byKey := map[string][]Row{}
	var order []string
	for _, r := range rows {
		val, err := level.By.Eval(r)
		if err != nil {
			return nil, err
		}
		key := strings.TrimSpace(val.Text())
		if _, seen := byKey[key]; !seen {
			order = append(order, key)
		}
		byKey[key] = append(byKey[key], r)
	}
	sort.Slice(order, func(i, j int) bool {
		// The empty group goes last whichever way the level is sorted. A
		// leading group of blanks is nobody's answer.
		if (order[i] == "") != (order[j] == "") {
			return order[j] == ""
		}
		if level.Descending {
			return order[i] > order[j]
		}
		return order[i] < order[j]
	})

	var out []Group
	for _, key := range order {
		kids, err := group(byKey[key], v, cols, depth+1)
		if err != nil {
			return nil, err
		}
		g := Group{Name: key, By: level.Text, Sets: level.Sets, Depth: depth,
			Count: len(byKey[key]), Shut: contains(v.Collapsed, key)}
		if depth+1 >= len(v.Group) && len(kids) == 1 {
			g.Lines = kids[0].Lines
		} else {
			g.Groups = kids
		}
		out = append(out, g)
	}
	return out, nil
}

func lines(rows []Row, cols []string) []Line {
	var out []Line
	for _, r := range rows {
		l := Line{ID: r["id"].Text(), Cells: map[string]Cell{}}
		for _, c := range cols {
			v := r[c]
			l.Cells[c] = Cell{Value: v.Text(), List: v.Kind == 'l'}
		}
		out = append(out, l)
	}
	return out
}

func sortRows(rows []Row, by []Sort) {
	if len(by) == 0 {
		return
	}
	sort.SliceStable(rows, func(i, j int) bool {
		for _, s := range by {
			a, b := rows[i][s.Property].Text(), rows[j][s.Property].Text()
			if a == b {
				continue
			}
			if s.Descending {
				return a > b
			}
			return a < b
		}
		return false
	})
}

// Every property any row carries, so a view that names no columns still draws
// something rather than nothing.
func columnsOf(rows []Row) []string {
	seen := map[string]bool{}
	var out []string
	for _, r := range rows {
		for k := range r {
			if !seen[k] {
				seen[k] = true
				out = append(out, k)
			}
		}
	}
	sort.Strings(out)
	return out
}
