// The work tab's keys post the actions spec/views/work.base names, and the
// verbs behind the index write what each one changes. The tab writes no file.
// [[spec/design_output/tui#the-work-tab-takes-edits]]

package work

import (
	"fmt"
	"strings"

	tea "github.com/charmbracelet/bubbletea"

	"quackitect/src/tui/tree"
)

// The triggers the tab looks its actions up by in the base file, and the key the pull button takes. [[spec/design_output/tui#the-work-tab-takes-edits]]
const (
	urgentTrigger = "u"
	editTrigger   = "cell"
	pullButton    = "pull"
	pullKey       = "P"
)

// What the posts of one action answer: the action, and each refusal the index names. [[spec/design_output/tui#the-work-tab-takes-edits]]
type actionSaid struct {
	name    string
	refused []string
	kept    string
}

// The action the base file names for the trigger, or why none stands. [[spec/design_output/model#a-view-declares-actions]]
func (t *Tab) actionFor(trigger string, holds func(tree.Action) bool) (string, error) {
	if t.base == "" && t.From != nil {
		base, err := baseOf(t.From)
		if err != nil {
			return "", err
		}
		t.base = base
	}
	views, err := tree.ReadBase(t.base)
	if err != nil {
		return "", err
	}
	for _, view := range views {
		for _, one := range view.Actions {
			if holds(one) && one.Calls+one.Writes != "" {
				return one.Calls + one.Writes, nil
			}
		}
	}
	return "", fmt.Errorf("%s names no action for %s", BaseAt, trigger)
}

// The action a key calls. [[spec/design_output/model#a-view-declares-actions]]
func (t *Tab) keyAction(key string) (string, error) {
	return t.actionFor(key, func(one tree.Action) bool { return one.Key == key })
}

// Posts each input to the action in turn, off the program, and hands back what the index answers. [[spec/design_output/model#a-caller-sets-its-wait]]
func (t *Tab) posts(name string, inputs []any, kept string) tea.Cmd {
	from := t.From
	return func() tea.Msg {
		said := actionSaid{name: name, kept: kept}
		for _, input := range inputs {
			if from == nil {
				said.refused = append(said.refused, "no index answers the tab")
				break
			}
			if _, err := from.Call(name, input); err != nil {
				said.refused = append(said.refused, err.Error())
			}
		}
		return said
	}
}

// The answer stands as the notice, and the watch on work/rows redraws what the verb wrote. [[spec/design_output/tui#the-work-tab-takes-edits]]
func (t *Tab) answered(msg actionSaid) {
	said := []string{msg.name + " runs."}
	if len(msg.refused) > 0 {
		said = []string{msg.name + " refuses: " + strings.Join(msg.refused, "; ")}
	}
	if msg.kept != "" {
		said = append(said, msg.kept)
	}
	t.Notice = strings.Join(said, " ")
}

// The pull button's action, with nothing for input. [[spec/design_output/tui#the-work-tab-takes-edits]]
func (t *Tab) pull() tea.Cmd {
	name, err := t.actionFor(pullButton, func(one tree.Action) bool { return one.Button == pullButton })
	if err != nil {
		t.Notice = err.Error()
		return nil
	}
	return t.posts(name, []any{struct{}{}}, "")
}
