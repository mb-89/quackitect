package main

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"testing"
)

// A CLASS THE PAGE LEANS ON, WITH NO RULE TO DRAW IT.
//
// The editor draws its tree as one flat run of rows that know their depth,
// because a nested table would break every column width the person set. So the
// indent is a span and the fold is a class, and both are decisions the
// stylesheet has to carry out. Neither was written into the stylesheet.
//
// WHAT THE OWNER SAW. A token with sub-tokens drew its child flush with
// itself, with no indent and nothing marking it as a child, and pressing the
// fold moved nothing at all.
//
// WHY EVERY CHECK WAS GREEN OVER IT. The page is driven in jsdom, which
// applies no stylesheet. A class that is added and removed correctly and draws
// nothing passes every assertion a driver can make, so the question has to be
// asked over the sheet the page ships rather than over the classList calls.
//
// THE PAGES ARE PLANTED HERE, and this test never reads the live tree. A sheet
// read out of the repository is green because nobody has broken it yet, which
// is evidence about the tree and no evidence at all about the rule.

var aStyleBlock = regexp.MustCompile(`(?is)<style[^>]*>(.*?)</style>`)
var aScriptBlock = regexp.MustCompile(`(?is)<script[^>]*>.*?</script>`)
var aTagWearingAClass = regexp.MustCompile(`<(\w+)\b[^>]*\bclass="([^"]*)"`)

// theSheetNames asks the weakest thing worth asking for: whether the sheet
// says anything at all about the class. What the rule should say is a design
// decision the stylesheet owns and this reader does not. The name has to end
// where the selector ends, so that a sheet holding only .bs-row-child is not
// read as a sheet that draws .bs-row.
func theSheetNames(sheet, name string) bool {
	rest := sheet
	for {
		at := strings.Index(rest, "."+name)
		if at < 0 {
			return false
		}
		after := rest[at+1+len(name):]
		if after == "" || !inAClassName(after[0]) {
			return true
		}
		rest = rest[at+1:]
	}
}

