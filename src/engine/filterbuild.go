package main

import (
	"fmt"
	"quackitect/engine/internal/yaml"
	"regexp"
	"slices"
	"strconv"
	"strings"
)

// THE FILTER BUILDER'S VOCABULARY.
//
// Ported from v3's bases.ts:240-263. The operator list is the engine's, and it
// is serialised to the panel rather than declared there a second time: a client
// with its own copy drifts the first time an operator is added.
//
// GROUPS ARE ANDED, ROWS INSIDE A GROUP ARE ORED. That is the whole shape a
// person builds, and anything they wrote that this cannot draw is kept exactly
// as written rather than rewritten into something it can.

type Operator struct {
	ID    string   `json:"id"`
	Label string   `json:"label"`
	Types []string `json:"types,omitempty"` // empty means every type
	Takes bool     `json:"takes"`           // whether it takes a value
	build func(prop, value string) string
}

var Operators = []Operator{
	{ID: "is", Label: "is", Takes: true,
		build: func(p, v string) string { return p + " == " + strconv.Quote(v) }},
	{ID: "isNot", Label: "is not", Takes: true,
		build: func(p, v string) string { return p + " != " + strconv.Quote(v) }},
	{ID: "contains", Label: "contains", Types: []string{"string", "list"}, Takes: true,
		build: func(p, v string) string { return p + ".contains(" + strconv.Quote(v) + ")" }},
	{ID: "notContains", Label: "does not contain", Types: []string{"string", "list"}, Takes: true,
		build: func(p, v string) string { return "!" + p + ".contains(" + strconv.Quote(v) + ")" }},
	{ID: "startsWith", Label: "starts with", Types: []string{"string"}, Takes: true,
		build: func(p, v string) string { return p + ".startsWith(" + strconv.Quote(v) + ")" }},
	{ID: "endsWith", Label: "ends with", Types: []string{"string"}, Takes: true,
		build: func(p, v string) string { return p + ".endsWith(" + strconv.Quote(v) + ")" }},
	{ID: "isEmpty", Label: "is empty",
		build: func(p, _ string) string { return p + ".isEmpty()" }},
	{ID: "isNotEmpty", Label: "is not empty",
		build: func(p, _ string) string { return "!" + p + ".isEmpty()" }},
	{ID: "gt", Label: "is greater than", Types: []string{"number"}, Takes: true,
		build: func(p, v string) string { return p + " > " + v }},
	{ID: "lt", Label: "is less than", Types: []string{"number"}, Takes: true,
		build: func(p, v string) string { return p + " < " + v }},
	{ID: "gte", Label: "is at least", Types: []string{"number"}, Takes: true,
		build: func(p, v string) string { return p + " >= " + v }},
	{ID: "lte", Label: "is at most", Types: []string{"number"}, Takes: true,
		build: func(p, v string) string { return p + " <= " + v }},
}

// A row a person built. It compiles to one expression, and that expression is
// the only thing ever written to the file.
type FilterRow struct {
	Property string `json:"property"`
	Operator string `json:"operator"`
	Value    string `json:"value,omitempty"`
}

// A group of rows, or something written by hand that this cannot draw.
type FilterGroup struct {
	Rows []FilterRow `json:"rows"`
	Raw  string      `json:"raw,omitempty"`
}

func ToExpression(row FilterRow) (string, error) {
	for _, o := range Operators {
		if o.ID != row.Operator {
			continue
		}
		if row.Property == "" {
			return "", fmt.Errorf("a condition needs a property")
		}
		// AN EMPTY VALUE BOX IS AN UNFINISHED ROW, never a test for the empty
		// string. Writing it would empty the table.
		if o.Takes && strings.TrimSpace(row.Value) == "" {
			return "", fmt.Errorf("the condition on %s is unfinished", row.Property)
		}
		return o.build(row.Property, row.Value), nil
	}
	return "", fmt.Errorf("this program does not know the operator %q", row.Operator)
}

// FilterExpression turns what a person built into one statement. Groups are
// anded and the rows inside a group are ored.
func FilterExpression(groups []FilterGroup) (string, error) {
	var ands []string
	for _, g := range groups {
		if g.Raw != "" {
			ands = append(ands, "("+g.Raw+")")
			continue
		}
		var ors []string
		for _, r := range g.Rows {
			if r.Property == "" && r.Operator == "" {
				continue // a blank row is a row nobody filled in
			}
			e, err := ToExpression(r)
			if err != nil {
				return "", err
			}
			ors = append(ors, e)
		}
		switch len(ors) {
		case 0:
		case 1:
			ands = append(ands, ors[0])
		default:
			ands = append(ands, "("+strings.Join(ors, " || ")+")")
		}
	}
	return strings.Join(ands, " && "), nil
}

// ---------------------------------------------------------------------------
// Reading one back, so a filter somebody wrote can be shown as rows
// ---------------------------------------------------------------------------

