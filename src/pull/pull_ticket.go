// The ticket writes the pull shares with the note and open verbs: a ticket
// minted off a route with a hand's line as its Ask, the voice over that Ask,
// and a draft's open, off src/scripts/ticket.js and ticket-ask-lint.js.
// [[spec/design_output/pull#a-draft-opens]]
package pull

import (
	"fmt"
	"path"
	"strings"

	"quackitect/src/modules/check"
	"quackitect/src/note"
	"quackitect/src/yaml"
)

// The first leaf of a route. [[spec/design_output/pull#a-draft-opens]]
func firstLeafOf(route any) string {
	for _, one := range EntriesIn(route) {
		if one.Leaf {
			return one.Path
		}
	}
	return ""
}

// A route each of whose leaves at the top names the step a hand held when it minted the ticket. [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
func FromHold(route []any, ticket, held string) []any {
	if ticket == "" || held == "" {
		return route
	}
	out := make([]any, 0, len(route))
	for _, one := range route {
		step := yaml.AsDoc(one)
		if step == nil || step.Get("steps") != nil {
			out = append(out, one)
			continue
		}
		put := cloneValue(step).(*yaml.Doc)
		put.Set("from", ticket+"/"+held)
		out = append(out, put)
	}
	return out
}

// A ticket minted off a route, the hand's line as its Ask. The Ask reads through the voice before any write, so a refusal writes nothing. [[spec/design_output/pull#a-draft-opens]]
func (it *It) routed(where string, held Process, steps []any, line string, fields map[string]any) (string, []string, string) {
	if it.Schemas == nil {
		return "", nil, "this box reads no schema, so no ticket mints"
	}
	put := map[string]any{}
	for key, value := range fields {
		put[key] = value
	}
	put["process"], put["process_hash"], put["steps"] = held.Link, held.Hash, steps
	put["step"] = firstLeafOf(held.Route)
	put["Ask"] = strings.TrimSpace(strings.Join([]string{AskRows(held.Ask), "", line}, "\n"))
	text, why := check.Minted(it.Schemas(), "ticket", where, put)
	if why != "" {
		return "", nil, why
	}
	refused, warned := it.askFaults(where, text)
	if len(refused) > 0 {
		return "", nil, lineRefusal(where, refused)
	}
	return text, warned, ""
}

// The ticket a route mints, or why it mints none. [[spec/design_output/pull#a-draft-opens]]
func (it *It) RoutedTicket(where string, held Process, steps []any, line string, fields map[string]any) (string, string) {
	text, _, why := it.routed(where, held, steps, line, fields)
	return text, why
}

// The whole ticket goes to the voice, and the findings on the Ask's lines stay, so a line number names the file's line. The lines that refuse and the lines that warn come back apart. [[spec/design_output/pull#a-draft-opens]]
func (it *It) askFaults(where, text string) (refused, warned []string) {
	if it.Voice == nil {
		return nil, nil
	}
	sections := note.Read(text).Sections
	at := -1
	for i, one := range sections {
		if strings.ToLower(one.Header) == "ask" {
			at = i
			break
		}
	}
	if at < 0 {
		return nil, nil
	}
	last := chapterEnd(sections, at, 1, len(rowsOf(text)))
	for _, fault := range it.Voice(where, text, sections[at].Line, last) {
		row := fmt.Sprintf("  line %d breaks %s: %s", fault.Line, fault.Rule, fault.Message)
		if fault.Refuses {
			refused = append(refused, row)
		} else {
			warned = append(warned, row)
		}
	}
	return refused, warned
}

// [[spec/design_output/pull#a-draft-opens]]
func askRefusal(said string, found []string) string {
	return strings.Join(append(append([]string{said + " holds an Ask that breaks the voice rules, and the Ask is the engine's once it opens:"}, found...), "", "Rewrite the Ask, then open it again."), "\n")
}

// A verb that writes the Ask from a hand's line refuses before it writes, so no file stands. [[spec/design_output/pull#a-draft-opens]]
func lineRefusal(said string, found []string) string {
	return strings.Join(append(append([]string{said + " would hold an Ask that breaks the voice rules, so the verb writes nothing:"}, found...), "", "Rewrite the line, then run the verb again."), "\n")
}

// A break of form lands with the Ask, and the verb names each line. [[spec/design_output/pull#a-draft-opens]]
func AskWarning(said string, found []string) string {
	return strings.Join(append([]string{said + " holds an Ask that breaks a rule of form, and it lands. Leave the lines as they stand, and carry on:"}, found...), "\n")
}

// The rows of an Ask a hand wrote, its comments aside. [[spec/design_output/pull#a-draft-opens]]
func askLines(own []string) []string {
	out := []string{}
	for _, row := range own {
		if !commentRow.MatchString(row) {
			out = append(out, row)
		}
	}
	return out
}

// The road from a draft to an open ticket, which the open verb and the pull's trivial draft share. It answers the step it opens at, or the refusal. [[spec/design_output/pull#a-draft-opens]]
func (it *It) OpensDraft(at string) (string, string) {
	text, _ := it.Disk.Read(at)
	read := note.Read(text)
	asked := false
	for _, one := range read.Sections {
		if strings.ToLower(one.Header) != "ask" {
			continue
		}
		for _, row := range askLines(one.Own) {
			asked = asked || strings.TrimSpace(row) != ""
		}
		break
	}
	if !asked {
		return "", at + " holds an empty ask, and open waits for one. Write the ask first."
	}
	called := strings.TrimSuffix(path.Base(at), ".md")
	if alone := EmptyGroup(it.Disk, text, called); alone != "" {
		return "", alone
	}
	refused, warned := it.askFaults(at, text)
	if len(refused) > 0 {
		return "", askRefusal(at, refused)
	}
	if len(warned) > 0 {
		it.Errorln(AskWarning(at, warned))
	}
	step := strings.TrimSpace(yaml.AsString(read.Front.Said.Get("step")))
	if step == "" {
		step = firstLeafOf(read.Front.Said.Get("steps"))
	}
	one := &Held{Name: called, Path: at, Text: withField(withField(text, "state", Open), "step", step), Private: strings.HasPrefix(at, Notes+"/")}
	if refused := it.landedAlone(one, []string{"opens"}); refused != "" {
		return "", fmt.Sprintf("the hook refuses the commit, so %s stands a draft:\n%s", at, refused)
	}
	return step, ""
}
