package main

// The i24 hygiene battery: each hook binds its requirement's statements through
// the seams in i24_hygiene.go. Hermetic throughout - fixtures, temp dirs, no
// live workspace mutation.

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// selftestQuery verifies req-query.1,.2,.4: a pinned expression over a fixture
// graph returns filtered rows with chosen fields; an unknown field refuses with
// the field list.
func selftestQuery() bool {
	g := queryGraph{
		nodes: map[string]Node{
			"req-a":  {ID: "req-a", Type: "requirement", Statement: "The system shall a."},
			"req-b":  {ID: "req-b", Type: "requirement", Statement: "The system shall b."},
			"test-a": {ID: "test-a", Type: "test", Statement: "a passes."},
		},
		states: map[string]string{"req-a": "CONTENT", "req-b": "CONTENT", "test-a": "CONTENT"},
		edges:  []ConnEdge{{Kind: "verifies", Src: "test-a", Dst: "req-a"}},
		notes:  []string{"NOTE-1 the query seed"},
	}
	rows, err := queryRun(`type == "requirement"`, g)
	if err != nil || len(rows) != 2 {
		return false
	}
	if rows[0]["id"] == "" || rows[0]["statement"] == "" {
		return false // rows carry chosen fields
	}
	rows, err = queryRun(`edge.kind == "verifies" && edge.dst == "req-a"`, g)
	if err != nil || len(rows) != 1 || rows[0]["src"] != "test-a" {
		return false // edges are queryable by endpoint
	}
	rows, err = queryRun(`note.contains("query seed")`, g)
	if err != nil || len(rows) != 1 {
		return false // notes are queryable by text
	}
	_, err = queryRun(`bogus == "x"`, g)
	if err == nil || !strings.Contains(err.Error(), "bogus") || !strings.Contains(err.Error(), "type") {
		return false // the refusal names the offender and the field list
	}
	return true
}

// selftestVoiceZero verifies req-voice-zero.1,.2: the live spec carries zero
// voice findings, and the armed lane fails on any finding.
func selftestVoiceZero() bool {
	if voiceFlaw("alpha beta gamma - delta epsilon zeta") == "" {
		return false // the detector still sees a seeded flaw
	}
	if voiceFlaw("the marker reads `ears: exempt - a reason citing its ADR` on the node") != "" {
		return false // a backtick span is code, never a dash-joined clause
	}
	live := voiceStatementFindings(LoadAll())
	if len(live) != 0 {
		return false // the debt is drained
	}
	if voiceLaneVerdict(1) != true {
		return false // armed: one finding fails lint
	}
	if voiceLaneVerdict(0) != false {
		return false // clean stays green
	}
	return true
}

// selftestRootContent verifies req-root-content.1,.2: pooled query files and
// reference notes appear in the identity root's input set.
func selftestRootContent() bool {
	dir, err := os.MkdirTemp("", "i24root")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	os.MkdirAll(filepath.Join(dir, "queries"), 0o755)
	os.MkdirAll(filepath.Join(dir, "references"), 0o755)
	os.WriteFile(filepath.Join(dir, "queries", "a.base"), []byte("filter: x"), 0o644)
	os.WriteFile(filepath.Join(dir, "references", "r.md"), []byte("ref"), 0o644)
	files := rootContentFiles(dir)
	var base, ref bool
	for _, f := range files {
		if strings.HasSuffix(f, "a.base") {
			base = true
		}
		if strings.HasSuffix(f, "r.md") {
			ref = true
		}
	}
	return base && ref
}

// selftestRedEditGuard verifies req-red-edit-guard.1,.2: an apply edit touching
// a red-observed test's statement is refused, and the refusal names --refresh.
func selftestRedEditGuard() bool {
	edits := []manifestEdit{{
		File: "spec/iterations/i9/test-x.md",
		Old:  "statement: the old claim.",
		New:  "statement: the new claim.",
	}}
	verdict := applyRedGuardVerdict(edits,
		map[string]bool{"test-x": true},
		map[string]string{"spec/iterations/i9/test-x.md": "test-x"})
	if verdict == "" || !strings.Contains(verdict, "--refresh") {
		return false // the strand is refused with the sanctioned path
	}
	body := []manifestEdit{{
		File: "spec/iterations/i9/test-x.md",
		Old:  "an evidence line",
		New:  "a better evidence line",
	}}
	if applyRedGuardVerdict(body, map[string]bool{"test-x": true},
		map[string]string{"spec/iterations/i9/test-x.md": "test-x"}) != "" {
		return false // a body edit passes - only the statement strands the red
	}
	return true
}

