// The retro's collect over a fake trunk: the retro chapter of every group
// closing inside the window, taken once, with the commit landing it.
// [[spec/tickets/the-retro-reads-cloud-retros]]
package main

import (
	"reflect"
	"regexp"
	"slices"
	"sort"
	"strings"
	"testing"
	"time"
)

// A commit the fake trunk holds: the paths it changes and the text each takes. [[spec/tickets/the-retro-reads-cloud-retros]]
type retroCommit struct {
	sha, at string
	trunk   bool
	changes map[string]string
}

// A trunk as git keeps it, answering rev-parse, log and show, and the runs it saw. [[spec/tickets/the-retro-reads-cloud-retros]]
type retroTrunk struct {
	commits []retroCommit
	head    string
	ran     [][]string
}

// A fake trunk over the commits, standing at abc123. [[spec/tickets/the-retro-reads-cloud-retros]]
func retroFakeTrunk(commits ...retroCommit) *retroTrunk {
	return &retroTrunk{commits: commits, head: "abc123"}
}

// One git run, answered by its arguments. [[spec/tickets/the-retro-reads-cloud-retros]]
func (f *retroTrunk) run(args ...string) retroRan {
	f.ran = append(f.ran, slices.Clone(args))
	switch args[0] {
	case "rev-parse":
		return retroRan{ok: true, out: f.head}
	case "log":
		return f.log(args)
	case "show":
		sha, path, _ := strings.Cut(args[1], ":")
		for _, one := range f.commits {
			if text, found := one.changes[path]; found && one.sha == sha {
				return retroRan{ok: true, out: text}
			}
		}
		return retroRan{err: args[1] + " stands nowhere"}
	}
	return retroRan{err: "this fake answers no git " + args[0]}
}

// The log reads the trunk ref alone, newest first, and keeps a path a -G pattern meets in its changed lines. [[spec/tickets/the-retro-reads-cloud-retros]]
func (f *retroTrunk) log(args []string) retroRan {
	if !slices.Contains(args, "main") {
		return retroRan{err: "a ref this fake lacks"}
	}
	since, sinceErr := time.Parse(time.RFC3339, retroFlagOf(args, "--since="))
	var grep *regexp.Regexp
	if at := slices.Index(args, "-G"); at >= 0 {
		grep = regexp.MustCompile("(?m)" + args[at+1])
	}
	format := retroFlagOf(args, "--format=")
	if format == "" {
		format = "%H"
	}
	under := args[slices.Index(args, "--")+1:]
	sorted := slices.Clone(f.commits)
	sort.SliceStable(sorted, func(a, b int) bool { return retroWhen(sorted[a].at).After(retroWhen(sorted[b].at)) })
	rows := []string{}
	for _, one := range sorted {
		if slices.Contains(args, "--first-parent") && !one.trunk {
			continue
		}
		if sinceErr == nil && retroWhen(one.at).Before(since) {
			continue
		}
		names := []string{}
		for _, path := range retroSortedKeys(one.changes) {
			if !slices.ContainsFunc(under, func(top string) bool { return strings.HasPrefix(path, top+"/") }) {
				continue
			}
			if grep != nil && !slices.ContainsFunc(f.changed(one, path), grep.MatchString) {
				continue
			}
			names = append(names, path)
		}
		if len(names) == 0 {
			continue
		}
		rows = append(rows, strings.NewReplacer("%H", one.sha, "%cI", one.at).Replace(format))
		if slices.Contains(args, "--name-only") {
			rows = append(append(rows, ""), names...)
		}
	}
	return retroRan{ok: true, out: strings.Join(rows, "\n")}
}

// The lines a commit adds or drops against the trunk commit before it. [[spec/tickets/the-retro-reads-cloud-retros]]
func (f *retroTrunk) changed(one retroCommit, path string) []string {
	before := ""
	var latest time.Time
	for _, other := range f.commits {
		text, found := other.changes[path]
		when := retroWhen(other.at)
		if other.trunk && found && when.Before(retroWhen(one.at)) && (latest.IsZero() || when.After(latest)) {
			before, latest = text, when
		}
	}
	was := strings.Split(before, "\n")
	now := strings.Split(one.changes[path], "\n")
	out := []string{}
	for _, row := range now {
		if !slices.Contains(was, row) {
			out = append(out, row)
		}
	}
	for _, row := range was {
		if !slices.Contains(now, row) {
			out = append(out, row)
		}
	}
	return out
}

