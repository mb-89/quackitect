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
	t.Run("the programs and the modules nothing imports leave the tree", func(t *testing.T) {
		for _, one := range leftScripts {
			if _, err := os.Stat(filepath.Join("..", "scripts", filepath.FromSlash(one))); !errors.Is(err, fs.ErrNotExist) {
				t.Errorf("src/scripts/%s stands, and the port takes it out", one)
			}
		}
	})
}
