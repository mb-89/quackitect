// The drawing of one ticket: the graph GraphIn in graph.go draws, the route
// the page edits, and each leaf's fields with the line a mark stands
// at and whether the chapter fills it. A read-only projection of the folders.
// [[spec/tickets/the-lens-reads-v1]]
package tickets

import (
	"bytes"
	"encoding/json"
	"errors"
	"regexp"
	"strconv"
	"strings"

	"quackitect/src/note"
	"quackitect/src/yaml"
)

// The family the drawing stands under, by its local name. [[spec/tickets/the-lens-reads-v1]]
const DrawnPort = "drawn"

// The node and edge kinds the drawing names, the field the checklist answers under, which checked in src/pull/pull_route.go owns, and the line a mark falls to where its leaf stands as no heading. [[spec/tickets/the-lens-reads-v1]]
const (
	phaseKind  = "phase"
	leafKind   = "leaf"
	passEdge   = "pass"
	failEdge   = "fail"
	holdsEdge  = "holds"
	checked    = "checked"
	checklist  = "checklist"
	firstLine  = 1
	personWord = "person"
)

// The rows a chapter's field counts nothing for, as commentRow, answeredRow and fenceRow in src/pull/pull_route.go read them. [[spec/tickets/the-lens-reads-v1]]
var (
	commentRow  = regexp.MustCompile(`^\s*<!--.*-->\s*$`)
	answeredRow = regexp.MustCompile(`^\s*answered:`)
)

// [[spec/tickets/the-lens-reads-v1]]
type Drawn struct {
	Graph  Graph                `json:"graph"`
	Steps  json.RawMessage      `json:"steps"`
	Leaves map[string]DrawnLeaf `json:"leaves"`
}

type Graph struct {
	Nodes []Node `json:"nodes"`
	Edges []Edge `json:"edges"`
}

// A node carries what nodeOf and placed give it, and a key stands only where they set it. [[spec/tickets/the-lens-reads-v1]]
type Node struct {
	ID      string  `json:"id"`
	Name    string  `json:"name"`
	Kind    string  `json:"kind"`
	Parent  string  `json:"parent"`
	Does    string  `json:"does,omitempty"`
	When    string  `json:"when,omitempty"`
	Dotted  bool    `json:"dotted,omitempty"`
	Person  bool    `json:"person,omitempty"`
	At      bool    `json:"at,omitempty"`
	Skipped bool    `json:"skipped,omitempty"`
	Why     *string `json:"why,omitempty"`
	Returns float64 `json:"returns,omitempty"`
	Reached bool    `json:"reached,omitempty"`
	Chapter string  `json:"chapter,omitempty"`
	Line    int     `json:"line,omitempty"`
}

type Edge struct {
	From  string `json:"from"`
	To    string `json:"to"`
	Kind  string `json:"kind"`
	Label string `json:"label"`
}

type DrawnLeaf struct {
	Does   string       `json:"does"`
	Fields []DrawnField `json:"fields"`
}

type DrawnField struct {
	Name   string   `json:"name"`
	Form   string   `json:"form"`
	Says   string   `json:"says"`
	Items  []string `json:"items"`
	Line   int      `json:"line"`
	Filled bool     `json:"filled"`
}

// The drawing reads a file and writes none. [[spec/tickets/the-lens-reads-v1]]
type DrawnCodec struct{}

func (DrawnCodec) Parse(body []byte) (Drawn, error) {
	return drawnOf(string(body)), nil
}

func (DrawnCodec) Serialize(Drawn) ([]byte, error) {
	return nil, errors.New("the drawing of a ticket reads its file and writes none")
}

// A step of the route as entriesIn in .claude/skills/level0/lib/schema-route.js walks it. [[spec/tickets/the-lens-reads-v1]]
type entry struct {
	name, path, parent string
	said               *yaml.Doc
	leaf               bool
}

// The drawing of a ticket: its graph, its route, and each leaf's fields. [[spec/tickets/the-lens-reads-v1]]
func drawnOf(text string) Drawn {
	read := note.Read(text)
	// A text with no front reads whole as a route, and graphOf places its nodes under no chapter. [[spec/tickets/the-lens-reads-v1]]
	front, placing := read.Front.Said, read.Sections
	if !strings.HasPrefix(text, frontFence) {
		if front = yaml.AsDoc(yaml.Read(text)); front == nil {
			front = yaml.New()
		}
		placing = nil
	}
	walk := entriesIn(front.Get("steps"), "", nil)
	out := Drawn{Graph: graphOf(front, walk, placing), Steps: stepsJSON(front.Get("steps")), Leaves: map[string]DrawnLeaf{}}
	for _, one := range walk {
		if one.leaf {
			out.Leaves[one.path] = leafDrawn(walk, one, read.Sections)
		}
	}
	return out
}

