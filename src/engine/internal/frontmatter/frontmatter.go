// Package frontmatter reads and writes a note's frontmatter, in the subset of
// YAML this program writes.
//
// A token is a markdown note. Its data is the frontmatter and its prose is the
// body, which is what makes it a thing a person reads six months later rather
// than a record only a program can open.
//
// THE SUBSET IS NARROW AND IT REFUSES LOUDLY. Scalars, and lists of scalars in
// the block form. That is what this program writes, and a parser that silently
// ignores what it cannot read returns a note that looks complete and is wrong.
//
// It is our own because it is small, not because a dependency is forbidden.
// The bar is one-click installable, and the installer already fetches Go, Node
// and ripgrep. This reads the handful of shapes a note's frontmatter holds.
package frontmatter

import (
	"fmt"
	"sort"
	"strconv"
	"strings"
)

// Fence is the line that opens and closes the frontmatter.
const Fence = "---"

// Split separates the frontmatter from the body. A note with no Fence has no
// frontmatter and is all body, which is an ordinary markdown file and not an
// error.
func Split(text string) (front, body string) {
	text = strings.ReplaceAll(text, "\r\n", "\n")
	if !strings.HasPrefix(text, Fence+"\n") {
		return "", text
	}
	rest := text[len(Fence)+1:]
	end := strings.Index(rest, "\n"+Fence)
	if end < 0 {
		return "", text
	}
	// The blank line between the fence and the prose is formatting, so it is
	// not part of what a person wrote.
	after := rest[end+len(Fence)+1:]
	return rest[:end], strings.TrimLeft(after, "\n")
}

// Front is what the frontmatter holds. A value is a string, or a list of
// strings. Nothing else is written, so nothing else is read.
type Front map[string]any

// Parse reads the text between the fences.
func Parse(front string) (Front, error) {
	out := Front{}
	var key string
	var list []string
	flush := func() {
		if key != "" && list != nil {
			out[key] = list
		}
		list = nil
	}
	for n, raw := range strings.Split(front, "\n") {
		line := strings.TrimRight(raw, " \t")
		if strings.TrimSpace(line) == "" || strings.HasPrefix(strings.TrimSpace(line), "#") {
			continue
		}
		// A list item continues the key above it.
		if strings.HasPrefix(line, "  - ") || strings.HasPrefix(line, "- ") {
			if key == "" {
				return nil, fmt.Errorf("line %d: a list item with no key above it", n+1)
			}
			list = append(list, Unquote(strings.TrimSpace(strings.TrimPrefix(strings.TrimSpace(line), "-"))))
			continue
		}
		if strings.HasPrefix(line, " ") || strings.HasPrefix(line, "\t") {
			return nil, fmt.Errorf("line %d: nested mappings are not read here: %q", n+1, line)
		}
		flush()
		k, v, ok := strings.Cut(line, ":")
		if !ok {
			return nil, fmt.Errorf("line %d: no key: %q", n+1, line)
		}
		key = strings.TrimSpace(k)
		v = strings.TrimSpace(v)
		if v == "" {
			// The value is the list that follows, or nothing.
			out[key] = ""
			list = []string{}
			continue
		}
		out[key] = Unquote(v)
		key, list = "", nil
	}
	flush()
	for k, v := range out {
		if l, ok := v.([]string); ok && len(l) == 0 {
			out[k] = ""
		}
	}
	return out, nil
}

// Write renders in a stable order, so a token that did not change reads as a
// file that did not change, and a diff shows the field that moved. describe
// puts each field's description above it as a comment, so the guidance sits
// where the field is on every note the engine writes. A field whose value is
// blank is left out.
func Write(f Front, order []string, describe map[string]string) string {
	return write(f, order, describe, false)
}

// WriteWithBlanks renders the way Write does and keeps a field whose value is
// blank, which is what a template is for: the blank is the field a person
// fills, and a saved token leaves it out.
func WriteWithBlanks(f Front, order []string, describe map[string]string) string {
	return write(f, order, describe, true)
}

// write is the one writer of frontmatter, for the saved token and the
// template alike, so the two cannot drift.
func write(f Front, order []string, describe map[string]string, keepEmpty bool) string {
	var b strings.Builder
	b.WriteString(Fence + "\n")
	seen := map[string]bool{}
	comment := func(k string) {
		if d := describe[k]; d != "" {
			b.WriteString("# " + d + "\n")
		}
	}
	writeKey := func(k string) {
		v, ok := f[k]
		if !ok || seen[k] {
			return
		}
		seen[k] = true
		switch val := v.(type) {
		case []string:
			if len(val) == 0 {
				if keepEmpty {
					comment(k)
					b.WriteString(k + ": []\n")
				}
				return
			}
			comment(k)
			b.WriteString(k + ":\n")
			for _, e := range val {
				b.WriteString("  - " + quoteInList(e) + "\n")
			}
		case string:
			if val == "" {
				if keepEmpty {
					comment(k)
					b.WriteString(k + ": \n")
				}
				return
			}
			comment(k)
			b.WriteString(k + ": " + quote(val) + "\n")
		}
	}
	for _, k := range order {
		writeKey(k)
	}
	var rest []string
	for k := range f {
		if !seen[k] {
			rest = append(rest, k)
		}
	}
	sort.Strings(rest)
	for _, k := range rest {
		writeKey(k)
	}
	b.WriteString(Fence + "\n")
	return b.String()
}

