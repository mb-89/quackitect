package main

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"
)

// THE SANCTIONED STOPS, AND THE CLAIM THAT RELEASES ONE.
//
// A refused stop that the next ask grants is not a rule. The harness sets its
// retry flag by itself, so the agent asking twice proves only that the harness
// retried. v3 measured that defect: block, pass, block, pass, and the tooth
// never bit.
//
// SO THE AGENT NAMES ITS REASON. The refusal carries the list, the agent says
// which entry applies and why, and that claim is on the record where a person
// can read it. Saying it in chat is not enough, because nothing can read chat.
//
// A CLAIM STANDS UNTIL THE AGENT ACTS. Stopping does not spend it, because
// stopping is what it was for. Anything else does, because a claim says the
// next thing is stopping and carrying on is changing your mind.
//
// SPENDING IT ON THE STOP WAS WRONG, and it was wrong for a reason worth
// keeping. A harness sends turns nobody asked for: a notification, a task
// event, a hook's own refusal handed back as text. Each one is a turn, each
// turn ends in a stop, and each stop wanted its own claim. So an agent that
// had stopped, and done nothing since, was refused for the whole of the rest
// of the session. It could not obey the refusal without carrying on, and
// carrying on was the thing it was refused for.
//
// The tooth still bites. A stop with no claim is still refused, however many
// times it is asked, so a harness that retries proves nothing and gets
// nothing. What is granted is one stopping, and stopping ends when work does.
//
// THE LIST IS ASSEMBLED, NOT WRITTEN. Each level registers the stops it
// sanctions, the same way it registers the checks that refuse one. Level 0
// holds the ones that are true whatever is above it.

type StopReason struct {
	ID   string `json:"id"`   // what the agent names
	Says string `json:"says"` // what it means
}

var sanctioned []StopReason

// RegisterStopReason is called from an init in the level that owns the reason.
func RegisterStopReason(rs ...StopReason) { sanctioned = append(sanctioned, rs...) }

func init() {
	RegisterStopReason(
		StopReason{"decision", "A decision only the person can make. No answer you could pick " +
			"lets the work continue honestly."},
		StopReason{"broken", "Something broke and no remedy gets you past it."},
		StopReason{"asked", "The person told you to stop. Their word is the reason, and you need no other."},
		StopReason{"plan", "A plan, before it is acted on. Present it and wait. Once it has the " +
			"go, do the whole of it without asking again."},
	)
}

// A claim is one actor's named reason, and the next thing it does ends it.
type StopClaim struct {
	Session string `json:"session"`
	Actor   string `json:"actor"`
	Because string `json:"because"`
	Why     string `json:"why"`
	At      string `json:"at"`
}

func claimPath(r Roots) string { return r.Private("stop-claim.json") }

// THE CLAIMS, ONE PER ACTOR, IN ONE FILE.
//
// It held ONE claim. ClaimStop wrote a whole object over whatever was there
// without reading it first, and StandingClaim answered true only when the
// stored actor was the one being asked about, so a second actor's stop erased
// the first's in silence. Anything reading the record then said working over an
// agent that had stopped, which is the failure the header exists to end.
//
// A CLAIM IS PER ACTOR THE WAY THE HOLD IS PER TREE, and each is written where
// its subject is. The hold is one file because a person put everything down. A
// claim is one agent's named reason, and there are as many of those as there
// are agents.
type claims struct {
	Claims map[string]StopClaim `json:"claims"`
}

// loadClaims reads them, under either shape.
//
// A FILE WRITTEN BEFORE THIS EXISTED IS ONE CLAIM AT THE TOP LEVEL, and it is
// read as that actor's, so a session already running when this lands keeps the
// claim it made rather than losing it.
func loadClaims(r Roots) claims {
	c := claims{Claims: map[string]StopClaim{}}
	b, err := os.ReadFile(claimPath(r))
	if err != nil {
		return c
	}
	if json.Unmarshal(b, &c) == nil && len(c.Claims) > 0 {
		return c
	}
	c.Claims = map[string]StopClaim{}
	var one StopClaim
	if json.Unmarshal(b, &one) == nil && one.Actor != "" {
		c.Claims[one.Actor] = one
	}
	return c
}

