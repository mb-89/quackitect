package main

import (
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"time"
)

// design: go-grant-store  implements: req-standing-grant.1, req-standing-grant.2, req-standing-grant.3, req-standing-grant.4
// A standing grant is a ledger event pair (adr-grant-ledger-events): grant-open carries scope
// and expiry, grant-close ends the stretch. In-scope agent blesses stamp the grant id on their
// own bless event; an uncovered agent bless on a KILLER is refused toward the pager. Opening or
// closing a grant is the owner's act: the console channel, or an explicit --by user delegation
// on the agent channel (the same channel-actor doctrine as bless). Model contract:
// model-grant-lifecycle (live -> closed -> reviewed, no way back to live).

type grantInfo struct {
	ID     string
	Scope  string
	Expiry time.Time
}

// liveGrantsFrom folds the event log into the still-live grants at `now`.
func liveGrantsFrom(events []Event, now time.Time) []grantInfo {
	open := map[string]grantInfo{}
	var order []string
	for _, e := range events {
		switch e.Action {
		case "grant-open":
			exp, err := time.Parse(time.RFC3339, e.Expiry)
			if err != nil {
				continue
			}
			if _, seen := open[e.Check]; !seen {
				order = append(order, e.Check)
			}
			open[e.Check] = grantInfo{ID: e.Check, Scope: e.Scope, Expiry: exp}
		case "grant-close":
			delete(open, e.Check)
		}
	}
	var out []grantInfo
	for _, id := range order {
		if g, ok := open[id]; ok && g.Expiry.After(now) {
			out = append(out, g)
		}
	}
	return out
}

// grantScopeMatch: the scope is a space/comma list of id globs; "all" or "*" covers everything,
// a trailing '*' is a prefix match, anything else is exact.
func grantScopeMatch(scope, checkID string) bool {
	for _, pat := range strings.FieldsFunc(scope, func(r rune) bool { return r == ' ' || r == ',' }) {
		if pat == "all" || pat == "*" {
			return true
		}
		if strings.HasSuffix(pat, "*") {
			if strings.HasPrefix(checkID, strings.TrimSuffix(pat, "*")) {
				return true
			}
		} else if pat == checkID {
			return true
		}
	}
	return false
}

// grantCovering answers which live grant covers a check, if any.
func grantCovering(grants []grantInfo, checkID string) (string, bool) {
	for _, g := range grants {
		if grantScopeMatch(g.Scope, checkID) {
			return g.ID, true
		}
	}
	return "", false
}

// grantOpenAllowed: the owner's act — the console, or an explicit --by user delegation.
func grantOpenAllowed(interactive bool, by string) bool {
	return interactive || by == "user"
}

// blessGrantCheck decides one agent bless against the live grants: a covered check stamps the
// grant id; an uncovered KILLER is refused; an uncovered non-killer stays lawful (contract rule 3).
func blessGrantCheck(killer bool, actor string, grants []grantInfo, checkID string) (grantID string, refused bool) {
	if actor != "agent" {
		return "", false
	}
	if gid, ok := grantCovering(grants, checkID); ok {
		return gid, false
	}
	if killer {
		return "", true
	}
	return "", false
}

// grantCollection lists the bless events stamped with a grant id, in log order.
func grantCollection(events []Event, grantID string) []Event {
	var out []Event
	for _, e := range events {
		if e.Action == "bless" && e.Grant == grantID {
			out = append(out, e)
		}
	}
	return out
}

// cmdGrant is the console face: open --scope <globs> [--hours N] | close | review.
func cmdGrant(args []string) {
	if len(args) == 0 || helpRequested(args) {
		fmt.Println("usage: grant open --scope \"<globs>\" [--hours N] [--by user] | grant close | grant review")
		return
	}
	events := attestEvents()
	now := time.Now()
	switch args[0] {
	case "open":
		if !grantOpenAllowed(channelInteractive(), flagVal(args, "--by")) {
			fmt.Fprintln(os.Stderr, "refused: a grant is the owner's act - open it at the console, or record the owner's explicit delegation with --by user")
			quackExit(1)
		}
		scope := flagVal(args, "--scope")
		if scope == "" {
			fmt.Fprintln(os.Stderr, "grant open needs --scope \"<globs>\" (e.g. \"i22-*\" or \"all\")")
			quackExit(2)
		}
		hours := 12
		if h := flagVal(args, "--hours"); h != "" {
			fmt.Sscanf(h, "%d", &hours)
		}
		gid := "grant-" + now.Format("20060102-150405")
		events = append(events, Event{Check: gid, Action: "grant-open", Actor: "user",
			TS: now.Format(time.RFC3339), Scope: scope, Expiry: now.Add(time.Duration(hours) * time.Hour).Format(time.RFC3339)})
		saveEvents(events)
		fmt.Println("grant opened:", gid, "scope:", scope, "expires in", hours, "h - blesses under it are collected for the morning review")
	case "close":
		live := liveGrantsFrom(events, now)
		if len(live) == 0 {
			fmt.Println("no live grant to close")
			return
		}
		g := live[len(live)-1]
		events = append(events, Event{Check: g.ID, Action: "grant-close", Actor: resolveActor(args, channelInteractive()),
			TS: now.Format(time.RFC3339)})
		saveEvents(events)
		fmt.Println("grant closed:", g.ID)
		printGrantCollection(events, g.ID)
	case "review":
		grantReview(events)
	default:
		fmt.Println("usage: grant open --scope \"<globs>\" [--hours N] [--by user] | grant close | grant review")
	}
}

