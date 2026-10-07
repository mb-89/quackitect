// The rules-over verb: the Go rules over the text on stdin, read as the file the
// path names, answered as JSON naming each path's rows.
// [[spec/tickets/go-rules-replace-vale]]
package main

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"sync"

	"quackitect/src/index"
	"quackitect/src/modules/lsp"
	"quackitect/src/prose"
	"quackitect/src/rules"
)

// The flag naming the path the text reads as. [[spec/tickets/go-rules-replace-vale]]
const rulesPathFlag = "--path="

// The rule the tense reader weighs. [[spec/tickets/go-rules-replace-vale]]
const pastRule = "PastTense"

// The usage the verb names where no path stands. [[spec/tickets/go-rules-replace-vale]]
const rulesOverUsage = "Usage: ./RUNME.sh rules-over --path=<path> < text"

func init() {
	register("rules-over", func(argv []string, quiet bool, out, errs io.Writer) int {
		if _, err := treeRules(); err != nil {
			fmt.Fprintln(errs, "The rules load nothing:", err)
			return exitFailed
		}
		return rulesOverVerb(os.Stdin, treeLint)(argv, quiet, out, errs)
	})
}

// The rules a root loaded, each root once a run. [[spec/tickets/go-rules-replace-vale]]
var loadedRules = struct {
	sync.Mutex
	by map[string]*rules.Set
}{by: map[string]*rules.Set{}}

// The Go rules over a root's own schema and lists, loaded once a run. [[spec/tickets/go-rules-replace-vale]]
func rulesAt(root string) (*rules.Set, error) {
	return rulesUnder(root, vehicleOf(os.Executable()))
}

// The Go rules over a work root, each file from the root and else from its vehicle, as the wiring reads. [[spec/tickets/vehicle-rules-come-down]]
func rulesUnder(root, vehicle string) (*rules.Set, error) {
	key := root + "\x00" + vehicle
	loadedRules.Lock()
	defer loadedRules.Unlock()
	if set := loadedRules.by[key]; set != nil {
		return set, nil
	}
	set, err := rules.Load(readUnder(root, vehicle))
	if err != nil {
		return nil, err
	}
	loadedRules.by[key] = set
	return set, nil
}

// A reader of a slashed path under the first root holding it, and empty where none does. [[spec/tickets/vehicle-rules-come-down]]
func readUnder(roots ...string) func(path string) string {
	return func(path string) string {
		for _, root := range roots {
			if root == "" {
				continue
			}
			if text, err := os.ReadFile(filepath.Join(root, filepath.FromSlash(path))); err == nil {
				return string(text)
			}
		}
		return ""
	}
}

// The Go rules over the tree the verb stands in. [[spec/tickets/go-rules-replace-vale]]
func treeRules() (*rules.Set, error) {
	root, err := index.Root()
	if err != nil {
		return nil, err
	}
	return rulesAt(root)
}

// The lsp tools over a root, the Go rules handed in. [[spec/tickets/go-rules-replace-vale]]
func toolsAt(root string) *lsp.Tools {
	tools := lsp.ToolsAt(root, lspChecks(root))
	tools.Rules = lspRules(root)
	return tools
}

// The Go rules as the lsp tools draw them: the rule off the check, the column off the span, and a past tense row where the tense reader reads the past. [[spec/tickets/go-rules-replace-vale]]
func lspRules(root string) func(path, text string) []lsp.Finding {
	return func(path, text string) []lsp.Finding {
		set, err := rulesAt(root)
		if err != nil {
			return []lsp.Finding{{Rule: lsp.RulesLoad, Line: 1, Column: 1, Message: "The rules load nothing, so every rule stands unchecked: " + err.Error(), Severity: "error"}}
		}
		lines := strings.Split(text, "\n")
		out := []lsp.Finding{}
		for _, one := range set.Lint(path, text) {
			rule := lsp.RuleOf(one.Check)
			if strings.HasSuffix(rule, pastRule) && (one.Line > len(lines) || !prose.ReadsAsPast(lines[one.Line-1], one.Match)) {
				continue
			}
			out = append(out, lsp.Finding{Rule: rule, Line: max(one.Line, 1), Column: max(one.Span[0], 1), Message: one.Message, Severity: one.Severity})
		}
		return out
	}
}

// The tree's rules over one text, and nothing where they load nothing. [[spec/tickets/go-rules-replace-vale]]
func treeLint(path, text string) []rules.Finding {
	set, err := treeRules()
	if err != nil {
		return nil
	}
	return set.Lint(path, text)
}

// The verb over its input and the rules it runs. [[spec/tickets/go-rules-replace-vale]]
func rulesOverVerb(in io.Reader, lint func(path, text string) []rules.Finding) twin {
	return func(argv []string, _ bool, out, errs io.Writer) int {
		path := ""
		for _, word := range argv[1:] {
			if named, found := strings.CutPrefix(word, rulesPathFlag); found {
				path = named
			}
		}
		if path == "" {
			fmt.Fprintln(errs, rulesOverUsage)
			return exitUsage
		}
		text, err := io.ReadAll(in)
		if err != nil {
			fmt.Fprintln(errs, err)
			return exitFailed
		}
		said := map[string][]rules.Finding{}
		if found := lint(path, string(text)); len(found) > 0 {
			said[path] = found
		}
		body, err := json.Marshal(said)
		if err != nil {
			fmt.Fprintln(errs, err)
			return exitFailed
		}
		fmt.Fprintln(out, string(body))
		return 0
	}
}
