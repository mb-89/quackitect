package main

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"
)

// design: go-verdict-cache  implements: req-verify-cache, req-status-fast
// One JSON verdict map in the data home (adr-verdict-cache): test id -> {input hash, build id,
// result, ms}. The build identity is the sha256 self-hash of the running binary
// (adr-build-identity) — a rebuild always invalidates; a forgotten version bump cannot lie. The
// evaluators (the tests-pass battery and gateState's selftest checks) consult the map through
// runSelftestCached and re-run ONLY on a miss: an edited input or a new build. Verdicts of both
// colors are recorded — determinism makes a red verdict as cacheable as a green one. Spike-proven
// (M5): this key discipline cannot serve a stale verdict.

type verdictRec struct {
	Input  string `json:"input"`
	Build  string `json:"build"`
	Result bool   `json:"result"`
	Ms     int64  `json:"ms"`
}

var (
	buildIDMemo         string
	verdictsMemo        map[string]verdictRec
	verdictPathOverride string // selftest seam: point the store at a temp file
)

func buildID() string {
	if buildIDMemo != "" {
		return buildIDMemo
	}
	if exe, err := os.Executable(); err == nil {
		if b, err := os.ReadFile(exe); err == nil {
			h := sha256.Sum256(b)
			buildIDMemo = hex.EncodeToString(h[:])
		}
	}
	if buildIDMemo == "" {
		buildIDMemo = "unknown-build"
	}
	return buildIDMemo
}

func verdictPath() string {
	if verdictPathOverride != "" {
		return verdictPathOverride
	}
	return filepath.Join(dataDirFor("evidence"), "verdicts.json")
}

func verdictLoad() map[string]verdictRec {
	if verdictsMemo != nil {
		return verdictsMemo
	}
	verdictsMemo = map[string]verdictRec{}
	if raw, err := os.ReadFile(verdictPath()); err == nil {
		json.Unmarshal(raw, &verdictsMemo)
	}
	return verdictsMemo
}

// verdictLookup answers (result, hit). A hit needs the same input hash AND the same build.
func verdictLookup(id, input string) (bool, bool) {
	v, ok := verdictLoad()[id]
	if !ok || v.Input != input || v.Build != buildID() {
		return false, false
	}
	return v.Result, true
}

func verdictRecord(id, input string, result bool, d time.Duration) {
	m := verdictLoad()
	m[id] = verdictRec{Input: input, Build: buildID(), Result: result, Ms: d.Milliseconds()}
	b, err := json.MarshalIndent(m, "", " ")
	if err != nil {
		return
	}
	os.MkdirAll(filepath.Dir(verdictPath()), 0o755)
	tmp := verdictPath() + ".tmp"
	if os.WriteFile(tmp, b, 0o644) == nil {
		os.Rename(tmp, verdictPath())
	}
}

// runSelftestCached is the cached evaluator seam: consult the map, run only on a miss, record.
func runSelftestCached(id, name, input string) bool {
	if pass, ok := verdictLookup(id, input); ok {
		return pass
	}
	announceRerun()
	t0 := time.Now()
	pass := runSelftest(name)
	d := time.Since(t0)
	announceSlow(id, d)
	verdictRecord(id, input, pass, d)
	return pass
}

// enddesign

// design: go-verify-feedback  implements: req-verify-feedback
// A re-running battery announces itself once on stderr BEFORE the first test, and names each test
// that runs longer than one second (responsiveness guide: visible feedback within a second). A
// fully cached run stays silent — silence means nothing ran. feedbackW is the selftest seam.
var (
	feedbackW       io.Writer = os.Stderr
	rerunAnnounced  bool
)

func announceRerun() {
	if rerunAnnounced {
		return
	}
	rerunAnnounced = true
	fmt.Fprintln(feedbackW, "verification: cache miss — re-running tests…")
}

func announceSlow(id string, d time.Duration) {
	if d > time.Second {
		fmt.Fprintf(feedbackW, "verification: %s took %.1fs\n", id, d.Seconds())
	}
}

// enddesign

// design: go-why-derived  implements: req-why-derived
// `why` on a coverage-verified check names the RULE, its computed answer over the check's scope,
// and the DELTA: exactly which counted inputs fail it. The delta collector mirrors each rule's
// evaluation but gathers offenders instead of failing fast. tests-pass consults ONLY the verdict
// cache (a miss reads "unverified at this build") — asking why never triggers a battery.
func whyCoverage(nodes map[string]Node, rule, scope string) []string {
	verdictTag := "computes TRUE"
	if !coverageRule(nodes, rule, scope) {
		verdictTag = "computes FALSE"
	}
	sc := scope
	if sc == "" {
		sc = "all iterations"
	}
	out := []string{"derived gate — coverage:" + rule + " " + verdictTag + " over scope " + sc}
	delta := coverageDelta(nodes, rule, scope)
	if len(delta) == 0 {
		return append(out, "delta: none — every counted input satisfies the rule")
	}
	for _, d := range delta {
		out = append(out, "delta: "+d)
	}
	return out
}