// The value a --flag=value argument carries. [[spec/tickets/the-retro-reads-cloud-retros]]
func retroFlagOf(args []string, flag string) string {
	for _, one := range args {
		if said, found := strings.CutPrefix(one, flag); found {
			return said
		}
	}
	return ""
}

// A time a commit or a record names. [[spec/tickets/the-retro-reads-cloud-retros]]
func retroWhen(said string) time.Time {
	when, _ := time.Parse(time.RFC3339, said)
	return when
}

// The keys of a map, sorted. [[spec/tickets/the-retro-reads-cloud-retros]]
func retroSortedKeys(said map[string]string) []string {
	keys := make([]string, 0, len(said))
	for key := range said {
		keys = append(keys, key)
	}
	sort.Strings(keys)
	return keys
}

// The ticket text a trunk commit carries, with a retro chapter between its ask and its discussion. [[spec/tickets/the-retro-reads-cloud-retros]]
func retroTicketText(name, state, process, chapter string) string {
	return strings.Join([]string{
		"---", "kind: [[ticket]]", "state: " + state, "process: [[spec/processes/" + process + "]]", "---", "",
		"# Ask", "", "The ask of " + name + ".", "", chapter,
		"# Discussion", "", "<!-- what anybody adds, at any time, on this ticket -->", "", "a line past the retro", "",
	}, "\n")
}

// A box's retro chapter as a group ticket carries it. [[spec/tickets/the-retro-reads-cloud-retros]]
var retroChapterText = strings.Join([]string{
	"# retro", "", "## write", "", "### badly", "", "<!-- the form is list -->", "",
	"- the sync meets a conflict, at 10:04, and the owner prompt turns it", "",
	"### thoughts", "", "The box reads the trunk guard late.", "",
}, "\n")

// A group ticket in a state, with a chapter. [[spec/tickets/the-retro-reads-cloud-retros]]
func retroGroupAt(name, state, chapter string) string {
	return retroTicketText(name, state, "group", chapter)
}

// The path a ticket stands at on trunk. [[spec/tickets/the-retro-reads-cloud-retros]]
func retroTicketPath(name string) string { return "spec/tickets/" + name + ".md" }

// [[spec/tickets/the-retro-reads-cloud-retros]]
func TestRetroCollectGathersTheRetroChapterOfEveryGroupClosingInTheWindowWithTheTrunkClose(t *testing.T) {
	t.Parallel()
	closed := retroGroupAt("cloud-one", "closed", retroChapterText)
	w := retroNewCollectWorld(t, retroFakeTrunk(
		retroCommit{sha: "open1", at: "2026-09-08T09:00:00+00:00", trunk: true, changes: map[string]string{retroTicketPath("cloud-one"): retroGroupAt("cloud-one", "open", "")}},
		retroCommit{sha: "box1", at: "2026-09-11T09:00:00+00:00", changes: map[string]string{retroTicketPath("cloud-one"): closed}},
		retroCommit{sha: "merge1", at: "2026-09-15T10:00:00+00:00", trunk: true, changes: map[string]string{retroTicketPath("cloud-one"): closed}},
	))
	w.write(retroCollectLast, `{"at":"2026-09-12T00:00:00.000Z"}`+"\n")

	code, said := w.collect()

	if code != 0 {
		t.Fatalf("collect answers %d: %s", code, said)
	}
	chapter := w.read(retroInputKey("groups/cloud-one.md"))
	for _, want := range []string{`(?m)^# retro$`, `(?m)^### badly$`, `the sync meets a conflict, at 10:04`, `The box reads the trunk guard late\.`} {
		if !regexp.MustCompile(want).MatchString(chapter) {
			t.Fatalf("the chapter lacks %s: %q", want, chapter)
		}
	}
	if strings.Contains(chapter, "The ask of cloud-one") {
		t.Fatal("the ask stays out")
	}
	if strings.Contains(chapter, "a line past the retro") {
		t.Fatal("the chapter after stays out")
	}
	if got := retroJSON(w.read(retroInputKey("groups/closed.json"))); !reflect.DeepEqual(got, map[string]any{"cloud-one": "2026-09-15T10:00:00.000Z"}) {
		t.Fatalf("the close is the trunk commit landing the group, past the box's own close: %v", got)
	}
	if !slices.ContainsFunc(w.manifest(), func(one map[string]any) bool {
		return one["path"] == "groups/cloud-one.md" && one["from"] == "groups"
	}) {
		t.Fatal("the manifest names the chapter from groups")
	}
	for _, one := range w.trunk.ran {
		if strings.Contains(strings.Join(one, " "), "work/") {
			t.Fatalf("collect reads trunk alone, and ran %v", one)
		}
	}
}

