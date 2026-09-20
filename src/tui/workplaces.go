// The places and the branches, off the one answer the branch verb gives. The
// queue is a score the pull owns, and the branches stand in git, so the tab
// asks the verb for both and lays them over the rows the index answers.
// [[spec/design_output/tui#the-work-tab]]

package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"time"

	tea "github.com/charmbracelet/bubbletea"
)

// The survey's file, whose folder .claude/skills/level0/lib/folders.js owns and whose name src/lsp/tree.go spells too, because a Go module imports no JavaScript. [[spec/design_output/tools#what-the-survey-writes]]
const toolsAt = ".se/.runtime/tools.json"

// The verb answering the places, off the command line every verb rides. [[spec/design_output/work#one-reading-answers-git]]
var placesVerb = []string{"src/scripts/cli.js", "branch", "list", "--json"}

// The verb reads git, so a run past this span reads as a box with no git. [[spec/design_output/tui#the-work-tab]]
const placesWait = 60 * time.Second

// What the answer carries that the tab lays over its rows: each row's place, and the groups holding a branch. [[spec/design_output/work#one-reading-answers-git]]
type workPlaces struct {
	queue map[string]string
	cloud map[string]bool
}

type placesMsg struct {
	places workPlaces
	why    string
}

// One row of the answer, with the fields the tab reads and no other. [[spec/design_output/work#one-reading-answers-git]]
type answerRow struct {
	Name    string      `json:"name"`
	Queue   string      `json:"queue"`
	Merged  bool        `json:"merged"`
	Tickets []answerRow `json:"tickets"`
}

// [[spec/design_output/work#one-reading-answers-git]]
func placesIn(said []byte) (workPlaces, error) {
	var answer struct {
		Branches []answerRow `json:"branches"`
		Loose    []answerRow `json:"loose"`
	}
	if err := json.Unmarshal(said, &answer); err != nil {
		return workPlaces{}, err
	}
	out := workPlaces{queue: map[string]string{}, cloud: map[string]bool{}}
	for _, one := range answer.Branches {
		// A branch row stands for its group, and a merged one stands for a group off the cloud. [[spec/design_output/work#a-row-per-group]]
		if !one.Merged {
			out.cloud[one.Name] = true
		}
		out.place(one)
		for _, child := range one.Tickets {
			out.place(child)
		}
	}
	for _, one := range answer.Loose {
		out.place(one)
	}
	return out, nil
}

// A place is an outline number, as `1`, `1.2` or `-1`, and a row the pull places nowhere carries none. [[spec/design_output/pull#the-queue-is-an-outline]]
func (p workPlaces) place(one answerRow) {
	if one.Queue != "" {
		p.queue[one.Name] = one.Queue
	}
}

// The places laid over the tree's items, so the queue column and the cloud letter read them. [[spec/design_output/tui#the-work-tab]]
func (t *Tree) Placed(p workPlaces) {
	t.Amend(func(one *Item) {
		one.Keys[queueKey] = p.queue[one.Name]
		one.Keys[cloudKey] = flagOf(p.cloud[one.Name])
	})
}

// The verb runs off the tab, and its answer lands as a message. [[spec/design_output/tui#the-work-tab]]
func placesCmd(root string) tea.Cmd {
	return func() tea.Msg {
		said, err := runPlaces(root)
		if err != nil {
			return placesMsg{why: err.Error()}
		}
		places, err := placesIn(said)
		if err != nil {
			return placesMsg{why: err.Error()}
		}
		return placesMsg{places: places}
	}
}

// A root holding no verb answers its error at once, so a case's tree spawns nothing. [[spec/design_output/work#one-reading-answers-git]]
func runPlaces(root string) ([]byte, error) {
	if _, err := os.Stat(filepath.Join(root, filepath.FromSlash(placesVerb[0]))); err != nil {
		return nil, err
	}
	return runVerb(root, nodeAt(root), placesVerb, placesWait)
}

// The node the survey names, and the one on the path where the survey stands nowhere. [[spec/design_output/tools#what-the-survey-writes]]
func nodeAt(root string) string {
	text, err := os.ReadFile(filepath.Join(root, filepath.FromSlash(toolsAt)))
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
