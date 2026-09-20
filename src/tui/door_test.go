// The window's door, both ways: it takes a tab a caller hands it, it refuses a
// body naming none, and a second door on the held port stands nowhere.

package main

import (
	"quackitect/tui/frame"

	"testing"
)

const testPort = 6599

func TestTheDoorTakesATabAndHandsItToTheWindow(t *testing.T) {
	took := make(chan any, 1)
	door, err := frame.OpenDoor(testPort, func(msg any) { took <- msg })
	if err != nil {
		t.Fatalf("the door opens on a free port, and answers %v", err)
	}
	defer func() { _ = door.Close() }()

	if !frame.TellPort(testPort, "work") {
		t.Fatal("a caller hands the door a tab, and the door takes it")
	}
	msg := <-took
	one, made := msg.(frame.TabMsg)
	if !made || one.Name != "work" {
		t.Fatalf("the door puts a TabMsg into the window, and it put %#v", msg)
	}
}

func TestAPortAlreadyHeldOpensNoSecondDoor(t *testing.T) {
	door, err := frame.OpenDoor(testPort+1, func(_ any) {})
	if err != nil {
		t.Fatalf("the first door opens, and answers %v", err)
	}
	defer func() { _ = door.Close() }()

	second, err := frame.OpenDoor(testPort+1, func(_ any) {})
	if err == nil {
		_ = second.Close()
		t.Fatal("a port already held opens no second door, so the second launch knows to hand over")
	}
}

func TestACallToAPortNobodyHoldsAnswersFalse(t *testing.T) {
	t.Parallel()
	if frame.TellPort(testPort+2, "log") {
		t.Fatal("a port nobody holds takes no tab, so the launch opens a window of its own")
	}
}

func TestTheWindowNamesItsTabsAndAnswersZeroForAnyOther(t *testing.T) {
	t.Parallel()
	m := window(1)
	for name, want := range map[string]int{"log": 1, "work": 2, "nothing": 0, "": 0} {
		if got := m.TabNamed(name); got != want {
			t.Fatalf("tab %q stands at %d, and TabNamed answers %d", name, want, got)
		}
	}
}

func TestATabMsgOpensThatTabAndAnUnknownOneLeavesTheOpenTab(t *testing.T) {
	t.Parallel()
	m := window(1)
	next, _ := m.Update(frame.TabMsg{Name: "work"})
	m = next.(frame.Model)
	if m.Open != 1 {
		t.Fatalf("a TabMsg opens the work tab, and tab %d stands open", m.Open)
	}
	next, _ = m.Update(frame.TabMsg{Name: "nothing"})
	if next.(frame.Model).Open != 1 {
		t.Fatalf("a name no tab carries leaves the open one, and tab %d stands open", next.(frame.Model).Open)
	}
}
