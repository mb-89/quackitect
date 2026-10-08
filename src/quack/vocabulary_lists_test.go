// The word lists this tree ships, read off the disk through the Go slug, the
// Go word set and the Go table of endings: every term says what it means in
// listed words, and points at no note.
// [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"bytes"
	"encoding/json"
	"flag"
	// level0: OutsideInDoors - the case reads the schemas the tree ships, as a build check reads source
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"testing"

	"quackitect/src/modules/check"
	"quackitect/src/modules/tickets"
	"quackitect/src/note"
	"quackitect/src/prose"
	"quackitect/src/pull"
	"quackitect/src/yaml"
)

// [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
const (
	stemsList  = "spec/config/stems.yaml"
	slugCases  = "spec/config/slug.yaml"
	fewTerms   = 100
	fewCore    = 5000
	shortWords = 3
)

var (
	listRow   = regexp.MustCompile(`^\s*-\s*\{(.*)\}\s*$`)
	rowField  = regexp.MustCompile(`([a-z_]+):\s*("[^"]*"|[^,]*)`)
	meansWord = regexp.MustCompile(`[^a-z-]+`)
)

// [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
func listRowsIn(text string) []map[string]string {
	out := []map[string]string{}
	for _, line := range strings.Split(text, "\n") {
		found := listRow.FindStringSubmatch(line)
		if found == nil {
			continue
		}
		row := map[string]string{}
		for _, field := range rowField.FindAllStringSubmatch(found[1], -1) {
			row[field[1]] = strings.Trim(strings.TrimSpace(field[2]), `"`)
		}
		out = append(out, row)
	}
	return out
}

func listedWords(t *testing.T) map[string]bool {
	t.Helper()
	return prose.Words(shippedText(t, coreList), shippedText(t, termsList), shippedText(t, swapsList))
}

// [[spec/design_output/vocabulary#the-slug-reads-one-source]]
func TestTheSlugAnswersEveryCaseTheSourceHolds(t *testing.T) {
	t.Parallel()
	cases := yaml.AsList(yaml.AsDoc(yaml.Read(shippedText(t, slugCases))).Get("cases"))
	if len(cases) == 0 {
		t.Fatalf("%s holds no case", slugCases)
	}
	for _, one := range cases {
		heading, anchor := yaml.AsString(yaml.AsDoc(one).Get("heading")), yaml.AsString(yaml.AsDoc(one).Get("anchor"))
		if got := check.SlugOf(heading); got != anchor {
			t.Errorf("%q slugs to %q, and wants %q", heading, got, anchor)
		}
	}
}

// [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
func TestNoTermPointsAtANote(t *testing.T) {
	t.Parallel()
	rows := listRowsIn(shippedText(t, termsList))
	if len(rows) < fewTerms {
		t.Fatalf("the terms hold %d rows, and want %d at least", len(rows), fewTerms)
	}
	for _, one := range rows {
		_, defines := one["defines"]
		for _, value := range one {
			defines = defines || strings.Contains(value, "[[")
		}
		if defines {
			t.Errorf("the term %s points at a note", one["word"])
		}
	}
}

// [[spec/design_output/vocabulary#the-rule-matches-a-stem]]
func TestEveryTermSaysWhatItMeansInListedWords(t *testing.T) {
	t.Parallel()
	held, stems := listedWords(t), check.StemsIn(shippedText(t, stemsList))
	for _, one := range listRowsIn(shippedText(t, termsList)) {
		loose := []string{}
		for _, word := range meansWord.Split(strings.ToLower(one["means"]), -1) {
			for _, part := range strings.Split(word, "-") {
				if len(part) >= shortWords && !stems.Reaches(part, held) {
					loose = append(loose, part)
				}
			}
		}
		if strings.TrimSpace(one["means"]) == "" || len(loose) > 0 {
			t.Errorf("the term %s means %q, and the lists leave out %v", one["word"], one["means"], loose)
		}
	}
}

// [[spec/design_output/vocabulary#the-rule-matches-a-stem]]
func TestTheTableOfEndingsReachesEveryCaseItNames(t *testing.T) {
	t.Parallel()
	text := shippedText(t, stemsList)
	cases := yaml.AsList(yaml.AsDoc(yaml.Read(text)).Get("cases"))
	if len(cases) == 0 {
		t.Fatalf("%s holds no case", stemsList)
	}
	for _, one := range cases {
		word, reaches := yaml.AsString(yaml.AsDoc(one).Get("word")), yaml.AsString(yaml.AsDoc(one).Get("reaches"))
		if !check.StemsIn(text).Reaches(word, map[string]bool{reaches: true}) {
			t.Errorf("%s reaches no %s through the table", word, reaches)
		}
	}
}

