// The one evaluator of an expect line, over what a call answers and the files
// it leaves, so the harness and the run verb judge a step alike.
// [[spec/design_output/examples#one-runner-two-drivers]]
package example

import (
	"fmt"
	"strconv"
	"strings"

	"quackitect/src/note"
	"quackitect/src/yaml"
)

// The folders a field expect reads its ticket from, the tracked one first. [[spec/design_output/examples#the-format]]
var ticketFolders = []string{"spec/tickets", ".se/tickets"}

// The file under the runtime folder holding each example's last verdict. [[spec/design_output/examples#one-runner-two-drivers]]
const VerdictFile = "examples.json"

// What a call answers: its exit code and its output, both streams together. [[spec/design_output/examples#the-format]]
type Outcome struct {
	Code int
	Out  string
}

// The miss of an expect line over an outcome and a read of the tree, or nothing where it holds. [[spec/design_output/examples#the-format]]
func Holds(one Expect, said Outcome, read func(path string) (string, bool)) string {
	switch one.Form {
	case "exit":
		if want, _ := strconv.Atoi(one.Words[0]); want != said.Code {
			return fmt.Sprintf("wants exit %d, and the call exits %d", want, said.Code)
		}
	case "says":
		if !strings.Contains(said.Out, one.Words[0]) {
			return fmt.Sprintf("wants the output saying %q, and it says %q", one.Words[0], said.Out)
		}
	case "quiet":
		if strings.Contains(said.Out, one.Words[0]) {
			return fmt.Sprintf("wants the output quiet on %q, and it says %q", one.Words[0], said.Out)
		}
	case "stands":
		if _, stands := read(one.Words[0]); !stands {
			return fmt.Sprintf("wants %s standing, and it stands nowhere", one.Words[0])
		}
	case "field":
		name, field, want := one.Words[0], one.Words[1], one.Words[2]
		for _, folder := range ticketFolders {
			if text, stands := read(folder + "/" + name + ".md"); stands {
				if got := yaml.AsString(note.FrontOf(yaml.SplitLines(text)).Said.Get(field)); got != want {
					return fmt.Sprintf("wants %s %s %s, and it holds %q", name, field, want, got)
				}
				return ""
			}
		}
		return fmt.Sprintf("wants %s %s %s, and the ticket %s stands nowhere", name, field, want, name)
	}
	return ""
}
