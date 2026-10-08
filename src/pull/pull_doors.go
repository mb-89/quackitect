// What the pull reaches past the tree's text: git, the clock, the streams,
// the log, the config it reads, and the verbs and topics other code answers.
// Every one comes in on It, so a case hands in fakes.
// [[spec/design_output/pull#the-answers]]
package pull

import (
	"io"
	"time"

	"quackitect/src/failure"
	"quackitect/src/modules/git"
)

// A command line a leaf's field names, run through sh under the root. [[spec/design_output/pull#the-commands-answer]]
type Shell func(line string) (stdout string, exit int, err error)

// One finding of the voice over a text: the rule, the line and the message, and whether it refuses or warns. [[spec/design_output/pull#the-voice-reads-the-evidence]]
type Voiced struct {
	Rule, Message string
	Line          int
	Refuses       bool
}

// The weights the queue's score reads. [[spec/design_output/pull#the-queue-is-a-score]]
type Weights struct{ Block, Day, Fail float64 }

// Everything the pull reads and writes through. [[spec/design_output/pull#the-answers]]
type It struct {
	Disk         Disk
	Git          git.Repo
	Now          func() time.Time
	Out, Err     io.Writer
	Root, Method string
	Env          map[string]string
	Agent, Cloud bool
	// The config the pull reads. [[spec/design_output/pull#the-answers]]
	Words, Fails, Refusals, Splits int
	PersonSigns                    bool
	Weights                        Weights
	Binding                        string
	CapBytes, CapMargin            int
	// The ticket a verb minted for this session, which passes the queue. [[spec/design_output/pull#the-answers]]
	Minted string
	// The owner sends this hand into a person's step. [[spec/design_output/pull#the-answers]]
	OwnerSays bool
	// The words past the verb, which a hand-back reads its flags off. [[spec/design_output/pull#the-answers]]
	Argv []string
	// The log row a hand-out writes per note, and the row a verb writes for its answer. [[spec/design_output/pull#the-answers]]
	Log func(level, kind, said string, extra map[string]any)
	// The notes a leaf reads, off the guidance topic, keyed process:leaf. [[spec/design_output/pull#the-answers]]
	Notes func(key string) []string
	// A note's rules, numbered, and its Examples table under them. [[spec/design_output/pull#the-answers]]
	Rules func(text string) []string
	// The voice over a ticket, the findings on the rows first to last alone, and none where no Vale stands. [[spec/design_output/pull#the-answers]]
	Voice func(path, text string, first, last int) []Voiced
	Shell Shell
	// The branch take a cloud box runs on trunk, and the done branch a desk takes in, which the branch verbs own. [[spec/design_output/pull#the-answers]]
	Take  func(group string) int
	Ready func() bool
	// The process a ticket's ask stands in, read by the schema checks a hand-back runs. [[spec/design_output/pull#the-answers]]
	Schemas Schemas
	// The failure nodes each refusal raises through. [[spec/design_output/failures#the-refusals-move-onto-nodes]]
	Failures failure.Registry
}

// The stamp a clock writes, as toISOString writes it. [[spec/design_output/pull#the-hand-and-the-hold]]
func (it *It) Stamp() string {
	if it.Now == nil {
		return ""
	}
	return it.Now().UTC().Format("2006-01-02T15:04:05.000Z")
}
