// The start commits the tips at once, and again on a tick where they change,
// and a tick that finds them unchanged commits nothing.
// [[spec/tickets/the-index-reads-standing-branches]]
package git

import (
	"testing"
	"time"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
	"quackitect/src/ticket"
)

func TestTheStartCommitsTheTipsAndEachChange(t *testing.T) {
	fake := NewFake()
	fake.Push("the-group", map[string]string{"spec/tickets/the-group.md": "open\n"})
	var tick func(time.Time)
	every := func(_ time.Duration, hand func(time.Time)) func() {
		tick = hand
		return func() {}
	}
	var commits [][]ticket.Tip
	Start(fake, every, func(values map[string]any) error {
		commits = append(commits, values[Port].([]ticket.Tip))
		return nil
	})
	if len(commits) != 1 || len(commits[0]) != 1 || commits[0][0].Name != "the-group" {
		t.Fatalf("the start commits the one branch, and commits %+v", commits)
	}
	tick(time.Time{})
	if len(commits) != 1 {
		t.Fatalf("a tick over unchanged tips commits nothing, and commits %+v", commits)
	}
	fake.Drop("the-group")
	tick(time.Time{})
	if len(commits) != 2 || len(commits[1]) != 0 {
		t.Fatalf("a tick after the branch leaves commits no branch, and commits %+v", commits)
	}
}

func TestTheTipsStandUnderTheirLocalPort(t *testing.T) {
	index := qtest.New(t, func(c *q.Catalog) { Registers(c) })
	if got, ok := index.Read(Port).([]ticket.Tip); !ok || len(got) != 0 {
		t.Fatalf("%s reads %#v before any commit", Port, index.Read(Port))
	}
}
