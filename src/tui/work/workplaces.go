// The places and the branches, off the one answer the branch verb gives. The
// queue is a score the pull owns, and the branches stand in git, so the tab
// asks the verb for both and lays them over the rows the index answers.
// [[spec/design_output/tui#the-work-tab]]

package work

import (
	"encoding/json"
	"path/filepath"
	"time"

	tea "github.com/charmbracelet/bubbletea"

	"quackitect/tui/tree"
)

// The survey's file, whose folder .claude/skills/level0/lib/folders.js owns and whose name src/lsp/tree.go spells too, because a Go module imports no JavaScript. [[spec/design_output/tools#what-the-survey-writes]]
const toolsAt = ".se/.runtime/tools.json"

// The verb answering the places, off the command line every verb rides. [[spec/design_output/work#one-reading-answers-git]]
var placesVerb = []string{"src/scripts/cli.js", "branch", "list", "--json"}

// The verb reads git, so a run past this span reads as a box with no git. [[spec/design_output/tui#the-work-tab]]
const placesWait = 60 * time.Second

// What the answer carries that the tab lays over its rows: each row's place, and the groups holding a branch. [[spec/design_output/work#one-reading-answers-git]]
type Places struct {
	Queue map[string]string
	Cloud map[string]bool
	Todo  map[string]bool
	// The rows this box takes: every placed row past the cloud's, which the strip counts behind the tab's name. [[spec/design_output/tui#the-work-tab]]
	Takeable int
	// The plan's own todos, which the index holds nowhere, so the tab adds them as rows. [[spec/design_output/stop#the-plan]]
	Rows []answerRow
}

// The kind a sentence todo carries, which draws with no link. [[spec/design_output/stop#the-plan]]
const KindTodo = "todo"

// The place of a row the cloud holds, which src/scripts/pull-outline.js owns and a Go module spells again. [[spec/design_output/pull#the-queue-is-an-outline]]
const cloudPlace = "∞"

// The place of the work in hand and the state it reads, which src/scripts/work-answer.js owns and a Go module spells again. [[spec/design_output/pull#the-queue-is-an-outline]]
const (
	heldPlace = "0"
	HeldState = "held"
)

type PlacesMsg struct {
	Places Places
	Why    string
}

// One row of the answer, with the fields the tab reads and no other. [[spec/design_output/work#one-reading-answers-git]]
type answerRow struct {
	Name    string      `json:"name"`
	Queue   string      `json:"queue"`
	Todo    bool        `json:"todo"`
	Kind    string      `json:"kind"`
	Says    string      `json:"says"`
	Merged  bool        `json:"merged"`
	Tickets []answerRow `json:"tickets"`
}

// [[spec/design_output/work#one-reading-answers-git]]
func PlacesIn(said []byte) (Places, error) {
	var answer struct {
		Branches []answerRow `json:"branches"`
		Loose    []answerRow `json:"loose"`
	}
	if err := json.Unmarshal(said, &answer); err != nil {
		return Places{}, err
	}
	out := Places{Queue: map[string]string{}, Cloud: map[string]bool{}, Todo: map[string]bool{}}
	for _, one := range answer.Branches {
		// A branch row stands for its group, and a merged one stands for a group off the cloud. [[spec/design_output/work#a-row-per-group]]
		// A group's tickets inherit its cloud, because the branch carries them all. [[spec/design_output/tree-view#a-flag-draws-a-letter]]
		if !one.Merged {
			out.Cloud[one.Name] = true
		}
		out.place(one)
		for _, child := range one.Tickets {
			out.place(child)
			if !one.Merged {
				out.Cloud[child.Name] = true
			}
		}
	}
	for _, one := range answer.Loose {
		out.place(one)
		if one.Kind == KindTodo {
			out.Rows = append(out.Rows, one)
		}
	}
	out.Takeable = out.countTakeable()
	return out, nil
}

// A place is an outline number, as `1`, `1.2` or `-1`, and a row the pull places nowhere carries none. [[spec/design_output/pull#the-queue-is-an-outline]]
func (p Places) place(one answerRow) {
	if one.Queue != "" {
		p.Queue[one.Name] = one.Queue
	}
	p.Todo[one.Name] = one.Todo
}

// The rows this box takes: placed, and off the cloud. [[spec/design_output/tui#the-work-tab]]
func (p Places) countTakeable() int {
	n := 0
	for _, place := range p.Queue {
		if place != cloudPlace {
			n++
		}
	}
	return n
}

// The places laid over the tree's items, so the queue column and the cloud letter read them. [[spec/design_output/tui#the-work-tab]]
func Placed(t *tree.Tree, p Places) {
	t.Amend(func(one *tree.Item) {
		one.Keys[QueueKey] = p.Queue[one.Name]
		one.Keys[CloudKey] = flagOf(p.Cloud[one.Name])
		// A row at zero stands in hand, so its state reads held whatever the index says. [[spec/design_output/pull#the-queue-is-an-outline]]
		if p.Queue[one.Name] == heldPlace {
			one.Keys["state"] = HeldState
		}
		// The todo letter reads the verb's answer, which folds the override on this box into the front's tag. [[spec/design_output/pull#a-todo-forces-a-place]]
		if said, held := p.Todo[one.Name]; held {
			one.Keys[TodoKey] = flagOf(said)
		}
	})
	// A sentence todo the tree lacks lands as a row of its own, at the left, with no path and no link. [[spec/design_output/stop#the-plan]]
	standing := map[string]bool{}
	for _, one := range t.Items {
		standing[one.Name] = true
	}
	added := []tree.Item{}
	for _, row := range p.Rows {
		if standing[row.Name] {
			continue
		}
		state := "open"
		if row.Queue == heldPlace {
			state = HeldState
		}
		added = append(added, tree.Item{Name: row.Name, Keys: map[string]string{
			"kind": KindTodo, "state": state, QueueKey: row.Queue, TodoKey: flagOf(row.Todo),
			CloudKey: flagOf(false), "urgent": flagOf(false), "says": row.Says,
		}})
	}
	t.Append(added...)
}

// The verb runs off the tab, and its answer lands as a message. [[spec/design_output/tui#the-work-tab]]
func PlacesCmd(root string) tea.Cmd {
	return func() tea.Msg {
		said, err := runPlaces(root)
		if err != nil {
			return PlacesMsg{Why: err.Error()}
		}
		places, err := PlacesIn(said)
		if err != nil {
			return PlacesMsg{Why: err.Error()}
		}
		return PlacesMsg{Places: places}
	}
}

// A root holding no verb answers its error at once, so a case's tree spawns nothing. [[spec/design_output/work#one-reading-answers-git]]
func runPlaces(root string) ([]byte, error) {
	if _, err := statOf(filepath.Join(root, filepath.FromSlash(placesVerb[0]))); err != nil {
		return nil, err
	}
	return runVerb(root, NodeAt(root), placesVerb, placesWait)
}

// The node the survey names, and the one on the path where the survey stands nowhere. [[spec/design_output/tools#what-the-survey-writes]]
func NodeAt(root string) string {
	text, err := readFile(filepath.Join(root, filepath.FromSlash(toolsAt)))
	if err != nil {
		return "node"
	}
	var tools struct {
		Node struct {
			Path string `json:"path"`
		} `json:"node"`
	}
	if err := json.Unmarshal(text, &tools); err != nil || tools.Node.Path == "" {
		return "node"
	}
	return tools.Node.Path
}
