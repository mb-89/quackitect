// The tools a session registers, off the real wiring, hold every verb the
// command line answers: each topic's verbs, and every other verb under the
// verb topic.
// [[spec/tickets/agents-call-quack-directly]]
package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	verbsmodule "quackitect/src/modules/verbs"
	"quackitect/src/q"
	"quackitect/src/q/tool"
)

// The folder holding one program a verb, which the case reads as the verb table. [[spec/tickets/cli-js-leaves]]
const programsFolder = "src/scripts/verbs"

// The verbs a topic of its own answers, each with its list. [[spec/tickets/agents-call-quack-directly]]
var topics = map[string][]verbsmodule.Verb{
	"ticket":  verbsmodule.TicketVerbs,
	"retro":   verbsmodule.RetroVerbs,
	"branch":  verbsmodule.BranchVerbs,
	"vehicle": verbsmodule.VehicleVerbs,
	"stub":    verbsmodule.StubVerbs,
}

func programTable(t *testing.T) []string {
	t.Helper()
	listed, err := os.ReadDir(filepath.Join("..", "..", filepath.FromSlash(programsFolder)))
	if err != nil {
		t.Fatal(err)
	}
	var out []string
	for _, one := range listed {
		if verb, ok := strings.CutSuffix(one.Name(), ".js"); ok {
			out = append(out, verb)
		}
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
	table := programTable(t)
	if len(table) == 0 {
		t.Fatalf("%s lists no verb", programsFolder)
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
