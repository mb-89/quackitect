package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// The i22 engine-laws battery: each test binds its requirement's statements through the
// pure cores in i22_laws.go, hermetic where a store is touched (the verdict seam).

// selftestGuardSelftestGate verifies req-selftest-gate.1/.2: the full agent-channel battery is
// refused without a gate in hand, the refusal names the lawful lanes, and every other shape passes.
func selftestGuardSelftestGate() bool {
	msg := walkGuardDecision("selftest", true, false, false, "", false)
	if msg == "" || !strings.Contains(msg, "verify") || !strings.Contains(msg, "gate") {
		return false // refused, naming the lanes
	}
	if walkGuardDecision("selftest", true, false, true, "", false) != "" {
		return false // gate in hand -> the battery is lawful
	}
	if walkGuardDecision("selftest", false, false, false, "", false) != "" {
		return false // a single-test run passes the guard
	}
	if walkGuardDecision("selftest", true, true, false, "", false) != "" {
		return false // the console never takes the refusal
	}
	// sub-op awareness (i24 b5): scaffold sub-ops are creation, never ledger advancement
	if ledgerCmdClass("start", []string{"stubs"}) || ledgerCmdClass("start", []string{"init", "x"}) {
		return false
	}
	if !ledgerCmdClass("start", []string{"i0025_x"}) || !ledgerCmdClass("bless", nil) {
		return false
	}
	if ledgerCmdClass("status", nil) {
		return false
	}
	// the refusal names the revive path (i24 b5, the dead-server lockout)
	if m := walkGuardDecision("bless", false, false, false, "mcp", true); !strings.Contains(m, "reconnect") {
		return false
	}
	// grant's refusal points at the owner's console, never a nonexistent tool (i24 b17)
	if m := walkGuardDecision("grant", false, false, false, "mcp", true); !strings.Contains(m, "console") || strings.Contains(m, "MCP tool") {
		return false
	}
	return true
}

// selftestCLISteer verifies req-cli-steer: with the lane declared, a piped ledger command is
// refused with an MCP pointer; read-only commands, the console, and an undeclared lane pass.
func selftestCLISteer() bool {
	msg := walkGuardDecision("bless", false, false, false, "mcp", true)
	if msg == "" || !strings.Contains(msg, "MCP") {
		return false
	}
	if walkGuardDecision("bless", false, false, false, "", true) != "" {
		return false // lane undeclared -> pass as today
	}
	if walkGuardDecision("status", false, false, false, "mcp", false) != "" {
		return false // read-only stays open
	}
	if walkGuardDecision("bless", false, true, false, "mcp", true) != "" {
		return false // the console stays open
	}
	return true
}

// selftestMCPSurface verifies req-mcp-discoverable: the generated tool surface carries the walk
// commands, and the workspace carries the wiring (.mcp.json; the committed harness approval
// where a .claude/settings.json exists).
func selftestMCPSurface() bool {
	names := map[string]bool{}
	for _, t := range mcpTools() {
		names[t.Name] = true
	}
	for _, must := range []string{"status", "next", "bless", "start", "query", "observe-red", "ship"} {
		if !names[must] {
			return false
		}
	}
	if _, err := os.Stat(filepath.Join(ROOT, ".mcp.json")); err != nil {
		return false
	}
	if raw, err := os.ReadFile(filepath.Join(ROOT, ".claude", "settings.json")); err == nil {
		if !strings.Contains(string(raw), "enabledMcpjsonServers") {
			return false // a settings file without the approval is the found drift
		}
	}
	return true
}

