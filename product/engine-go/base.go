package main

// design: go-base-eval  implements: req-base-views
// The pinned-subset Obsidian-Bases evaluator. The authoring surface is standard Bases YAML
// (obsidian.md/help/bases/syntax) so the owner previews queries live in Obsidian; the engine
// is the authoritative evaluator. The subset is PINNED and fails loudly: top-level keys
// filters/views only; view type table only; filter trees of and/or/not over expression
// strings; comparisons, boolean operators, property refs (bare, note.x, file.name, one-level
// map entries), the file predicates hasLink/inFolder/hasTag, and <list>.contains(). order,
// sort (property+direction, id tie-break), limit, groupBy (multi-valued properties fan out,
// count per group). Volatile functions (now, today) refuse by name - byte-identical
// regeneration is the contract (req-book-identity). Everything else: "out-of-subset" error
// naming the construct. Growth only on template demand (adr lineage: the coverage board
// brought groupBy+count).

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strconv"
	"strings"
)

// ---- generic property bag (evaluation context per note) ----

type baseProps struct {
	scalars map[string]string
	lists   map[string][]string
	maps    map[string]map[string]string
	id      string
	path    string
	body    string
}

// basePropsOf reads a node file into the generic bag the expressions resolve against.
func basePropsOf(path string) baseProps {
	p := baseProps{scalars: map[string]string{}, lists: map[string][]string{}, maps: map[string]map[string]string{}, path: path}
	raw, _ := os.ReadFile(path)
	txt := strings.ReplaceAll(strings.TrimPrefix(string(raw), string(rune(0xFEFF))), "\r\n", "\n")
	parts := strings.SplitN(txt, "---", 3)
	fm, body := "", txt
	if len(parts) >= 3 && strings.TrimSpace(parts[0]) == "" {
		fm, body = parts[1], parts[2]
	}
	p.body = body
	p.id = strings.TrimSuffix(filepath.Base(path), ".md")
	cur := ""
	for _, line := range strings.Split(fm, "\n") {
		if !strings.Contains(line, ":") {
			continue
		}
		indented := len(line) > 0 && (line[0] == ' ' || line[0] == '\t')
		kv := strings.SplitN(line, ":", 2)
		k, v := strings.TrimSpace(kv[0]), strings.TrimSpace(kv[1])
		if indented && cur != "" {
			if v != "" {
				if p.maps[cur] == nil {
					p.maps[cur] = map[string]string{}
				}
				p.maps[cur][k] = v
			}
			continue
		}
		if v == "" {
			cur = k
			continue
		}
		cur = ""
		if k == "id" && v != "" {
			p.id = v
		}
		if strings.HasPrefix(v, "[") {
			p.lists[k] = splitIDs(v)
		} else {
			p.scalars[k] = strings.Trim(v, `"`)
		}
	}
	return p
}

// ---- YAML subset parser (maps, lists, scalars; 2+-space indentation) ----

type yNode struct {
	scalar string
	list   []*yNode
	m      map[string]*yNode
	order  []string // map key order, kept for determinism
}

// yUnquote strips ONE matching outer quote pair - never inner quotes (a Trim cutset
// would eat the closing quote of a quoted expression string).
func yUnquote(s string) string {
	if len(s) >= 2 && ((s[0] == 0x27 && s[len(s)-1] == 0x27) || (s[0] == '"' && s[len(s)-1] == '"')) {
		return s[1 : len(s)-1]
	}
	return s
}

func yamlIndent(l string) int {
	n := 0
	for n < len(l) && l[n] == ' ' {
		n++
	}
	return n
}