func latestGrantID(events []Event) string {
	gid := ""
	for _, e := range events {
		if e.Action == "grant-open" {
			gid = e.Check
		}
	}
	return gid
}

func printGrantCollection(events []Event, grantID string) {
	col := grantCollection(events, grantID)
	if len(col) == 0 {
		fmt.Println("collection of", grantID, "is empty")
		return
	}
	fmt.Printf("collection of %s - %d bless(es) awaiting the owner's confirmation:\n", grantID, len(col))
	for _, e := range col {
		fmt.Printf("  - %s (%v)\n", e.Check, e.TS)
	}
}

// enddesign

// design: go-grant-review  implements: req-standing-grant.5
// The morning-review surface: the most recent grant's collection, each bless named for the
// owner's confirmation. Reads only; confirming stays the owner's bless/board act.
func grantReview(events []Event) {
	gid := latestGrantID(events)
	if gid == "" {
		fmt.Println("no grant recorded yet")
		return
	}
	printGrantCollection(events, gid)
}

// enddesign

// design: go-guard-selftest  implements: req-selftest-gate.1, req-selftest-gate.2
// This is the dispatch guard layer (adr-guard-dispatch-layer): ONE pass before any handler. The full selftest battery on the agent channel is lawful only while a milestone gate of the active version is ready or suspect. The battery belongs to gates, the trust-the-process law, engine-enforced. Single-test runs and quack verify stay lawful everywhere.

// walkGuardDecision is the pure rule; "" means pass. It also carries the CLI lane block
// (go-guard-cli below) so the layer stays one tested predicate set.
func walkGuardDecision(cmd string, fullBattery, interactive, gateInHand bool, agentLane string, ledgerCmd bool) string {
	if interactive {
		return "" // the console never takes a new refusal (raid-over-blocking)
	}
	if agentLane == "mcp" && ledgerCmd {
		if cmd == "grant" {
			// go-arg-guards: grant is the OWNER's act - there is no grant tool by design
			return "refused: a grant is the owner's act - the owner runs it at their console (the agent lane serves no grant tool by design)"
		}
		return "refused: this workspace declares MCP as the agent lane (agent_lane in spec/project.toml) - call the '" + cmd + "' MCP tool instead; the console is unaffected. A dead MCP server revives on the harness's reconnect; the supervisor keeps it current from then on"
	}
	if cmd == "selftest" && fullBattery && !gateInHand {
		return "refused: the full battery belongs to a milestone review, and no milestone gate is ready or suspect - re-run one check with `verify <id>` or `selftest <name>`; the battery runs at the gate"
	}
	return ""
}

// ledgerCmdClass refines the attest-gated set with sub-op awareness: the scaffold
// sub-ops of start (stubs, init) are ungated CREATION, never ledger advancement.
func ledgerCmdClass(cmd string, rest []string) bool {
	if !attestGatedCmds[cmd] {
		return false
	}
	if cmd == "start" && len(rest) > 0 && (rest[0] == "stubs" || rest[0] == "init") {
		return false
	}
	return true
}

// gateReviewInHand: a milestone gate of the active version is ready (deps satisfied) or suspect.
func gateReviewInHand(nodes map[string]Node, st map[string]string, version string) bool {
	for id, n := range nodes {
		if n.Milestone == 0 || !strings.HasSuffix(id, "-gate") || iterOf(n.Path) != version {
			continue
		}
		switch st[id] {
		case "SUSPECT":
			return true
		case "OPEN":
			ready := true
			for _, d := range n.DependsOn {
				if _, ok := nodes[d]; ok && !stateSatisfies(st[d]) {
					ready = false
					break
				}
			}
			if ready {
				return true
			}
		}
	}
	return false
}

