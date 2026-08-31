package main

import (
	"bufio"
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
)

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
func AlreadySaid(r Roots, said string) bool {
	f, err := os.Open(filepath.Join(r.Private("log"), Current))
	if err != nil {
		return false
	}
	defer f.Close()

	want := strings.TrimSpace(said)
	seen := false
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
			seen = false
		case rec.Src == "user" && rec.Kind == "prompt" && strings.TrimSpace(rec.Msg) == want:
			seen = true
		}
	}
	return seen
}
