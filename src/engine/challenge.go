package main

import (
	"fmt"
	"strings"
)

// A CLAIM IS ARGUED WITH, AND THE THIRD ONE GOES.
//
// THE OWNER'S WORDS: you need to give a reason. Let's say the agent says I'm
// blocked, and the engine says, well, but I still have work to do. Then the
// agent can say again, yeah, but I'm blocked. If he has a reason three times,
// then it stops.
//
// NAMING A REASON WAS STOPPING. The claim was read and the stop granted in the
// same breath, so the reason cost nothing and any of the five words did. A guard
// that takes whatever it is told is a form to fill in.
//
// SO THE ENGINE PUSHES BACK TWICE, WHEN IT HAS SOMETHING TO PUSH BACK WITH.
// That something is work still in the agent's hands. Each claim gets the
// questions and the list of it, and the third claim is granted. What earns a
// stop over open work is persistence WITH a reason. Persistence without one
// earns nothing at all, which is the other half of this rule.
//
// AND WITH EMPTY HANDS THERE IS NO ARGUMENT. A good reason and nothing blocking
// is a stop on the first claim. Arguing with every claim made the count the rule
// and the state of the tree irrelevant. Both halves live in decideStop.
//
// AN EARLIER VERSION MADE THE AGENT QUOTE A WORD BACK, to prove it had read the
// refusal. That is a read-proof test rather than an argument, and it is not what
// was asked for. It also could not work: the word was derived from the claim, so
// answering it changed the claim and changed the word.

// claimsBeforeAStopIsGranted is how many times a reason has to be given.
//
// THREE, BY THE OWNER'S WORD. One is a reflex, two is a repeat, and three is a
// position somebody is holding.
const claimsBeforeAStopIsGranted = 3

// TheChallenge is what the engine says to a claim it has not granted yet.
func TheChallenge(c StopClaim, sofar int, held []Token) string {
	var b strings.Builder
	fmt.Fprintf(&b, "YOU CLAIMED %s: %q\n\n", strings.ToUpper(c.Because), c.Why)
	b.WriteString("THAT IS NOT TAKEN AS READ. Answer these, and answer them to " +
		"yourself first.\n\n" +
		"  Is there something you need that only they can give? Name the thing.\n" +
		"  Can you carry on with what is in your hands? If you can, carry on.\n" +
		"  Is " + c.Because + " true, or is it the nearest of five words that fits?\n")
	if len(held) > 0 {
		b.WriteString("\nAND THERE IS STILL WORK IN YOUR HANDS:\n")
		for _, t := range held {
			b.WriteString("  " + t.ID + "  " + t.Title + "\n")
		}
		b.WriteString("\nFinish it, or put it down on purpose so somebody else can.\n")
	}
	fmt.Fprintf(&b, "\nSTILL STOPPING? Say it again. That was claim %d of %d, and the "+
		"%s one is granted whatever is open.\n\n", sofar, claimsBeforeAStopIsGranted,
		ordinal(claimsBeforeAStopIsGranted))
	b.WriteString("  se_stop {because: \"<which one>\", why: \"<why it is still true>\"}\n" +
		"  " + theShellDoor("stop --because <which one> --why \"<why it is still true>\"") + "\n\n" +
		"ANYTHING ELSE YOU DO PUTS THE COUNT BACK. Carrying on is changing your mind, " +
		"and the next stop starts the argument again.")
	return b.String()
}

func ordinal(n int) string {
	switch n {
	case 1:
		return "first"
	case 2:
		return "second"
	case 3:
		return "third"
	}
	return fmt.Sprint(n) + "th"
}
