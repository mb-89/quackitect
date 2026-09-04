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
func StandingClaim(r Roots, actor string) (StopClaim, bool) {
	c, has := loadClaims(r).Claims[actor]
	if !has || c.Session != currentSession(r) {
		return StopClaim{}, false
	}
	return c, true
}

// SpendClaim is what the guard calls before every tool, and it is the only
// thing that ends a claim. Working again is changing your mind.
func SpendClaim(r Roots, actor string) {
	_ = locked(claimPath(r), func() error { // a claim it cannot drop is dropped when the session rotates
		all := loadClaims(r)
		if _, has := all.Claims[actor]; !has {
			return nil
		}
		// ONE ACTOR'S CLAIM IS SPENT AND THE REST STAND. Removing the file
		// spent everybody's, so one agent carrying on ended another's stop.
		delete(all.Claims, actor)
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
	b.WriteString("THESE STOPS ARE SANCTIONED AND NOTHING ELSE IS.\n")
	for _, s := range sanctioned {
		fmt.Fprintf(&b, "  %-9s %s\n", s.ID, s.Says)
	}
	b.WriteString("\nThese are not: being unsure, having a lot left, having just finished a " +
		"piece, or wanting to say what you did. An update is not a stop. Give it and carry on.\n")
	b.WriteString("\nSTOPPING FOR ONE OF THOSE? SAY SO ON THE RECORD, then stop again:\n" +
		"  se_stop {because: \"<which one>\", why: \"<one line>\"}\n" +
		"Saying it in chat is not enough. Nothing can read chat.\n" +
		"The claim stands while you are stopped. Do anything and it is gone.")
	return b.String()
}