var (
	// A VALUE IS ONE LITERAL: a quoted string, or a bare word with no space and
	// no quote in it. It was written as anything up to the end of the line, and
	// then `status == "open" && assignee == "main"` read back as one comparison
	// whose value was `open" && assignee == "main`. The page redrew its builder
	// from that, and one touch wrote the value back quoted and escaped, so the
	// pane answered nothing.
	//
	// NARROWING THE READER IS THE WHOLE FIX. One unreadable row already makes
	// the group raw, which is what a person who wrote a compound line by hand
	// wants: it is left exactly as they typed it.
	reCompare = regexp.MustCompile(`^\s*([A-Za-z_][\w.\-]*)\s*(==|!=|>=|<=|>|<)\s*("(?:[^"\\]|\\.)*"|[^\s"]+)\s*$`)
	reMethod  = regexp.MustCompile(`^\s*(!?)\s*([A-Za-z_][\w.\-]*)\.(\w+)\((.*)\)\s*$`)
)

// FromExpression reads one statement back into a row, or says it cannot.
//
// ONE UNREADABLE ROW MAKES THE WHOLE GROUP RAW. Drawing the rest as a form
// would lose the one it could not draw on the next write.
func FromExpression(src string) (FilterRow, bool) {
	if m := reMethod.FindStringSubmatch(src); m != nil {
		not, prop, method, arg := m[1] == "!", m[2], m[3], strings.TrimSpace(m[4])
		val := unquoteValue(arg)
		switch {
		case method == "isEmpty" && arg == "":
			if not {
				return FilterRow{Property: prop, Operator: "isNotEmpty"}, true
			}
			return FilterRow{Property: prop, Operator: "isEmpty"}, true
		case method == "contains":
			id := "contains"
			if not {
				id = "notContains"
			}
			return FilterRow{Property: prop, Operator: id, Value: val}, true
		case method == "startsWith" && !not:
			return FilterRow{Property: prop, Operator: "startsWith", Value: val}, true
		case method == "endsWith" && !not:
			return FilterRow{Property: prop, Operator: "endsWith", Value: val}, true
		}
		return FilterRow{}, false
	}
	if m := reCompare.FindStringSubmatch(src); m != nil {
		byOp := map[string]string{"==": "is", "!=": "isNot", ">": "gt", "<": "lt", ">=": "gte", "<=": "lte"}
		id, ok := byOp[m[2]]
		if !ok {
			return FilterRow{}, false
		}
		return FilterRow{Property: m[1], Operator: id, Value: unquoteValue(m[3])}, true
	}
	return FilterRow{}, false
}

func unquoteValue(s string) string {
	s = strings.TrimSpace(s)
	if len(s) >= 2 && (s[0] == '"' || s[0] == '\'') && s[len(s)-1] == s[0] {
		if s[0] == '"' {
			if out, err := strconv.Unquote(s); err == nil {
				return out
			}
		}
		return s[1 : len(s)-1]
	}
	return s
}

// FilterGroups turns what is in the file into what the builder draws. An empty
// filter still gives one empty group, because a builder with nothing to clone
// has an Add button that does nothing at all.
func FilterGroups(raw any) []FilterGroup {
	out := readGroups(raw)
	if len(out) == 0 {
		return []FilterGroup{{}}
	}
	return out
}

func readGroups(raw any) []FilterGroup {
	switch t := raw.(type) {
	case nil:
		return nil
	case []any:
		var out []FilterGroup
		for _, k := range t {
			out = append(out, groupOf(k))
		}
		return out
	case map[string]any:
		if and, ok := t["and"]; ok && len(t) == 1 {
			var out []FilterGroup
			for _, k := range yaml.List(and) {
				out = append(out, groupOf(k))
			}
			return out
		}
		return []FilterGroup{groupOf(t)}
	case string:
		return []FilterGroup{groupOf(t)}
	}
	return nil
}

func groupOf(node any) FilterGroup {
	switch t := node.(type) {
	case string:
		if row, ok := FromExpression(t); ok {
			return FilterGroup{Rows: []FilterRow{row}}
		}
		return FilterGroup{Raw: t}
	case map[string]any:
		if or, ok := t["or"]; ok && len(t) == 1 {
			var rows []FilterRow
			for _, k := range yaml.List(or) {
				s, isText := k.(string)
				if !isText {
					return FilterGroup{Raw: fmt.Sprint(node)}
				}
				row, ok := FromExpression(s)
				if !ok {
					return FilterGroup{Raw: fmt.Sprint(node)}
				}
				rows = append(rows, row)
			}
			return FilterGroup{Rows: rows}
		}
	}
	return FilterGroup{Raw: fmt.Sprint(node)}
}

// OperatorsFor is what a property of this type is offered. An empty type is
// offered the ones that suit anything.
//
// AN OPERATOR ALREADY IN THE FILE IS OFFERED even where the type would not
// offer it. The type is inferred from the data, so it can be wrong, and
// dropping the stored operator would rewrite the filter the next time an
// unrelated row moved.
func OperatorsFor(kind, keep string) []Operator {
	var out []Operator
	held := false
	for _, o := range Operators {
		if len(o.Types) == 0 || (kind != "" && slices.Contains(o.Types, kind)) {
			out = append(out, o)
			held = held || o.ID == keep
		}
	}
	if keep != "" && !held {
		for _, o := range Operators {
			if o.ID == keep {
				out = append(out, o)
			}
		}
	}
	return out
}
