// The editor's own extension list, and the rules v3 and v4 paid for. Each
// case here is one of those failures, so a later writer cannot bring it back.
// [[spec/design_output/extension#a-file-another-program-owns]]
package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

const editorTestID = "quackitect.quackitect"

func symlinkHere(source, dest string) error { return os.Symlink(source, dest) }

// A tree holding the extension's source, and the editor's folder under a home beside it. [[spec/design_output/extension#the-link-stands]]
func editorBox(t *testing.T) (source, folder, dest string) {
	t.Helper()
	root := t.TempDir()
	source = filepath.Join(root, "tree", "src", "extension")
	folder = filepath.Join(root, "home", ".vscode", "extensions")
	seedTree(t, root, map[string]string{"tree/src/extension/package.json": "{}", "home/.vscode/extensions/.keep": ""})
	return source, folder, filepath.Join(folder, editorTestID+"-0.1.0")
}

func mineAt(folder string) *ordered {
	return editorEntry(editorTestID, "0.1.0", filepath.Join(folder, editorTestID+"-0.1.0"), 1000)
}

func listOf(t *testing.T, folder string) []map[string]any {
	t.Helper()
	text, _ := readText(filepath.Join(folder, editorList))
	var said []map[string]any
	if err := json.Unmarshal([]byte(text), &said); err != nil {
		t.Fatalf("the list reads as no array: %v\n%s", err, text)
	}
	return said
}

func TestACopyStandingWhereTheLinkBelongsGoesAndTheLinkTakesItsPlace(t *testing.T) {
	t.Parallel()
	source, _, dest := editorBox(t)
	seedTree(t, dest, map[string]string{"stale.js": "old"})
	if editorLinkedAt(dest, source) {
		t.Fatal("a copy reads as the link")
	}
	if linked, why := editorLinkAt(dest, source, symlinkHere); !linked || why != "the link went in" {
		t.Errorf("the link answers %v, %s", linked, why)
	}
	if !editorLinkedAt(dest, source) || stands(filepath.Join(source, "stale.js")) {
		t.Error("the link stands not, or the copy reached the source")
	}
}

func TestALinkStandingAlreadyStays(t *testing.T) {
	t.Parallel()
	source, _, dest := editorBox(t)
	if err := os.Symlink(source, dest); err != nil {
		t.Fatal(err)
	}
	if linked, why := editorLinkAt(dest, source, func(string, string) error { t.Error("a second link goes in"); return nil }); !linked || why != "the link stands already" {
		t.Errorf("the link answers %v, %s", linked, why)
	}
}

func TestALinkPointingAtAnotherTreeGoesAndThisTreesLinkGoesIn(t *testing.T) {
	t.Parallel()
	source, _, dest := editorBox(t)
	other := filepath.Join(t.TempDir(), "other")
	seedTree(t, other, map[string]string{"package.json": "{}"})
	if err := os.Symlink(other, dest); err != nil {
		t.Fatal(err)
	}
	if editorLinkedAt(dest, source) {
		t.Fatal("another tree's link reads as ours")
	}
	if linked, why := editorLinkAt(dest, source, symlinkHere); !linked || why != "the link went in" {
		t.Errorf("the link answers %v, %s", linked, why)
	}
	if !editorLinkedAt(dest, source) || !stands(filepath.Join(other, "package.json")) {
		t.Error("the link stands not, or the other tree lost a file")
	}
}

func TestALinkPointingNowhereReadsAsNoLinkAndThisTreesLinkTakesItsPlace(t *testing.T) {
	t.Parallel()
	source, _, dest := editorBox(t)
	if err := os.Symlink(filepath.Join(t.TempDir(), "gone"), dest); err != nil {
		t.Fatal(err)
	}
	if !isLink(dest) || stands(dest) || editorLinkedAt(dest, source) {
		t.Fatal("a link pointing nowhere reads as standing")
	}
	if linked, why := editorLinkAt(dest, source, symlinkHere); !linked || why != "a link pointing nowhere went, and the link went in" {
		t.Errorf("the link answers %v, %s", linked, why)
	}
	if !editorLinkedAt(dest, source) {
		t.Error("the link stands not")
	}
}

