// The tools and the module types the real wiring registers, under the names
// a caller reads off them.
// [[spec/tickets/level0-tools-leave-the-bridge]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"os" // level0: OutsideInDoors - the case checks the module folders the tree holds, as a build check reads source
	"path/filepath"
	"slices"
	"strings"
	"testing"

	"quackitect/src/index"
	"quackitect/src/modules/config"
	"quackitect/src/modules/drafts"
	"quackitect/src/modules/edits"
	"quackitect/src/modules/files"
	"quackitect/src/modules/guidance"
	"quackitect/src/modules/hooks"
	"quackitect/src/modules/plans"
	"quackitect/src/modules/search"
	"quackitect/src/modules/settings"
	verbsmodule "quackitect/src/modules/verbs"
	"quackitect/src/modules/waits"
	"quackitect/src/q"
	"quackitect/src/q/tool"
)

func wiresType(w q.Wiring, kind string) bool {
	for _, one := range w.Instances {
		if one.Module == kind {
			return true
		}
	}
	return false
}

// The names a caller reads off the wiring: an agent's topic call, a step's needs, the door's wait and the mcp instance's wait. [[spec/tickets/vehicle-verbs-become-actions]] [[spec/tickets/retro-verbs-become-actions]] [[spec/tickets/needs-wait-on-branch-topic]] [[spec/tickets/wait-key-meets-its-wiring]] [[spec/tickets/the-mcp-module-lands]]
var wiredNames = []string{
	"vehicle/produce", "stub/into",
	"retro/collect",
	"branch/take", "branch/open",
	"mcp/config/wait",
	index.WaitName,
}

// The module types the wiring loads that the root must know, and the instances it must start. [[spec/tickets/find-and-wait-in-go]] [[spec/tickets/plan-writes-off-go]] [[spec/tickets/the-mcp-module-lands]]
var (
	wiredTypes     = []string{searchModuleType, waitsModuleType, plansModuleType}
	wiredInstances = []string{"mcp"}
)

func TestTheWiringDeclaresEveryNameACallerReads(t *testing.T) {
	t.Parallel()
	w := treeWiring(t)
	c := q.New()
	_, hands, err := loaded(w, c)
	if err != nil {
		t.Fatal(err)
	}
	store := q.NewStore(c)
	for _, name := range wiredNames {
		if _, ok := store.Declared(name); !ok {
			t.Errorf("the wiring declares no %s", name)
		}
	}
	for _, kind := range wiredTypes {
		if _, ok := modules[kind]; !ok {
			t.Errorf("the root loads no module type %s", kind)
		}
		if !wiresType(w, kind) {
			t.Errorf("the wiring loads no %s", kind)
		}
	}
	for _, name := range wiredInstances {
		if _, ok := hands[name]; !ok {
			t.Errorf("the wiring loads %v, and wants an %s instance", w.Instances, name)
		}
	}
}

// [[spec/design_output/bash#the-description-names-verbs]]
func TestEveryVerbTheBashLineNamesStandsRegistered(t *testing.T) {
	t.Parallel()
	verbs := hooks.LineVerbs()
	if len(verbs) == 0 {
		t.Fatal("the Bash line names no verb, and wants the verbs it hands the agent")
	}
	registered := map[string]bool{}
	for words := range registry {
		registered[strings.Fields(words)[0]] = true
	}
	for _, verb := range verbs {
		if !registered[verb] {
			t.Errorf("./RUNME.sh %s stands nowhere in the Go registry", verb)
		}
	}
}

// The verbs a topic of its own answers, each with its list. [[spec/tickets/agents-call-quack-directly]]
var topics = map[string][]verbsmodule.Verb{
	"ticket":  verbsmodule.TicketVerbs,
	"retro":   verbsmodule.RetroVerbs,
	"branch":  verbsmodule.BranchVerbs,
	"vehicle": verbsmodule.VehicleVerbs,
	"stub":    verbsmodule.StubVerbs,
}

// The verbs the command line answers, off the one table Go holds. [[spec/tickets/cli-js-leaves]]
func verbTable() []string {
	var out []string
	for _, one := range verbsmodule.Commands {
		out = append(out, one.Name)
	}
	return out
}

