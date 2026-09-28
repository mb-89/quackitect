// The real index keeps the contract the fake index stands for, run in
// process, with no database, no port and no NATS.
// [[spec/design_output/model#the-fake-keeps-a-contract]]
package index

import (
	"testing"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
)

// The catalog Serve builds, with the files, config and clock inputs the IO modules and the config module register. [[spec/design_output/model#the-fake-keeps-a-contract]]
func inProcess(t testing.TB, register func(*q.Catalog)) qtest.Harness {
	c := q.New()
	inputs := q.Join(
		q.OutIn(c, "files/<path...>", q.Content{}, q.Doc("a file's hash and text, as the case seeds it")),
		q.OutIn(c, "cfg/<key...>", "", q.Doc("a config value, as the case seeds it")),
		q.OutIn(c, "clock/minute", int64(0), q.Doc("the minute, as the case seeds it")),
	)
	register(c)
	return qtest.Over(t, c, inputs)
}

func TestTheIndexKeepsTheContract(t *testing.T) {
	qtest.Suite(t, inProcess)
}