// selftestStandingGrant verifies req-standing-grant.1-4 and .3a over the pure grant core.
func selftestStandingGrant() bool {
	now := time.Now()
	open := Event{Check: "grant-1", Action: "grant-open", Scope: "i22-*", Expiry: now.Add(time.Hour).Format(time.RFC3339)}
	events := []Event{open}
	live := liveGrantsFrom(events, now)
	if len(live) != 1 || live[0].ID != "grant-1" {
		return false // .1: a recorded grant is live inside its expiry
	}
	if gid, refused := blessGrantCheck(true, "agent", live, "i22-m6-gate"); refused || gid != "grant-1" {
		return false // .2: an in-scope agent bless passes and stamps the grant id
	}
	if _, refused := blessGrantCheck(true, "agent", live, "i9-old-gate"); !refused {
		return false // .3: an uncovered agent bless on a killer is refused
	}
	if _, refused := blessGrantCheck(false, "agent", live, "i9-old-review"); refused {
		return false // .3: a non-killer agent bless stays lawful
	}
	if _, refused := blessGrantCheck(true, "user", nil, "any"); refused {
		return false // a user bless never meets the grant rule
	}
	if grantOpenAllowed(false, "") || !grantOpenAllowed(true, "") || !grantOpenAllowed(false, "user") {
		return false // .3a: agent-channel open refused; console or explicit --by user allowed
	}
	expired := Event{Check: "grant-2", Action: "grant-open", Scope: "all", Expiry: now.Add(-time.Hour).Format(time.RFC3339)}
	if len(liveGrantsFrom([]Event{expired}, now)) != 0 {
		return false // expiry ends the stretch
	}
	closed := append(events, Event{Check: "grant-1", Action: "grant-close"})
	if len(liveGrantsFrom(closed, now)) != 0 {
		return false // close ends the stretch
	}
	stamped := append(closed, Event{Check: "i22-m1-gate", Action: "bless", Actor: "agent", Grant: "grant-1"})
	col := grantCollection(stamped, "grant-1")
	if len(col) != 1 || col[0].Check != "i22-m1-gate" {
		return false // .4: the close presents exactly the covered blesses
	}
	return true
}

// selftestFirstGreenGuard verifies req-first-green-guard over the pure rule.
func selftestFirstGreenGuard() bool {
	n := Node{ID: "test-x", Type: "test", Path: filepath.Join("spec", "iterations", "i0099_v", "test-x.md")}
	ver := iterOf(n.Path)
	if ver == "" {
		return false
	}
	if !firstGreenWithheldPure(n, nil, ver, "test-x", true) {
		return false // first green, no red, no exemption -> withheld
	}
	red := []Event{{Check: "test-x", Action: "red-observed", Hash: "H"}}
	if firstGreenWithheldPure(n, red, ver, "test-x", true) {
		return false // a red record satisfies the ritual
	}
	ex := n
	ex.TestsRed = "exempt - built before the mechanism (adr-red-unobservable)"
	if firstGreenWithheldPure(ex, nil, ver, "test-x", true) {
		return false // an explicit exemption passes
	}
	if firstGreenWithheldPure(n, nil, "i0001_other", "test-x", true) {
		return false // historical iterations stay untouched
	}
	if firstGreenWithheldPure(n, nil, ver, "test-x", false) {
		return false // a red result is never withheld
	}
	return true
}

// selftestBusyNoRecord verifies req-busy-no-record on the REAL write path, both sides of the
// class: a run that CONSUMED a vacuous busy answer leaves no cache entry; a run whose NESTED
// probe consumed one (it got the real render) still records; a clean run records.
func selftestBusyNoRecord() bool {
	oldPath, oldMemo, oldLazy := verdictPathOverride, verdictsMemo, verdictLazyMode
	tmp := filepath.Join(os.TempDir(), fmt.Sprintf("i22-busy-verdicts-%d.json", os.Getpid()))
	verdictPathOverride, verdictsMemo, verdictLazyMode = tmp, nil, false
	probes := []namedTest{
		{"i22-busy-probe", func() bool { busyGuardTrip(); return true }},
		{"i22-nested-probe", func() bool {
			// the parent frame: its NESTED frame consumes the vacuous answer
			pass, tripped := runSelftestTracked("i22-busy-probe")
			return pass && tripped
		}},
	}
	selftestRegistry = append(selftestRegistry, probes...)
	defer func() {
		selftestRegistry = selftestRegistry[:len(selftestRegistry)-len(probes)]
		verdictPathOverride, verdictsMemo, verdictLazyMode = oldPath, oldMemo, oldLazy
		os.Remove(tmp)
	}()
	if !runSelftestCached("busy-probe-id", "i22-busy-probe", "h1") {
		return false // the run itself still answers
	}
	if _, hit := verdictLookup("busy-probe-id", "h1"); hit {
		return false // ... but nothing was recorded (its own consult was vacuous)
	}
	if !runSelftestCached("nested-probe-id", "i22-nested-probe", "h1") {
		return false
	}
	if _, hit := verdictLookup("nested-probe-id", "h1"); !hit {
		return false // the parent got a real answer - it records despite the nested trip
	}
	if !runSelftestCached("clean-probe-id", "deps", "h1") {
		return false
	}
	if _, hit := verdictLookup("clean-probe-id", "h1"); !hit {
		return false // a clean run records as before
	}
	return true
}

