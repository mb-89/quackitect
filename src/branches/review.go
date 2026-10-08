// The review: gathers what a reader needs of a work branch, runs the check on
// it in a worktree of its own, and prints the report. No model runs here.
// [[spec/design_output/review#what-the-verb-gathers]]
package branches

import (
	"bytes"
	"encoding/json"
	"fmt"
	"path/filepath"
	"regexp"
	"runtime"
	"slices"
	"strings"
)

// The lines a red check names, the diff's cap, the column the report pads names to, and where the worktree, the survey and the binaries stand. [[spec/design_output/review#a-worktree-runs-the-check]]
const (
	loud         = 5
	diffCap      = 120000
	nameWidth    = 10
	reviewFolder = runtimeFolder + "/review"
	toolsFile    = runtimeFolder + "/tools.json"
	binFolder    = runtimeFolder + "/bin"
)

// What the install writes and git ignores, which the check reads alone. [[spec/design_output/review#a-worktree-runs-the-check]]
var borrowed = []string{"node_modules", "src/extension/webview/node_modules"}

// The files the brand stamps, which a worktree takes off the root where it lacks them. [[spec/design_output/vehicle#the-brand-a-vehicle-stamps]]
var stamped = []string{".claude-plugin/marketplace.json", ".claude/skills/level0/.claude-plugin/plugin.json", "src/extension/package.json", "src/extension/icon.svg"}

// The binaries a worktree builds of its own, by the package each builds off. [[spec/design_output/review#a-worktree-runs-the-check]]
var builds = [][2]string{{"se-index", "src/quack"}}

// What the check on the worktree answers. [[spec/design_output/review#a-worktree-runs-the-check]]
type checked struct {
	OK   bool   `json:"ok"`
	Code *int   `json:"code"`
	Says string `json:"says"`
}

// What a reader needs of a branch, as branch review --json prints it. [[spec/design_output/review#the-questions]]
type material struct {
	Branch    string   `json:"branch"`
	Ref       string   `json:"ref"`
	Trunk     string   `json:"trunk"`
	Ask       string   `json:"ask"`
	Handback  string   `json:"handback"`
	Retro     bool     `json:"retro"`
	Stat      string   `json:"stat"`
	Diff      string   `json:"diff"`
	Check     checked  `json:"check"`
	Unreached []string `json:"unreached,omitempty"`
}

// Gathers what a reader needs of a branch, and prints the report or the JSON. [[spec/design_output/review#what-the-verb-gathers]]
func review(d *Doors, name string, argv []string) int {
	if name == "" {
		d.warn("branch review needs a name: ./RUNME.sh branch review fix-lsp")
		return codeRefused
	}
	branch := name
	if !strings.HasPrefix(name, workBranch) {
		branch = workBranch + name
	}
	d.fetch()
	at := d.refFor(branch)
	if at == "" {
		d.warn("%s stands nowhere, here or on origin.", branch)
		d.warn("Run ./RUNME.sh branch list to see every branch that does.")
		return codeRed
	}
	trunkRef := d.refFor(trunk)
	if trunkRef == "" {
		trunkRef = trunk
	}
	first := d.firstCommit(trunkRef, at)
	if first == "" {
		d.warn("%s carries no commit beyond %s, so there is nothing to read.", at, trunkRef)
		return codeRed
	}
	said := d.gather(branch, at, trunkRef, first)
	if slices.Contains(argv, "--json") {
		var text bytes.Buffer
		writes := json.NewEncoder(&text)
		writes.SetEscapeHTML(false)
		_ = writes.Encode(said)
		fmt.Fprint(d.Out, text.String())
		return codeOK
	}
	d.say("%s", report(said))
	return codeOK
}

// The group ticket is the handback, and its retro chapter the retro. [[spec/design_output/review#the-questions]]
func (d *Doors) gather(branch, at, trunkRef, first string) material {
	ticket := ticketAt(strings.TrimPrefix(branch, workBranch))
	handback := d.show(at, ticket)
	return material{
		Branch:    branch,
		Ref:       at,
		Trunk:     trunkRef,
		Ask:       d.show(first, ticket),
		Handback:  handback,
		Retro:     retroOnTicket(handback),
		Stat:      strings.TrimSpace(d.patchSince(trunkRef, at, true)),
		Diff:      capped(strings.TrimSpace(d.patchSince(trunkRef, at, false))),
		Check:     d.checkOn(branch, at),
		Unreached: d.unreached(trunkRef, at),
	}
}

