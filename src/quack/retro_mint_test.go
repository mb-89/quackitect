// The retro's minting: a class the check step leaves open gets one ticket,
// a class the tree answers already gets none, and every promotion follows.
// [[spec/guidance/retro/check]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"encoding/json"
	"path/filepath"
	"regexp"
	"strings"
	"testing"
)

// One call a fake runner hears: the folder, the words and the env. [[spec/design_output/vehicle#the-work-root-inherits]]
type retroMintCall struct {
	dir  string
	argv []string
	env  map[string]string
}

// A runner answering the words a case teaches it, and hearing every call. [[spec/design_output/vehicle#the-work-root-inherits]]
type retroMintFake struct {
	answers map[string]func() retroMintRan
	ran     []retroMintCall
}

// The runner a verb takes: the taught answer, or a refusal naming the words nothing taught. [[spec/design_output/vehicle#the-work-root-inherits]]
func (f *retroMintFake) run(dir string, argv []string, env map[string]string) retroMintRan {
	f.ran = append(f.ran, retroMintCall{dir: dir, argv: argv, env: env})
	if answer, ok := f.answers[strings.Join(argv, " ")]; ok {
		return answer()
	}
	return retroMintRan{errs: "this fake was never taught: " + strings.Join(argv, " "), code: 127}
}

// Writes a file under the root, its folders made. [[spec/guidance/retro/check]]
func retroMintWrite(t *testing.T, root, path, text string) {
	t.Helper()
	hq2Seed(t, hq2RetroDisk(root), filepath.Join(root, filepath.FromSlash(path)), text)
}

// Reads a file under the root, or the empty text where none stands. [[spec/guidance/retro/check]]
func retroMintReadFile(t *testing.T, root, path string) string {
	t.Helper()
	body, err := hq2RetroDisk(root).read(filepath.Join(root, filepath.FromSlash(path)))
	if err != nil {
		return ""
	}
	return string(body)
}

// Runs a verb over its words, and answers the code, the output and the errors. [[spec/guidance/retro/check]]
func retroMintHeard(verb twin, argv ...string) (int, string, string) {
	var out, errs strings.Builder
	code := verb(argv, false, &out, &errs)
	return code, out.String(), errs.String()
}

const (
	retroMintName     = "retro-a1b2c3"
	retroMintLand     = "spec/tickets/the-land-verb-lands.md"
	retroMintPromoted = "spec/tickets/the-rule-lands.md"
	retroMintDraft    = "---\nkind: [[ticket]]\nstate: draft\n---\n\n# Ask\n\n<!-- gain, as text -->\n<!-- breaks, as text -->\n\n# design\n\n## approach\n"
)

// The record's path under the root. [[spec/guidance/retro/check]]
var retroMintClasses = ".se/.retro/" + retroMintName + "/classes.json"

// The ticket the open class carries. [[spec/guidance/retro/check]]
func retroMintLandTicket() map[string]any {
	return map[string]any{
		"name":      "the-land-verb-lands",
		"process":   "standard",
		"gain":      "a commit lands in one call",
		"breaks":    "every commit costs a round of refusals",
		"done_when": []string{"./RUNME.sh land answers 0 over a clean tree"},
	}
}

// The class standing open, its ticket changed by the case. [[spec/guidance/retro/check]]
func retroMintOpenClass(id string, change func(ticket map[string]any)) map[string]any {
	ticket := retroMintLandTicket()
	if change != nil {
		change(ticket)
	}
	return map[string]any{
		"id":       id,
		"category": "tools",
		"class":    "a commit lands by hand",
		"defect":   "the voice rules refuse the message one round at a time",
		"fix":      "one land verb lints the message, commits, checks and pushes",
		"measure":  map[string]any{"source": "log", "pattern": "PastTense"},
		"tickets":  []string{},
		"status":   "open",
		"ticket":   ticket,
	}
}

// The class the tree answers already, as FIXED. [[spec/guidance/retro/check]]
func retroMintFixedClass() map[string]any {
	one := retroMintOpenClass("k2", nil)
	one["status"] = "fixed: src/engine/retro/mint.js holds it"
	delete(one, "ticket")
	return one
}

