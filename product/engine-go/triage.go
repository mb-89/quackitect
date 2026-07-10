package main

import (
	"fmt"
	"os"
	"sort"
	"strings"
)

// design: go-cone-triage  implements: req-cone-triage
// The b7 incident's fix (M4-decision.md: a `bless --all` wave swept OPEN,
// never-adjudicated gates alongside the SUSPECT ones). Two moves:
//
//  1. waveBlessFilter is THE filter cmdBless's --all path runs through: a wave
//     may touch SUSPECT gates only. An OPEN gate (no prior adjudication at any
//     hash) is REFUSED with a stderr line naming it - its first adjudication
//     must be its own walk (`quack next` -> individual `bless <id>`, which
//     stays legal). A DONE gate is a no-op as before (skipped, no re-stamp).
//
//  2. `quack triage` (read-only, never key-gated - it advances nothing) lists
//     the suspect cone grouped for honest bulk re-adjudication, one row per
//     SUSPECT review gate with its why-delta reasons.
//
// The split rule - derived from what the why-delta already reports, never new
// analysis - a gate lands in NEEDS RE-RULING when its own subject moved:
//   - its own statement changed (recorded StatementHash vs stmtHash now), or
//   - its own definition changed (verify / another own field - the recorded
//     full hash moved with statement and deps unchanged), or
//   - a direct dependency that is itself a blessed gate had ITS recorded
//     statement hash move (the dep's subject changed under this ruling).
// Everything else is a STILL-HOLDS CANDIDATE: every reported delta is
// upstream content only (an evidence doc, prose, a dep's non-statement
// fields) or pure propagation (own inputs unchanged, the cone dragged by a
// named root). Honest limit: the ledger records statement baselines only for
// blessed gates, so an unblessed content dep's change reads as upstream
// content - the row still NAMES the changed dep, and the section says
// "candidates": the owner rules, the triage only groups.

// waveBlessFilter returns the ids a wave bless may touch: SUSPECT only,
// sorted. OPEN gates (never adjudicated) and DONE gates never pass it.
func waveBlessFilter(states map[string]string) []string {
	var ids []string
	for id, st := range states {
		if st == "SUSPECT" {
			ids = append(ids, id)
		}
	}
	sort.Strings(ids)
	return ids
}

// blessableGateStates maps every blessable review gate (executed checks and
// content nodes are never blessed) to its effective ledger state.
func blessableGateStates(nodes map[string]Node, sm map[string]string) map[string]string {
	states := map[string]string{}
	for id, n := range nodes {
		if isGate(n) && n.Class != "executed" {
			states[id] = sm[id]
		}
	}
	return states
}

// waveBlessSelect is the --all path's selection: the suspect ids a wave may
// bless, plus the OPEN gates it must refuse (named on stderr by the caller).
func waveBlessSelect(nodes map[string]Node, sm map[string]string) (ids, refusedOpen []string) {
	states := blessableGateStates(nodes, sm)
	ids = waveBlessFilter(states)
	for id, st := range states {
		if st == "OPEN" {
			refusedOpen = append(refusedOpen, id)
		}
	}
	sort.Strings(refusedOpen)
	return ids, refusedOpen
}

// triageRow is one suspect gate with its why-delta reasons and the verdict of
// the split rule above.
type triageRow struct {
	id      string
	reasons []string
	reRule  bool
}

// triageCone classifies every SUSPECT blessable gate by the documented rule.
func triageCone(nodes map[string]Node) (stillHolds, needsReRuling []triageRow) {
	sm := StatusMap(nodes)
	raw := RawStates(nodes)
	a := attestLoad()
	memo := map[string]string{}
	var ids []string
	for id, st := range blessableGateStates(nodes, sm) {
		if st == "SUSPECT" {
			ids = append(ids, id)
		}
	}
	sort.Strings(ids)
	for _, id := range ids {
		row := triageRow{id: id}
		n := nodes[id]
		s, ok := a[id]
		if !ok {
			continue // OPEN never enters the cone; a missing record cannot be SUSPECT
		}
		if stmtHash(n) != s.StatementHash {
			row.reasons = append(row.reasons, "own statement changed")
			row.reRule = true
		}
		for _, d := range parents(n) {
			if _, ok := nodes[d]; !ok || s.Deps[d] == fullHash(d, nodes, memo) {
				continue
			}
			r := "upstream '" + d + "' changed"
			if ds, ok := a[d]; ok && stmtHash(nodes[d]) != ds.StatementHash {
				r += " - its own statement moved"
				row.reRule = true
			}
			row.reasons = append(row.reasons, r)
		}
		if len(row.reasons) == 0 && fullHash(id, nodes, memo) != s.Hash {
			row.reasons = append(row.reasons, "definition changed - re-bless")
			row.reRule = true
		}
		if len(row.reasons) == 0 { // propagated: own inputs unchanged, a root drags the cone
			roots := SuspectRoots(id, nodes, raw)
			r := "propagated - own inputs unchanged"
			if len(roots) > 0 {
				r += "; dragged by: " + strings.Join(roots, ", ")
			}
			row.reasons = append(row.reasons, r)
		}
		if row.reRule {
			needsReRuling = append(needsReRuling, row)
		} else {
			stillHolds = append(stillHolds, row)
		}
	}
	return stillHolds, needsReRuling
}

// cmdTriage prints the grouped suspect cone. Read-only: no key, no events.
func cmdTriage(rest []string) {
	nodes := LoadAll()
	stillHolds, needsReRuling := triageCone(nodes)
	total := len(stillHolds) + len(needsReRuling)
	if total == 0 {
		fmt.Println("suspect cone: empty - nothing to triage")
		return
	}
	fmt.Printf("suspect cone triage - %d gate(s)\n", total)
	printSection := func(head string, rows []triageRow) {
		fmt.Printf("\n%s - %d:\n", head, len(rows))
		for _, r := range rows {
			fmt.Println("  [~] " + r.id)
			for _, reason := range r.reasons {
				fmt.Println("      - " + reason)
			}
		}
	}
	if len(needsReRuling) > 0 {
		printSection("NEEDS RE-RULING (the gate's own subject moved)", needsReRuling)
	}
	if len(stillHolds) > 0 {
		printSection("STILL-HOLDS CANDIDATES (upstream content only - the subject did not move)", stillHolds)
	}
	fmt.Println("\na wave (`" + brand() + " bless --all`) touches exactly the suspect gates above; open gates need their own adjudication - walk them via " + brand() + " next")
}

// init wires triage into the dispatch registry - the REAL wiring the
// triageAvailable probe checks: remove this registration and both the command
// and the selftest die together.
func init() { registerCmd("triage", cmdTriage) }

// triageAvailable probes the live dispatch registry for the triage verb.
func triageAvailable() bool {
	_, ok := registeredCmds["triage"]
	return ok
}

// refuseOpenGates prints the wave's refusal line, naming the skipped ids.
func refuseOpenGates(open []string) {
	if len(open) == 0 {
		return
	}
	fmt.Fprintln(os.Stderr, "refused: open gates need their own adjudication - walk them via "+brand()+" next: "+strings.Join(open, ", "))
}

// enddesign
