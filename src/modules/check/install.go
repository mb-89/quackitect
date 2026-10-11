// What the install script says it installs, read as text, because the shape
// it holds is a line.
// [[spec/design_output/tools#what-the-survey-names]]
package check

import (
	"quackitect/src/yaml"

	"regexp"
	"strings"
)

var (
	installsAt = regexp.MustCompile(`^\s*([a-z][a-z0-9-]*)\)\s*(?:\[ -x "\$bin/|have )`)
	// The code the tree carries, past the Go tests, which clear their own temp logs. [[spec/tickets/no-log-deleted-reads-go]]
	sourceAt  = regexp.MustCompile(`^(?:src|\.claude)/.*\.(?:js|go|sh)$`)
	textAt    = regexp.MustCompile(`(?i)\.(?:md|markdown|txt|ya?ml|json|js|ts|tsx|go|sh|ps1|ini|mod)$`)
	deletesAt = regexp.MustCompile(`(?i)\b(?:os\.)?remove(?:all)?\(|\bunlink|\brm(?:sync)?\b|\bprune\b`)
	loggedAt  = regexp.MustCompile(`(?i)log`)
)

// [[spec/design_output/tools#what-the-survey-names]]
func installedTools(text string) []string {
	out := []string{}
	for _, line := range yaml.SplitLines(text) {
		if found := installsAt.FindStringSubmatch(line); found != nil {
			out = append(out, found[1])
		}
	}
	return out
}

func sourceFile(path string) bool {
	said := slashed(path)
	return sourceAt.MatchString(said) && !strings.HasSuffix(said, "_test.go")
}

func textFile(path string) bool { return textAt.MatchString(slashed(path)) }
