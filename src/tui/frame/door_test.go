// The window's door refuses a body that names no tab, and hands the window
// nothing for it.
// [[spec/design_output/tui#a-second-launch-hands-over]]

package frame

import (
	"net"
	"net/http"
	"strconv"
	"strings"
	"sync/atomic"
	"testing"
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
