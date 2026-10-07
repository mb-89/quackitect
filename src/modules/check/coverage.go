// The coverage rules: every verb and tab an example shows, and every standard
// ticket's done_when naming the example proving it, both in report mode.
// [[spec/design_output/examples#the-checks]]
package check

import (
	"fmt"
	"regexp"
	"strings"

	"quackitect/src/example"
	"quackitect/src/yaml"
)

const (
	coversRule   = "ExampleCovers"
	provesRule   = "ExampleProves"
	quackAt      = "src/quack/"
	tabsFile     = quackAt + "tui_verb.go"
	examplesAt   = "spec/examples/"
	standardLink = "[[spec/processes/standard]]"
	askHeading   = "# Ask"
)

var (
	// A verb's registration in quack, by the name the action catalog gives it. [[spec/design_output/examples#the-checks]]
	registerAt = regexp.MustCompile(`\bregister(?:Box)?\("([^"]+)"`)
	// The tab registry, and each tab's name inside it. [[spec/design_output/examples#the-checks]]
	tabsAt    = regexp.MustCompile(`\btuiTabs\s*=\s*\[\]string\{([^}]*)\}`)
	tabNameAt = regexp.MustCompile(`"([^"]+)"`)
	// An example under its chapter. [[spec/design_output/examples#the-format]]
	exampleAt = regexp.MustCompile(`^spec/examples/[^/]+/[^/]+\.md$`)
)

// The names every example shows under interface. [[spec/design_output/examples#the-checks]]
func shownNames(tree *Tree) map[string]bool {
	out := map[string]bool{}
	for _, path := range tree.Paths() {
		if !exampleAt.MatchString(path) {
			continue
		}
		read, _ := example.Read(path, tree.Read(path))
		for _, name := range read.Interface {
			out[name] = true
		}
	}
	return out
}

// Each verb and tab no example names under interface. [[spec/design_output/examples#the-checks]]
func exampleCovers(tree *Tree) []Finding {
	shown := shownNames(tree)
	out := []Finding{}
	for _, path := range tree.Paths() {
		name := strings.TrimPrefix(path, quackAt)
		if name == path || strings.Contains(name, "/") || !strings.HasSuffix(name, ".go") || strings.HasSuffix(name, "_test.go") {
			continue
		}
		for at, line := range strings.Split(tree.Read(path), "\n") {
			for _, found := range registerAt.FindAllStringSubmatch(line, -1) {
				if !shown[found[1]] {
					out = append(out, unshown(path, at+1, found[1]))
				}
			}
			if path != tabsFile {
				continue
			}
			for _, tabs := range tabsAt.FindAllStringSubmatch(line, -1) {
				for _, tab := range tabNameAt.FindAllStringSubmatch(tabs[1], -1) {
					if named := "tui " + tab[1]; !shown[named] {
						out = append(out, unshown(path, at+1, named))
					}
				}
			}
		}
	}
	return out
}

// The warning on a verb or tab no example shows. [[spec/design_output/examples#the-checks]]
func unshown(path string, line int, name string) Finding {
	said := fault(coversRule, path, line, fmt.Sprintf("./RUNME.sh %s stands in no example's interface. Write an example under spec/examples naming it, per [[spec/design_output/examples#the-checks]].", name))
	said.Severity = SeverityWarning
	return said
}

// Each open standard ticket whose done_when names no example. [[spec/design_output/examples#the-checks]]
func exampleProves(tree *Tree) []Finding {
	out := []Finding{}
	for _, path := range tree.Paths() {
		if name := strings.TrimPrefix(path, ticketsAt); name == path || strings.Contains(name, "/") || !strings.HasSuffix(name, ".md") {
			continue
		}
		text := tree.Read(path)
		front := frontOf(yaml.SplitLines(text)).Said
		if yaml.AsString(front.Get("state")) != stateOpen || yaml.AsString(front.Get("process")) != standardLink {
			continue
		}
		if first, proved := proofLine(text); !proved && first > 0 {
			said := fault(provesRule, path, first, "No done_when line names the example proving this ticket. Name the file under spec/examples that shows it, per [[spec/design_output/examples#the-checks]].")
			said.Severity = SeverityWarning
			out = append(out, said)
		}
	}
	return out
}

// The first list line under the Ask, which holds done_when, and whether any of them names an example. [[spec/design_output/examples#the-checks]]
func proofLine(text string) (int, bool) {
	first, inAsk := 0, false
	for at, line := range strings.Split(text, "\n") {
		switch {
		case strings.TrimSpace(line) == askHeading:
			inAsk = true
		case inAsk && strings.HasPrefix(line, "# "):
			return first, false
		case inAsk && strings.HasPrefix(line, "- "):
			if strings.Contains(line, examplesAt) {
				return first, true
			}
			if first == 0 {
				first = at + 1
			}
		}
	}
	return first, false
}
