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

// A COUNT IS A NAMED FILTER, and it is the generic machinery that lets a
// specific view say what is worth counting. The work editor counts what is
// open and what is backlogged. A view that counts nothing shows nothing.
type Count struct {
	Name   string
	Filter *Expr
	// WHAT THE COUNT IS OUT OF. The person reads a bare number as a fraction
	// with a missing half: two in work, out of how much that could be? The
	// second filter names the whole, and the bar draws n over it.
	OutOf *Expr
}

type Sort struct {
	Property   string
	Descending bool
}

type View struct {
	// What the file said the filter was, kept so the builder can draw it back.
	RawFilter any

	Name   string
	Type   string
	Order  []string // the columns, in order
	Widths map[string]int
	Group  []Level

	// THE GROUPS THIS VIEW DECLARES. A declared group is always drawn, with
	// nothing in it if nothing matches, because the thing it names goes on
	// existing whether or not anything is in that state today.
	//
	// A group nobody declared comes from the data, and one of those is gone
	// the moment it empties: nothing lists what those could be, so an empty
	// one has no name to draw.
	Groups []Pin

	// WHICH GROUPS SIT AT THE TOP, in the order they are named.
	//
	// A PIN ON A DECLARED GROUP IS A NAME. The file already holds the filter,
	// so unpinning removes the name and the group stays: a pin is an ordering
	// and not an existence.
	//
	// A PIN ON A GROUP THE DATA MADE CARRIES ITS OWN FILTER, and nothing else
	// in the file mentions it. Unpinning removes the whole entry, so a group
	// somebody invented goes back to disappearing when it empties. Declaring
	// it would have made it permanent, which is the one line this must not
	// cross.
	Pinned    []Pin
	Collapsed []string
	Sort      []Sort
	Counts    []Count
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
		case "properties", "views", "filters", "groups", "pinned":
		default:
			return b, fmt.Errorf("%s: this program does not read %q at the top level. "+
				"It reads properties, views, filters, groups and pinned",
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
	// GROUPS DECLARED AT THE TOP ARE EVERY VIEW'S. A bucket is a fact about a
	// token rather than about a pane, so a group made in one pane has to show in
	// the other. Declaring them twice made that a copy, and the two panes drew
	// different groups the first time somebody edited one.
	//
	// A VIEW THAT DECLARES ITS OWN KEEPS ITS OWN. The shared list is a default
	// rather than a rule, the way the file's filter is.
	// The file's own lists are read once, so a fault in them is named at the
	// top rather than repeated for every view that inherits them.
	if _, err := readView(map[string]any{"name": "the file",
		"groups": top["groups"], "pinned": top["pinned"]}); err != nil {
		return b, fmt.Errorf("%s: %w", filepath.Base(path), err)
	}
	for _, raw := range ylist(top["views"]) {
		m := ymap(raw)
		// A VIEW INHERITS EACH LIST ON ITS OWN. Taking both together wiped a
		// view's own pins when it declared pins and no groups, which is what an
		// ad-hoc pin on a group the data made looks like.
		for _, key := range InheritedKeys {
			if m[key] == nil {
				m[key] = top[key]
			}
		}
		v, err := readView(m)
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

// WHICH LISTS A VIEW TAKES FROM THE FILE, decided once.
//
// A writer has to go where this reader looks, so the writer reads this rather
// than carrying its own copy of the same two words. The copy is how the
// declaration came to move with only the reader taught its new address.
var InheritedKeys = []string{"groups", "pinned"}

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
	v.RawFilter = m["filters"]
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
	for _, raw := range ylist(m["counts"]) {
		c := ymap(raw)
		e, err := Parse(ystr(c["filter"]))
		if err != nil {
			return v, fmt.Errorf("count %q: %w", ystr(c["name"]), err)
		}
		count := Count{Name: ystr(c["name"]), Filter: e}
		if of := ystr(c["outOf"]); of != "" {
			whole, err := Parse(of)
			if err != nil {
				return v, fmt.Errorf("count %q outOf: %w", count.Name, err)
			}
			count.OutOf = whole
		}
		v.Counts = append(v.Counts, count)
	}
	for _, raw := range ylist(m["groups"]) {
		p := ymap(raw)
		e, err := Parse(ystr(p["filter"]))
		if err != nil {
			return v, fmt.Errorf("group %q: %w", ystr(p["name"]), err)
		}
		v.Groups = append(v.Groups, Pin{Name: ystr(p["name"]), Filter: e})
	}
	for _, raw := range ylist(m["pinned"]) {
		if name := ystr(raw); name != "" {
			// A NAME PINS A DECLARED GROUP. Naming one that is not declared
			// would pin something with no filter, which draws nothing forever.
			found := false
			for _, g := range v.Groups {
				found = found || g.Name == name
			}
			if !found {
				return v, fmt.Errorf("view %q pins %q, and no group of that name is declared", v.Name, name)
			}
			v.Pinned = append(v.Pinned, Pin{Name: name})
			continue
		}
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
			"filters", "groupBy", "sort", "groups", "pinned", "counts":
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

// A LINE IS A ROW, AND A ROW MAY CARRY ITS CHILDREN.
//
// A sub-token sat in the list beside every other token, so the breakdown of a
// piece of work was invisible and the parent looked like one more row.
//
// IT IS A TREE RATHER THAN A GROUPING. The editor draws a group from a
// property's value, and a parent is not a value: it is a link from one row to
// another, and the parent is itself a row. Grouping by parent would draw the
// parent twice, once as a heading and once as a row somewhere else.
type Line struct {
	ID    string          `json:"id"`
	Cells map[string]Cell `json:"cells"`

	// WHOSE CHILD THIS IS, carried on the line rather than read from a cell.
	// The parent is a link and not a column, so a view that does not draw a
	// parent column still nests, which is every view.
	Parent string `json:"parent,omitempty"`

	// The children, and how deep this row is drawn. A child is drawn under its
	// parent and nowhere else, so the page stays a partition.
	Under []Line `json:"under,omitempty"`
	Depth int    `json:"depth,omitempty"`
}

type Group struct {
	Name string `json:"name"`
	By   string `json:"by,omitempty"`

	// The property a drop into this group would write, and what it would write.
	// Empty means nothing may be dropped here.
	Sets string `json:"sets,omitempty"`

	// WHAT PINNING THIS GROUP WOULD WRITE. A pin is a filter, so a group made
	// by a grouping level pins as a test on that level. The engine builds it
	// because the engine owns the expression language.
	//
	// A group that is already pinned carries none: it unpins by its name.
	Pins string `json:"pins,omitempty"`

	// A GROUP THE FILE DECLARES CARRIES NO FILTER TO PIN BY, because the file
	// already holds one. It pins by its name alone.
	Declared bool `json:"declared,omitempty"`

	Pinned bool    `json:"pinned,omitempty"`
	Shut   bool    `json:"shut,omitempty"`
	Depth  int     `json:"depth"`
	Count  int     `json:"count"`
	Lines  []Line  `json:"lines,omitempty"`
	Groups []Group `json:"groups,omitempty"`
}

// A count, answered. Name, number, and the tokens behind it.
//
// THE MEMBERS TRAVEL WITH THE NUMBER because the bar opens onto them. A page
// that took the number here and went looking for the members itself would hold
// two answers to one question, and they disagree the moment a filter moves.
type Tally struct {
	Name string    `json:"name"`
	N    int       `json:"n"`
	// The whole this number is a part of, where the view declared one, so the
	// bar reads 2/21 rather than a 2 with a missing half.
	OutOf int       `json:"out_of,omitempty"`
	Of    []TallyOf `json:"of,omitempty"`
}

// One token behind a count. Its id, so the page can open it, and its title,
// so the page can name it without going back to the table.
type TallyOf struct {
	ID    string `json:"id"`
	Title string `json:"title"`
}

// WHAT COLUMNS EXIST, AND WHAT TYPE EACH ONE IS.
//
// The type is READ FROM THE DATA rather than declared anywhere, because nothing
// declares it. The first value that is not empty decides, which is wrong only
// for a property holding two different types, and that is a defect in the notes
// worth seeing rather than smoothing over.
type PropertyInfo struct {
	Name string `json:"name"`
	Type string `json:"type"`
	On   bool   `json:"on"`
}

func propertyInventory(rows []Row, order []string) []PropertyInfo {
	seen := map[string]string{}
	var names []string
	for _, r := range rows {
		for k, v := range r {
			if _, had := seen[k]; !had {
				names = append(names, k)
				seen[k] = ""
			}
			if seen[k] == "" && v.Kind != 'x' {
				seen[k] = kindName(v.Kind)
			}
		}
	}
	sort.Strings(names)
	var out []PropertyInfo
	for _, n := range names {
		out = append(out, PropertyInfo{Name: n, Type: or3(seen[n], "string"), On: contains(order, n)})
	}
	return out
}

func kindName(k byte) string {
	switch k {
	case 'n':
		return "number"
	case 'b':
		return "boolean"
	case 'l':
		return "list"
	}
	return "string"
}

func or3(s, fallback string) string {
	if s == "" {
		return fallback
	}
	return s
}

type Table struct {
	View    string            `json:"view"`
	Columns []string          `json:"columns"`
	Heads   map[string]string `json:"heads"`
	Widths  map[string]int    `json:"widths,omitempty"`
	Opens   map[string]bool   `json:"opens,omitempty"`
	Pinned  []Group           `json:"pinned,omitempty"`
	Groups  []Group           `json:"groups"`
	Counts  []Tally           `json:"counts,omitempty"`
	Total   int               `json:"total"`

	// WHAT THE TOOLBAR OPERATES ON. The properties a column list ticks, the
	// levels a sort list shows, and the file itself, because the query is the
	// same thing rendered twice and a person may want the other rendering.
	Props  []PropertyInfo `json:"props,omitempty"`
	Group  []LevelSaid    `json:"group,omitempty"`
	Sorted []LevelSaid    `json:"sorted,omitempty"`
	File   string         `json:"file,omitempty"`
	Source string         `json:"source,omitempty"`

	// EVERY ICON THE EDITOR DRAWS, from the one table. It rides on the answer
	// for the same reason the operator vocabulary does: a client with its own
	// copy drifts the first time a mark changes.
	Icons map[string]Icon `json:"icons,omitempty"`

	// WHAT THE FILTER BUILDER DRAWS. The groups a person built, and the
	// operator vocabulary they are offered. The vocabulary is serialised
	// rather than declared in the panel a second time: a client with its own
	// copy drifts the first time an operator is added.
	Filters   []FilterGroup `json:"filters,omitempty"`
	Operators []Operator    `json:"operators,omitempty"`
}

// A level, as the toolbar shows it. The expression is text there, because a
// person types one.
type LevelSaid struct {
	Property  string `json:"property"`
	Direction string `json:"direction"`
	Sets      string `json:"sets,omitempty"`
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

	// Counted over what the view selects, and not over the ledger. A number
	// that answers a different question from the table under it is worse than
	// no number.
	//
	// AND IT CARRIES WHAT IT COUNTED. The bar opens onto the tokens behind a
	// number, so the number and the list are one answer taken in one pass. Two
	// passes, or a page finding the members for itself, is two answers to one
	// question that disagree the moment a filter moves.
	for _, c := range v.Counts {
		tally := Tally{Name: c.Name}
		for _, r := range kept {
			ok, err := truthy(c.Filter, r)
			if err != nil {
				return t, err
			}
			if ok {
				tally.N++
				tally.Of = append(tally.Of, TallyOf{ID: r["id"].Text(), Title: r["title"].Text()})
			}
			// THE WHOLE IS COUNTED OVER THE SAME ROWS AS THE PART, so the two
			// halves of the fraction cannot answer different questions.
			if c.OutOf != nil {
				whole, err := truthy(c.OutOf, r)
				if err != nil {
					return t, err
				}
				if whole {
					tally.OutOf++
				}
			}
		}
		t.Counts = append(t.Counts, tally)
	}

	// A GROUP TAKES ITS ROWS OUT OF WHAT IS LEFT, in order, so the page is a
	// partition and no row appears twice. The pinned ones go first.
	//
	// A PINNED FUNCTIONAL GROUP IS DRAWN WITH NOTHING IN IT. Pinning it is the
	// person saying they want to see it, and a heading they pinned that came
	// and went is a heading they cannot aim at.
	//
	// AN UNPINNED ONE HIDES AT ZERO AND COMES BACK. It has not been asked for,
	// so an empty heading is noise. The declaration is what brings it back the
	// moment the filter returns a row.
	//
	// A GROUP THE DATA MADE IS DRAWN WHILE IT HAS ROWS AND NOT AFTER. Nothing
	// lists what those could be, so an empty one has no name to draw. Pinning
	// one does not change that: the pin carries the filter and the file never
	// declares it.
	rest := kept

	// A QUERY ASKS EVERY ROW AND TAKES NOTHING AWAY.
	//
	// THE OWNER'S RULING. A group declared by a filter is a query, and a query
	// is a question asked of every row rather than a place a row lives, so it
	// overlaps other queries and it overlaps the bucket a person put the row
	// in. An item can be found by a query and be in a user defined group at
	// the same time.
	//
	// WHAT THE PARTITION COST. here was declared as one state and claimed those
	// rows first, so a group for that state below it could never draw anything:
	// three rows under here, no group for the state, and no way to have both.
	// The rows a query matches are still grouped below by their bucket.
	ask := func(e *Expr) ([]Row, error) {
		var mine []Row
		for _, r := range kept {
			ok, err := truthy(e, r)
			if err != nil {
				return nil, err
			}
			if ok {
				mine = append(mine, r)
			}
		}
		return mine, nil
	}

	// A GROUP THE DATA MADE, PINNED WITH ITS OWN FILTER, IS STILL A QUERY. It
	// asks the same way, and the grouping below draws the row as well.
	take := ask

	// THE FILE'S ORDER DECIDES WHO TAKES A ROW, AND A PIN DOES NOT.
	//
	// A pin moves a group to the top of the drawing. It must not move it to the
	// front of the partition, because the owner wrote the order and a person
	// clicking a pin is not rewriting it.
	//
	// Getting this wrong hid a group forever. yours is a subset of here, and
	// here is declared second, so unpinning yours let here take every row yours
	// would have had. It then had none, and none is what hides it.
	pinned := map[string]Group{}
	var declared []Group
	for _, p := range v.Groups {
		mine, err := take(p.Filter)
		if err != nil {
			return t, err
		}
		g := Group{Name: p.Name, Declared: true, Count: len(mine), Lines: lines(mine, t.Columns)}
		if pinnedByName(v.Pinned, p.Name) {
			g.Pinned = true
			pinned[p.Name] = g
			continue
		}
		if len(mine) == 0 {
			continue
		}
		declared = append(declared, g)
	}

	// A GROUP THE DATA MADE, PINNED WITH ITS OWN FILTER. It takes what the
	// declared ones left, and it is drawn only while it holds a row.
	for _, p := range v.Pinned {
		if p.Filter == nil {
			continue
		}
		mine, err := take(p.Filter)
		if err != nil {
			return t, err
		}
		if len(mine) == 0 {
			continue
		}
		pinned[p.Name] = Group{Name: p.Name, Pinned: true,
			Count: len(mine), Lines: lines(mine, t.Columns)}
	}

	// THE PINS DRAW IN THE ORDER THEY WERE PINNED, which is the person's, and
	// a pin naming a group nothing declared and nothing matched draws nothing.
	for _, p := range v.Pinned {
		g, ok := pinned[p.Name]
		if !ok {
			if p.Filter == nil {
				return t, fmt.Errorf("view %q pins %q with no filter", v.Name, p.Name)
			}
			continue
		}
		t.Pinned = append(t.Pinned, g)
	}

	for _, l := range v.Group {
		t.Group = append(t.Group, LevelSaid{Property: l.Text, Direction: dirOf(l.Descending), Sets: l.Sets})
	}
	for _, sr := range v.Sort {
		t.Sorted = append(t.Sorted, LevelSaid{Property: sr.Property, Direction: dirOf(sr.Descending)})
	}
	t.Props = propertyInventory(kept, t.Columns)
	t.Filters = FilterGroups(v.RawFilter)
	t.Operators = Operators

	t.Groups, err = group(rest, v, t.Columns, 0)
	// The declared groups come first, in the order the file declared them.
	t.Groups = append(declared, t.Groups...)
	nest(&t)
	return t, err
}

// nest puts every row that names a parent on the page under that parent.
//
// IT RUNS OVER THE WHOLE TABLE, after the partition. A child and its parent can
// land in different groups, and a child that matches a pin would otherwise be
// drawn under the pin and under its parent both.
//
// A CHILD WHOSE PARENT IS NOT HERE STAYS WHERE IT IS. A filter or a page can
// leave the parent out, and a row that vanishes because its parent did is a row
// nobody can find.
func nest(t *Table) {
	at := map[string]*Line{}
	var find func(ls []Line)
	find = func(ls []Line) {
		for i := range ls {
			at[ls[i].ID] = &ls[i]
			find(ls[i].Under)
		}
	}
	for i := range t.Pinned {
		find(t.Pinned[i].Lines)
	}
	for i := range t.Groups {
		find(t.Groups[i].Lines)
	}
	if len(at) == 0 {
		return
	}

	// WHOSE CHILD IS WHOSE, decided before anything moves, so a parent that is
	// itself a child still collects its own.
	under := map[string][]Line{}
	taken := map[string]bool{}
	for id, l := range at {
		p := strings.TrimSpace(l.Parent)
		if p == "" || p == id || at[p] == nil {
			continue
		}
		under[p] = append(under[p], *l)
		taken[id] = true
	}
	if len(taken) == 0 {
		return
	}

	var attach func(l *Line, depth int)
	attach = func(l *Line, depth int) {
		l.Depth = depth
		l.Under = under[l.ID]
		for i := range l.Under {
			attach(&l.Under[i], depth+1)
		}
	}
	keep := func(ls []Line) []Line {
		var out []Line
		for _, l := range ls {
			if taken[l.ID] {
				continue
			}
			attach(&l, 0)
			out = append(out, l)
		}
		return out
	}
	for i := range t.Pinned {
		t.Pinned[i].Lines = keep(t.Pinned[i].Lines)
		t.Pinned[i].Count = rowsDrawn(t.Pinned[i].Lines)
	}
	for i := range t.Groups {
		t.Groups[i].Lines = keep(t.Groups[i].Lines)
		t.Groups[i].Count = rowsDrawn(t.Groups[i].Lines)
	}
}

// EVERY LINE IN THE SUBTREE, BECAUSE A NESTED CHILD IS A ROW A PERSON CAN SEE.
//
// This was len(Lines), taken after nesting had dropped every child whose parent
// is on the same page, so the count answered the TOP LEVEL where Total answers
// the TOKENS. The two agreed until somebody minted a sub-token of an open
// parent, and then the sentence on the rule, that the buckets below add to this
// number, stopped being true with nothing saying so.
//
// THE TOTAL IS THE ONE THAT WAS RIGHT. It is the number the page uses to say how
// many tokens there are, and a number that hides work is worse than one that has
// to walk a subtree.
func rowsDrawn(ls []Line) int {
	n := 0
	for _, l := range ls {
		n += 1 + rowsDrawn(l.Under)
	}
	return n
}

func pinnedByName(pins []Pin, name string) bool {
	for _, p := range pins {
		if p.Filter == nil && p.Name == name {
			return true
		}
	}
	return false
}

func dirOf(desc bool) string {
	if desc {
		return "DESC"
	}
	return "ASC"
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
		// AN EMPTY KEY PINS LIKE ANY OTHER. It is usually the biggest group on
		// the page, and it was the one group a person could not pin. The
		// expression is the same one, and the engine reads holder == "" back.
		g.Pins = level.Text + " == " + strconv.Quote(key)
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
		l := Line{ID: r["id"].Text(), Parent: r["parent"].Text(), Cells: map[string]Cell{}}
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
