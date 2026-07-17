package main

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
)

// evidenceLinkRe matches markdown links with absolute http(s) targets — the
// evidence pointers a research fill carries (go-card-evidence).
var evidenceLinkRe = regexp.MustCompile(`\[([^\]]+)\]\((https?://[^)]+)\)`)

// The i25 seams. Stubs first: the hooks in i25_red.go compile against these and
// FAIL until each build step realizes its behavior (test-first).

// design: go-fail-at-end  implements: req-battery-fail-at-end
// The battery collects failures and reports them once, at the end (adr-fail-at-end).
// batteryReport folds per-test verdicts into the one end report; the runner never
// exits at the first red.
type batteryReport struct {
	failures []string
	ran      int
}

func (r *batteryReport) record(name string, pass bool) {
	r.ran++
	if !pass {
		r.failures = append(r.failures, name)
	}
}

func (r *batteryReport) summary() (string, int) {
	if len(r.failures) == 0 {
		return "", 0
	}
	return fmt.Sprintf("battery: %d of %d FAILED - %s",
		len(r.failures), r.ran, strings.Join(r.failures, ", ")), 1
}

// enddesign

// design: go-battery-isolation  implements: req-battery-isolation
// Fixture homes carry run-unique names; the orphan sweep waits for the battery end.
func fixtureHomeName(base string, runID string) string {
	if runID == "" {
		return base
	}
	return base + "-" + runID
}

// batteryRunning gates the orphan sweep: mid-battery, homes in use look orphaned.
var batteryRunning bool

func sweepAllowedDuringBattery() bool { return !batteryRunning }

// enddesign

// design: go-marker-scan-stop  implements: req-marker-scan
// The design scan ends a region's statement at the next marker line.
func descScanStops(line string) bool {
	return designRe.MatchString(line) && !strings.Contains(line, "enddesign")
}

// enddesign

// design: go-voice-prose  implements: req-voice-prose
// The voice lint learns evidence prose: a sentence chaining three or more
// separator-joined items (comma or semicolon, adr-ke46cra) flags as an
// unrendered list. Exemption tokens load from method config (prose-exemptions.json)
// so an exemption edit needs no rebuild. Advisory until its debt drains.
func voiceProseFlaw(sentence string) string {
	return voiceProseFlawWith(sentence, proseExemptions())
}

// voiceProseFlawWith is the testable core: the exemption list arrives explicit.
// An exempt token collapses to a separator-free placeholder before counting, so
// its own punctuation (TL;DR) never makes an item.
func voiceProseFlawWith(sentence string, exempt []string) string {
	for _, t := range exempt {
		if t != "" {
			sentence = strings.ReplaceAll(sentence, t, "EXEMPT")
		}
	}
	if strings.Count(sentence, "`") >= 2 {
		parts := strings.Split(sentence, "`")
		for k := 1; k < len(parts); k += 2 {
			parts[k] = "CODE"
		}
		sentence = strings.Join(parts, "`")
	}
	full := 0
	for _, it := range strings.FieldsFunc(sentence, func(r rune) bool { return r == ',' || r == ';' }) {
		if len(strings.Fields(it)) >= 1 {
			full++
		}
	}
	if full >= 3 {
		return "an unrendered list (voice: three or more comma- or semicolon-joined items become a markdown list)"
	}
	return ""
}

// enddesign

// design: go-voice-prose  region continues: the lint face over evidence docs and node bodies.
// voiceProseFindings walks the iteration evidence docs and flags unrendered lists, advisory.
func voiceProseFindings() []string {
	var out []string
	exempt := proseExemptions() // loaded once; the sentence loop stays IO-free
	docs, _ := filepath.Glob(filepath.Join(SPEC, "iterations", "*", "M*-*.md"))
	sort.Strings(docs)
	for _, d := range docs {
		raw, err := os.ReadFile(d)
		if err != nil {
			continue
		}
		txt := strings.ReplaceAll(string(raw), "\r\n", "\n")
		for _, para := range strings.Split(txt, "\n\n") {
			p := strings.TrimSpace(para)
			if p == "" || strings.HasPrefix(p, "-") || strings.HasPrefix(p, "#") ||
				strings.HasPrefix(p, "```") || strings.HasPrefix(p, "|") {
				continue // rendered lists, headings, fences, and tables are fine
			}
			for _, sent := range strings.FieldsFunc(p, func(r rune) bool { return r == '.' || r == '!' || r == '?' }) {
				if f := voiceProseFlawWith(sent, exempt); f != "" {
					rel := filepath.ToSlash(strings.TrimPrefix(d, filepath.ToSlash(SPEC)+"/"))
					out = append(out, filepath.ToSlash(rel)+": "+f)
					break // one finding per paragraph keeps the list readable
				}
			}
		}
	}
	return out
}

// design: go-card-evidence  implements: req-card-evidence
// A research-backed fill's evidence links render on the hand-off card.
func cardEvidenceLine(evidenceSection string) string {
	links := evidenceLinkRe.FindAllStringSubmatch(evidenceSection, -1)
	if len(links) == 0 {
		return ""
	}
	var parts []string
	for _, m := range links {
		parts = append(parts, `<a href="`+esc(m[2])+`" target="_blank">`+esc(m[1])+`</a>`)
	}
	return `evidence: ` + strings.Join(parts, " · ")
}

// enddesign
