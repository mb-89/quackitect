package main

// i13_build.go — the i0013_comments build: determinizer surface additions.

import (
	"encoding/json"
	"fmt"
	"os"
	"regexp"
	"sort"
	"strings"
)

// design: go-comment-island  implements: req-comment-layer.7, req-comment-layer.9
// The island: ONE <script type="application/json" id="quack-comments"> block per copy — the
// single source the sidebar renders from and the read-back reads. The schema follows the W3C
// Web Annotation vocabulary in compact keys: target carries the unit anchor + TextQuoteSelector
// fields (quote/prefix/suffix) + position (start/end) + an optional figure element id; thread
// messages carry the assessing mark (agree|reject|neutral); suggest carries a proposed edit
// (the editing motivation). A target with ONLY a unit id is legal — that is a premark, authored
// before any reader selection (uc-comment-premark stays buildable). Two islands = malformed,
// refused, never guessed.
type commentTarget struct {
	Unit   string `json:"unit"`
	Quote  string `json:"quote,omitempty"`
	Prefix string `json:"prefix,omitempty"`
	Suffix string `json:"suffix,omitempty"`
	Start  int    `json:"start,omitempty"`
	End    int    `json:"end,omitempty"`
	El     string `json:"el,omitempty"`
}

type commentMsg struct {
	Author string `json:"author,omitempty"`
	Mark   string `json:"mark,omitempty"` // agree | reject | neutral
	Text   string `json:"text"`
	TS     string `json:"ts,omitempty"`
}

type commentSuggest struct {
	Original string `json:"original"`
	Proposed string `json:"proposed"`
}

type commentAnn struct {
	ID      string          `json:"id"`
	Target  commentTarget   `json:"target"`
	Author  string          `json:"author,omitempty"`
	Status  string          `json:"status"` // open | closed
	Suggest *commentSuggest `json:"suggest,omitempty"`
	Thread  []commentMsg    `json:"thread"`
}

type commentIsland struct {
	Version     int          `json:"version"`
	Annotations []commentAnn `json:"annotations"`
}

var islandRe = regexp.MustCompile(`(?s)<script type="application/json" id="quack-comments">(.*?)</script>`)

func parseCommentIsland(html string) (*commentIsland, error) {
	ms := islandRe.FindAllStringSubmatch(html, -1)
	if len(ms) == 0 {
		return nil, fmt.Errorf("no comment island in the copy")
	}
	if len(ms) > 1 {
		return nil, fmt.Errorf("malformed copy: %d comment islands (exactly one) - refused, never guessed", len(ms))
	}
	var isl commentIsland
	if err := json.Unmarshal([]byte(ms[0][1]), &isl); err != nil {
		return nil, fmt.Errorf("comment island: %v", err)
	}
	return &isl, nil
}

// enddesign

// design: go-island-serialize  implements: req-comment-layer.4
// The serializer half of the escape rule (spike finding 2, proven live: the M5 probe itself
// broke on a comment containing a script-closing sequence). Marshal with HTML escaping: every
// angle bracket lands as its unicode escape, so island content can never close its own script
// tag — reversible, standard JSON.
func islandSerialize(raw []byte) (string, error) {
	var v interface{}
	if err := json.Unmarshal(raw, &v); err != nil {
		return "", fmt.Errorf("island serialize: %v", err)
	}
	b, err := json.Marshal(v) // encoding/json escapes <, >, & by default
	return string(b), err
}

// enddesign

