// The drafts module: the prose check and the answer check, off readsDraft in
// src/bridge/prose.js and checksAnswer in src/bridge/tools.js. It stands off
// the wiring until the flip, and answers nothing until the change lands.
// [[spec/tickets/prose-tools-answer-in-go]]
package drafts

import "quackitect/src/q"

// The module a check lists its request to, and the verbs it answers as tools. [[spec/tickets/prose-tools-answer-in-go]]
const (
	Module     = "drafts"
	ProseVerb  = "check_prose"
	AnswerVerb = "check_answer"
)

// A prose check: where the note lands, and the whole file as the write lands it. [[spec/tickets/prose-tools-answer-in-go]]
type Prose struct {
	Path string `json:"path,omitempty" doc:"where the note lands, so the rules read the kind it is"`
	Text string `json:"text,omitempty" doc:"the whole file as the write lands it"`
}

// An answer check: the draft, and whether it ends on a stop call. [[spec/tickets/prose-tools-answer-in-go]]
type Answer struct {
	Text string `json:"text,omitempty" doc:"the draft answer"`
	Stop bool   `json:"stop,omitempty" doc:"true where the answer ends on a stop call, so the check asks for the needs table"`
}

// One row Vale answers past the prose vetoes. [[spec/tickets/prose-tools-answer-in-go]]
type Finding struct {
	Rule     string `json:"rule"`
	Line     int    `json:"line"`
	Column   int    `json:"column"`
	Said     string `json:"said"`
	Message  string `json:"message"`
	Severity string `json:"severity"`
}

// What a lint answers: the kept rows, whether a Vale stands, whether it ran, and why where it ran nowhere. [[spec/tickets/prose-tools-answer-in-go]]
type Linted struct {
	Found  []Finding
	Stands bool
	Ran    bool
	Why    string
}

// The answer's caps: its prose words, the score it warns at, and the score it refuses past. [[spec/tickets/prose-tools-answer-in-go]]
type Bands struct {
	Words   int `json:"words"`
	WarnAt  int `json:"warnAt"`
	Ceiling int `json:"ceiling"`
}

// What the module reads: Vale over a text as the named file, the owner's question count, and the answer's caps. [[spec/tickets/prose-tools-answer-in-go]]
type Outside struct {
	Lint      func(text, name string) Linted
	Questions func() int
	Bands     func() Bands
}

// [[spec/tickets/prose-tools-answer-in-go]]
func Registers(c *q.Catalog) q.Writer {
	return q.Join()
}

// The IO side of the module: it answers each request a check lists. [[spec/tickets/prose-tools-answer-in-go]]
func Accept(from Outside) func(q.Request) (any, error) {
	return func(q.Request) (any, error) { return "", nil }
}