func saveClaims(r Roots, c claims) error {
	b, err := json.MarshalIndent(c, "", "  ")
	if err != nil {
		return err
	}
	if err := os.MkdirAll(r.Private(), 0o755); err != nil {
		return err
	}
	return writeAtomic(claimPath(r), append(b, nl...), 0o644)
}

func Sanctioned() []StopReason { return sanctioned }

func knownReason(id string) bool {
	for _, s := range sanctioned {
		if s.ID == id {
			return true
		}
	}
	return false
}

// ClaimStop records that an agent is stopping for a named reason. An id that
// is not on the list is refused: naming one is the whole point, and a name
// nobody recognises names nothing.
func ClaimStop(r Roots, actor, because, why string) error {
	if !knownReason(because) {
		return fmt.Errorf("%q is not a sanctioned stop. It is one of: %s", because, reasonIDs())
	}
	if strings.TrimSpace(why) == "" {
		return fmt.Errorf("say why in one line. The reason on its own is a category, not a reason")
	}
	// A BLOCKED CLAIM MEETS THE RECORD AS IT IS MADE, so the refusal lands
	// where the claim was typed rather than at the stop after it.
	if because == "blocked" {
		if refusal, lied := BlockedIsFalse(r, actor); lied {
			return fmt.Errorf("blocked is not true: %s", refusal)
		}
	}
	return locked(claimPath(r), func() error {
		all := loadClaims(r)
		all.Claims[actor] = StopClaim{Session: currentSession(r), Actor: actor,
			Because: because, Why: why, At: now()}
		return saveClaims(r, all)
	})
}

// StandingClaim reads an actor's claim, and leaves it standing. A claim from
// another session is gone, because a session is where a decision was made.
//
// IT LOOKS UNDER EVERY NAME THE ACTOR ACTS AS. The lane stores a claim under
// the name the agent pulls with, and the stop hook asks under the name the
// harness gives it. An agent that pulled as fable-cloud and was main to the
// harness claimed five times in one session and was refused five times with
// NO CLAIM IS STANDING, the claim sitting unspent under the other name the
// whole while. The alias table already links the two, so it is read here.
func StandingClaim(r Roots, actor string) (StopClaim, bool) {
	all := loadClaims(r)
	for _, n := range everyNameOf(r, actor) {
		c, has := all.Claims[n]
		if has && c.Session == currentSession(r) {
			return c, true
		}
	}
	return StopClaim{}, false
}

// SpendClaim is what the guard calls before every tool, and it is the only
// thing that ends a claim. Working again is changing your mind.
// THE ARGUMENT'S COUNT IS NOT CLEARED HERE, and that is measured rather than
// chosen. se_stop is itself a tool call, so this runs between the claim and the
// Stop event it is for: clearing the count here reset it on every claim, the
// count never reached three, and no stop could ever be granted. The session was
// wedged, which is worse than the valve this rule replaced.
func SpendClaim(r Roots, actor string) {
	_ = locked(claimPath(r), func() error { // a claim it cannot drop is dropped when the session rotates
		all := loadClaims(r)
		spent := false
		// ONE ACTOR'S CLAIM IS SPENT AND THE REST STAND. Removing the file
		// spent everybody's, so one agent carrying on ended another's stop.
		// The one actor is every name it acts as, the same names StandingClaim
		// reads, so a claim the stop would find is a claim the next call ends.
		for _, n := range everyNameOf(r, actor) {
			if _, has := all.Claims[n]; has {
				delete(all.Claims, n)
				spent = true
			}
		}
		if !spent {
			return nil
		}
		return saveClaims(r, all)
	})
}

func reasonIDs() string {
	var ids []string
	for _, s := range sanctioned {
		ids = append(ids, s.ID)
	}
	return strings.Join(ids, ", ")
}

