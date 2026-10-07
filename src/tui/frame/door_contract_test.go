// The window's door against a real socket, both ways: it takes a tab a caller
// hands it, it refuses a body naming none, a second door on the held port
// stands nowhere, and a door holding its answer ends the tell on the clock.
// [[spec/design_output/tui#a-second-launch-hands-over]]

package frame

import (
	"net"
	"net/http"
	"strconv"
	"strings"
	"sync/atomic"
	"testing"
	"time"

	"quackitect/src/q/qtest"
)

// A port nothing holds, off the listener the system hands out. [[spec/design_output/tui#a-second-launch-hands-over]]
func freePort(t *testing.T) int {
	t.Helper()
	at, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatal(err)
	}
	defer at.Close()
	return at.Addr().(*net.TCPAddr).Port
}

func TestTheDoorTakesATabAndHandsItToTheWindow(t *testing.T) {
	t.Parallel()
	port := freePort(t)
	took := make(chan any, 1)
	door, err := OpenDoor(port, func(msg any) { took <- msg })
	if err != nil {
		t.Fatalf("the door opens on a free port, and answers %v", err)
	}
	defer door.Close()
	if !TellPort(qtest.Wall(), port, "work") {
		t.Fatal("a caller hands the door a tab, and the door takes it")
	}
	if one, made := (<-took).(TabMsg); !made || one.Name != "work" {
		t.Fatalf("the door puts a TabMsg naming work into the window, and it put %#v", one)
	}
	second, err := OpenDoor(port, func(_ any) {})
	if err == nil {
		_ = second.Close()
		t.Fatal("a port already held opens no second door, so the second launch knows to hand over")
	}
}

func TestACallToAPortNobodyHoldsAnswersFalse(t *testing.T) {
	t.Parallel()
	if TellPort(qtest.Wall(), freePort(t), "log") {
		t.Fatal("a port nobody holds takes no tab, so the launch opens a window of its own")
	}
}

func TestTheDoorRefusesABodyThatNamesNoTab(t *testing.T) {
	t.Parallel()
	port := freePort(t)
	var took atomic.Int32
	door, err := OpenDoor(port, func(_ any) { took.Add(1) })
	if err != nil {
		t.Fatal(err)
	}
	defer door.Close()
	answer, err := http.Post("http://"+net.JoinHostPort("127.0.0.1", strconv.Itoa(port))+"/tab", "application/json", strings.NewReader("no json"))
	if err != nil {
		t.Fatal(err)
	}
	answer.Body.Close()
	if answer.StatusCode != http.StatusBadRequest || took.Load() != 0 {
		t.Fatalf("a body naming no tab answers %d and hands the window %d tabs, and wants 400 and none", answer.StatusCode, took.Load())
	}
}

// The tell stands open while the call reaches a door that never answers, and ends once the clock passes the call wait. [[spec/tickets/go-waits-on-events]]
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
	call, err := at.Accept()
	if err != nil {
		t.Fatal(err)
	}
	defer call.Close()
	select {
	case <-told:
		t.Fatal("the tell ends before the clock passes the call wait")
	default:
	}
	fake.Tick(callWait)
	if <-told {
		t.Fatal("a door that never answers takes the tab")
	}
}
