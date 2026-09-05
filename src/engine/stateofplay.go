package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"quackitect/engine/internal/quiet"
	"sort"
	"strconv"
	"strings"
	"time"
)

// THE STATE OF PLAY. One screen that answers what is going on, read off the
// ledger and the record, writing nothing. It is the first thing a person asks
// and the first thing a report draws.
//
// THE OLD ASK NAMED SUBMITTED TOKENS AND HIGH ROUNDS. v4 settles a submission
// inside the pull and keeps no round on a token, so those two lines have no
// source. What waits is what the screen says instead: on a person, and parked
// behind ready_when.

// HoldLine is one actor's hold, with how long it has stood.
type HoldLine struct {
	Actor string `json:"actor"`
	ID    string `json:"id"`
	Title string `json:"title"`
	Age   string `json:"age,omitempty"`
}

type Play struct {
	Open      int            `json:"open"`
	Holds     []HoldLine     `json:"holds"`
	Depths    map[string]int `json:"depths"`
	OnAPerson []string       `json:"on_a_person,omitempty"`
	// WHAT WAITS BEHIND A ready_when, NAMED WITH ITS CONDITION. The queue hands
	// none of these out, so this screen is where the person who parked one
	// finds it again. A count alone said how many and not which.
	Parked []string `json:"parked,omitempty"`
	Minted int      `json:"minted_last_hour"`
	Closed int      `json:"closed_last_hour"`
	// Results is what the engine returned this session and how much of it
	// was wrong, counted by the engine itself. See results.go.
	Results Results `json:"results"`
}

// TheStateOfPlay reads the ledger the way a view does, and the current
// session's record for the last hour. It writes nothing.
func TheStateOfPlay(r Roots, now time.Time) Play {
	p := Play{Depths: map[string]int{}, Holds: []HoldLine{}}
	for _, t := range Tokens(r) {
		if t.Ended() {
			continue
		}
		p.Open++
		p.Depths[string(t.Status)]++
		if t.NeedsHuman {
			p.OnAPerson = append(p.OnAPerson, t.ID+"  "+t.Title)
		}
		if w := strings.TrimSpace(t.ReadyWhen); w != "" {
			p.Parked = append(p.Parked, t.ID+"  "+t.Title+"  ready when "+w)
		}
		if t.Holder != "" {
			p.Holds = append(p.Holds, HoldLine{Actor: t.Holder, ID: t.ID, Title: t.Title,
				Age: holdAge(r, t, now)})
		}
	}
	sort.Slice(p.Holds, func(i, j int) bool { return p.Holds[i].Actor < p.Holds[j].Actor })
	sort.Strings(p.OnAPerson)
	sort.Strings(p.Parked)
	p.Minted, p.Closed = movedWithin(r, now, time.Hour)
	p.Results = ResultsSoFar(r)
	return p
}

// holdAge is how long the hold has stood, read off the last began snapshot's
// commit time. A tree without snapshots answers nothing, and the line shows
// the hold without an age rather than guessing one.
func holdAge(r Roots, t Token, now time.Time) string {
	if len(t.Began) == 0 {
		return ""
	}
	out, err := gitShowsWhen(r, t.Began[len(t.Began)-1])
	if err != nil {
		return ""
	}
	age := now.Sub(out).Round(time.Minute)
	if age < 0 {
		return ""
	}
	if age < time.Minute {
		return "under a minute"
	}
	return age.String()
}

// gitShowsWhen answers when a snapshot commit was made. Reading history is
// not writing it, so the screen stays a reader here too.
func gitShowsWhen(r Roots, hash string) (time.Time, error) {
	cmd := quiet.Quietly(exec.Command("git", "show", "-s", "--format=%ct", hash))
	cmd.Dir = r.Work
	out, err := cmd.Output()
	if err != nil {
		return time.Time{}, err
	}
	seconds, err := strconv.ParseInt(strings.TrimSpace(string(out)), 10, 64)
	if err != nil {
		return time.Time{}, err
	}
	return time.Unix(seconds, 0), nil
}

// movedWithin counts mints and endings on the current session's log inside
// the window. The record is the source, so nothing here derives a move from
// what a token happens to look like now.
func movedWithin(r Roots, now time.Time, window time.Duration) (minted, closed int) {
	b, err := os.ReadFile(filepath.Join(r.Private("log"), Current))
	if err != nil {
		return 0, 0
	}
	for _, line := range strings.Split(string(b), "\n") {
		if line == "" {
			continue
		}
		var l struct {
			T    string         `json:"t"`
			Kind string         `json:"kind"`
			Data map[string]any `json:"data"`
		}
		if json.Unmarshal([]byte(line), &l) != nil || l.Kind != "work" {
			continue
		}
		at, err := time.Parse(time.RFC3339Nano, l.T)
		if err != nil || now.Sub(at) > window {
			continue
		}
		if l.Data["minted"] == true {
			minted++
		}
		if d, _ := l.Data["disposition"].(string); d != "" {
			closed++
		}
	}
	return minted, closed
}

// Screen is the one screen, plain text. Machine readers take the struct.
func (p Play) Screen() string {
	var b strings.Builder
	fmt.Fprintf(&b, "open %d", p.Open)
	var depths []string
	for s, n := range p.Depths {
		depths = append(depths, fmt.Sprintf("%s %d", s, n))
	}
	sort.Strings(depths)
	if len(depths) > 0 {
		fmt.Fprintf(&b, ": %s", strings.Join(depths, ", "))
	}
	fmt.Fprintf(&b, "\n%d on a person, %d parked\n", len(p.OnAPerson), len(p.Parked))
	for _, line := range p.OnAPerson {
		fmt.Fprintf(&b, "  %s\n", line)
	}
	for _, line := range p.Parked {
		fmt.Fprintf(&b, "  %s\n", line)
	}
	if len(p.Holds) > 0 {
		b.WriteString("holds:\n")
		for _, h := range p.Holds {
			fmt.Fprintf(&b, "  %-14s %s  %s", h.Actor, h.ID, h.Title)
			if h.Age != "" {
				fmt.Fprintf(&b, "  held %s", h.Age)
			}
			b.WriteString("\n")
		}
	}
	fmt.Fprintf(&b, "results %d, %d wrong\n", p.Results.Returned, p.Results.Wrong)
	fmt.Fprintf(&b, "last hour: minted %d, closed %d\n", p.Minted, p.Closed)
	return b.String()
}

// runState answers the state of play at a prompt: se state.
func runState(c *call) int {
	fs := flag.NewFlagSet("state", flag.ContinueOnError)
	fs.SetOutput(c.err)
	fs.Usage = func() {
		fmt.Fprintln(c.err, "se state - what is going on, in one screen. Reads everything, writes nothing.")
		fmt.Fprintln(c.err, "")
		fmt.Fprintln(c.err, "  se state           the screen")
		fmt.Fprintln(c.err, "  se state --json    the same, for a machine")
		fmt.Fprintln(c.err, "")
		fs.PrintDefaults()
	}
	fs.String("work", "", "the folder being worked on (default: this one)")
	asJSON := fs.Bool("json", false, "answer the structure rather than the screen")
	if code, stop := c.parse(fs, "state"); stop {
		return code
	}
	play := TheStateOfPlay(c.roots, time.Now())
	if *asJSON {
		c.answerJSON(play)
		return 0
	}
	fmt.Fprint(c.out, play.Screen())
	return 0
}