// design: go-file2list  implements: req-comment-file2list.1, req-comment-file2list.2
// quack note --file2list <copy> — the pure lister (adr-comment-readback-lister): a commented
// copy becomes a deterministic list of NOTE CANDIDATES the agent triages in context, minting
// keepers as ordinary notes. It reads the island, never the DOM; two runs are byte-identical;
// author names are replaced by reader roles (reader-1, reader-2 in first-appearance order) at
// this boundary — no personal data can travel from a copy into the ledger.
func file2list(path string) (string, error) {
	raw, err := os.ReadFile(path)
	if err != nil {
		return "", err
	}
	isl, err := parseCommentIsland(string(raw))
	if err != nil {
		return "", err
	}
	roles := map[string]string{}
	role := func(name string) string {
		if name == "" {
			return "reader"
		}
		if r, ok := roles[name]; ok {
			return r
		}
		r := fmt.Sprintf("reader-%d", len(roles)+1)
		roles[name] = r
		return r
	}
	var b strings.Builder
	fmt.Fprintf(&b, "note candidates: %d comment(s)\n", len(isl.Annotations))
	for _, a := range isl.Annotations {
		status := a.Status
		if status == "" {
			status = "open"
		}
		fmt.Fprintf(&b, "--- %s [%s] unit %s", a.ID, status, a.Target.Unit)
		if a.Target.El != "" {
			fmt.Fprintf(&b, " el %s", a.Target.El)
		}
		b.WriteString("\n")
		if a.Target.Quote != "" {
			fmt.Fprintf(&b, "    quote: %q\n", a.Target.Quote)
		}
		if a.Suggest != nil {
			fmt.Fprintf(&b, "    suggest: %q -> %q\n", a.Suggest.Original, a.Suggest.Proposed)
		}
		for _, m := range a.Thread {
			mark := m.Mark
			if mark == "" {
				mark = "neutral"
			}
			fmt.Fprintf(&b, "    %s [%s]: %s\n", role(m.Author), mark, m.Text)
		}
	}
	return b.String(), nil
}

// enddesign

// design: go-calls-summary  implements: req-call-log-lifecycle.1
// quack calls --summary IS the retro's log step (review.md step 6): print the aggregate the
// method asks for — per-command counts, failure rate, slow calls, channel mix — then delete
// the log in the same move (retention is retro-bound, adr-call-log). One deterministic command
// replaces the hand-written aggregation script the agent rewrote every retro.
func cmdCalls(args []string) {
	if !hasFlag(args, "--summary") {
		fmt.Println("usage: " + brand() + " calls --summary   (print the call-log aggregate, then delete the log)")
		return
	}
	path := callLogPath()
	raw, err := os.ReadFile(path)
	if err != nil {
		fmt.Println("calls: no log - nothing to aggregate")
		return
	}
	type agg struct{ n, fails, slow int }
	per := map[string]*agg{}
	channels := map[string]int{}
	total := 0
	for _, line := range strings.Split(strings.TrimSpace(string(raw)), "\n") {
		var rec struct {
			Cmd     string `json:"cmd"`
			Channel string `json:"channel"`
			Exit    int    `json:"exit"`
			Ms      int64  `json:"ms"`
		}
		if json.Unmarshal([]byte(line), &rec) != nil || rec.Cmd == "" {
			continue
		}
		total++
		a := per[rec.Cmd]
		if a == nil {
			a = &agg{}
			per[rec.Cmd] = a
		}
		a.n++
		if rec.Exit != 0 {
			a.fails++
		}
		if rec.Ms > 2000 {
			a.slow++
		}
		channels[rec.Channel]++
	}
	fmt.Printf("total calls: %d\n", total)
	cmds := make([]string, 0, len(per))
	for c := range per {
		cmds = append(cmds, c)
	}
	sort.Slice(cmds, func(i, j int) bool {
		if per[cmds[i]].n != per[cmds[j]].n {
			return per[cmds[i]].n > per[cmds[j]].n
		}
		return cmds[i] < cmds[j]
	})
	fmt.Println("by command:")
	for _, c := range cmds {
		a := per[c]
		fmt.Printf("  %-18s n=%-5d fails=%-4d slow(>2s)=%d\n", c, a.n, a.fails, a.slow)
	}
	fmt.Println("channel mix:")
	chs := make([]string, 0, len(channels))
	for c := range channels {
		chs = append(chs, c)
	}
	sort.Strings(chs)
	for _, c := range chs {
		fmt.Printf("  %s: %d\n", c, channels[c])
	}
	os.Remove(path)
	callLogged = true // the summary call never re-seeds the log it just deleted
	fmt.Println("log deleted (retention is retro-bound, adr-call-log)")
}

// enddesign