func coverageDelta(nodes map[string]Node, rule, scope string) []string {
	inscope := func(n Node) bool { return scope == "" || iterOf(n.Path) <= scope }
	impl := map[string]int{}
	veri := map[string]int{}
	regionless := map[string][]string{}
	for _, n := range nodes {
		for _, p := range n.Implements {
			impl[p]++
			if n.RegionBody == "" {
				regionless[p] = append(regionless[p], n.ID)
			}
		}
		for _, p := range n.Verifies {
			veri[p]++
		}
	}
	up := func(n Node, want string) bool {
		for _, p := range n.Refines {
			if nodes[p].Type == want {
				return true
			}
		}
		return false
	}
	var out []string
	memo := map[string]string{}
	for _, n := range nodes {
		switch rule {
		case "req-traced":
			if n.Type == "requirement" && inscope(n) && !up(n, "usecase") {
				out = append(out, "requirement "+n.ID+" refines no use case")
			}
			if n.Type == "usecase" && inscope(n) && !up(n, "need") {
				out = append(out, "use case "+n.ID+" refines no need")
			}
		case "req-has-test":
			if n.Type == "requirement" && inscope(n) && veri[n.ID] == 0 {
				out = append(out, "requirement "+n.ID+" has no test")
			}
		case "req-has-design":
			if n.Type == "requirement" && inscope(n) && impl[n.ID] == 0 {
				out = append(out, "requirement "+n.ID+" has no design")
			}
		case "adr-traced":
			if n.Type == "adr" && inscope(n) {
				if len(n.Addresses) == 0 {
					out = append(out, "adr "+n.ID+" addresses nothing")
				}
				for _, p := range n.Addresses {
					if p != scrapSink && nodes[p].Type != "requirement" {
						out = append(out, "adr "+n.ID+" addresses '"+p+"', which is no requirement")
					}
				}
			}
		case "designs-realized":
			if n.Type == "requirement" && inscope(n) {
				if impl[n.ID] == 0 {
					out = append(out, "requirement "+n.ID+" has no design")
				}
				for _, d := range regionless[n.ID] {
					out = append(out, "design "+d+" (for "+n.ID+") has no realized code region")
				}
			}
		case "tests-red":
			if n.Type == "test" && n.Class == "executed" && strings.HasPrefix(n.Verify, "selftest:") &&
				iterOf(n.Path) >= testsRedSince && (scope == "" || iterOf(n.Path) == scope) {
				if it := iterOf(n.Path); it != "" && it != readProjectConfig().Version {
					if _, ok := redObserved()[n.ID]; !ok {
						out = append(out, "test "+n.ID+" carries no red observation (birth evidence missing)")
					}
				} else if redObserved()[n.ID] != fullHash(n.ID, nodes, memo) {
					out = append(out, "test "+n.ID+" not observed red at its current hash")
				}
			}
		case "tests-pass":
			if n.Class == "executed" && !strings.HasPrefix(n.Verify, "coverage:") && inscope(n) && n.Verify != "" {
				if strings.HasPrefix(n.Verify, "selftest:") {
					if pass, ok := verdictLookup(n.ID, fullHash(n.ID, nodes, memo)); !ok {
						out = append(out, "test "+n.ID+" unverified at this build (verdict-cache miss)")
					} else if !pass {
						out = append(out, "test "+n.ID+" FAILS at its current inputs")
					}
				}
			}
		}
	}
	sort.Strings(out)
	return out
}

// enddesign

// design: go-notes-list  implements: req-notes-list
// `quack notes [--all]` is the READ lane beside the `note` capture lane: it prints the notes
// location and each open inbox note with id, age, and first body line; --all adds backlog and
// archive. Read-only — nothing is created, moved, or deleted. Exists because the i9 data-home
// move made the inbox invisible from the repo (uc-notes-visible).
var notesHomeOverride string // selftest seam

func notesHomeDir() string {
	if notesHomeOverride != "" {
		return notesHomeOverride
	}
	return notesHome()
}