// [[spec/tickets/the-retro-reads-cloud-retros]]
func TestRetroCollectLeavesAGroupClosingBeforeTheWindowAndATicketThatIsNoGroupOut(t *testing.T) {
	t.Parallel()
	w := retroNewCollectWorld(t, retroFakeTrunk(
		retroCommit{sha: "merge0", at: "2026-09-10T10:00:00+00:00", trunk: true, changes: map[string]string{retroTicketPath("cloud-old"): retroGroupAt("cloud-old", "closed", retroChapterText)}},
		retroCommit{sha: "fix1", at: "2026-09-14T10:00:00+00:00", trunk: true, changes: map[string]string{retroTicketPath("a-fix"): retroTicketText("a-fix", "closed", "standard", retroChapterText)}},
	))
	w.write(retroCollectLast, `{"at":"2026-09-12T00:00:00.000Z"}`+"\n")

	code, said := w.collect()

	if code != 0 {
		t.Fatalf("collect answers %d: %s", code, said)
	}
	if !w.exists(retroInputKey("manifest.jsonl")) {
		t.Fatal("collect writes its manifest")
	}
	for _, path := range []string{"groups/cloud-old.md", "groups/a-fix.md", "groups/closed.json"} {
		if w.exists(retroInputKey(path)) {
			t.Fatalf("%s stays out", path)
		}
	}
}

// [[spec/tickets/the-retro-reads-cloud-retros]]
func TestRetroCollectGroupClosingWithNoRetroTextWritesNothingAndThePrintNamesIt(t *testing.T) {
	t.Parallel()
	bare := "# retro\n\n## write\n\n### badly\n\n<!-- the form is list -->\n\n"
	w := retroNewCollectWorld(t, retroFakeTrunk(
		retroCommit{sha: "merge2", at: "2026-09-15T10:00:00+00:00", trunk: true, changes: map[string]string{retroTicketPath("cloud-bare"): retroGroupAt("cloud-bare", "closed", bare)}},
	))

	code, said := w.collect()

	if code != 0 {
		t.Fatalf("collect answers %d: %s", code, said)
	}
	if w.exists(retroInputKey("groups/cloud-bare.md")) {
		t.Fatal("a bare chapter writes nothing")
	}
	if !strings.Contains(said, "cloud-bare closes with no retro text") {
		t.Fatalf("collect says %q", said)
	}
}

// [[spec/tickets/the-retro-reads-cloud-retros]]
func TestRetroCollectSecondPassTakesEachGroupOnceAndTheCountPrintsTheGroups(t *testing.T) {
	t.Parallel()
	w := retroNewCollectWorld(t, retroFakeTrunk(
		retroCommit{sha: "merge3", at: "2026-09-19T12:00:00+00:00", trunk: true, changes: map[string]string{retroTicketPath("cloud-a"): retroGroupAt("cloud-a", "closed", retroChapterText)}},
	))
	code, said := w.collect()
	if code != 0 {
		t.Fatalf("collect answers %d: %s", code, said)
	}
	if !regexp.MustCompile(`groups\s+2 file\(s\)`).MatchString(said) {
		t.Fatalf("the chapter and the closes count: %q", said)
	}
	was := w.modified(retroInputKey("groups/cloud-a.md"))

	w.trunk.commits = append(w.trunk.commits, retroCommit{sha: "merge4", at: "2026-09-19T13:00:00+00:00", trunk: true, changes: map[string]string{retroTicketPath("cloud-b"): retroGroupAt("cloud-b", "closed", retroChapterText)}})
	code, said = w.collect("--again")

	if code != 0 {
		t.Fatalf("a second pass answers %d: %s", code, said)
	}
	if was.IsZero() || !w.modified(retroInputKey("groups/cloud-a.md")).Equal(was) {
		t.Fatal("a group the first pass takes stays as it is")
	}
	if w.exists(retroInputKey("groups/cloud-a.2.md")) {
		t.Fatal("a group lands once")
	}
	if !w.exists(retroInputKey("groups/cloud-b.md")) {
		t.Fatal("a later group lands")
	}
	want := map[string]any{"cloud-a": "2026-09-19T12:00:00.000Z", "cloud-b": "2026-09-19T13:00:00.000Z"}
	if got := retroJSON(w.read(retroInputKey("groups/closed.json"))); !reflect.DeepEqual(got, want) {
		t.Fatalf("the closes read %v", got)
	}
	if !regexp.MustCompile(`groups\s+3 file\(s\)`).MatchString(said) {
		t.Fatalf("the second pass counts %q", said)
	}
}