func wiredStore(t *testing.T) *q.Store {
	t.Helper()
	w := treeWiring(t)
	c := q.New()
	if _, _, err := loaded(w, c); err != nil {
		t.Fatal(err)
	}
	return q.NewStore(c)
}

func registered(t *testing.T) map[string]bool {
	t.Helper()
	store := wiredStore(t)
	out := map[string]bool{}
	for _, name := range store.Names() {
		if _, _, ok := store.Types(name); ok {
			out[tool.Name(name)] = true
		}
	}
	return out
}

func TestEveryVerbStandsAmongTheTools(t *testing.T) {
	t.Parallel()
	tools := registered(t)
	table := verbTable()
	if len(table) == 0 {
		t.Fatal("the verb table lists no verb")
	}
	var missing []string
	for _, verb := range table {
		if subs, ok := topics[verb]; ok {
			for _, one := range subs {
				if name := tool.Name(verb + "/" + one.Name); !tools[name] {
					missing = append(missing, name)
				}
			}
			continue
		}
		if name := tool.Name(verbsmodule.TreeTopic + "/" + verb); !tools[name] {
			missing = append(missing, name)
		}
	}
	if len(missing) > 0 {
		t.Fatalf("the session registers no tool %v", missing)
	}
}

// The verbs accepts routes read as accepted, and the route refuses the rest below. [[spec/tickets/every-index-tool-answers]]
func TestAcceptsVerbReadsTheTableAcceptsRoutes(t *testing.T) {
	t.Parallel()
	for _, one := range []struct {
		module, verb string
		want         bool
	}{
		{search.Module, "find", true},
		{waits.Module, "wait", true},
		{plans.Module, "set", true},
		{drafts.Module, "check", true},
		{files.DiskModule, "write", true},
		{edits.Module, "patch", true},
		{q.StoreModule, q.StoreLand, true},
		{verbsmodule.NodeModule, verbsmodule.NodeRun, true},
	} {
		if got := acceptsVerb(one.module, one.verb); got != one.want {
			t.Errorf("acceptsVerb(%s, %s) reads %v, want %v", one.module, one.verb, got, one.want)
		}
	}
}

// A request acceptsVerb refuses meets the route's refusal, so the list and the route read one table, whatever instance a placed process runs. [[spec/tickets/accepts-reads-away-modules]]
func TestTheRouteRefusesWhatAcceptsVerbRefuses(t *testing.T) {
	t.Parallel()
	route := accepts(sharedFolder(), nil, nil)
	for _, asked := range []q.Request{
		{Module: verbsmodule.NodeModule, Verb: "other"},
		{Module: q.StoreModule, Verb: "other"},
		{Module: "ghost", Verb: "add"},
	} {
		if acceptsVerb(asked.Module, asked.Verb) {
			t.Errorf("acceptsVerb(%s, %s) reads true", asked.Module, asked.Verb)
		}
		if _, err := route(asked); err == nil || !strings.Contains(err.Error(), "no IO module accepts") {
			t.Errorf("the route answers %s.%s with %v", asked.Module, asked.Verb, err)
		}
	}
}

func TestTheToolsVerbWritesTheSurveyWholeAndPrintsARowATool(t *testing.T) {
	t.Parallel()
	d, runner, out, _ := fakeBoxDoors(t)
	path := d.env("PATH")
	hq1SeedDisk(t, d.disk, path, map[string]string{"git": "", "sh": "", "python3": ""})
	runner.answers["git"] = ranResult{stdout: "git version 2.43.0\n"}
	runner.answers["python3"] = ranResult{stderr: "Python 3.11.15\n"}
	if code := toolsVerb(d, nil); code != 0 {
		t.Fatalf("the verb answers %d", code)
	}
	written := d.disk.text(filepath.Join(d.root, filepath.FromSlash(toolsFile)))
	want := "{\n  \"node\": null,\n  \"biome\": null,\n  \"go\": null,\n" +
		"  \"git\": {\n    \"path\": " + jsonString(path+"/git") + ",\n    \"version\": \"2.43.0\"\n  },\n  \"claude\": null,\n" +
		"  \"sh\": {\n    \"path\": " + jsonString(path+"/sh") + "\n  },\n" +
		"  \"python\": {\n    \"path\": " + jsonString(path+"/python3") + ",\n    \"version\": \"3.11.15\"\n  }\n}\n"
	if written != want {
		t.Errorf("the survey reads\n%s", written)
	}
	if d.disk.stands(filepath.Join(d.root, filepath.FromSlash(toolsFile)) + ".part") {
		t.Error("the part file stands")
	}
	rows := strings.Split(out.String(), "\n")
	if rows[0] != "node               missing, run ./RUNME.sh" || rows[3] != "git                2.43.0  "+path+"/git" || rows[5] != "sh                 "+path+"/sh" {
		t.Errorf("the rows read\n%s", out)
	}
	if !strings.HasSuffix(out.String(), "\n.se/.runtime/tools.json says this, and every caller reads it.\n") {
		t.Errorf("the closing line reads\n%s", out)
	}
	if got := readSurvey(d.disk, d.root); got["git"] == nil || got["node"] != nil {
		t.Errorf("the survey reads back as %v", got)
	}
}