// selftestMcpBirth verifies req-mcp-birth.1,.2: the scaffold writes an
// explicit-path .mcp.json and arms agent_lane in project.toml.
func selftestMcpBirth() bool {
	dir, err := os.MkdirTemp("", "i24birth")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	os.MkdirAll(filepath.Join(dir, "spec"), 0o755)
	os.WriteFile(filepath.Join(dir, "spec", "project.toml"),
		[]byte("[iteration]\ntype = \"default\"\n"), 0o644)
	if scaffoldMCPFiles(dir) != nil {
		return false
	}
	mcp, err := os.ReadFile(filepath.Join(dir, ".mcp.json"))
	if err != nil || !strings.Contains(string(mcp), `.\\quack.cmd`) {
		return false // explicit path, never a bare name
	}
	toml, _ := os.ReadFile(filepath.Join(dir, "spec", "project.toml"))
	return strings.Contains(string(toml), `agent_lane = "mcp"`)
}

// selftestMcpSelfArm verifies req-mcp-self-arm.1,.2: the first attested MCP
// session arms the lane once, and path casing is one identity.
func selftestMcpSelfArm() bool {
	if pathIdentityKey(`C:/Users/X/proj`) != pathIdentityKey(`c:/users/x/PROJ`) {
		return false // casing is one identity
	}
	dir, err := os.MkdirTemp("", "i24arm")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	toml := filepath.Join(dir, "project.toml")
	os.WriteFile(toml, []byte("[iteration]\ntype = \"default\"\n"), 0o644)
	armed, err := selfArmOnAttest(toml)
	if err != nil || !armed {
		return false // the first attested session arms
	}
	raw, _ := os.ReadFile(toml)
	if !strings.Contains(string(raw), `agent_lane = "mcp"`) {
		return false
	}
	armed, err = selfArmOnAttest(toml)
	return err == nil && !armed // arming is once - a second attest is a no-op
}

// selftestEmptyRegionMessage verifies req-empty-region-message: the delta
// message names the region and the fix.
func selftestEmptyRegionMessage() bool {
	msg := emptyRegionDelta("go-foo")
	return strings.Contains(msg, "go-foo") && strings.Contains(msg, "empty") &&
		strings.Contains(msg, "enddesign")
}

// selftestCardEmptyRegister verifies req-register-render.2 (the i22 card
// defect's class): the selection line is never a bare field dump; without
// options it names the authoring defect.
func selftestCardEmptyRegister() bool {
	line := cardSelectLine("", []string{"decided_via = "}, false)
	if line == "" || strings.Contains(line, "decided_via = ") {
		return false // the bare dump is dead
	}
	if !strings.Contains(strings.ToLower(line), "option") {
		return false // the fallback names the missing options
	}
	if got := cardSelectLine("A", nil, true); !strings.Contains(got, "A)") {
		return false // a lettered proposal renders as the letter
	}
	return true
}

