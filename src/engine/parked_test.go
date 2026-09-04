package main

import (
	"strings"
	"testing"
)

// A TOKEN THAT WAITS ON A PERSON IS NOT HANDED TO AN AGENT.
//
// An agent pulled a note whose ready_when said the owner had to take the
// backlog conversation up again. It put the token down, and the next pull
// answered the same one: PutDown clears the holder and the hand-out loop reads
// Ended, Holder, WorkableBy and Blocked, never ready_when. So the agent could
// not decline. The process forbids a fourth ending, so one that obeyed was
// livelocked and one that wanted progress wrote a disposition it did not
// believe, on exactly the tokens that most needed a person.
//
// AN ENGINE-JUDGED CONDITION IS depends_on. ready_when is what is left, and
// what is left is a person's judgement, which is why this filter is honest.
func TestATokenWaitingOnAPersonIsNotHandedOut(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)

	parked := mintStandard(t, r, "waits for the owner")
	parked.ReadyWhen = "the owner takes the backlog conversation up again"
	if err := SaveToken(r, parked); err != nil {
		t.Fatal(err)
	}

	// IT WANTS NO HANDS. Staffing counted a parked token as open work and
	// spawned workers for something no worker may be handed.
	if st := StaffingOf(r, LoadConfig(r)); st.OpenWork != 0 {
		t.Fatalf("staffing counted %d open pieces of work where the only token is parked", st.OpenWork)
	}

	// THE QUEUE PASSES OVER IT. With nothing else to do, the pull waits.
	got := Pull(r, "worker-1", RoleWorker, Payload{})
	if got.Pull == AnswerWork && got.Token != nil && got.Token.ID == parked.ID {
		t.Fatalf("the queue handed out a token that waits on a person: %s", parked.ID)
	}

	// AND ORDINARY WORK BESIDE IT IS STILL HANDED OUT, so this passes over the
	// parked one rather than stopping the queue.
	live := mintStandard(t, r, "ordinary work")
	got = Pull(r, "worker-2", RoleWorker, Payload{})
	if got.Pull != AnswerWork || got.Token == nil {
		t.Fatalf("the queue stopped instead of passing over: %s %s", got.Pull, got.Notice)
	}
	if got.Token.ID != live.ID {
		t.Fatalf("the queue handed %s, wanted the unparked %s", got.Token.ID, live.ID)
	}

	// AND NEEDS_HUMAN IS THE SAME ANSWER, because it says the same thing.
	if why := WaitsForAPerson(Token{NeedsHuman: true}); why == "" {
		t.Fatal("a token marked as needing a person reads as work an agent may take")
	}
	if why := WaitsForAPerson(Token{ReadyWhen: "  "}); why != "" {
		t.Fatalf("whitespace was read as a condition: %q", why)
	}

	// AND IT IS STILL SUBMITTABLE, because a person who un-parks it closes it.
	// Blocked would have refused that, which is why this is not Blocked.
	if why := Blocked(r, parked); strings.Contains(why, "person") {
		t.Fatalf("waiting on a person was made a block, so nobody can close it: %s", why)
	}
}
