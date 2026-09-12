// The path a rule scopes on. A caller hands an absolute path, and every rule
// reads the path the repo root holds.
// [[spec/design_output/level0#the-path-a-rule-reads]]
package main

import (
	"regexp"
	"strings"
)

func slashed(said string) string {
	return strings.ReplaceAll(said, "\\", "/")
}

func relativeTo(root, path string) string {
	said := slashed(path)
	at := strings.TrimRight(slashed(root), "/")
	if at == "" {
		return said
	}
	under := at + "/"
	if strings.HasPrefix(strings.ToLower(said), strings.ToLower(under)) {
		return said[len(under):]
	}
	return said
}

// [[spec/design_output/schema#the-underscore-parks-a-draft]]
func isDraft(path string) bool {
	for _, part := range strings.Split(slashed(path), "/") {
		if strings.HasPrefix(part, "_") {
			return true
		}
	}
	return false
}

var globParts = regexp.MustCompile(`(\*\*|\*|\?)`)

func matches(glob, path string) bool {
	return globOf(glob).MatchString(slashed(path))
}

func globOf(glob string) *regexp.Regexp {
	said := &strings.Builder{}
	said.WriteString("^")
	for _, part := range splitKeeping(glob) {
		switch part {
		case "**":
			said.WriteString(".*")
		case "*":
			said.WriteString("[^/]*")
		case "?":
			said.WriteString("[^/]")
		default:
			said.WriteString(regexp.QuoteMeta(part))
		}
	}
	said.WriteString("$")
	found, err := regexp.Compile(said.String())
	if err != nil {
		return regexp.MustCompile(`^$`)
	}
	return found
}

// [[spec/design_output/level0#the-path-a-rule-reads]]
func splitKeeping(said string) []string {
	out := []string{}
	at := 0
	for _, where := range globParts.FindAllStringIndex(said, -1) {
		out = append(out, said[at:where[0]], said[where[0]:where[1]])
		at = where[1]
	}
	return append(out, said[at:])
}