// inAClassName is the character set a class name may go on with.
func inAClassName(c byte) bool {
	return c == '-' || c == '_' ||
		(c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9')
}

// aDrawnPageRulesEveryClassItWears reads an emitted page the way a browser
// does. The sheet is what the style blocks hold. The markup is everything
// else, with the script dropped as well, because a class named in a
// querySelector is not a class the page is wearing.
//
// A READER THAT FINDS NOTHING TO READ REFUSES. Both sets come out of the page
// rather than out of a list written here, so both can come back empty, and an
// empty set passes every question below by having no member to fail one.
func aDrawnPageRulesEveryClassItWears(page string) error {
	sheet := ""
	for _, block := range aStyleBlock.FindAllStringSubmatch(page, -1) {
		sheet += block[1] + "\n"
	}
	if strings.TrimSpace(sheet) == "" {
		return fmt.Errorf("the emitted page carries no stylesheet at all, so every class on it " +
			"is drawn by whatever the surrounding cascade happens to do, which is how a token " +
			"with sub-tokens drew its child flush with itself: ship a <style> block with the page " +
			"and put a rule in it for each class the markup wears")
	}
	markup := aScriptBlock.ReplaceAllString(aStyleBlock.ReplaceAllString(page, ""), "")
	type worn struct{ class, tag string }
	seen := map[string]bool{}
	var order []worn
	for _, tag := range aTagWearingAClass.FindAllStringSubmatch(markup, -1) {
		for _, class := range strings.Fields(tag[2]) {
			if !seen[class] {
				seen[class] = true
				order = append(order, worn{class, tag[1]})
			}
		}
	}
	if len(order) == 0 {
		return fmt.Errorf("the emitted page wears no class at all, so this reader guards nothing: " +
			"a page whose rows carry no class cannot be styled by the sheet beside it, and the " +
			"reader would go green over any sheet at all")
	}
	for _, one := range order {
		if !theSheetNames(sheet, one.class) {
			return fmt.Errorf("the page hangs %q on a <%s> and the stylesheet never names .%s, "+
				"so adding that class and removing it are the same thing: this is how the indent "+
				"and the fold drew nothing while every driven check stayed green, because jsdom "+
				"applies no sheet, so write a rule for .%s into the style block the page ships "+
				"or stop emitting the class",
				one.class, one.tag, one.class, one.class)
		}
	}
	return nil
}

// plantADrawnPage writes a page into the folder the test owns and reads it
// back, so what the reader is given came off a disk this test filled.
func plantADrawnPage(t *testing.T, dir, name, page string) string {
	t.Helper()
	at := filepath.Join(dir, name)
	if err := os.WriteFile(at, []byte(page), 0o644); err != nil {
		t.Fatalf("planting %s: %v", name, err)
	}
	back, err := os.ReadFile(at)
	if err != nil {
		t.Fatalf("reading %s back: %v", name, err)
	}
	return string(back)
}

// aDrawnPage is a sheet and a body in the shape the pages emit.
func aDrawnPage(sheet, body string) string {
	return "<html><head><style>\n" + sheet + "\n</style></head><body>\n" + body + "\n</body></html>\n"
}

func TestAPageWearingAClassTheSheetNeverNamesIsRefused(t *testing.T) {
	t.Parallel()
	dir := t.TempDir()
	for i, one := range []struct {
		why  string
		page string
		says []string
	}{
		{
			why: "the indent and the fold are classes the sheet never heard of, " +
				"which is the incident this reader carries",
			page: aDrawnPage(".bs-row { display: flex; }",
				`<div class="bs-row"><span class="bs-indent"></span><span class="bs-fold">v</span></div>`),
			says: []string{"bs-indent", "span"},
		},
		{
			why:  "the sheet names a longer class that merely begins the same way",
			page: aDrawnPage(".bs-row-child { padding-left: 12px; }", `<div class="bs-row">a row</div>`),
			says: []string{"bs-row", "div"},
		},
		{
			why:  "the page ships no stylesheet at all",
			page: "<html><body>\n<div class=\"bs-row\">a row</div>\n</body></html>\n",
			says: []string{"no stylesheet"},
		},
		{
			why:  "the style block is there and holds nothing",
			page: aDrawnPage("   ", `<div class="bs-row">a row</div>`),
			says: []string{"no stylesheet"},
		},
		{
			why:  "the page wears no class at all, so the reader would go green over any sheet",
			page: aDrawnPage(".bs-row { display: flex; }", "<div>a row</div>"),
			says: []string{"wears no class"},
		},
		{
			why: "the only mention of the class is a querySelector in the script, " +
				"which draws nothing",
			page: aDrawnPage(".bs-row { display: flex; }",
				`<div class="bs-row"><span class="bs-fold">v</span></div>`+
					"\n<script>document.querySelector(\".bs-fold\").hidden = true;</script>"),
			says: []string{"bs-fold"},
		},
	} {
		planted := plantADrawnPage(t, dir, fmt.Sprintf("refused-%d.html", i), one.page)
		err := aDrawnPageRulesEveryClassItWears(planted)
		if err == nil {
			t.Fatalf("the reader passed a page where %s", one.why)
		}
		for _, word := range one.says {
			if !strings.Contains(err.Error(), word) {
				t.Fatalf("the refusal for the case where %s does not say %q: %s", one.why, word, err)
			}
		}
	}
}

// AND A PAGE WHOSE SHEET DRAWS EVERY CLASS IT WEARS GOES THROUGH. A reader
// that refused every page would pass the planted cases above for the wrong
// reason, so each of these is a page a person would want shipped.
func TestAPageWhoseSheetDrawsEveryClassItWearsGoesThrough(t *testing.T) {
	t.Parallel()
	dir := t.TempDir()
	for i, one := range []struct{ why, page string }{
		{
			why: "the indent and the fold both have a rule of their own",
			page: aDrawnPage(".bs-row { display: flex; }\n"+
				".bs-indent { width: 12px; display: inline-block; }\n"+
				".bs-fold { cursor: pointer; }",
				`<div class="bs-row"><span class="bs-indent"></span><span class="bs-fold">v</span></div>`),
		},
		{
			why: "the rules are compound and descendant selectors rather than a class on its own",
			page: aDrawnPage(".bs-row.bs-open > .bs-fold::before { content: \"-\"; }\n"+
				"@media (max-width: 400px) { .bs-row:hover .bs-fold { opacity: 1; } }",
				`<div class="bs-row bs-open"><span class="bs-fold">v</span></div>`),
		},
		{
			why:  "a class named only in the script is never worn, so nothing asks about it",
			page: aDrawnPage(".bs-row { display: flex; }", `<div class="bs-row">a row</div>`+"\n<script>document.querySelector(\".bs-absent\");</script>"),
		},
		{
			why: "one class is a prefix of another and both have their own rule",
			page: aDrawnPage(".bs-row { display: flex; }\n.bs-row-child { padding-left: 12px; }",
				`<div class="bs-row"><div class="bs-row-child">a child</div></div>`),
		},
		{
			why: "the same class is worn by several tags and one rule covers them all",
			page: aDrawnPage(".cell { padding: 2px; }",
				`<td class="cell">one</td><td class="cell">two</td><span class="cell">three</span>`),
		},
	} {
		planted := plantADrawnPage(t, dir, fmt.Sprintf("clean-%d.html", i), one.page)
		if err := aDrawnPageRulesEveryClassItWears(planted); err != nil {
			t.Fatalf("the reader refused a page where %s: %s", one.why, err)
		}
	}
}