func TestADestinationOutsideTheEditorsFolderIsRefusedAndNothingIsRemoved(t *testing.T) {
	t.Parallel()
	notes := t.TempDir()
	seedTree(t, notes, map[string]string{"keep.md": "mine"})
	if linked, _ := editorLinkAt(notes, "/tree/src/extension", symlinkHere); linked {
		t.Error("a destination outside the editor's folder links")
	}
	if text, _ := readText(filepath.Join(notes, "keep.md")); text != "mine" {
		t.Error("the refusal removed a file")
	}
}

func TestTheListNamesTheIdOrTheExtensionStandsUnregistered(t *testing.T) {
	t.Parallel()
	_, folder, _ := editorBox(t)
	seedTree(t, folder, map[string]string{editorList: `[{"identifier":{"id":"a.b"},"version":"1.0.0"}]`})
	if editorRegistered(folder, editorTestID) {
		t.Fatal("a list lacking the id registers it")
	}
	if wrote, why := editorRegister(folder, mineAt(folder)); !wrote || why != "the entry went in" {
		t.Errorf("the register answers %v, %s", wrote, why)
	}
	if !editorRegistered(folder, editorTestID) {
		t.Error("the id stands unregistered")
	}
}

func TestAnElementNothingCanIdentifyIsDroppedNeverCarried(t *testing.T) {
	t.Parallel()
	said := editorEntriesOf(`[{"identifier":{"id":"a.b"}},{"version":"2"},null]`)
	if len(said.entries) != 1 || said.dropped != 2 || entryID(said.entries[0]) != "a.b" {
		t.Errorf("the read answers %d entries, %d dropped", len(said.entries), said.dropped)
	}
}

func TestEntriesNestedUnderAWrapperComeBackOutOfIt(t *testing.T) {
	t.Parallel()
	said := editorEntriesOf(`{"value":[{"identifier":{"id":"a.b"}},{"identifier":{"id":"c.d"}}]}`)
	if said.unwrapped != 1 || len(said.entries) != 2 || entryID(said.entries[1]) != "c.d" {
		t.Errorf("the read answers %d entries, %d unwrapped", len(said.entries), said.unwrapped)
	}
}

func TestAListThatReadsAsNoJSONLeavesTheFileAlone(t *testing.T) {
	t.Parallel()
	_, folder, _ := editorBox(t)
	seedTree(t, folder, map[string]string{editorList: "not json at all"})
	if wrote, why := editorRegister(folder, mineAt(folder)); wrote || why != "the list reads as no JSON at all, so it stands as it is" {
		t.Errorf("the register answers %v, %s", wrote, why)
	}
	if text, _ := readText(filepath.Join(folder, editorList)); text != "not json at all" {
		t.Error("the unreadable list took a write")
	}
}

func TestEveryKeyTheEditorOwnsIsCarriedVerbatim(t *testing.T) {
	t.Parallel()
	_, folder, _ := editorBox(t)
	was := `{"identifier":{"id":"a.b","uuid":"u"},"version":"1","odd":{"deep":true}}`
	seedTree(t, folder, map[string]string{editorList: "[" + was + "]"})
	editorRegister(folder, mineAt(folder))
	text, _ := readText(filepath.Join(folder, editorList))
	if len(text) < len(was)+1 || text[1:len(was)+1] != was {
		t.Errorf("the list reads\n%s", text)
	}
}

func TestTheFileItWritesIsAlwaysAnArrayEvenHoldingOneEntry(t *testing.T) {
	t.Parallel()
	_, folder, _ := editorBox(t)
	editorRegister(folder, mineAt(folder))
	if said := listOf(t, folder); len(said) != 1 {
		t.Errorf("the list holds %d entries", len(said))
	}
}