// A tree holding the routes and the record, and a runner taught the mint and the open of each ticket. [[spec/guidance/retro/check]]
func retroMintTree(t *testing.T, classes, promotions []map[string]any) (string, *retroMintFake) {
	t.Helper()
	root := t.TempDir() // level0: FixtureOutsideHome - each case writes and mints into a tree of its own
	retroMintWrite(t, root, "spec/processes/standard.yaml", "steps: []\n")
	retroMintWrite(t, root, "spec/processes/trivial.yaml", "steps: []\n")
	if classes == nil {
		classes = []map[string]any{}
	}
	if promotions == nil {
		promotions = []map[string]any{}
	}
	record, err := json.Marshal(map[string]any{"classes": classes, "dispositions": map[string]any{}, "promotions": promotions})
	if err != nil {
		t.Fatal(err)
	}
	retroMintWrite(t, root, retroMintClasses, string(record))
	drafts := func(path string) func() retroMintRan {
		return func() retroMintRan {
			retroMintWrite(t, root, path, retroMintDraft)
			return retroMintRan{}
		}
	}
	fake := &retroMintFake{answers: map[string]func() retroMintRan{
		"./RUNME.sh mint ticket " + retroMintLand + " --process=standard":    drafts(retroMintLand),
		"./RUNME.sh ticket open the-land-verb-lands":                         func() retroMintRan { return retroMintRan{} },
		"./RUNME.sh mint ticket " + retroMintPromoted + " --process=trivial": drafts(retroMintPromoted),
		"./RUNME.sh ticket open the-rule-lands":                              func() retroMintRan { return retroMintRan{} },
		"./RUNME.sh mint ticket spec/tickets/a-second-ticket.md --process=standard": func() retroMintRan {
			return retroMintRan{code: 2, errs: "the ask names a word outside the vocabulary"}
		},
	}}
	return root, fake
}

// The record as the verb leaves it on disk. [[spec/guidance/retro/check]]
func retroMintRead(t *testing.T, root string) retroMintRecord {
	t.Helper()
	var record retroMintRecord
	if err := json.Unmarshal([]byte(retroMintReadFile(t, root, retroMintClasses)), &record); err != nil {
		t.Fatal(err)
	}
	return record
}

// Runs retro mint over the tree with the fake runner. [[spec/guidance/retro/check]]
func retroMintRuns(root string, fake *retroMintFake) (int, string, string) {
	return retroMintHeard(retroMintVerb(retroBoxAt(root), fake.run), "retro", "mint", retroMintName)
}

// The record lands as recordOf and JSON.stringify with two spaces write it: its five keys, each object's keys in their order, a twice-named key at its first place, and numbers and strings as JavaScript prints them. [[spec/guidance/retro/check]]
func TestRetroMintWritesTheRecordAsJsonStringifyDoes(t *testing.T) {
	t.Parallel()
	text := "{\"zeta\":1,\"promotions\":[{\"what\":\"a <b> & \\\"c\\\"\",\"n\":1.50,\"big\":1e21,\"small\":0.0000001,\"neg\":-0.0,\"u\":\"é\\u0001\\u2028\"}],\"classes\":[{\"id\":\"k1\",\"status\":\"fixed: x\",\"tickets\":[],\"x\":{},\"x\":[1]}],\"dispositions\":{\"b\":2,\"a\":[]},\"limits\":\"no\"}"
	want := "{\n  \"classes\": [\n    {\n      \"id\": \"k1\",\n      \"status\": \"fixed: x\",\n      \"tickets\": [],\n      \"x\": [\n        1\n      ]\n    }\n  ],\n  \"dispositions\": {\n    \"b\": 2,\n    \"a\": []\n  },\n  \"promotions\": [\n    {\n      \"what\": \"a <b> & \\\"c\\\"\",\n      \"n\": 1.5,\n      \"big\": 1e+21,\n      \"small\": 1e-7,\n      \"neg\": 0,\n      \"u\": \"é\\u0001 \"\n    }\n  ],\n  \"limits\": [],\n  \"checklist\": []\n}\n"
	read, err := retroMintParse(text)
	if err != nil {
		t.Fatal(err)
	}
	disk := newFakeDisk()
	at := "/tree/classes.json"
	if err := disk.makeAll("/tree", 0o755); err != nil {
		t.Fatal(err)
	}
	var errs strings.Builder
	if !retroMintWrites(disk, at, retroMintKept(read), &errs) {
		t.Fatalf("the record lands nowhere: %s", errs.String())
	}
	if got, _ := disk.read(at); string(got) != want {
		t.Fatalf("the record reads %q, want %q", got, want)
	}
}