// A LINK IN A LIST KEEPS ITS QUOTES, and a link on its own does not.
//
// Both open with a bracket, which is where YAML starts a flow sequence, so
// neither is strictly a string. The difference is what a reader can tell:
// `kind: [[work-token]]` sits alone on its line and there is nothing else it
// could be, while `- [[wk-abc]]` under depends_on is a list item that opens
// another list, and a reader following the indentation has two readings.
//
// So the scalar is written the way Obsidian and a person write one, and the
// list item is written the way YAML means one.
func quoteInList(s string) string {
	if isWikiLink(s) {
		return strconv.Quote(s)
	}
	return quote(s)
}

func isWikiLink(s string) bool {
	return strings.HasPrefix(s, "[[") && strings.HasSuffix(s, "]]") &&
		!strings.ContainsAny(s, "\n\"'")
}

// A value is quoted when leaving it bare would change what it means. Quoting
// everything would be safe and would make the file unpleasant to read, and a
// person reading it is the reason the file is markdown.
func quote(s string) string {
	if s == "" {
		return `""`
	}
	// A WIKI LINK ON ITS OWN IS WRITTEN BARE, the way Obsidian and a person
	// write one. See quoteInList for why the same value inside a list is not.
	if isWikiLink(s) {
		return s
	}
	if strings.ContainsAny(s, ":#\n\"'") || strings.TrimSpace(s) != s ||
		strings.HasPrefix(s, "-") || strings.HasPrefix(s, "[") || strings.HasPrefix(s, "{") ||
		isBareWord(s) {
		return strconv.Quote(s)
	}
	return s
}

// Words YAML would read as something other than text.
//
// True and false are not among them. They are what a boolean field carries, a
// person writing one writes it bare, and a quoted boolean reads as a mistake.
// A value that is only the word true reads back as the string either way.
func isBareWord(s string) bool {
	switch strings.ToLower(s) {
	case "yes", "no", "on", "off", "null", "~":
		return true
	}
	// A WHOLE NUMBER IS WRITTEN AS A NUMBER. Every value that parsed as one was
	// quoted, so the note said seq: "45" and rounds: "4", and a person reading
	// it asks why a count is a string. Nothing is lost by leaving the quotes
	// off: a whole number written bare reads back as the same characters.
	//
	// EVERYTHING ELSE THAT LOOKS NUMERIC KEEPS THEM, because that is where bare
	// would change what it means. 007 loses its zeros, 1.5 and 1e3 come back
	// spelled differently, and each of those is a value somebody typed.
	if _, err := strconv.Atoi(s); err == nil {
		return strconv.Itoa(mustAtoi(s)) != s
	}
	if _, err := strconv.ParseFloat(s, 64); err == nil {
		return true
	}
	return false
}

// mustAtoi is Atoi where the caller has already asked whether it parses.
func mustAtoi(s string) int {
	n, _ := strconv.Atoi(s)
	return n
}

// Unquote takes the quotes off a scalar written with them, and leaves a bare
// one as it is.
func Unquote(s string) string {
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

// Str answers a field as a string, or nothing where it is a list or absent.
func Str(f Front, k string) string {
	s, _ := f[k].(string)
	return s
}

// List answers a field as a list. A lone scalar is a list of one, and a blank
// is no list.
func List(f Front, k string) []string {
	switch v := f[k].(type) {
	case []string:
		return v
	case string:
		if v == "" {
			return nil
		}
		return []string{v}
	}
	return nil
}

// Bool answers whether a field is written true.
func Bool(f Front, k string) bool { return Str(f, k) == "true" }

// Int answers a field as a number, or nought.
func Int(f Front, k string) int {
	n, _ := strconv.Atoi(Str(f, k))
	return n
}

// Given answers whether a field carries anything, whatever shape it is in.
//
// A REQUIRED FIELD MAY BE A LIST. Asking a list for its string answers nothing,
// so a required array read as text was always missing and no rationale in this
// tree could satisfy its own schema.
func Given(f Front, k string) bool {
	switch v := f[k].(type) {
	case string:
		return strings.TrimSpace(v) != ""
	case []string:
		for _, s := range v {
			if strings.TrimSpace(s) != "" {
				return true
			}
		}
	}
	return false
}
