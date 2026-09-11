// A GLOB IS A REGEXP NOBODY WRITES OUT. The tools hand patterns shaped like
// `**/*.js`, and the rows hold slash-separated paths, so one translation
// answers both the file question and the filter on a search.
// [[spec/design_output/index#a-glob-becomes-a-pattern]]
package main

import (
	"regexp"
	"strings"
)

// globOf turns one glob into an anchored regexp over a slash-separated path.
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
			out.WriteString(rest[:shut+1])
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
			out.WriteString(regexp.QuoteMeta(string(rest[0])))
			rest = rest[1:]
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

// matcher answers a function saying whether a path stands inside a glob. A
// glob carrying no slash reads as a name, which is what ripgrep answers.
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

// under answers whether a path sits at or inside a folder the caller names.
func under(path, folder string) bool {
	clean := strings.Trim(strings.TrimPrefix(folder, "./"), "/")
	if clean == "" || clean == "." {
		return true
	}
	return path == clean || strings.HasPrefix(path, clean+"/")
}