// [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
func TestTheCoreHoldsTheStandardTheSeedAndTheCommonWords(t *testing.T) {
	t.Parallel()
	rows := listRowsIn(shippedText(t, coreList))
	from := map[string]bool{}
	for _, one := range rows {
		from[one["from"]] = true
	}
	if len(rows) < fewCore || !from["ste"] || !from["openste"] || !from["common"] {
		t.Fatalf("the core holds %d rows from %v, and wants %d at least from ste, openste and common", len(rows), from, fewCore)
	}
}

// [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
func TestEverySwapWritesAWordTheListsHold(t *testing.T) {
	t.Parallel()
	held := listedWords(t)
	for _, one := range listRowsIn(shippedText(t, swapsList)) {
		for _, word := range strings.Fields(strings.ToLower(one["write"])) {
			if !held[word] {
				t.Errorf("the swap for %s writes %s, which the lists leave out", one["word"], word)
			}
		}
	}
}

// Every path under the tree root a pattern finds, each relative and slashed. [[spec/tickets/engine-and-doors-leave]]
func globbedIn(t *testing.T, patterns ...string) []string {
	t.Helper()
	left := []string{}
	for _, pattern := range patterns {
		found, err := filepath.Glob(filepath.Join(treeRoot, filepath.FromSlash(pattern)))
		if err != nil {
			t.Fatal(err)
		}
		for _, one := range found {
			rel, _ := filepath.Rel(treeRoot, one)
			left = append(left, filepath.ToSlash(rel))
		}
	}
	return left
}

// [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
var processHashShape = regexp.MustCompile(`^[0-9a-f]{16}$`)

// [[spec/design_output/schema#the-schemas-read-once]]
func shippedText(t *testing.T, path string) string {
	t.Helper()
	body, err := os.ReadFile(filepath.Join(treeRoot, filepath.FromSlash(path)))
	if err != nil {
		t.Fatal(err)
	}
	return string(body)
}

func schemaDoc(t *testing.T, kind string) *yaml.Doc {
	t.Helper()
	return yaml.AsDoc(yaml.Read(shippedText(t, check.Schemas+"/"+kind+check.SchemaEnd)))
}

// [[spec/design_output/schema#the-sweep-over-the-tree]]
func sweptOver(t *testing.T, at, text string) []check.Finding {
	t.Helper()
	texts := check.Texts{at: text}
	for _, one := range globbedIn(t, check.Schemas+"/*"+check.SchemaEnd) {
		texts[one] = shippedText(t, one)
	}
	out := []check.Finding{}
	for _, one := range check.SchemaFaults(check.TreeOver("/tree", texts)) {
		if one.File == at && one.Severity == check.SeverityError {
			out = append(out, one)
		}
	}
	return out
}

func naming(found []check.Finding, word string) []check.Finding {
	out := []check.Finding{}
	for _, one := range found {
		if strings.Contains(one.Rule+" "+one.Message, word) {
			out = append(out, one)
		}
	}
	return out
}

// [[spec/design_output/schema#a-schema-names-its-chapters]]
func TestEveryNoteSchemaNamesItsKindAChapterAndItsPaths(t *testing.T) {
	t.Parallel()
	schemas := shippedSchemas(t)
	for _, one := range globbedIn(t, check.Schemas+"/*"+check.SchemaEnd) {
		kind := strings.TrimSuffix(filepath.Base(one), check.SchemaEnd)
		said := schemaDoc(t, kind)
		if yaml.AsString(said.Get("kind")) != kind || (schemas.Get(kind) != nil) != check.IsNoteSchema(said) {
			t.Errorf("%s names the kind %v, and wants %s, read as a note schema where it names a chapter", one, said.Get("kind"), kind)
		}
		if len(yaml.Flat(said.Get("governs"))) == 0 {
			t.Errorf("%s names no path it governs", one)
		}
	}
}

// [[spec/design_output/schema#mint-writes-a-valid-note]]
func TestEveryKindMintsANoteTheCheckerPasses(t *testing.T) {
	t.Parallel()
	schemas := shippedSchemas(t)
	// An example stands in a chapter folder alone, so its mint lands there. [[spec/design_output/examples#the-places]]
	placed := map[string]string{"example": "spec/examples/100_a/_example.md"}
	for _, kind := range schemas.Names() {
		at := placed[kind]
		if at == "" {
			at = "_" + kind + ".md"
		}
		text, why := check.Minted(schemas, kind, at, map[string]any{})
		if why != "" || !strings.HasPrefix(text, "---\nkind: [["+kind+"]]") {
			t.Errorf("the %s mint answers %q, and wants a clean note naming its kind:\n%s", kind, why, text)
		}
	}
	for _, at := range []string{"spec/tickets/a-name.md", ".se/tickets/a-name.md"} {
		if _, why := check.Minted(schemas, ticketKind, at, map[string]any{}); why != "" {
			t.Errorf("a ticket minted at %s answers %s", at, why)
		}
	}
}

