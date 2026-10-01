// The drafts module: the prose check and the answer check, off readsDraft in
// src/bridge/prose.js and checksAnswer in src/bridge/tools.js. It stands off
// the bridge's tools until the flip.
// [[spec/tickets/prose-tools-answer-in-go]]
package drafts

import (
	"fmt"

	"quackitect/src/q"
)

// The module a check lists its request to, the verbs it answers as tools, and why a check takes no undo. [[spec/tickets/prose-tools-answer-in-go]]
const (
	Module     = "drafts"
	ProseVerb  = "check_prose"
	AnswerVerb = "check_answer"
	// An action name takes lowercase segments alone, so each check registers under a plain name and keeps its tool name. [[spec/tickets/level0-tools-leave-the-bridge]]
	proseAction  = "prose"
	answerAction = "answer"
	readOnly     = "a check reads a draft, and writes nothing"
)

// What each check says of itself, off proseSpec in src/bridge/prose.js and checkSpec in lib/answer.js. [[spec/tickets/prose-tools-answer-in-go]]
const (
	proseDoc  = "Reads a draft note through the write door's own rules and answers every finding at once. It writes nothing. Pass the whole file as the write would land it, so a table row reads with its header."
	answerDoc = "Reads a draft answer through the voice rules and answers its findings, in the wording the gate uses at the turn's end. Check every draft over 60 words before you send it, because a draft checked here meets the gate clean. Two fields: the text of the draft, and stop, true where the answer ends on a stop call, so the check demands the needs table."
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
	return q.Join(
		q.ActionIn(c, Module+"/"+proseAction, func(in Prose) []q.Request {
			return []q.Request{{Module: Module, Verb: ProseVerb, Args: in, NoUndo: readOnly}}
		}, q.Doc(proseDoc), q.ToolName(ProseVerb), q.IO()),
		q.ActionIn(c, Module+"/"+answerAction, func(in Answer) []q.Request {
			return []q.Request{{Module: Module, Verb: AnswerVerb, Args: in, NoUndo: readOnly}}
		}, q.Doc(answerDoc), q.ToolName(AnswerVerb), q.IO()),
	)
}

// The IO side of the module: it answers each request a check lists, and refuses any other verb. [[spec/tickets/prose-tools-answer-in-go]]
func Accept(from Outside) func(q.Request) (any, error) {
	return func(asked q.Request) (any, error) {
		switch in := asked.Args.(type) {
		case Prose:
			if asked.Verb == ProseVerb {
				return from.readsDraft(in), nil
			}
		case Answer:
			if asked.Verb == AnswerVerb {
				return from.checksAnswer(in), nil
			}
		}
		return nil, fmt.Errorf("%s answers %s and %s, and takes no %s with %T", Module, ProseVerb, AnswerVerb, asked.Verb, asked.Args)
	}
}