// The ref a name stands at, on origin first, or nothing. [[spec/design_output/review#what-the-verb-gathers]]
func (d *Doors) refFor(name string) string {
	for _, one := range []string{"origin/" + name, name} {
		if _, ok := d.Repo.Resolve(one); ok {
			return one
		}
	}
	return ""
}

// The patch or its stat from where a ref leaves trunk to the ref, as git diff trunk...ref reads it. [[spec/design_output/review#what-the-verb-gathers]]
func (d *Doors) patchSince(trunkRef, at string, stat bool) string {
	base, ok := d.Repo.MergeBase(trunkRef, at)
	if !ok {
		return ""
	}
	said, _ := d.Repo.Patch(base, at, stat)
	return said
}

// The first commit a ref carries past trunk. [[spec/design_output/review#what-the-verb-gathers]]
func (d *Doors) firstCommit(trunkRef, at string) string {
	commits, _ := d.Repo.Log(trunkRef, at, false)
	if len(commits) == 0 {
		return ""
	}
	return commits[len(commits)-1].Hash
}

// A file at a ref, or nothing. [[spec/design_output/review#what-the-verb-gathers]]
func (d *Doors) show(ref, path string) string {
	said, ok := d.Repo.Show(ref, path)
	if !ok {
		return ""
	}
	return strings.TrimSpace(said)
}

// A diff cut at the cap, with a line saying it runs on. [[spec/design_output/review#what-the-verb-gathers]]
func capped(text string) string {
	units := []rune(text)
	if len(units) <= diffCap {
		return text
	}
	return fmt.Sprintf("%s\n\n[the diff runs on past %d characters]", string(units[:diffCap]), diffCap)
}

var (
	retroHead    = regexp.MustCompile(`(?i)^#\s+retro\s*$`)
	topHead      = regexp.MustCompile(`^#\s+`)
	subHead      = regexp.MustCompile(`^#{2,6}\s+`)
	commentAlone = regexp.MustCompile(`^\s*<!--.*-->\s*$`)
)

// Whether the retro chapter carries a filled line. [[spec/design_output/review#the-questions]]
func retroOnTicket(text string) bool {
	lines := splitRows(text)
	start := slices.IndexFunc(lines, retroHead.MatchString)
	if start < 0 {
		return false
	}
	for _, line := range lines[start+1:] {
		if topHead.MatchString(line) {
			return false
		}
		if subHead.MatchString(line) || commentAlone.MatchString(line) || strings.TrimSpace(line) == "" {
			continue
		}
		return true
	}
	return false
}

// The report a reader reads: nothing to fix, or the rows naming what to. [[spec/design_output/review#what-the-report-looks-like]] [[spec/design_output/review#the-unreached-row]]
func report(said material) string {
	fix := 0
	if !said.Check.OK {
		fix++
	}
	if !said.Retro {
		fix++
	}
	if len(said.Unreached) > 0 {
		fix++
	}
	if fix == 0 {
		return said.Branch + "   nothing to fix. Run branch merge to take it in."
	}
	rows := [][2]string{}
	if said.Check.OK {
		rows = append(rows, [2]string{"check", "passes"})
	} else {
		rows = append(rows, [2]string{"check", redly(said.Check)})
	}
	if said.Retro {
		rows = append(rows, [2]string{"retro", "present"})
	} else {
		rows = append(rows, [2]string{"retro", "absent from the handback"})
	}
	if len(said.Unreached) > 0 {
		rows = append(rows, [2]string{"unreached", strings.Join(said.Unreached, "\n")})
	}
	out := []string{said.Branch, ""}
	for _, row := range rows {
		lines := strings.Split(row[1], "\n")
		out = append(out, padEnd(row[0], nameWidth)+" "+lines[0])
		for _, rest := range lines[1:] {
			out = append(out, strings.Repeat(" ", nameWidth)+" "+rest)
		}
	}
	many := fmt.Sprintf("%d thing", fix)
	if fix != 1 {
		many += "s"
	}
	return strings.Join(append(out, "", many+" to fix. Run branch merge once every fix lands."), "\n")
}