// parseYAMLSubset parses the trivial YAML the base blocks use. Hand-rolled, zero-dep.
func parseYAMLSubset(lines []string, i int, indent int) (*yNode, int, error) {
	var node *yNode
	for i < len(lines) {
		l := lines[i]
		if strings.TrimSpace(l) == "" || strings.HasPrefix(strings.TrimSpace(l), "#") {
			i++
			continue
		}
		ind := yamlIndent(l)
		if ind < indent {
			break
		}
		if ind > indent {
			return nil, i, fmt.Errorf("base: unexpected indentation at %q", strings.TrimSpace(l))
		}
		t := strings.TrimSpace(l)
		if strings.HasPrefix(t, "- ") || t == "-" {
			if node == nil {
				node = &yNode{}
			}
			if node.m != nil {
				return nil, i, fmt.Errorf("base: list item mixed into a map at %q", t)
			}
			rest := strings.TrimSpace(strings.TrimPrefix(t, "-"))
			if rest == "" { // nested block item
				child, ni, err := parseYAMLSubset(lines, i+1, indent+2)
				if err != nil {
					return nil, ni, err
				}
				node.list = append(node.list, child)
				i = ni
				continue
			}
			if strings.Contains(rest, ":") && !strings.HasPrefix(rest, "'") && !strings.HasPrefix(rest, `"`) {
				// inline map item: "- property: weight" (+ following deeper lines)
				sub := []string{strings.Repeat(" ", indent+2) + rest}
				j := i + 1
				for j < len(lines) && (strings.TrimSpace(lines[j]) == "" || yamlIndent(lines[j]) > indent) {
					sub = append(sub, lines[j])
					j++
				}
				child, _, err := parseYAMLSubset(sub, 0, indent+2)
				if err != nil {
					return nil, j, err
				}
				node.list = append(node.list, child)
				i = j
				continue
			}
			node.list = append(node.list, &yNode{scalar: yUnquote(rest)})
			i++
			continue
		}
		kv := strings.SplitN(t, ":", 2)
		if len(kv) < 2 {
			return nil, i, fmt.Errorf("base: not a key: value line: %q", t)
		}
		k, v := strings.TrimSpace(kv[0]), strings.TrimSpace(kv[1])
		if node == nil {
			node = &yNode{}
		}
		if node.list != nil {
			return nil, i, fmt.Errorf("base: map key mixed into a list at %q", t)
		}
		if node.m == nil {
			node.m = map[string]*yNode{}
		}
		if v == "" {
			child, ni, err := parseYAMLSubset(lines, i+1, indent+2)
			if err != nil {
				return nil, ni, err
			}
			if child == nil {
				child = &yNode{}
			}
			node.m[k] = child
			node.order = append(node.order, k)
			i = ni
			continue
		}
		if strings.HasPrefix(v, "[") && strings.HasSuffix(v, "]") {
			ln := &yNode{}
			for _, e := range splitIDs(v) {
				ln.list = append(ln.list, &yNode{scalar: yUnquote(e)})
			}
			node.m[k] = ln
		} else {
			node.m[k] = &yNode{scalar: yUnquote(v)}
		}
		node.order = append(node.order, k)
		i++
	}
	return node, i, nil
}

// ---- the pinned base definition ----

type baseSort struct {
	prop string
	desc bool
}

type baseView struct {
	name    string
	order   []string
	sorts   []baseSort
	limit   int
	groupBy string
	filter  *baseFilter
}

type baseFilter struct {
	op    string // "and" | "or" | "not" | "" (leaf)
	kids  []*baseFilter
	expr  string
}

type baseDef struct {
	filter *baseFilter
	views  []baseView
}

func parseBaseFilter(n *yNode) (*baseFilter, error) {
	if n == nil {
		return nil, nil
	}
	if n.scalar != "" {
		return &baseFilter{expr: n.scalar}, nil
	}
	if n.m != nil {
		if len(n.order) != 1 {
			return nil, fmt.Errorf("base: a filter object carries exactly one of and/or/not")
		}
		op := n.order[0]
		if op != "and" && op != "or" && op != "not" {
			return nil, fmt.Errorf("base: out-of-subset filter operator %q", op)
		}
		f := &baseFilter{op: op}
		for _, kid := range n.m[op].list {
			k, err := parseBaseFilter(kid)
			if err != nil {
				return nil, err
			}
			f.kids = append(f.kids, k)
		}
		return f, nil
	}
	return nil, fmt.Errorf("base: malformed filter")
}

