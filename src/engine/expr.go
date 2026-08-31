package main

import (
	"fmt"
	"strconv"
	"strings"
)

// THE EXPRESSION LANGUAGE A FILTER IS WRITTEN IN.
//
// Filters and group levels share one syntax and one evaluator, which is what
// Obsidian's format does and what lets a group level be computed rather than
// looked up. A view groups by `if(bucket, bucket, place)`: a token carrying a
// bucket groups under it, and one without groups under its place.
//
// THE SUBSET IS NARROW AND EVERYTHING OUTSIDE IT REFUSES BY NAME. A query
// language that ignores a clause it does not understand returns a table that
// looks complete and is wrong, and nobody reading the table can tell.
//
// Implemented: property lookup, string and number literals, true and false,
// == != > < >= <=, && || !, parentheses, if(), and the method calls below.

type Value struct {
	S    string
	N    float64
	B    bool
	L    []string
	Kind byte // s, n, b, l, x for absent
}

func vs(s string) Value  { return Value{S: s, Kind: 's'} }
func vn(n float64) Value { return Value{N: n, Kind: 'n'} }
func vb(b bool) Value    { return Value{B: b, Kind: 'b'} }
func vl(l []string) Value {
	return Value{L: l, Kind: 'l'}
}

var absent = Value{Kind: 'x'}

// Truth, as the language sees it. An absent property is false, an empty string
// is false, and zero is false. That is what makes a bare property name a legal
// filter meaning "carries something".
func (v Value) Truthy() bool {
	switch v.Kind {
	case 's':
		return v.S != ""
	case 'n':
		return v.N != 0
	case 'b':
		return v.B
	case 'l':
		return len(v.L) > 0
	}
	return false
}

func (v Value) Text() string {
	switch v.Kind {
	case 's':
		return v.S
	case 'n':
		return strconv.FormatFloat(v.N, 'f', -1, 64)
	case 'b':
		return strconv.FormatBool(v.B)
	case 'l':
		return strings.Join(v.L, ", ")
	}
	return ""
}

// Rows are flat maps of property to value. What fills them is the caller's
// business, so nothing here knows what a token is.
type Row map[string]Value

// ---------------------------------------------------------------------------
// Reading the text
// ---------------------------------------------------------------------------

type token struct {
	kind byte // n name, s string, # number, o operator, ( )
	text string
}

func lex(src string) ([]token, error) {
	var out []token
	for i := 0; i < len(src); {
		c := src[i]
		switch {
		case c == ' ' || c == '\t' || c == '\n' || c == '\r':
			i++
		case c == '"' || c == '\'':
			j := i + 1
			for j < len(src) && src[j] != c {
				if src[j] == '\\' {
					j++
				}
				j++
			}
			if j >= len(src) {
				return nil, fmt.Errorf("a string that never closes: %s", src[i:])
			}
			raw := src[i : j+1]
			text := raw[1 : len(raw)-1]
			if c == '"' {
				if un, err := strconv.Unquote(raw); err == nil {
					text = un
				}
			}
			out = append(out, token{'s', text})
			i = j + 1
		case c >= '0' && c <= '9':
			j := i
			for j < len(src) && (src[j] == '.' || (src[j] >= '0' && src[j] <= '9')) {
				j++
			}
			out = append(out, token{'#', src[i:j]})
			i = j
		case isNameByte(c):
			j := i
			for j < len(src) && (isNameByte(src[j]) || (src[j] >= '0' && src[j] <= '9')) {
				j++
			}
			out = append(out, token{'n', src[i:j]})
			i = j
		case strings.ContainsRune("()[],.", rune(c)):
			out = append(out, token{c, string(c)})
			i++
		default:
			two := ""
			if i+1 < len(src) {
				two = src[i : i+2]
			}
			switch two {
			case "==", "!=", ">=", "<=", "&&", "||":
				out = append(out, token{'o', two})
				i += 2
				continue
			}
			if strings.ContainsRune("<>!", rune(c)) {
				out = append(out, token{'o', string(c)})
				i++
				continue
			}
			return nil, fmt.Errorf("this program does not know the character %q", string(c))
		}
	}
	return out, nil
}