// What a red check answers, its code and what it says. [[spec/design_output/review#what-the-report-looks-like]]
func redly(check checked) string {
	head := "answers nothing"
	if check.Code != nil {
		head = fmt.Sprintf("answers %d", *check.Code)
	}
	if says := strings.TrimSpace(check.Says); says != "" {
		return head + ":\n" + says
	}
	return head
}

// The check run on a worktree of the branch, its binaries its own and its packages borrowed. [[spec/design_output/review#a-worktree-runs-the-check]]
func (d *Doors) checkOn(branch, at string) checked {
	rel := reviewFolder + "/" + strings.Join(strings.Split(branch, "/"), "-")
	where := d.at(rel)
	d.remove(rel)
	if d.Repo.AddWorktree(rel, at) != nil {
		return checked{Says: "no worktree opens on " + at}
	}
	survey := d.read(toolsFile)
	if survey != "" {
		_ = d.write(rel+"/"+toolsFile, survey)
	}
	for _, one := range stamped {
		if d.exists(one) && !d.exists(rel+"/"+one) {
			_ = d.write(rel+"/"+one, d.read(one))
		}
	}
	go_ := toolPath(survey, "go")
	for _, one := range builds {
		d.run(where, nil, "", go_, "build", "-o", filepath.Join(where, filepath.FromSlash(binFolder), one[0]+exe()), "./"+one[1])
	}
	var linked []string
	for _, one := range borrowed {
		if !d.exists(one) {
			continue
		}
		if to := rel + "/" + one; d.link(one, to) {
			linked = append(linked, to)
		}
	}
	bin := filepath.Join(where, filepath.FromSlash(binFolder), "se-index"+exe())
	ran := d.run(where, nil, "", bin, "verb", filepath.Join(where, "src", "scripts"), "check")
	for _, one := range linked {
		d.unlink(one)
	}
	_ = d.Repo.RemoveWorktree(rel)
	d.remove(rel)
	code := ran.Code
	if ran.OK {
		return checked{OK: true, Code: &code}
	}
	return checked{Code: &code, Says: whatFailed(ran.Out, ran.Err)}
}

// The extension a binary takes on this platform. [[spec/design_output/review#a-worktree-runs-the-check]]
func exe() string {
	if runtime.GOOS == "windows" {
		return ".exe"
	}
	return ""
}

// The path the survey names for a tool, or its bare name. [[spec/design_output/review#a-worktree-runs-the-check]]
func toolPath(survey, name string) string {
	var said map[string]struct {
		Path string `json:"path"`
	}
	if json.Unmarshal([]byte(survey), &said) == nil && said[name].Path != "" {
		return said[name].Path
	}
	return name
}

var failedAt = []*regexp.Regexp{
	regexp.MustCompile(`^not ok \d`),
	regexp.MustCompile(`^✖ `),
	regexp.MustCompile(`^[^\s:]+:\d+:\d+: \S+: `),
}

// The cases a red run names, each once, or its last lines. [[spec/design_output/review#a-worktree-runs-the-check]]
func whatFailed(out, errs string) string {
	var lines []string
	for _, one := range strings.Split(strings.ReplaceAll(out+"\n"+errs, "\r\n", "\n"), "\n") {
		lines = append(lines, strings.TrimSpace(one))
	}
	for _, named := range failedAt {
		var found []string
		for _, one := range lines {
			if named.MatchString(one) && !strings.HasPrefix(one, "✖ failing tests") && !slices.Contains(found, one) {
				found = append(found, one)
			}
		}
		if len(found) > 0 {
			return strings.Join(found[:min(loud, len(found))], "\n")
		}
	}
	var filled []string
	for _, one := range lines {
		if one != "" {
			filled = append(filled, one)
		}
	}
	return strings.Join(filled[max(0, len(filled)-loud):], "\n")
}