// ParseBase parses one base block's text into the pinned definition. Fails loudly.
func ParseBase(text string) (*baseDef, error) {
	root, _, err := parseYAMLSubset(strings.Split(strings.ReplaceAll(text, "\r\n", "\n"), "\n"), 0, 0)
	if err != nil {
		return nil, err
	}
	if root == nil || root.m == nil {
		return nil, fmt.Errorf("base: empty block")
	}
	def := &baseDef{}
	for _, k := range root.order {
		switch k {
		case "filters":
			f, err := parseBaseFilter(root.m[k])
			if err != nil {
				return nil, err
			}
			def.filter = f
		case "views":
			for _, v := range root.m[k].list {
				if v.m == nil {
					return nil, fmt.Errorf("base: a view must be a map")
				}
				bv := baseView{limit: -1}
				for _, vk := range v.order {
					val := v.m[vk]
					switch vk {
					case "type":
						if val.scalar != "table" {
							return nil, fmt.Errorf("base: out-of-subset view type %q (table only)", val.scalar)
						}
					case "name":
						bv.name = val.scalar
					case "order":
						for _, o := range val.list {
							bv.order = append(bv.order, o.scalar)
						}
					case "limit":
						n, err := strconv.Atoi(val.scalar)
						if err != nil {
							return nil, fmt.Errorf("base: limit is not a number: %q", val.scalar)
						}
						bv.limit = n
					case "sort":
						for _, s := range val.list {
							if s.m == nil {
								return nil, fmt.Errorf("base: a sort entry is a map of property/direction")
							}
							bs := baseSort{}
							if p, ok := s.m["property"]; ok {
								bs.prop = p.scalar
							}
							if d, ok := s.m["direction"]; ok {
								bs.desc = strings.EqualFold(d.scalar, "DESC")
							}
							bv.sorts = append(bv.sorts, bs)
						}
					case "groupBy":
						if val.scalar != "" {
							bv.groupBy = val.scalar
						} else if val.m != nil {
							if p, ok := val.m["property"]; ok {
								bv.groupBy = p.scalar
							}
						}
					case "filters":
						f, err := parseBaseFilter(val)
						if err != nil {
							return nil, err
						}
						bv.filter = f
					default:
						return nil, fmt.Errorf("base: out-of-subset view key %q", vk)
					}
				}
				def.views = append(def.views, bv)
			}
		default:
			return nil, fmt.Errorf("base: out-of-subset top-level key %q", k)
		}
	}
	if len(def.views) == 0 {
		return nil, fmt.Errorf("base: no views defined")
	}
	return def, nil
}

// ---- expression evaluation (the pinned language) ----

var baseVolatile = map[string]bool{"now": true, "today": true, "date": true}

type baseTok struct {
	kind string // ident num str op
	s    string
}

func baseLex(s string) ([]baseTok, error) {
	var out []baseTok
	i := 0
	for i < len(s) {
		c := s[i]
		switch {
		case c == ' ' || c == '\t':
			i++
		case c == '"' || c == '\'':
			q := c
			j := i + 1
			for j < len(s) && s[j] != q {
				j++
			}
			if j >= len(s) {
				return nil, fmt.Errorf("base: unterminated string in %q", s)
			}
			out = append(out, baseTok{"str", s[i+1 : j]})
			i = j + 1
		case c >= '0' && c <= '9':
			j := i
			for j < len(s) && (s[j] >= '0' && s[j] <= '9' || s[j] == '.') {
				j++
			}
			out = append(out, baseTok{"num", s[i:j]})
			i = j
		case c == '(' || c == ')' || c == ',':
			out = append(out, baseTok{"op", string(c)})
			i++
		case strings.HasPrefix(s[i:], "==") || strings.HasPrefix(s[i:], "!=") ||
			strings.HasPrefix(s[i:], ">=") || strings.HasPrefix(s[i:], "<=") ||
			strings.HasPrefix(s[i:], "&&") || strings.HasPrefix(s[i:], "||"):
			out = append(out, baseTok{"op", s[i : i+2]})
			i += 2
		case c == '>' || c == '<' || c == '!':
			out = append(out, baseTok{"op", string(c)})
			i++
		default:
			re := regexp.MustCompile(`^[A-Za-z_][A-Za-z0-9_.-]*`)
			m := re.FindString(s[i:])
			if m == "" {
				return nil, fmt.Errorf("base: out-of-subset character %q in %q", string(c), s)
			}
			out = append(out, baseTok{"ident", m})
			i += len(m)
		}
	}
	return out, nil
}

