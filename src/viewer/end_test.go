package main

import "testing"

// THE END IS THE END. A list that loops back to the top takes the reader
// somewhere they did not ask to go, and they have to work out where they are
// before they can do anything else.
func TestPagingDownAtTheEndStaysThere(t *testing.T) {
	t.Parallel()
	m := newTestModel(60)
	m = key(m, "home")
	if m.selID != 1 {
		t.Fatalf("home left the selection on %d", m.selID)
	}
	var seen []int64
	for i := 0; i < 10; i++ {
		m = key(m, "pgdown")
		seen = append(seen, m.selID)
	}
	for i := 1; i < len(seen); i++ {
		if seen[i] < seen[i-1] {
			t.Fatalf("paging down went backwards, from %d to %d: %v", seen[i-1], seen[i], seen)
		}
	}
	if seen[len(seen)-1] != 60 {
		t.Fatalf("it ended on %d rather than the last line: %v", seen[len(seen)-1], seen)
	}
}

// The same for a single step, and for what the window shows rather than only
// what is selected.
func TestSteppingDownAtTheEndStaysThere(t *testing.T) {
	t.Parallel()
	m := newTestModel(60)
	m = key(m, "end")
	top := m.top
	for i := 0; i < 5; i++ {
		m = key(m, "down")
	}
	if m.selID != 60 {
		t.Fatalf("stepping past the end moved the selection to %d", m.selID)
	}
	if m.top != top {
		t.Fatalf("stepping past the end scrolled the window from %d to %d", top, m.top)
	}
}

// What the window shows, when the selection walks onto the filter row and
// past it. The filter is the last row a person walks onto, and walking into
// it must not move the list.
func TestWalkingOntoTheFilterDoesNotMoveTheList(t *testing.T) {
	t.Parallel()
	m := newTestModel(60)
	m = key(m, "end")
	top, sel := m.top, m.selID
	for i := 0; i < 4; i++ {
		m = key(m, "pgdown")
		if m.top != top {
			t.Fatalf("page %d moved the window from %d to %d", i, top, m.top)
		}
		if m.selID != sel {
			t.Fatalf("page %d moved the selection from %d to %d", i, sel, m.selID)
		}
	}
	if !m.onFilter {
		t.Fatal("paging past the last row should land on the filter")
	}
	// And back up returns to the last row rather than the first.
	m = key(m, "up")
	if m.onFilter || m.selID != 60 {
		t.Fatalf("up from the filter went to %d, onFilter=%v", m.selID, m.onFilter)
	}
}
