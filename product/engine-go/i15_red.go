package main

// i15_red.go — the i0015_mobile_adapter RED battery: tests first, they FAIL until the
// build. Each case carries its trace line: test-<id> -> selftest:i15-<name>. Hermetic:
// adapters run against net/http/httptest fakes; time is injected; nothing touches a
// real relay or the real pairing config.

import (
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
)

// captureStdout runs f with os.Stdout swapped to a pipe and returns what it printed.
func captureStdout(f func()) string {
	old := os.Stdout
	r, w, err := os.Pipe()
	if err != nil {
		return ""
	}
	os.Stdout = w
	done := make(chan string, 1)
	go func() {
		buf := make([]byte, 0, 4096)
		tmp := make([]byte, 1024)
		for {
			n, rerr := r.Read(tmp)
			if n > 0 {
				buf = append(buf, tmp[:n]...)
			}
			if rerr != nil {
				break
			}
		}
		done <- string(buf)
	}()
	f()
	w.Close()
	os.Stdout = old
	out := <-done
	r.Close()
	return out
}

func i15Ask(kind string) Ask {
	return Ask{
		ID: "ask-1", CID: "cid-001", Kind: kind, Check: "i15-demo-gate",
		Question: "Bless i15-demo-gate?",
		Options:  []AskOption{{ID: "y", Label: "bless"}, {ID: "n", Label: "reject"}},
		Created:  1000, Timeout: 3600, State: "pending",
	}
}

// test-ask-format -> selftest:i15-ask-format
func selftestI15AskFormat() bool {
	a := i15Ask("decision")
	a.Options = []AskOption{{ID: "1", Label: "one"}, {ID: "2", Label: "two"}, {ID: "3", Label: "three"}, {ID: "4", Label: "four"}}
	body := renderAskBody(a)
	for _, want := range []string{a.Question, "cid-001", "1", "one", "4", "four"} {
		if !strings.Contains(body, want) {
			return false // the body carries the question, the cid, and EVERY option (even past 3)
		}
	}
	return true
}

// test-ask-dispatch -> selftest:i15-ask-dispatch
func selftestI15AskDispatch() bool {
	s := &AskStore{Asks: []Ask{i15Ask("gate")}}
	d1, d2 := &dummyAdapter{name: "one"}, &dummyAdapter{name: "two"}
	n, err := askDispatch(s, []AskAdapter{d1, d2})
	if err != nil || n != 2 {
		return false // one pending ask, two paired channels: sent once per channel
	}
	if len(d1.sent) != 1 || len(d2.sent) != 1 {
		return false
	}
	n2, _ := askDispatch(s, []AskAdapter{d1, d2})
	return n2 == 0 && len(d1.sent) == 1 // re-dispatch sends nothing new
}

type dummyAdapter struct {
	name    string
	sent    []Ask
	answers []AskAnswer
}

func (d *dummyAdapter) ChannelName() string { return d.name }
func (d *dummyAdapter) SendAsk(a Ask) error {
	d.sent = append(d.sent, a)
	return nil
}
func (d *dummyAdapter) PollAnswers(since string) ([]AskAnswer, string, error) {
	return d.answers, "next", nil
}

// test-answer-apply -> selftest:i15-answer-apply
func selftestI15AnswerApply() bool {
	s := &AskStore{Asks: []Ask{i15Ask("gate")}}
	intent, applied := askApplyAnswer(s, AskAnswer{CID: "cid-001", Body: "y", At: 1100}, "ntfy", 1100)
	if !applied || s.Asks[0].State != "resolved" || s.Asks[0].Answer != "y" {
		return false
	}
	if intent == nil || intent.Check != "i15-demo-gate" || intent.Verdict != "y" {
		return false
	}
	// a COMBINED ask carries its whole group: one tap returns every member (owner
	// ruling 2026-07-09: never two cards, one answer adjudicates all), and a pending
	// twin covering a member is superseded
	grp := i15Ask("gate")
	grp.ID, grp.CID = "ask-3", "cid-003"
	grp.Checks = []string{"i15-demo-killer", "i15-demo-gate"}
	twin := i15Ask("gate")
	twin.ID, twin.CID = "ask-4", "cid-004"
	twin.Check = "i15-demo-killer"
	s2 := &AskStore{Asks: []Ask{grp, twin}}
	gi, ok := askApplyAnswer(s2, AskAnswer{CID: "cid-003", Body: "y", At: 1200}, "ntfy", 1200)
	if !ok || gi == nil || len(gi.Checks) != 2 || gi.Checks[0] != "i15-demo-killer" {
		return false
	}
	return s2.Asks[1].State == "resolved" && s2.Asks[1].Answer == "superseded"
}