func entriesIn(list any, parent string, out []entry) []entry {
	for _, item := range yaml.AsList(list) {
		said := yaml.AsDoc(item)
		if said == nil {
			continue
		}
		name := yaml.AsString(said.Get("name"))
		path := name
		if parent != "" {
			path = parent + "/" + name
		}
		under := false
		for _, one := range yaml.AsList(said.Get("steps")) {
			under = under || yaml.AsDoc(one) != nil
		}
		out = append(out, entry{name: name, path: path, parent: parent, said: said, leaf: !under})
		if under {
			out = entriesIn(said.Get("steps"), path, out)
		}
	}
	return out
}

// [[spec/design_input/the-agent-pulls-tickets#the-drawing-is-a-projection]]
func graphOf(front *yaml.Doc, walk []entry, sections []note.Section) Graph {
	record := map[string]*yaml.Doc{}
	for _, item := range yaml.AsList(front.Get("record")) {
		if one := yaml.AsDoc(item); one != nil && truthy(one.Get("step")) {
			record[yaml.AsString(one.Get("step"))] = one
		}
	}
	reached := reachedOf(front, walk)
	out := Graph{Nodes: []Node{}, Edges: []Edge{}}
	for _, one := range walk {
		out.Nodes = append(out.Nodes, placed(nodeOf(one, front, record[one.path], reached), sections))
	}
	for _, one := range walk {
		if one.parent != "" {
			out.Edges = append(out.Edges, Edge{From: one.parent, To: one.path, Kind: holdsEdge, Label: holdsEdge})
		}
	}
	for at, one := range walk {
		for _, next := range walk[at+1:] {
			if next.parent == one.parent {
				out.Edges = append(out.Edges, Edge{From: one.path, To: next.path, Kind: passEdge, Label: passEdge})
				break
			}
		}
	}
	for _, one := range walk {
		if back, found := entryNamed(walk, strings.TrimSpace(yaml.AsString(one.said.Get("on_fail"))), one); found {
			out.Edges = append(out.Edges, Edge{From: one.path, To: back.path, Kind: failEdge, Label: failEdge})
		}
	}
	return out
}

// The leaves at or before the pointer, and each one the record names, as reachedOf in src/scripts/ticket-route.js reads them. [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
func reachedOf(front *yaml.Doc, walk []entry) []string {
	step := strings.TrimSpace(yaml.AsString(front.Get("step")))
	at := -1
	for i, one := range walk {
		if one.path == step {
			at = i
			break
		}
	}
	out := []string{}
	for i, one := range walk {
		if one.leaf && at >= 0 && i <= at {
			out = append(out, one.path)
		}
	}
	for _, item := range yaml.AsList(front.Get("record")) {
		if one := yaml.AsDoc(item); one != nil && truthy(one.Get("step")) {
			out = append(out, yaml.AsString(one.Get("step")))
		}
	}
	return out
}

// [[spec/design_input/the-agent-pulls-tickets#the-drawing-is-a-projection]]
func nodeOf(one entry, front, held *yaml.Doc, reached []string) Node {
	node := Node{ID: one.path, Name: one.name, Kind: phaseKind, Parent: one.parent}
	if one.leaf {
		node.Kind = leafKind
	}
	if truthy(one.said.Get("does")) {
		node.Does = yaml.AsString(one.said.Get("does"))
	}
	if truthy(one.said.Get("when")) {
		node.When, node.Dotted = yaml.AsString(one.said.Get("when")), true
	}
	node.Person = yaml.AsString(one.said.Get("by")) == personWord
	node.At = one.path == yaml.AsString(front.Get("step"))
	if truthy(held.Get("skipped")) {
		why := yaml.AsString(held.Get("why"))
		node.Skipped, node.Why = true, &why
	}
	if returns, err := strconv.ParseFloat(strings.TrimSpace(yaml.AsString(held.Get("returns"))), floatBits); err == nil && returns > 0 {
		node.Returns = returns
	}
	for _, path := range reached {
		node.Reached = node.Reached || path == one.path || strings.HasPrefix(path, one.path+"/")
	}
	return node
}

// [[spec/design_input/the-editor-draws-the-ticket#the-engine-answers-the-editor]]
func placed(node Node, sections []note.Section) Node {
	if at := note.SectionAt(sections, node.ID); at >= 0 {
		node.Chapter = strings.Repeat("#", sections[at].Level) + " " + sections[at].Header
		node.Line = sections[at].Line
	}
	return node
}

// The step a keyword names: a path, a sibling, then a top-level step, as entryNamed in .claude/skills/level0/lib/schema-route.js finds it. [[spec/design_output/schema#keywords-that-name-a-step]]
func entryNamed(walk []entry, want string, holder entry) (entry, bool) {
	if want == "" {
		return entry{}, false
	}
	for _, parent := range []string{holder.parent, ""} {
		for _, one := range walk {
			if strings.Contains(want, "/") && one.path == want {
				return one, true
			}
			if !strings.Contains(want, "/") && one.parent == parent && one.name == want {
				return one, true
			}
		}
	}
	return entry{}, false
}

