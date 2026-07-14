package main

// ask_ops.go — the ask loop's surface: the store, the ledger
// application, and the ops `quack pair | ask | await`, plus the drain-on-every-run
// fallback. `await` is the residency answer: a bounded foreground command the driving
// agent runs in the background at a hand-off, so a phone bless RESUMES the walk.

import (
	"encoding/json"
	"fmt"
	"net"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"time"
)

// asks live in the DATA HOME (runtime state, never the ledger/truth)
var askStoreOverride string // test seam: the selftests point the store at a fixture dir

func askStorePath() string {
	if askStoreOverride != "" {
		return filepath.Join(askStoreOverride, "asks.json")
	}
	return filepath.Join(dataDirFor("asks"), "asks.json")
}

func loadAskStore() *AskStore {
	s := &AskStore{}
	raw, err := os.ReadFile(askStorePath())
	if err == nil {
		json.Unmarshal(raw, s)
	}
	return s
}

// design: go-ask-hardening  implements: req-ask-hardening
// Hardening the ask loop: every save MERGES with the on-disk store instead of
// clobbering a concurrent writer (union by ask id, the newest state-change stamp wins,
// swapped in atomically via temp+rename); `await` reloads the store from disk on every
// loop pass and exits cleanly when nothing pends anymore; an answer stamped BEFORE its
// ask's creation belongs to a previous ask generation and is refused at apply time.

// askStampOf is an ask's freshness for the merge: the last state-change stamp,
// falling back to the creation stamp for pre-hardening records.
func askStampOf(a Ask) int64 {
	if a.Updated > a.Created {
		return a.Updated
	}
	return a.Created
}

// mergeAskStores unions two stores by ask id. For the same id the newest stamp wins; on
// a tie a state-progressed copy (non-pending) beats a pending one, and the writer's copy
// (b) beats the disk's. Order: a's order first, b's new asks appended.
func mergeAskStores(a, b *AskStore) *AskStore {
	pick := map[string]Ask{}
	var order []string
	add := func(x Ask) {
		cur, seen := pick[x.ID]
		if !seen {
			pick[x.ID] = x
			order = append(order, x.ID)
			return
		}
		if askStampOf(x) > askStampOf(cur) {
			pick[x.ID] = x
			return
		}
		if askStampOf(x) == askStampOf(cur) && !(x.State == "pending" && cur.State != "pending") {
			pick[x.ID] = x // the tie: state progression first, then the writer, wins
		}
	}
	for _, x := range a.Asks {
		add(x)
	}
	for _, x := range b.Asks {
		add(x)
	}
	out := &AskStore{}
	for _, id := range order {
		out.Asks = append(out.Asks, pick[id])
	}
	return out
}

// saveAskStore is READ-MERGE-WRITE: load the current on-disk state, merge (an `ask`
// fired while an `await` or drain is mid-flight never clobbers it), and swap the file
// in atomically (temp + rename), so a reader never sees a torn write.
func saveAskStore(s *AskStore) error {
	merged := mergeAskStores(loadAskStore(), s)
	raw, err := json.MarshalIndent(merged, "", "  ")
	if err != nil {
		return err
	}
	if err := os.MkdirAll(filepath.Dir(askStorePath()), 0o755); err != nil {
		return err
	}
	tmp := askStorePath() + ".tmp"
	if err := os.WriteFile(tmp, raw, 0o644); err != nil {
		return err
	}
	return os.Rename(tmp, askStorePath())
}

// answerStale is THE apply-time comparison: an answer stamped strictly before its ask's
// creation is a leftover from a previous ask generation (a re-sent gate question) and
// must not apply. An unstamped answer (At==0 - the exec lane may omit the stamp) cannot
// be judged and passes through to the option validation.
func answerStale(askCreated, ansAt int64) bool {
	return ansAt > 0 && ansAt < askCreated
}

// awaitLoopReload is cmdAwait's per-pass reload: another process (an `ask`, a drain, a
// console bless) may have moved the store while the stream was open, so every loop pass
// starts from the disk state, never a stale in-memory copy.
func awaitLoopReload() *AskStore { return loadAskStore() }

// askStoreHasPending reports whether any ask still pends - await's clean-exit test.
func askStoreHasPending(s *AskStore) bool {
	for _, a := range s.Asks {
		if a.State == "pending" {
			return true
		}
	}
	return false
}

// askStoreMergeIDs (selftest probe): the ids left after a REAL mergeAskStores union -
// a thin wrapper over the merge the save path runs, never a parallel reimplementation.
func askStoreMergeIDs(a, b []string) []string {
	sa, sb := &AskStore{}, &AskStore{}
	for _, id := range a {
		sa.Asks = append(sa.Asks, Ask{ID: id})
	}
	for _, id := range b {
		sb.Asks = append(sb.Asks, Ask{ID: id})
	}
	var out []string
	for _, x := range mergeAskStores(sa, sb).Asks {
		out = append(out, x.ID)
	}
	return out
}

