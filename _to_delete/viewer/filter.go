package main

import (
	"errors"
	"regexp"
	"strings"
)

// ErrIncomplete means the person is still typing, not that they typed
// something wrong. A pattern is opened with a slash and closed with one, and
// between those two keystrokes the expression is neither valid nor an error.
// Treating it as a literal is what blanks the view on every keystroke.
var ErrIncomplete = errors.New("still typing")

// A Filter is a list of terms that must all match. Nothing here is clever. The
// three shapes below are the whole language, and the help text in the detail
// pane is generated from this file so the two cannot disagree.
type Filter struct {
	Source string
	terms  []term
}

type term struct {
	field  string         // empty means every column
	needle string         // substring match, case folded
	re     *regexp.Regexp // set instead of needle when the term was a pattern
	negate bool
}

const FilterHelp = `FILTER

Type to filter. There is no key to press first.

  word              every column contains "word"
  name:word         that column contains "word"
  /pattern/         every column matches the regular expression
  name:/pattern/    that column matches it
  -word             lines that contain "word" are removed

Several terms narrow together. Every term must match.

COLUMNS

  time  src  kind  actor  msg  session  ok

Any field inside a record's details can also be named.

WHILE TYPING

A filter that is not finished yet is not an error. The last filter that worked
stays on screen, and the line below the list says the new one is not valid.

KEYS

  up down        move the selection, or scroll the pane that has focus
  page up down   move a screen at a time
  home end       first line, newest line
  tab            move focus between the list and the details
  ctrl+d         open the details, and close them again
  esc            clear the filter
  ctrl+c         quit

The newest line is followed only while the selection is on it. Move up and the
list holds still, however much arrives.`

func ParseFilter(s string) (Filter, error) {
	if strings.Count(s, `"`)%2 == 1 {
		return Filter{}, ErrIncomplete
	}
	f := Filter{Source: s}
	for _, raw := range splitTerms(s) {
		if raw == "" {
			continue
		}
		t := term{}
		if strings.HasPrefix(raw, "-") && len(raw) > 1 {
			t.negate = true
			raw = raw[1:]
		}
		body := raw
		if i := strings.Index(raw, ":"); i > 0 {
			t.field = raw[:i]
			body = raw[i+1:]
		}
		// A leading slash is ambiguous: it opens a pattern, and it also starts
		// a path. One slash means a pattern that is not closed yet. Two means
		// the person meant it, and whether it ends with a slash decides which
		// of the two it is.
		if strings.HasPrefix(body, "/") && strings.Count(body, "/") < 2 {
			return Filter{}, ErrIncomplete
		}
		if strings.HasPrefix(body, "/") && strings.HasSuffix(body, "/") {
			re, err := regexp.Compile("(?i)" + body[1:len(body)-1])
			if err != nil {
				return Filter{}, err
			}
			t.re = re
		} else {
			t.needle = strings.ToLower(body)
		}
		f.terms = append(f.terms, t)
	}
	return f, nil
}

// splitTerms keeps a quoted phrase together. A person who types a message
// fragment with a space in it means one term, not two.
func splitTerms(s string) []string {
	var out []string
	var cur strings.Builder
	inQuote := false
	for _, r := range s {
		switch {
		case r == '"':
			inQuote = !inQuote
		case r == ' ' && !inQuote:
			out = append(out, cur.String())
			cur.Reset()
		default:
			cur.WriteRune(r)
		}
	}
	out = append(out, cur.String())
	return out
}

func (f Filter) Empty() bool { return len(f.terms) == 0 }

func (f Filter) Match(r Record) bool {
	for _, t := range f.terms {
		hit := t.match(r)
		if t.negate {
			hit = !hit
		}
		if !hit {
			return false
		}
	}
	return true
}

func (t term) match(r Record) bool {
	if t.field == "" {
		return t.hit(r.Haystack())
	}
	v, found := r.Field(t.field)
	if !found {
		// A column nobody has heard of matches nothing. It is a typo, and a
		// typo that matched everything would look like a working filter.
		return false
	}
	return t.hit(v)
}

func (t term) hit(s string) bool {
	if t.re != nil {
		return t.re.MatchString(s)
	}
	return strings.Contains(strings.ToLower(s), t.needle)
}
