package main

// ask_ops.go — the ask loop's surface (i0015_mobile_adapter b4+b8): the store, the ledger
// application, and the ops `quack pair | ask | await`, plus the drain-on-every-run
// fallback. `await` is the residency answer: a bounded foreground command the driving
// agent runs in the background at a hand-off, so a phone bless RESUMES the walk.

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"time"
)

// asks live in the DATA HOME (runtime state, never the ledger/truth)
func askStorePath() string { return filepath.Join(dataDirFor("asks"), "asks.json") }

func loadAskStore() *AskStore {
	s := &AskStore{}
	raw, err := os.ReadFile(askStorePath())
	if err == nil {
		json.Unmarshal(raw, s)
	}
	return s
}

func saveAskStore(s *AskStore) error {
	raw, err := json.MarshalIndent(s, "", "  ")
	if err != nil {
		return err
	}
	if err := os.MkdirAll(filepath.Dir(askStorePath()), 0o755); err != nil {
		return err
	}
	return os.WriteFile(askStorePath(), raw, 0o644)
}

// design: go-first-wins-lanes  implements: req-first-wins-lanes
// Mobile is the DEFAULT lane when paired: the pager shows at the desk AND the ask rides
// the channel; the FIRST answer from any lane wins. A console bless resolves the pending
// mobile asks for the same checks (blessResolvesAsks, hooked into cmdBless), and the
// later tap is idempotently ignored by askApplyAnswer's first-wins resolution.
func askResolveForCheck(s *AskStore, check, lane string) int {
	n := 0
	for i := range s.Asks {
		a := &s.Asks[i]
		if a.State == "pending" && a.Check == check {
			a.State = "resolved"
			a.Answer = lane
			n++
		}
	}
	return n
}

// blessResolvesAsks is cmdBless's hook: a console bless supersedes the pending mobile
// asks for the same checks, so mobile-by-default never double-applies. The caller owns
// the pairing check and the console feedback (the rim side); this is the pure rule:
// resolve, persist, report the count.
func blessResolvesAsks(ids []string) int {
	s := loadAskStore()
	total := 0
	for _, id := range ids {
		total += askResolveForCheck(s, id, "console")
	}
	if total > 0 {
		saveAskStore(s)
	}
	return total
}

// enddesign

// applyBlessIntent records the mobile answer through the EXISTING bless path: one event,
// actor=user (the paired device IS the adjudicator), the channel noted on the record.
func applyBlessIntent(in *BlessIntent) error {
	if in == nil {
		return nil
	}
	group := in.Checks
	if len(group) == 0 {
		group = []string{in.Check}
	}
	if in.Verdict != "y" {
		fmt.Println("mobile answer:", strings.Join(group, " + "), "REJECTED from", in.Channel, "- the gate stays open")
		return nil
	}
	// a combined group blesses KILLERS FIRST, the gate last — one tap = the console
	// pager's merged y, every member recorded individually
	nodes := LoadAll()
	memo := map[string]string{}
	events := attestEvents()
	cur := attestLoad()
	ordered := append([]string{}, group...)
	sort.SliceStable(ordered, func(i, j int) bool {
		return !strings.HasSuffix(ordered[i], "-gate") && strings.HasSuffix(ordered[j], "-gate")
	})
	for _, check := range ordered {
		n, ok := nodes[check]
		if !ok || !isGate(n) || n.Class == "executed" {
			return fmt.Errorf("ask apply: %s is not a blessable gate", check)
		}
		var prev *string
		if s, ok := cur[check]; ok {
			h := s.Hash
			prev = &h
		}
		deps := map[string]string{}
		for _, d := range parents(n) {
			if _, ok := nodes[d]; ok {
				deps[d] = fullHash(d, nodes, memo)
			}
		}
		events = append(events, Event{Check: check, Action: "bless", Actor: "user", FilledBy: "agent",
			Channel: in.Channel, TS: time.Now().Format(time.RFC3339),
			Hash: fullHash(check, nodes, memo), StatementHash: stmtHash(n), Deps: deps, PrevHash: prev})
		fmt.Println("mobile bless recorded:", check, "(actor user, via "+in.Channel+")")
	}
	saveEvents(events)
	for _, check := range group {
		if n, ok := nodes[check]; ok && (n.Killer || n.Milestone > 0) {
			RenderReport("")
			break
		}
	}
	return nil
}

func pairedAdapters() []AskAdapter {
	cfg, ok := loadPairConfig()
	if !ok {
		return nil
	}
	return []AskAdapter{askAdapterFor(cfg)}
}