// The fields in route order and checked last, as LeafOf in src/pull/pull_route.go gathers them, each at the line headingLines in src/extension/lib/fields.js held, and filled where ChapterOf in src/pull/pull_chapter.go reads a line under it. [[spec/design_output/extension#a-take-marks-the-fields]]
func leafDrawn(walk []entry, leaf entry, sections []note.Section) DrawnLeaf {
	chain := []entry{}
	parts := strings.Split(leaf.path, "/")
	for i := 1; i < len(parts); i++ {
		above := strings.Join(parts[:i], "/")
		for _, one := range walk {
			if one.path == above {
				chain = append(chain, one)
				break
			}
		}
	}
	chain = append(chain, leaf)
	items := []string{}
	for _, one := range chain {
		for _, said := range yaml.AsList(one.said.Get(checklist)) {
			if bare := strings.TrimSpace(yaml.AsString(said)); said != nil && bare != "" {
				items = append(items, bare)
			}
		}
	}
	fields := []DrawnField{}
	for _, item := range yaml.AsList(leaf.said.Get("evidence")) {
		if one := yaml.AsDoc(item); one != nil && truthy(one.Get("name")) {
			fields = append(fields, DrawnField{Name: yaml.AsString(one.Get("name")), Form: yaml.AsString(one.Get("form")), Says: yaml.AsString(one.Get("says")), Items: []string{}})
		}
	}
	if len(items) > 0 {
		fields = append(fields, DrawnField{Name: checked, Form: checklist, Items: items})
	}
	filled := chapterFields(sections, leaf.path)
	lineOf := headingLines(sections, leaf.path)
	for at := range fields {
		fields[at].Line = lineOf(fields[at].Name)
		fields[at].Filled = len(filled[fields[at].Name]) > 0
	}
	return DrawnLeaf{Does: yaml.AsString(leaf.said.Get("does")), Fields: fields}
}

// Each field heading one level under the leaf's chapter, with the rows that count under it. [[spec/design_output/pull#the-fields-hold-their-forms]]
func chapterFields(sections []note.Section, path string) map[string][]string {
	out := map[string][]string{}
	found := note.SectionAt(sections, path)
	if found < 0 {
		return out
	}
	level := len(strings.Split(path, "/"))
	for i := found + 1; i < len(sections) && sections[i].Level > level; i++ {
		if sections[i].Level == level+1 {
			out[sections[i].Header] = countedRows(sections[i].Own)
		}
	}
	return out
}

func countedRows(own []string) []string {
	out := []string{}
	for _, row := range own {
		if strings.TrimSpace(row) != "" && !commentRow.MatchString(row) && !answeredRow.MatchString(row) && !note.FenceAt.MatchString(row) {
			out = append(out, strings.TrimSpace(row))
		}
	}
	return out
}

// A field missing its heading marks the leaf's heading, and a leaf missing its chapter marks the first line. [[spec/design_output/extension#a-take-marks-the-fields]]
func headingLines(sections []note.Section, path string) func(string) int {
	at := note.SectionAt(sections, path)
	if at < 0 {
		return func(string) int { return firstLine }
	}
	level := len(strings.Split(path, "/")) + 1
	return func(name string) int {
		for i := at + 1; i < len(sections) && sections[i].Level >= level; i++ {
			if sections[i].Level == level && sections[i].Header == name {
				return sections[i].Line
			}
		}
		return sections[at].Line
	}
}

// Whether a value reads as true where JavaScript tests it. [[spec/tickets/the-lens-reads-v1]]
func truthy(said any) bool {
	switch one := said.(type) {
	case nil:
		return false
	case bool:
		return one
	case int:
		return one != 0
	case string:
		return one != ""
	}
	return true
}

// The route as JSON in the order the front writes it, and an empty list where the front holds none. [[spec/tickets/the-lens-reads-v1]]
func stepsJSON(said any) json.RawMessage {
	if said == nil {
		return json.RawMessage("[]")
	}
	var out bytes.Buffer
	writeYAMLJSON(&out, said)
	return out.Bytes()
}

func writeYAMLJSON(out *bytes.Buffer, said any) {
	switch one := said.(type) {
	case *yaml.Doc:
		out.WriteByte('{')
		for at, key := range one.Keys() {
			if at > 0 {
				out.WriteByte(',')
			}
			name, _ := json.Marshal(key)
			out.Write(name)
			out.WriteByte(':')
			writeYAMLJSON(out, one.Get(key))
		}
		out.WriteByte('}')
	case []any:
		out.WriteByte('[')
		for at, each := range one {
			if at > 0 {
				out.WriteByte(',')
			}
			writeYAMLJSON(out, each)
		}
		out.WriteByte(']')
	default:
		body, err := json.Marshal(one)
		if err != nil {
			body = []byte("null")
		}
		out.Write(body)
	}
}