// test-mobile-actor -> selftest:i15-mobile-actor
func selftestI15MobileActor() bool {
	s := &AskStore{Asks: []Ask{i15Ask("gate")}}
	intent, _ := askApplyAnswer(s, AskAnswer{CID: "cid-001", Body: "y", At: 1100}, "ntfy", 1100)
	if intent == nil {
		return false
	}
	return intent.By == "user" && intent.Channel == "ntfy" // the paired device IS the adjudicator
}

// test-answer-idempotent -> selftest:i15-answer-idempotent
func selftestI15AnswerIdempotent() bool {
	s := &AskStore{Asks: []Ask{i15Ask("gate")}}
	askApplyAnswer(s, AskAnswer{CID: "cid-001", Body: "y", At: 1100}, "ntfy", 1100)
	intent2, applied2 := askApplyAnswer(s, AskAnswer{CID: "cid-001", Body: "n", At: 1200}, "ntfy", 1200)
	if applied2 || intent2 != nil {
		return false // the late duplicate is ignored
	}
	return s.Asks[0].Answer == "y" // the first resolution stands
}

// test-ask-timeout -> selftest:i15-ask-timeout
func selftestI15AskTimeout() bool {
	s := &AskStore{Asks: []Ask{i15Ask("gate")}}
	if got := askExpire(s, 2000); len(got) != 0 {
		return false // not yet due
	}
	got := askExpire(s, 1000+3600+1)
	if len(got) != 1 || s.Asks[0].State != "expired" {
		return false
	}
	_, applied := askApplyAnswer(s, AskAnswer{CID: "cid-001", Body: "y", At: 9999}, "ntfy", 9999)
	return !applied // an answer after expiry is ignored
}

// test-multi-ask -> selftest:i15-multi-ask
func selftestI15MultiAsk() bool {
	a2 := i15Ask("decision")
	a2.ID, a2.CID, a2.Check = "ask-2", "cid-002", ""
	a2.Options = []AskOption{{ID: "1", Label: "one"}, {ID: "2", Label: "two"}} // the token must be a declared option (answer-validated guard)
	s := &AskStore{Asks: []Ask{i15Ask("gate"), a2}}
	_, applied := askApplyAnswer(s, AskAnswer{CID: "cid-002", Body: "2", At: 1100}, "ntfy", 1100)
	if !applied {
		return false
	}
	return s.Asks[0].State == "pending" && s.Asks[1].State == "resolved" // only its own ask resolves
}

// test-pairing -> selftest:i15-pairing
func selftestI15Pairing() bool {
	dir, err := os.MkdirTemp("", "q15pair")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	old := pairCfgOverride
	pairCfgOverride = filepath.Join(dir, "pairing.json")
	defer func() { pairCfgOverride = old }()
	out := captureStdout(func() { cmdPair([]string{"ntfy"}) })
	raw, rerr := os.ReadFile(pairCfgOverride)
	if rerr != nil {
		return false // one operation writes the config
	}
	cfg := string(raw)
	if !strings.Contains(cfg, "quack-ask-") || !strings.Contains(cfg, "quack-answer-") {
		return false // the minted topic pair
	}
	if len(strings.TrimSpace(cfg)) < 60 {
		return false // high-entropy, not guessable
	}
	low := strings.ToLower(out)
	return strings.Contains(low, "disclaimer") && strings.Contains(low, "lock")
}