// walkGuard applies the layer for one dispatch. The readiness pass runs LAZY so the guard
// itself never re-runs a test while deciding whether tests may run.
func walkGuard(cmd string, rest []string) {
	if channelInteractive() {
		return
	}
	cfg := readProjectConfig()
	ledger := ledgerCmdClass(cmd, rest)
	full := cmd == "selftest" && len(rest) == 0
	gateInHand := false
	if full && cfg.AgentLane != "mcp" {
		wasLazy := verdictLazyMode
		verdictLazyMode = true
		nodes := LoadAll()
		gateInHand = gateReviewInHand(nodes, StatusMap(nodes), cfg.Version)
		verdictLazyMode = wasLazy
	}
	if msg := walkGuardDecision(cmd, full, false, gateInHand, cfg.AgentLane, ledger); msg != "" {
		fmt.Fprintln(os.Stderr, msg)
		quackExit(4)
	}
}

// enddesign

// design: go-guard-cli  implements: req-cli-steer, req-mcp-discoverable
// This is the declared agent lane (adr-mcp-lane-declared, q-cli-steering ruling A). With `agent_lane = "mcp"` in spec/project.toml, a piped ledger command is refused with a pointer at the MCP tools; the rule itself lives in walkGuardDecision above. The MCP server dispatches its tool calls to the command functions directly, never through Dispatch, so the MCP lane cannot refuse itself. The engine's offer half of req-mcp-discoverable is `quack mcp` (go-mcp-server). The workspace half is the committed .mcp.json plus the harness approval key in .claude/settings.json. selftest:mcp-surface holds both halves.
// enddesign

// design: go-verdict-guard  implements: req-busy-no-record, req-first-green-guard
// The two trust guards wrap the ONE verdict-write path (adr-verdict-write-guard), inside runSelftestCached. A run that consulted a busy resource guard is discarded, never recorded; the i21 poisoned-cache class dies at the write. A first green on a CURRENT-iteration test node with no red record and no exemption is withheld and flagged, the red ritual, engine-enforced. Historical iterations are untouched.

// Busy trips are DEPTH-SCOPED: a vacuous busy answer poisons exactly the frame that consumed
// it. A render-triggering test whose NESTED probes tripped (they got the vacuous answer, it
// got the real render) still records - only the frame whose own consult was vacuous discards.
var (
	selftestFrameDepth int
	busyTripsAtDepth   = map[int]int{}
)

func busyGuardTrip() { busyTripsAtDepth[selftestFrameDepth]++ }

// runSelftestTracked runs one named test as its own frame and reports whether a busy consult
// happened AT THIS frame's depth (a vacuous answer this frame consumed).
func runSelftestTracked(name string) (pass, busyTripped bool) {
	selftestFrameDepth++
	depth := selftestFrameDepth
	before := busyTripsAtDepth[depth]
	pass = runSelftest(name)
	busyTripped = busyTripsAtDepth[depth] != before
	selftestFrameDepth--
	return pass, busyTripped
}

type verdictGuardContext struct {
	nodes   map[string]Node
	events  []Event
	version string
}

var firstGreenMemo *verdictGuardContext

func firstGreenCtx() *verdictGuardContext {
	if firstGreenMemo == nil {
		firstGreenMemo = &verdictGuardContext{nodes: LoadAll(), events: attestEvents(), version: readProjectConfig().Version}
	}
	return firstGreenMemo
}

// firstGreenWithheldPure is the rule: withhold a PASS on a current-iteration test node that has
// neither a red-observed event nor an explicit tests_red exemption.
func firstGreenWithheldPure(n Node, events []Event, version, id string, pass bool) bool {
	if !pass || n.Type != "test" || iterOf(n.Path) != version {
		return false
	}
	if strings.HasPrefix(strings.TrimSpace(n.TestsRed), "exempt") {
		return false
	}
	for _, e := range events {
		if e.Check == id && e.Action == "red-observed" {
			return false
		}
	}
	return true
}

func firstGreenWithheld(id string, pass bool) bool {
	if !pass || !strings.HasPrefix(id, "test-") {
		return false
	}
	c := firstGreenCtx()
	n, ok := c.nodes[id]
	if !ok {
		return false
	}
	return firstGreenWithheldPure(n, c.events, c.version, id, pass)
}

// enddesign

// design: go-battery-progress  implements: req-battery-progress
// One numbered line per test is printed by the battery loop. A watching console sees a real bar, not only the slow outliers.
func batteryProgressLine(i, total int, name, status string) string {
	return fmt.Sprintf("[%d/%d] selftest %-12s %s", i, total, name, status)
}

// enddesign

// design: go-battery-batch  implements: req-battery-batch
// The full battery consults the verdict cache under a battery-scoped key: input = the merkle
// root, so an unchanged workspace answers from the cache and any content move re-runs. The
// key prefix keeps battery entries apart from test-node entries.
func batteryCacheKey(name string) string { return "battery:" + name }

// batteryCachedNames partitions the battery: cached names answer from the map, the rest run.
func batteryCachedNames(names []string, root string) (cached map[string]bool) {
	cached = map[string]bool{}
	for _, n := range names {
		if pass, ok := verdictLookup(batteryCacheKey(n), root); ok {
			cached[n] = pass
		}
	}
	return cached
}

