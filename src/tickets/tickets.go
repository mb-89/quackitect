// The tickets topic: the one reading of a ticket, its Ask and its standing,
// as pure functions over a note's text, and the name tickets/all the index
// commits beside the files it reads them from.
// [[spec/tickets/the-tickets-topic-lands]]
package tickets

import (
	"path"
	"regexp"
	"strconv"
	"strings"

	"quackitect/src/q"
	"quackitect/src/yaml"
)

// The name every ticket stands under, which the index commits. [[spec/tickets/the-tickets-topic-lands]]
const AllName = "tickets/all"

// The standing a group's branch gives it, the words [[spec/design_output/work#what-the-standing-says]] names.
const (
	StandingTodo = "todo"
	StandingHeld = "held"
	StandingDone = "done"
)

const (
	groupRoute   = "group"
	openState    = "open"
	closedState  = "closed"
	askHeader    = "# Ask"
	commentOpen  = "<!--"
	commentClose = "-->"
	codeFence    = "```"
	frontFence   = "---"
)

// The two folders a ticket stands directly under, the same ones FOLDERS in src/extension/lib/lens.js names, spelled again here because a Go module imports no JavaScript. [[spec/design_output/index#the-index-answers-the-tickets]]
var folders = []string{"spec/tickets/", ".se/tickets/"}

var heading = regexp.MustCompile(`^#{1,6}(\s|$)`)

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
	// The leaves the record passes over the leaves the route holds, as done/all. [[spec/design_output/index#the-index-answers-the-tickets]]
	Progress string `json:"progress"`
	// The time the file last changed, off the file table, so a view sorts the newest done ticket first. [[spec/design_output/index#the-index-answers-the-tickets]]
	Changed int64 `json:"changed"`
}

// [[spec/tickets/the-tickets-topic-lands]]
func Registers(catalog *q.Catalog) {
	q.GivenIn(catalog, AllName, []Ticket{}, q.Doc("every ticket under the two ticket folders, with its Ask and its standing"))
}

// Whether a path stands directly under one of the two ticket folders, and no deeper: a ticket-kind note elsewhere, such as inside a leftover git worktree, is no ticket. [[spec/design_output/index#the-index-answers-the-tickets]]
func Path(rel string) bool {
	for _, folder := range folders {
		if under, ok := strings.CutPrefix(rel, folder); ok && !strings.Contains(under, "/") {
			return true
		}
	}
	return false
}

// [[spec/tickets/the-tickets-topic-lands]]
func Of(path, name, text string, changed int64) Ticket {
	front, body := split(text)
	state := word(front.Get("state"))
	if state == "" {
		state = openState
	}
	one := Ticket{
		Name:     name,
		Path:     path,
		State:    state,
		Step:     word(front.Get("step")),
		Route:    routeOf(word(front.Get("process"))),
		Group:    linkName(word(front.Get("group"))),
		Urgent:   word(front.Get("urgent")) == "true",
		Todo:     todoIn(word(front.Get("todo"))),
		Says:     askIn(body),
		Progress: progressOf(frontText(text)),
		Changed:  changed,
	}
	if one.Route == groupRoute {
		one.Standing = standingOf(state, front)
	}
	return one
}

// A ticket's standing reads off its group's, so a child answers what its branch holds. [[spec/design_output/work#what-the-standing-says]]
func All(list []Ticket) []Ticket {
	groups := map[string]string{}
	for _, one := range list {
		if one.Route == groupRoute {
			groups[one.Name] = one.Standing
		}
	}
	out := make([]Ticket, len(list))
	for at, one := range list {
		if one.Route != groupRoute && one.Group != "" {
			one.Standing = groups[one.Group]
		}
		out[at] = one
	}
	return out
}

// [[spec/tickets/the-tickets-topic-lands]]
func Ask(text string) string {
	_, body := split(text)
	return askIn(body)
}

// [[spec/design_output/work#held-derives-from-the-record]]
func Held(text string) bool {
	front, _ := split(text)
	return heldIn(front)
}

// The front parsed, and the body past its closing fence. [[spec/tickets/the-tickets-topic-lands]]
func split(text string) (*yaml.Doc, string) {
	rows := strings.Split(strings.ReplaceAll(text, "\r\n", "\n"), "\n")
	if strings.TrimSpace(rows[0]) != frontFence {
		return yaml.New(), strings.Join(rows, "\n")
	}
	for at := 1; at < len(rows); at++ {
		if strings.TrimSpace(rows[at]) != frontFence {
			continue
		}
		front := yaml.AsDoc(yaml.Read(strings.Join(rows[1:at], "\n")))
		if front == nil {
			front = yaml.New()
		}
		return front, strings.Join(rows[at+1:], "\n")
	}
	return yaml.New(), strings.Join(rows, "\n")
}

func word(said any) string {
	return strings.Trim(strings.TrimSpace(yaml.AsString(said)), `"'`)
}