// [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
func TestEveryShippedProcessPassesItsSchemaAndMintsACleanTicket(t *testing.T) {
	t.Parallel()
	root, _ := filepath.Abs(treeRoot)
	for _, route := range shippedRoutes(t) {
		at := "spec/processes/" + route + ".yaml"
		if found := sweptOver(t, at, shippedText(t, at)); len(found) > 0 {
			t.Errorf("%s answers %+v, and wants nothing", at, found)
		}
		if held, why := pull.ProcessAt(pull.OSDisk{Root: root}, route); why != "" || !processHashShape.MatchString(held.Hash) {
			t.Errorf("%s reads the hash %q (%s), and wants sixteen hex digits", at, held.Hash, why)
		}
	}
}

// [[spec/design_output/schema#one-home-for-a-shape]]
func TestTheRouteStandsInOnePlaceAndTheProcessNamesIt(t *testing.T) {
	t.Parallel()
	schemas := shippedSchemas(t)
	if schemas.Get(ticketKind) == nil || schemas.Get("process") != nil {
		t.Fatalf("the note schemas read %v, and want the ticket and no process", schemas.Names())
	}
	home := yaml.AsDoc(yaml.AsDoc(yaml.AsDoc(schemaDoc(t, ticketKind).Get("frontmatter")).Get("properties")).Get("steps"))
	if !yaml.AsDoc(yaml.AsDoc(home.Get("items")).Get("properties")).Has("evidence") {
		t.Fatalf("the ticket schema holds no route field evidence")
	}
	said := yaml.AsDoc(yaml.AsDoc(yaml.AsDoc(schemaDoc(t, "process").Get("data")).Get("properties")).Get("steps"))
	if ref := yaml.AsString(said.Get("$ref")); ref != "ticket#/frontmatter/properties/steps" {
		t.Fatalf("the process names the route %q, and wants the one the ticket holds", ref)
	}
}

// [[spec/design_output/schema#a-folder-names-its-kind]]
func TestBothTicketFoldersStandUnderOneSchemaAndNoSchemaNamesAGroup(t *testing.T) {
	t.Parallel()
	schemas := shippedSchemas(t)
	for _, at := range []string{"spec/tickets/a-name.md", ".se/tickets/a-name.md"} {
		if kind := yaml.AsString(check.GovernorOf(schemas, at).Get("kind")); kind != ticketKind {
			t.Errorf("%s stands under %q, and wants the ticket schema", at, kind)
		}
	}
	if check.GovernorOf(schemas, "spec/groups/a-name.md") != nil || len(globbedIn(t, check.Schemas+"/group*")) > 0 {
		t.Errorf("a schema names a group, and a group is a ticket")
	}
}

// [[spec/design_input/the-cloud-runs-itself#feature-groups-and-fix-groups]] [[spec/design_output/pull#the-bless]]
func TestTheTicketSchemaTakesFixAndBlessAsBooleans(t *testing.T) {
	t.Parallel()
	schemas := shippedSchemas(t)
	ticket := schemas.Get(ticketKind)
	minted, _ := check.Minted(schemas, ticketKind, "spec/tickets/one.md", map[string]any{})
	carrying := func(value string) []check.Finding {
		return naming(check.CheckNote(strings.Replace(minted, "\n---\n", "\nfix: "+value+"\n---\n", 1), ticket, "spec/tickets/one.md"), "fix")
	}
	if len(carrying("true")) > 0 || len(carrying("sometimes")) == 0 {
		t.Errorf("fix true answers %+v and fix sometimes %+v, and want nothing then a refusal", carrying("true"), carrying("sometimes"))
	}
	route := "steps:\n  - name: design\n    steps:\n      - name: draft\n        does: writes the approach\n        evidence:\n          - name: approach\n            form: text\n            says: the approach\n  - name: gate\n    gate: the design answers the ask\n    bless: true\n    input: design/draft\n    evidence:\n      - name: verdict\n        form: verdict\n        says: accept, accept with points, or reject\n"
	blessed := "---\nkind: [[ticket]]\nstate: open\nstep: gate\n" + route + "---\n\n# Ask\n\nOne piece of it.\n\n# design\n\n## draft\n\n### approach\n\nThe approach.\n\n# gate\n\n## verdict\n\n# Discussion\n"
	if found := naming(check.CheckNote(blessed, ticket, "spec/tickets/blessed.md"), "bless"); len(found) > 0 {
		t.Errorf("a bless on a gate answers %+v, and wants nothing", found)
	}
	if found := naming(check.CheckNote(strings.Replace(blessed, "bless: true", "bless: often", 1), ticket, "spec/tickets/blessed.md"), "bless"); len(found) == 0 {
		t.Errorf("a bless reading often answers nothing, and wants a refusal")
	}
	if found := naming(sweptOver(t, "spec/processes/blessed.yaml", "for: a route with a gate that asks a bless\n"+route), "bless"); len(found) > 0 {
		t.Errorf("a process carrying a bless answers %+v, and wants nothing", found)
	}
}