// A class with no status mints nothing, and the verb names it. [[spec/guidance/retro/check]]
func TestRetroMintRefusesAClassWithNoStatusAndNamesIt(t *testing.T) {
	t.Parallel()
	bare := retroMintOpenClass("k1", nil)
	bare["status"] = ""
	root, fake := retroMintTree(t, []map[string]any{bare}, nil)
	code, _, errs := retroMintRuns(root, fake)
	if code != 1 || !strings.Contains(errs, "k1 carries no status of open, fixed: or past: with its reason\n") {
		t.Fatalf("retro mint answers %d and says %q", code, errs)
	}
}

// An open class mints one ticket with its ask, a fixed class mints none, and every child works on the root. [[spec/guidance/retro/check]]
func TestRetroMintMintsOneTicketAnOpenClassAndNoneAFixedOne(t *testing.T) {
	t.Parallel()
	root, fake := retroMintTree(t, []map[string]any{retroMintOpenClass("k1", nil), retroMintFixedClass()}, nil)
	code, out, errs := retroMintRuns(root, fake)
	want := "k1  spec/tickets/the-land-verb-lands.md\n1 ticket(s) mint, and 1 class(es) stand closed already.\n"
	if code != 0 || out != want {
		t.Fatalf("retro mint answers %d and prints %q, %q", code, out, errs)
	}
	ticket := retroMintReadFile(t, root, retroMintLand)
	if !strings.Contains(ticket, "# Ask\n\na commit lands in one call") || !strings.Contains(ticket, "- ./RUNME.sh land answers 0 over a clean tree") {
		t.Fatalf("the ticket reads %q", ticket)
	}
	if got := retroMintRead(t, root).Classes[0].Tickets; len(got) != 1 || got[0] != "the-land-verb-lands" {
		t.Fatalf("the record names %v", got)
	}
	for _, one := range fake.ran {
		if one.dir != root || one.env[workRoot] != root {
			t.Fatalf("%v runs in %q with %v, off the work root", one.argv, one.dir, one.env)
		}
	}
}

// A ticket that mints keeps its name where a later one refuses. [[spec/guidance/retro/check]]
func TestRetroMintKeepsTheNameOfATicketThatMintsWhereALaterOneRefuses(t *testing.T) {
	t.Parallel()
	second := retroMintOpenClass("k3", func(ticket map[string]any) { ticket["name"] = "a-second-ticket" })
	root, fake := retroMintTree(t, []map[string]any{retroMintOpenClass("k1", nil), second}, nil)
	code, _, errs := retroMintRuns(root, fake)
	if code != 1 || !strings.Contains(errs, "k3 mints no ticket: the ask names a word outside the vocabulary\n") {
		t.Fatalf("retro mint answers %d and says %q", code, errs)
	}
	if got := retroMintRead(t, root).Classes[0].Tickets; len(got) != 1 || got[0] != "the-land-verb-lands" {
		t.Fatalf("the record names %v", got)
	}
}

// A second run mints nothing twice. [[spec/guidance/retro/check]]
func TestRetroMintMintsNothingTwiceOnASecondRun(t *testing.T) {
	t.Parallel()
	root, fake := retroMintTree(t, []map[string]any{retroMintOpenClass("k1", nil)}, nil)
	retroMintRuns(root, fake)
	code, out, _ := retroMintRuns(root, fake)
	if code != 0 || out != "0 ticket(s) mint, and 0 class(es) stand closed already.\n" {
		t.Fatalf("the second run answers %d and prints %q", code, out)
	}
}

// The ask reads as the chapter, and lands where the mint leaves it empty. [[spec/guidance/retro/check]]
func TestRetroMintAskReadsAsTheChapterAndLandsWhereTheMintLeavesItEmpty(t *testing.T) {
	t.Parallel()
	ask := retroMintAskOf(retroMintTicket{
		Gain:     "a commit lands in one call",
		Breaks:   "every commit costs a round of refusals",
		DoneWhen: []string{"./RUNME.sh land answers 0 over a clean tree"},
	})
	if !strings.HasPrefix(ask, "a commit lands in one call\n\nevery commit costs a round of refusals\n\n- ./RUNME") {
		t.Fatalf("the ask reads %q", ask)
	}
	said := retroMintWithAsk(retroMintDraft, ask)
	at := strings.Index(said, "a commit lands in one call")
	if at < 0 || at > strings.Index(said, "# design") || strings.Contains(said, "gain, as text") {
		t.Fatalf("the ticket reads %q", said)
	}
}