// enddesign

// design: go-battery-parallel  implements: req-battery-parallel
// A bounded worker pool runs over the SAFE set (adr-battery-run-shape). Tests known free of global seam mutation run concurrently. Everything else stays serial. Results flow back to the main goroutine, which owns every verdict write. This is one serialization point, with no second write path.

// batteryParallelSafe names the registry tests safe for concurrent runs: pure predicates and
// format checks that touch no global seam. Grown deliberately, never inferred.
var batteryParallelSafe = map[string]bool{
	"deps": true, "help": true, "tests-red": true, "lint-exit": true,
	"selftest-gate": true, "cli-steer": true, "standing-grant": true,
	"first-green-guard": true, "battery-progress": true, "voice-lint": true,
	"recital-chain": true, "mcp-surface": true,
}

// batteryRunPool runs the given tests on min(workers, len) goroutines and returns name->pass.
func batteryRunPool(tests []namedTest, workers int) map[string]bool {
	if workers < 1 {
		workers = 1
	}
	if workers > len(tests) {
		workers = len(tests)
	}
	jobs := make(chan namedTest)
	var mu sync.Mutex
	out := map[string]bool{}
	var wg sync.WaitGroup
	for w := 0; w < workers; w++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for t := range jobs {
				pass := t.fn()
				mu.Lock()
				out[t.name] = pass
				mu.Unlock()
			}
		}()
	}
	for _, t := range tests {
		jobs <- t
	}
	close(jobs)
	wg.Wait()
	return out
}

// enddesign

// design: go-voice-lint  implements: req-voice-lint
// The statement lint, ADVISORY like the terms lane: an authored statement that joins clauses
// with a spaced dash, or runs a sentence past the length bound, draws a flag. Authored = a
// typed trace node; task/gate prefills stay out of scope.

const voiceSentenceBound = 30 // words per sentence; voice.md aims at fifteen, the lint flags at double

func voiceStatementFindings(nodes map[string]Node) []string {
	var out []string
	ids := make([]string, 0, len(nodes))
	for id := range nodes {
		ids = append(ids, id)
	}
	sort.Strings(ids)
	for _, id := range ids {
		n := nodes[id]
		if n.Type == "" || strings.TrimSpace(n.Statement) == "" {
			continue
		}
		if f := voiceFlaw(n.Statement); f != "" {
			out = append(out, id+": "+f)
		}
	}
	return out
}

// voiceFlaw names the first voice violation in one statement, or "".
// Backtick spans are CODE, not prose (go-voice-gate): a quoted marker like
// `ears: exempt - <reason>` never counts as a dash-joined clause.
func voiceFlaw(s string) string {
	if strings.Count(s, "`") >= 2 {
		parts := strings.Split(s, "`")
		for i := 1; i < len(parts); i += 2 {
			parts[i] = "CODE"
		}
		s = strings.Join(parts, "`")
	}
	for _, dash := range []string{" - ", " — "} {
		for i := strings.Index(s, dash); i > 0; {
			before := strings.Fields(s[:i])
			after := strings.Fields(s[i+len(dash):])
			if len(before) >= 3 && len(after) >= 3 {
				return "dash-joined clauses (voice: one thought per sentence, end it)"
			}
			next := strings.Index(s[i+1:], dash)
			if next < 0 {
				break
			}
			i += 1 + next
		}
	}
	for _, sent := range strings.FieldsFunc(s, func(r rune) bool { return r == '.' || r == '!' || r == '?' }) {
		if len(strings.Fields(sent)) > voiceSentenceBound {
			return fmt.Sprintf("a sentence over %d words (voice: aim for fifteen)", voiceSentenceBound)
		}
	}
	return ""
}

// enddesign

// design: go-recital-chain  implements: req-recital-chain
// This is the wording-chain selftest. The engine's contract resource must carry the question-tool recital mechanism and the TL;DR-card ruling. A workspace AGENTS.md, the entry hub, where present, must still point its step at the recital-in-question mechanism. A missing hub is a vehicle without one. There is nothing to drift, and no vacuous pass on the contract half.
func selftestRecitalChain() bool {
	raw, err := os.ReadFile(filepath.Join(EngineDir(), "method", "prompts", "contract.md"))
	if err != nil {
		return false
	}
	s := string(raw)
	for _, must := range []string{"put the WHOLE recital inside the question", "TL;DR card", "PREVIEW"} {
		if !strings.Contains(s, must) {
			return false
		}
	}
	if hub, err := os.ReadFile(filepath.Join(ROOT, "AGENTS.md")); err == nil {
		h := string(hub)
		if !strings.Contains(h, "recital") || !strings.Contains(h, "question") {
			return false
		}
	}
	return true
}

// enddesign
