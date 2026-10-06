// The rules-over verb: the Go rules over the text on stdin, read as the file the
// path names, answered as Vale's JSON reporter wrote it, so every JavaScript
// caller of the Vale door reads it unchanged.
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
	"quackitect/src/rules"
)

// The flag naming the path the text reads as. [[spec/tickets/go-rules-replace-vale]]
const rulesPathFlag = "--path="

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

// The Go rules over the tree's own schema and lists, loaded once a run. [[spec/tickets/go-rules-replace-vale]]
var treeRules = sync.OnceValues(func() (*rules.Set, error) {
	root, err := index.Root()
	if err != nil {
		return nil, err
	}
	return rules.Load(func(path string) string {
		text, _ := os.ReadFile(filepath.Join(root, filepath.FromSlash(path)))
		return string(text)
	})
})

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
