// The route a ticket walks: its steps, the leaf it stands at, and what that
// leaf inherits from the steps above it, with the words a pull answers in,
// off src/scripts/pull-route.js.
// [[spec/design_output/pull#what-a-hand-out-reads]]
package pull

import (
	"fmt"
	"regexp"
	"strings"

	"quackitect/src/failure"
	"quackitect/src/yaml"
)

// The words a pull answer opens on, the hand the engine writes, and the moves a walk takes at most. [[spec/design_output/pull#the-hand-out]]
const (
	Work      = "work"
	Refused   = "refused"
	Wait      = "wait"
	Done      = "done"
	Engine    = "the engine"
	mostMoves = 64
	cutSaid   = 120
	checked   = "checked"
	bindQueue = "queue"
)

// The rows a chapter's field counts nothing for. [[spec/design_output/pull#the-fields-hold-their-forms]]
var (
	commentRow  = regexp.MustCompile(`^\s*<!--.*-->\s*$`)
	answeredRow = regexp.MustCompile(`^\s*answered:`)
	fenceRow    = regexp.MustCompile("^\\s*(```|~~~)")
)

// The verbs a need names, by the verb and its words. [[spec/design_output/pull#a-need-is-a-verb]]
var needVerbs = map[string][]string{
	"branch": workVerbs,
	"work":   workVerbs,
	"ticket": {"pull", "note", "update", "open"},
	"retro":  {"notes", "audit", "collect", "new", "timeline", "chapters", "matrix", "read", "effect", "classes", "mint"},
}

// The words the branch verb answers, as WORK_VERBS in src/scripts/work.js names them. [[spec/design_output/pull#a-need-is-a-verb]]
var workVerbs = []string{"open", "take", "sync", "done", "release", "merge", "close", "read", "review", "list", "escalate", "guidance", "unblock", "test"}

// [[spec/design_output/config#the-engine-controls]]
func HandsOut(binding string) bool {
	said := strings.TrimSpace(binding)
	return said == "" || said == bindQueue
}

// [[spec/design_output/pull#a-need-is-a-verb]]
func holdsVerb(need string) bool {
	words := strings.Fields(need)
	if len(words) == 0 {
		return false
	}
	subs, ok := needVerbs[words[0]]
	if !ok {
		return false
	}
	if len(words) < 2 {
		return true
	}
	for _, one := range subs {
		if one == words[1] {
			return true
		}
	}
	return false
}

// A leaf with what it inherits from the steps holding it. [[spec/design_input/the-agent-pulls-tickets#the-route]]
type Leaf struct {
	Entry
	By, Not, OnFail, When, Gate, Does, Asks string
	Final                                   bool
	Options, Reads, Tags, Needs, Checklist  []string
	Evidence                                []*yaml.Doc
	At, Of                                  int
	Walk, Leaves                            []Entry
}

// [[spec/design_input/the-agent-pulls-tickets#the-route]]
func WalkOf(front *yaml.Doc) []Entry { return EntriesIn(front.Get("steps")) }

func LeavesOf(front *yaml.Doc) []Entry {
	out := []Entry{}
	for _, one := range WalkOf(front) {
		if one.Leaf {
			out = append(out, one)
		}
	}
	return out
}

// The step a ticket stands at, which is its step field or the first leaf of its route. [[spec/design_output/pull#what-a-hand-out-reads]]
func StepPathOf(front *yaml.Doc) string {
	if said := strings.TrimSpace(yaml.AsString(front.Get("step"))); said != "" {
		return said
	}
	if leaves := LeavesOf(front); len(leaves) > 0 {
		return leaves[0].Path
	}
	return ""
}

