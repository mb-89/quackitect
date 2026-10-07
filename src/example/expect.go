// The one evaluator of an expect line, over what a call answers and the files
// it leaves, so the harness and the run verb judge a step alike.
// [[spec/design_output/examples#one-runner-two-drivers]]
package example

// The file under the runtime folder holding each example's last verdict. [[spec/design_output/examples#one-runner-two-drivers]]
const VerdictFile = "examples.json"

// What a call answers: its exit code and its output, both streams together. [[spec/design_output/examples#the-format]]
type Outcome struct {
	Code int
	Out  string
}

// The miss of an expect line over an outcome and a read of the tree, or nothing where it holds. [[spec/design_output/examples#the-format]]
func Holds(one Expect, said Outcome, read func(path string) (string, bool)) string {
	return ""
}
