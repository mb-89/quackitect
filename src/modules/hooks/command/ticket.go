// The ticket a call names, read off the tree, off src/engine/named.js: an
// open ticket, what stands in hand, or the fault that stops the call.
// [[spec/tickets/cage-command-rules-port]]
package command

import (
	"encoding/json"
	"regexp"
	"strings"

	"quackitect/src/yaml"
)

// The folder of the holds, the plan, the closed state, and the front's fence. [[spec/design_output/level0#a-write-names-its-ticket]]
const (
	// .claude/skills/level0/lib/folders.js owns the runtime folder, and the package spells it again. [[spec/design_output/level0#a-write-names-its-ticket]]
	holdFolder = ".se/.runtime/hold"
	// .claude/skills/level0/lib/folders.js owns the runtime folder, and the package spells it again. [[spec/design_output/level0#a-write-names-its-ticket]]
	plans      = ".se/.runtime/plan.json"
	closed     = "closed"
	stateKey   = "state"
	frontFence = "---"
	heldEnd    = ".json"
)

// The road a description takes to name its ticket. [[spec/design_output/level0#a-shell-names-its-ticket]]
const DescriptionHow = "Open the description with <ticket>: what it does, where <ticket> names the open ticket this call serves: its file name under " + publicTickets + " or " + privateTickets + ", without " + noteEnd + "."

// [[spec/design_output/level0#a-write-names-its-ticket]]
var head = regexp.MustCompile(`^([^\s:]+):`)

// The files under the root the door reads: a file's text, and the names a folder holds. [[spec/tickets/cage-command-rules-port]]
type Tree interface {
	Read(path string) (string, bool)
	List(folder string) []string
}

// What stands in hand: every ticket a hold names, and the plan's working todo. [[spec/tickets/the-todo-joins-the-queue]]
type Hand struct {
	Tickets []string
	Todo    string
}

// The ticket door: a command running a free verb alone passes, and so does a description opening on the working todo. [[spec/design_output/level0#a-shell-names-its-ticket]]
func TicketDoor(command, description string, tree Tree) string {
	if FreeOfTicket(command) {
		return ""
	}
	if todo := InHand(tree).Todo; todo != "" && strings.HasPrefix(strings.TrimSpace(description), todo+":") {
		return ""
	}
	return TicketFault(TicketOf(description), tree, DescriptionHow)
}

// The ticket a text names at its head. [[spec/design_output/level0#a-write-names-its-ticket]]
func TicketOf(text string) string {
	if found := head.FindStringSubmatch(strings.TrimSpace(text)); found != nil {
		return found[1]
	}
	return ""
}

// The fault stopping a call naming name, or nothing: a name in hand passes, and with nothing in hand any open ticket does. [[spec/design_output/level0#a-write-names-its-ticket]]
func TicketFault(name string, tree Tree, how string) string {
	raw := strings.TrimSpace(name)
	said := strings.TrimSuffix(raw, noteEnd)
	said = said[strings.LastIndex(said, "/")+1:]
	if said == "" {
		return "This write names no ticket. " + how
	}
	hand := InHand(tree)
	if holds(hand.Tickets, said) || (hand.Todo != "" && raw == hand.Todo) {
		return ""
	}
	if len(hand.Tickets) > 0 || hand.Todo != "" {
		return said + " stands outside what is in hand. " + handLine(hand) + " " + how
	}
	for _, folder := range []string{publicTickets, privateTickets} {
		if text, ok := tree.Read(folder + "/" + said + noteEnd); ok {
			if stateOf(text) == closed {
				return said + " stands closed. " + how
			}
			return ""
		}
	}
	return "No ticket named " + said + " stands under " + publicTickets + " or " + privateTickets + ". " + how
}

// What stands in hand on the box: every ticket a hold still names, and the plan's working todo. [[spec/tickets/the-hand-reads-plans-here]]
func InHand(tree Tree) Hand {
	var hand Hand
	for _, name := range tree.List(holdFolder) {
		if !strings.HasSuffix(name, heldEnd) {
			continue
		}
		var held struct {
			Ticket any `json:"ticket"`
			Path   any `json:"path"`
		}
		text, _ := tree.Read(holdFolder + "/" + name)
		if json.Unmarshal([]byte(text), &held) != nil {
			continue
		}
		ticket := strings.TrimSpace(yaml.JSONText(held.Ticket))
		if ticket != "" && !holds(hand.Tickets, ticket) && stillHeld(tree, yaml.JSONText(held.Path)) {
			hand.Tickets = append(hand.Tickets, ticket)
		}
	}
	var plan struct {
		Working any `json:"working"`
	}
	if text, ok := tree.Read(plans); ok && json.Unmarshal([]byte(text), &plan) == nil {
		hand.Todo = strings.TrimSpace(yaml.JSONText(plan.Working))
	}
	return hand
}

// A hold stands while its ticket does, and a hold naming no path or a file standing nowhere here stands. [[spec/design_output/pull#the-hand-and-the-hold]]
func stillHeld(tree Tree, path string) bool {
	path = strings.TrimSpace(path)
	if path == "" {
		return true
	}
	text, ok := tree.Read(path)
	return !ok || stateOf(text) != closed
}

// [[spec/tickets/the-todo-joins-the-queue]]
func handLine(hand Hand) string {
	var said []string
	if len(hand.Tickets) > 0 {
		said = append(said, "In hand: "+strings.Join(hand.Tickets, ", ")+".")
	}
	if hand.Todo != "" {
		said = append(said, "The working todo: "+hand.Todo+".")
	}
	return strings.Join(said, " ")
}

// The state a note's front names, its link brackets off. [[spec/design_output/work#a-group-is-a-ticket]]
func stateOf(text string) string {
	rows := strings.Split(strings.ReplaceAll(text, "\r\n", "\n"), "\n")
	if strings.TrimSpace(rows[0]) != frontFence {
		return ""
	}
	for at := 1; at < len(rows); at++ {
		if strings.TrimSpace(rows[at]) == frontFence {
			said := yaml.AsString(yaml.AsDoc(yaml.Read(strings.Join(rows[1:at], "\n"))).Get(stateKey))
			said = strings.TrimSuffix(strings.TrimPrefix(strings.TrimSpace(said), "[["), "]]")
			return strings.TrimSpace(said)
		}
	}
	return ""
}
