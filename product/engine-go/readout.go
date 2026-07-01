package main

import (
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

// design: go-readout-width  implements: req-readout-width
// The readout is a bordered box a fixed 80 columns wide (76 content + border), so it never mangles.
// The engine never probes chat/terminal width (impossible — output is captured, not a TTY); it renders
// plain inside a code fence when captured (chat/file) and with ANSI color when isTTY(stdout). Width is
// measured in DISPLAY columns (dispWidth) because the bar uses emoji (2 cols each) — so the border
// aligns. selftest:readout asserts every line is <= 80 display columns.
const boxContentW = 76
const readoutMax = 80

func isTTY() bool {
	fi, err := os.Stdout.Stat()
	return err == nil && fi.Mode()&os.ModeCharDevice != 0
}

// dispWidth counts display columns, treating emoji (common ranges) as 2 and VS16 as 0.
func dispWidth(s string) int {
	w := 0
	for _, r := range s {
		switch {
		case r == 0xFE0F:
			// variation selector — zero width
		case r >= 0x1F000, r >= 0x2600 && r <= 0x27BF, r >= 0x2B00 && r <= 0x2BFF:
			w += 2
		default:
			w++
		}
	}
	return w
}

func padDisp(s string, w int) string {
	if d := dispWidth(s); d < w {
		return s + strings.Repeat(" ", w-d)
	}
	return s
}

// truncDisp clamps s to w display columns, appending "..." if it had to cut.
func truncDisp(s string, w int) string {
	if dispWidth(s) <= w {
		return s
	}
	out, acc := []rune{}, 0
	for _, r := range s {
		rw := 1
		if r >= 0x1F000 || (r >= 0x2600 && r <= 0x27BF) || (r >= 0x2B00 && r <= 0x2BFF) {
			rw = 2
		}
		if acc+rw > w-3 {
			break
		}
		out = append(out, r)
		acc += rw
	}
	return string(out) + "..."
}

// box frames content with top/bottom horizontal rules only — NO vertical edges, so emoji width
// (which varies by renderer) can never make the border ragged. Content is truncated to <= 80 cols.
func box(lines []string) []string {
	rule := strings.Repeat("─", readoutMax)
	out := []string{rule}
	for _, ln := range lines {
		out = append(out, truncDisp(ln, readoutMax))
	}
	return append(out, rule)
}

func fence(lines []string) string {
	return "```\n" + strings.Join(lines, "\n") + "\n```"
}

// enddesign

func milestonesOf(iter string, nodes map[string]Node, cfg Config) []int {
	set := map[int]bool{}
	for _, m := range policyMilestones(rigorOf(iter, cfg)) {
		set[m] = true
	}
	for _, n := range nodes {
		if n.Milestone > 0 && iterOf(n.Path) == iter {
			set[n.Milestone] = true
		}
	}
	var out []int
	for m := range set {
		out = append(out, m)
	}
	sort.Ints(out)
	return out
}

type mcell struct {
	m, done, total int
	state          string
}

func msData(iter string, nodes map[string]Node, sm map[string]string, cfg Config) (cells []mcell, curIdx, doneMs int) {
	curIdx = -1
	for _, m := range milestonesOf(iter, nodes, cfg) {
		var members []string
		for id, nd := range nodes {
			if nd.Milestone == m && iterOf(nd.Path) == iter && sm[id] != "CONTENT" {
				members = append(members, id)
			}
		}
		gate := milestoneGate(members, m)
		total, done := 0, 0
		for _, id := range members {
			if id == gate {
				continue
			}
			total++
			if sm[id] == "DONE" {
				done++
			}
		}
		state := "OPEN"
		if gate != "" {
			state = sm[gate]
		}
		if state == "DONE" {
			doneMs++
		} else if curIdx < 0 {
			curIdx = len(cells)
		}
		cells = append(cells, mcell{m, done, total, state})
	}
	if curIdx < 0 {
		curIdx = len(cells)
	}
	return
}

// barLines renders the emoji progress bar + labels as content lines (no border).
// 🟩 done · 🟨 suspect · 📍 current · ⬜ open. Each milestone occupies 6 display cols so labels align.
func barLines(iter string, cells []mcell, curIdx, doneMs int) []string {
	n := len(cells)
	pos := "all milestones done"
	if curIdx < n {
		pos = fmt.Sprintf("M%d of %d", cells[curIdx].m, n)
	}
	var bar, lab strings.Builder
	bar.WriteString("START ")
	lab.WriteString("      ")
	for i, c := range cells {
		g := "⬜"
		switch {
		case c.state == "DONE":
			g = "🟩"
		case c.state == "SUSPECT":
			g = "🟨"
		}
		bar.WriteString(g)
		lab.WriteString(padDisp(fmt.Sprintf("M%d", c.m), 2))
		if i < n-1 {
			bar.WriteString(" ── ")
			lab.WriteString("    ")
		}
	}
	bar.WriteString(" END")
	// position marker — ALWAYS shown, on its own line above the bar: over the current milestone, or
	// over START (nothing done) / END (all done). Each milestone occupies 6 display cols after "START ".
	col := 6
	if curIdx < n {
		col = 6 + curIdx*6
	} else if n > 0 {
		col = 6 + n*6 - 3 // over END
	}
	marker := strings.Repeat(" ", col) + "📍"
	return []string{
		iter,
		"",
		marker,
		bar.String(),
		lab.String(),
		"",
		fmt.Sprintf("%s · %d/%d milestones done", pos, doneMs, n),
	}
}

// design: go-progress-bar  implements: req-progress-bar
// A deterministic bordered emoji bar for one iteration: START, each milestone, END, current marked 📍.
// Shown when the agent self-blesses. Colored when a TTY, plain-fenced when captured.
func ProgressBar(iter string, nodes map[string]Node, sm map[string]string, cfg Config, tty bool) string {
	cells, curIdx, doneMs := msData(iter, nodes, sm, cfg)
	if len(cells) == 0 {
		return render(box([]string{iter, "", "no milestones"}), tty)
	}
	return render(box(barLines(iter, cells, curIdx, doneMs)), tty)
}

// render joins boxed lines: fenced (captured) or raw (TTY).
func render(lines []string, tty bool) string {
	if tty {
		return strings.Join(lines, "\n")
	}
	return fence(lines)
}

// segFill kept for reference of state glyphs is no longer used (emoji bar replaced the ASCII fill).

// enddesign

type pagerData struct {
	decisions [][2]string
	risks     []string
	subDone   int
	subTotal  int
	suspectUp int
	evidence  bool
}

func gatherPager(gateID, iter string, nodes map[string]Node, sm map[string]string) pagerData {
	var d pagerData
	var adrs []string
	for id, n := range nodes {
		if n.Type == "adr" && iterOf(n.Path) == iter {
			adrs = append(adrs, id)
		}
	}
	sort.Strings(adrs)
	for _, id := range adrs {
		d.decisions = append(d.decisions, [2]string{id, firstSentence(nodes[id].Statement)})
	}
	d.risks = computeRisks(iter, nodes, sm)
	ms := nodes[gateID].Milestone
	for id, n := range nodes {
		if n.Milestone == ms && iterOf(n.Path) == iter && sm[id] != "CONTENT" && id != gateID {
			d.subTotal++
			if sm[id] == "DONE" {
				d.subDone++
			}
		}
	}
	for _, dep := range nodes[gateID].DependsOn {
		if sm[dep] == "SUSPECT" {
			d.suspectUp++
		}
	}
	if m, _ := filepath.Glob(filepath.Join(SPEC, "iterations", iter, fmt.Sprintf("M%d-*.md", ms))); len(m) > 0 {
		d.evidence = true
	}
	return d
}

func (d pagerData) ready() bool {
	return d.subTotal > 0 && d.subDone == d.subTotal && d.suspectUp == 0 && d.evidence
}

// design: go-handover-pager  implements: req-handover-pager
// The killer-gate hand-off readout, in one bordered <=80-col box: the emoji progress bar, biggest
// decisions (the iteration's ADRs), biggest risks (M1 frame), deterministic readiness facts, and — LAST
// — the bless question with 👍/👎 emojis. Decisions/risks point at their trace nodes, not restated.
func HandoverPager(gateID, iter string, nodes map[string]Node, sm map[string]string, cfg Config, tty bool) string {
	d := gatherPager(gateID, iter, nodes, sm)
	cells, _, doneMs := msData(iter, nodes, sm, cfg)
	// the marker points at THIS gate's milestone (the one being adjudicated), not the global cursor —
	// otherwise, with everything plan-locked DONE, "first not-done" falls off the end.
	focus := len(cells)
	for i, c := range cells {
		if c.m == nodes[gateID].Milestone {
			focus = i
			break
		}
	}

	var L []string
	L = append(L, barLines(iter, cells, focus, doneMs)...)
	L = append(L, "", "🏁 HANDOVER  "+gateID, "")

	L = append(L, "📋 DECISIONS")
	if len(d.decisions) == 0 {
		L = append(L, "   • (none)")
	}
	for _, dec := range d.decisions {
		L = append(L, "   • "+dec[0]+": "+dec[1])
	}
	L = append(L, "")

	L = append(L, "⚠️ RISKS")
	if len(d.risks) == 0 {
		L = append(L, "   • (from M1 frame)")
	}
	for _, r := range d.risks {
		L = append(L, "   • "+r)
	}
	L = append(L, "")

	readyMark := "❌ NO — see gaps"
	if d.ready() {
		readyMark = "✅ yes"
	}
	L = append(L, "📊 READINESS",
		fmt.Sprintf("   subtasks %d/%d · upstream %d suspect · evidence %s",
			d.subDone, d.subTotal, d.suspectUp, map[bool]string{true: "present", false: "missing"}[d.evidence]),
		"   ready: "+readyMark,
		"")

	// the question — LAST — with emojis
	L = append(L, "❓ Bless "+gateID+"?    👍 y    /    👎 n")

	return render(box(L), tty)
}

func firstSentence(s string) string {
	if i := strings.IndexByte(s, '.'); i >= 0 {
		return s[:i+1]
	}
	return s
}

// computeRisks surfaces what the user must REACT TO before blessing — deterministic, from ledger state,
// not prose. SUSPECT checks (inputs changed → re-bless), checks not done yet, and coverage holes
// (missing design/test). Scoped to the iteration. "nothing outstanding" when the cone is clean.
func computeRisks(iter string, nodes map[string]Node, sm map[string]string) []string {
	// Risks are things to REACT TO, not normal forward work. Open future milestones are expected and
	// NOT risks; only regressions (SUSPECT — an input changed under a blessed check) and coverage holes
	// (a requirement missing its design/test) qualify.
	var susp []string
	for id, n := range nodes {
		if iterOf(n.Path) == iter && sm[id] == "SUSPECT" {
			susp = append(susp, id)
		}
	}
	sort.Strings(susp)
	var out []string
	if len(susp) > 0 {
		out = append(out, fmt.Sprintf("%d SUSPECT — input changed, re-bless: %s", len(susp), joinN(susp, 3)))
	}
	if holes := CoverageHoles(nodes, iter); len(holes) > 0 {
		out = append(out, fmt.Sprintf("%d coverage hole(s): %s", len(holes), joinN(holes, 2)))
	}
	if len(out) == 0 {
		out = append(out, "nothing outstanding — clear to bless")
	}
	return out
}

func joinN(xs []string, n int) string {
	if len(xs) > n {
		return strings.Join(xs[:n], ", ") + fmt.Sprintf(", +%d more", len(xs)-n)
	}
	return strings.Join(xs, ", ")
}

// enddesign

// design: go-progress-cmd  implements: req-progress-bar, req-handover-pager
// quack progress [--iter <v>] [--pager <gate>] [--color|--plain] — the deterministic readout: the bar
// alone (self-bless) or bar + handover pager (killer hand-off). Colored on a TTY, plain-fenced when
// captured; --color/--plain force a mode. Pure display — never mutates state.
func cmdProgress(rest []string) {
	nodes := LoadAll()
	sm := StatusMap(nodes)
	cfg := ReadConfig(filepath.Join(QUACK, "config.toml"))
	iter := cfg.Version
	if v := flagVal(rest, "--iter"); v != "" {
		iter = v
	}
	tty := isTTY()
	if hasFlag(rest, "--color") {
		tty = true
	}
	if hasFlag(rest, "--plain") {
		tty = false
	}
	if g := flagVal(rest, "--pager"); g != "" {
		fmt.Println(HandoverPager(g, iter, nodes, sm, cfg, tty))
		return
	}
	fmt.Println(ProgressBar(iter, nodes, sm, cfg, tty))
}

// enddesign
