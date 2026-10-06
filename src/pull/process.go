// A process is a route the mint copies onto a ticket. This reads one off the
// tree and answers its route and its hash, so the mint, ticket update and
// ticket note copy the same thing, off src/scripts/process.js.
// [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
package pull

import (
	"fmt"
	"strings"

	"quackitect/src/yaml"
)

// The folder the processes stand in, and the end each file carries. [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
const (
	Processes  = "spec/processes"
	processEnd = ".yaml"
)

// A process as the tree holds it: its name, its file, the link a ticket carries, what it says, its ask, its route and its hash. [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
type Process struct {
	Name, Path, Link, Hash string
	Said                   *yaml.Doc
	Ask, Route             []any
}

// The name a link, a path or a bare name gives a process. [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
func ProcessNameOf(said string) string {
	name := strings.TrimSpace(said)
	name = strings.TrimSuffix(strings.TrimPrefix(name, "[["), "]]")
	name = strings.TrimPrefix(name, Processes+"/")
	return strings.TrimSpace(strings.TrimSuffix(name, processEnd))
}

// The name of every process the tree holds, sorted. [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
func StandingProcesses(disk Disk) []string {
	out := []string{}
	for _, one := range disk.Files(Processes) {
		if strings.HasSuffix(one, processEnd) {
			out = append(out, strings.TrimSuffix(one, processEnd))
		}
	}
	sortStrings(out)
	return out
}

// The process the words name, or why none answers. [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
func ProcessAt(disk Disk, said string) (Process, string) {
	name := ProcessNameOf(said)
	standing := strings.Join(StandingProcesses(disk), ", ")
	if name == "" {
		return Process{}, fmt.Sprintf("Name a process. %s holds %s.", Processes, standing)
	}
	path := Processes + "/" + name + processEnd
	text, ok := disk.Read(path)
	if !ok {
		return Process{}, fmt.Sprintf("%s holds no %s. It holds %s.", Processes, name, standing)
	}
	held := yaml.AsDoc(yaml.Read(text))
	if held == nil {
		held = yaml.New()
	}
	return Process{
		Name: name, Path: path, Link: Processes + "/" + name, Said: held,
		Ask: yaml.Flat(held.Get("ask")), Route: yaml.Flat(held.Get("steps")), Hash: ProcessHash(held),
	}, ""
}

// The rows an ask writes for each field it names, as comments the hand writes under. [[spec/design_input/the-agent-pulls-tickets#evidence-has-a-form]]
// The Ask a mint writes off the ask fields a hand names: a text field as a paragraph and a list field as lines, in the order the process names them. [[spec/tickets/verbs-mint-tickets-and-keys]]
func AskFrom(ask []any, said map[string][]string) string {
	return ""
}

func AskRows(ask []any) string {
	rows := []string{}
	for _, item := range ask {
		one := yaml.AsDoc(item)
		if one == nil || yaml.AsString(one.Get("name")) == "" {
			continue
		}
		form := yaml.AsString(one.Get("form"))
		if one.Get("form") == nil {
			form = "text"
		}
		rows = append(rows, fmt.Sprintf("<!-- %s, as %s: %s -->", yaml.AsString(one.Get("name")), form, yaml.AsString(one.Get("says"))))
	}
	return strings.Join(rows, "\n")
}

// The flag a mint off a handover line takes. [[spec/tickets/the-owners-words-travel-verbatim]]
const FromHandover = "--from=handover"

// A mint off a handover line writes the Ask's from line itself, so the owner's read gates the ticket whatever the hand recalls. [[spec/tickets/the-owners-words-travel-verbatim]]
func HandedOver(ask string) string {
	if said := strings.TrimSpace(ask); said != "" {
		return "from: handover\n\n" + said
	}
	return "from: handover"
}
