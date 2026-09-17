// The window's door, both ways: it takes a tab a caller hands it, it refuses a
// body naming none, and a second door on the held port stands nowhere.

package main

import (
	"testing"
)

const testPort = 6599

func TestTheDoorTakesATabAndHandsItToTheWindow(t *testing.T) {
	took := make(chan any, 1)
	door, err := openDoor(testPort, func(msg any) { took <- msg })
	if err != nil {
		t.Fatalf("the door opens on a free port, and answers %v", err)
	}
	defer func() { _ = door.Close() }()

	if !tellPort(testPort, "work") {
		t.Fatal("a caller hands the door a tab, and the door takes it")
	}
	msg := <-took
	one, made := msg.(tabMsg)
	if !made || one.name != "work" {
		t.Fatalf("the door puts a tabMsg into the window, and it put %#v", msg)
	}
}

func TestAPortAlreadyHeldOpensNoSecondDoor(t *testing.T) {
	door, err := openDoor(testPort+1, func(_ any) {})
	if err != nil {
		t.Fatalf("the first door opens, and answers %v", err)
	}
	defer func() { _ = door.Close() }()

	second, err := openDoor(testPort+1, func(_ any) {})
	if err == nil {
		_ = second.Close()
		t.Fatal("a port already held opens no second door, so the second launch knows to hand over")
	}
}

func TestACallToAPortNobodyHoldsAnswersFalse(t *testing.T) {
	t.Parallel()
	if tellPort(testPort+2, "log") {
		t.Fatal("a port nobody holds takes no tab, so the launch opens a window of its own")
	}
}

func TestTheWindowNamesItsTabsAndAnswersZeroForAnyOther(t *testing.T) {
	t.Parallel()
	m := window(1)
	for name, want := range map[string]int{"log": 1, "work": 2, "nothing": 0, "": 0} {
		if got := m.tabNamed(name); got != want {
			t.Fatalf("tab %q stands at %d, and tabNamed answers %d", name, want, got)
		}
	}
}

func TestATabMsgOpensThatTabAndAnUnknownOneLeavesTheOpenTab(t *testing.T) {
	t.Parallel()
	m := window(1)
	next, _ := m.Update(tabMsg{name: "work"})
	m = next.(model)
	if m.open != 1 {
		t.Fatalf("a tabMsg opens the work tab, and tab %d stands open", m.open)
	}
	next, _ = m.Update(tabMsg{name: "nothing"})
	if next.(model).open != 1 {
		t.Fatalf("a name no tab carries leaves the open one, and tab %d stands open", next.(model).open)
	}
}