// answerStaleRefused (selftest probe): the REAL apply-time comparison (answerStale, the
// one askApplyAnswer calls) over RFC3339 stamps.
func answerStaleRefused(askStamp, ansStamp string) bool {
	at, err1 := time.Parse(time.RFC3339, askStamp)
	an, err2 := time.Parse(time.RFC3339, ansStamp)
	if err1 != nil || err2 != nil {
		return false
	}
	return answerStale(at.Unix(), an.Unix())
}

// awaitReloadsPerLoop (selftest probe): BEHAVIORAL - point the store at a fixture dir,
// move the file on disk between two awaitLoopReload calls (the exact function cmdAwait's
// loop runs each pass), and observe the second call pick the disk change up.
func awaitReloadsPerLoop() bool {
	dir, err := os.MkdirTemp("", "q17await")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	old := askStoreOverride
	askStoreOverride = dir
	defer func() { askStoreOverride = old }()
	if saveAskStore(&AskStore{Asks: []Ask{{ID: "ask-r1", CID: "ask-r1", State: "pending", Created: 1000}}}) != nil {
		return false
	}
	s1 := awaitLoopReload()
	if len(s1.Asks) != 1 || !askStoreHasPending(s1) {
		return false
	}
	// another process answers the first ask and adds a second one between the passes
	if saveAskStore(&AskStore{Asks: []Ask{
		{ID: "ask-r1", CID: "ask-r1", State: "resolved", Created: 1000, Updated: 2000},
		{ID: "ask-r2", CID: "ask-r2", State: "pending", Created: 1500},
	}}) != nil {
		return false
	}
	s2 := awaitLoopReload()
	if len(s2.Asks) != 2 {
		return false // the second pass re-read the disk (the merge kept both asks)
	}
	for _, a := range s2.Asks {
		if a.ID == "ask-r1" && a.State != "resolved" {
			return false // the newest stamp won the merge
		}
	}
	return askStoreHasPending(s2) // the flag cmdAwait's loop exits on when it turns false
}

// enddesign