func noteAge(created time.Time) string {
	d := time.Since(created)
	switch {
	case d < time.Hour:
		return fmt.Sprintf("%dm", int(d.Minutes()))
	case d < 48*time.Hour:
		return fmt.Sprintf("%dh", int(d.Hours()))
	default:
		return fmt.Sprintf("%dd", int(d.Hours()/24))
	}
}

func notesList(all bool) []string {
	lanes := []string{"inbox"}
	if all {
		lanes = append(lanes, "backlog", "archive")
	}
	out := []string{"notes home: " + filepath.ToSlash(notesHomeDir())}
	for _, lane := range lanes {
		dir := filepath.Join(notesHomeDir(), lane)
		entries, err := os.ReadDir(dir)
		if err != nil {
			continue
		}
		var lines []string
		for _, e := range entries {
			if e.IsDir() || !strings.HasSuffix(e.Name(), ".md") {
				continue
			}
			raw, err := os.ReadFile(filepath.Join(dir, e.Name()))
			if err != nil {
				continue
			}
			text := strings.ReplaceAll(string(raw), "\r\n", "\n")
			age, first, dashes := "?", "", 0
			for _, ln := range strings.Split(text, "\n") {
				if strings.TrimSpace(ln) == "---" {
					dashes++
					continue
				}
				if dashes == 1 && strings.HasPrefix(ln, "created: ") {
					if t, err := time.Parse(time.RFC3339, strings.TrimSpace(ln[len("created: "):])); err == nil {
						age = noteAge(t)
					}
				}
				if dashes >= 2 && strings.TrimSpace(ln) != "" {
					first = strings.TrimSpace(ln)
					break
				}
			}
			if len(first) > 96 {
				first = first[:96] + "…"
			}
			lines = append(lines, "  ["+age+"] "+strings.TrimSuffix(e.Name(), ".md")+" — "+first)
		}
		out = append(out, lane+" ("+fmt.Sprint(len(lines))+"):")
		out = append(out, lines...)
	}
	return out
}

func cmdNotes(args []string) {
	all := false
	for _, a := range args {
		if a == "--all" {
			all = true
		}
	}
	for _, ln := range notesList(all) {
		fmt.Println(ln)
	}
}

// enddesign

// design: go-call-log  implements: req-call-log
// One redacted JSONL line per dispatch into <logs home>/calls.jsonl (adr-call-log): ts, command,
// args, duration ms, exit code, channel. Secret VALUES never land at rest: --key/--answer values,
// grant codes, and session keys are replaced by REDACTED at capture time. Exit paths funnel
// through quackExit so the line carries the real exit code; the retro (review.md step 6)
// aggregates the file, then deletes it — retention is retro-bound, no rotation machinery.
var (
	callT0              time.Time
	callCmd             string
	callArgs            []string
	callLogged          bool
	callLogPathOverride string // selftest seam
)

func callLogPath() string {
	if callLogPathOverride != "" {
		return callLogPathOverride
	}
	return filepath.Join(dataDirFor("logs"), "calls.jsonl")
}

func redactArgs(args []string) []string {
	out := make([]string, 0, len(args))
	redactNext := false
	for _, a := range args {
		switch {
		case redactNext:
			out = append(out, "REDACTED")
			redactNext = false
		case a == "--key" || a == "--answer" || a == "--challenge" || a == "--renew":
			out = append(out, a)
			redactNext = true
		case strings.HasPrefix(a, "GRANT-") || strings.HasPrefix(a, "qk-"):
			out = append(out, "REDACTED")
		default:
			out = append(out, a)
		}
	}
	return out
}

func callLogStart(cmd string, rest []string) {
	callT0, callCmd, callArgs, callLogged = time.Now(), cmd, redactArgs(rest), false
}

func callLogWrite(exit int) {
	if callLogged || callCmd == "" {
		return
	}
	callLogged = true
	channel := "agent"
	if channelInteractive() {
		channel = "user"
	}
	rec := map[string]interface{}{
		"ts": callT0.Format(time.RFC3339), "cmd": callCmd, "args": callArgs,
		"ms": time.Since(callT0).Milliseconds(), "exit": exit, "channel": channel,
	}
	b, err := json.Marshal(rec)
	if err != nil {
		return
	}
	os.MkdirAll(filepath.Dir(callLogPath()), 0o755)
	f, err := os.OpenFile(callLogPath(), os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0o644)
	if err != nil {
		return
	}
	defer f.Close()
	f.Write(append(b, '\n'))
}

// quackExit is the exit funnel: the call line lands with its REAL exit code, then the process ends.
func quackExit(code int) {
	callLogWrite(code)
	os.Exit(code)
}

// enddesign