// A promotion carrying no ticket mints nothing, and the verb names it by its what or its place. [[spec/tickets/a-promotion-names-its-fault]]
func TestRetroMintNamesAPromotionCarryingNoTicketByItsWhatOrItsPlace(t *testing.T) {
	t.Parallel()
	promotions := []map[string]any{
		{"what": "the land rule", "from": "memory", "to": "spec/guidance/working"},
		{"what": "", "from": "memory", "to": "spec/guidance/voice"},
		{"what": "a rule minted already", "from": "memory", "to": "spec/guidance/retro", "tickets": []string{"the-land-verb-lands"}},
	}
	root, fake := retroMintTree(t, []map[string]any{retroMintFixedClass()}, promotions)
	code, _, errs := retroMintRuns(root, fake)
	if code != 1 ||
		!strings.Contains(errs, "promotion \"the land rule\" waits, and its ticket carries no name\n") ||
		!strings.Contains(errs, "promotion 2 waits, and its ticket carries no done_when\n") ||
		strings.Contains(errs, "a rule minted already") || strings.Contains(errs, "undefined") {
		t.Fatalf("retro mint answers %d and says %q", code, errs)
	}
}

// A promotion's ticket stands checked by the mint alone: five faults, one a field it lacks. The classes half belongs to retro_classes_test.go. [[spec/tickets/a-promotion-ticket-reads-once]]
func TestRetroMintChecksAPromotionsTicketAlone(t *testing.T) {
	t.Parallel()
	record := retroMintRecord{Promotions: []retroMintPromotion{{What: "the land rule"}}}
	if got := retroMintFaults(newFakeDisk(), record, ""); len(got) != 5 {
		t.Fatalf("the mint names %v", got)
	}
}

// A promotion naming a process that stands nowhere is refused by its what. [[spec/tickets/the-retro-reads-the-backlog]]
func TestRetroMintRefusesAPromotionNamingAProcessThatStandsNowhere(t *testing.T) {
	t.Parallel()
	root, _ := retroMintTree(t, nil, nil)
	ticket := retroMintTicket{Name: "the-rule-lands", Process: "nowhere", Gain: "a commit lands in one call", Breaks: "every commit costs a round of refusals", DoneWhen: []string{"./RUNME.sh land answers 0 over a clean tree"}}
	got := retroMintFaults(hq2RetroDisk(root), retroMintRecord{Promotions: []retroMintPromotion{{What: "the land rule", Ticket: &ticket}}}, root)
	want := `promotion "the land rule" waits, and its ticket names process nowhere: spec/processes holds no nowhere. It holds standard, trivial.`
	if len(got) != 1 || got[0] != want {
		t.Fatalf("the mint names %q", got)
	}
}

// A class naming trivial mints a trivial ticket. [[spec/tickets/the-retro-reads-the-backlog]]
func TestRetroMintMintsATrivialTicketForAClassNamingTrivial(t *testing.T) {
	t.Parallel()
	trivial := retroMintOpenClass("k1", func(ticket map[string]any) {
		ticket["name"] = "the-rule-lands"
		ticket["process"] = "trivial"
	})
	root, fake := retroMintTree(t, []map[string]any{trivial}, nil)
	code, out, errs := retroMintRuns(root, fake)
	if code != 0 {
		t.Fatalf("retro mint answers %d and prints %q, %q", code, out, errs)
	}
	for _, one := range fake.ran {
		if strings.HasSuffix(strings.Join(one.argv, " "), "the-rule-lands.md --process=trivial") {
			return
		}
	}
	t.Fatalf("the mint names no trivial process: %v", fake.ran)
}

// A class naming no process is refused, and nothing mints. [[spec/tickets/the-retro-reads-the-backlog]]
func TestRetroMintRefusesAClassNamingNoProcess(t *testing.T) {
	t.Parallel()
	bare := retroMintOpenClass("k1", func(ticket map[string]any) { ticket["process"] = "" })
	root, fake := retroMintTree(t, []map[string]any{bare}, nil)
	code, _, errs := retroMintRuns(root, fake)
	if code != 1 || !strings.Contains(errs, "k1 stands open, and its ticket carries no process\n") || len(fake.ran) != 0 {
		t.Fatalf("retro mint answers %d, says %q and runs %v", code, errs, fake.ran)
	}
}

