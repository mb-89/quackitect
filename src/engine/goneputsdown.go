package main

import "fmt"

// AN AGENT THAT GOES PUTS DOWN WHAT IT WAS HOLDING.
//
// THE OWNER'S WORDS: why can an agent even go if his token isn't done? These
// agents didn't give back their token, but they died. This shouldn't happen.
//
// Nine tokens sat behind agents that no longer existed. A row in the panel is
// drawn for whoever holds a token, so the dead looked busy, and the queue
// counted their work as in hand and handed nobody else any of it.
//
// TWO DOORS AND BOTH ARE SHUT NOW. A helper's stop is refused while it holds
// open work, so it finishes or puts the work down deliberately. And an agent
// marked gone puts down what it held, for the one that dies anyway: a stop
// reaches some helpers and never others, and the turn's end sweeps the rest.

// PutDownWhatTheyHeld sets back every open token held under this agent's names
// and answers what it released.
//
// IT WALKS EVERY NAME. The register knows an agent by the harness's id and a
// token is held under the name it pulled with, so releasing by the id alone
// would release nothing at all.
func PutDownWhatTheyHeld(r Roots, id string) []string {
	if id == "" {
		return nil
	}
	var back []string
	for _, t := range TheyHold(r, id) {
		if _, err := PutDown(r, t.ID, t.Holder); err == nil {
			back = append(back, t.ID)
		}
	}
	return back
}

// TheyHold answers the open tokens held under any name this agent answers to.
func TheyHold(r Roots, id string) []Token {
	mine := map[string]bool{}
	for _, n := range everyNameOf(r, id) {
		mine[n] = true
	}
	var out []Token
	for _, t := range Tokens(r) {
		if t.Holder != "" && mine[t.Holder] && !t.Ended() {
			out = append(out, t)
		}
	}
	return out
}

// SweepWorkHeldByTheGone puts back every open token held by an agent this run
// no longer has, and answers what it released.
//
// A START IS WHERE A GHOST IS CAUGHT. The two doors above shut the future: a
// helper is refused its stop while it holds work, and one that dies anyway is
// released as it goes. Neither reaches what is already parked, and twelve
// tokens were, held by hands that ended before either door existed.
//
// IT ASKS WHO IS HERE, not who ever was. AgentsPresent answers this run's
// register, so a holder that is not in it is a holder that cannot come back.
// The main agent is never swept: it holds its work across a restart on purpose.
func SweepWorkHeldByTheGone(r Roots) []string {
	here := map[string]bool{"main": true, "": true}
	for _, d := range AgentsPresent(r) {
		here[d.Actor] = true
		for _, n := range everyNameOf(r, d.Actor) {
			here[n] = true
		}
	}
	var back []string
	for _, t := range Tokens(r) {
		if t.Holder == "" || t.Ended() || here[t.Holder] {
			continue
		}
		if _, err := PutDown(r, t.ID, t.Holder); err == nil {
			back = append(back, t.ID)
		}
	}
	return back
}

// AHelperStopHoldingWork answers why a helper's stop is refused while it holds
// open work, and whether it is.
//
// THE ENGINE TIDYING UP AFTER A HELPER IS THE FALLBACK, NOT THE RULE. A helper
// that walks away from work in hand leaves a token nobody decided anything
// about: not submitted, not put down, not carried. So it is asked to finish it
// or to put it down on purpose, and only a death takes the decision away.
func AHelperStopHoldingWork(r Roots, id string) (string, bool) {
	held := TheyHold(r, id)
	if len(held) == 0 {
		return "", false
	}
	said := fmt.Sprintf("YOU ARE HOLDING %d PIECE(S) OF WORK, AND STOPPING LEAVES THEM "+
		"BEHIND A HAND THAT NO LONGER EXISTS.\n\n", len(held))
	for _, t := range held {
		said += "  " + t.ID + "  " + t.Title + "\n"
	}
	return said + "\nFinish it and submit with se_pull, naming the id and a disposition. " +
		"If it is not yours to finish, put it down on purpose so the queue can hand it " +
		"to somebody else. Either is one call, and either lets you stop.\n\n" +
		theShellDoor("pull --id <id> --disposition <what happened>"), true
}

// AHelperStopStillRefused counts this refusal and answers whether the guard
// refuses again, or lets the helper go.
//
// A HELPER IS NOT THE MAIN AGENT. It has no person to answer to and no claim to
// make on its own behalf, so refusing it for ever wedges a session nobody is
// watching. PutDownWhatTheyHeld is what keeps the token from leaving with it.
//
// THE HOOK AND ITS CHECK ASK ONE FUNCTION. The condition was written inline at
// the call site, so a check could only restate it alongside and drift from it.
func AHelperStopStillRefused(r Roots, id string) bool {
	return countRefusedStop(r, "holding:"+id) < helperRefusalsBeforeRelenting
}
