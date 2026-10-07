// The one parser of an example: the front, the chapter its path names, and the
// steps its shell blocks hold, each a call with the expect lines under it.
// A pure package, so the check, the harness, the run verb and the tab read one shape.
// [[spec/design_output/examples#the-format]]
package example

// A line out of shape, by its line and the rule it breaks. [[spec/design_output/examples#the-format]]
type Fault struct {
	Line    int
	Rule    string
	Message string
}

// One expect line: its form, the words after the form, and its line. [[spec/design_output/examples#the-format]]
type Expect struct {
	Form  string
	Words []string
	Line  int
}

// One call: the prose standing before it, the words past ./RUNME.sh, its line and its expect lines. [[spec/design_output/examples#the-format]]
type Step struct {
	Prose   string
	Call    []string
	Line    int
	Expects []Expect
}

// An example as one parser reads it. [[spec/design_output/examples#the-places]]
type Example struct {
	Path      string
	Chapter   string
	Dev       bool
	Title     string
	Keywords  []string
	Interface []string
	Edge      string
	Steps     []Step
}

// Reads an example off its path and text, and answers the faults beside it. [[spec/design_output/examples#the-format]]
func Read(path, text string) (Example, []Fault) {
	return Example{Path: path}, nil
}