// cmdAsk sends a check's question to the paired device: `quack ask <check-id> [--timeout s]`.
func cmdAsk(args []string) {
	if len(args) == 0 {
		fmt.Println("usage: ask <check-id> [--timeout <seconds>]")
		return
	}
	adapters := pairedAdapters()
	if len(adapters) == 0 {
		fmt.Println("no paired channel - run `quack pair ntfy` first")
		quackExit(2)
		return
	}
	nodes := LoadAll()
	id := args[0]
	n, ok := nodes[id]
	if !ok || !isGate(n) {
		fmt.Println("ask: not a gate check:", id)
		quackExit(2)
		return
	}
	timeout := int64(6 * 3600)
	if v := flagVal(args, "--timeout"); v != "" {
		if t, err := strconv.ParseInt(v, 10, 64); err == nil && t > 0 {
			timeout = t
		}
	}
	kind := "decision"
	if n.Killer || n.Milestone > 0 {
		kind = "gate"
	}
	// the phone gets the FULL one-pager (owner 2026-07-09): the same lines the console
	// pager boxes — bar, decisions, risks, readiness — minus the mobile hint, capped
	// under ntfy's 4KB message ceiling
	sm := StatusMap(nodes)
	var body []string
	for _, ln := range pagerLines(id, iterOf(n.Path), nodes, sm, readProjectConfig()) {
		if strings.HasPrefix(ln, "📱 MOBILE") {
			continue
		}
		body = append(body, ln)
	}
	question := strings.Join(body, "\n")
	if len(question) > 3300 {
		question = question[:3300] + "\n…"
	}
	// asking a GATE asks the whole COMBINED group (owner ruling: never two cards about
	// the same thing) - the ripened killers travel WITH it, one tap blesses all
	group := []string{id}
	if ks, g := pagerGroup(id, nodes, sm); g == id && len(ks) > 0 {
		group = append(append([]string{}, ks...), g)
	}
	s := loadAskStore()
	// supersede any pending twin covering a group member before sending the new card
	for _, c := range group {
		askResolveForCheck(s, c, "superseded")
	}
	cid := "ask-" + mintTopicSuffix()[:12]
	s.Asks = append(s.Asks, Ask{
		ID: cid, CID: cid, Kind: kind, Check: id, Checks: group,
		Question: question,
		Options:  []AskOption{{ID: "y", Label: "bless"}, {ID: "n", Label: "reject"}},
		Created:  time.Now().Unix(), Timeout: timeout, State: "pending",
	})
	if _, err := askDispatch(s, adapters); err != nil {
		fmt.Println("ask send failed:", err)
		quackExit(1)
		return
	}
	saveAskStore(s)
	fmt.Println("ask sent:", cid, "->", id, "( answer from the phone, or `quack await` to block )")
}

// askDrainMaybe applies any answers already sitting on the channel — the fallback lane:
// EVERY engine run drains, so a tap never waits longer than the next command. It executes
// the USER's recorded tap (authorized by possession of the paired credential), so it does
// not ride the agent-session key.
func askDrainMaybe() {
	cfg, ok := loadPairConfig()
	if !ok {
		return
	}
	s := loadAskStore()
	pending := false
	for _, a := range s.Asks {
		if a.State == "pending" {
			pending = true
			break
		}
	}
	if !pending {
		return
	}
	now := time.Now().Unix()
	for _, a := range askExpire(s, now) {
		fmt.Println("ask expired:", a.CID, "->", a.Check)
	}
	ad := askAdapterFor(cfg)
	answers, _, err := ad.PollAnswers("all")
	if err != nil {
		saveAskStore(s)
		return // the relay being unreachable never blocks a command
	}
	sort.Slice(answers, func(i, j int) bool { return answers[i].At < answers[j].At })
	for _, ans := range answers {
		if intent, applied := askApplyAnswer(s, ans, ad.ChannelName(), now); applied {
			if err := applyBlessIntent(intent); err != nil {
				fmt.Println("ask apply:", err)
			}
		}
	}
	saveAskStore(s)
}

// cmdAwait blocks until a pending ask resolves or the deadline passes:
// `quack await [--timeout <seconds>]`. ntfy awaits over a HELD-OPEN streaming GET — no
// polling interval, the tap arrives instantly; a dropped stream reconnects losslessly.
func cmdAwait(args []string) {
	cfg, ok := loadPairConfig()
	if !ok {
		fmt.Println("no paired channel - run `quack pair ntfy` first")
		quackExit(2)
		return
	}
	deadline := int64(3600)
	if v := flagVal(args, "--timeout"); v != "" {
		if t, err := strconv.ParseInt(v, 10, 64); err == nil && t > 0 {
			deadline = t
		}
	}
	s := loadAskStore()
	pending := 0
	for _, a := range s.Asks {
		if a.State == "pending" {
			pending++
		}
	}
	if pending == 0 {
		fmt.Println("await: nothing pending")
		return
	}
	fmt.Println("await:", pending, "pending ask(s), streaming", cfg.Base+"/"+cfg.Answer, "( deadline", deadline, "s )")
	end := time.Now().Unix() + deadline
	ad := askAdapterFor(cfg)
	for time.Now().Unix() < end {
		applied := awaitStreamOnce(ad, s, end)
		if applied {
			saveAskStore(s)
			return
		}
		for _, a := range askExpire(s, time.Now().Unix()) {
			fmt.Println("ask expired:", a.CID, "->", a.Check)
		}
		stillPending := false
		for _, a := range s.Asks {
			if a.State == "pending" {
				stillPending = true
			}
		}
		if !stillPending {
			saveAskStore(s)
			return
		}
		time.Sleep(2 * time.Second) // reconnect pause after a dropped stream
	}
	saveAskStore(s)
	fmt.Println("await: deadline passed - pending answers drain on the next run")
	quackExit(2)
}

// awaitStreamOnce holds one streaming connection open and applies the first resolving
// answer; returns true when something applied. The wire lives behind the AskStreamer
// seam; an adapter without the streaming lane defers to the drain fallback.
func awaitStreamOnce(ad AskAdapter, s *AskStore, end int64) bool {
	st, ok := ad.(AskStreamer)
	if !ok {
		return false
	}
	return st.StreamAnswers(end, func(ans AskAnswer) bool {
		intent, applied := askApplyAnswer(s, ans, ad.ChannelName(), time.Now().Unix())
		if !applied {
			return false
		}
		if err := applyBlessIntent(intent); err != nil {
			fmt.Println("ask apply:", err)
		}
		return true
	})
}
