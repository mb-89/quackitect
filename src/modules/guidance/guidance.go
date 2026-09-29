// The guidance module: the notes each leaf of each process reads, resolved
// off the files the watch mirrors, the rule readsFor in
// src/scripts/guidance-hand.js holds.
// [[spec/tickets/the-guidance-topic-lands]]
package guidance

import "quackitect/src/q"

// The ports, by their local names. [[spec/design_output/model#the-wiring-file]]
const (
	FilesPort = "files/<path...>"
	StepsPort = "steps"
)

// One note a leaf reads, and the envs it binds, where it binds any. [[spec/tickets/the-guidance-topic-lands]]
type Read struct {
	Note string   `json:"note"`
	Env  []string `json:"env,omitempty"`
}

type filesIn struct {
	Files map[string]q.Content `q:"files/<path...>"`
}

// The module type the wiring loads as guidance. [[spec/tickets/the-guidance-topic-lands]]
func Registers(c *q.Catalog) q.Writer {
	return q.DerivedIn(c, StepsPort, map[string][]Read{}, StepsOf, q.Doc("every leaf of every process, keyed process:path, with the notes it reads"))
}

// Every leaf of every process, and the notes it reads in the order the old reader hands them. [[spec/tickets/the-guidance-topic-lands]]
func StepsOf(in filesIn) map[string][]Read {
	return map[string][]Read{}
}

// The notes one leaf reads under an env: a note binding no env always, and one binding envs where one of them reads true. [[spec/tickets/the-guidance-topic-lands]]
func Notes(reads []Read, env map[string]string) []string {
	return nil
}
