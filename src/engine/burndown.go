package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"
)

// THE BURN DOWN. Four numbers, computed here and drawn there.
//
// THE OWNER'S WORDS: the number of minted per day, the number of done per day,
// the number of total open or backlogged, not per day but just in absolute
// terms, and the rate at which work tokens fail reviews, which can be more than
// a hundred percent. And, obviously, the engine should do these calculations.
//
// A number the editor derives is a number nothing checks.

// TheWindowIsTheLog says what the reading covers, so a reader can tell a small
// number from a short window. A retro truncates the log, and how long the run
// is kept is decided on wk-88f4fcc517.
const TheWindowIsTheLog = "the log under .se/log, which a retro truncates. " +
	"How long the run is kept is decided on wk-88f4fcc517"

type Burndown struct {
	Day    string `json:"day"`
	Minted int    `json:"minted"`
	Done   int    `json:"done"`

	// Open is absolute rather than per day: everything that has not ended,
	// across both stores, taken now.
	Open int `json:"open"`

	// Rate is rejections that day over tokens that reached a review that day,
	// as a percentage. It goes above a hundred when one token is rejected
	// twice, which is the property the owner asked for by name.
	Rate int `json:"rate"`

	Window string `json:"window"`

	// Says is what the bar shows and Detail is what a hover shows, both built
	// here so the editor draws them rather than forming them.
	Says   string `json:"says"`
	Detail string `json:"detail"`
}

// TheDay is the UTC day a burn-down is asked for. Every line in the log carries
// a Z stamp, so a person reading at half past midnight in central Europe is
// shown the day that ended ninety minutes earlier. That is a decision.
func TheDay(at time.Time) string { return at.UTC().Format("2006-01-02") }

// TheBurndown answers the four numbers for one UTC day.
func TheBurndown(r Roots, day string) Burndown {
	b := Burndown{Day: day, Window: TheWindowIsTheLog}
	rejected := 0
	reviewed := map[string]bool{}
	for _, e := range theLog(r) {
		if theDayOf(e.T) != day {
			continue
		}
		switch {
		case e.Kind == "work" && e.Data["assignee"] != nil && e.Data["status"] != nil:
			b.Minted++
		case e.Kind == "work" && said(e.Data["to"]) == string(ImpDone):
			b.Done++
		case e.Kind == "review":
			if id := said(e.Data["id"]); id != "" {
				reviewed[id] = true
			}
			if v := said(e.Data["verdict"]); v == "rejected" || v == "spec rejected" {
				rejected++
			}
		}
	}
	for _, t := range Tokens(r) {
		if !t.Status.Ended() {
			b.Open++
		}
	}
	if len(reviewed) > 0 {
		b.Rate = rejected * 100 / len(reviewed)
	}
	b.Says = fmt.Sprintf("BD: %d/%d/%d/%d%%", b.Minted, b.Done, b.Open, b.Rate)
	b.Detail = fmt.Sprintf("on %s: %d minted, %d done. %d open or backlogged now. "+
		"%d rejection(s) over %d token(s) that reached a review, %d%%. Over %s",
		b.Day, b.Minted, b.Done, b.Open, rejected, len(reviewed), b.Rate, b.Window)
	return b
}

// AN EVENT, AT THE WIDTH THIS READS. The log is written by several processes and
// may be read twice, so duplicates are dropped on session, seq, src and time,
// which is what util/checks/count-reviews.py drops them on.
type logged struct {
	T       string         `json:"t"`
	Seq     int            `json:"seq"`
	Session string         `json:"session"`
	Src     string         `json:"src"`
	Kind    string         `json:"kind"`
	Data    map[string]any `json:"data"`
}

func theLog(r Roots) []logged {
	dir := r.Private("log")
	names, err := os.ReadDir(dir)
	if err != nil {
		return nil
	}
	var files []string
	for _, n := range names {
		if !n.IsDir() && strings.HasSuffix(n.Name(), ".jsonl") {
			files = append(files, filepath.Join(dir, n.Name()))
		}
	}
	sort.Strings(files)
	var out []logged
	seen := map[string]bool{}
	for _, path := range files {
		f, err := os.Open(path)
		if err != nil {
			continue
		}
		s := bufio.NewScanner(f)
		s.Buffer(make([]byte, 0, 64*1024), 8*1024*1024)
		for s.Scan() {
			var e logged
			if json.Unmarshal(s.Bytes(), &e) != nil {
				continue
			}
			key := fmt.Sprintf("%s|%d|%s|%s", e.Session, e.Seq, e.Src, e.T)
			if seen[key] {
				continue
			}
			seen[key] = true
			out = append(out, e)
		}
		f.Close()
	}
	return out
}

func theDayOf(stamp string) string {
	if len(stamp) < 10 {
		return ""
	}
	return stamp[:10]
}

func said(v any) string {
	if v == nil {
		return ""
	}
	s, _ := v.(string)
	return s
}
