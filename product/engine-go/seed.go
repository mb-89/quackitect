package main

// design: go-seed-skeleton  implements: req-seed-skeleton
// quack start seeds the rigor checklist SKELETON by parsing the rigor source at seed time (adr-seed-from-rigor-source). It creates one gate per milestone plus its subtask items, with ids namespaced by the iteration tag. It applies milestone-monotonic wiring: subtasks depend on the prior gate, and the gate depends on its subtasks plus the prior gate. It uses the template wording as the statement pre-fill for the composer to tailor. Seeding proposes, and the composer vetoes (req-seed-skeleton.3). Parse-at-seed keeps the checklist the single source of truth. No baked copy exists to drift (raid-seeding-drift). An existing tasks/ dir is never clobbered. A rigor with no checklist seeds nothing.

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

// the milestone header carries a real em-dash (\x{2014}); the source reads as UTF-8
// bytes, never through a platform decoder (the M5 spike's encoding finding).
var seedMsRe = regexp.MustCompile(`(?m)^- \*\*([ML])(\d+) \x{2014} (.+?)\*\*[^\n]*\*gate: ([a-z]+)\*`)
var seedItemRe = regexp.MustCompile(`(?m)^  - \[ \] (.+)$`)
var seedDerivedRe = regexp.MustCompile(`derived: (coverage:[a-z-]+)`)
var seedMarkerRe = regexp.MustCompile(`\*\([^)]*\)\*`)
var seedTagRe = regexp.MustCompile(`^i0*(\d+)`)
var seedSlugRe = regexp.MustCompile(`[^a-z0-9]+`)

// seedIterTag derives the id namespace from the version id: i0021_field_ux -> i21.
func seedIterTag(vid string) string {
	if m := seedTagRe.FindStringSubmatch(vid); m != nil {
		return "i" + m[1]
	}
	return vid
}

// seedSlug shortens an item's text to a stable id fragment: first three words, kebab.
func seedSlug(text string) string {
	words := strings.Fields(seedSlugRe.ReplaceAllString(strings.ToLower(text), " "))
	if len(words) > 3 {
		words = words[:3]
	}
	return strings.Join(words, "-")
}

// seedSkeleton emits the rigor's gates and subtasks into <iterDir>/tasks. It returns
// the number of files written; 0 when the rigor has no checklist or tasks/ is filled.
func seedSkeleton(vid, rigor, iterDir string) (int, error) {
	raw, err := os.ReadFile(filepath.Join(EngineDir(), "method", "rigor", rigor, "checklist.md"))
	if err != nil {
		return 0, nil // a rigor without a checklist (vibe) seeds nothing
	}
	tasks := filepath.Join(iterDir, "tasks")
	if ents, err := os.ReadDir(tasks); err == nil && len(ents) > 0 {
		return 0, nil // never clobber a composed set
	}
	text := string(raw)
	ms := seedMsRe.FindAllStringSubmatchIndex(text, -1)
	if len(ms) == 0 {
		return 0, nil
	}
	if err := os.MkdirAll(tasks, 0o755); err != nil {
		return 0, err
	}
	tag := seedIterTag(vid)
	written := 0
	prevGate := ""
	emit := func(id string, lines []string) error {
		body := "---\n" + strings.Join(lines, "\n") + "\n---\n"
		if err := os.WriteFile(filepath.Join(tasks, id+".md"), []byte(body), 0o644); err != nil {
			return err
		}
		written++
		return nil
	}
	for i, m := range ms {
		num := text[m[4]:m[5]] // the milestone number, L rigor maps to M numbering
		title := text[m[6]:m[7]]
		end := len(text)
		if i+1 < len(ms) {
			end = ms[i+1][0]
		}
		section := text[m[0]:end]
		var subIDs []string
		seen := map[string]bool{}
		for _, im := range seedItemRe.FindAllStringSubmatch(section, -1) {
			item := im[1]
			stmt := strings.TrimSpace(seedMarkerRe.ReplaceAllString(item, ""))
			stmt = strings.TrimRight(stmt, " -")
			slug := seedSlug(stmt)
			if slug == "" {
				slug = "item"
			}
			id := tag + "-m" + num + "-" + slug
			for n := 2; seen[id]; n++ {
				id = tag + "-m" + num + "-" + slug + "-" + fmt.Sprint(n)
			}
			seen[id] = true
			lines := []string{"id: " + id, "statement: " + stmt, "milestone: M" + num}
			if dm := seedDerivedRe.FindStringSubmatch(item); dm != nil {
				lines = append(lines, "class: executed", "verify: "+dm[1])
			} else {
				lines = append(lines, "class: review")
			}
			if strings.Contains(item, "*(killer") {
				lines = append(lines, "killer: true")
			} else {
				lines = append(lines, "killer: false")
			}
			if prevGate != "" {
				lines = append(lines, "depends_on: ["+prevGate+"]")
			}
			if err := emit(id, lines); err != nil {
				return written, err
			}
			subIDs = append(subIDs, id)
		}
		gid := tag + "-m" + num + "-gate"
		deps := append([]string{}, subIDs...)
		if prevGate != "" {
			deps = append(deps, prevGate)
		}
		if err := emit(gid, []string{
			"id: " + gid,
			"statement: M" + num + " " + strings.TrimSpace(title) + " reviewed and adjudicated.",
			"milestone: M" + num,
			"class: review",
			"killer: true",
			"depends_on: [" + strings.Join(deps, ", ") + "]",
		}); err != nil {
			return written, err
		}
		prevGate = gid
	}
	return written, nil
}
