package main

import (
	"testing"
)

// URGENT IS A FLAG A PERSON SETS, AND THE QUEUE READS IT BEFORE THE ORDER IT
// ALREADY HAS.
//
// The queue hands out the oldest workable token, and a person watching it had
// no way to say which one matters most. Naming a token by id took it into one
// agent's hands and told the queue nothing. This is the other half: a flag on
// the token, read by every pull.
//
// FOUR THINGS ARE HELD HERE. The flag jumps the queue, an agent cannot set it,
// a put-down leaves it set, and a parked token stays out whatever it says.
func TestAnUrgentTokenGoesOutFirst(t *testing.T) {
	t.Parallel()

	t.Run("the older goes first while nothing is urgent", func(t *testing.T) {
		r := aTreeWithTheProcesses(t)
		older, _ := twoOrdinaryTokens(t, r)
		got := Pull(r, "worker-1", RoleWorker, Payload{})
		if whatWasHanded(got) != older.ID {
			t.Fatalf("the queue handed %s, wanted the older %s", whatWasHanded(got), older.ID)
		}
	})

	t.Run("and the urgent one goes before it", func(t *testing.T) {
		r := aTreeWithTheProcesses(t)
		older, newer := twoOrdinaryTokens(t, r)
		markUrgent(t, r, newer.ID)
		got := Pull(r, "worker-1", RoleWorker, Payload{})
		if whatWasHanded(got) != newer.ID {
			t.Fatalf("the queue handed %s, wanted the urgent %s before the older %s",
				whatWasHanded(got), newer.ID, older.ID)
		}
	})

	// A PUT-DOWN LEAVES IT SET. An agent that hands urgent work back is handed
	// it again, because it is still the most urgent thing.
	t.Run("a put-down leaves it set and it comes back first", func(t *testing.T) {
		r := aTreeWithTheProcesses(t)
		_, newer := twoOrdinaryTokens(t, r)
		markUrgent(t, r, newer.ID)
		if got := Pull(r, "worker-1", RoleWorker, Payload{}); whatWasHanded(got) != newer.ID {
			t.Fatalf("the first pull handed %s, wanted %s", whatWasHanded(got), newer.ID)
		}
		if _, err := PutDown(r, newer.ID, "worker-1"); err != nil {
			t.Fatal(err)
		}
		back, err := LoadToken(r, newer.ID)
		if err != nil {
			t.Fatal(err)
		}
		if !back.Urgent {
			t.Errorf("%s came back from a put-down with the flag off", newer.ID)
		}
		if got := Pull(r, "worker-2", RoleWorker, Payload{}); whatWasHanded(got) != newer.ID {
			t.Fatalf("the pull after the put-down handed %s, wanted %s", whatWasHanded(got), newer.ID)
		}
	})

	// PARKED BEATS URGENT. A token carrying a ready_when waits on a person, and
	// a flag does not bring it back into the queue.
	t.Run("a parked token stays out whatever the flag says", func(t *testing.T) {
		r := aTreeWithTheProcesses(t)
		one := mintStandard(t, r, "parked and urgent")
		one.ReadyWhen = "the owner says which box runs it"
		one.Urgent = true
		if err := SaveToken(r, one); err != nil {
			t.Fatal(err)
		}
		if got := Pull(r, "worker-1", RoleWorker, Payload{}); got.Pull == AnswerWork {
			t.Fatalf("a pull was handed %s while it waits on a person", whatWasHanded(got))
		}
	})

	// ONLY A PERSON SAYS WHAT IS URGENT. An agent that could set it would put
	// its own token at the front of everybody else's queue.
	t.Run("an agent is refused the flag and a person is not", func(t *testing.T) {
		r := aTreeWithTheProcesses(t)
		one := mintStandard(t, r, "whose flag is it")
		if err := WriteFieldBy(&one, "urgent", "true", "worker-1"); err == nil {
			t.Errorf("an agent set the flag: %+v", one)
		}
		if err := WriteFieldBy(&one, "urgent", "true", "person"); err != nil {
			t.Fatalf("a person was refused the flag: %v", err)
		}
		if err := SaveToken(r, one); err != nil {
			t.Fatal(err)
		}
		back, err := LoadToken(r, one.ID)
		if err != nil {
			t.Fatal(err)
		}
		if !back.Urgent {
			t.Errorf("the flag did not survive the note: %+v", back)
		}
		// AND THE ROW CARRIES IT, so the editor draws it and a view filters on it.
		var row Row
		for _, one := range TokenRows(r) {
			if one["id"].S == back.ID {
				row = one
			}
		}
		if !row["urgent"].B {
			t.Errorf("the row does not carry the flag: %+v", row)
		}
	})
}

// twoOrdinaryTokens mints two workable tokens and answers them in the queue's
// own order, which is by id. Which of the two is minted first is an accident
// of the ids, so the test asks rather than assumes.
func twoOrdinaryTokens(t *testing.T, r Roots) (older, newer Token) {
	t.Helper()
	a := mintStandard(t, r, "an ordinary token")
	b := mintStandard(t, r, "another ordinary one")
	if b.ID < a.ID {
		return b, a
	}
	return a, b
}

func markUrgent(t *testing.T, r Roots, id string) {
	t.Helper()
	tok, err := LoadToken(r, id)
	if err != nil {
		t.Fatal(err)
	}
	if err := WriteFieldBy(&tok, "urgent", "true", "person"); err != nil {
		t.Fatal(err)
	}
	if err := SaveToken(r, tok); err != nil {
		t.Fatal(err)
	}
}

// whatWasHanded is the id the queue handed out, or what it said instead.
func whatWasHanded(a Answer) string {
	if a.Token == nil {
		return "nothing: " + a.Notice
	}
	return a.Token.ID
}
