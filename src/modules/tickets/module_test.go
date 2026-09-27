// The module answers every ticket under its local port all.
// [[spec/tickets/tickets-becomes-a-module]]
package tickets

import (
	"testing"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
)

func TestAllStandsUnderItsLocalPort(t *testing.T) {
	index := qtest.New(t, func(c *q.Catalog) { Registers(c) })
	if got, ok := index.Read(AllPort).([]Ticket); !ok || len(got) != 0 {
		t.Fatalf("%s reads %#v with no file", AllPort, index.Read(AllPort))
	}
}
