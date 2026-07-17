package main

// The i25 clean-state battery: hooks bind their requirements through the seams
// in i25_hygiene.go. Hermetic throughout.

import "strings"

// selftestBatteryFailAtEnd verifies req-battery-fail-at-end.1,.2,.3.
func selftestBatteryFailAtEnd() bool {
	var r batteryReport
	r.record("a", true)
	r.record("b", false)
	r.record("c", true)
	r.record("d", false)
	out, code := r.summary()
	if code == 0 {
		return false // failures exist: nonzero exactly once, at the end
	}
	if !strings.Contains(out, "b") || !strings.Contains(out, "d") {
		return false // EVERY failure is in the one report
	}
	if !strings.Contains(out, "4") || !strings.Contains(out, "2") {
		return false // the report counts ran and failed
	}
	var clean batteryReport
	clean.record("a", true)
	if _, c := clean.summary(); c != 0 {
		return false // a green scope exits zero
	}
	return true
}

// selftestBatteryIsolation verifies req-battery-isolation.1,.2.
func selftestBatteryIsolation() bool {
	a := fixtureHomeName("q25fix", "run-a")
	b := fixtureHomeName("q25fix", "run-b")
	if a == b || a == "q25fix" {
		return false // run-unique names, never the bare base
	}
	wasRunning := batteryRunning
	batteryRunning = true
	midBattery := sweepAllowedDuringBattery()
	batteryRunning = wasRunning
	if midBattery {
		return false // mid-battery the sweep waits
	}
	if wasRunning == false && !sweepAllowedDuringBattery() {
		return false // outside a battery the sweep runs
	}
	return true
}

// selftestMarkerScan verifies req-marker-scan.1: two adjacent regions derive
// two clean statements.
func selftestMarkerScan() bool {
	if !descScanStops("// design: go-neighbor  " + "implements: req-x") {
		return false // a marker line ends the previous region's statement
	}
	if descScanStops("// an ordinary comment line") {
		return false // ordinary comments keep the scan going
	}
	return true
}

// selftestVoiceProse verifies req-voice-prose.2,.3,.4.
func selftestVoiceProse() bool {
	if voiceProseFlaw("the fix covers builds, renders, verdicts, caches, and stamps") == "" {
		return false // a comma-chain of three or more items flags
	}
	if voiceProseFlaw("the fix covers builds and renders") != "" {
		return false // two items stay silent
	}
	if voiceProseFlaw("dated 2026, revised 2026, shipped 2026, and archived") == "" {
		return false // the rule reads items, not words
	}
	// separator-independent items (adr-ke46cra): semicolons count like commas
	if voiceProseFlawWith("the fix covers builds; renders; verdicts and stamps", nil) == "" {
		return false // a semicolon-chain of three items flags
	}
	if voiceProseFlawWith("builds go first, renders follow; stamps close the run", nil) == "" {
		return false // a mixed comma+semicolon chain of three items flags
	}
	if voiceProseFlawWith("the fix covers builds; renders stay untouched", nil) != "" {
		return false // a two-item semicolon join stays authorship judgment
	}
	// exemption tokens ride config (req-voice-prose.4): the token's separator never counts
	if voiceProseFlawWith("TL;DR: builds lead, renders follow", nil) == "" {
		return false // without the exemption the token's semicolon makes item three
	}
	if voiceProseFlawWith("TL;DR: builds lead, renders follow", []string{"TL;DR"}) != "" {
		return false // the exempt token is collapsed before counting
	}
	found := false
	for _, t := range proseExemptions() {
		if t == "TL;DR" {
			found = true
		}
	}
	return found // the shipped config seeds TL;DR, loaded at run time
}

// selftestCardEvidence verifies req-card-evidence.1,.2.
func selftestCardEvidence() bool {
	line := cardEvidenceLine("Findings rest on [mcpmon](https://github.com/neilopet/mcpmon) and [docs](https://code.claude.com/docs).")
	if line == "" || !strings.Contains(line, "mcpmon") || !strings.Contains(line, "github.com") {
		return false // the evidence line carries the links, readable
	}
	if cardEvidenceLine("no links in this prose at all") != "" {
		return false // a fill without links renders no evidence line
	}
	return true
}

var i25Tests = []namedTest{
	{"battery-fail-at-end", selftestBatteryFailAtEnd},
	{"battery-isolation", selftestBatteryIsolation},
	{"marker-scan", selftestMarkerScan},
	{"voice-prose", selftestVoiceProse},
	{"card-evidence", selftestCardEvidence},
}