type baseEvalCtx struct {
	p     baseProps
	nodes map[string]Node
}

type baseParser struct {
	toks []baseTok
	pos  int
	ctx  baseEvalCtx
}

func (bp *baseParser) peek() baseTok {
	if bp.pos < len(bp.toks) {
		return bp.toks[bp.pos]
	}
	return baseTok{"end", ""}
}
func (bp *baseParser) take() baseTok { t := bp.peek(); bp.pos++; return t }

func baseTruthy(v string) bool { return v != "" && v != "false" && v != "0" }

func baseCmp(a, b string) int {
	fa, ea := strconv.ParseFloat(a, 64)
	fb, eb := strconv.ParseFloat(b, 64)
	if ea == nil && eb == nil {
		switch {
		case fa < fb:
			return -1
		case fa > fb:
			return 1
		}
		return 0
	}
	return strings.Compare(a, b)
}

func (bp *baseParser) parseOr() (string, error) {
	v, err := bp.parseAnd()
	if err != nil {
		return "", err
	}
	for bp.peek().s == "||" {
		bp.take()
		r, err := bp.parseAnd()
		if err != nil {
			return "", err
		}
		v = strconv.FormatBool(baseTruthy(v) || baseTruthy(r))
	}
	return v, nil
}

func (bp *baseParser) parseAnd() (string, error) {
	v, err := bp.parseCmp()
	if err != nil {
		return "", err
	}
	for bp.peek().s == "&&" {
		bp.take()
		r, err := bp.parseCmp()
		if err != nil {
			return "", err
		}
		v = strconv.FormatBool(baseTruthy(v) && baseTruthy(r))
	}
	return v, nil
}

func (bp *baseParser) parseCmp() (string, error) {
	v, err := bp.parsePrimary()
	if err != nil {
		return "", err
	}
	t := bp.peek()
	if t.kind == "op" && (t.s == "==" || t.s == "!=" || t.s == ">" || t.s == "<" || t.s == ">=" || t.s == "<=") {
		bp.take()
		r, err := bp.parsePrimary()
		if err != nil {
			return "", err
		}
		c := baseCmp(v, r)
		res := false
		switch t.s {
		case "==":
			res = c == 0
		case "!=":
			res = c != 0
		case ">":
			res = c > 0
		case "<":
			res = c < 0
		case ">=":
			res = c >= 0
		case "<=":
			res = c <= 0
		}
		return strconv.FormatBool(res), nil
	}
	return v, nil
}

func (bp *baseParser) parsePrimary() (string, error) {
	t := bp.take()
	switch {
	case t.s == "!":
		v, err := bp.parsePrimary()
		if err != nil {
			return "", err
		}
		return strconv.FormatBool(!baseTruthy(v)), nil
	case t.s == "(":
		v, err := bp.parseOr()
		if err != nil {
			return "", err
		}
		if bp.take().s != ")" {
			return "", fmt.Errorf("base: missing closing parenthesis")
		}
		return v, nil
	case t.kind == "str" || t.kind == "num":
		return t.s, nil
	case t.kind == "ident":
		if bp.peek().s == "(" {
			return bp.parseCall(t.s)
		}
		if t.s == "true" || t.s == "false" {
			return t.s, nil
		}
		return bp.resolve(t.s), nil
	}
	return "", fmt.Errorf("base: out-of-subset token %q", t.s)
}

func (bp *baseParser) parseCall(name string) (string, error) {
	bp.take() // (
	var args []string
	for bp.peek().s != ")" {
		a, err := bp.parseOr()
		if err != nil {
			return "", err
		}
		args = append(args, a)
		if bp.peek().s == "," {
			bp.take()
		}
	}
	bp.take() // )
	short := name[strings.LastIndex(name, ".")+1:]
	if baseVolatile[short] {
		return "", fmt.Errorf("base: volatile function %q refused (byte-identical regeneration)", short)
	}
	switch {
	case name == "file.hasLink" && len(args) == 1:
		return strconv.FormatBool(bp.hasLink(args[0])), nil
	case name == "file.inFolder" && len(args) == 1:
		return strconv.FormatBool(strings.Contains(filepath.ToSlash(bp.ctx.p.path), args[0]+"/")), nil
	case name == "file.hasTag" && len(args) == 1:
		for _, tg := range bp.ctx.p.lists["tags"] {
			if tg == args[0] {
				return "true", nil
			}
		}
		return "false", nil
	case strings.HasSuffix(name, ".contains") && len(args) == 1:
		prop := strings.TrimSuffix(name, ".contains")
		prop = strings.TrimPrefix(prop, "note.")
		for _, e := range bp.ctx.p.lists[prop] {
			if e == args[0] {
				return "true", nil
			}
		}
		return strconv.FormatBool(strings.Contains(bp.ctx.p.scalars[prop], args[0])), nil
	}
	return "", fmt.Errorf("base: out-of-subset function %q", name)
}