// [[spec/tickets/the-owners-words-travel-verbatim]]
func TestAHandoverLackingTheOwnersWordsDrawsAFinding(t *testing.T) {
	t.Parallel()
	schema := schemaDoc(t, "handover")
	handover := func(words string) []check.Finding {
		text := "---\nkind: [[handover]]\nstatus: todo\n---\n\n# Where it stands\n\nThe gate stands green.\n\n" + words + "# What waits\n\n- the next ticket\n"
		return naming(check.CheckNote(text, schema, ".se/HANDOVER.md"), "owner's words")
	}
	if len(handover("")) == 0 {
		t.Errorf("a handover lacking the owner's words answers nothing, and wants a finding")
	}
	if found := handover("# The owner's words\n\n- \"the count reads wrong\", session one, line 12\n\n"); len(found) > 0 {
		t.Errorf("a handover quoting the owner answers %+v, and wants nothing", found)
	}
}

// [[spec/design_input/level-two#guidance]]
func TestTheTicketAndGuidanceSchemasAdmitTags(t *testing.T) {
	t.Parallel()
	ticket := "---\nkind: [[ticket]]\nstate: open\nsteps:\n  - name: do\n    tags: [code]\n    does: makes the change\n---\n\n# Ask\n\nOne thing.\n\n# do\n\n# Discussion\n"
	guidance := "---\nkind: [[guidance]]\nscope: [\"a hand\"]\ntags: [testing]\n---\n\n# Actionables\n\n1. Watch a test fail first.\n"
	for kind, text := range map[string]string{ticketKind: ticket, "guidance": guidance} {
		if found := naming(check.CheckNote(text, schemaDoc(t, kind), "spec/one.md"), "tags"); len(found) > 0 {
			t.Errorf("the %s schema answers %+v over tags, and wants nothing", kind, found)
		}
	}
}

// [[spec/tickets/schema-libs-leave]]
const mintedGoldenAt = "testdata/minted.golden.json"

// [[spec/tickets/schema-libs-leave]]
type mintedEntry struct {
	Route string `json:"route"`
	Text  string `json:"text"`
}

// [[spec/tickets/schema-libs-leave]]
func shippedRoutes(t *testing.T) []string {
	t.Helper()
	out := []string{}
	for _, one := range globbedIn(t, "spec/processes/*.yaml") {
		out = append(out, strings.TrimSuffix(filepath.Base(one), ".yaml"))
	}
	if len(out) < 2 {
		t.Fatalf("spec/processes holds %v, and wants the routes the tree ships", out)
	}
	return out
}

// [[spec/tickets/schema-libs-leave]]
func shippedSchemas(t *testing.T) *check.Kinds {
	t.Helper()
	root, err := filepath.Abs(treeRoot)
	if err != nil {
		t.Fatal(err)
	}
	return check.SchemasIn(check.TreeOver(root, rootDisk{root}))
}

// [[spec/tickets/schema-libs-leave]]
func mintedRoute(t *testing.T, schemas *check.Kinds, route string) string {
	t.Helper()
	root, _ := filepath.Abs(treeRoot)
	fields := map[string]any{"state": "open", "process": route}
	if why := withRoute(pull.OSDisk{Root: root}, schemas.Get(ticketKind), fields); why != "" {
		t.Fatalf("the %s route copies in no route: %s", route, why)
	}
	text, why := check.Minted(schemas, ticketKind, "spec/tickets/"+route+"-rendered.md", fields)
	if why != "" {
		t.Fatalf("the %s route mints no ticket: %s", route, why)
	}
	return text
}

