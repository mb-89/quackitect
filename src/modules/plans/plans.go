// The plans module: the plan tool, which writes the plan file the queue reads
// and answers the place each new todo takes. It stands
// off the wiring until the flip.
// [[spec/tickets/plan-writes-off-go]]
package plans

import (
	"bytes"
	"encoding/json"
	"fmt"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"

	"quackitect/src/q"
	"quackitect/src/q/tool"
)

// The module a plan action lists its request to, and its verb. [[spec/tickets/plan-writes-off-go]]
const (
	Module  = "plans"
	setVerb = "set"
	noUndo  = "the plan file is the box's runtime state, which the next plan call rewrites"
)

// The words a todo's place takes, which src/modules/queue/outline.go owns, the highest digit a place reads, and the clock's shape, as toISOString writes it. [[spec/design_output/pull#a-todo-forces-a-place]]
const (
	firstWord  = "true"
	endWord    = "end"
	mostPlace  = 9
	madeLayout = "2006-01-02T15:04:05.000Z"
)

// The keys the plan file opens on, in the order the bridge writes them. [[spec/design_output/stop#the-plan]]
const (
	workingKey = "working"
	todosKey   = "todos"
	placesKey  = "places"
)

// A title naming the handover, which the clear's tickets carry. [[spec/design_input/the-clear-hands-ephemeral-tickets#three-tickets-run-the-clear]]
var handover = regexp.MustCompile(`(?i)\bhandover\b`)

// What the module reads: the plan file's text and its write, the clock, the most open todos, and the queue's places over a plan text. [[spec/tickets/plan-writes-off-go]]
type Outside struct {
	Read   func() (string, error)
	Write  func(text string) error
	Now    func() time.Time
	Most   int
	Places func(planText string) map[string]string
}

// [[spec/tickets/plan-writes-off-go]]
func Registers(c *q.Catalog) q.Writer {
	return q.Join(
		q.ActionIn(c, Module+"/"+setVerb, func(in tool.Plan) []q.Request {
			return []q.Request{{Module: Module, Verb: setVerb, Args: in, NoUndo: noUndo}}
		}, q.Doc("Answers the engine's three questions: what you work on now, which todos you finished, and which you add. A todo is a title and a detail line, placed in the queue at a digit, and it stands in the work tab beside the tickets. Write a note or a ticket for anything that travels or carries detail, and a todo for the small thing you do next."), q.ToolName(tool.PlanTool), q.IO()),
	)
}

// The IO side of the module: it answers each request a plan action lists. [[spec/tickets/plan-writes-off-go]]
func Accept(from Outside) func(q.Request) (any, error) {
	return func(asked q.Request) (any, error) {
		in, ok := asked.Args.(tool.Plan)
		if !ok {
			return nil, fmt.Errorf("%s.%s takes no %T", asked.Module, asked.Verb, asked.Args)
		}
		return from.plans(in)
	}
}

// The tool: the finished leave, the new land at their place, and the working one is written down. The answer names the place each new todo takes. [[spec/design_output/stop#the-plan]]
func (from Outside) plans(in tool.Plan) (string, error) {
	before, _ := from.Read()
	plan := planOf(before)
	done := map[string]bool{}
	for _, one := range in.Done {
		if title := strings.TrimSpace(one); title != "" {
			done[title] = true
		}
	}
	kept := plan.todos[:0]
	for _, one := range plan.todos {
		if !done[one.title] && !handover.MatchString(one.title) {
			kept = append(kept, one)
		}
	}
	plan.todos = kept
	if handover.MatchString(plan.working) {
		plan.working = ""
	}
	var rows []string
	for _, one := range in.Add {
		if one.Place > 1 {
			rows = rowsOf(from.Places(before))
			break
		}
	}
	var titles, refused, early []string
	for _, one := range in.Add {
		title := strings.TrimSpace(one.Title)
		switch {
		case title == "":
			continue
		case handover.MatchString(title):
			early = append(early, title)
			continue
		case from.Most > 0 && len(plan.todos) >= from.Most:
			refused = append(refused, title)
			continue
		}
		raw, err := encoded(todo{Title: title, Details: strings.TrimSpace(one.Details), Todo: placeWord(one.Place, rows), Made: from.Now().UTC().Format(madeLayout)})
		if err != nil {
			return "", err
		}
		plan.todos = append(plan.todos, held{title: title, raw: raw})
		titles = append(titles, title)
	}
	if working := strings.TrimSpace(in.Working); working != "" && !handover.MatchString(working) {
		plan.working = working
	}
	// Finishing the thing in hand names it done, and the hand stands empty. [[spec/design_output/stop#the-plan]]
	if done[plan.working] {
		plan.working = ""
	}
	text, err := plan.text()
	if err != nil {
		return "", err
	}
	if err := from.Write(text); err != nil {
		return "", err
	}
	return from.said(plan, text, titles, refused, early), nil
}

