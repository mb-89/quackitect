// The window's door against a real socket, both ways: it takes a tab a caller
// hands it, it refuses a body naming none, a second door on the held port
// stands nowhere, and a door holding its answer ends the tell on the clock.
// [[spec/design_output/tui#a-second-launch-hands-over]]

package frame // level0: InPackageTest - reaches the unexported callWait

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

// A listener on the port the system hands out, held from the bind on, so no parallel case takes the port in a gap. [[spec/tickets/door-tests-hold-their-port]]
func heldPort(t *testing.T) (net.Listener, int) {
	t.Helper()
	at, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatal(err)
	}
	return at, at.Addr().(*net.TCPAddr).Port
}

func TestTheDoorTakesATabAndHandsItToTheWindow(t *testing.T) {
	t.Parallel()
	at, port := heldPort(t)
	took := make(chan any, 1)
	door := ServeDoor(at, func(msg any) { took <- msg })
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

// The port stands held by a listener that drops each call, so no door answers there and no parallel case binds it. [[spec/tickets/door-tests-hold-their-port]]
func TestACallWhereNoDoorAnswersAnswersFalse(t *testing.T) {
	t.Parallel()
	at, port := heldPort(t)
	defer at.Close()
	go func() {
		for {
			call, err := at.Accept()
			if err != nil {
				return
			}
			_ = call.Close()
		}
	}()
	if TellPort(qtest.Wall(), port, "log") {
		t.Fatal("a port where no door answers takes no tab, so the launch opens a window of its own")
	}
}

func TestTheDoorRefusesABodyThatNamesNoTab(t *testing.T) {
	t.Parallel()
	at, port := heldPort(t)
	var took atomic.Int32
	door := ServeDoor(at, func(_ any) { took.Add(1) })
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

// The tell stands open while the call reaches a door that stays silent, and ends once the clock passes the call wait. [[spec/tickets/go-waits-on-events]]
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
