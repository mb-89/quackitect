package main

import (
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"
)

// design: go-readout-width  implements: req-deterministic-readout.3
// The readout is a bordered box, a fixed 80 columns wide, 76 content plus border, so it never mangles. The engine never probes chat or terminal width, since that is impossible when output is captured, not a TTY. It renders plain inside a code fence when captured, chat or file, and with ANSI color when isTTY(stdout). Width is measured in DISPLAY columns (dispWidth), because the bar uses emoji at 2 columns each, so the border aligns. selftest:readout asserts every line is <= 80 display columns.
const boxContentW = 76
const readoutMax = 80

func isTTY() bool {
	fi, err := os.Stdout.Stat()
	return err == nil && fi.Mode()&os.ModeCharDevice != 0
}

// channelInteractive probes the console shape: BOTH stdin and stdout must be char-devices
// (this harness proves stdin alone lies). A meaning-free probe, same family as isTTY —
// the actor POLICY that consumes it lives in go-actor-channels.
func channelInteractive() bool {
	for _, f := range []*os.File{os.Stdin, os.Stdout} {
		fi, err := f.Stat()
		if err != nil || fi.Mode()&os.ModeCharDevice == 0 {
			return false
		}
	}
	return true
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

// design: go-progress-bar  implements: req-deterministic-readout.2
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

func userAdjudicated(n Node) bool {
	return isGate(n) && n.Class != "executed" && n.Killer
}

func reviewEvidenceReady(id string, n Node) bool {
	if strings.HasSuffix(id, "-gate") {
		return true
	}
	if nodeBodySectionRaw(n.Path, "Handoff Evidence") != "" {
		return true
	}
	if n.Milestone > 0 {
		if m, _ := filepath.Glob(filepath.Join(SPEC, "iterations", iterOf(n.Path), fmt.Sprintf("M%d-*.md", n.Milestone))); len(m) > 0 {
			return true
		}
	}
	return false
}

// design: go-pager-merge  implements: req-pager-merge
// Merge the HAND-OFF, never the nodes (adr-pager-handoff; order is not dependency). When every undone dependency of a milestone gate is a ready review gate, the pager presents them all as one hand-off. This applies for the gate or any of those ready rows. One y blesses the group, with each bless recorded individually. A split answer stays possible. The substance checks and the review gate remain separate records. Only the ceremony is merged.
func pagerGroup(id string, nodes map[string]Node, sm map[string]string) ([]string, string) {
	n, ok := nodes[id]
	if !ok {
		return nil, ""
	}
	gate := id
	if !strings.HasSuffix(id, "-gate") {
		gate = ""
		for cid, c := range nodes {
			if c.Milestone == n.Milestone && iterOf(c.Path) == iterOf(n.Path) && strings.HasSuffix(cid, "-gate") {
				gate = cid
				break
			}
		}
	}
	if gate == "" || sm[gate] == "DONE" {
		return nil, ""
	}
	var ready []string
	for _, d := range parents(nodes[gate]) {
		c, ok := nodes[d]
		if !ok || !isGate(c) || sm[d] == "DONE" {
			continue
		}
		if c.Class == "executed" || strings.HasSuffix(d, "-gate") || !userAdjudicated(c) {
			return nil, "" // deterministic or agent-lane work still open - no user batch yet
		}
		if !reviewEvidenceReady(d, c) {
			return nil, "" // a user-owned review still needs agent evidence before hand-off
		}
		upstreamGates := 0
		for _, u := range parents(c) {
			if uc, ok := nodes[u]; ok && isGate(uc) && sm[u] != "DONE" {
				return nil, "" // a killer not ready yet — the group is not complete
			} else if ok && isGate(uc) {
				upstreamGates++
			}
		}
		if upstreamGates == 0 {
			return nil, "" // a loose open row is not ready for a combined hand-off
		}
		ready = append(ready, d)
	}
	if len(ready) == 0 {
		return nil, ""
	}
	sort.Strings(ready)
	return ready, gate
}

// enddesign

// design: go-pager-scope  implements: req-suspicion-attribution.2
// A pager for a killer SUBTASK reports the readiness of THAT CHECK, its own upstreams and the evidence doc, never the whole milestone. Milestone scope gives false "ready: NO" alarms, since a milestone's first killer always reads 0/N. Gate pagers keep the milestone scope. The merge path resolves to the gate before readiness is computed, so merged hand-offs stay milestone-scoped too.
func checkScopedReadiness(id string, nodes map[string]Node, sm map[string]string, evidence bool) []string {
	own, ownDone := 0, 0
	for _, dep := range parents(nodes[id]) {
		if c, ok := nodes[dep]; ok && isGate(c) {
			own++
			if sm[dep] == "DONE" {
				ownDone++
			}
		}
	}
	readyMark := "❌ NO — see gaps"
	if ownDone == own && evidence {
		readyMark = "✅ yes"
	}
	return []string{"📊 READINESS (check-scoped)",
		fmt.Sprintf("   upstreams %d/%d done · evidence %s", ownDone, own,
			map[bool]string{true: "present", false: "missing"}[evidence]),
		"   ready: " + readyMark,
		""}
}

// enddesign

// design: go-handover-pager  implements: req-deterministic-readout.1
// The killer-gate hand-off readout renders in one bordered, 80-column-or-less box. It shows the emoji progress bar, biggest decisions, the iteration's ADRs, biggest risks, M1 frame, deterministic readiness facts, and LAST the bless question with thumbs-up and thumbs-down emojis. Decisions and risks point at their trace nodes, not restated.
func HandoverPager(gateID, iter string, nodes map[string]Node, sm map[string]string, cfg Config, tty bool) string {
	return render(box(pagerLines(gateID, iter, nodes, sm, cfg)), tty)
}

func mergedPagerGate(id string, nodes map[string]Node, sm map[string]string) string {
	if ks, g := pagerGroup(id, nodes, sm); len(ks) > 0 && g != "" {
		return g
	}
	return id
}

// pagerLines builds the pager CONTENT — the console boxes it, and a mobile ask carries
// the SAME lines as its one-pager body (the phone gets the full card).
func pagerLines(gateID, iter string, nodes map[string]Node, sm map[string]string, cfg Config) []string {
	merged := ""
	question := "❓ Bless " + gateID + "?    👍 y    /    👎 n"
	if ks, g := pagerGroup(gateID, nodes, sm); len(ks) > 0 && g != "" {
		all := strings.Join(append(append([]string{}, ks...), g), " + ")
		merged = "   combined hand-off: " + all + "  (one y blesses all, recorded individually; a split answer names which)"
		question = "❓ Bless " + all + "?    👍 y = all    /    ✂ split    /    👎 n"
		gateID = g // readiness and focus follow the GATE of the group
	}
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
	handoffTitle := milestoneDisplayTitle(iter, nodes[gateID].Milestone, nodes)
	L = append(L, "", "🏁 HANDOVER  "+handoffTitle)
	if stmt := strings.TrimSpace(nodes[gateID].Statement); stmt != "" {
		L = append(L, "   check: "+gateID+" — "+stmt)
	} else {
		L = append(L, "   check: "+gateID)
	}
	if merged != "" {
		L = append(L, merged)
	}
	L = append(L, "")

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

	if !strings.HasSuffix(gateID, "-gate") { // a killer subtask answers for ITSELF (go-pager-scope)
		L = append(L, checkScopedReadiness(gateID, nodes, sm, d.evidence)...)
	} else {
		readyMark := "❌ NO — see gaps"
		if d.ready() {
			readyMark = "✅ yes"
		}
		L = append(L, "📊 READINESS",
			fmt.Sprintf("   subtasks %d/%d · upstream %d suspect · evidence %s",
				d.subDone, d.subTotal, d.suspectUp, map[bool]string{true: "present", false: "missing"}[d.evidence]),
			"   ready: "+readyMark,
			"")
	}

	// the mobile lane (go-ask-loop): a paired device can answer this hand-off remotely
	if _, paired := loadPairConfig(); paired {
		L = append(L, "📱 MOBILE   `ask "+gateID+"` sends this question to the paired phone; `await` blocks for the tap", "")
	}

	// the question — LAST — with emojis
	L = append(L, question)

	return L
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
	raw := RawStates(nodes)
	var direct, propagated []string
	rootSet := map[string]bool{}
	for id, n := range nodes {
		if iterOf(n.Path) == iter && sm[id] == "SUSPECT" {
			if raw[id] == "DONE" { // propagated: the cone is dragged, not broken (go-suspect-root)
				propagated = append(propagated, id)
				for _, r := range SuspectRoots(id, nodes, raw) {
					rootSet[r] = true
				}
			} else {
				direct = append(direct, id)
			}
		}
	}
	sort.Strings(direct)
	var roots []string
	for r := range rootSet {
		roots = append(roots, r)
	}
	sort.Strings(roots)
	var out []string
	if len(direct) > 0 {
		out = append(out, fmt.Sprintf("%d SUSPECT — input changed, re-bless: %s", len(direct), joinN(direct, 3)))
	}
	if len(propagated) > 0 {
		out = append(out, fmt.Sprintf("%d propagated — clear the root(s): %s", len(propagated), joinN(roots, 3)))
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

// design: go-progress-cmd  implements: req-deterministic-readout.2, req-deterministic-readout.1
// quack progress [--iter <v>] [--pager <gate>] [--color|--plain] is the deterministic readout. It shows the bar alone for a self-bless, or the bar plus a handover pager for a killer hand-off. It is colored on a TTY, and plain-fenced when captured. --color and --plain force a mode. It is pure display and never mutates state.
func cmdProgress(rest []string) {
	nodes := LoadAll()
	sm := StatusMap(nodes)
	cfg := readProjectConfig()
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
		// the hand-off IS a page now (adr-handoff-html): render it, open it, print the
		// pointer - the prose-plus-card hand-off retired by the owner's ruling. The
		// live route rides the watch server when one runs; a stale file's buttons
		// no-op without a listener, also by ruling. The CARD text survives only as
		// the phone ask's body (askComposeBody).
		if _, ok := nodes[g]; !ok {
			fmt.Println("no such gate: " + g)
			return
		}
		if !userAdjudicated(nodes[g]) {
			fmt.Println("handoff refused: " + g + " is agent-fillable or deterministic; fill it before asking the user")
			return
		}
		if !reviewEvidenceReady(g, nodes[g]) {
			fmt.Println("handoff refused: " + g + " has no review evidence yet")
			return
		}
		if qs := pagerOpenQuestions(nodes[g], nodes); len(qs) > 0 {
			fmt.Println("handoff refused: open question(s) in the cone - propose or decide them first: " + strings.Join(qs, ", "))
			return
		}
		os.Remove(pagerResultPath(g)) // a fresh round: the file's APPEARANCE is the end signal
		out := filepath.Join(dataDirFor("out"), "handoff-"+g+".html")
		os.MkdirAll(filepath.Dir(out), 0o755)
		os.WriteFile(out, []byte(renderHandoffHTML(g, nodes, sm)), 0o644) // the findable artifact (dead buttons by ruling)
		// the LIVE lane: a one-shot server whose life follows the page
		// (req-handoff-lifecycle) - it opens the browser itself and reports how it ended.
		render := func() string { ns := LoadAll(); return renderHandoffHTML(g, ns, StatusMap(ns)) }
		started := make(chan string, 1)
		res := make(chan string, 1)
		go func() {
			o, err := serveHandoffOnce(g, render, 90*time.Second, 12*time.Second, 15*time.Minute, handoffBless, started)
			if err != nil {
				o = "error: " + err.Error()
			}
			res <- o
		}()
		base := <-started
		fmt.Println("hand-off -> " + base + "/handoff/" + g + "   (file: " + filepath.ToSlash(out) + ")")
		fmt.Println("❓ Bless " + g + "?  the page's buttons record; closing the page keeps the gate open")
		// design: go-pager-noopen  implements: req-register-render
		// A FOREIGN workspace's pager (driven via --base/-C: fixtures, spikes, other projects)
		// never auto-opens the owner's browser and never rides the phone. A fixture render
		// must not impersonate a live hand-off. The page still serves; the pointer prints.
		if baseFromArgs() == "" {
			openFile(base + "/handoff/" + g)
			// the SAME brief rides the phone when one is paired (owner ruling): both
			// channels, first answer wins, the round's end kills the leftover card
			if cid, err := askSendForGate(g, 900, ""); err == nil {
				fmt.Println("📱 the brief rides the paired phone too (" + cid + ")")
			}
		} else {
			fmt.Println("foreign workspace (--base): browser and phone stay quiet; open the pointer yourself")
		}
		// enddesign
		o := <-res
		switch o {
		case "y":
			fmt.Println("answered y — " + g + " blessed (actor=user, channel=handoff)")
		case "n":
			fmt.Println("answered n — dissent recorded, " + g + " stays open")
		case "closed":
			fmt.Println("page closed — that IS the answer: rejection. " + g + " stays open, the server is gone, stop waiting")
		case "unopened":
			fmt.Println("no page opened — " + g + " stays open, the server is gone")
		default:
			fmt.Println("hand-off ended: " + o + " — " + g + " stays open")
		}
		// end the phone side of the round: an answered page invalidates the card
		// outright; an unanswered close first honors a tap that already arrived
		handoffAsksClose(g, o != "y" && o != "n")
		// the round-end contract (go-pager-round): the pollable file first, then the
		// machine line as the FINAL stdout line
		os.WriteFile(pagerResultPath(g), pagerResultJSON(g, o), 0o644)
		fmt.Println(pagerRoundLine(g, o))
		return
	}
	fmt.Println(ProgressBar(iter, nodes, sm, cfg, tty))
}

// enddesign
