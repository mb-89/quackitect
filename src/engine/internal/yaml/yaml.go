// Package yaml is a small YAML reader, for the owner's format.
//
// A view is a `.base` file, which is Obsidian's format and not ours. We render
// it rather than inventing a second grammar, because the owner already writes
// table specs in it and a second grammar creates the duplication it was meant
// to prevent.
//
// THE SUBSET IS NARROW AND IT REFUSES LOUDLY. Mappings, sequences, and scalars,
// nested by indentation. No anchors, no flow style, no multi-line scalars, no
// documents. A reader that ignores what it cannot understand returns a view
// that looks complete and is wrong.
//
// IT IS OURS BECAUSE IT IS SMALL, NOT BECAUSE A DEPENDENCY IS FORBIDDEN. The
// bar is one-click installable: anything the installer can fetch is allowed,
// and src/viewer already carries twenty-two modules. This is two hundred
// lines, it was quicker to write than to choose, and the narrow subset is a
// feature here because it refuses rather than guesses.
//
// WHAT WOULD CHANGE THE ANSWER: a schema wanting multi-line descriptions, or
// anything else in the parts of yaml this refuses. Then a library earns its
// place and this goes.
package yaml

import (
	"fmt"
	"strconv"
	"strings"
)

// Parse reads the text. A node is a string, a []any, or a map[string]any.
// Nothing else.
func Parse(text string) (any, error) {
	lines, err := readable(text)
	if err != nil {
		return nil, err
	}
	if len(lines) == 0 {
		return map[string]any{}, nil
	}
	p := &parser{lines: lines}
	v, err := p.block(lines[0].indent)
	if err != nil {
		return nil, err
	}
	if p.at < len(p.lines) {
		return nil, fmt.Errorf("line %d: this is indented less than the block it is in", p.lines[p.at].no)
	}
	return v, nil
}

type line struct {
	no     int
	indent int
	text   string
}

// Blank lines and comments carry nothing, so they never reach the parser and
// never confuse an indentation comparison.
func readable(text string) ([]line, error) {
	var out []line
	for i, raw := range strings.Split(strings.ReplaceAll(text, "\r\n", "\n"), "\n") {
		if strings.Contains(raw, "\t") {
			return nil, fmt.Errorf("line %d: a tab. YAML indents with spaces", i+1)
		}
		trimmed := strings.TrimLeft(raw, " ")
		if trimmed == "" || strings.HasPrefix(trimmed, "#") {
			continue
		}
		out = append(out, line{no: i + 1, indent: len(raw) - len(trimmed), text: trimmed})
	}
	return out, nil
}

type parser struct {
	lines []line
	at    int
}

func (p *parser) block(indent int) (any, error) {
	if p.at >= len(p.lines) {
		return "", nil
	}
	if strings.HasPrefix(p.lines[p.at].text, "- ") || p.lines[p.at].text == "-" {
		return p.sequence(indent)
	}
	return p.mapping(indent)
}

func (p *parser) mapping(indent int) (any, error) {
	out := map[string]any{}
	for p.at < len(p.lines) {
		l := p.lines[p.at]
		if l.indent < indent {
			break
		}
		if l.indent > indent {
			return nil, fmt.Errorf("line %d: indented further than the mapping it is in", l.no)
		}
		key, rest, ok := strings.Cut(l.text, ":")
		if !ok {
			return nil, fmt.Errorf("line %d: no key: %q", l.no, l.text)
		}
		key = strings.TrimSpace(key)
		rest = strings.TrimSpace(rest)
		p.at++
		if rest != "" {
			out[key] = scalar(rest)
			continue
		}
		// The value is whatever is indented under it, or nothing.
		if p.at < len(p.lines) && p.lines[p.at].indent > indent {
			v, err := p.block(p.lines[p.at].indent)
			if err != nil {
				return nil, err
			}
			out[key] = v
			continue
		}
		// A sequence may sit at the key's own indentation, which is legal and
		// is what most people write.
		if p.at < len(p.lines) && p.lines[p.at].indent == indent &&
			strings.HasPrefix(p.lines[p.at].text, "- ") {
			v, err := p.sequence(indent)
			if err != nil {
				return nil, err
			}
			out[key] = v
			continue
		}
		out[key] = ""
	}
	return out, nil
}

func (p *parser) sequence(indent int) (any, error) {
	var out []any
	for p.at < len(p.lines) {
		l := p.lines[p.at]
		if l.indent != indent || !strings.HasPrefix(l.text, "- ") {
			if l.indent < indent {
				break
			}
			if !strings.HasPrefix(l.text, "- ") {
				break
			}
			return nil, fmt.Errorf("line %d: this list item is indented differently from the one above", l.no)
		}
		item := strings.TrimSpace(strings.TrimPrefix(l.text, "-"))
		// An item that opens a mapping keeps reading at the column the first
		// key sits in, which is two past the dash.
		if k, _, isPair := strings.Cut(item, ":"); isPair && !looksQuoted(item) && k != "" {
			p.lines[p.at] = line{no: l.no, indent: indent + 2, text: item}
			v, err := p.mapping(indent + 2)
			if err != nil {
				return nil, err
			}
			out = append(out, v)
			continue
		}
		p.at++
		if item == "" {
			// A BARE DASH ON THE LAST LINE OPENS A BLOCK THAT IS NOT THERE.
			// Reading the next line's indent indexed past the end, and a
			// file ending in "-" took the program down rather than answering.
			if p.at >= len(p.lines) {
				return nil, fmt.Errorf("line %d: this list item opens a block and the file ends", l.no)
			}
			v, err := p.block(p.lines[p.at].indent)
			if err != nil {
				return nil, err
			}
			out = append(out, v)
			continue
		}
		out = append(out, scalar(item))
	}
	return out, nil
}

func looksQuoted(s string) bool {
	return strings.HasPrefix(s, `"`) || strings.HasPrefix(s, "'")
}

// Every scalar comes back as a string. The expression language decides what a
// value means, so deciding it twice would be two answers to one question.
func scalar(s string) string {
	if len(s) >= 2 && (s[0] == '"' || s[0] == '\'') && s[len(s)-1] == s[0] {
		if s[0] == '"' {
			if out, err := strconv.Unquote(s); err == nil {
				return out
			}
		}
		return s[1 : len(s)-1]
	}
	// A trailing comment on a scalar is a comment.
	if i := strings.Index(s, " #"); i >= 0 {
		s = strings.TrimRight(s[:i], " ")
	}
	return s
}

// Map reaches into a parsed tree, without a type switch at every call site.
func Map(v any) map[string]any {
	m, _ := v.(map[string]any)
	return m
}

// List answers the node as a list. A lone scalar is a list of one.
func List(v any) []any {
	switch t := v.(type) {
	case []any:
		return t
	case nil:
		return nil
	default:
		return []any{t}
	}
}

// Str answers the node as a string, or nothing.
func Str(v any) string {
	s, _ := v.(string)
	return s
}

// Strs answers the node as its non-empty strings.
func Strs(v any) []string {
	var out []string
	for _, e := range List(v) {
		if s := Str(e); s != "" {
			out = append(out, s)
		}
	}
	return out
}
