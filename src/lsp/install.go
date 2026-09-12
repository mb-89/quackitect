// What the install script says it installs, and what the Vale settings draw.
// Both rules read one file as text, because the shape each holds is a line.
// [[spec/design_output/tools#what-the-survey-names]]
package main

import (
	"regexp"
)

var (
	installsAt = regexp.MustCompile(`^\s*([a-z][a-z0-9-]*)\)\s*(?:\[ -x "\$bin/|have )`)
	levelAt    = regexp.MustCompile(`(?m)^\s*MinAlertLevel\s*=\s*(\S+)`)
	spellingAt = regexp.MustCompile(`BasedOnStyles.*Spelling`)
	sourceAt   = regexp.MustCompile(`^(?:src|\.claude)/.*\.js$`)
	textAt     = regexp.MustCompile(`(?i)\.(?:md|markdown|txt|ya?ml|json|js|ts|tsx|go|sh|ps1|ini|mod)$`)
	deletesAt  = regexp.MustCompile(`\bremove\(|\bunlink|\brm\b|\bprune\b`)
	loggedAt   = regexp.MustCompile(`(?i)log`)
)

// [[spec/design_output/tools#what-the-survey-names]]
func installedTools(text string) []string {
	out := []string{}
	for _, line := range splitLines(text) {
		if found := installsAt.FindStringSubmatch(line); found != nil {
			out = append(out, found[1])
		}
	}
	return out
}

func valeLevel(ini string) string {
	found := levelAt.FindStringSubmatch(ini)
	if found == nil {
		return ""
	}
	return found[1]
}

func spellingStyle(ini string) bool {
	return spellingAt.MatchString(ini)
}

func sourceFile(path string) bool { return sourceAt.MatchString(slashed(path)) }

func textFile(path string) bool { return textAt.MatchString(slashed(path)) }