func (bp *baseParser) hasLink(target string) bool {
	for _, l := range bp.ctx.p.lists {
		for _, e := range l {
			if e == target {
				return true
			}
		}
	}
	for _, v := range bp.ctx.p.scalars {
		if v == target {
			return true
		}
	}
	return strings.Contains(bp.ctx.p.body, "]("+target) || strings.Contains(bp.ctx.p.body, "]("+target+".md") ||
		strings.Contains(bp.ctx.p.body, "[["+target)
}

func (bp *baseParser) resolve(name string) string {
	n := strings.TrimPrefix(name, "note.")
	switch n {
	case "file.name":
		return bp.ctx.p.id
	case "file.folder":
		return filepath.ToSlash(filepath.Dir(bp.ctx.p.path))
	}
	if strings.Contains(n, ".") { // one-level map entry: ratings.crit-speed
		kv := strings.SplitN(n, ".", 2)
		if m, ok := bp.ctx.p.maps[kv[0]]; ok {
			return m[kv[1]]
		}
	}
	if v, ok := bp.ctx.p.scalars[n]; ok {
		return v
	}
	if l, ok := bp.ctx.p.lists[n]; ok {
		return strings.Join(l, ", ")
	}
	return ""
}

func baseEvalExpr(expr string, ctx baseEvalCtx) (string, error) {
	toks, err := baseLex(expr)
	if err != nil {
		return "", err
	}
	bp := &baseParser{toks: toks, ctx: ctx}
	v, err := bp.parseOr()
	if err != nil {
		return "", err
	}
	if bp.peek().kind != "end" {
		return "", fmt.Errorf("base: trailing tokens in %q", expr)
	}
	return v, nil
}

func baseEvalFilter(f *baseFilter, ctx baseEvalCtx) (bool, error) {
	if f == nil {
		return true, nil
	}
	if f.op == "" {
		v, err := baseEvalExpr(f.expr, ctx)
		return baseTruthy(v), err
	}
	switch f.op {
	case "and":
		for _, k := range f.kids {
			ok, err := baseEvalFilter(k, ctx)
			if err != nil || !ok {
				return false, err
			}
		}
		return true, nil
	case "or":
		for _, k := range f.kids {
			ok, err := baseEvalFilter(k, ctx)
			if err != nil {
				return false, err
			}
			if ok {
				return true, nil
			}
		}
		return false, nil
	case "not":
		for _, k := range f.kids {
			ok, err := baseEvalFilter(k, ctx)
			if err != nil {
				return false, err
			}
			if ok {
				return false, nil
			}
		}
		return true, nil
	}
	return false, fmt.Errorf("base: out-of-subset filter operator %q", f.op)
}

// ---- evaluation result ----

type BaseRow struct {
	ID     string
	Cells  []string
	Facets []string // f-<facet>-<value> classes for the board's CSS filter (go-facet-board)
}

type BaseGroup struct {
	Key   string
	Count int
	Rows  []BaseRow
}

type BaseResult struct {
	Name    string
	Columns []string
	Groups  []BaseGroup
}

