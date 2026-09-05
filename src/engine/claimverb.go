package main

import (
	"flag"
	"fmt"
	"strings"
	"time"
)

// se claim - an agent takes a block of work, so no other box starts it.
//
// It is its own verb rather than a flag on pull, because a pull is one agent
// asking for one thing to do and a claim is one agent reserving several. A
// claim also has to reach the other boxes, and a pull never leaves this one.
//
// EVERY CLAIM PUBLISHES. See claim.go: a claim nobody else can read is not a
// claim. A box with no remote still claims, the answer says the push did not
// run, and the work is still that agent's here.
func runClaim(c *call) int {
	fs := flag.NewFlagSet("claim", flag.ContinueOnError)
	fs.SetOutput(c.err)
	fs.Usage = func() {
		fmt.Fprintln(c.err, "se claim - take a block of work, so no other box starts it.")
		fmt.Fprintln(c.err, "")
		fmt.Fprintln(c.err, "  se claim --whoami             the name this box writes on a claim")
		fmt.Fprintln(c.err, "  se claim --list               what is claimed, and by whom")
		fmt.Fprintln(c.err, "  se claim --next 3             what the queue would hand you on three pulls")
		fmt.Fprintln(c.err, "  se claim --these wk-aa,wk-bb  take these")
		fmt.Fprintln(c.err, "  se claim --these wk-aa --take  take it and start on it")
		fmt.Fprintln(c.err, "  se claim --release            give back everything you hold")
		fmt.Fprintln(c.err, "")
		fmt.Fprintln(c.err, "The engine says which box you are on. You say which agent you are,")
		fmt.Fprintln(c.err, "with --actor, and main is what every agent already pulls as.")
		fmt.Fprintln(c.err, "")
		fs.PrintDefaults()
	}
	fs.String("work", "", "the folder being worked on (default: this one)")
	actor := fs.String("actor", "main", "which agent is claiming")
	these := fs.String("these", "", "ids to claim, comma separated")
	next := fs.Int("next", 0, "instead: claim what the queue would hand you on this many pulls")
	as := fs.String("as", RoleWorker, "with next: which queue, worker or reviewer")
	release := fs.Bool("release", false, "give back what you hold. With no ids, all of it")
	list := fs.Bool("list", false, "print every claim written on a token and exit")
	whoami := fs.Bool("whoami", false, "print this box's name for this agent and exit")
	sync := fs.Bool("sync", false, "look for other boxes' claims now, rather than waiting for the engine's clock")
	quiet := fs.Bool("no-publish", false, "write the claim here and leave git alone")
	take := fs.Bool("take", false, "with these: take the one token up as well, so a refused agent needs one call and not two")
	if code, stop := c.parse(fs, "claim"); stop {
		return code
	}

	r := c.roots
	now := time.Now().UTC()
	me := Claimant(r, *actor)

	if *whoami {
		c.answerJSON(map[string]any{"claimant": me,
			"notice": "The engine writes this on a claim made here. Nothing passes it in."})
		return 0
	}
	if *sync {
		c.answerJSON(SyncClaims(c.ctx, r))
		return 0
	}
	if *list {
		c.answerJSON(map[string]any{"claims": Claims(r, now)})
		return 0
	}

	ids := splitComma(*these)
	if *next > 0 && !*release {
		ids = append(ids, WouldBeHanded(r, *actor, *as, *next, now)...)
		if len(ids) == 0 {
			c.answerJSON(ClaimResult{Claimant: me,
				Notice: "The queue would hand you nothing, so there is nothing to claim."})
			return 0
		}
	}

	var res ClaimResult
	var err error
	verb := "claimed"
	if *release {
		verb = "released"
		res, err = Release(r, me, ids, now)
	} else {
		res, err = Claim(r, me, ids, now)
	}
	if err != nil {
		c.answerJSON(map[string]any{"error": err.Error()})
		return 1
	}

	moved := res.Taken
	if *release {
		moved = res.Freed
	}
	if len(moved) > 0 {
		inSession(r, "claim", *actor, me+" "+verb+" "+strings.Join(moved, ", "), Yes(),
			map[string]any{"claimant": me, "ids": moved, "at": res.At})
	}
	// CLAIMING AND TAKING IN ONE CALL. An agent refused for want of a claim is
	// told to claim, and it would then need a second call to do the work it was
	// already on. One id, because taking up two tokens is not a thing: the
	// holder is one at a time.
	if *take && !*release && len(res.Taken) == 1 {
		if _, err := TakeUp(r, res.Taken[0], *actor); err != nil {
			res.Notice = "claimed, and the take-up was refused: " + err.Error()
		} else {
			res.Notice = res.Taken[0] + " is claimed and in your hands"
		}
	}
	if !*quiet {
		p := Publish(c.ctx, r, res.Files, ClaimMessage(me, verb, moved))
		res.Published = &p
	}
	c.answerJSON(res)
	return 0
}

// WouldBeHanded answers which tokens the queue would hand this agent over this
// many pulls, without handing any of them out.
//
// THE QUEUE DECIDES, AND NOT A SECOND RULE BESIDE IT. A claim of three is three
// pulls done at once, so it passes over exactly what a pull passes over and in
// the same order. A filter written here would be a second queue, and the two
// would disagree the first time either changed.
func WouldBeHanded(r Roots, actor, role string, howMany int, now time.Time) []string {
	me := Claimant(r, actor)
	var out []string
	taken := map[string]bool{}
	for len(out) < howMany {
		a := next(r, actor, role)
		if a.Pull != AnswerWork || a.Token == nil || taken[a.Token.ID] {
			break
		}
		t := *a.Token
		taken[t.ID] = true
		// A PULL PUTS THE TOKEN IN A HAND AND A CLAIM DOES NOT. This is asking
		// what the queue would do, so the hold it just opened is given back
		// before the next question.
		if _, err := PutDown(r, t.ID, actor); err != nil {
			break
		}
		if bad := WhyNotClaimable(r, t, me, now); bad != nil {
			continue
		}
		out = append(out, t.ID)
	}
	return out
}