// A class naming a process that stands nowhere is refused, and nothing mints. [[spec/tickets/the-retro-reads-the-backlog]]
func TestRetroMintRefusesAClassNamingAProcessThatStandsNowhere(t *testing.T) {
	t.Parallel()
	lost := retroMintOpenClass("k1", func(ticket map[string]any) { ticket["process"] = "nowhere" })
	root, fake := retroMintTree(t, []map[string]any{lost}, nil)
	code, _, errs := retroMintRuns(root, fake)
	if code != 1 || !regexp.MustCompile(`k1 stands open, and its ticket names process nowhere: spec/processes holds no nowhere`).MatchString(errs) || len(fake.ran) != 0 {
		t.Fatalf("retro mint answers %d, says %q and runs %v", code, errs, fake.ran)
	}
}

// Every promotion mints one ticket with its ask, after the classes, and a second run mints none. [[spec/tickets/the-retro-finishes-its-asks]]
func TestRetroMintMintsEveryPromotionAfterTheClasses(t *testing.T) {
	t.Parallel()
	promotion := map[string]any{
		"what": "the land rule",
		"from": "memory",
		"to":   "spec/guidance/working",
		"ticket": map[string]any{
			"name":      "the-rule-lands",
			"process":   "trivial",
			"gain":      "the owner states the rule once",
			"breaks":    "the owner repeats the rule the next day",
			"done_when": []string{"spec/guidance/working holds the rule"},
		},
	}
	root, fake := retroMintTree(t, []map[string]any{retroMintOpenClass("k1", nil)}, []map[string]any{promotion})
	code, out, errs := retroMintRuns(root, fake)
	want := "k1  spec/tickets/the-land-verb-lands.md\npromotion \"the land rule\"  spec/tickets/the-rule-lands.md\n2 ticket(s) mint, and 0 class(es) stand closed already.\n"
	if code != 0 || out != want {
		t.Fatalf("retro mint answers %d and prints %q, %q", code, out, errs)
	}
	if ticket := retroMintReadFile(t, root, retroMintPromoted); !strings.Contains(ticket, "# Ask\n\nthe owner states the rule once") {
		t.Fatalf("the promoted ticket reads %q", ticket)
	}
	if got := retroMintRead(t, root).Promotions[0].Tickets; len(got) != 1 || got[0] != "the-rule-lands" {
		t.Fatalf("the record names %v", got)
	}
	if _, again, _ := retroMintRuns(root, fake); !strings.HasPrefix(again, "0 ticket(s) mint") {
		t.Fatalf("the second run prints %q", again)
	}
}

// The mint keeps the retro's classes, rates and collect time in the tracked folder, where the next box's effect finds them. [[spec/tickets/retro-read-reads-every-record]]
func TestRetroMintKeepsTheClassesInTheTrackedFolder(t *testing.T) {
	t.Parallel()
	root, fake := retroMintTree(t, []map[string]any{retroMintFixedClass()}, nil)
	retroMintWrite(t, root, ".se/.retro/"+retroMintName+"/rates.json", `{"hours":1,"classes":{}}`)

	code, _, errs := retroMintRuns(root, fake)

	kept := "spec/retros/" + retroMintName + "/"
	if code != 0 || retroMintReadFile(t, root, kept+"classes.json") != retroMintReadFile(t, root, retroMintClasses) ||
		retroMintReadFile(t, root, kept+"rates.json") != `{"hours":1,"classes":{}}` {
		t.Fatalf("retro mint answers %d, %q, and the tracked folder reads %q", code, errs, retroMintReadFile(t, root, kept+"classes.json"))
	}
}

// The mint keeps the collect time alone, leaving out the folders collect names, and skips a rates file that stands nowhere. [[spec/tickets/retro-read-reads-every-record]]
func TestRetroMintKeepsTheCollectTimeAloneAndSkipsMissingRates(t *testing.T) {
	t.Parallel()
	root, fake := retroMintTree(t, []map[string]any{retroMintFixedClass()}, nil)
	retroMintWrite(t, root, ".se/.retro/"+retroMintName+"/collected.json", `{"at":"2026-09-19T21:00:00.000Z","since":"","folders":["log"]}`)

	code, _, errs := retroMintRuns(root, fake)

	kept := "spec/retros/" + retroMintName + "/"
	want := "{\n  \"at\": \"2026-09-19T21:00:00.000Z\"\n}\n"
	if got := retroMintReadFile(t, root, kept+"collected.json"); code != 0 || got != want || retroMintReadFile(t, root, kept+"rates.json") != "" {
		t.Fatalf("retro mint answers %d, %q, and the tracked collect time reads %q, want %q", code, errs, got, want)
	}
}
