// The tickets, answered off the note rows. A ticket carries its fields, and
// its standing comes off its group ticket's record and nothing else, so a
// reader asks here and opens no file and no git.
// [[spec/design_output/index#the-index-answers-the-tickets]]
package main

import (
	"database/sql"
	"path"
	"strings"
)

const (
	ticketKind  = "ticket"
	groupRoute  = "group"
	openState   = "open"
	askHeader   = "# Ask"
	commentOpen = "<!--"
)

// The standing a group's branch gives it, the words [[spec/design_output/work#what-the-standing-says]] names.
const (
	standingTodo = "todo"
	standingHeld = "held"
	standingDone = "done"
)

type Ticket struct {
	Name     string `json:"name"`
	Path     string `json:"path"`
	State    string `json:"state"`
	Step     string `json:"step"`
	Route    string `json:"route"`
	Group    string `json:"group"`
	Urgent   bool   `json:"urgent"`
	Todo     bool   `json:"todo"`
	Standing string `json:"standing"`
	Says     string `json:"says"`
}

// [[spec/design_output/index#the-index-answers-the-tickets]]
func Tickets(db *sql.DB) ([]Ticket, error) {
	rows, err := db.Query(
		`SELECT n.path, n.id, n.kind, f.text FROM note n JOIN file f ON f.path = n.path ORDER BY n.path`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := []Ticket{}
	groups := map[string]string{}
	for rows.Next() {
		var path, id, kind, text string
		if err := rows.Scan(&path, &id, &kind, &text); err != nil {
			return nil, err
		}
		if linkName(kind) != ticketKind {
			continue
		}
		one := ticketOf(path, id, text)
		if one.Route == groupRoute {
			groups[one.Name] = one.Standing
		}
		out = append(out, one)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	// A ticket's standing reads off its group's, so a child answers what its branch holds. [[spec/design_output/work#what-the-standing-says]]
	for at := range out {
		if out[at].Route != groupRoute && out[at].Group != "" {
			out[at].Standing = groups[out[at].Group]
		}
	}
	return out, nil
}

func ticketOf(path, id, text string) Ticket {
	head, body, _ := fenced(text)
	front := topOf(head)
	state := front["state"]
	if state == "" {
		state = openState
	}
	one := Ticket{
		Name:   id,
		Path:   path,
		State:  state,
		Step:   front["step"],
		Route:  routeOf(front["process"]),
		Group:  front["group"],
		Urgent: front["urgent"] == "true",
		Todo:   front["todo"] == "true",
		Says:   askLine(body),
	}
	if one.Route == groupRoute {
		one.Standing = groupStanding(state, head)
	}
	return one
}

// The route's own name, off the link the mint writes as a path or a hand writes as a name. [[spec/design_output/work#a-group-is-a-ticket]]
func routeOf(said string) string {
	name := linkName(said)
	if name == "" {
		return ""
	}
	return path.Base(name)
}

// [[spec/design_output/work#held-derives-from-the-record]]
func groupStanding(state, head string) string {
	switch {
	case state == "closed":
		return standingDone
	case heldIn(head):
		return standingHeld
	}
	return standingTodo
}

// Whether any record entry carries hash_before and no hash_after, which is the claim a take pushes. [[spec/design_output/work#held-derives-from-the-record]]
func heldIn(head string) bool {
	held := false
	entry := map[string]bool{}
	closes := func() {
		if entry["hash_before"] && !entry["hash_after"] {
			held = true
		}
		entry = map[string]bool{}
	}
	inRecord := false
	for _, line := range strings.Split(head, "\n") {
		switch {
		case strings.HasPrefix(line, "record:"):
			inRecord = true
			continue
		case !inRecord:
			continue
		case line != "" && !strings.HasPrefix(line, " "):
			closes()
			inRecord = false
			continue
		}
		bare := strings.TrimSpace(line)
		if strings.HasPrefix(bare, "- ") {
			closes()
			bare = strings.TrimPrefix(bare, "- ")
		}
		if key, value, found := strings.Cut(bare, ":"); found && strings.TrimSpace(value) != "" {
			entry[strings.TrimSpace(key)] = true
		}
	}
	closes()
	return held
}

// The whole Ask chapter, past the comments the mint leaves, because the tab's details draw it whole. [[spec/design_output/index#the-index-answers-the-tickets]]
func askLine(body string) string {
	inAsk := false
	out := []string{}
	for _, line := range strings.Split(body, "\n") {
		bare := strings.TrimSpace(line)
		switch {
		case bare == askHeader:
			inAsk = true
			continue
		case strings.HasPrefix(bare, "#"):
			if inAsk {
				return strings.TrimSpace(strings.Join(out, "\n"))
			}
			continue
		case !inAsk || strings.HasPrefix(bare, commentOpen):
			continue
		}
		out = append(out, line)
	}
	return strings.TrimSpace(strings.Join(out, "\n"))
}

// The keys standing at the top of the front, so a key nested under record or steps shadows none of them. [[spec/design_output/index#the-index-answers-the-tickets]]
func topOf(head string) map[string]string {
	out := map[string]string{}
	for _, line := range strings.Split(head, "\n") {
		if line == "" || line[0] == ' ' || line[0] == '\t' {
			continue
		}
		if key, value, found := strings.Cut(line, ":"); found && strings.TrimSpace(key) != "" {
			out[strings.TrimSpace(key)] = strings.TrimSpace(value)
		}
	}
	return out
}

// The name a link carries, with the brackets off. [[spec/design_output/index#a-note-and-its-links]]
func linkName(said string) string {
	return strings.TrimSpace(strings.TrimSuffix(strings.TrimPrefix(strings.TrimSpace(said), "[["), "]]"))
}
