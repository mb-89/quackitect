// The verbs ticket, mint, graph and split run in Go: each registers from a
// file of its own, the road reaches no node for any of them, and their
// programs leave src/scripts/verbs.
// [[spec/tickets/ticket-verbs-port-to-go]]
package main

import (
	"errors"
	"io/fs"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"testing"
)

// Every verb the group ports, by the words it registers under. [[spec/tickets/ticket-verbs-port-to-go]]
var groupVerbs = []string{
	"mint", "graph", "split", "ticket",
	"ticket pull", "ticket note", "ticket update", "ticket open", "ticket todo", "ticket route",
	"ticket yours", "ticket fill", "ticket bless", "ticket place", "ticket urgent", "ticket set", "ticket new",
}

// The programs and the modules no remaining JavaScript imports, which leave with the port. [[spec/tickets/ticket-verbs-port-to-go]]
var leftScripts = []string{
	"verbs/ticket.js", "verbs/mint.js", "verbs/graph.js", "verbs/split.js",
	"mint-verb.js", "split-verb.js", "split-cut.js", "pull-tool.js",
}

var registers = regexp.MustCompile(`register\("([^"]+)"`)

func TestTicketVerbsRunInGo(t *testing.T) {
	t.Parallel()
	t.Run("each verb of the group registers a Go answer", func(t *testing.T) {
		for _, words := range groupVerbs {
			if registry[words] == nil {
				t.Errorf("the registry holds no %s", words)
			}
		}
	})
	t.Run("the road under new reaches no node for any of them", func(t *testing.T) {
		for _, words := range groupVerbs {
			argv := append(strings.Fields(words), "some-ticket")
			key, _ := twinOf(argv, registry)
			if road := roadOf(modeNew, argv, registry); road != toQuack || key != words {
				t.Errorf("%s takes the road %v under the key %q, and wants quack under its own words", words, road, key)
			}
		}
	})
	t.Run("each verb registers from a file of its own", func(t *testing.T) {
		files, err := filepath.Glob("*.go")
		if err != nil {
			t.Fatal(err)
		}
		by := map[string][]string{}
		for _, one := range files {
			if strings.HasSuffix(one, "_test.go") {
				continue
			}
			text, err := os.ReadFile(one)
			if err != nil {
				t.Fatal(err)
			}
			for _, hit := range registers.FindAllStringSubmatch(string(text), -1) {
				by[one] = append(by[one], hit[1])
			}
		}
		for _, words := range groupVerbs {
			holders := 0
			for file, said := range by {
				for _, one := range said {
					if one != words {
						continue
					}
					holders++
					if len(said) > 1 && words != "ticket yours" {
						t.Errorf("%s registers %s beside %v, and a verb registers from a file of its own", file, words, said)
					}
				}
			}
			if holders != 1 {
				t.Errorf("%s registers from %d file(s), and wants one", words, holders)
			}
		}
	})
	t.Run("no file under src or .claude imports a module the port takes out", func(t *testing.T) {
		for _, folder := range []string{filepath.Join(".."), filepath.Join("..", "..", ".claude")} {
			err := filepath.WalkDir(folder, func(at string, one fs.DirEntry, err error) error {
				if err == nil && one.IsDir() && one.Name() == "node_modules" {
					return filepath.SkipDir
				}
				if err != nil || one.IsDir() || !strings.HasSuffix(at, ".js") {
					return err
				}
				text, err := os.ReadFile(at)
				if err != nil {
					return err
				}
				for _, gone := range leftScripts {
					if importsModule(string(text), at, filepath.Join("..", "scripts", filepath.FromSlash(gone))) {
						t.Errorf("%s imports src/scripts/%s, which the port takes out", at, gone)
					}
				}
				return nil
			})
			if err != nil {
				t.Fatal(err)
			}
		}
	})
	t.Run("the programs and the modules nothing imports leave the tree", func(t *testing.T) {
		for _, one := range leftScripts {
			if _, err := os.Stat(filepath.Join("..", "scripts", filepath.FromSlash(one))); !errors.Is(err, fs.ErrNotExist) {
				t.Errorf("src/scripts/%s stands, and the port takes it out", one)
			}
		}
	})
}

var importFrom = regexp.MustCompile(`(?:from|import)\s*\(?\s*["'](\.[^"']+)["']`)

// Whether the text at the path imports the module by a relative path. [[spec/tickets/ticket-verbs-importer-case]]
func importsModule(text, at, module string) bool {
	for _, hit := range importFrom.FindAllStringSubmatch(text, -1) {
		if filepath.Clean(filepath.Join(filepath.Dir(at), filepath.FromSlash(hit[1]))) == filepath.Clean(module) {
			return true
		}
	}
	return false
}