func TestThePlacesStartAtTheTreesBinariesAndTakeEachEnding(t *testing.T) {
	t.Parallel()
	unix := map[string]string{"PATH": "/a::/b"}
	if got := placesFor("go", func(k string) string { return unix[k] }, "/bin"); !slices.Equal(got, []string{"/bin/go", "/a/go", "/b/go"}) {
		t.Errorf("unix places %v", got)
	}
	windows := map[string]string{"Path": `C:\a;C:\b`, "PATHEXT": ".EXE; .CMD"}
	got := placesFor("go", func(k string) string { return windows[k] }, "/bin")
	want := []string{"/bin/go", "/bin/go.exe", "/bin/go.cmd", `C:\a/go`, `C:\a/go.exe`, `C:\a/go.cmd`, `C:\b/go`, `C:\b/go.exe`, `C:\b/go.cmd`}
	if !slices.Equal(got, want) {
		t.Errorf("windows places %v", got)
	}
}

func TestTheVersionComesOffTheFirstLine(t *testing.T) {
	t.Parallel()
	for said, want := range map[string]string{"go version go1.24.7 linux/amd64": "1.24.7", "v22.22.0\n": "22.22.0", "Python 3.11": "3.11", "none\n1.2.3": ""} {
		if got := versionOf(said); got != want {
			t.Errorf("versionOf(%q) = %q, want %q", said, got, want)
		}
	}
}

func TestACallerLooksAtTheSurveyThenTheTreesBinaryThenTheBareName(t *testing.T) {
	t.Parallel()
	d, _, _, _ := fakeBoxDoors(t)
	at := "/path/vale"
	hq1SeedDisk(t, d.disk, "/", map[string]string{"path/vale": "", d.root + "/" + binFolder + "/biome": ""})
	if got := whereIs(d.disk, d.root, "vale", map[string]*toolAt{"vale": {Path: at}}); got != at {
		t.Errorf("off the survey %q", got)
	}
	if got := whereIs(d.disk, d.root, "biome", map[string]*toolAt{"biome": {Path: "/gone"}}); got != d.root+"/"+binFolder+"/biome" {
		t.Errorf("off the tree %q", got)
	}
	if got := whereIs(d.disk, d.root, "claude", nil); got != "claude" {
		t.Errorf("bare %q", got)
	}
}

func TestEachModuleTypeNamesAFolderThatStands(t *testing.T) {
	t.Parallel()
	for name, module := range modules {
		if module.folder == "" {
			if !slices.Contains(settings.Sections(), name) {
				t.Errorf("%s names no folder, and stands no settings section", name)
			}
			continue
		}
		if info, err := os.Stat(filepath.Join("..", "modules", module.folder)); err != nil || !info.IsDir() {
			t.Errorf("%s names the folder %s, which stands nowhere under src/modules", name, module.folder)
		}
	}
}

func TestTheProjectedModulesAnswerTheBasesAndTheBless(t *testing.T) {
	t.Parallel()
	c := q.New()
	q.OutIn(c, "files/<path...>", q.Content{}, q.Doc("a file"))
	for _, registers := range projected {
		registers(c)
	}
	store := q.NewStore(c)
	for _, name := range []string{"views/bases", "bless/agent"} {
		if _, ok := store.Declared(name); !ok {
			t.Errorf("the projected modules answer no %s", name)
		}
	}
}