// [[spec/tickets/schema-libs-leave]]
func TestEveryShippedRouteMintsItsGolden(t *testing.T) {
	t.Parallel()
	var entries []mintedEntry
	readsGolden(t, mintedGoldenAt, &entries)
	held := map[string]string{}
	for _, one := range entries {
		held[one.Route] = one.Text
	}
	schemas := shippedSchemas(t)
	routes := shippedRoutes(t)
	for _, route := range routes {
		if got := mintedRoute(t, schemas, route); got != held[route] {
			t.Errorf("the %s route mints\n%s\nand the golden holds\n%s", route, got, held[route])
		}
	}
	if len(entries) != len(routes) {
		t.Errorf("%s holds %d routes, and the tree ships %v", mintedGoldenAt, len(entries), routes)
	}
}

// Reads the golden's entries, and stops the case where the golden reads as none; go test ./src/quack -run Golden -update writes each again. [[spec/tickets/schema-libs-leave]]
func readsGolden(t *testing.T, at string, entries any) {
	t.Helper()
	body, err := os.ReadFile(at)
	if err == nil {
		err = json.Unmarshal(body, entries)
	}
	if err != nil {
		t.Fatalf("%s reads %v", at, err)
	}
}

// Writes the entries to the golden as indented JSON, the way each golden reads. [[spec/tickets/schema-libs-leave]]
func writesGolden(t *testing.T, at string, entries any) {
	t.Helper()
	var out bytes.Buffer
	writes := json.NewEncoder(&out)
	writes.SetEscapeHTML(false)
	writes.SetIndent("", "  ")
	if err := writes.Encode(entries); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(at, out.Bytes(), 0o644); err != nil {
		t.Fatal(err)
	}
}

// [[spec/tickets/schema-libs-leave]]
func TestTheMintedGoldenMintsEveryRouteAgain(t *testing.T) {
	t.Parallel()
	if !*update {
		t.Skip("go test ./src/quack -run TestTheMintedGoldenMintsEveryRouteAgain -update mints the golden again")
	}
	schemas := shippedSchemas(t)
	entries := []mintedEntry{}
	for _, route := range shippedRoutes(t) {
		entries = append(entries, mintedEntry{Route: route, Text: mintedRoute(t, schemas, route)})
	}
	writesGolden(t, mintedGoldenAt, entries)
}

// The golden TestEveryDrawnGoldenMatchesTheProjection in src/modules/tickets reads. [[spec/tickets/branch-scripts-leave]]
const drawnGoldenAt = "../modules/tickets/testdata/drawn.golden.json"

var update = flag.Bool("update", false, "draw each text of the drawn golden again")

// [[spec/tickets/branch-scripts-leave]]
type drawnEntry struct {
	Name  string          `json:"name"`
	Text  string          `json:"text"`
	Drawn json.RawMessage `json:"drawn"`
}

// [[spec/tickets/branch-scripts-leave]]
func TestTheDrawnGoldenRedrawsEveryText(t *testing.T) {
	t.Parallel()
	if !*update {
		t.Skip("go test ./src/quack -run TestTheDrawnGoldenRedrawsEveryText -update draws the golden again")
	}
	var entries []drawnEntry
	readsGolden(t, drawnGoldenAt, &entries)
	for at, one := range entries {
		drawn, err := tickets.DrawnCodec{}.Parse([]byte(one.Text))
		if err != nil {
			t.Fatalf("%s draws %v", one.Name, err)
		}
		if entries[at].Drawn, err = json.Marshal(drawn); err != nil {
			t.Fatal(err)
		}
	}
	writesGolden(t, drawnGoldenAt, entries)
}

// [[spec/tickets/schema-libs-leave]]
const frontsGoldenAt = "../note/testdata/fronts.golden.json"

// [[spec/tickets/schema-libs-leave]]
type frontEntry struct {
	Name  string          `json:"name"`
	Text  string          `json:"text"`
	Front json.RawMessage `json:"front"`
}

// [[spec/tickets/schema-libs-leave]]
func TestTheFrontGoldenReadsEveryTextAgain(t *testing.T) {
	t.Parallel()
	if !*update {
		t.Skip("go test ./src/quack -run TestTheFrontGoldenReadsEveryTextAgain -update reads the golden again")
	}
	var entries []frontEntry
	readsGolden(t, frontsGoldenAt, &entries)
	var err error
	for at, one := range entries {
		if entries[at].Front, err = json.Marshal(note.FrontOf(yaml.SplitLines(one.Text)).Said); err != nil {
			t.Fatal(err)
		}
	}
	writesGolden(t, frontsGoldenAt, entries)
}
