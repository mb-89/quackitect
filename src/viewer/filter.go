// The filter language: KQL, the one Kibana uses, with Lucene's /pattern/ for a
// regular expression. A half-typed filter answers ErrIncomplete, and a pattern
// that fails to compile answers its own error.
// [[spec/design_output/viewer#the-filter-language]]

package main

import (
	"errors"
	"fmt"
	"regexp"
	"strings"
)

var ErrIncomplete = errors.New("still typing")

type Row interface {
	Haystack() string
	Detail() string
	Field(name string) (string, bool)
}

type Filter struct {
	Source string
	root   node
}

type node interface{ match(Row) bool }

type andNode struct{ l, r node }
type orNode struct{ l, r node }
type notNode struct{ n node }
type clause struct {
	field  string
	needle string
	re     *regexp.Regexp
}

func (n andNode) match(r Row) bool { return n.l.match(r) && n.r.match(r) }
func (n orNode) match(r Row) bool  { return n.l.match(r) || n.r.match(r) }
func (n notNode) match(r Row) bool { return !n.n.match(r) }

// [[spec/design_output/viewer#a-name-nobody-knows]]
func (c clause) match(r Row) bool {
	switch strings.ToLower(c.field) {
	case "":
		return c.hit(r.Haystack())
	case "details", "detail":
		return c.hit(r.Detail())
	}
	value, found := r.Field(c.field)
	if !found {
		return false
	}
	return c.hit(value)
}

func (c clause) hit(said string) bool {
	if c.re != nil {
		return c.re.MatchString(said)
	}
	return strings.Contains(strings.ToLower(said), c.needle)
}

func (f Filter) Empty() bool      { return f.root == nil }
func (f Filter) Match(r Row) bool { return f.root == nil || f.root.match(r) }

type token struct {
	kind string
	text string
}

func lex(said string) ([]token, error) {
	var out []token
	rs := []rune(said)
	for i := 0; i < len(rs); {
		c := rs[i]
		switch {
		case c == ' ' || c == '\t':
			i++
		case c == '(' || c == ')':
			out = append(out, token{string(c), string(c)})
			i++
		case c == ':':
			out = append(out, token{"colon", ":"})
			i++
		case c == '"':
			j := i + 1
			for j < len(rs) && rs[j] != '"' {
				j++
			}
			if j >= len(rs) {
				return nil, ErrIncomplete
			}
			out = append(out, token{"quoted", string(rs[i+1 : j])})
			i = j + 1
		case c == '/':
			j := i + 1
			for j < len(rs) && rs[j] != '/' {
				if rs[j] == '\\' {
					j++
				}
				j++
			}
			if j >= len(rs) {
				return nil, ErrIncomplete
			}
			out = append(out, token{"regex", string(rs[i+1 : j])})
			i = j + 1
		default:
			j := i
			for j < len(rs) && !strings.ContainsRune(" \t():\"", rs[j]) {
				j++
			}
			word := string(rs[i:j])
			switch strings.ToLower(word) {
			case "and", "or", "not":
				out = append(out, token{strings.ToLower(word), word})
			default:
				out = append(out, token{"word", word})
			}
			i = j
		}
	}
	return out, nil
}

type parser struct {
	t []token
	i int
}

func ParseFilter(said string) (Filter, error) {
	toks, err := lex(said)
	if err != nil {
		return Filter{}, err
	}
	if len(toks) == 0 {
		return Filter{Source: said}, nil
	}
	if err := CompileError(said); err != nil {
		return Filter{}, err
	}
	p := &parser{t: toks}
	n, err := p.parseOr()
	if err != nil {
		return Filter{}, err
	}
	if p.i != len(p.t) {
		return Filter{}, fmt.Errorf("cannot read %q", p.t[p.i].text)
	}
	return Filter{Source: said, root: n}, nil
}

func (p *parser) peek() string {
	if p.i < len(p.t) {
		return p.t[p.i].kind
	}
	return ""
}

func (p *parser) parseOr() (node, error) {
	left, err := p.parseAnd()
	if err != nil {
		return nil, err
	}
	for p.peek() == "or" {
		p.i++
		right, err := p.parseAnd()
		if err != nil {
			return nil, err
		}
		left = orNode{left, right}
	}
	return left, nil
}

func (p *parser) parseAnd() (node, error) {
	left, err := p.parseUnary()
	if err != nil {
		return nil, err
	}
	for {
		if p.peek() == "and" {
			p.i++
		} else if k := p.peek(); k != "word" && k != "quoted" && k != "regex" && k != "(" && k != "not" {
			return left, nil
		}
		right, err := p.parseUnary()
		if err != nil {
			return nil, err
		}
		left = andNode{left, right}
	}
}

func (p *parser) parseUnary() (node, error) {
	if p.peek() == "not" {
		p.i++
		n, err := p.parseUnary()
		if err != nil {
			return nil, err
		}
		return notNode{n}, nil
	}
	return p.parsePrimary()
}

func (p *parser) parsePrimary() (node, error) {
	switch p.peek() {
	case "(":
		p.i++
		n, err := p.parseOr()
		if err != nil {
			return nil, err
		}
		if p.peek() != ")" {
			return nil, ErrIncomplete
		}
		p.i++
		return n, nil
	case "word", "quoted", "regex":
		return p.parseClause()
	case "":
		return nil, ErrIncomplete
	}
	return nil, fmt.Errorf("cannot read %q", p.t[p.i].text)
}

func (p *parser) parseClause() (node, error) {
	first := p.t[p.i]
	p.i++
	if first.kind == "word" && p.peek() == "colon" {
		field := strings.TrimPrefix(first.text, "-")
		p.i++
		value, err := p.value()
		if err != nil {
			return nil, err
		}
		if strings.HasPrefix(first.text, "-") {
			return notNode{clauseFor(field, value)}, nil
		}
		return clauseFor(field, value), nil
	}
	if first.kind == "word" && strings.HasPrefix(first.text, "-") && len(first.text) > 1 {
		return notNode{clauseFor("", token{"word", first.text[1:]})}, nil
	}
	return clauseFor("", first), nil
}

func (p *parser) value() (token, error) {
	switch p.peek() {
	case "word", "quoted", "regex":
		t := p.t[p.i]
		p.i++
		return t, nil
	}
	return token{}, ErrIncomplete
}

func clauseFor(field string, value token) node {
	c := clause{field: field}
	switch {
	case value.kind == "regex":
		re, err := regexp.Compile("(?i)" + value.text)
		if err != nil {
			c.needle = "\x00"
			return c
		}
		c.re = re
	case strings.Contains(value.text, "*"):
		parts := strings.Split(value.text, "*")
		for i, part := range parts {
			parts[i] = regexp.QuoteMeta(part)
		}
		c.re = regexp.MustCompile("(?i)" + strings.Join(parts, ".*"))
	default:
		c.needle = strings.ToLower(value.text)
	}
	return c
}

func CompileError(said string) error {
	toks, err := lex(said)
	if err != nil {
		return nil
	}
	for _, t := range toks {
		if t.kind != "regex" {
			continue
		}
		if _, err := regexp.Compile("(?i)" + t.text); err != nil {
			return err
		}
	}
	return nil
}
