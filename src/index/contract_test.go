// The real index keeps the contract the fake index stands for, run in
// process, with no database, no port and no NATS.
// [[spec/design_output/model#the-fake-keeps-a-contract]]
package main

import (
	"testing"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
	"quackitect/src/watchdog"
)

// The catalog Serve builds, with the config and clock inputs the config module registers once it stands.
func inProcess(t testing.TB, register func(*q.Catalog)) qtest.Harness {
	c := q.New()
	registersTopics(c)
	watchdog.Registers(c)
	inputs := q.Join(
		q.GivenIn(c, "cfg/<key...>", "", q.Doc("a config value, as the case seeds it")),
		q.GivenIn(c, "clock/minute", int64(0), q.Doc("the minute, as the case seeds it")),
	)
	register(c)
	return qtest.Over(t, c, inputs)
}

func TestTheIndexKeepsTheContract(t *testing.T) {
	qtest.Suite(t, inProcess)
}