// design: go-first-wins-lanes  implements: req-ask-loop.7
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
			a.Updated = time.Now().Unix() // the merge keeps the resolution over a concurrent pending copy
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
	// a y accepts everything the BRIEF states (adr-handoff-html): the open defaults
	// become the user's rulings before the gate records — ONE home for page, phone
	// and any future channel
	if _, ok := nodes[in.Check]; ok {
		fs, _ := handoffAccepts(in.Check, nodes, StatusMap(nodes))
		if len(fs) > 0 {
			ch := in.Channel
			if !strings.HasPrefix(ch, "handoff") {
				ch = "handoff " + ch
			}
			st := loadAskStore()
			for _, f := range fs {
				if err := registerAnswerApply(nodes, f.node, f.field, f.value, ch, st); err != nil {
					return fmt.Errorf("bless stopped at %s.%s: %v", f.node, f.field, err)
				}
			}
			saveAskStore(st)
			nodes = LoadAll() // the rulings moved hashes; the bless records the fresh ones
		}
	}
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
	// DEBOUNCED refresh (req-report-debounce): the same wave-collapse the console bless uses.
	for _, check := range group {
		if n, ok := nodes[check]; ok && (n.Killer || n.Milestone > 0) {
			if blessReportRefreshDue(time.Now()) {
				RenderReport("")
			}
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

// cmdAsk sends a check's question to the paired device:
// `quack ask <check-id> [--timeout s] [--context "<text>"]`.
func cmdAsk(args []string) {
	if len(args) == 0 {
		fmt.Println("usage: ask <check-id> [--timeout <seconds>] [--context <text>]")
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
	cid, err := askSendForGate(id, timeout, flagVal(args, "--context"))
	if err != nil {
		fmt.Println("ask send failed:", err)
		quackExit(1)
		return
	}
	fmt.Println("ask sent:", cid, "->", id, "( answer from the phone, or `quack await` to block )")
}

// askSendForGate composes and dispatches a gate's DECISION BRIEF to every paired
// channel — the same content the hand-off page shows, capped under ntfy's ceiling.
// The pager calls it too: a hand-off rides BOTH channels when a phone is paired
// (owner ruling). Returns the ask cid.
func askSendForGate(id string, timeout int64, context string) (string, error) {
	adapters := pairedAdapters()
	if len(adapters) == 0 {
		return "", fmt.Errorf("no paired channel")
	}
	nodes := LoadAll()
	n, ok := nodes[id]
	if !ok || !isGate(n) {
		return "", fmt.Errorf("not a gate check: %s", id)
	}
	kind := "decision"
	if n.Killer || n.Milestone > 0 {
		kind = "gate"
	}
	sm := StatusMap(nodes)
	card := handoffBriefText(id, nodes, sm)
	// the hand-off narrative rides BELOW the card, one text on both lanes;
	// the card always renders first
	question := askComposeBody(card, context)
	if len(question) > 3300 && context != "" {
		// the ntfy ceiling caps the COMPOSED body; the narrative yields first —
		// the card never truncates in favor of the context
		question = card
		room := 3300 - len(card) - len("\n\n") - len("\n…")
		if room > 0 {
			question = askComposeBody(card, context[:room]+"\n…")
		}
	}
	if len(question) > 3300 {
		question = question[:3300] + "\n…"
	}
	// asking a GATE asks the whole COMBINED group (never two cards about
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
		// no page link (owner ruling): it reaches only the same LAN — the brief itself is the card
	})
	if _, err := askDispatch(s, adapters); err != nil {
		return "", err
	}
	saveAskStore(s)
	return cid, nil
}

// handoffAsksClose ends a hand-off round's phone side: optionally drain a tap that
// already arrived (an unanswered page close honors it), then expire what still pends
// for the gate's group — a dead round leaves no answerable card behind (owner
// ruling: nothing keeps waiting or polling).
func handoffAsksClose(gate string, drain bool) {
	if drain {
		askDrainMaybe()
	}
	s := loadAskStore()
	nodes := LoadAll()
	group := []string{gate}
	if ks, g := pagerGroup(gate, nodes, StatusMap(nodes)); g == gate && len(ks) > 0 {
		group = append(append([]string{}, ks...), g)
	}
	n := 0
	for _, c := range group {
		n += askResolveForCheck(s, c, "expired")
	}
	if n > 0 {
		saveAskStore(s)
	}
}

// handoffPageURL names the LIVE hand-off page for the phone's view action: the watch
// server on this machine's LAN address. Best-effort — no server listening (or no LAN
// address) means no link; the notification's y/n buttons carry the answer regardless.
func handoffPageURL(gate string) string {
	c, err := net.DialTimeout("tcp", "localhost:8899", 300*time.Millisecond)
	if err != nil {
		return "" // no watch server: the ask travels without a view action
	}
	c.Close()
	host := "localhost"
	if addrs, err := net.InterfaceAddrs(); err == nil {
		for _, a := range addrs {
			if ip, ok := a.(*net.IPNet); ok && !ip.IP.IsLoopback() && ip.IP.To4() != nil {
				host = ip.IP.String()
				break
			}
		}
	}
	return "http://" + host + ":8899/handoff/" + gate
}

// askDrainMaybe applies any answers already sitting on the channel — the fallback lane:
// engine runs drain, so a tap never waits long. It executes the USER's recorded tap
// (authorized by possession of the paired credential), so it does not ride the
// agent-session key. THROTTLED: the poll is a live HTTP roundtrip that would
// tax EVERY command ~0.5s while an ask pends — it runs at most once per 20s
// (a timestamp file in the data home); `await` streams and cmdBless resolves directly,
// so the throttle only delays the pure-fallback lane by seconds.
func askDrainMaybe() {
	cfg, ok := loadPairConfig()
	if !ok {
		return
	}
	stampP := filepath.Join(dataDirFor("asks"), "last-drain")
	if fi, err := os.Stat(stampP); err == nil && time.Since(fi.ModTime()) < 20*time.Second {
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
	os.WriteFile(stampP, []byte(time.Now().Format(time.RFC3339)), 0o644) // arm the throttle
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
	// away-mode exit (req-await-console-exit): snapshot the call log; a line appended by
	// ANOTHER process while the loop runs means someone is at the console — end the await
	// and hand back to drain mode (go-ask-loop).
	callBaseline := callLogLineCount()
	for time.Now().Unix() < end {
		if awaitForeignCall(callBaseline) {
			fmt.Println(awaitHandbackMsg())
			return
		}
		// hardening: every pass starts from the DISK state - another process may have
		// asked, drained, or console-blessed while the stream was open (go-ask-hardening)
		s = awaitLoopReload()
		for _, a := range askExpire(s, time.Now().Unix()) {
			fmt.Println("ask expired:", a.CID, "->", a.Check)
		}
		if !askStoreHasPending(s) {
			saveAskStore(s)
			fmt.Println("await: nothing pending anymore - resolved elsewhere")
			return
		}
		applied := awaitStreamOnce(ad, s, end)
		saveAskStore(s)
		if applied {
			return
		}
		time.Sleep(2 * time.Second) // reconnect pause after a dropped stream
	}
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