// [[spec/design_output/work#held-derives-from-the-record]]
func standingOf(state string, front *yaml.Doc) string {
	switch {
	case state == closedState:
		return StandingDone
	case heldIn(front):
		return StandingHeld
	}
	return StandingTodo
}

// Whether any record item carries hash_before and no hash_after, which is the claim a take pushes, the rule heldIn in src/engine/group.js holds. [[spec/design_output/work#held-derives-from-the-record]]
func heldIn(front *yaml.Doc) bool {
	for _, item := range yaml.AsList(front.Get("record")) {
		entry := yaml.AsDoc(item)
		if entry != nil && word(entry.Get("hash_before")) != "" && word(entry.Get("hash_after")) == "" {
			return true
		}
	}
	return false
}

// The Ask chapter up to the next heading. A fence reads as text, and every comment drops, one over several rows included. [[spec/tickets/the-tickets-topic-lands]]
func askIn(body string) string {
	inAsk, fenced, inComment := false, false, false
	out := []string{}
	for _, line := range strings.Split(body, "\n") {
		bare := strings.TrimSpace(line)
		switch {
		case !inAsk:
			if strings.HasPrefix(bare, codeFence) {
				fenced = !fenced
			}
			inAsk = !fenced && bare == askHeader
		case inComment:
			inComment = !strings.Contains(bare, commentClose)
		case strings.HasPrefix(bare, codeFence):
			fenced = !fenced
			out = append(out, line)
		case fenced:
			out = append(out, line)
		case heading.MatchString(bare):
			return strings.TrimSpace(strings.Join(out, "\n"))
		case strings.HasPrefix(bare, commentOpen):
			inComment = !strings.Contains(bare, commentClose)
		default:
			out = append(out, line)
		}
	}
	return strings.TrimSpace(strings.Join(out, "\n"))
}

// A todo is any value past false: a bare true, or the name of the row the ticket stands before. [[spec/design_output/pull#the-queue-is-an-outline]]
func todoIn(said string) bool {
	return said != "" && said != "false"
}

// The route's own name, off the link the mint writes as a path or a hand writes as a name. [[spec/design_output/work#a-group-is-a-ticket]]
func routeOf(said string) string {
	name := linkName(said)
	if name == "" {
		return ""
	}
	return path.Base(name)
}

// The name a link carries, with the brackets off. [[spec/design_output/index#a-note-and-its-links]]
func linkName(said string) string {
	return strings.TrimSpace(strings.TrimSuffix(strings.TrimPrefix(strings.TrimSpace(said), "[["), "]]"))
}

// The front's own rows between its two fences, unparsed, so a reading keeps the indent the parse drops. [[spec/design_output/index#the-index-answers-the-tickets]]
func frontText(text string) string {
	rows := strings.Split(strings.ReplaceAll(text, "\r\n", "\n"), "\n")
	if strings.TrimSpace(rows[0]) != frontFence {
		return ""
	}
	for at := 1; at < len(rows); at++ {
		if strings.TrimSpace(rows[at]) == frontFence {
			return strings.Join(rows[1:at], "\n")
		}
	}
	return ""
}

// The leaves the record passes, closed or skipped, over the leaves the route holds, as done/all, and nothing where the route holds none. A step item is a `- name:` line whose nearest line two columns in is a `steps:` key, so an evidence item counts nothing. [[spec/design_output/index#the-index-answers-the-tickets]]
func progressOf(head string) string {
	lines := strings.Split(head, "\n")
	last := map[int]string{}
	indents := []int{}
	inSteps := false
	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if trimmed == "" {
			continue
		}
		indent := len(line) - len(strings.TrimLeft(line, " "))
		if indent == 0 {
			inSteps = trimmed == "steps:"
		}
		if inSteps && indent >= 2 && strings.HasPrefix(trimmed, "- name:") && last[indent-2] == "steps:" {
			indents = append(indents, indent)
		}
		last[indent] = trimmed
	}
	all := 0
	for at, indent := range indents {
		if at+1 == len(indents) || indents[at+1] <= indent {
			all++
		}
	}
	if all == 0 {
		return ""
	}
	return strconv.Itoa(len(passedSteps(lines))) + "/" + strconv.Itoa(all)
}

// The steps a record entry closes, by a hash after or a skip. [[spec/design_output/index#the-index-answers-the-tickets]]
func passedSteps(lines []string) map[string]bool {
	out := map[string]bool{}
	inRecord := false
	step := ""
	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if line != "" && line[0] != ' ' {
			inRecord = trimmed == "record:"
			continue
		}
		if !inRecord {
			continue
		}
		if said, found := strings.CutPrefix(trimmed, "- step:"); found {
			step = strings.TrimSpace(said)
			continue
		}
		after, isAfter := strings.CutPrefix(trimmed, "hash_after:")
		if (isAfter && strings.TrimSpace(after) != "" && strings.TrimSpace(after) != `""`) || trimmed == "skipped: true" {
			out[step] = true
		}
	}
	return out
}