func isNameByte(c byte) bool {
	return c == '_' || c == '-' || (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')
}

// ---------------------------------------------------------------------------
// The tree
// ---------------------------------------------------------------------------

type Expr struct {
	op    string // "" for a leaf
	text  string // a leaf's name or literal
	kind  byte   // a leaf's token kind
	args  []*Expr
	strct string // the method's receiver name, for a call
}

func Parse(src string) (*Expr, error) {
	ts, err := lex(src)
	if err != nil {
		return nil, err
	}
	p := &eparser{ts: ts, src: src}
	e, err := p.binary(0)
	if err != nil {
		return nil, err
	}
	if p.at < len(p.ts) {
		return nil, fmt.Errorf("%q: there is something after the expression: %q", src, p.ts[p.at].text)
	}
	return e, nil
}

type eparser struct {
	ts  []token
	at  int
	src string
}

var levels = [][]string{{"||"}, {"&&"}, {"==", "!="}, {"<", ">", "<=", ">="}}

func (p *eparser) binary(level int) (*Expr, error) {
	if level >= len(levels) {
		return p.unary()
	}
	left, err := p.binary(level + 1)
	if err != nil {
		return nil, err
	}
	for p.at < len(p.ts) && p.ts[p.at].kind == 'o' && contains(levels[level], p.ts[p.at].text) {
		op := p.ts[p.at].text
		p.at++
		right, err := p.binary(level + 1)
		if err != nil {
			return nil, err
		}
		left = &Expr{op: op, args: []*Expr{left, right}}
	}
	return left, nil
}

func (p *eparser) unary() (*Expr, error) {
	if p.at < len(p.ts) && p.ts[p.at].kind == 'o' && p.ts[p.at].text == "!" {
		p.at++
		e, err := p.unary()
		if err != nil {
			return nil, err
		}
		return &Expr{op: "!", args: []*Expr{e}}, nil
	}
	return p.postfix()
}

// A method call binds to whatever is on its left, so it is read after it.
func (p *eparser) postfix() (*Expr, error) {
	e, err := p.primary()
	if err != nil {
		return nil, err
	}
	for p.at < len(p.ts) && p.ts[p.at].kind == '.' {
		p.at++
		if p.at >= len(p.ts) || p.ts[p.at].kind != 'n' {
			return nil, fmt.Errorf("%q: a dot with no name after it", p.src)
		}
		name := p.ts[p.at].text
		p.at++
		// A DOTTED NAME IS ONE PROPERTY unless a bracket follows it. file.name
		// and state.current are properties; text.contains("x") is a call. The
		// bracket is the whole difference, and reading it the other way round
		// made file.name a method nobody wrote.
		if e.op == "" && e.kind == 'n' && (p.at >= len(p.ts) || p.ts[p.at].kind != '(') {
			e = &Expr{text: e.text + "." + name, kind: 'n'}
			continue
		}
		args, err := p.arguments()
		if err != nil {
			return nil, err
		}
		e = &Expr{op: "method", text: name, args: append([]*Expr{e}, args...)}
	}
	return e, nil
}

func (p *eparser) arguments() ([]*Expr, error) {
	if p.at >= len(p.ts) || p.ts[p.at].kind != '(' {
		return nil, nil
	}
	p.at++
	var args []*Expr
	for p.at < len(p.ts) && p.ts[p.at].kind != ')' {
		a, err := p.binary(0)
		if err != nil {
			return nil, err
		}
		args = append(args, a)
		if p.at < len(p.ts) && p.ts[p.at].kind == ',' {
			p.at++
		}
	}
	if p.at >= len(p.ts) {
		return nil, fmt.Errorf("%q: a bracket that never closes", p.src)
	}
	p.at++
	return args, nil
}

func (p *eparser) primary() (*Expr, error) {
	if p.at >= len(p.ts) {
		return nil, fmt.Errorf("%q: it ends where a value was wanted", p.src)
	}
	t := p.ts[p.at]
	switch t.kind {
	case '(':
		p.at++
		e, err := p.binary(0)
		if err != nil {
			return nil, err
		}
		if p.at >= len(p.ts) || p.ts[p.at].kind != ')' {
			return nil, fmt.Errorf("%q: a bracket that never closes", p.src)
		}
		p.at++
		return e, nil
	case 's', '#':
		p.at++
		return &Expr{text: t.text, kind: t.kind}, nil
	case 'n':
		p.at++
		// A name followed by a bracket is a call.
		if p.at < len(p.ts) && p.ts[p.at].kind == '(' {
			args, err := p.arguments()
			if err != nil {
				return nil, err
			}
			return &Expr{op: "call", text: t.text, args: args}, nil
		}
		return &Expr{text: t.text, kind: 'n'}, nil
	}
	return nil, fmt.Errorf("%q: %q is not the start of a value", p.src, t.text)
}

func contains(list []string, s string) bool {
	for _, e := range list {
		if e == s {
			return true
		}
	}
	return false
}

// ---------------------------------------------------------------------------
// Working it out
// ---------------------------------------------------------------------------

func (e *Expr) Eval(row Row) (Value, error) {
	if e.op == "" {
		switch e.kind {
		case 's':
			return vs(e.text), nil
		case '#':
			n, err := strconv.ParseFloat(e.text, 64)
			if err != nil {
				return absent, fmt.Errorf("%q is not a number", e.text)
			}
			return vn(n), nil
		case 'n':
			switch e.text {
			case "true":
				return vb(true), nil
			case "false":
				return vb(false), nil
			}
			if v, ok := row[e.text]; ok {
				return v, nil
			}
			return absent, nil
		}
	}
	switch e.op {
	case "!":
		v, err := e.args[0].Eval(row)
		return vb(!v.Truthy()), err
	case "&&", "||":
		l, err := e.args[0].Eval(row)
		if err != nil {
			return absent, err
		}
		if e.op == "&&" && !l.Truthy() {
			return vb(false), nil
		}
		if e.op == "||" && l.Truthy() {
			return vb(true), nil
		}
		r, err := e.args[1].Eval(row)
		return vb(r.Truthy()), err
	case "==", "!=", "<", ">", "<=", ">=":
		return e.compare(row)
	case "call":
		return e.call(row)
	case "method":
		return e.method(row)
	}
	return absent, fmt.Errorf("this program does not know the operator %q", e.op)
}

func (e *Expr) compare(row Row) (Value, error) {
	l, err := e.args[0].Eval(row)
	if err != nil {
		return absent, err
	}
	r, err := e.args[1].Eval(row)
	if err != nil {
		return absent, err
	}
	if e.op == "==" || e.op == "!=" {
		same := l.Text() == r.Text()
		return vb(same == (e.op == "==")), nil
	}
	// Ordering is on numbers when both are numbers, and on text otherwise, so
	// dates in the format this program writes order correctly as text.
	if l.Kind == 'n' && r.Kind == 'n' {
		switch e.op {
		case "<":
			return vb(l.N < r.N), nil
		case ">":
			return vb(l.N > r.N), nil
		case "<=":
			return vb(l.N <= r.N), nil
		}
		return vb(l.N >= r.N), nil
	}
	a, b := l.Text(), r.Text()
	switch e.op {
	case "<":
		return vb(a < b), nil
	case ">":
		return vb(a > b), nil
	case "<=":
		return vb(a <= b), nil
	}
	return vb(a >= b), nil
}

func (e *Expr) call(row Row) (Value, error) {
	switch e.text {
	case "if":
		if len(e.args) < 2 {
			return absent, fmt.Errorf("if takes a condition and a result")
		}
		c, err := e.args[0].Eval(row)
		if err != nil {
			return absent, err
		}
		if c.Truthy() {
			return e.args[1].Eval(row)
		}
		if len(e.args) > 2 {
			return e.args[2].Eval(row)
		}
		return absent, nil
	case "list":
		var out []string
		for _, a := range e.args {
			v, err := a.Eval(row)
			if err != nil {
				return absent, err
			}
			out = append(out, v.Text())
		}
		return vl(out), nil
	}
	return absent, fmt.Errorf("this program does not know the function %q", e.text)
}

func (e *Expr) method(row Row) (Value, error) {
	self, err := e.args[0].Eval(row)
	if err != nil {
		return absent, err
	}
	var args []Value
	for _, a := range e.args[1:] {
		v, err := a.Eval(row)
		if err != nil {
			return absent, err
		}
		args = append(args, v)
	}
	switch e.text {
	case "isEmpty":
		return vb(!self.Truthy()), nil
	case "toString":
		return vs(self.Text()), nil
	case "lower":
		return vs(strings.ToLower(self.Text())), nil
	case "contains":
		if len(args) != 1 {
			return absent, fmt.Errorf("contains takes one value")
		}
		if self.Kind == 'l' {
			return vb(contains(self.L, args[0].Text())), nil
		}
		return vb(strings.Contains(self.Text(), args[0].Text())), nil
	case "startsWith":
		return vb(len(args) == 1 && strings.HasPrefix(self.Text(), args[0].Text())), nil
	case "endsWith":
		return vb(len(args) == 1 && strings.HasSuffix(self.Text(), args[0].Text())), nil
	case "length":
		if self.Kind == 'l' {
			return vn(float64(len(self.L))), nil
		}
		return vn(float64(len(self.Text()))), nil
	}
	return absent, fmt.Errorf("this program does not know the method %q", e.text)
}
