// The bus answers a peer on loopback that shows its token, and refuses one
// that shows none.
// [[spec/design_output/model#the-index-runs-nats]]
package index

import (
	"encoding/json"
	"strings"
	"testing"
	"time"
)

func TestTheBusAnswersALoopbackPeerShowingItsToken(t *testing.T) {
	bus, err := StartBus()
	if err != nil {
		t.Fatal(err)
	}
	defer bus.Close()
	if !strings.HasPrefix(bus.URL(), "nats://127.0.0.1:") || bus.Port() == 0 || bus.Token() == "" {
		t.Fatalf("the bus stands at %q, port %d, with token %q", bus.URL(), bus.Port(), bus.Token())
	}
	listener, err := Dial(bus.URL(), bus.Token())
	if err != nil {
		t.Fatalf("a peer showing the token meets %v", err)
	}
	defer listener.Close()
	heard := make(chan map[string]json.RawMessage, 1)
	stop, err := listener.Commits("fake", func(values map[string]json.RawMessage) { heard <- values })
	if err != nil {
		t.Fatal(err)
	}
	defer stop()
	sender, err := Dial(bus.URL(), bus.Token())
	if err != nil {
		t.Fatal(err)
	}
	defer sender.Close()
	if err := sender.Commit("fake", map[string]any{"fake/out": 7}); err != nil {
		t.Fatal(err)
	}
	select {
	case values := <-heard:
		if string(values["fake/out"]) != "7" {
			t.Fatalf("the commit arrives as %s", values)
		}
	case <-time.After(5 * time.Second):
		t.Fatal("no commit arrives over the bus")
	}
}

func TestTheIndexHearsEachBeatOfALease(t *testing.T) {
	bus, err := StartBus()
	if err != nil {
		t.Fatal(err)
	}
	defer bus.Close()
	listener, err := Dial(bus.URL(), bus.Token())
	if err != nil {
		t.Fatal(err)
	}
	defer listener.Close()
	heard := make(chan string, 1)
	stop, err := listener.Leases(func(part string) { heard <- part })
	if err != nil {
		t.Fatalf("the lease subject meets %v", err)
	}
	defer stop()
	sender, err := Dial(bus.URL(), bus.Token())
	if err != nil {
		t.Fatal(err)
	}
	defer sender.Close()
	if err := sender.Beat("io"); err != nil {
		t.Fatal(err)
	}
	select {
	case part := <-heard:
		if part != "io" {
			t.Fatalf("the beat arrives under the part %q", part)
		}
	case <-time.After(5 * time.Second):
		t.Fatal("no beat arrives over the bus")
	}
}

func TestTheBusRefusesAPeerWithoutTheToken(t *testing.T) {
	bus, err := StartBus()
	if err != nil {
		t.Fatal(err)
	}
	defer bus.Close()
	if bus.URL() == "" {
		t.Fatal("the bus names no address")
	}
	if peer, err := Dial(bus.URL(), ""); err == nil {
		peer.Close()
		t.Fatal("a peer showing no token reaches the bus")
	}
}
