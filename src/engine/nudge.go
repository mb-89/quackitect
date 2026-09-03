package main

import (
	"encoding/json"
	"fmt"
	"os"
)

// A NUDGE ON THE WAY UP, ONCE PER STEP, AND DECLINING IS FINE.
//
// THE OWNER'S SHAPE: when three tokens are open where the walker is and none is
// in work, the engine says how about you spawn a subagent. At six it says it
// again. At nine again. Once each. The same for the reviewer: when the line
// waiting for a review is long and nothing is in review, how about another
// reviewer.
//
// IT IS A NUDGE AND NOT A REFUSAL. Sometimes work does not split, and declining
// is a legitimate answer, so nothing is refused and nothing has to be claimed.
// The engine says it once and stops.
//
// ONLY ON THE WAY UP. What is remembered is the highest step already nudged at,
// per queue. It speaks when the count crosses a step it has not spoken at, and
// it forgets a step once the count falls below it. So a queue that empties and
// fills again is nudged again, and a queue sitting at seven is not nudged on
// every pull.
//
// THAT NEEDS NO CLOCK, which is why it fits here: a count is a fact and a clock
// guesses.
//
// IT SITS BESIDE THE WALL RATHER THAN REPLACING IT. limits.unreviewed_before_
// blocked is a refusal at one number that keeps firing until somebody obeys it.
// This speaks earlier and lets the agent decide, and the wall stays as the last
// resort at its own number.

// The counts a queue is nudged at, in order.
var NudgeSteps = []int{3, 6, 9}

type nudged struct {
	Session string         `json:"session"`
	At      map[string]int `json:"at"`
}

func nudgePath(r Roots) string { return r.Private("nudged.json") }

// Nudge answers what to say to this actor about its queue, or nothing.
func Nudge(r Roots, actor, role string) string {
	waiting, busy, what := countQueue(r, actor, role)
	// NOTHING IS SAID WHILE SOMETHING IS IN HAND. The nudge is about a queue
	// nobody is working, and an agent already holding one is working it.
	if busy {
		return ""
	}
	// A QUEUE THAT HAS FALLEN FORGETS THE STEPS IT FELL PAST, whatever it
	// has fallen to. This stood inside the empty case, so it could only
	// ever assign zero and the rule collapsed to forgetting everything when
	// the queue emptied. A queue that fell from nine to four and climbed
	// back said nothing for the rest of the session.
	forgetAbove(r, role, waiting)
	step := stepFor(waiting)
	if step == 0 {
		return ""
	}
	if !firstTimeAt(r, role, step) {
		return ""
	}
	return fmt.Sprintf("%d %s and nothing in hand. How about spawning another agent. "+
		"Declining is a fine answer: sometimes work does not split.", waiting, what)
}

// stepFor answers the highest step this count has reached, or zero.
func stepFor(n int) int {
	step := 0
	for _, s := range NudgeSteps {
		if n >= s {
			step = s
		}
	}
	return step
}

// firstTimeAt answers whether this queue has already been nudged at this step,
// and remembers that it has.
func firstTimeAt(r Roots, role string, step int) bool {
	first := false
	_ = locked(nudgePath(r), func() error { // a nudge it cannot remember is said again
		g := loadNudged(r)
		if g.At[role] >= step {
			return nil
		}
		g.At[role] = step
		first = true
		saveNudged(r, g)
		return nil
	})
	return first
}

// forgetAbove drops a step the count has fallen below, so a queue that empties
// and fills again is nudged again.
func forgetAbove(r Roots, role string, waiting int) {
	_ = locked(nudgePath(r), func() error { // a nudge it cannot remember is said again
		g := loadNudged(r)
		if g.At[role] <= stepFor(waiting) {
			return nil
		}
		g.At[role] = stepFor(waiting)
		saveNudged(r, g)
		return nil
	})
}

// A SESSION OF ITS OWN, the way arrivals has one. What was nudged at in a run
// that has ended says nothing about this one.
func loadNudged(r Roots) nudged {
	var g nudged
	if b, err := os.ReadFile(nudgePath(r)); err == nil {
		_ = json.Unmarshal(b, &g) // a file that will not read is a zero count
	}
	if g.At == nil || g.Session != currentSession(r) {
		g = nudged{Session: currentSession(r), At: map[string]int{}}
	}
	return g
}

func saveNudged(r Roots, g nudged) {
	if b, err := json.MarshalIndent(g, "", " "); err == nil {
		_ = writeAtomic(nudgePath(r), b, 0o644) // a nudge it cannot remember is said again
	}
}

// countQueue answers how much work is open and how much is in hand, so the
// nudge can say the queue is long while nothing is being done.
//
// IT ASKS THE PROCESS WHAT IS OPEN. A token is open when some activity of its
// process can run from where it stands, and in hand when somebody holds it.
func countQueue(r Roots, actor, role string) (open int, busy bool, what string) {
	for _, t := range Tokens(r) {
		if t.Ended() {
			continue
		}
		if t.Holder != "" {
			if t.Holder == actor {
				busy = true
			}
			continue
		}
		if Workable(r, t) {
			open++
		}
	}
	return open, busy, "open"
}
