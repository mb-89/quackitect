// Package said answers what a person has already said, out of the record.
//
// ONE PROMPT, ONE RECORD, WHOEVER WRITES IT.
//
// Two things copy what a person said: the engine, reading the transcript on
// every tool call, and the agent, calling the said verb. Both are right to
// exist, because the engine cannot see a message the harness has not written
// yet and the agent cannot see one that arrived while it was not looking.
//
// So neither is told to check first. The write itself refuses a repeat, and
// then a rule that says always record is safe. A rule with a condition on it is
// a rule that can be applied wrongly, and this one was: the log carried six
// prompt records for four messages.
//
// A REPEAT IS THE SAME WORDS SINCE THE LAST ANSWER. The same sentence said
// twice, with an answer between, is two things a person said and both belong in
// the record.
package said

import (
	"bufio"
	"encoding/json"
	"os"
	"strings"
)

// Already answers whether these words are in the record since the last answer.
func Already(logFile, said string) bool { return Count(logFile, said) > 0 }

// Count answers how many records since the last answer carry these words.
//
// A COUNT AND NOT A PRESENCE. Reconciling by presence swallowed a message the
// person really sent: two identical messages with no answer between them, which
// is how somebody interrupts a running turn, became one record. A writer copies
// the words when the source holds more of them than the record does, so two
// messages make two records and a message the agent already wrote is still not
// written twice.
func Count(logFile, said string) int {
	f, err := os.Open(logFile)
	if err != nil {
		return 0
	}
	defer f.Close()

	want := strings.TrimSpace(said)
	seen := 0
	in := bufio.NewScanner(f)
	in.Buffer(make([]byte, 0, 1<<20), 1<<24)
	for in.Scan() {
		var rec struct {
			Src  string `json:"src"`
			Kind string `json:"kind"`
			Msg  string `json:"msg"`
		}
		if json.Unmarshal(in.Bytes(), &rec) != nil {
			continue
		}
		switch {
		case rec.Kind == "answer":
			seen = 0
		case rec.Src == "user" && rec.Kind == "prompt" && strings.TrimSpace(rec.Msg) == want:
			seen++
		}
	}
	return seen
}
