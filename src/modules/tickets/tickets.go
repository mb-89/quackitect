// The tickets module: the loaded projection of the ticket folders through the
// markdown codec, and the one reading of a ticket, its Ask and its standing,
// as pure functions over a note's text, under the out-port all.
// [[spec/tickets/tickets-becomes-a-module]]
package tickets

import (
	"path"
	"regexp"
	"sort"
	"strconv"
	"strings"

	"quackitect/src/q"
	"quackitect/src/ticket"
	"quackitect/src/yaml"
)

// The ports, by their local names: the files in, the notes the projection parses, and every ticket out. [[spec/tickets/tickets-becomes-a-module]]
const (
	FilesPort = "files/<path...>"
	NotesPort = "notes"
	AllPort   = "all"
	CloudPort = "cloud"
)

// The kind a ticket's front names, bare or as a link. [[spec/design_output/index#the-index-answers-the-tickets]]
const ticketKind = "ticket"

// The file ending a note carries. [[spec/design_output/index#the-index-answers-the-tickets]]
const noteExt = ".md"

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
	// A record's returns reads as a float of this width, the width a JavaScript number holds. [[spec/tickets/the-queue-moves-to-plan]]
	floatBits = 64
)

// The two folders a ticket stands directly under, the same ones FOLDERS in src/extension/lib/lens.js names, spelled again here because a Go module imports no JavaScript. [[spec/design_output/index#the-index-answers-the-tickets]]
var folders = []string{"spec/tickets/", ".se/tickets/"}

var heading = regexp.MustCompile(`^#{1,6}(\s|$)`)

// The type stands in a pure package, so a reader wired to all shares it. [[spec/tickets/the-queue-becomes-a-module]]
type Ticket = ticket.Ticket

// The notes stand as a loaded projection over the two folders, so the codec's suite round-trips every ticket, and all reads the files through the same codec. [[spec/tickets/tickets-becomes-a-module]]
func Registers(c *q.Catalog) q.Writer {
	notes := q.ProjectIn(c, NotesPort, folders[0]+"*"+noteExt, Markdown, q.Loaded, Note{}, q.Also(folders[1]+"*"+noteExt), q.Doc("a ticket file, as its front and its body"))
	all := q.DerivedIn(c, AllPort, []Ticket{}, allOf, q.Doc("every ticket under the two ticket folders, with its Ask and its standing"))
	cloud := q.DerivedIn(c, CloudPort, []string{}, cloudOf, q.Doc("the tickets the cloud holds: every group carrying the mark, and every ticket naming one"))
	return q.Join(notes, all, cloud)
}

// Every ticket the cloud holds, by name: a group carrying the mark, and every ticket naming one, the rule cloudsIn in src/scripts/work-answer.js holds. [[spec/tickets/the-queue-reads-the-marker]]
func cloudOf(in allIn) []string {
	marked := map[string]bool{}
	for _, one := range in.All {
		if one.Cloud {
			marked[one.Name] = true
		}
	}
	out := []string{}
	for _, one := range in.All {
		if marked[one.Name] || marked[one.Group] {
			out = append(out, one.Name)
		}
	}
	sort.Strings(out)
	return out
}

// The key a group's front carries where the cloud holds it, which CLOUD_MARK in src/scripts/work-merge.js names and a Go module spells again. [[spec/tickets/the-queue-reads-the-marker]]
const cloudMark = "cloud"

// The hand a leaf names where a person takes it. [[spec/design_output/pull#the-queue-is-a-score]]
const personHand = "person"

// The anchor a todo names: nothing where the front reads none or false, first for a bare true, and the word itself otherwise, the rule todoOf in src/engine/group.js holds. [[spec/design_output/pull#a-todo-forces-a-place]]
func todoAt(said string) string {
	switch said {
	case "", "false":
		return ""
	case "true":
		return "first"
	}
	return said
}