// selftestMcpReload verifies req-mcp-reload.1,.2,.3: swap waits for open
// replies, the order holds (drain, spawn, notify), the frame is well-formed.
func selftestMcpReload() bool {
	if supSwapReady(1, true) {
		return false // an open reply blocks the swap
	}
	if !supSwapReady(0, true) {
		return false // idle and wanted swaps
	}
	if supSwapReady(0, false) {
		return false // no stamp move, no swap
	}
	frame := supNotifyFrame()
	if !strings.Contains(frame, `"notifications/tools/list_changed"`) ||
		!strings.Contains(frame, `"jsonrpc":"2.0"`) {
		return false
	}
	var seq supSequence
	seq.record("drain")
	seq.record("spawn")
	seq.record("notify")
	if !seq.orderHeld() {
		return false
	}
	var bad supSequence
	bad.record("notify")
	bad.record("drain")
	bad.record("spawn")
	if bad.orderHeld() {
		return false
	}
	// the served-refusal rule (adr-mcp-supervisor): under a serving session an exit
	// is captured as an error result; the transport survives.
	wasServing := mcpServing
	mcpServing = true
	out, code := mcpCaptureExit(func() {
		fmt.Fprintln(os.Stderr, "refused: probe")
		quackExit(4)
	})
	mcpServing = wasServing
	return code == 4 && strings.Contains(out, "refused: probe")
}

var i24Tests = []namedTest{
	{"query", selftestQuery},
	{"voice-zero", selftestVoiceZero},
	{"root-content", selftestRootContent},
	{"red-edit-guard", selftestRedEditGuard},
	{"mcp-birth", selftestMcpBirth},
	{"mcp-self-arm", selftestMcpSelfArm},
	{"empty-region-message", selftestEmptyRegionMessage},
	{"card-empty-register", selftestCardEmptyRegister},
	{"mcp-reload", selftestMcpReload},
	{"ledger-arg-guards", selftestLedgerArgGuards},
	{"adopt-honest", selftestAdoptHonest},
	{"binary-budget", selftestBinaryBudget},
}

// selftestLedgerArgGuards verifies req-ledger-arg-guards.1,.2,.3.
func selftestLedgerArgGuards() bool {
	ids := []string{"i24-b15-arg-guards", "i24-m6-gate"}
	v := blessUnknownVerdict("i24-b15-arg-guard", ids)
	if v == "" || !strings.Contains(v, "i24-b15-arg-guards") {
		return false // unknown id refused, the near match named
	}
	if blessUnknownVerdict("i24-m6-gate", ids) != "" {
		return false // a known id passes
	}
	if v := startGuardVerdict("i9999_bogus", "i0024_hygiene", false, false); v == "" || !strings.Contains(v, "--plan") {
		return false // a never-registered id refuses toward --plan
	}
	if v := startGuardVerdict("i0024_hygiene", "i0024_hygiene", true, false); v == "" || !strings.Contains(v, "active") {
		return false // re-starting the active version refuses as a no-op
	}
	if startGuardVerdict("i0025_next", "i0024_hygiene", true, false) != "" {
		return false // activating a registered, inactive version passes
	}
	if startGuardVerdict("i0025_next", "i0024_hygiene", false, true) != "" {
		return false // --plan is the creation lane and always passes
	}
	return true
}

// selftestAdoptHonest verifies req-adopt-honest.1,.2.
func selftestAdoptHonest() bool {
	park := adoptParkName("quack.exe.old", func(n string) bool { return n == "quack.exe.old" })
	if park == "quack.exe.old" || park == "" {
		return false // a taken slot yields a fresh unique name
	}
	if adoptParkName("quack.exe.old", func(string) bool { return false }) != "quack.exe.old" {
		return false // a free slot keeps the plain name
	}
	msg := adoptBlockedMessage("binary in use by pid 4242")
	return strings.Contains(msg, "staged") && strings.Contains(msg, "pending") &&
		strings.Contains(msg, "4242")
}

// selftestBinaryBudget verifies req-binary-budget.2,.3.
func selftestBinaryBudget() bool {
	if budgetVerdict("size", 20, 25, 0.29) != "" {
		return false // within budget stays silent
	}
	warn := budgetVerdict("size", 30, 25, 0.29)
	if warn == "" || !strings.Contains(warn, "target") || strings.Contains(warn, "refused") {
		return false // over target warns
	}
	fail := budgetVerdict("size", 36, 25, 0.29)
	// RE-POINTED (go-refusal-lint): the cap message now names its recovery move;
	// the build-refused framing rides the caller's header line.
	if fail == "" || !strings.Contains(fail, "cap") || !strings.Contains(fail, "shrink") {
		return false // over the cap refuses, naming the way out
	}
	return true
}