// selftestBatteryProgress verifies req-battery-progress: the numbered line, one per test.
func selftestBatteryProgress() bool {
	line := batteryProgressLine(3, 120, "x", "ok")
	return strings.HasPrefix(line, "[3/120] ") && strings.Contains(line, "selftest x") && strings.HasSuffix(line, "ok")
}

// selftestBatteryBatch verifies req-battery-batch: an unchanged root answers from the cache
// under the battery key; a moved root is a miss.
func selftestBatteryBatch() bool {
	oldPath, oldMemo := verdictPathOverride, verdictsMemo
	tmp := filepath.Join(os.TempDir(), fmt.Sprintf("i22-batch-verdicts-%d.json", os.Getpid()))
	verdictPathOverride, verdictsMemo = tmp, nil
	defer func() {
		verdictPathOverride, verdictsMemo = oldPath, oldMemo
		os.Remove(tmp)
	}()
	verdictRecord(batteryCacheKey("a"), "root1", true, 0)
	cached := batteryCachedNames([]string{"a", "b"}, "root1")
	if pass, hit := cached["a"]; !hit || !pass {
		return false // same root -> answered from the cache
	}
	if _, hit := cached["b"]; hit {
		return false // never recorded -> a miss
	}
	if len(batteryCachedNames([]string{"a"}, "root2")) != 0 {
		return false // a content move is a miss
	}
	return true
}

// selftestBatteryParallel verifies req-battery-parallel: two pool members provably overlap -
// the first waits for the second's start signal; a serial run would time out.
func selftestBatteryParallel() bool {
	started := make(chan struct{})
	release := make(chan struct{})
	a := namedTest{"i22-pool-a", func() bool {
		close(started)
		select {
		case <-release:
			return true
		case <-time.After(2 * time.Second):
			return false
		}
	}}
	b := namedTest{"i22-pool-b", func() bool {
		select {
		case <-started:
			close(release)
			return true
		case <-time.After(2 * time.Second):
			return false
		}
	}}
	out := batteryRunPool([]namedTest{a, b}, 2)
	return out["i22-pool-a"] && out["i22-pool-b"]
}

// selftestVoiceLint verifies req-voice-lint over the pure statement rule.
func selftestVoiceLint() bool {
	nodes := map[string]Node{
		"r1": {ID: "r1", Type: "requirement", Statement: "The engine shall refuse the run - the walk then continues alone."},
		"r2": {ID: "r2", Type: "requirement", Statement: "The engine shall refuse the run."},
		"g1": {ID: "g1", Type: "", Statement: "seeded task wording - stays out of scope - by design"},
	}
	f := voiceStatementFindings(nodes)
	if len(f) != 1 || !strings.HasPrefix(f[0], "r1:") {
		return false
	}
	long := strings.Repeat("word ", voiceSentenceBound+2) + "end."
	if voiceFlaw(long) == "" {
		return false // an overlong sentence flags
	}
	if voiceFlaw("Ids are i_NNNN - four digits.") != "" {
		return false // a short dash aside (under three words a side) stays legal
	}
	return true
}

var i22Tests = []namedTest{
	{"selftest-gate", selftestGuardSelftestGate},
	{"cli-steer", selftestCLISteer},
	{"mcp-surface", selftestMCPSurface},
	{"standing-grant", selftestStandingGrant},
	{"first-green-guard", selftestFirstGreenGuard},
	{"busy-no-record", selftestBusyNoRecord},
	{"battery-progress", selftestBatteryProgress},
	{"battery-batch", selftestBatteryBatch},
	{"battery-parallel", selftestBatteryParallel},
	{"voice-lint", selftestVoiceLint},
	{"recital-chain", selftestRecitalChain},
}
