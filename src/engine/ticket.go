package main

import (
	"encoding/json"
	"os"
)

// THE TICKET. se work --on arms exactly one gated write, and the write spends it.
//
// A standing hand is what lets an agent forget to switch: it names a token once
// and every edit after that files under whatever it named first.

// SpendsATicket is the half of WriteTools that names the file it changes. A
// shell names none, so it keeps the standing hand and does not spend.
var SpendsATicket = map[string]bool{
	"Write": true, "Edit": true, "MultiEdit": true, "NotebookEdit": true,
}

type tickets struct {
	Armed map[string]string `json:"armed"` // actor to the token it named
}

func ticketPath(r Roots) string { return r.Private("tickets.json") }

func loadTickets(r Roots) tickets {
	t := tickets{Armed: map[string]string{}}
	b, err := os.ReadFile(ticketPath(r))
	if err != nil || json.Unmarshal(b, &t) != nil || t.Armed == nil {
		return tickets{Armed: map[string]string{}}
	}
	return t
}

func saveTickets(r Roots, t tickets) {
	b, err := json.MarshalIndent(t, "", "  ")
	if err != nil || os.MkdirAll(r.Private(), 0o755) != nil {
		return
	}
	_ = os.WriteFile(ticketPath(r), append(b, nl...), 0o644)
}

// ArmTicket is called where a token is named, and nowhere else.
func ArmTicket(r Roots, actor, id string) {
	all := loadTickets(r)
	all.Armed[actor] = id
	saveTickets(r, all)
}

// SpendTicket takes the ticket and answers the token it named.
func SpendTicket(r Roots, actor string) (string, bool) {
	all := loadTickets(r)
	id, armed := all.Armed[actor]
	if !armed {
		return "", false
	}
	delete(all.Armed, actor)
	saveTickets(r, all)
	return id, true
}

// TicketArmed asks without spending.
func TicketArmed(r Roots, actor string) (string, bool) {
	id, armed := loadTickets(r).Armed[actor]
	return id, armed
}

// holdsAReview answers whether this actor is holding a review. The queue put
// that token in its hands, so it writes without naming one.
func holdsAReview(r Roots, actor string) bool {
	for _, t := range Tokens(r) {
		if t.Holder == actor && (t.Status == ImpInReview || t.Status == SpecInReview) {
			return true
		}
	}
	return false
}
