// A glob, turned into a regexp over a slash-separated path. One translation
// answers the file question and the filter on a search alike.
// [[spec/design_output/index#a-glob-becomes-a-pattern]]
package index

import (
	"regexp"
	"strings"
	"unicode/utf8"
)

func globOf(said string) (*regexp.Regexp, error) {
	var out strings.Builder
	out.WriteString("^")

	rest := said
	for len(rest) > 0 {
		switch {
		case strings.HasPrefix(rest, "**/"):
			out.WriteString("(?:[^/]+/)*")
			rest = rest[3:]
		case strings.HasPrefix(rest, "**"):
			out.WriteString(".*")
			rest = rest[2:]
		case rest[0] == '*':
			out.WriteString("[^/]*")
			rest = rest[1:]
		case rest[0] == '?':
			out.WriteString("[^/]")
			rest = rest[1:]
		case rest[0] == '[':
			shut := strings.IndexByte(rest, ']')
			if shut < 0 {
				out.WriteString(regexp.QuoteMeta("["))
				rest = rest[1:]
				continue
			}
			// A class opening on ! negates, as the shell reads it. [[spec/tickets/glob-reads-whole-runes]]
			class := rest[1:shut]
			if strings.HasPrefix(class, "!") {
				class = "^" + class[1:]
			}
			out.WriteString("[" + class + "]")
			rest = rest[shut+1:]
		case rest[0] == '{':
			shut := strings.IndexByte(rest, '}')
			if shut < 0 {
				out.WriteString(regexp.QuoteMeta("{"))
				rest = rest[1:]
				continue
			}
			out.WriteString(alternation(rest[1:shut]))
			rest = rest[shut+1:]
		default:
			// A whole rune, so a letter past ASCII stands as itself. [[spec/tickets/glob-reads-whole-runes]]
			_, size := utf8.DecodeRuneInString(rest)
			out.WriteString(regexp.QuoteMeta(rest[:size]))
			rest = rest[size:]
		}
	}

	out.WriteString("$")
	return regexp.Compile(out.String())
}

func alternation(said string) string {
	parts := strings.Split(said, ",")
	for i, one := range parts {
		parts[i] = regexp.QuoteMeta(one)
	}
	return "(?:" + strings.Join(parts, "|") + ")"
}

func matcher(said string) (func(string) bool, error) {
	if strings.TrimSpace(said) == "" {
		return func(string) bool { return true }, nil
	}

	whole, err := globOf(said)
	if err != nil {
		return nil, err
	}
	if strings.Contains(said, "/") {
		return func(path string) bool { return whole.MatchString(path) }, nil
	}
	return func(path string) bool {
		at := strings.LastIndexByte(path, '/')
		return whole.MatchString(path[at+1:])
	}, nil
}

func under(path, folder string) bool {
	clean := strings.Trim(strings.TrimPrefix(folder, "./"), "/")
	if clean == "" || clean == "." {
		return true
	}
	return path == clean || strings.HasPrefix(path, clean+"/")
}
