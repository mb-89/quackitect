// A tell reaches a door standing on its port, and a door holding its answer
// ends the tell once the clock passes the call wait.
// [[spec/tickets/go-waits-on-events]]
package frame

import (
	"net"
	"testing"
	"time"

	"quackitect/src/q/qtest"
)

func TestATellReachesTheDoorOnItsPort(t *testing.T) {
	t.Parallel()
	port := freePort(t)
	took := make(chan any, 1)
	door, err := OpenDoor(port, func(msg any) { took <- msg })
	if err != nil {
		t.Fatal(err)
	}
	defer door.Close()
	if !TellPort(qtest.Wall(), port, "work") {
		t.Fatal("the tell to a standing door answers false")
	}
	if got := <-took; got != (TabMsg{Name: "work"}) {
		t.Fatalf("the door hands the window %v, and wants the work tab", got)
	}
}

func TestATellToADoorThatNeverAnswersEndsOnTheClock(t *testing.T) {
	t.Parallel()
	at, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatal(err)
	}
	defer at.Close()
	fake := qtest.NewFake(time.Unix(0, 0))
	told := make(chan bool, 1)
	go func() { told <- TellPort(fake, at.Addr().(*net.TCPAddr).Port, "work") }()
	select {
	case <-told:
		t.Fatal("the tell ends before the clock passes the call wait")
	case <-time.After(50 * time.Millisecond):
	}
	fake.Tick(callWait)
	select {
	case took := <-told:
		if took {
			t.Fatal("a door that never answers takes the tab")
		}
	case <-time.After(time.Second):
		t.Fatal("the tell stands open once the clock passes the call wait")
	}
}
