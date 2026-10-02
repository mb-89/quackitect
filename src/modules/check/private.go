// The box names the owner, and nothing private travels. Every check reads
// strings alone, so a caller hands the names in.
// [[spec/design_output/private#the-box-names-the-owner]]
package check

import (
	"regexp"
	"strings"
	"sync"
)

// [[spec/design_output/private#the-box-names-the-owner]]
var nobody = map[string]bool{
	"user": true, "root": true, "one": true, "somebody": true, "nobody": true,
	"agent": true, "claude": true, "runner": true, "ubuntu": true, "vscode": true,
}

func namesAPerson(said string) bool {
	name := strings.TrimSpace(said)
	if name == "" {
		return false
	}
	return !nobody[strings.ToLower(name)]
}

// [[spec/design_output/private#the-box-names-the-owner]]
// A line missing the name meets no pattern, so the sweep compiles nothing for it. [[spec/tickets/check-patterns-compile-once]]
func carriesTheName(line, name string) bool {
	if name == "" || !strings.Contains(line, name) {
		return false
	}
	return namePattern(name).MatchString(line)
}

// The pattern a name matches as a word, compiled once a name, since the sweep asks it of every line. [[spec/tickets/check-patterns-compile-once]]
var namePatterns sync.Map

func namePattern(name string) *regexp.Regexp {
	if held, ok := namePatterns.Load(name); ok {
		return held.(*regexp.Regexp)
	}
	found := regexp.MustCompile(`(^|[^A-Za-z0-9])` + regexp.QuoteMeta(name) + `([^A-Za-z0-9]|$)`)
	namePatterns.Store(name, found)
	return found
}

func homeNames(home string) bool {
	parts := []string{}
	for _, one := range strings.Split(slashed(home), "/") {
		if one != "" {
			parts = append(parts, one)
		}
	}
	if len(parts) == 0 {
		return false
	}
	return namesAPerson(parts[len(parts)-1])
}