// The answer: the count and the work, the place each new todo takes off one read after the plan stands, and the todos that stay out. [[spec/design_output/stop#the-plan]]
func (from Outside) said(plan planFile, text string, titles, refused, early []string) string {
	working := plan.working
	if working == "" {
		working = "nothing named"
	}
	said := []string{fmt.Sprintf("The plan stands: %d todo(s) open, working on %s.", len(plan.todos), working)}
	if len(titles) > 0 {
		places := from.Places(text)
		lines := make([]string, 0, len(titles))
		for _, one := range titles {
			place, ok := places[one]
			if !ok {
				place = "no place"
			}
			lines = append(lines, fmt.Sprintf("%s stands at %s.", one, place))
		}
		said = append(said, strings.Join(lines, " "))
	}
	if len(refused) > 0 {
		said = append(said, fmt.Sprintf("%d todo(s) stay out, because %d stand open already: %s. Finish one, or write a ticket.", len(refused), from.Most, strings.Join(refused, ", ")))
	}
	if len(early) > 0 {
		said = append(said, strings.Join(early, ", ")+" stays out, because the clear's tickets carry the handover and the work tab draws them.")
	}
	return strings.Join(said, " ")
}

// Every row with a whole place, in the order of its place. [[spec/design_output/stop#the-plan]]
func rowsOf(places map[string]string) []string {
	at := map[string]int{}
	var rows []string
	for name, place := range places {
		if n, err := strconv.Atoi(place); err == nil && n > 0 && strconv.Itoa(n) == place {
			at[name] = n
			rows = append(rows, name)
		}
	}
	sort.Slice(rows, func(i, j int) bool {
		if at[rows[i]] != at[rows[j]] {
			return at[rows[i]] < at[rows[j]]
		}
		return rows[i] < rows[j]
	})
	return rows
}

// A place is the todo, the way the tab writes it: first, before the row standing at that place in the queue, or at the end past every row. [[spec/design_output/pull#a-todo-forces-a-place]]
func placeWord(place int, rows []string) string {
	if place <= 1 {
		return firstWord
	}
	if place > mostPlace || place > len(rows) {
		return endWord
	}
	return rows[place-1]
}

// One todo as the bridge writes it, in its key order. [[spec/design_output/stop#the-plan]]
type todo struct {
	Title   string `json:"title"`
	Details string `json:"details"`
	Todo    string `json:"todo"`
	Made    string `json:"made"`
}

// A todo the file holds, kept as it reads, with the title the plan matches on. [[spec/design_output/stop#the-plan]]
type held struct {
	title string
	raw   json.RawMessage
}

// Another key the file holds, kept in its place. [[spec/design_output/stop#the-plan]]
type keyed struct {
	key string
	raw json.RawMessage
}

// The plan file: the work in hand, the todos, the places, and every other key it holds. [[spec/design_output/stop#the-plan]]
type planFile struct {
	working string
	todos   []held
	places  json.RawMessage
	rest    []keyed
}

// The plan off its text, and an empty one where the text reads as no object. [[spec/design_output/stop#the-plan]]
func planOf(text string) planFile {
	empty := planFile{places: json.RawMessage("{}")}
	dec := json.NewDecoder(strings.NewReader(text))
	if open, err := dec.Token(); err != nil || open != json.Delim('{') {
		return empty
	}
	out := empty
	for dec.More() {
		key, err := dec.Token()
		name, ok := key.(string)
		var raw json.RawMessage
		if err != nil || !ok || dec.Decode(&raw) != nil {
			return empty
		}
		switch name {
		case workingKey:
			json.Unmarshal(raw, &out.working)
		case todosKey:
			var todos []json.RawMessage
			json.Unmarshal(raw, &todos)
			for _, one := range todos {
				var titled struct {
					Title string `json:"title"`
				}
				json.Unmarshal(one, &titled)
				out.todos = append(out.todos, held{title: titled.Title, raw: one})
			}
		case placesKey:
			out.places = raw
		default:
			out.rest = append(out.rest, keyed{key: name, raw: raw})
		}
	}
	return out
}

// The file as the bridge writes it: the working, todos and places keys first, every other key after in its place, two spaces deep, with no HTML escape and a closing newline. [[spec/design_output/stop#the-plan]]
func (plan planFile) text() (string, error) {
	working, err := encoded(plan.working)
	if err != nil {
		return "", err
	}
	var flat bytes.Buffer
	field := func(key string, raw []byte) {
		if flat.Len() > 1 {
			flat.WriteByte(',')
		}
		name, _ := encoded(key)
		flat.Write(name)
		flat.WriteByte(':')
		flat.Write(raw)
	}
	flat.WriteByte('{')
	field(workingKey, working)
	todos := make([][]byte, 0, len(plan.todos))
	for _, one := range plan.todos {
		todos = append(todos, one.raw)
	}
	field(todosKey, append(append([]byte{'['}, bytes.Join(todos, []byte{','})...), ']'))
	field(placesKey, plan.places)
	for _, one := range plan.rest {
		field(one.key, one.raw)
	}
	flat.WriteByte('}')
	var out bytes.Buffer
	if err := json.Indent(&out, flat.Bytes(), "", "  "); err != nil {
		return "", err
	}
	return out.String() + "\n", nil
}

// A value as JSON with no HTML escape, as JSON.stringify writes it. [[spec/design_output/stop#the-plan]]
func encoded(value any) ([]byte, error) {
	var out bytes.Buffer
	enc := json.NewEncoder(&out)
	enc.SetEscapeHTML(false)
	if err := enc.Encode(value); err != nil {
		return nil, err
	}
	return bytes.TrimSuffix(out.Bytes(), []byte{'\n'}), nil
}
