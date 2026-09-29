// The tools a session registers, off the real wiring, hold every verb the
// command line answers: each topic's verbs, and every other verb under the
// verb topic.
// [[spec/tickets/agents-call-quack-directly]]
package main

import (
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"testing"

	verbsmodule "quackitect/src/modules/verbs"
	"quackitect/src/q"
	"quackitect/src/q/tool"
)

// The file whose verb table the case reads, and the table's opening and closing lines. [[spec/tickets/agents-call-quack-directly]]
const (
	cliFile   = "src/scripts/cli.js"
	tableOpen = "export const verbs = {"
	tableEnd  = "\n};"
)

var verbRow = regexp.MustCompile(`(?m)^  ([a-z]+): \{`)

// The verbs a topic of its own answers, each with its list. [[spec/tickets/agents-call-quack-directly]]
var topics = map[string][]verbsmodule.Verb{
	"ticket":  verbsmodule.TicketVerbs,
	"retro":   verbsmodule.RetroVerbs,
	"branch":  verbsmodule.BranchVerbs,
	"vehicle": verbsmodule.VehicleVerbs,
	"stub":    verbsmodule.StubVerbs,
}

func cliTable(t *testing.T) []string {
	t.Helper()
	text, err := os.ReadFile(filepath.Join("..", "..", filepath.FromSlash(cliFile)))
	if err != nil {
		t.Fatal(err)
	}
	_, table, ok := strings.Cut(string(text), tableOpen)
	if !ok {
		t.Fatalf("%s holds no verb table", cliFile)
	}
	table, _, _ = strings.Cut(table, tableEnd)
	var out []string
	for _, one := range verbRow.FindAllStringSubmatch(table, -1) {
		out = append(out, one[1])
	}
	return out
}

func registered(t *testing.T) map[string]bool {
	t.Helper()
	text, err := os.ReadFile(filepath.Join("..", "..", filepath.FromSlash(q.WiringFile)))
	if err != nil {
		t.Fatal(err)
	}
	w, err := q.ReadWiring(string(text))
	if err != nil {
		t.Fatal(err)
	}
	c := q.New()
	if _, _, err := loaded(w, c); err != nil {
		t.Fatal(err)
	}
	store := q.NewStore(c)
	out := map[string]bool{}
	for _, name := range store.Names() {
		if _, _, ok := store.Types(name); ok {
			out[tool.Name(name)] = true
		}
	}
	return out
}

func TestEveryVerbStandsAmongTheTools(t *testing.T) {
	tools := registered(t)
	table := cliTable(t)
	if len(table) == 0 {
		t.Fatalf("%s lists no verb", cliFile)
	}
	var missing []string
	for _, verb := range table {
		if subs, ok := topics[verb]; ok {
			for _, one := range subs {
				if name := tool.Name(verb + "/" + one.Name); !tools[name] {
					missing = append(missing, name)
				}
			}
			continue
		}
		if name := tool.Name(verbsmodule.TreeTopic + "/" + verb); !tools[name] {
			missing = append(missing, name)
		}
	}
	if len(missing) > 0 {
		t.Fatalf("the session registers no tool %v", missing)
	}
}

// The module types hold the verb topic under the name the wiring loads. [[spec/tickets/agents-call-quack-directly]]
func TestTheModuleTypesHoldTheVerbTopic(t *testing.T) {
	if _, ok := modules[verbsmodule.TreeTopic]; !ok {
		t.Fatalf("the module types hold no %s", verbsmodule.TreeTopic)
	}
}