// test-gate-distinct -> selftest:i15-gate-distinct
func selftestI15GateDistinct() bool {
	g := ntfyHeaders(i15Ask("gate"), "quack-answer-x")
	d := ntfyHeaders(i15Ask("decision"), "quack-answer-x")
	if g == nil || d == nil {
		return false
	}
	if g["X-Priority"] == d["X-Priority"] && g["X-Tags"] == d["X-Tags"] {
		return false // a gate ask must render distinct
	}
	acts := g["X-Actions"]
	return strings.Contains(acts, "quack-answer-x") && strings.Count(acts, "http") <= 3
}

// test-channel-seam -> selftest:i15-channel-seam
func selftestI15ChannelSeam() bool {
	// a dummy adapter behind the seam completes the round trip with NO loop changes
	s := &AskStore{Asks: []Ask{i15Ask("gate")}}
	d := &dummyAdapter{name: "dummy", answers: []AskAnswer{{CID: "cid-001", Body: "y", At: 1100}}}
	if n, err := askDispatch(s, []AskAdapter{d}); err != nil || n != 1 {
		return false
	}
	ans, _, err := d.PollAnswers("")
	if err != nil || len(ans) != 1 {
		return false
	}
	intent, applied := askApplyAnswer(s, ans[0], d.ChannelName(), 1100)
	return applied && intent != nil && intent.Channel == "dummy"
}

// test-ntfy-channel -> selftest:i15-ntfy-channel
func selftestI15NtfyChannel() bool {
	var gotPut, gotActions string
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "PUT" {
			gotPut = r.URL.Path
			gotActions = r.Header.Get("X-Actions")
			w.WriteHeader(200)
			return
		}
		// the poll: two answers, ordered, ntfy json-lines shape
		w.Write([]byte(`{"id":"a1","time":1100,"event":"message","topic":"t","message":"y cid-001"}` + "\n" +
			`{"id":"a2","time":1200,"event":"message","topic":"t","message":"n cid-001"}` + "\n"))
	}))
	defer srv.Close()
	ad := ntfyAdapterFor(srv.URL, "ask-t", "answer-t")
	if ad == nil {
		return false
	}
	if err := ad.SendAsk(i15Ask("gate")); err != nil {
		return false
	}
	if !strings.Contains(gotPut, "ask-t") || !strings.Contains(gotActions, "answer-t") {
		return false
	}
	ans, next, err := ad.PollAnswers("all")
	if err != nil || len(ans) != 2 || next == "" {
		return false
	}
	return ans[0].CID == "cid-001" && ans[0].Body == "y" && ans[1].Body == "n"
}

// test-first-wins-lanes -> selftest:first-wins-lanes
// Mobile is the DEFAULT lane when paired (owner 2026-07-09): the pager shows at the desk
// AND the ask rides the channel; the first answer from ANY lane wins and resolves the
// ask everywhere else — a later tap cannot double-apply.
func selftestI15FirstWinsLanes() bool {
	s := &AskStore{Asks: []Ask{i15Ask("gate")}}
	n := askResolveForCheck(s, "i15-demo-gate", "console")
	if n != 1 || s.Asks[0].State != "resolved" || s.Asks[0].Answer != "console" {
		return false
	}
	intent, applied := askApplyAnswer(s, AskAnswer{CID: "cid-001", Body: "y", At: 1100}, "ntfy", 1100)
	return !applied && intent == nil
}