// TheList is what a refused stop says. It carries what refused, the stops that
// are sanctioned, and the ones that are not, because an agent that reads only
// the first list finds its own situation in whichever entry is vaguest.
func TheList(reason string) string {
	var b strings.Builder
	if strings.TrimSpace(reason) != "" {
		b.WriteString(reason + "\n\n")
	}
	// THE FIRST LINE IS THE CALL TO MAKE, because an agent that has not claimed
	// reads this whole notice as an argument it is losing.
	//
	// THE OWNER'S WORDS: the important thing is you still have to claim. Ask is
	// not granted if you didn't claim.
	//
	// AN AGENT ANSWERED THE PERSON AND THEN CLAIMED, then claimed and then
	// answered. Either way the claim was not standing when the stop was judged,
	// because an answer is a call and a call clears it. The notice came back, the
	// agent read a cleared claim as a refused one, and the person watched eleven
	// turns of it. So the order is said first, and said as two calls.
	b.WriteString("NO CLAIM IS STANDING, SO THE STOP IS NOT GRANTED. Claim one:\n\n" +
		"  se_stop {because: \"<which one>\", why: \"<one line>\"}\n\n" +
		"THEN STOP, AND MAKE THAT CLAIM YOUR LAST CALL. A status, a search and an\n" +
		"answer to the person are all calls, and every call after the claim clears it.\n\n")
	b.WriteString("THESE STOPS ARE SANCTIONED AND NOTHING ELSE IS.\n")
	for _, s := range sanctioned {
		fmt.Fprintf(&b, "  %-9s %s\n", s.ID, s.Says)
	}
	b.WriteString("\nThese are not: being unsure, having a lot left, having just finished a " +
		"piece, or wanting to say what you did. An update is not a stop. Give it and carry on.\n")
	// THE QUESTIONS COME BEFORE THE LIST.
	//
	// THE OWNER'S WORDS: it needs to ask you, do you need anything actionable
	// from the user? Are you sure that you cannot just continue?
	//
	// A LIST TEACHES THE WORDS. An agent served this eight times in one session
	// read it, picked whichever of the five fitted, and stopped. The list says
	// what a sanctioned stop is called; it never asked whether one is true here,
	// so the answer was a lookup rather than a judgement.
	b.WriteString("\nBEFORE YOU PICK ONE, ANSWER THESE TO YOURSELF.\n" +
		"  Is there something you need that only they can give? Name it, or there is not.\n" +
		"  Can you carry on with what is in your hands? If you can, carry on.\n" +
		"  Is what you are about to claim true, or is it the nearest word that fits?\n")
	// THE CLAIM IS CLEARED BY THE NEXT CALL, AND THAT HAS TO BE SAID PLAINLY.
	//
	// "Do anything and it is gone" was read as "do work and it is gone". An agent
	// claimed broken, then asked the engine for its status, and the status cleared
	// the claim. This notice came back unchanged, so the agent claimed again, and
	// checked again, and went round forty times. Nothing in the notice said the
	// claim had been cleared, or by what, so a repeat looked like a refusal.
	//
	// SO IT NAMES THE CALLS THAT CLEAR IT, and it says what a second refusal means.
	// A reading that has cost a session is worth three lines to close.
	b.WriteString("\nSTOPPING FOR ONE OF THOSE? SAY SO ON THE RECORD, then stop again:\n" +
		"  se_stop {because: \"<which one>\", why: \"<one line>\"}\n" +
		"  " + theShellDoor("stop --because <which one> --why \"<one line>\"") + "\n" +
		"Saying it in chat is not enough. Nothing can read chat.\n" +
		"\nMAKE THE CLAIM YOUR LAST CALL. Every call after it clears the claim, and a\n" +
		"status, a search or an answer to the person is a call.\n" +
		"SO A SECOND REFUSAL MEANS THE CLAIM WAS CLEARED, never that it was refused.\n" +
		"Claim again, and this time stop on it.")
	return b.String()
}