// The hand the leaf at a step path names, walked down the route's steps a segment at a time, and nothing where the path reaches no leaf. [[spec/design_output/pull#the-queue-is-a-score]]
func byAt(front *yaml.Doc, step string) string {
	if step == "" {
		return ""
	}
	steps := yaml.AsList(front.Get("steps"))
	segments := strings.Split(step, "/")
	for at, segment := range segments {
		var found *yaml.Doc
		for _, item := range steps {
			if one := yaml.AsDoc(item); one != nil && word(one.Get("name")) == segment {
				found = one
				break
			}
		}
		if found == nil {
			return ""
		}
		if at == len(segments)-1 {
			return word(found.Get("by"))
		}
		steps = yaml.AsList(found.Get("steps"))
	}
	return ""
}

// The tickets all answers. [[spec/tickets/the-queue-reads-the-marker]]
type allIn struct {
	All []Ticket `q:"all"`
}

// Every file the module reads, keyed by its path. [[spec/tickets/tickets-becomes-a-module]]
type filesIn struct {
	Files map[string]q.Content `q:"files/<path...>"`
}

// Every ticket-kind note directly under a ticket folder, named by its file, in path order. A file that left reads the empty Content, and a file the codec refuses stands out. [[spec/tickets/tickets-becomes-a-module]]
func allOf(in filesIn) []Ticket {
	paths := make([]string, 0, len(in.Files))
	for at, file := range in.Files {
		if file.Hash != "" && strings.HasSuffix(at, noteExt) && Path(at) {
			paths = append(paths, at)
		}
	}
	sort.Strings(paths)
	out := []Ticket{}
	for _, at := range paths {
		file := in.Files[at]
		note, err := Markdown.Parse([]byte(file.Text))
		if err != nil || strings.Trim(word(note.Front().Get("kind")), "[]") != ticketKind {
			continue
		}
		out = append(out, Of(at, strings.TrimSuffix(path.Base(at), noteExt), file.Text, file.Changed))
	}
	return All(out)
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
		Name:      name,
		Path:      path,
		State:     state,
		Step:      word(front.Get("step")),
		Route:     routeOf(word(front.Get("process"))),
		Group:     linkName(word(front.Get("group"))),
		Urgent:    word(front.Get("urgent")) == "true",
		Todo:      todoIn(word(front.Get("todo"))),
		Says:      askIn(body),
		Progress:  progressOf(frontText(text)),
		Changed:   changed,
		DependsOn: dependsOnIn(front),
		Fails:     failsIn(front),
		TodoAt:    todoAt(word(front.Get("todo"))),
		Cloud:     word(front.Get(cloudMark)) == "true",
		Held:      heldIn(front),
		Person:    byAt(front, word(front.Get("step"))) == personHand,
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

// The tickets one waits on, a list or one line split at each comma, the rule dependsOn in src/engine/group.js holds. [[spec/tickets/the-queue-moves-to-plan]]
func dependsOnIn(front *yaml.Doc) []string {
	var out []string
	for _, line := range yaml.StringsOf(front.Get("depends_on")) {
		for _, part := range strings.Split(line, ",") {
			bare := strings.TrimSuffix(strings.TrimPrefix(strings.TrimSpace(part), "["), "]")
			bare = strings.TrimSpace(trimOne(bare, `"'`))
			if bare != "" {
				out = append(out, bare)
			}
		}
	}
	return out
}

// One quote off each end, where one stands there. [[spec/tickets/the-queue-moves-to-plan]]
func trimOne(said, quotes string) string {
	if said != "" && strings.ContainsRune(quotes, rune(said[0])) {
		said = said[1:]
	}
	if said != "" && strings.ContainsRune(quotes, rune(said[len(said)-1])) {
		said = said[:len(said)-1]
	}
	return said
}

// The hand-backs that failed on a ticket, each a record item carrying returns, the rule failsOn in src/scripts/pull-queue.js holds. [[spec/tickets/the-queue-moves-to-plan]]
func failsIn(front *yaml.Doc) int {
	count := 0
	for _, item := range yaml.AsList(front.Get("record")) {
		entry := yaml.AsDoc(item)
		if entry == nil {
			continue
		}
		if returns, err := strconv.ParseFloat(word(entry.Get("returns")), floatBits); err == nil && returns > 0 {
			count++
		}
	}
	return count
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
