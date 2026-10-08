// The bundle verb over fake doors, and the shipped drawing read against the
// stamp its sources give.
// [[spec/tickets/scripts-folder-leaves]] [[spec/design_output/drawing#the-drawing-ships-prebuilt]]
package main

import (
	// level0: OutsideInDoors - the case reads the shipped drawing and its sources, as a build check reads source
	"os"
	"path/filepath"
	"reflect"
	"slices"
	"strings"
	"testing"
)

// The webview, the entry, the lock and the shipped script, under the root. [[spec/design_output/drawing#the-drawing-ships-prebuilt]]
const (
	bundleWebview = "src/extension/webview"
	bundleShipped = "src/extension/drawing/route.mjs"
)

// A tree holding the entry, the lock and esbuild, so a bundle runs. [[spec/tickets/scripts-folder-leaves]]
func bundleTree(t *testing.T, d boxDoors, entry string) {
	t.Helper()
	seedTree(t, d.root, map[string]string{
		bundleWebview + "/route/drawing.js":                  entry,
		bundleWebview + "/package-lock.json":                 "{}",
		bundleWebview + "/node_modules/esbuild/package.json": "{}",
	})
}

func stampHere(t *testing.T, root string) string {
	t.Helper()
	stamp, err := drawingStamp(root)
	if err != nil {
		t.Fatal(err)
	}
	return stamp
}

func TestTheShippedDrawingNamesTheStampItsSourcesGive(t *testing.T) {
	t.Parallel()
	root, err := filepath.Abs(treeRoot)
	if err != nil {
		t.Fatal(err)
	}
	text, err := os.ReadFile(filepath.Join(root, filepath.FromSlash(bundleShipped)))
	if err != nil {
		t.Fatal(err)
	}
	if first, want := strings.SplitN(string(text), "\n", 2)[0], "// sources "+stampHere(t, root); first != want || want == "// sources " {
		t.Fatalf("the shipped drawing opens on %q, and wants %q, so run ./RUNME.sh bundle", first, want)
	}
}

func TestTheDrawingStampMovesWithASourceUnderTheWebviewAndHoldsOtherwise(t *testing.T) {
	t.Parallel()
	one, other, again := t.TempDir(), t.TempDir(), t.TempDir()
	for root, entry := range map[string]string{one: "one", other: "two", again: "one"} {
		seedTree(t, root, map[string]string{bundleWebview + "/route/drawing.js": entry, bundleWebview + "/package-lock.json": "{}"})
	}
	if stampHere(t, one) == stampHere(t, other) {
		t.Error("a moved source keeps the stamp")
	}
	if stampHere(t, one) != stampHere(t, again) || stampHere(t, one) == "" {
		t.Error("the same sources give another stamp, or none")
	}
}

func TestTheBundleRunsEsbuildOverTheEntryWithTheStampAsItsBanner(t *testing.T) {
	t.Parallel()
	for _, one := range []struct {
		goos string
		lead []string
	}{{"linux", nil}, {"windows", []string{"cmd", "/c"}}} {
		d, runner, _, _ := fakeBoxDoors(t)
		d.goos = one.goos
		bundleTree(t, d, "globalThis.drawn = 1\n")
		if code := bundleVerb(d, nil); code != 0 {
			t.Errorf("%s: the bundle answers %d", one.goos, code)
		}
		want := append(slices.Clone(one.lead), "npx", "--no-install", "esbuild", "route/drawing.js",
			"--bundle", "--minify", "--format=iife", "--jsx=automatic",
			`--define:process.env.NODE_ENV="production"`, "--banner:js=// sources "+stampHere(t, d.root),
			"--log-level=warning", "--outfile=../drawing/route.mjs")
		if len(runner.ran) != 1 || !reflect.DeepEqual(runner.ran[0], want) || runner.opts[0].cwd != filepath.Join(d.root, filepath.FromSlash(bundleWebview)) {
			t.Errorf("%s: the bundle ran %v under %v, and wants %v under the webview", one.goos, runner.ran, runner.opts, want)
		}
	}
}

func TestBundleHereAnswersWhetherTheBannerNamesTheStamp(t *testing.T) {
	t.Parallel()
	for _, one := range []struct {
		name   string
		banner func(stamp string) string
		want   int
	}{
		{"a banner naming the stamp reads fresh", func(stamp string) string { return "// sources " + stamp + "\n(()=>{})();\n" }, 0},
		{"a banner naming another stamp reads stale", func(string) string { return "// sources 0000000000000000\n" }, 1},
		{"no shipped script reads stale", nil, 1},
	} {
		d, runner, _, _ := fakeBoxDoors(t)
		bundleTree(t, d, "globalThis.drawn = 1\n")
		if one.banner != nil {
			seedTree(t, d.root, map[string]string{bundleShipped: one.banner(stampHere(t, d.root))})
		}
		if code := bundleVerb(d, []string{"here"}); code != one.want || len(runner.ran) != 0 {
			t.Errorf("%s: bundle here answers %d after %v, and wants %d with no run", one.name, code, runner.ran, one.want)
		}
	}
}

func TestTheBundleNamesTheInstallWhereEsbuildStandsNowhere(t *testing.T) {
	t.Parallel()
	d, runner, out, errs := fakeBoxDoors(t)
	seedTree(t, d.root, map[string]string{bundleWebview + "/route/drawing.js": "", bundleWebview + "/package-lock.json": "{}"})
	if code := bundleVerb(d, nil); code != 1 || len(runner.ran) != 0 || !strings.Contains(out.String()+errs.String(), "./RUNME.sh") {
		t.Errorf("the bundle answers %d after %v, saying %q, and wants 1, no run and the install named", code, runner.ran, out.String()+errs.String())
	}
}

func TestTheInsetLoadsTheDrawingFromInsideTheExtension(t *testing.T) {
	t.Parallel()
	found, err := filepath.Glob(filepath.Join(treeRoot, "src", "extension", "drawing", "*"))
	if err != nil {
		t.Fatal(err)
	}
	var names []string
	for _, one := range found {
		names = append(names, filepath.Base(one))
	}
	if !reflect.DeepEqual(names, []string{"owns.yaml", "route.css", "route.mjs"}) {
		t.Errorf("the drawing folder holds %v, and wants the script, its style sheet and the outsides it owns", names)
	}
	inset, err := os.ReadFile(filepath.Join(treeRoot, "src", "extension", "editor-inset.js"))
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(string(inset), `"route.mjs"`) || !strings.Contains(string(inset), "context.extensionUri") {
		t.Error("the inset names no script it reads off the extension")
	}
}
