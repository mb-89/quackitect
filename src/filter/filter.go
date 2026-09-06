package filter

import (
	"errors"
	"fmt"
	"regexp"
	"strings"
)

// The filter language is KQL, the query language Kibana uses, with one
// borrowed addition. It was not invented here.
//
//   bare word            every column, and every detail
//   name: value          that column
//   name: "two words"    the phrase, in that column
//   a and b   a or b     combine. The keywords are not case sensitive
//   not a     -a         remove
//   ( a or b ) and c     group
//   name: val*           the wildcard KQL supports
//   details: word        anything the details pane shows for that line
//
// The addition is /pattern/, which is Lucene's way of writing a regular
// expression. KQL has no regular expressions, and a log window is where they
// earn their keep.
//
//   /pat/                every column matches it
//   name: /pat/          that column matches it
//
// Terms with nothing between them are combined with and, as in KQL.

var ErrIncomplete = errors.New("still typing")

// Row is one line as a row of named values, which is all this reader knows
// about what it is filtering.
//
// IT IS READ AND NOT HANDED OVER WHOLE. The viewer filters every record on
// every keystroke, so materialising a map of every column per record per frame
// is a cost this avoids: a clause asks for the one name it names. Everything
// and Detail are the two whole-line readings the language offers beside a
// column, so they are asked for the same way.
type Row interface {
	// Haystack is what a bare term searches: every column together.
	Haystack() string
	// Detail is everything the details pane shows for the line.
	Detail() string
	// Field answers one named value, and whether that name is a column at
	// all. A name nothing knows is not the empty value.
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

func (c clause) match(r Row) bool {
	switch strings.ToLower(c.field) {
	case "":
		return c.hit(r.Haystack())
	case "details", "detail":
		// Everything the details pane shows, not only the extra fields. A
		// person filtering on details means what they can see there.
		return c.hit(r.Detail())
	}
	v, found := r.Field(c.field)
	if !found {
		// A column nobody has heard of matches nothing. It is a typo, and a
		// typo that matched everything would look like a working filter.
		return false
	}
	return c.hit(v)
}

func (c clause) hit(s string) bool {
	if c.re != nil {
		return c.re.MatchString(s)
	}
	return strings.Contains(strings.ToLower(s), c.needle)
}

func (f Filter) Empty() bool      { return f.root == nil }
func (f Filter) Match(r Row) bool { return f.root == nil || f.root.match(r) }

// ---- reading the text ----

type token struct {
	kind string // word quoted regex ( ) and or not colon
	text string
}

func lex(s string) ([]token, error) {
	var out []token
	rs := []rune(s)
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
				return nil, ErrIncomplete // the closing quote has not been typed
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
				return nil, ErrIncomplete // the closing slash has not been typed
			}
			out = append(out, token{"regex", string(rs[i+1 : j])})
			i = j + 1
		default:
			j := i
			for j < len(rs) && !strings.ContainsRune(" \t():\"", rs[j]) {
				j++
			}
			w := string(rs[i:j])
			switch strings.ToLower(w) {
			case "and", "or", "not":
				out = append(out, token{strings.ToLower(w), w})
			default:
				out = append(out, token{"word", w})
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

func ParseFilter(s string) (Filter, error) {
	toks, err := lex(s)
	if err != nil {
		return Filter{}, err
	}
	if len(toks) == 0 {
		return Filter{Source: s}, nil
	}
	// A pattern that will not compile is an error, not a filter that matches
	// nothing. The view keeps the last one that worked and the line under the
	// list says which.
	if err := CompileError(s); err != nil {
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
	return Filter{Source: s, root: n}, nil
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
			// Terms with nothing between them are combined with and, so
			// anything that can start a term continues the list.
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
			return nil, ErrIncomplete // the closing bracket has not been typed
		}
		p.i++
		return n, nil
	case "word", "quoted", "regex":
		return p.parseClause()
	case "":
		// The text ends where a term was expected, which is what half a
		// filter looks like.
		return nil, ErrIncomplete
	}
	return nil, fmt.Errorf("cannot read %q", p.t[p.i].text)
}

func (p *parser) parseClause() (node, error) {
	first := p.t[p.i]
	p.i++
	field := ""
	// A word followed by a colon names a column. Anything else is a value.
	if first.kind == "word" && p.peek() == "colon" {
		field = strings.TrimPrefix(first.text, "-")
		if strings.HasPrefix(first.text, "-") {
			p.i++
			v, err := p.value()
			if err != nil {
				return nil, err
			}
			return notNode{clauseFor(field, v)}, nil
		}
		p.i++
		v, err := p.value()
		if err != nil {
			return nil, err
		}
		return clauseFor(field, v), nil
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
	return token{}, ErrIncomplete // the value has not been typed yet
}

func clauseFor(field string, v token) node {
	c := clause{field: field}
	switch {
	case v.kind == "regex":
		re, err := regexp.Compile("(?i)" + v.text)
		if err != nil {
			// An expression that will not compile matches nothing, and the
			// line under the list says so. It never removes the whole view
			// by accident.
			c.needle = "\x00"
			return c
		}
		c.re = re
	case strings.Contains(v.text, "*"):
		// The one wildcard KQL has.
		parts := strings.Split(v.text, "*")
		for i, part := range parts {
			parts[i] = regexp.QuoteMeta(part)
		}
		c.re = regexp.MustCompile("(?i)" + strings.Join(parts, ".*"))
	default:
		c.needle = strings.ToLower(v.text)
	}
	return c
}

// CompileError reports a pattern that will not compile, separately from a
// filter that is merely unfinished. The two call for different reactions.
func CompileError(s string) error {
	toks, err := lex(s)
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

const FilterHelp = `FILTER

The language is KQL, the one Kibana uses. It was not invented here, so what
you already know about it holds.

  word                 every column, and every detail
  name: value          that column
  name: "two words"    the phrase, in that column
  details: word        anything the details pane shows for that line

COMBINING

  a b                  both. Terms with nothing between them mean and
  a and b              both
  a or b               either
  not a                remove. -a means the same
  (a or b) and c       group with brackets

The keywords are not case sensitive. not binds tightest, then and, then or.

MATCHING

  val*                 the wildcard KQL has
  /pattern/            a regular expression, written as Lucene writes it
  name: /pattern/      the same, in one column

Matching ignores case everywhere.

COLUMNS

  time  src  kind  actor  msg  session  ok  details

Any field inside a record's details can also be named.

WHILE TYPING

A filter that is not finished is not an error. The last filter that worked
stays on screen, and the line below the list says which of the two it is.

KEYS

  up down        move the selection, or scroll the details when shown
  w s            move the selection while the details are shown
  page up down   move a screen at a time
  home end       first line, newest line
  ctrl+d         open the details, and close them again
  esc            clear the filter
  ctrl+c         quit

The newest line is followed only while the selection is on it. Move up and
the list holds still, however much arrives.`