// EvalBase evaluates a base block over the given note files, deterministically.
func EvalBase(text string, paths []string, nodes map[string]Node) ([]BaseResult, error) {
	def, err := ParseBase(text)
	if err != nil {
		return nil, err
	}
	sorted := append([]string{}, paths...)
	sort.Strings(sorted)
	var results []BaseResult
	for _, view := range def.views {
		var rows []struct {
			p baseProps
		}
		for _, path := range sorted {
			p := basePropsOf(path)
			ctx := baseEvalCtx{p: p, nodes: nodes}
			ok, err := baseEvalFilter(def.filter, ctx)
			if err != nil {
				return nil, err
			}
			if !ok {
				continue
			}
			ok, err = baseEvalFilter(view.filter, ctx)
			if err != nil {
				return nil, err
			}
			if !ok {
				continue
			}
			rows = append(rows, struct{ p baseProps }{p})
		}
		// sort: declared specs first, id tie-break
		sort.SliceStable(rows, func(a, b int) bool {
			for _, s := range view.sorts {
				ctxA := baseEvalCtx{p: rows[a].p, nodes: nodes}
				ctxB := baseEvalCtx{p: rows[b].p, nodes: nodes}
				va := (&baseParser{ctx: ctxA}).resolve(s.prop)
				vb := (&baseParser{ctx: ctxB}).resolve(s.prop)
				c := baseCmp(va, vb)
				if c != 0 {
					if s.desc {
						return c > 0
					}
					return c < 0
				}
			}
			return rows[a].p.id < rows[b].p.id
		})
		if view.limit >= 0 && len(rows) > view.limit {
			rows = rows[:view.limit]
		}
		cols := view.order
		if len(cols) == 0 {
			cols = []string{"file.name"}
		}
		mkRow := func(p baseProps) BaseRow {
			r := BaseRow{ID: p.id}
			for _, c := range cols {
				r.Cells = append(r.Cells, (&baseParser{ctx: baseEvalCtx{p: p, nodes: nodes}}).resolve(c))
			}
			for _, f := range facetNames { // filter hooks for the coverage board
				for _, v := range p.lists[f] {
					r.Facets = append(r.Facets, "f-"+f+"-"+v)
				}
			}
			return r
		}
		res := BaseResult{Name: view.name, Columns: cols}
		if view.groupBy == "" {
			g := BaseGroup{Key: "", Count: len(rows)}
			for _, r := range rows {
				g.Rows = append(g.Rows, mkRow(r.p))
			}
			res.Groups = append(res.Groups, g)
		} else {
			prop := strings.TrimPrefix(view.groupBy, "note.")
			groups := map[string]*BaseGroup{}
			var keys []string
			add := func(key string, p baseProps) {
				if key == "" {
					key = "(none)"
				}
				g, ok := groups[key]
				if !ok {
					g = &BaseGroup{Key: key}
					groups[key] = g
					keys = append(keys, key)
				}
				g.Count++
				g.Rows = append(g.Rows, mkRow(p))
			}
			for _, r := range rows {
				if l, ok := r.p.lists[prop]; ok && len(l) > 0 {
					for _, v := range l { // multi-valued: the row counts in every group it carries
						add(v, r.p)
					}
				} else {
					add(r.p.scalars[prop], r.p)
				}
			}
			sort.Strings(keys)
			for _, k := range keys {
				res.Groups = append(res.Groups, *groups[k])
			}
		}
		results = append(results, res)
	}
	return results, nil
}

// baseBlockRe extracts ```base fenced blocks from a note body.
var baseBlockRe = regexp.MustCompile("(?s)```base\\s*\\n(.*?)```")

// BaseBlocks returns the base block texts inside a markdown body.
func BaseBlocks(body string) []string {
	var out []string
	for _, m := range baseBlockRe.FindAllStringSubmatch(body, -1) {
		out = append(out, m[1])
	}
	return out
}

// BaseResultText renders results as deterministic plain text (selftest + debugging referent).
func BaseResultText(rs []BaseResult) string {
	var b strings.Builder
	for _, r := range rs {
		fmt.Fprintf(&b, "view: %s | cols: %s\n", r.Name, strings.Join(r.Columns, ","))
		for _, g := range r.Groups {
			if g.Key != "" {
				fmt.Fprintf(&b, "group %s (%d)\n", g.Key, g.Count)
			}
			for _, row := range g.Rows {
				fmt.Fprintf(&b, "  %s | %s\n", row.ID, strings.Join(row.Cells, " | "))
			}
		}
	}
	return b.String()
}

// enddesign