// test-pair-qr -> selftest:pair-qr
// The pairing link renders as a hand-rolled QR (owner 2026-07-09: no typing topics; the
// topic is a CREDENTIAL, so no external encoder). Structural validity here; the real
// phone scan is the M7 demo.
func selftestI15PairQR() bool {
	m := qrMatrix("https://ntfy.sh/quack-ask-0123456789abcdef0123456789abcdef")
	if m == nil {
		return false
	}
	n := len(m)
	if n < 21 || (n-21)%4 != 0 || n > 41 {
		return false // a valid version 1..6 module count
	}
	for _, r := range m {
		if len(r) != n {
			return false
		}
	}
	finderAt := func(r0, c0 int) bool {
		for dr := 0; dr < 7; dr++ {
			for dc := 0; dc < 7; dc++ {
				edge := dr == 0 || dr == 6 || dc == 0 || dc == 6
				core := dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4
				if m[r0+dr][c0+dc] != (edge || core) {
					return false
				}
			}
		}
		return true
	}
	if !finderAt(0, 0) || !finderAt(0, n-7) || !finderAt(n-7, 0) {
		return false
	}
	for i := 8; i < n-8; i++ {
		if m[6][i] != (i%2 == 0) || m[i][6] != (i%2 == 0) {
			return false // the timing patterns alternate
		}
	}
	dir, err := os.MkdirTemp("", "q15qr")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	old := pairCfgOverride
	pairCfgOverride = filepath.Join(dir, "pairing.json")
	defer func() { pairCfgOverride = old }()
	out := captureStdout(func() { cmdPair([]string{"ntfy"}) })
	return strings.Contains(out, "█") && strings.Contains(out, "https://ntfy.sh/quack-ask-")
}

// test-defer-excludes-coverage -> selftest:defer-excludes-coverage
// The defer-mechanism class-guard (bugfix law, found live at i15 b8): a requirement a
// defer/veto decision scrap-addresses owes NOTHING to the coverage rules until its
// ready_when - no design, no test, no trace edge. Without the exclusion a deferral
// holes designs-realized forever.
func selftestDeferExcludesCoverage() bool {
	ip := filepath.Join(SPEC, "iterations", "i0001_syn", "x.md")
	nodes := map[string]Node{
		"need-x":    {ID: "need-x", Type: "need", Path: ip},
		"uc-x":      {ID: "uc-x", Type: "usecase", Path: ip, Refines: []string{"need-x"}},
		"req-live":  {ID: "req-live", Type: "requirement", Statement: "s", Path: ip, Refines: []string{"uc-x"}},
		"req-gone":  {ID: "req-gone", Type: "requirement", Statement: "s", Path: ip, Refines: []string{"uc-x"}},
		"des-live":  {ID: "des-live", Type: "design", Path: ip, RegionBody: "code", Implements: []string{"req-live"}},
		"test-live": {ID: "test-live", Type: "test", Path: ip, Verifies: []string{"req-live"}},
		"adr-defer": {ID: "adr-defer", Type: "adr", Path: ip, Addresses: []string{"req-gone", scrapSink}, ReadyWhen: "later"},
	}
	if !(coverageRuleUncached(nodes, "designs-realized", "") &&
		coverageRuleUncached(nodes, "req-has-test", "") &&
		coverageRuleUncached(nodes, "req-traced", "")) {
		return false
	}
	// the TEST side of the same law (i16): a test verifying ONLY deferred requirements
	// owes neither a red record nor a pass until ready_when
	nodes["test-gone"] = Node{ID: "test-gone", Type: "test", Class: "executed",
		Verify: "selftest:no-such-selftest", Path: ip, Verifies: []string{"req-gone"}}
	if !coverageRuleUncached(nodes, "tests-red", "i0001_syn") {
		return false // the deferred test owes no red; the scope is vacuously satisfied
	}
	// tests-pass needs a non-empty suite: one real passing test beside the deferred one
	nodes["test-pass-probe"] = Node{ID: "test-pass-probe", Type: "test", Class: "executed",
		Verify: "selftest:ids", Path: ip, Verifies: []string{"req-live"}}
	return coverageRuleUncached(nodes, "tests-pass", "i0001_syn")
}

// test-adapter-zero-dep -> selftest:i15-adapter-zero-dep
func selftestI15AdapterZeroDep() bool {
	raw, err := os.ReadFile(filepath.Join(EngineSrc(), "ask.go"))
	if err != nil {
		return false
	}
	for _, ln := range strings.Split(string(raw), "\n") {
		t := strings.TrimSpace(ln)
		if strings.HasPrefix(t, `"`) && strings.Contains(t, ".") && strings.Contains(t, "/") {
			return false // an import path with a domain = a third-party module
		}
	}
	// zero-dep of a REALIZED adapter, not of stubs: the constructor must build one
	return ntfyAdapterFor("http://x", "a", "b") != nil
}