func TestTheWorkAndTicketsModulesTakeTheViewActions(t *testing.T) {
	t.Parallel()
	for module, names := range map[string][]string{"work": {"pull", "place"}, "tickets": {"flip-urgent", "set-field"}} {
		c := q.New()
		modules[module].registers(c)
		store := q.NewStore(c)
		for _, name := range names {
			if _, ok := store.Declared(name); !ok {
				t.Fatalf("the %s module type registers no action %s", module, name)
			}
		}
	}
}

// A tree with no rules reads the draft nowhere, as the bridge says. [[spec/tickets/prose-tools-answer-in-go]]
func TestQuackAnswersAnAnswerCheckWithNoRulesAsTheBridgeDoes(t *testing.T) {
	t.Parallel()
	ask := accepts(t.TempDir(), nil, nil) // level0: FixtureOutsideHome - the check reads a root of the case's own where no Vale stands
	said, err := ask(q.Request{Module: drafts.Module, Verb: drafts.AnswerVerb, Args: drafts.Answer{Text: "The door reads the note."}})
	if err != nil {
		t.Fatalf("quack refuses the drafts module: %v", err)
	}
	if want := "No voice rules stand here, so the draft goes unread."; said != want {
		t.Errorf("the answer check answers %q, and wants %q", said, want)
	}
}

func TestEveryModuleDescribesWhatItExposes(t *testing.T) {
	t.Parallel()
	c := q.New()
	c.Take(q.Main)
	for _, one := range modules {
		one.registers(c)
	}
	config.Registers(c)
	for _, registers := range projected {
		registers(c)
	}
	for _, fault := range c.Undescribed() {
		t.Error(fault)
	}
}

// The gate of the standard route reads the design review note, and no other review note. [[spec/tickets/one-review-a-ticket]]
func TestTheStandardGateReadsTheDesignReviewNoteAlone(t *testing.T) {
	t.Parallel()
	rows, err := guidanceRows(realDisk(), treeRoot, map[string]string{})
	if err != nil {
		t.Fatal(err)
	}
	gate := rows["standard:gate"]
	if !slices.Contains(gate, "spec/guidance/review/design") || slices.Contains(gate, "spec/guidance/review/reviewing") {
		t.Fatalf("the standard gate reads %v, and wants the design review note and no other review note", gate)
	}
}

// Every note under a subfolder of spec/guidance reaches some leaf of some process. [[spec/design_input/level-two#guidance]]
func TestEveryGuidanceNoteUnderASubfolderReachesSomeLeaf(t *testing.T) {
	t.Parallel()
	files, err := guidanceFiles(realDisk(), treeRoot)
	if err != nil {
		t.Fatal(err)
	}
	reached := map[string]bool{}
	for _, reads := range guidance.Resolve(guidance.Layered(files, map[string]q.Content{})) {
		for _, one := range reads {
			reached[one.Note] = true
		}
	}
	unreached := []string{}
	for path := range files {
		under, ok := strings.CutPrefix(path, guidance.Guidance+"/")
		name := filepath.Base(under)
		if !ok || !strings.Contains(under, "/") || !strings.HasSuffix(name, ".md") || strings.HasPrefix(name, "_") {
			continue
		}
		if !reached[strings.TrimSuffix(path, ".md")] {
			unreached = append(unreached, path)
		}
	}
	slices.Sort(unreached)
	if len(unreached) > 0 {
		t.Fatalf("no leaf reaches %v, and every note under a subfolder wants some step to read it", unreached)
	}
}

func TestGuidanceFilesKeyEachFileByItsPathUnderTheRoot(t *testing.T) {
	t.Parallel()
	root, disk := "/tree", newFakeDisk()
	at := filepath.Join(root, filepath.FromSlash(guidance.Guidance), "code")
	if err := disk.makeAll(at, 0o755); err != nil {
		t.Fatal(err)
	}
	if err := disk.write(filepath.Join(at, "code.md"), []byte("# Actionables\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	said, err := guidanceFiles(disk, root)
	if err != nil {
		t.Fatal(err)
	}
	want := guidance.Guidance + "/code/code.md"
	if len(said) != 1 || said[want].Text != "# Actionables\n" {
		t.Fatalf("the files read %v, and want %s alone, with a processes folder standing nowhere", said, want)
	}
}