// [[spec/design_input/the-agent-pulls-tickets#the-route]]
func LeafOf(front *yaml.Doc, path string) *Leaf {
	walk := WalkOf(front)
	var found *Entry
	for i := range walk {
		if walk[i].Path == path && walk[i].Leaf {
			found = &walk[i]
			break
		}
	}
	if found == nil {
		return nil
	}
	parts := strings.Split(found.Path, "/")
	chain := []Entry{}
	for i := 1; i < len(parts); i++ {
		for _, one := range walk {
			if one.Path == strings.Join(parts[:i], "/") {
				chain = append(chain, one)
				break
			}
		}
	}
	chain = append(chain, *found)
	nearest := func(key string) (string, bool) {
		for i := len(chain) - 1; i >= 0; i-- {
			if chain[i].Said.Has(key) && chain[i].Said.Get(key) != nil {
				return yaml.AsString(chain[i].Said.Get(key)), true
			}
		}
		return "", false
	}
	sum := func(key string) []string {
		out := []string{}
		for _, one := range chain {
			for _, each := range yaml.Flat(one.Said.Get(key)) {
				if said := strings.TrimSpace(yaml.AsString(each)); each != nil && said != "" {
					out = append(out, said)
				}
			}
		}
		return out
	}
	leaves := []Entry{}
	at := -1
	for _, one := range walk {
		if one.Leaf {
			if one.Path == path {
				at = len(leaves)
			}
			leaves = append(leaves, one)
		}
	}
	by, ok := nearest("by")
	if !ok {
		by = "anyone"
	}
	not, _ := nearest("not")
	onFail, _ := nearest("on_fail")
	said := found.Said
	leaf := &Leaf{
		Entry: *found, By: by, Not: not, OnFail: onFail,
		When: yaml.AsString(said.Get("when")), Gate: yaml.AsString(said.Get("gate")),
		Final: yaml.AsString(said.Get("final")) == "true", Does: yaml.AsString(said.Get("does")),
		Asks: yaml.AsString(said.Get("asks")), Options: []string{}, Needs: sum("needs"), Checklist: sum("checklist"),
		At: at, Of: len(leaves), Walk: walk, Leaves: leaves,
	}
	for _, one := range yaml.Flat(said.Get("options")) {
		leaf.Options = append(leaf.Options, yaml.AsString(one))
	}
	for _, one := range sum("reads") {
		leaf.Reads = append(leaf.Reads, Bare(one))
	}
	seen := map[string]bool{}
	for _, one := range sum("tags") {
		if !seen[one] {
			seen[one] = true
			leaf.Tags = append(leaf.Tags, one)
		}
	}
	for _, one := range yaml.Flat(said.Get("evidence")) {
		if field := yaml.AsDoc(one); field != nil && yaml.AsString(field.Get("name")) != "" {
			leaf.Evidence = append(leaf.Evidence, field)
		}
	}
	return leaf
}

// The field a leaf's evidence names, by a key's word. [[spec/design_output/pull#the-fields-hold-their-forms]]
func fieldWord(field *yaml.Doc, key string) string { return yaml.AsString(field.Get(key)) }

// Whether a leaf holds a field of the form. [[spec/design_output/pull#the-fields-hold-their-forms]]
func (leaf *Leaf) holdsForm(form string) *yaml.Doc {
	for _, field := range leaf.Evidence {
		if fieldWord(field, "form") == form {
			return field
		}
	}
	return nil
}

// The answer word and its rows, indented, on the standard stream. [[spec/design_output/pull#the-hand-out]]
func (it *It) Say(word string, rows ...string) { fmt.Fprintln(it.Out, answerOf(word, rows)) }

// A refusal through the failure door: the message the site builds, the id and each remedy, on the error stream. [[spec/design_output/failures#the-refusals-move-onto-nodes]]
func (it *It) Refuse(raised failure.Raised) { fmt.Fprintln(it.Err, it.refusal(raised)) }

// The text a raised refusal prints, once the log holds its row with the id. [[spec/design_output/failures#the-refusals-move-onto-nodes]]
func (it *It) refusal(raised failure.Raised) string {
	if it.Log != nil {
		said, _ := raised.Row("")["said"].(string)
		it.Log(raised.Level, failure.RowKind, said, map[string]any{failure.IDField: raised.ID})
	}
	return answerOf(Refused, raised.Lines())
}

// [[spec/design_output/pull#the-hand-out]]
func answerOf(word string, rows []string) string {
	out := []string{word}
	for _, row := range rows {
		out = append(out, "  "+row)
	}
	return strings.Join(out, "\n")
}

// One line to the standard stream. [[spec/design_output/pull#the-hand-out]]
func (it *It) Println(said string) { fmt.Fprintln(it.Out, said) }

// One line to the error stream. [[spec/design_output/pull#the-hand-out]]
func (it *It) Errorln(said string) { fmt.Fprintln(it.Err, said) }

// The index tool a verb stands as, with the words it takes. [[spec/tickets/verb-outputs-name-index-tools]]
func CallOf(topic, verb string, args ...string) string {
	tool := "mcp__level0__index_" + topic + "_" + verb
	if len(args) == 0 {
		return tool
	}
	return tool + " with args " + jsonList(args)
}

// A list of words as JSON.stringify writes it. [[spec/tickets/verb-outputs-name-index-tools]]
func jsonList(said []string) string {
	parts := make([]string, 0, len(said))
	for _, one := range said {
		parts = append(parts, jsQuote(one))
	}
	return "[" + strings.Join(parts, ",") + "]"
}