func TestOursStandsOnceWhereTheListAlreadyNamesIt(t *testing.T) {
	t.Parallel()
	_, folder, _ := editorBox(t)
	seedTree(t, folder, map[string]string{editorList: `[{"identifier":{"id":"a.b"}},{"identifier":{"id":"` + editorTestID + `"},"version":"0.0.1"}]`})
	if wrote, why := editorRegister(folder, mineAt(folder)); !wrote || why != "the entry stood already, and it stands again" {
		t.Errorf("the register answers %v, %s", wrote, why)
	}
	count := 0
	for _, one := range listOf(t, folder) {
		if one["identifier"].(map[string]any)["id"] == editorTestID {
			count++
			if one["version"] != "0.1.0" {
				t.Errorf("ours reads version %v", one["version"])
			}
		}
	}
	if count != 1 {
		t.Errorf("ours stands %d times", count)
	}
}

func TestAWriteThatWouldLoseAnIdIsRefused(t *testing.T) {
	t.Parallel()
	said := editorEntriesOf(`[{"identifier":{"id":"a.b"}}]`)
	if found := editorUpsert(said, mineAt("/f/.vscode/extensions")); len(found.lost) != 0 || len(found.entries) != 2 {
		t.Errorf("the upsert loses %v", found.lost)
	}
	if found := editorUpsert(editorEntries{}, mineAt("/f/.vscode/extensions")); len(found.lost) != 0 {
		t.Errorf("an empty list loses %v", found.lost)
	}
}

func TestTheListItReplacesStandsBesideIt(t *testing.T) {
	t.Parallel()
	_, folder, _ := editorBox(t)
	was := `[{"identifier":{"id":"a.b"}}]`
	seedTree(t, folder, map[string]string{editorList: was})
	editorRegister(folder, mineAt(folder))
	if kept, _ := readText(filepath.Join(folder, editorKept)); kept != was {
		t.Errorf("the kept list reads %q", kept)
	}
}

func TestTheEntryWritesItsInstallTimeInDecimalDigits(t *testing.T) {
	t.Parallel()
	entry := editorEntry(editorTestID, "0.1.0", "/x/"+editorTestID+"-0.1.0", 1759590000123)
	if got := editorListText([]*ordered{entry}); !strings.Contains(got, `"installedTimestamp":1759590000123,`) {
		t.Errorf("the entry reads\n%s", got)
	}
}

func TestTheEntryNamesTheFolderTheEditorReadsItThrough(t *testing.T) {
	t.Parallel()
	folder := "/home/user/.vscode/extensions"
	want := `{"identifier":{"id":"` + editorTestID + `"},"version":"0.1.0","location":{"$mid":1,"path":` + jsonString(filepath.Join(folder, editorTestID+"-0.1.0")) +
		`,"scheme":"file"},"relativeLocation":"` + editorTestID + `-0.1.0","metadata":{"installedTimestamp":1000,"source":"vsix"}}`
	if got := editorListText([]*ordered{mineAt(folder)}); got != "["+want+"]" {
		t.Errorf("the entry reads\n%s", got)
	}
}

func TestTheLinkVerbLinksAndListsTheTreesSidebar(t *testing.T) {
	t.Parallel()
	d, _, out, _ := fakeBoxDoors(t)
	home := t.TempDir()
	seedTree(t, d.root, map[string]string{"src/extension/package.json": `{"publisher":"quackitect","name":"quackitect","version":"0.1.0"}`})
	seedTree(t, home, map[string]string{".vscode/extensions/.keep": ""})
	d.env = func(key string) string { return map[string]string{"HOME": home}[key] }
	if editorLink(d, false) {
		t.Fatal("an unlinked tree reads as linked")
	}
	if !editorLink(d, true) || !editorLink(d, false) {
		t.Fatalf("the link falls:\n%s", out)
	}
	if want := "quackitect.quackitect: the link went in.\nquackitect.quackitect: the entry went in.\n"; out.String() != want {
		t.Errorf("the link says\n%s", out)
	}
	d.env = func(string) string { return "" }
	if editorLink(d, false) {
		t.Error("a box naming no home reads as linked")
	}
}
