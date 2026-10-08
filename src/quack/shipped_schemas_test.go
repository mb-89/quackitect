// The schemas and the routes this tree ships, read off the disk and weighed by
// the Go checker and the Go mint, off the cases the leaving contract tests held.
// [[spec/design_output/schema#the-sweep-over-the-tree]]
package main

import (
	// level0: OutsideInDoors - the case reads the schemas the tree ships, as a build check reads source
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"testing"

	"quackitect/src/modules/check"
	"quackitect/src/pull"
	"quackitect/src/yaml"
)

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
	schemas := shippedSchemas(t)
	root, _ := filepath.Abs(treeRoot)
	for _, route := range shippedRoutes(t) {
		at := "spec/processes/" + route + ".yaml"
		if found := sweptOver(t, at, shippedText(t, at)); len(found) > 0 {
			t.Errorf("%s answers %+v, and wants nothing", at, found)
		}
		if held, why := pull.ProcessAt(pull.OSDisk{Root: root}, route); why != "" || !processHashShape.MatchString(held.Hash) {
			t.Errorf("%s reads the hash %q (%s), and wants sixteen hex digits", at, held.Hash, why)
		}
		mintedRoute(t, schemas, route)
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
